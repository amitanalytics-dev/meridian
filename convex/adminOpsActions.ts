"use node"
import { internalAction } from "./_generated/server"
import { internal } from "./_generated/api"
import { v } from "convex/values"

const FROM_EMAIL = process.env.FROM_EMAIL ?? "aria@meridiangtv.co.uk"
const REPLY_TO   = "amit@berriesadvisory.com"

async function sendResendEmail(
  to:      string,
  subject: string,
  html:    string,
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[nurture] RESEND_API_KEY not set, skipping send")
    return false
  }
  const res = await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:     `Meridian <${FROM_EMAIL}>`,
      reply_to: REPLY_TO,
      to,
      subject,
      html,
    }),
  })
  return res.ok
}

// ── Email templates ───────────────────────────────────────────────────────────

function buildEmail2(name: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;padding:0;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);padding:32px">
  <p style="font-size:15px;color:#0f172a;line-height:1.6">Hi ${name},</p>
  <p style="font-size:14px;color:#475569;line-height:1.7">Most visa rejections are not due to a weak profile — they come from generic evidence framing that fails to communicate the right signals to evaluators.</p>
  <p style="font-size:14px;color:#475569;line-height:1.7">Evaluators are trained to look for three things: the <strong>scope of your technical influence</strong>, the <strong>independence of your decisions</strong>, and the <strong>sector-level impact</strong> of your work — not just job titles or years of experience.</p>
  <p style="font-size:14px;color:#475569;line-height:1.7">If your evidence doesn't surface these signals clearly and specifically, even a strong profile will be passed over. Framing is everything.</p>
  <div style="text-align:center;margin:32px 0">
    <a href="https://meridiangtv.co.uk/readiness" style="background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block">Take or retake the readiness assessment →</a>
  </div>
  <p style="font-size:13px;color:#94A3B8;margin-top:24px">— Amit Tyagi, Meridian Advisory</p>
</div>
</body>
</html>`
}

function buildEmail3(name: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;padding:0;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);padding:32px">
  <p style="font-size:15px;color:#0f172a;line-height:1.6">Hi ${name},</p>
  <p style="font-size:14px;color:#475569;line-height:1.7">A structured approach to evidence makes the difference between an approved and declined application. Here is the framework I use with every client:</p>

  <div style="margin:24px 0">
    <div style="border-left:3px solid #7C3AED;padding:12px 16px;margin-bottom:16px;background:#faf5ff">
      <strong style="color:#7C3AED;font-size:13px">1. Technical Leadership</strong>
      <p style="font-size:13px;color:#475569;margin:6px 0 0;line-height:1.6">Document the output you produced and the scope of its reach — how many systems, teams, or users were affected by your decisions. Evaluators want to see that your influence extended beyond your immediate role.</p>
    </div>
    <div style="border-left:3px solid #06B6D4;padding:12px 16px;margin-bottom:16px;background:#f0fdfe">
      <strong style="color:#0891B2;font-size:13px">2. External Recognition</strong>
      <p style="font-size:13px;color:#475569;margin:6px 0 0;line-height:1.6">Awards, press coverage, speaking invitations, and open-source contributions all count as external signals. Even one credible external citation strengthens your case significantly compared to purely internal evidence.</p>
    </div>
    <div style="border-left:3px solid #F59E0B;padding:12px 16px;background:#fffbeb">
      <strong style="color:#D97706;font-size:13px">3. Independence and Influence</strong>
      <p style="font-size:13px;color:#475569;margin:6px 0 0;line-height:1.6">Evaluators need to see that you shaped outcomes — that you were the architect, not just an executor. Frame decisions you owned, directions you proposed, and results that would not have happened without you.</p>
    </div>
  </div>

  <div style="text-align:center;margin:32px 0">
    <a href="https://meridiangtv.co.uk/readiness" style="background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block">See where your evidence scores →</a>
  </div>
  <p style="font-size:13px;color:#94A3B8;margin-top:24px">— Amit Tyagi, Meridian Advisory</p>
</div>
</body>
</html>`
}

function buildEmail4(name: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;padding:0;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);padding:32px">
  <p style="font-size:15px;color:#0f172a;line-height:1.6">Hi ${name},</p>
  <p style="font-size:14px;color:#475569;line-height:1.7">I want to share an anonymised case that is representative of what I see often.</p>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:20px 0">
    <div style="font-size:11px;color:#7C3AED;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Case: R.K. — ML Engineer, India</div>
    <p style="font-size:13px;color:#475569;line-height:1.7;margin:0 0 12px"><strong>Problem:</strong> Six years of strong machine learning work — all of it internal. No publications, no press, no public footprint. The profile was technically impressive but had no external signal for evaluators to anchor on.</p>
    <p style="font-size:13px;color:#475569;line-height:1.7;margin:0 0 12px"><strong>What changed:</strong> We reframed the deployment impact of his models as sector-level influence rather than a product feature. His open-source contributions — previously unlisted — became a central external recognition signal. His recommenders were coached to speak to decisions he owned, not tasks he completed.</p>
    <p style="font-size:13px;color:#475569;line-height:1.7;margin:0"><strong>Outcome:</strong> Approved Exceptional Talent on first application.</p>
  </div>

  <p style="font-size:14px;color:#475569;line-height:1.7">The evidence was always there. The framing was the gap.</p>

  <div style="text-align:center;margin:32px 0">
    <a href="https://meridiangtv.co.uk/apply" style="background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block">Apply for advisory →</a>
  </div>
  <p style="font-size:13px;color:#94A3B8;margin-top:24px">— Amit Tyagi, Meridian Advisory</p>
</div>
</body>
</html>`
}

function buildEmail5(name: string, score: number, track: string): string {
  const trackLabel = track === "et"
    ? "Exceptional Talent"
    : track === "ep"
    ? "Exceptional Promise"
    : "Profile Development"
  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;padding:0;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);padding:32px">
  <p style="font-size:15px;color:#0f172a;line-height:1.6">Hi ${name},</p>
  <p style="font-size:14px;color:#475569;line-height:1.7">I looked at your assessment — <strong>${score}/100, ${trackLabel}</strong>. Your profile has real potential, and with the right framing the path is clearer than it might feel right now.</p>
  <p style="font-size:14px;color:#475569;line-height:1.7">I have a limited number of advisory spots open this quarter. If you have been thinking about working together, now is the right time to apply.</p>

  <div style="text-align:center;margin:32px 0">
    <a href="https://meridiangtv.co.uk/apply" style="background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block">Apply for a Strategic Review →</a>
  </div>

  <p style="font-size:13px;color:#94A3B8;margin-top:24px">— Amit Tyagi, Meridian Advisory</p>
  <p style="font-size:11px;color:#CBD5E1;border-top:1px solid #e2e8f0;padding-top:12px;margin-top:12px">Advisory spots are limited each quarter. Places are allocated on a first-come, first-reviewed basis.</p>
</div>
</body>
</html>`
}

// ── sendDueNurtureEmails ──────────────────────────────────────────────────────

export const sendDueNurtureEmails = internalAction({
  args: {},
  handler: async (ctx) => {
    const leads = await ctx.runQuery(internal.adminOps.getLeadsDueForNurture, {})

    for (const lead of leads) {
      const sent = lead.nurtureEmailsSent

      let subject = ""
      let html    = ""

      if (sent === 1) {
        subject = "The real reason strong applications fail — even good ones"
        html    = buildEmail2(lead.name)
      } else if (sent === 2) {
        subject = "A framework for structuring your visa evidence"
        html    = buildEmail3(lead.name)
      } else if (sent === 3) {
        subject = "How an engineer with 6 years of internal work got approved"
        html    = buildEmail4(lead.name)
      } else if (sent === 4) {
        subject = "Your readiness report — one last note from Amit"
        html    = buildEmail5(lead.name, lead.overallScore, lead.recommendedTrack)
      } else {
        continue
      }

      const ok = await sendResendEmail(lead.email, subject, html)
      if (ok) {
        await ctx.runMutation(internal.adminOps.markNurtureSent, { sessionId: lead.sessionId })
      }
    }

    return null
  },
})
