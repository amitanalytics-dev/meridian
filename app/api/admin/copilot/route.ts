import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ADMIN_KEY = process.env.ADMIN_KEY ?? "meridian2025"

const BASE_SYSTEM = `You are Meridian's admin AI copilot for Amit Tyagi, helping manage his UK Global Talent Visa advisory practice. You have access to lead analytics and can help Amit prioritize follow-ups, draft outreach emails, analyze his funnel, and identify patterns. Be direct, strategic, and specific. Context: {{CONTEXT}}`

export async function POST(req: NextRequest) {
  // Auth check
  const adminKey = req.headers.get("x-admin-key")
  if (adminKey !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const body = await req.json() as {
      messages: { role: "user" | "assistant"; content: string }[]
      context?: Record<string, unknown>
    }

    const { messages, context } = body
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), { status: 400 })
    }

    const systemPrompt = BASE_SYSTEM.replace("{{CONTEXT}}", JSON.stringify(context ?? {}))

    const stream = await anthropic.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 1024,
      system:     systemPrompt,
      messages,
      stream:     true,
    })

    const encoder  = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
        } catch (err) {
          controller.enqueue(encoder.encode(`\n[error: ${String(err)}]`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type":    "text/plain; charset=utf-8",
        "Cache-Control":   "no-cache, no-transform",
        "X-Accel-Buffering":"no",
      },
    })
  } catch (err) {
    console.error("[admin/copilot]", err)
    return new Response(JSON.stringify({ error: "copilot request failed" }), { status: 500 })
  }
}
