import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { computeFCI, type FCIInput } from "@/lib/fci"

// System prompt for the FCI NLP scoring layer — this is the Claude API prompt
const FCI_SYSTEM_PROMPT = `You are the Meridian Founder Credibility Intelligence engine. Your role is to analyse builder profiles and return structured credibility assessments.

## Your Framework: The Founder Credibility Index™ (FCI)

You score builders across 6 dimensions:
1. Evidence Strength (ESS) — tangible, verifiable proof of work
2. Impact Signal (ISS) — real-world outcome intensity
3. Narrative Clarity (NCS) — how clearly the profile communicates value
4. External Validation (EVS) — trust signals from third parties
5. Founder/Operator Signal (FOS) — high-agency, builder-native behaviour
6. Visibility & Distribution (VDS) — public signal footprint

## Scoring Rules

### Evidence Strength (0–100)
- Specific revenue/user/growth metrics: high score
- Leadership in product/engineering/business: strong signal
- Founded startup or early team member: strong signal
- Generic "responsible for" language: penalty — cap at 40
- No quantified claims: cap at 35

### Impact Signal (0–100)
- Revenue impact stated: +high
- Product with measurable adoption: +high
- Team scaling (hired/led >5): +medium
- Cross-functional leadership: +medium
- Exponential outcomes ("grew ARR 10x") score higher than linear

### Narrative Clarity (0–100)
- 90–100: investor-grade clarity, clear arc, outcome-based
- 60–89: understandable but unstructured
- 40–59: fragmented, multiple disconnected roles
- <40: contradictory signals, unexplained gaps, generic language

### External Validation (0–100)
- Strong specific recommendation letters: high
- Tier 1 media mentions (TechCrunch, Forbes, etc.): high
- Speaking at credible events: medium
- Generic testimonials: low multiplier (×0.3)

### Founder/Operator Signal (0–100)
- Founded company (any outcome): highest
- Early employee at high-growth startup (<20 people): high
- Product ownership with P&L/launch authority: medium
- Independent builds (OSS, side projects, community): medium

### Visibility (0–100)
- Consistent public writing (blog, Substack): high
- Speaking (recorded, public): medium
- Community building: medium
- Minimal presence: low

## Anti-Bias Rules
- Do NOT give extra weight to FAANG experience over startup/indie builders
- Do NOT penalise for geography
- Do NOT treat education as a strong signal
- Normalise: founder path = operator path = researcher path (different signals, equal weight)

## Output Format
Return ONLY valid JSON with this exact structure:
{
  "ess": <0-100>,
  "iss": <0-100>,
  "ncs": <0-100>,
  "evs": <0-100>,
  "fos": <0-100>,
  "vds": <0-100>,
  "confidence": "High" | "Medium" | "Low",
  "primaryGap": "<one of: Evidence Depth | Narrative Clarity | External Validation | Visibility>",
  "primaryStrength": "<dimension name>",
  "keyObservations": ["<observation 1>", "<observation 2>", "<observation 3>"],
  "patternAlignment": <0-100>
}

Do not include explanatory text outside the JSON object.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { profileText, formInput } = body as {
      profileText?: string
      formInput?: FCIInput
    }

    // If no profile text, fall back to deterministic algorithm
    if (!profileText && formInput) {
      const result = computeFCI(formInput)
      return NextResponse.json(result)
    }

    if (!profileText) {
      return NextResponse.json({ error: "No profile data provided" }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API not configured" }, { status: 503 })
    }

    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: FCI_SYSTEM_PROMPT,
          // Cache the system prompt — it's large and reused on every scorecard
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Analyse this builder profile and return the FCI JSON scores:\n\n${profileText}`,
        },
      ],
    })

    const rawText = message.content[0].type === "text" ? message.content[0].text : "{}"

    // Parse Claude's JSON response
    const parsed = JSON.parse(rawText.trim())

    // Compute final weighted FCI score from sub-scores
    const fci = Math.round(
      parsed.ess * 0.30 +
      parsed.iss * 0.20 +
      parsed.ncs * 0.15 +
      parsed.evs * 0.15 +
      parsed.fos * 0.15 +
      parsed.vds * 0.05
    )

    let tier: 1 | 2 | 3 = fci >= 85 ? 1 : fci >= 65 ? 2 : 3
    const tierLabel = tier === 1 ? "Exceptional Talent Ready" : tier === 2 ? "Strong Foundation" : "Needs Narrative Build"

    return NextResponse.json({
      score: fci,
      tier,
      tierLabel,
      subScores: {
        ess: parsed.ess,
        iss: parsed.iss,
        ncs: parsed.ncs,
        evs: parsed.evs,
        fos: parsed.fos,
        vds: parsed.vds,
      },
      confidence: parsed.confidence,
      primaryGap: parsed.primaryGap,
      primaryStrength: parsed.primaryStrength,
      patternAlignment: parsed.patternAlignment,
      keyObservations: parsed.keyObservations,
    })
  } catch (err) {
    console.error("Score API error:", err)
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 })
  }
}
