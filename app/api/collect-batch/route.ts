import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import matter from "gray-matter"

/**
 * Auto-collect endpoint for the in-flight Anthropic blog batch.
 *
 * Triggered by Vercel Cron every 30 minutes (vercel.json).
 *
 *   1. Reads BATCH_ID and ANTHROPIC_API_KEY from env.
 *   2. Polls Anthropic batch status.
 *   3. If processing_status === "ended", streams the results, parses MDX
 *      frontmatter, and calls scheduledBlogs.enqueue for each. The enqueue
 *      mutation is idempotent (upserts on slug), so running this endpoint
 *      multiple times after collection is a safe no-op.
 *
 * After all 43 blogs are enqueued, the existing daily-publish cron at
 * 09:00 UTC starts publishing one per day.
 *
 * Auth: protected via CRON_SECRET in the Authorization header.
 */

interface BlogTopic {
  slug: string
  title: string
  category: string
  primaryKeyword: string
  audience: string
  wordTarget: number
  linkTo?: string[]
}

export async function GET(req: NextRequest) {
  // Auth — Vercel cron sets Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization")
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const batchId = process.env.BATCH_ID
  const apiKey = process.env.ANTHROPIC_API_KEY
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

  if (!batchId) return NextResponse.json({ error: "BATCH_ID not configured" }, { status: 500 })
  if (!apiKey) return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })
  if (!convexUrl) return NextResponse.json({ error: "NEXT_PUBLIC_CONVEX_URL not configured" }, { status: 500 })

  const anthropic = new Anthropic({ apiKey })
  const convex = new ConvexHttpClient(convexUrl)

  // Idempotency check — if all topics are already enqueued, skip the batch fetch.
  let stats
  try {
    stats = await convex.query(api.scheduledBlogs.queueStats, {})
  } catch (err) {
    return NextResponse.json({ error: "convex queueStats failed", detail: String(err) }, { status: 500 })
  }
  if (stats.total >= 43) {
    return NextResponse.json({ message: "already collected", total: stats.total, published: stats.published, pending: stats.pending })
  }

  // Poll batch status
  const batch = await anthropic.messages.batches.retrieve(batchId)
  if (batch.processing_status !== "ended") {
    return NextResponse.json({
      message: "batch still in progress",
      status: batch.processing_status,
      counts: batch.request_counts,
    })
  }

  // Load topics
  const topicsModule = await import("../../../scripts/blog-topics.json")
  const topics: BlogTopic[] = (topicsModule.default ?? topicsModule).topics
  const topicMap = Object.fromEntries(topics.map((t) => [t.slug, t]))

  // Stream + enqueue
  const startDay = new Date()
  startDay.setUTCDate(startDay.getUTCDate() + 1)
  startDay.setUTCHours(9, 0, 0, 0)

  const results = await anthropic.messages.batches.results(batchId)
  let succeeded = 0
  let errored = 0
  let i = 0

  for await (const r of results) {
    const slug = r.custom_id
    const topic = topicMap[slug]
    if (!topic) {
      errored++
      continue
    }
    if (r.result.type !== "succeeded") {
      errored++
      continue
    }
    const block = r.result.message.content.find((c: { type: string }) => c.type === "text") as
      | { type: "text"; text: string }
      | undefined
    if (!block) {
      errored++
      continue
    }

    const scheduledFor = new Date(startDay)
    scheduledFor.setUTCDate(startDay.getUTCDate() + i)
    const isoDate = scheduledFor.toISOString().slice(0, 10)
    const mdxFull = block.text.replace("DATE_PLACEHOLDER", isoDate)

    let parsed
    try {
      parsed = matter(mdxFull)
    } catch {
      errored++
      continue
    }
    const fm = parsed.data as Record<string, unknown>
    if (!fm.title || !fm.category || !fm.excerpt) {
      errored++
      continue
    }

    await convex.mutation(api.scheduledBlogs.enqueue, {
      slug,
      title: String(fm.title),
      category: String(fm.category),
      excerpt: String(fm.excerpt),
      readTime: String(fm.readTime ?? "8 min read"),
      date: isoDate,
      mdxBody: parsed.content.trim(),
      mdxFull,
      scheduledFor: scheduledFor.getTime(),
    })

    succeeded++
    i++
  }

  return NextResponse.json({
    message: "batch collected",
    succeeded,
    errored,
    nextPublishAt: new Date(startDay).toISOString(),
  })
}
