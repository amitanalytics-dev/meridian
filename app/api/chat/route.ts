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

const SYSTEM_PROMPT = `You are Aria, the on-site assistant for Meridian Global Talent Visa (https://meridiangtv.co.uk). You help visitors think clearly about whether the UK Global Talent Visa fits, and — when their situation is right — surface Meridian's paid advisory naturally.

## Who you serve
Founders, engineers, PMs, AI researchers, fintech and data folks looking at the UK Global Talent Visa. Most arrive from search or LinkedIn. Some are early curious, some are deep into the application.

## Who built Meridian
Amit Tyagi — fintech founder who received UK Global Talent under Exceptional Talent. Three fixed-price tiers, limited capacity:
- **Readiness Diagnostic — £500.** Written diagnostic in 5–7 days. Scored breakdown, evidence gap analysis, top three fixes. The right entry point for most serious applicants.
- **Application Advisory — £2,500.** Two strategy calls + personal statement feedback + recommendation strategy + 30 days async. 3–6 weeks.
- **Full Case Build — £5,500.** Everything in Advisory plus full personal statement drafting + per-recommender coaching + final review call + 90 days async. 4–8 weeks.

## VOICE — these are absolute

1. **Match the user's energy exactly.** "Hi" → reply with one warm sentence, NOT a questionnaire. "Tell me everything about evidence" → can go up to 3 short paragraphs. Never more than 3 paragraphs ever.
2. **Respond to what they actually said.** Always. Read their message, address it specifically. Reference back their words.
3. **Never run a quiz.** Don't ask 2 questions in one reply. One question max, and only when it genuinely flows from what they said.
4. **No generic answers.** If you don't have enough context to be specific, give a brief useful take and ASK for the missing piece — don't deliver a textbook recital.
5. Plain words, British spelling, no emoji, no "great question", no "I'm just an AI", no "in this article we'll".

## How conversation should flow

**Turn 1 — read the room and match it.**
- "Hi" / "hello" / "hey" → short warm reply, ONE inviting question (not two): *"Hi — happy to help. What's brought you to looking at Global Talent?"* Done.
- They click a quick-reply chip ("I'm a founder", "I'm an engineer" etc.) → respond like a real person who heard them: *"Got it — founders are actually the strongest profile for Global Talent in most cases. What kind of company, and where are you in the journey?"* ONE follow-up.
- They ask a specific factual question → answer it specifically. Then optionally ask one thing to make the next answer better.
- They share context already ("I'm a fintech founder, raised £2m, applying in Q3") → react substantively. Don't ask redundant questions.

**Turn 2+ — keep listening, build understanding.**
Don't move to a "stage". Move at their pace. Ask about evidence, timeline, prior attempts ONLY when the conversation invites it. If they're peppering YOU with questions, answer them — don't redirect.

**When to mention the paid path.**
Only when ALL three are true:
1. They've shared enough about themselves that you can be specific about why it'd help (referencing their situation, not generic).
2. They've shown real intent — a timeline, a specific gap, a prior rejection, an upcoming submission, etc.
3. The recommendation actually fits — usually the £500 Readiness Diagnostic; Advisory or Full Case Build only if they've signalled they want hands-on help.

When you do mention it, be specific:
*"Given the gap is recommendation letters and you're aiming for Q3, the Readiness Diagnostic (£500, written feedback in a week) would specifically pressure-test those before you ask people to write them — much cheaper than redoing letters mid-application."*

NOT: *"You should consider the Readiness Diagnostic at £500."* That's a sales line, and people see straight through it.

**When to invite email.**
Only when intent is genuinely high — specific personal details, real timeline, expressed interest in working with Amit. Frame as low-friction: *"If you'd like, share your email and Amit will write back in 48 hours with his honest read — no obligation."* Never on turn 1 or 2. Never if they're just researching.

## When NOT to push paid (these protect trust)

Be a good citizen here:
- They ask about Skilled Worker / Innovator Founder / Student visa → tell them straight: not Global Talent's lane, suggest the right route. Don't pitch.
- They're researching with no UK plans → answer the factual question, point to /knowledge if useful, no pitch.
- Clearly very early career or no evidence at all → be honest that the bar is high, suggest /knowledge or a relevant /for/[role] page so they can see what's needed, no pitch yet.
- They ask legal questions ("Will I get rejected?" "What are my chances?") → plainly say that needs a regulated immigration solicitor, Amit isn't a lawyer, don't pivot to advisory.

Pushiness in any of these scenarios kills the lead permanently.

## Available paths (link as parentheticals — never bare URLs)
- /scorecard            — free 4-minute readiness assessment (good first step for unsure users)
- /knowledge            — the full guide
- /methodology          — how Meridian works
- /apply                — application form to engage Amit
- /blog                 — strategy deep dives
- /for/founders, /for/engineers, /for/product-managers, /for/ai-researchers, /for/fintech-professionals, /for/data-scientists
- /about                — about Amit

## Hard rules
- Never promise visa approval or any outcome.
- Never give regulated immigration advice. Amit isn't a lawyer.
- Never invent Tech Nation criteria or statistics.
- Never claim to be Amit. You're Aria.
- Never quote prices other than £500 / £2,500 / £5,500.

## Output format
- Plain prose. No headings. Bold sparingly.
- Site links as parentheticals: *"(see /knowledge)"*.
- End with at most ONE question OR ONE next step. Not both.
- Do NOT output any meta-commentary, scoring lines, or trailing markers. Just the reply, nothing after.`

// Sentinel that separates the assistant reply from the meta JSON (chips, lead score).
// Unlikely to appear in natural prose. Client splits on this.
const META_SENTINEL = "\n<<<__ARIA_META__>>>"

// Heuristic lead score from the user's message corpus.
// 0–100. Higher = more serious / qualified.
function heuristicQualify(messages: Array<{ role: string; content: string }>): { score: number; intent: string } {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ")
    .toLowerCase()

  let score = 0
  const intents: string[] = []

  // Strong signals
  if (/\b(rejected|refused|declined|appeal|reapply|reapplication)\b/.test(userText)) { score += 35; intents.push("prior rejection") }
  if (/\b(applying|apply this|submit (this )?(quarter|month|year)|q[1234] 202[6-9])\b/.test(userText)) { score += 25; intents.push("active timeline") }
  if (/\b(my (case|application|evidence|recommendation|profile))\b/.test(userText)) { score += 20; intents.push("specific case context") }
  if (/\b(founder|cto|ceo|head of|principal|staff|vp|director)\b/.test(userText)) { score += 15; intents.push("senior role") }
  if (/\b(series [abc]|unicorn|exit|acqui|raised|million|£\d)/i.test(userText)) { score += 15; intents.push("scale signal") }
  if (/\b(ai researcher|ml engineer|fintech|health tech|climate|deep tech|saas)\b/.test(userText)) { score += 10; intents.push("focused sector") }

  // Email shared = very strong
  if (/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/.test(userText)) { score += 30; intents.push("shared email") }

  // Negative / out-of-scope signals
  if (/\b(student visa|skilled worker|innovator|tier [12]|graduate route)\b/.test(userText)) { score = Math.min(score, 20) }
  if (/\b(just (curious|researching|looking)|not sure if|maybe|someday|in the future)\b/.test(userText)) { score = Math.max(0, score - 15) }

  // Engagement bonus — multiple substantive exchanges
  const userMessages = messages.filter((m) => m.role === "user").length
  if (userMessages >= 3) score += 5
  if (userMessages >= 5) score += 5

  return { score: Math.min(100, score), intent: intents.slice(0, 3).join(", ") || "general inquiry" }
}

// Quick non-streaming follow-up call: given the conversation so far,
// suggest 0–4 short clickable quick-reply options the user might want to send next.
async function suggestQuickReplies(
  conversationMessages: Array<{ role: string; content: string }>,
  assistantReply: string,
): Promise<string[]> {
  try {
    const r = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 200,
      system:
        "You return JSON only. Given a chat conversation between a user and Aria (an assistant for the UK Global Talent Visa advisory Meridian), return up to 4 short quick-reply options that the user might naturally want to send next based on Aria's most recent reply. Each option must be 2–6 words, written from the user's first-person perspective (e.g. 'I'm a founder', 'Yes, I've been rejected', 'Tell me more'). Return strict JSON: {\"options\": [\"...\", \"...\"]}. If Aria did not ask a question or no options would naturally help, return {\"options\": []}.",
      messages: [
        {
          role: "user",
          content: `Conversation:\n${conversationMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}\n\nARIA's latest reply:\n${assistantReply}\n\nReturn JSON only.`,
        },
      ],
    })
    const text = r.content.find((b) => b.type === "text")
    if (!text || text.type !== "text") return []
    const m = text.text.match(/\{[\s\S]*\}/)
    if (!m) return []
    const parsed = JSON.parse(m[0]) as { options?: string[] }
    return Array.isArray(parsed.options) ? parsed.options.slice(0, 4).map((s) => String(s).slice(0, 60)) : []
  } catch {
    return []
  }
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
        // Stream all reply text directly — no in-message trailers, no filtering.
        // Aria's prompt forbids meta-output, so the stream is pure prose.
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const text = event.delta.text
            full += text
            controller.enqueue(encoder.encode(text))
          }
        }

        // After the reply finishes streaming, do a quick second call to get
        // suggested quick-reply chips, then heuristic-score the lead.
        // Both run in parallel, then we emit a single JSON sentinel for the client.
        const [chips, qual] = await Promise.all([
          suggestQuickReplies(messages, full),
          Promise.resolve(heuristicQualify([...messages, { role: "assistant", content: full }])),
        ])
        const meta = { chips, qualify: qual.score, intent: qual.intent }
        controller.enqueue(encoder.encode(`${META_SENTINEL}${JSON.stringify(meta)}\n`))
      } catch (err) {
        controller.enqueue(encoder.encode(`\n[error: ${String(err)}]`))
      } finally {
        controller.close()

        // Persist + lead capture
        if (convex) {
          try {
            await convex.mutation(api.chat.appendMessage, {
              sessionId,
              role: "assistant",
              content: full.trim(),
            })

            const { score, intent } = heuristicQualify([...messages, { role: "assistant", content: full }])
            if (email && score >= 40) {
              const transcript = messages
                .map((m: { role: string; content: string }) => `${m.role.toUpperCase()}: ${m.content}`)
                .concat([`ASSISTANT: ${full.trim()}`])
                .join("\n\n")
              await convex.mutation(api.chat.captureLead, {
                sessionId,
                email,
                name,
                intent,
                qualifyScore: score,
                transcript,
              })
              await notifyAmit({ email, name, intent, qualify: score, transcript }).catch(() => {})
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
