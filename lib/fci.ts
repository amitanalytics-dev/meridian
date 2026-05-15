// Founder Credibility Index™ — deterministic scoring engine

export type FCIPath       = "founder" | "operator" | "builder" | "researcher"
export type FCIExperience = "lt3" | "3to7" | "7to12" | "gt12"
export type FCIScale      = "small" | "medium" | "large" | "defining"
export type FCIEvidence   = "specific" | "qualitative" | "partial" | "none"
export type FCINarrative  = "clear" | "understandable" | "disconnected" | "unclear"
export type FCIValidation = "strong_rec" | "media" | "speaking" | "none"
export type FCIIndependence = "founded" | "built_product" | "open_source" | "none"
export type FCIVisibility = "writing" | "speaking_pub" | "community" | "minimal"
export type FCIImpact     = "changed_direction" | "built_lasting" | "led_initiatives" | "strong_contributor"
export type FCIGap        = "narrative" | "validation" | "evidence" | "visibility"

export interface FCIInput {
  path:          FCIPath
  experience:    FCIExperience
  scale:         FCIScale
  evidence:      FCIEvidence
  narrative:     FCINarrative
  validation:    FCIValidation
  independence:  FCIIndependence
  visibility:    FCIVisibility
  impact:        FCIImpact
  goal:          string  // context only
  gap:           FCIGap
  timeline:      string  // context only
}

export interface SubScores {
  ess: number  // Evidence Strength      (weight 30%)
  iss: number  // Impact Signal          (weight 20%)
  ncs: number  // Narrative Clarity      (weight 15%)
  evs: number  // External Validation    (weight 15%)
  fos: number  // Founder/Operator Signal(weight 15%)
  vds: number  // Visibility/Distribution(weight  5%)
}

export interface FCIOutput {
  score:            number
  tier:             1 | 2 | 3
  tierLabel:        string
  tierDescription:  string
  subScores:        SubScores
  confidence:       "High" | "Medium" | "Low"
  primaryGap:       string
  primaryStrength:  string
  patternAlignment: number  // % alignment vs approved cohort patterns
  insightLine:      string  // the aha-moment sentence
  advisoryPath:     "diagnostic" | "signal_architecture" | "builder_system"
}

// ── Raw point maps ──────────────────────────────────────────────────────────

const P_EXPERIENCE: Record<FCIExperience, number> = {
  lt3: 0, "3to7": 12, "7to12": 22, gt12: 30,
}

const P_EVIDENCE: Record<FCIEvidence, number> = {
  specific: 30, qualitative: 16, partial: 10, none: 0,
}

const P_SCALE: Record<FCIScale, number> = {
  small: 8, medium: 18, large: 28, defining: 42,
}

const P_IMPACT: Record<FCIImpact, number> = {
  changed_direction: 28, built_lasting: 20, led_initiatives: 14, strong_contributor: 7,
}

const P_NARRATIVE: Record<FCINarrative, number> = {
  clear: 40, understandable: 27, disconnected: 14, unclear: 4,
}

const P_VALIDATION: Record<FCIValidation, number> = {
  strong_rec: 32, media: 22, speaking: 16, none: 4,
}

const P_PATH: Record<FCIPath, number> = {
  founder: 25, operator: 13, builder: 16, researcher: 10,
}

const P_INDEPENDENCE: Record<FCIIndependence, number> = {
  founded: 25, built_product: 18, open_source: 12, none: 0,
}

const P_VISIBILITY: Record<FCIVisibility, number> = {
  writing: 40, speaking_pub: 28, community: 18, minimal: 4,
}

// ── Normalization maxes ─────────────────────────────────────────────────────

const MAX_ESS = 60   // experience(30) + evidence(30)
const MAX_ISS = 70   // scale(42) + impact(28)
const MAX_NCS = 40
const MAX_EVS = 32
const MAX_FOS = 50   // path(25) + independence(25)
const MAX_VDS = 40

// ── Helpers ─────────────────────────────────────────────────────────────────

function norm(raw: number, max: number): number {
  return Math.min(100, Math.round((raw / max) * 100))
}

const SUB_LABELS: Record<keyof SubScores, string> = {
  ess: "Evidence Strength",
  iss: "Impact Signal",
  ncs: "Narrative Clarity",
  evs: "External Validation",
  fos: "Founder Signal",
  vds: "Visibility",
}

function bestDimension(ss: SubScores): string {
  const sorted = (Object.keys(ss) as (keyof SubScores)[]).sort((a, b) => ss[b] - ss[a])
  return SUB_LABELS[sorted[0]]
}

const GAP_LABELS: Record<FCIGap, string> = {
  narrative:  "Narrative Clarity",
  validation: "External Validation",
  evidence:   "Evidence Depth",
  visibility: "Visibility",
}

function insightFor(gap: FCIGap, score: number): string {
  if (gap === "narrative")
    return "Substance is real. The gap: how your story reads to external evaluators."
  if (gap === "validation")
    return "No third-party proof means invisible to evaluators. That's the gap to close."
  if (gap === "evidence")
    return "Your evidence isn't capturing what you've actually built."
  return "Your work exists. The problem: no global signal yet."
}

function advisoryPath(score: number): FCIOutput["advisoryPath"] {
  if (score <= 55) return "builder_system"
  if (score <= 74) return "signal_architecture"
  return "diagnostic"
}

function patternAlignment(input: FCIInput): number {
  let n = 38
  if (input.evidence === "specific")           n += 16
  if (input.validation === "strong_rec")       n += 15
  if (input.independence !== "none")           n += 11
  if (input.narrative === "clear")             n += 10
  if (input.visibility !== "minimal")          n +=  8
  if (input.path === "founder")                n +=  5
  if (input.scale === "large" || input.scale === "defining") n += 7
  return Math.min(94, n)
}

// ── Main export ─────────────────────────────────────────────────────────────

export function computeFCI(input: FCIInput): FCIOutput {
  const rawESS = P_EXPERIENCE[input.experience] + P_EVIDENCE[input.evidence]
  const rawISS = P_SCALE[input.scale]           + P_IMPACT[input.impact]
  const rawNCS = P_NARRATIVE[input.narrative]
  const rawEVS = P_VALIDATION[input.validation]
  const rawFOS = P_PATH[input.path]             + P_INDEPENDENCE[input.independence]
  const rawVDS = P_VISIBILITY[input.visibility]

  const ess = norm(rawESS, MAX_ESS)
  const iss = norm(rawISS, MAX_ISS)
  const ncs = norm(rawNCS, MAX_NCS)
  const evs = norm(rawEVS, MAX_EVS)
  const fos = norm(rawFOS, MAX_FOS)
  const vds = norm(rawVDS, MAX_VDS)

  const subScores: SubScores = { ess, iss, ncs, evs, fos, vds }

  let raw = ess * 0.30 + iss * 0.20 + ncs * 0.15 + evs * 0.15 + fos * 0.15 + vds * 0.05

  // Over-indexing cap: one dominant dimension + others average < 40 → cap at 70
  const vals = [ess, iss, ncs, evs, fos, vds]
  const maxVal = Math.max(...vals)
  const otherAvg = vals.filter(v => v !== maxVal).reduce((a, b) => a + b, 0) / 5
  if (maxVal > 85 && otherAvg < 40) raw = Math.min(raw, 70)

  const score = Math.round(raw)

  let tier: 1 | 2 | 3
  let tierLabel: string
  let tierDescription: string

  if (score >= 85) {
    tier = 1
    tierLabel = "Exceptional Talent Ready"
    tierDescription = "Strong case. Focus on sequencing, framing, and final presentation."
  } else if (score >= 65) {
    tier = 2
    tierLabel = "Strong Foundation"
    tierDescription = "Substance is there. The gap: how evaluators read you vs. what you've actually built."
  } else {
    tier = 3
    tierLabel = "Needs Narrative Build"
    tierDescription = "Positioning challenge — not a capability gap. You likely have more than your case currently shows."
  }

  let confidence: "High" | "Medium" | "Low"
  if (input.evidence === "specific" && input.validation !== "none") {
    confidence = "High"
  } else if (input.evidence === "none" || input.narrative === "unclear") {
    confidence = "Low"
  } else {
    confidence = "Medium"
  }

  return {
    score,
    tier,
    tierLabel,
    tierDescription,
    subScores,
    confidence,
    primaryGap: GAP_LABELS[input.gap],
    primaryStrength: bestDimension(subScores),
    patternAlignment: patternAlignment(input),
    insightLine: insightFor(input.gap, score),
    advisoryPath: advisoryPath(score),
  }
}
