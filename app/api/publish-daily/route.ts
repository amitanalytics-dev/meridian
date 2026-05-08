import { NextRequest, NextResponse } from "next/server"
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

  let claimed
  try {
    claimed = await convex.mutation(api.scheduledBlogs.claimNextDue, { now: Date.now() })
  } catch (err) {
    return NextResponse.json({ error: "convex claim failed", detail: String(err) }, { status: 500 })
  }

  if (!claimed) {
    return NextResponse.json({ message: "nothing due" })
  }

  // Trigger a redeploy so the published post enters the static build
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
  })
}
