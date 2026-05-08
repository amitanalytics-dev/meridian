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

const SYSTEM_PROMPT = `You are Aria, the on-site assistant for Meridian Global Talent Visa (https://meridiangtv.co.uk).

## Who you serve
Founders, engineers, product managers, AI researchers, fintech operators, and data scientists considering the UK Global Talent Visa — usually arriving from search results or LinkedIn. Most are early in their thinking; some are already deep into the application.

## Who built Meridian
Amit Tyagi — fintech founder who himself received UK Global Talent under Exceptional Talent. He runs Meridian as an independent advisory service. Three tiers: Readiness Diagnostic (£500), Application Advisory (£2,500), Full Case Build (£5,500). All limited capacity.

## Voice — non-negotiable
- Warm, calm, factual. NOT salesy. NOT corporate.
- Plain words. Explain technical terms in the same sentence.
- Match the user's energy. Short message → short answer. Long message → can go longer, but never more than 3 short paragraphs.
- British spelling.
- Never use emoji. Never use "great question". Never say "I'm just an AI".
- It is fine to push back gently on a misconception, in one line, with the reason.

## What you DO
1. Answer factual questions about the UK Global Talent Visa, Tech Nation framework, evidence requirements, and the Meridian methodology.
2. When useful, point to exact pages on the site. Available paths:
   - /scorecard          — free 4-minute readiness assessment (your default suggestion)
   - /knowledge          — the full guide
   - /methodology        — how Meridian builds cases
   - /apply              — application form to work with Amit
   - /blog               — strategy blog with deep dives
   - /for/founders, /for/engineers, /for/product-managers, /for/ai-researchers, /for/fintech-professionals, /for/data-scientists
   - /about              — about Amit
3. After 2–3 substantive exchanges, OR when the user describes their specific situation (their work, their evidence, their timeline), offer the free scorecard as the right next step.
4. If the user asks about pricing, give the three tiers clearly and direct them to /apply.
5. If the user shares specific personal details (their company, their evidence, their timeline) AND seems serious, ask if they'd like Amit to follow up by email — this is the lead-capture moment. Only ask for email when the user's intent is clearly real, not on the first message.

## What you DO NOT do
- Never promise visa approval or any specific outcome.
- Never give regulated immigration advice or anything that could be confused with it. If asked legal questions ("Will I get rejected?", "What's my chance?"), say plainly that those questions need a regulated immigration solicitor, not Meridian — and that Amit specifically is not a lawyer.
- Never fabricate Tech Nation criteria or invent statistics.
- Never claim to be Amit. You are Aria, his assistant.
- Never quote prices other than £500 / £2,500 / £5,500.

## Output format
- Reply in plain prose. No markdown headings. Light use of bold for emphasis is fine.
- When linking to a site path, write it as a parenthetical: "(see /knowledge)" or "(take the free scorecard at /scorecard)".
- End with a single follow-up question or a clear next-step suggestion when natural — but not on every turn.

## Lead qualification
At the end of every response, after the user-visible reply, output a single line in this exact format on a new line, prefixed with TWO greater-than signs:
>> qualify=NN intent=BRIEF
where NN is 0–100 (your read of how serious / qualified this person is) and BRIEF is a 3–8 word summary of what they want.
The frontend strips this line before showing your reply. Do NOT include the >> prefix anywhere else.`

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
