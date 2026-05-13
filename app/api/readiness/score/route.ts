import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Scoring algorithm ─────────────────────────────────────────────────────────

function computeScore(answers: Record<string, string>) {
  const roleScore:  Record<string, number> = { founder: 100, executive: 90, researcher: 85, engineer: 80, pm: 75, designer: 60, other: 50 }
  const yearsScore: Record<string, number> = { gt15: 100, "11to15": 85, "7to10": 70, "3to6": 50, lt3: 20 }
  const scaleScore: Record<string, number> = { millions: 100, "100k_1m": 80, "10k_100k": 60, medium: 40, small: 20 }

  const technicalLeadership =
    (roleScore[answers.role] ?? 50) * 0.3 +
    (yearsScore[answers.yearsExp] ?? 50) * 0.4 +
    (scaleScore[answers.impactScale] ?? 30) * 0.3

  const metricsScore:   Record<string, number> = { specific: 100, partial: 60, qualitative: 40, none: 10 }
  const recScore:       Record<string, number> = { strong_3plus: 100, have_some: 60, in_progress: 30, none: 0 }
  const organizedScore: Record<string, number> = { organized: 100, partial: 60, scattered: 30, none: 0 }

  const evidenceQuality =
    (metricsScore[answers.metricsAvailable] ?? 40) * 0.5 +
    (recScore[answers.recLetterStatus] ?? 0) * 0.3 +
    (organizedScore[answers.evidenceOrganized] ?? 30) * 0.2

  const validationBase: Record<string, number> = { strong_rec: 90, media_coverage: 80, speaking: 70, awards: 85, none: 0 }
  let externalRecognition = validationBase[answers.externalValidation] ?? 0
  if (answers.hasPublications === "yes") externalRecognition += 25
  if (answers.hasAwards       === "yes") externalRecognition += 20
  if (answers.hasOpenSource   === "yes") externalRecognition += 15
  if (answers.hasContent      === "yes") externalRecognition += 10
  externalRecognition = Math.min(100, externalRecognition)

  const foundingScore: Record<string, number> = { founded_funded: 100, founded_boot: 80, early_employee: 50, no: 20 }
  const independence =
    (foundingScore[answers.foundingExp] ?? 20) * 0.7 +
    (answers.hasContent === "yes" ? 40 : 0) * 0.3

  const salaryScore: Record<string, number> = { gt300k: 100, "150_300k": 80, "100_150k": 65, "60_100k": 45, lt60k: 25, prefer_not: 55 }
  const globalProfile = salaryScore[answers.salaryLevel] ?? 55

  const overallScore = Math.round(
    technicalLeadership   * 0.25 +
    evidenceQuality       * 0.25 +
    externalRecognition   * 0.20 +
    independence          * 0.15 +
    globalProfile         * 0.15,
  )

  const readinessLevel =
    overallScore >= 75 ? "fully_ready" :
    overallScore >= 55 ? "semi_ready"  :
    overallScore >= 35 ? "not_ready"   : "not_eligible"

  let recommendedTrack: "et" | "ep" | "neither" = "neither"
  let secondaryTrack:   "et" | "ep" | undefined

  if (technicalLeadership >= 70 && externalRecognition >= 60 && overallScore >= 65) {
    recommendedTrack = "et"
    if ((technicalLeadership >= 50 || answers.foundingExp !== "no") && overallScore >= 40) {
      secondaryTrack = "ep"
    }
  } else if ((technicalLeadership >= 50 || answers.foundingExp !== "no") && overallScore >= 40) {
    recommendedTrack = "ep"
    if (technicalLeadership >= 70 && externalRecognition >= 60) secondaryTrack = "et"
  }

  const leadQuality: "hot" | "warm" | "cold" =
    overallScore >= 65 ? "hot" :
    overallScore >= 45 ? "warm" : "cold"

  return {
    overallScore,
    subScores: {
      technicalLeadership:  Math.round(technicalLeadership),
      evidenceQuality:      Math.round(evidenceQuality),
      externalRecognition:  Math.round(externalRecognition),
      independence:         Math.round(independence),
      globalProfile:        Math.round(globalProfile),
    },
    readinessLevel,
    recommendedTrack,
    secondaryTrack,
    leadQuality,
  }
}

// ── Track explanation ─────────────────────────────────────────────────────────

function buildTrackExplanation(
  answers: Record<string, string>,
  track:   string,
): string {
  const roleLabels: Record<string, string> = {
    founder: "founder", engineer: "engineer", pm: "product manager",
    researcher: "researcher", designer: "designer",
    executive: "senior executive", other: "tech professional",
  }
  const sectorLabels: Record<string, string> = {
    fintech: "fintech", ai_ml: "AI/ML", saas: "SaaS", consumer: "consumer tech",
    healthtech: "healthtech", climate: "climate tech", security: "cybersecurity",
    web3: "web3", other: "digital technology",
  }
  const role   = roleLabels[answers.role]   ?? "professional"
  const sector = sectorLabels[answers.sector] ?? "technology"

  if (track === "et") {
    return `Based on your experience as a ${role} in ${sector}, with ${answers.yearsExp === "gt15" ? "15+ years" : "strong experience"} and the scale of your impact, the Exceptional Talent pathway aligns with your profile. This track recognises established leaders who have demonstrably shaped their sector.`
  }
  if (track === "ep") {
    return `Your trajectory as a ${role} in ${sector} shows the kind of rising potential the Exceptional Promise pathway is designed for. This track recognises professionals who haven't yet achieved full sector-level recognition but show clear, demonstrable potential for future leadership.`
  }
  return `Your current profile needs further development before a strong application is possible. Focusing on your biggest gap — ${answers.biggestGap} — would be the highest-leverage starting point.`
}

// ── Document checklist ────────────────────────────────────────────────────────

function buildDocumentChecklist(track: string) {
  if (track === "et") {
    return [
      { id: "ps",       label: "Personal Statement (1,000 words max)",                   category: "mandatory", importance: 10, description: "Your core argument — why you qualify as Exceptional Talent. Not a biography. An argument.",                                                            tip: "Lead with your most significant sector contribution, not your job history." },
      { id: "cv",       label: "CV with quantified outcomes",                             category: "mandatory", importance: 9,  description: "A structured CV that leads with quantified impact, not job descriptions.",                                                                           tip: "Replace every job description with 1-2 quantified outcomes (e.g. '£12M ARR', '3.2M users')." },
      { id: "recs",     label: "3 Recommendation Letters from senior tech leaders",       category: "mandatory", importance: 10, description: "Letters from recognized figures in your sector who can speak to your specific impact — not your working relationship.",                              tip: "Brief your recommenders on exactly what to write. Generic relationship letters are the #1 rejection cause." },
      { id: "press",    label: "Press / media coverage articles",                         category: "strong",    importance: 8,  description: "Articles in recognized tech or business publications that feature you or your work.",                                                                 tip: "TechCrunch, Forbes, The Times, sector publications. Screenshots plus live URLs." },
      { id: "metrics",  label: "Product or business impact evidence",                     category: "strong",    importance: 8,  description: "Screenshots, internal reports, or signed statements showing scale of your work (users, revenue, growth).",                                           tip: "NDA-sensitive? A signed letter from a director confirming metrics is accepted." },
      { id: "awards2",  label: "Industry awards or recognition certificates",             category: "strong",    importance: 7,  description: "Formal awards, accelerator selections, or recognition from credible sector bodies.",                                                                 tip: "Niche industry awards count. Document them with certificates and programme pages." },
      { id: "pubs",     label: "Patents, publications, or research papers",               category: "strong",    importance: 7,  description: "Formal technical or academic output with your name as author or co-author.",                                                                        tip: "Even conference papers or pre-prints strengthen the technical leadership signal." },
      { id: "speaking", label: "Conference speaking recordings or invitations",           category: "strong",    importance: 6,  description: "Proof of speaking at industry events — not internal company talks.",                                                                                tip: "A recording, event programme, or invitation letter each work as evidence." },
      { id: "payslips", label: "Payslips or salary evidence (top 10% signal)",            category: "strong",    importance: 7,  description: "Evidence that your compensation places you in the top 10% for your role and geography.",                                                            tip: "3 months of payslips or a signed employment letter with salary details." },
      { id: "github",   label: "GitHub profile or open-source work",                     category: "optional",  importance: 5,  description: "Public repository showing significant work — stars, contributors, or usage evidence.",                                                              tip: "A link plus a short summary of impact is stronger than just the link." },
      { id: "linkedin2",label: "LinkedIn profile export or screenshot",                  category: "optional",  importance: 4,  description: "Profile showing your career trajectory, endorsements, and connections.",                                                                            tip: "A clean, well-structured LinkedIn with specific achievements is supportive evidence." },
      { id: "funding",  label: "Company registration or funding evidence",                category: "optional",  importance: 5,  description: "For founders: Companies House registration, funding term sheets, or investor correspondence.",                                                       tip: "Shows seriousness and scale of your entrepreneurial activity." },
    ]
  }
  return [
    { id: "ps",          label: "Personal Statement demonstrating emerging potential",   category: "mandatory", importance: 10, description: "Your argument for Exceptional Promise — why your trajectory points to future sector leadership.",                                                    tip: "Focus on trajectory and rate of growth, not current seniority. Show velocity." },
    { id: "cv",          label: "CV showing career trajectory and growth",               category: "mandatory", importance: 9,  description: "A CV that demonstrates rapid progression and increasing responsibility.",                                                                           tip: "Highlight promotions, expanded scope, and growing impact over time." },
    { id: "recs",        label: "3 Reference letters (minimum 2 from senior leaders)",   category: "mandatory", importance: 10, description: "Letters that attest to your emerging leadership and specific potential — not just your work history.",                                              tip: "At least 2 letters should come from people senior to you who can speak to your upward trajectory." },
    { id: "progression", label: "Evidence of rapid career progression",                  category: "strong",    importance: 8,  description: "Promotions, expanded remit, or accelerated responsibility within shorter-than-average timeframes.",                                                  tip: "Before/after role comparisons are powerful here." },
    { id: "projects",    label: "Specific project outcomes with measurable results",      category: "strong",    importance: 8,  description: "Documentation of projects you led or significantly contributed to, with quantified results.",                                                       tip: "Even partial metrics beat pure qualitative descriptions." },
    { id: "community",   label: "Tech community contributions",                          category: "strong",    importance: 7,  description: "Mentorship, accelerator involvement, community building, or ecosystem contributions.",                                                              tip: "Mentoring at bootcamps, judging hackathons, or angel investing all count." },
    { id: "press2",      label: "Any press or media mentions",                           category: "strong",    importance: 6,  description: "Even brief mentions in credible publications or podcasts strengthen the external recognition signal.",                                               tip: "Niche publications and podcast appearances are accepted." },
    { id: "salary2",     label: "Salary growth evidence",                                category: "strong",    importance: 6,  description: "Evidence that your compensation has grown faster than industry average — a signal of market recognition.",                                           tip: "A chart or timeline of compensation growth is a strong supporting document." },
    { id: "writing",     label: "Blog posts, articles, or technical writing",            category: "optional",  importance: 5,  description: "Published writing that demonstrates thought leadership in your space.",                                                                             tip: "Substack, LinkedIn articles, or a personal blog all count — especially with meaningful readership." },
    { id: "oss2",        label: "Open-source contributions",                             category: "optional",  importance: 5,  description: "Contributions to major projects or your own repositories with real usage.",                                                                        tip: "List specific PRs merged or projects you maintain with stars/download metrics." },
    { id: "events",      label: "Speaking at events (even local or online)",             category: "optional",  importance: 4,  description: "Any public speaking that demonstrates emerging recognition in your community.",                                                                     tip: "Meetup talks, online panels, and podcast appearances all count here." },
    { id: "accelerator", label: "Accelerator or cohort participation evidence",          category: "optional",  importance: 4,  description: "Selection into competitive programmes (YC, Entrepreneur First, etc.) is strong signal of recognized potential.",                                    tip: "Even a rejection email shows you applied to competitive programmes." },
  ]
}

// ── AI Insights ───────────────────────────────────────────────────────────────

async function generateInsights(
  answers:   Record<string, string>,
  score:     number,
  track:     string,
  subScores: Record<string, number>,
): Promise<string[]> {
  const roleMap:   Record<string, string> = { founder: "founder", engineer: "senior engineer", pm: "product manager", researcher: "researcher", designer: "designer", executive: "senior executive", other: "tech professional" }
  const sectorMap: Record<string, string> = { fintech: "fintech", ai_ml: "AI/ML", saas: "SaaS", consumer: "consumer tech", healthtech: "healthtech", climate: "climate tech", security: "cybersecurity", web3: "web3", other: "digital technology" }
  try {
    const r = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{
        role: "user",
        content: `You are a UK Global Talent Visa expert. Generate exactly 3 specific, personalized insights for this applicant. Each insight must be 1-2 sentences. Be highly specific — reference their industry, role, and actual gaps.

Profile: ${roleMap[answers.role] ?? "professional"} in ${sectorMap[answers.sector] ?? "technology"} | ${answers.yearsExp} years | Impact scale: ${answers.impactScale} | External validation: ${answers.externalValidation} | Publications: ${answers.hasPublications} | Founding exp: ${answers.foundingExp} | Rec letters: ${answers.recLetterStatus} | Biggest gap: ${answers.biggestGap} | Score: ${score}/100 | Track: ${track}

Sub-scores: Technical Leadership ${subScores.technicalLeadership}/100, Evidence Quality ${subScores.evidenceQuality}/100, External Recognition ${subScores.externalRecognition}/100, Independence ${subScores.independence}/100, Global Profile ${subScores.globalProfile}/100

Generate 3 insights covering: (1) their strongest quality, (2) their critical gap, (3) one specific actionable recommendation.

Return ONLY a JSON array: ["insight1", "insight2", "insight3"]`,
      }],
    })
    const text = r.content.find(b => b.type === "text")
    if (!text || text.type !== "text") return defaultInsights(answers, subScores)
    const match = text.text.match(/\[[\s\S]*\]/)
    if (!match) return defaultInsights(answers, subScores)
    const parsed = JSON.parse(match[0]) as string[]
    return Array.isArray(parsed) ? parsed.slice(0, 3) : defaultInsights(answers, subScores)
  } catch {
    return defaultInsights(answers, subScores)
  }
}

function defaultInsights(
  answers:   Record<string, string>,
  subScores: Record<string, number>,
): string[] {
  const insights: string[] = []
  const labels: Record<string, string> = {
    technicalLeadership: "technical leadership",
    evidenceQuality:     "evidence quality",
    externalRecognition: "external recognition",
    independence:        "independence and innovation",
    globalProfile:       "global profile",
  }
  const sorted = Object.entries(subScores).sort((a, b) => (b[1] as number) - (a[1] as number))
  const strongest = sorted[0]
  const weakest   = sorted[sorted.length - 1]
  insights.push(`Your ${labels[strongest[0]]} score is a genuine strength that evaluators will respond to positively.`)
  insights.push(`Your ${labels[weakest[0]]} is currently the weakest dimension and should be your primary focus before applying.`)
  if (answers.recLetterStatus === "none" || answers.recLetterStatus === "in_progress") {
    insights.push("Building strong recommendation letters should be your immediate priority — they are the single most common cause of otherwise strong applications being rejected.")
  } else if (answers.biggestGap === "narrative") {
    insights.push("Restructuring your personal statement as an argument (not a career history) would materially improve your chances.")
  } else {
    insights.push("A focused 60-day documentation sprint to fill your evidence gaps could meaningfully shift your readiness level.")
  }
  return insights
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { sessionId, answers } = await req.json() as { sessionId: string; answers: Record<string, string> }
    if (!sessionId || !answers) {
      return new Response(JSON.stringify({ error: "missing params" }), { status: 400 })
    }

    const { overallScore, subScores, readinessLevel, recommendedTrack, secondaryTrack, leadQuality } = computeScore(answers)
    const trackExplanation = buildTrackExplanation(answers, recommendedTrack)
    const documentChecklist = buildDocumentChecklist(recommendedTrack)
    const insights = await generateInsights(answers, overallScore, recommendedTrack, subScores)

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    const assessmentId = await convex.mutation(api.readiness.createAssessment, {
      sessionId,
      answers,
      overallScore,
      readinessLevel,
      recommendedTrack,
      secondaryTrack,
      trackExplanation,
      subScores,
      insights,
      documentChecklist,
      leadQuality,
    })

    return new Response(
      JSON.stringify({
        assessmentId,
        overallScore,
        readinessLevel,
        recommendedTrack,
        secondaryTrack,
        trackExplanation,
        subScores,
        insights,
        documentChecklist,
        leadQuality,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  } catch (err) {
    console.error("[readiness/score]", err)
    return new Response(JSON.stringify({ error: "scoring failed" }), { status: 500 })
  }
}
