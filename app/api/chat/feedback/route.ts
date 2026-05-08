import { NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

/**
 * Receives end-of-chat feedback from the ChatWidget farewell panel.
 *
 * POST /api/chat/feedback
 * Body: {
 *   sessionId: string
 *   rating: number          // 1–5
 *   comment?: string
 *   email?: string          // optional — if user opted to email Amit on exit
 *   messageCount: number
 *   pageContext?: string
 * }
 *
 * Persists to Convex chatFeedback. If email was shared, also emails Amit
 * via Resend (best-effort, fails silently on misconfig).
 */
export async function POST(req: NextRequest) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }

  const { sessionId, rating, comment, email, messageCount, pageContext } = body
  if (!sessionId || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "missing or invalid sessionId/rating" }, { status: 400 })
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_CONVEX_URL not configured" }, { status: 500 })
  }
  const convex = new ConvexHttpClient(convexUrl)

  try {
    await convex.mutation(api.chat.submitFeedback, {
      sessionId,
      rating,
      comment: comment ? String(comment).slice(0, 2000) : undefined,
      emailShared: email ? String(email).slice(0, 200) : undefined,
      messageCount: Number(messageCount) || 0,
      pageContext: pageContext ? String(pageContext).slice(0, 500) : undefined,
    })
  } catch (err) {
    return NextResponse.json({ error: "convex insert failed", detail: String(err) }, { status: 500 })
  }

  // Best-effort: if email was shared, notify Amit via Resend
  if (email && process.env.RESEND_API_KEY) {
    const fromEmail = process.env.FROM_EMAIL || "aria@meridiangtv.co.uk"
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `Aria (Meridian) <${fromEmail}>`,
          to: "amit@berriesadvisory.com",
          subject: `Chat exit feedback — email shared (${email})`,
          text: `Email: ${email}\nRating: ${rating}/5\nMessages exchanged: ${messageCount}\nComment: ${comment || "(none)"}\nPage: ${pageContext || "(unknown)"}\nSession: ${sessionId}\n\nThis user spoke with Aria, then opted to share their email on exit. Worth a personal follow-up within 48h.`,
        }),
      })
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({ ok: true })
}
