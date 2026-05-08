import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

/**
 * Daily blog publishing endpoint.
 *
 * Triggered by Vercel Cron (vercel.json) once per day at 09:00 UTC.
 *
 * Picks the next due unpublished blog from Convex (scheduledBlogs table),
 * marks it published, and pings the Vercel deploy hook so the next build
 * includes the new post.
 *
 * The blog content lives in Convex. lib/blog.ts merges filesystem-backed
 * posts (the existing 57) with published Convex entries.
 */

export async function GET(req: NextRequest) {
  // Auth — Vercel cron sets Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization")
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_CONVEX_URL not configured" }, { status: 500 })
  }
  const convex = new ConvexHttpClient(convexUrl)

  // First: if there's a pending Anthropic batch, try to collect it.
  // This is a best-effort fallback — the dedicated /api/collect-batch endpoint
  // can also be hit manually to speed things up after the batch ends.
  let collected: { succeeded?: number } = {}
  if (process.env.BATCH_ID) {
    try {
      const url = `https://${req.headers.get("host")}/api/collect-batch`
      const res = await fetch(url, { headers: { authorization: `Bearer ${process.env.CRON_SECRET}` } })
      if (res.ok) collected = await res.json()
    } catch {
      // non-fatal — proceed to publish step
    }
  }

  let claimed
  try {
    claimed = await convex.mutation(api.scheduledBlogs.claimNextDue, { now: Date.now() })
  } catch (err) {
    return NextResponse.json({ error: "convex claim failed", detail: String(err) }, { status: 500 })
  }

  if (!claimed) {
    return NextResponse.json({ message: "nothing due", collected })
  }

  // Revalidate the affected pages so the new post is visible immediately.
  // (No deploy hook needed — Next's on-demand revalidation handles it.)
  revalidatePath("/blog")
  revalidatePath("/sitemap.xml")
  revalidatePath(`/blog/${claimed.slug}`)

  // Optional: also trigger a Vercel redeploy if a hook URL is configured —
  // belt-and-braces for cases where ISR revalidation isn't enough.
  let deployTriggered = false
  if (process.env.VERCEL_DEPLOY_HOOK_URL) {
    try {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: "POST" })
      deployTriggered = true
    } catch {
      // non-fatal
    }
  }

  return NextResponse.json({
    published: claimed.slug,
    title: claimed.title,
    deployTriggered,
    collected,
  })
}
