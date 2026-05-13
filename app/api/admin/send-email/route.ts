import { NextRequest } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const ADMIN_KEY  = process.env.ADMIN_KEY ?? "meridian2025"
const FROM_EMAIL = process.env.FROM_EMAIL ?? "aria@meridiangtv.co.uk"
const REPLY_TO   = "amit@berriesadvisory.com"

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key")
  if (adminKey !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const {
      to,
      toName,
      subject,
      htmlBody,
      template,
      sessionId,
    } = (await req.json()) as {
      to:         string
      toName:     string
      subject:    string
      htmlBody:   string
      template:   string
      sessionId?: string
    }

    if (!to || !subject || !htmlBody || !template) {
      return new Response(JSON.stringify({ error: "missing required fields" }), { status: 400 })
    }

    // Send via Resend raw fetch
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method:  "POST",
        headers: {
          Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:     `Meridian <${FROM_EMAIL}>`,
          reply_to: REPLY_TO,
          to:       toName ? `${toName} <${to}>` : to,
          subject,
          html:     htmlBody,
        }),
      })
      if (!res.ok) {
        const errText = await res.text()
        console.error("[send-email] Resend error:", errText)
        return new Response(JSON.stringify({ error: "email send failed" }), { status: 502 })
      }
    }

    // Log to Convex
    const convex      = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    const bodyPreview = htmlBody.replace(/<[^>]*>/g, "").slice(0, 200)
    await convex.mutation(api.adminOps.logEmail, {
      sessionId,
      to,
      subject,
      template,
      bodyPreview,
    })

    return new Response(JSON.stringify({ success: true }), {
      status:  200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[admin/send-email]", err)
    return new Response(JSON.stringify({ error: "send-email failed" }), { status: 500 })
  }
}
