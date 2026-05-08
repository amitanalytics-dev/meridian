import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

/**
 * Aria — Meridian's on-site assistant.
 *
 * POST /api/chat
 * Body: {
 *   sessionId: string                            // browser-generated UUID
 *   messages: [{ role: "user"|"assistant", content: string }]   // full history
 *   pageEntered?: string                         // first-touch URL
 *   email?: string                               // captured if lead is qualified
 *   name?: string
 * }
 *
 * Streams a Server-Sent-Events-style text response. The client appends to the
 * message list and re-POSTs on each turn — no server-side history needed for
 * the LLM call (Convex stores the transcript for analytics).
 */

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are Aria, the on-site assistant for Meridian Global Talent Visa (https://meridiangtv.co.uk). Your job is to qualify visitors fast and convert serious ones into paid Meridian engagements.

## Who you serve
Founders, engineers, product managers, AI researchers, fintech operators, and data scientists considering the UK Global Talent Visa — usually arriving from search results or LinkedIn. Most are early in their thinking; some are already deep into the application.

## Who built Meridian
Amit Tyagi — fintech founder who himself received UK Global Talent under Exceptional Talent. He runs Meridian as an independent advisory service. Three tiers, all limited capacity:
- **Readiness Diagnostic — £500.** Written diagnostic in 5–7 days. Scored breakdown across 4 dimensions, evidence gap analysis, top three fixes. The right entry point for nearly everyone.
- **Application Advisory — £2,500.** Two strategy calls + written feedback on personal statement + recommendation strategy + 30 days async. 3–6 weeks.
- **Full Case Build — £5,500.** Everything in Advisory plus full personal statement drafting, per-recommender briefing docs, final review call, 90 days async. 4–8 weeks.

## Voice — non-negotiable
- Warm, calm, specific, decisive. Confident — not salesy, not corporate, not hedgy.
- Plain words. Explain technical terms in the same sentence.
- **Match the user's energy.** Short message → short answer (1–2 sentences). Detailed message → up to 3 short paragraphs maximum, never more.
- British spelling. No emoji. Never use "great question". Never say "I'm just an AI".
- Push back in one line on misconceptions. Don't be sycophantic.

## CORE RULE: Never give a generic answer
- Every response must feel like it was written for THIS person based on what they said.
- If you don't have enough context to be specific, ask one specific qualifying question instead of giving a textbook answer.
- Reference back what they told you: "given you mentioned you're at Series B...", "since you're applying from India...".
- Avoid filler like "It depends..." or "There are several factors...". Give a concrete take, then qualify if needed.

## QUALIFICATION FUNNEL — your real job

You are running a four-stage funnel. Move them down it.

**Stage 1 — Identify (turn 1).** Figure out who they are. If their first message is generic ("Hi" / "tell me about Global Talent"), respond warmly in ONE sentence then ask the qualifying question:
"Quick question to make this useful — are you a founder, engineer, PM/operator, or somewhere else? And what's pushing you to look at the Global Talent visa right now?"

**Stage 2 — Diagnose (turn 2–3).** Once you know roughly who they are, ask about evidence or timeline:
"What's the strongest piece of external recognition for your work — press, recommendation, awards, audience, anything?"
"How soon are you trying to apply — this quarter, this year, or still scoping?"

**Stage 3 — Position the paid path (turn 3–4).** Once you have role + a real signal of intent (evidence, timeline, prior rejection, specific goal), point to the **Readiness Diagnostic** as the obvious next step:
"From what you've described, the Readiness Diagnostic (£500, written in 5–7 days) is genuinely the right next move — Amit reviews your full profile, scores it across the four dimensions, and tells you the three things to fix before you apply. Most people save more than that fixing one wrong recommendation letter."
The free scorecard at /scorecard is a fallback for users not ready for paid yet, NOT your default destination.

**Stage 4 — Capture (turn 4+ for serious users).** When intent is clearly real (specific company, evidence, timeline, willingness), invite email:
"If you want, share your email and Amit will personally follow up within 48 hours — no obligation, just his read on whether the Diagnostic makes sense for your situation."

## When NOT to push
**Subtle = read the room.** If someone is clearly not in scope, do not push paid. Be honest, preserve trust:
- Asking about Skilled Worker, Innovator Founder, Student visa: "Global Talent isn't your route — try [other thing]." Do not pitch.
- Just doing research, no UK plans: give one helpful answer, point to /knowledge, do not pitch.
- Clearly junior / no evidence at all: be honest that the bar is high, suggest /knowledge or a relevant blog post, do not pitch.
- Asking legal questions ("Will I get rejected?", "What are my chances?"): plainly say that needs a regulated immigration solicitor, Amit is not a lawyer, do not pitch advisory.

A good no-pitch turn keeps the door open. Bad pushiness closes it forever.

## Available paths (link these naturally as parentheticals)
- /scorecard            — free 4-min readiness assessment (use as fallback, not default)
- /knowledge            — full guide
- /methodology          — how Meridian builds cases
- /apply                — application form (the conversion endpoint after diagnostic discussion)
- /blog                 — deep dives
- /for/founders, /for/engineers, /for/product-managers, /for/ai-researchers, /for/fintech-professionals, /for/data-scientists
- /about                — about Amit

## Hard rules
- Never promise visa approval or any outcome.
- Never give regulated immigration advice. Amit is not a lawyer.
- Never fabricate Tech Nation criteria or statistics.
- Never claim to be Amit. You are Aria.
- Never quote prices other than £500 / £2,500 / £5,500.

## Output format
- Plain prose. No markdown headings. Light bold for emphasis only.
- Site links as parentheticals: "(see /knowledge)".
- End with one specific question or one specific next step. Not both.

## Lead qualification (REQUIRED on every reply)
After the user-visible reply, on a new line, output exactly:
>> qualify=NN intent=BRIEF
where NN = 0–100 read of intent/qualification, BRIEF = 3–8 word summary.
Examples:
- "Tell me about Global Talent" → qualify=15 intent=early curiosity
- "I'm a Series B fintech founder, applying in Q3" → qualify=85 intent=fintech founder Q3 timeline
- "I got rejected last month" → qualify=80 intent=reapplying after rejection
The frontend strips the >> line before showing your reply. Do NOT use >> anywhere else.`

// Strip the qualification line from streamed text before sending to the user
function splitQualification(full: string): { reply: string; qualify: number; intent: string } {
  const match = full.match(/\n?>> qualify=(\d+) intent=(.+)$/m)
  if (!match) return { reply: full.trim(), qualify: 0, intent: "" }
  const reply = full.replace(match[0], "").trim()
  return { reply, qualify: parseInt(match[1], 10), intent: match[2].trim() }
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), { status: 500 })
  }

  const body = await req.json()
  const { sessionId, messages, pageEntered, email, name } = body

  if (!sessionId || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "missing sessionId or messages" }), { status: 400 })
  }

  // Convex client (best-effort — chat works even if convex is offline)
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  const convex = convexUrl ? new ConvexHttpClient(convexUrl) : null

  if (convex) {
    try {
      await convex.mutation(api.chat.startSession, {
        sessionId,
        pageEntered,
        referrer: req.headers.get("referer") ?? undefined,
      })
      const lastUser = messages[messages.length - 1]
      if (lastUser?.role === "user") {
        await convex.mutation(api.chat.appendMessage, {
          sessionId,
          role: "user",
          content: lastUser.content,
        })
      }
    } catch (err) {
      console.warn("[chat] convex session/append failed:", err)
    }
  }

  // Stream from Claude
  const stream = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    system: [
      // Cached system prompt — every chat turn after the first hits cache
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: messages.map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content })),
    stream: true,
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      let full = ""
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text
            full += text
            // Don't stream the qualification line out — buffer the tail
            // We send chunks until we see ">>" prefix, then withhold remainder.
            if (!full.includes("\n>>") && !full.includes(">>")) {
              controller.enqueue(encoder.encode(text))
            } else {
              // Once the model starts emitting the qualification trailer, stop streaming
              // (the trailer is at the end and the user-visible reply is already sent)
            }
          }
        }
        // Final newline so the client knows we're done
        controller.enqueue(encoder.encode("\n"))
      } catch (err) {
        controller.enqueue(encoder.encode(`\n[error: ${String(err)}]`))
      } finally {
        controller.close()

        // Persist the assistant message (without the qualification trailer)
        const { reply, qualify, intent } = splitQualification(full)
        if (convex) {
          try {
            await convex.mutation(api.chat.appendMessage, {
              sessionId,
              role: "assistant",
              content: reply,
            })

            // Lead capture: if the user already submitted email AND the qualify score is decent, store the lead
            if (email && qualify >= 40) {
              const transcript = messages
                .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
                .concat([`ASSISTANT: ${reply}`])
                .join("\n\n")
              await convex.mutation(api.chat.captureLead, {
                sessionId,
                email,
                name,
                intent,
                qualifyScore: qualify,
                transcript,
              })
              // Best-effort: notify Amit
              await notifyAmit({ email, name, intent, qualify, transcript }).catch(() => {})
            }
          } catch (err) {
            console.warn("[chat] convex post-stream save failed:", err)
          }
        }
      }
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  })
}

// ── Email notify (Resend) — best effort ───────────────────────────────────────
async function notifyAmit(lead: {
  email: string
  name?: string
  intent: string
  qualify: number
  transcript: string
}) {
  if (!process.env.RESEND_API_KEY) return
  const fromEmail = process.env.FROM_EMAIL || "aria@meridiangtv.co.uk"
  const toEmail = "amit@berriesadvisory.com"
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Aria (Meridian) <${fromEmail}>`,
      to: toEmail,
      subject: `New lead from chat: ${lead.email} (qualify ${lead.qualify})`,
      text: `Intent: ${lead.intent}\nName: ${lead.name ?? "(not provided)"}\nQualify score: ${lead.qualify}/100\n\nFull transcript:\n\n${lead.transcript}`,
    }),
  })
}
