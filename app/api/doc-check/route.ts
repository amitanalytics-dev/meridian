import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const ANALYSIS_PROMPT = `You are a UK Global Talent Visa expert reviewing evidence documents. Analyze this document and determine its value as application evidence.

Return ONLY valid JSON with this exact structure:
{
  "evidenceType": "string (e.g. 'Recommendation Letter', 'CV/Resume', 'Pay Slip', 'Publication', 'Media Coverage', 'Award Certificate', 'Contract', 'Other')",
  "strength": "strong" | "moderate" | "weak",
  "keySignal": "string (1 sentence explaining the key strength or weakness)",
  "improvementTip": "string (1 specific actionable tip to make this document stronger evidence)",
  "score": number (0-100)
}`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 })
    }

    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: "File too large. Maximum 5MB." }), { status: 400 })
    }

    const isPDF  = file.type === "application/pdf"
    const isText = file.type.startsWith("text/") || file.name.endsWith(".txt") || file.name.endsWith(".md")

    if (!isPDF && !isText) {
      return new Response(JSON.stringify({ error: "Please upload a PDF or text file" }), { status: 400 })
    }

    let messageContent: Anthropic.Messages.MessageParam["content"]

    if (isPDF) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString("base64")
      messageContent = [
        {
          type:   "document" as const,
          source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 },
        },
        { type: "text" as const, text: ANALYSIS_PROMPT },
      ]
    } else {
      const text = await file.text()
      messageContent = [{
        type: "text" as const,
        text: `Document content:\n\n${text}\n\n${ANALYSIS_PROMPT}`,
      }]
    }

    const response = await anthropic.messages.create({
      model:      "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages:   [{ role: "user", content: messageContent }],
    })

    const textBlock = response.content.find(b => b.type === "text")
    if (!textBlock || textBlock.type !== "text") throw new Error("No response from model")

    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("Invalid JSON response from model")

    const result = JSON.parse(match[0]) as {
      evidenceType:    string
      strength:        "strong" | "moderate" | "weak"
      keySignal:       string
      improvementTip:  string
      score:           number
    }

    return new Response(JSON.stringify(result), {
      status:  200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("[doc-check]", err)
    return new Response(JSON.stringify({ error: "Analysis failed. Please try again." }), { status: 500 })
  }
}
