import { NextRequest } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"

// ── Email helper ──────────────────────────────────────────────────────────────

async function sendEmail(
  to:   string,
  subject: string,
  html: string,
  from = "Meridian <aria@meridiangtv.co.uk>",
) {
  if (!process.env.RESEND_API_KEY) return
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  })
}

// ── Amit alert email ──────────────────────────────────────────────────────────

function buildAmitEmail(
  name:       string,
  email:      string,
  phone:      string,
  linkedinUrl:string,
  assessment: Record<string, unknown>,
): string {
  const lq:          string = assessment.leadQuality as string
  const overallScore:number = assessment.overallScore as number
  const readinessLevel:string = assessment.readinessLevel as string
  const subScores = assessment.subScores as Record<string, number>
  const insights  = assessment.insights  as string[]
  const answers   = assessment.answers   as Record<string, string>

  const leadColour = lq === "hot" ? "#EF4444" : lq === "warm" ? "#F59E0B" : "#94A3B8"
  const calloutBg  = lq === "hot" ? "#7C3AED20" : lq === "warm" ? "#F59E0B20" : "#94A3B820"
  const calloutBdr = lq === "hot" ? "#7C3AED50" : lq === "warm" ? "#F59E0B50" : "#94A3B850"
  const calloutMsg = lq === "hot"
    ? "🔥 HOT LEAD — Reach out within 24 hours"
    : lq === "warm"
    ? "⚡ WARM LEAD — Follow up within 48 hours"
    : "📬 COLD LEAD — Add to nurture sequence"
  const trackLabel = (assessment.recommendedTrack as string) === "et"
    ? "Exceptional Talent"
    : (assessment.recommendedTrack as string) === "ep"
    ? "Exceptional Promise"
    : "Neither — Profile Needs Work"
  const biggestGap: string = (answers.biggestGap ?? "")
  const focusNote  = biggestGap === "narrative"
    ? "Focus on: Narrative restructuring"
    : `Focus on: ${biggestGap.charAt(0).toUpperCase() + biggestGap.slice(1)} improvement`

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#0f0020;color:#e2e8f0;padding:32px;margin:0">
<div style="max-width:600px;margin:0 auto">
  <div style="border-bottom:2px solid #7C3AED;padding-bottom:16px;margin-bottom:24px">
    <span style="font-size:11px;color:#9F6EF5;letter-spacing:0.1em;text-transform:uppercase">Meridian · Readiness Assessment Alert</span>
    <h1 style="margin:8px 0 0;font-size:22px;color:#fff">${name} — ${overallScore}/100 — <span style="color:${leadColour}">${lq.toUpperCase()} LEAD</span></h1>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <tr><td style="padding:8px 0;border-bottom:1px solid #1e1040;color:#9F6EF5;font-size:12px;width:140px">Name</td><td style="padding:8px 0;border-bottom:1px solid #1e1040;font-size:14px">${name}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #1e1040;color:#9F6EF5;font-size:12px">Email</td><td style="padding:8px 0;border-bottom:1px solid #1e1040;font-size:14px"><a href="mailto:${email}" style="color:#06B6D4">${email}</a></td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #1e1040;color:#9F6EF5;font-size:12px">Phone</td><td style="padding:8px 0;border-bottom:1px solid #1e1040;font-size:14px">${phone || "Not provided"}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #1e1040;color:#9F6EF5;font-size:12px">LinkedIn</td><td style="padding:8px 0;border-bottom:1px solid #1e1040;font-size:14px"><a href="${linkedinUrl}" style="color:#0A66C2">${linkedinUrl || "Not provided"}</a></td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #1e1040;color:#9F6EF5;font-size:12px">Role</td><td style="padding:8px 0;border-bottom:1px solid #1e1040;font-size:14px">${answers.role} · ${answers.sector}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #1e1040;color:#9F6EF5;font-size:12px">Track</td><td style="padding:8px 0;border-bottom:1px solid #1e1040;font-size:14px">${trackLabel}</td></tr>
    <tr><td style="padding:8px 0;border-bottom:1px solid #1e1040;color:#9F6EF5;font-size:12px">Timeline</td><td style="padding:8px 0;border-bottom:1px solid #1e1040;font-size:14px">${answers.timeline}</td></tr>
  </table>

  <div style="background:#1a0035;border:1px solid #7C3AED30;border-radius:8px;padding:20px;margin-bottom:24px">
    <div style="font-size:11px;color:#9F6EF5;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">AI Score Breakdown</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div>Technical Leadership: <strong style="color:#7C3AED">${subScores.technicalLeadership}/100</strong></div>
      <div>Evidence Quality: <strong style="color:#06B6D4">${subScores.evidenceQuality}/100</strong></div>
      <div>External Recognition: <strong style="color:#9F6EF5">${subScores.externalRecognition}/100</strong></div>
      <div>Independence: <strong style="color:#F59E0B">${subScores.independence}/100</strong></div>
      <div>Global Profile: <strong style="color:#22D3EE">${subScores.globalProfile}/100</strong></div>
    </div>
  </div>

  <div style="margin-bottom:24px">
    <div style="font-size:11px;color:#9F6EF5;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">AI Insights</div>
    ${insights.map((insight, i) => `<div style="background:#12002a;border-left:2px solid #7C3AED;padding:10px 12px;margin-bottom:8px;font-size:13px;line-height:1.5">${i + 1}. ${insight}</div>`).join("")}
  </div>

  <div style="background:${calloutBg};border:1px solid ${calloutBdr};border-radius:8px;padding:16px;text-align:center">
    <div style="font-size:13px;font-weight:600;color:${leadColour};margin-bottom:6px">${calloutMsg}</div>
    <div style="font-size:12px;color:#9F6EF5">${focusNote}</div>
  </div>

  <div style="margin-top:24px;text-align:center">
    <a href="https://meridiangtv.co.uk/admin" style="background:#7C3AED;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:600">View in Admin Dashboard →</a>
  </div>
</div>
</body>
</html>`
}

// ── User report email ─────────────────────────────────────────────────────────

function buildUserEmail(
  name:           string,
  overallScore:   number,
  readinessLevel: string,
  recommendedTrack:string,
  trackExplanation:string,
  insights:       string[],
): string {
  const levelBadge = readinessLevel.replace(/_/g, " ").toUpperCase()
    .replace("NOT ELIGIBLE", "⚠ NOT ELIGIBLE")
    .replace("NOT READY",    "📋 NOT READY")
    .replace("SEMI READY",   "📈 SEMI READY")
    .replace("FULLY READY",  "✅ FULLY READY")
  const trackLabel = recommendedTrack === "et"
    ? "Exceptional Talent"
    : recommendedTrack === "ep"
    ? "Exceptional Promise"
    : "Profile Needs Development"

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;background:#f8fafc;color:#0f172a;padding:0;margin:0">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
  <div style="background:linear-gradient(135deg,#7C3AED,#06B6D4);padding:32px;text-align:center">
    <div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px">Meridian Global Talent Visa</div>
    <div style="font-size:56px;font-weight:bold;color:#fff;line-height:1">${overallScore}</div>
    <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px">out of 100</div>
    <div style="display:inline-block;background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:4px 16px;margin-top:12px;font-size:12px;color:#fff;font-weight:600">${levelBadge}</div>
  </div>

  <div style="padding:28px">
    <div style="font-size:18px;font-weight:600;color:#0f172a;margin-bottom:4px">Hi ${name},</div>
    <p style="color:#475569;font-size:14px;line-height:1.6;margin-top:8px">Your AI-powered Global Talent Visa readiness assessment is complete. Here's what we found.</p>

    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0">
      <div style="font-size:11px;color:#7C3AED;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Recommended Track</div>
      <div style="font-size:16px;font-weight:600;color:#0f172a">${trackLabel}</div>
      <div style="font-size:13px;color:#475569;margin-top:4px;line-height:1.5">${trackExplanation}</div>
    </div>

    <div style="margin:20px 0">
      <div style="font-size:11px;color:#7C3AED;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px">Your AI Insights</div>
      ${insights.map((insight, i) => `<div style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px;color:#475569;line-height:1.6"><span style="color:#7C3AED;font-weight:600">${i + 1}.</span> ${insight}</div>`).join("")}
    </div>

    <div style="text-align:center;margin:28px 0">
      <a href="https://meridiangtv.co.uk/apply" style="background:linear-gradient(135deg,#7C3AED,#06B6D4);color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;display:inline-block">Book a 1:1 Strategy Session with Amit →</a>
      <div style="font-size:11px;color:#94A3B8;margin-top:8px">Fixed pricing · 48-hour response · Not immigration legal advice</div>
    </div>

    <div style="border-top:1px solid #e2e8f0;padding-top:16px;font-size:11px;color:#94A3B8;text-align:center">
      Meridian Global Talent Visa · meridiangtv.co.uk<br/>
      Advisory only. Amit Tyagi is not an immigration lawyer or OISC-regulated advisor.
    </div>
  </div>
</div>
</body>
</html>`
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { assessmentId, name, email, phone, linkedinUrl } = await req.json() as {
      assessmentId: string
      name:         string
      email:        string
      phone:        string
      linkedinUrl:  string
    }

    if (!assessmentId || !name || !email) {
      return new Response(JSON.stringify({ error: "missing required fields" }), { status: 400 })
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

    // 1. Capture lead data in Convex
    await convex.mutation(api.readiness.captureLeadData, {
      assessmentId: assessmentId as Id<"readinessAssessments">,
      name,
      email,
      phone:        phone       ?? "",
      linkedinUrl:  linkedinUrl ?? "",
    })

    // 2. Fetch the full assessment record
    const assessment = await convex.query(api.readiness.getAssessment, {
      assessmentId: assessmentId as Id<"readinessAssessments">,
    }) as Record<string, unknown> | null

    if (!assessment) {
      return new Response(JSON.stringify({ error: "assessment not found" }), { status: 404 })
    }

    const overallScore    = assessment.overallScore    as number
    const readinessLevel  = assessment.readinessLevel  as string
    const recommendedTrack= assessment.recommendedTrack as string
    const trackExplanation= assessment.trackExplanation as string
    const insights        = assessment.insights         as string[]
    const leadQuality     = assessment.leadQuality      as string

    // 3. Send both emails concurrently (best-effort)
    const amitSubject = `[${leadQuality.toUpperCase()}] ${name} — Score ${overallScore}/100 — ${readinessLevel.replace(/_/g, " ").toUpperCase()}`
    const userSubject = `Your Global Talent Visa Readiness Score: ${overallScore}/100 — Meridian`

    await Promise.allSettled([
      sendEmail(
        "amit@berriesadvisory.com",
        amitSubject,
        buildAmitEmail(name, email, phone ?? "", linkedinUrl ?? "", assessment),
      ),
      sendEmail(
        email,
        userSubject,
        buildUserEmail(name, overallScore, readinessLevel, recommendedTrack, trackExplanation, insights),
      ),
    ])

    // 4. Update email status flags in Convex
    await convex.mutation(api.readiness.updateEmailStatus, {
      assessmentId:    assessmentId as Id<"readinessAssessments">,
      emailSentToAmit: true,
      reportEmailSent: true,
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[readiness/lead]", err)
    return new Response(JSON.stringify({ error: "lead capture failed" }), { status: 500 })
  }
}
