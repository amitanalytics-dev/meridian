"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ── Types ─────────────────────────────────────────────────────────────────────

type ReadinessInput = {
  role: "founder" | "engineer" | "pm" | "researcher" | "designer" | "executive" | "other"
  yearsExp: "lt3" | "3to6" | "7to10" | "11to15" | "gt15"
  sector: "fintech" | "ai_ml" | "saas" | "consumer" | "healthtech" | "climate" | "security" | "web3" | "other"
  country: "india" | "uae" | "sea" | "europe" | "uk" | "us_ca" | "other"
  employment: "founder_ceo" | "startup_employee" | "bigtech_employee" | "consultant" | "academic" | "between"
  impactScale: "millions" | "100k_1m" | "10k_100k" | "medium" | "small"
  metricsAvailable: "specific" | "partial" | "qualitative" | "none"
  teamSize: "lt5" | "5to20" | "20to100" | "100plus" | "na"
  salaryLevel: "gt300k" | "150_300k" | "100_150k" | "60_100k" | "lt60k" | "prefer_not"
  foundingExp: "founded_funded" | "founded_boot" | "early_employee" | "no"
  externalValidation: "strong_rec" | "media_coverage" | "speaking" | "awards" | "none"
  hasPublications: "yes" | "no"
  hasAwards: "yes" | "no"
  hasOpenSource: "yes" | "no"
  hasContent: "yes" | "no"
  recLetterStatus: "strong_3plus" | "have_some" | "in_progress" | "none"
  personalStatementStatus: "drafted" | "in_progress" | "not_started"
  evidenceOrganized: "organized" | "partial" | "scattered" | "none"
  timeline: "now" | "3months" | "6months" | "exploring"
  biggestGap: "narrative" | "validation" | "evidence" | "visibility" | "unsure"
}

type ScoreResult = {
  assessmentId: string
  overallScore: number
  readinessLevel: "not_eligible" | "not_ready" | "semi_ready" | "fully_ready"
  recommendedTrack: "et" | "ep" | "neither"
  secondaryTrack?: "et" | "ep"
  trackExplanation: string
  subScores: {
    technicalLeadership: number
    evidenceQuality: number
    externalRecognition: number
    independence: number
    globalProfile: number
  }
  insights: string[]
  documentChecklist: {
    id: string
    label: string
    category: "mandatory" | "strong" | "optional"
    importance: number
    description: string
    tip: string
  }[]
  leadQuality: "hot" | "warm" | "cold"
}

type Phase = "intro" | "questions" | "transition" | "calculating" | "checklist" | "gate" | "submitting"

// ── Questions ─────────────────────────────────────────────────────────────────

interface QuestionDef {
  id: keyof ReadinessInput
  section: number
  text: string
  sub?: string
  options: { value: string; label: string; desc: string }[]
}

const QUESTIONS: QuestionDef[] = [
  // SECTION 0: About You
  {
    id: "role", section: 0,
    text: "What best describes your professional background?",
    options: [
      { value: "founder",   label: "Founder / Co-founder",            desc: "Started a company — any stage, any outcome" },
      { value: "engineer",  label: "Senior Engineer / Technical Lead", desc: "Built systems, products, or infrastructure at scale" },
      { value: "pm",        label: "Product Manager / Director of Product", desc: "Shaped product strategy and execution" },
      { value: "researcher",label: "Researcher / Academic / Author",   desc: "Research lab, academic, or technical publications" },
      { value: "executive", label: "Executive / C-Suite / Director",   desc: "VP, Director, or C-level leadership" },
      { value: "designer",  label: "Designer / Creative Director",     desc: "Product design or creative leadership in tech" },
      { value: "other",     label: "Other tech professional",          desc: "Something else in digital technology" },
    ],
  },
  {
    id: "yearsExp", section: 0,
    text: "How many years of tech industry experience do you have?",
    options: [
      { value: "lt3",   label: "Under 3 years", desc: "Just getting started" },
      { value: "3to6",  label: "3–6 years",     desc: "Building real depth" },
      { value: "7to10", label: "7–10 years",    desc: "Senior practitioner" },
      { value: "11to15",label: "11–15 years",   desc: "Deep domain expertise" },
      { value: "gt15",  label: "15+ years",     desc: "Seasoned leader" },
    ],
  },
  {
    id: "sector", section: 0,
    text: "Which sector best describes your primary work?",
    options: [
      { value: "fintech",   label: "Fintech / Financial Services",    desc: "Payments, lending, banking, wealth tech" },
      { value: "ai_ml",     label: "AI / ML / Data Science",          desc: "Machine learning, data, and AI products" },
      { value: "saas",      label: "SaaS / Enterprise Software",      desc: "B2B products and developer tools" },
      { value: "consumer",  label: "Consumer / E-Commerce",           desc: "Direct-to-consumer products and marketplaces" },
      { value: "healthtech",label: "HealthTech / BioTech",            desc: "Health, wellness, and life sciences" },
      { value: "climate",   label: "Climate / Clean Tech",            desc: "Sustainability and climate impact" },
      { value: "security",  label: "Cybersecurity / Infrastructure",  desc: "Security, DevOps, and cloud infrastructure" },
      { value: "web3",      label: "Web3 / Blockchain",               desc: "Decentralised applications and crypto" },
      { value: "other",     label: "Other technology",                desc: "Something else in digital tech" },
    ],
  },
  {
    id: "country", section: 0,
    text: "Where are you currently based?",
    options: [
      { value: "india",  label: "India",                    desc: "Bengaluru, Mumbai, Delhi, Hyderabad, etc." },
      { value: "uae",    label: "UAE / Middle East",        desc: "Dubai, Abu Dhabi, etc." },
      { value: "sea",    label: "Singapore / Southeast Asia", desc: "Singapore, Jakarta, Manila, KL, etc." },
      { value: "europe", label: "Europe (not UK)",          desc: "Germany, Netherlands, France, etc." },
      { value: "uk",     label: "United Kingdom",           desc: "Already in the UK" },
      { value: "us_ca",  label: "US / Canada",              desc: "North America" },
      { value: "other",  label: "Elsewhere",                desc: "Another country" },
    ],
  },
  {
    id: "employment", section: 0,
    text: "What is your current employment status?",
    options: [
      { value: "founder_ceo",       label: "Founder / CEO of my own company",       desc: "I run a company" },
      { value: "startup_employee",  label: "Employee at a startup (pre-Series D)",   desc: "Scaling with a growing company" },
      { value: "bigtech_employee",  label: "Employee at a large tech company",       desc: "FAANG, MNC, or established tech firm" },
      { value: "consultant",        label: "Consultant / Freelancer / Independent",  desc: "I work with multiple clients" },
      { value: "academic",          label: "Academic / Researcher",                  desc: "University or research lab" },
      { value: "between",           label: "Between roles / Transitioning",          desc: "Looking for my next opportunity" },
    ],
  },

  // SECTION 1: Work & Impact
  {
    id: "impactScale", section: 1,
    text: "At what scale has your work been used or felt?",
    options: [
      { value: "millions",   label: "Used by millions of people globally",        desc: "Mass-market product or platform" },
      { value: "100k_1m",    label: "100K–1M users or significant impact",        desc: "Large but focused impact" },
      { value: "10k_100k",   label: "10K–100K direct users or beneficiaries",     desc: "Meaningful, growing product" },
      { value: "medium",     label: "Medium scale — meaningful but contained",    desc: "Strong work at focused scale" },
      { value: "small",      label: "Small / early stage — still building",       desc: "Early product or pre-launch" },
    ],
  },
  {
    id: "metricsAvailable", section: 1,
    text: "Can you back your impact with specific numbers?",
    sub: "Revenue, user growth, %, ARR, team size — hard numbers.",
    options: [
      { value: "specific",    label: "Yes — specific metrics available",                      desc: "Numbers, percentages, scale" },
      { value: "partial",     label: "Partially — some numbers, some narrative",              desc: "Mixed evidence strength" },
      { value: "qualitative", label: "Mostly qualitative — strong story, limited numbers",   desc: "Compelling but not quantified" },
      { value: "none",        label: "Not really — responsibilities, not outcomes",           desc: "Job descriptions without results" },
    ],
  },
  {
    id: "teamSize", section: 1,
    text: "What is your largest organizational footprint?",
    options: [
      { value: "100plus", label: "Led or influenced 100+ people",              desc: "Large organizational impact" },
      { value: "20to100", label: "Influenced a team of 20–100",                desc: "Mid-level organizational impact" },
      { value: "5to20",   label: "Core team member of 5–20 people",           desc: "Tight team, clear contribution" },
      { value: "lt5",     label: "Individual contributor on a small team",     desc: "Direct personal output" },
      { value: "na",      label: "Independent / freelance — no team structure",desc: "Solo or contractor work" },
    ],
  },
  {
    id: "salaryLevel", section: 1,
    text: "What is your approximate annual income (USD)?",
    sub: "Used as a signal of market recognition — not a judgment on your work.",
    options: [
      { value: "gt300k",     label: "Over $300,000",       desc: "Top-tier senior compensation" },
      { value: "150_300k",   label: "$150,000–$300,000",   desc: "Senior professional level" },
      { value: "100_150k",   label: "$100,000–$150,000",   desc: "Mid-senior level" },
      { value: "60_100k",    label: "$60,000–$100,000",    desc: "Professional level" },
      { value: "lt60k",      label: "Under $60,000",       desc: "Earlier stage" },
      { value: "prefer_not", label: "Prefer not to say",   desc: "Skip this question" },
    ],
  },
  {
    id: "foundingExp", section: 1,
    text: "What is your founding / entrepreneurial experience?",
    options: [
      { value: "founded_funded", label: "Founded a company that raised external funding", desc: "VC, angels, or grants" },
      { value: "founded_boot",   label: "Founded a bootstrapped company",                 desc: "Self-funded, operating or exited" },
      { value: "early_employee", label: "Early employee or core founding team",           desc: "Employee #1–20 of a startup" },
      { value: "no",             label: "No founding experience — primarily employed",    desc: "Career in established organizations" },
    ],
  },

  // SECTION 2: Your Evidence
  {
    id: "externalValidation", section: 2,
    text: "What is your strongest form of external validation?",
    sub: "Pick your single strongest proof point.",
    options: [
      { value: "strong_rec",    label: "Strong recommendation letters from recognized leaders", desc: "Senior endorsement from credible figures" },
      { value: "media_coverage",label: "Press / media coverage",                                desc: "TechCrunch, Forbes, The Times, industry press" },
      { value: "speaking",      label: "Conference speaking or panel invitations",              desc: "Industry events, not internal company talks" },
      { value: "awards",        label: "Industry awards or formal recognition",                 desc: "Sector awards, accelerator selection, lists" },
      { value: "none",          label: "None of the above yet",                                 desc: "My work has been primarily internal" },
    ],
  },
  {
    id: "hasPublications", section: 2,
    text: "Do you have published research, patents, or technical writing?",
    options: [
      { value: "yes", label: "Yes — papers, patents, or formal publications", desc: "Academic or formal research output" },
      { value: "no",  label: "No formal publications or patents",             desc: "Not published in formal channels" },
    ],
  },
  {
    id: "hasAwards", section: 2,
    text: "Have you received industry awards or formal recognition?",
    options: [
      { value: "yes", label: "Yes — I've received industry recognition", desc: "Awards, formal lists, accelerator selections" },
      { value: "no",  label: "No formal awards yet",                     desc: "Recognition has been internal or informal" },
    ],
  },
  {
    id: "hasOpenSource", section: 2,
    text: "Do you have meaningful open-source work or community contributions?",
    options: [
      { value: "yes", label: "Yes — projects with real usage or significant contributions", desc: "Open-source repos, major project contributions" },
      { value: "no",  label: "No significant open-source or community work",               desc: "My work has been proprietary or internal" },
    ],
  },
  {
    id: "hasContent", section: 2,
    text: "Do you create regular content, writing, or public thought leadership?",
    options: [
      { value: "yes", label: "Yes — published writing or speaking with real audience", desc: "Blog, newsletter, LinkedIn articles, podcast appearances" },
      { value: "no",  label: "No regular public content",                               desc: "I haven't built a public presence through content" },
    ],
  },

  // SECTION 3: Application Readiness
  {
    id: "recLetterStatus", section: 3,
    text: "Where are you with recommendation letters?",
    options: [
      { value: "strong_3plus", label: "I have 3+ strong letters from recognized tech leaders", desc: "Letters that demonstrate impact, not just relationships" },
      { value: "have_some",    label: "I have some letters but they need strengthening",        desc: "Existing letters that could be more specific" },
      { value: "in_progress",  label: "I'm working on getting letters",                         desc: "Building the relationships and approach" },
      { value: "none",         label: "I don't have recommendation letters yet",                desc: "Starting from scratch here" },
    ],
  },
  {
    id: "personalStatementStatus", section: 3,
    text: "Where are you with your personal statement?",
    options: [
      { value: "drafted",      label: "Drafted — needs refinement but structure is there", desc: "A working draft exists" },
      { value: "in_progress",  label: "In progress — partial or unstructured notes",       desc: "Started but not complete" },
      { value: "not_started",  label: "Haven't started yet",                               desc: "Clean slate" },
    ],
  },
  {
    id: "evidenceOrganized", section: 3,
    text: "How organized is your evidence portfolio?",
    options: [
      { value: "organized", label: "Everything is compiled and well-organized",         desc: "Documents ready to review" },
      { value: "partial",   label: "Most documents exist but need structuring",         desc: "Gathered but not polished" },
      { value: "scattered", label: "Documents are scattered and need work",             desc: "Hard to find and assemble" },
      { value: "none",      label: "Haven't started gathering evidence",                desc: "Starting from zero" },
    ],
  },
  {
    id: "timeline", section: 3,
    text: "What is your target application timeline?",
    options: [
      { value: "now",       label: "I want to apply in the next 1–3 months", desc: "Active and ready to move" },
      { value: "3months",   label: "Within the next 3–6 months",             desc: "Building toward a specific date" },
      { value: "6months",   label: "Within the next 6–12 months",            desc: "Planning ahead" },
      { value: "exploring", label: "Just exploring — no fixed timeline",     desc: "Curious about eligibility" },
    ],
  },
  {
    id: "biggestGap", section: 3,
    text: "What do you think is your biggest gap right now?",
    sub: "Be honest — this becomes the focus of your recommendations.",
    options: [
      { value: "narrative",  label: "My narrative doesn't clearly position my uniqueness",  desc: "Hard to tell my story compellingly" },
      { value: "validation", label: "I lack external validation (press, speaking, recognition)", desc: "My impact is known internally but not publicly" },
      { value: "evidence",   label: "My evidence isn't organized or compelling enough",     desc: "I know I've done it — hard to prove it" },
      { value: "visibility", label: "I'm not visible enough outside my immediate network",  desc: "Nobody outside my team knows my name" },
      { value: "unsure",     label: "I'm not sure — that's why I'm here",                   desc: "Need expert eyes to diagnose" },
    ],
  },
]

const SECTIONS = [
  { title: "About You",           desc: "Tell us who you are and where you're based." },
  { title: "Your Work & Impact",  desc: "Help us understand the scale and depth of your contribution." },
  { title: "Your Evidence",       desc: "Let's assess the proof points you have available." },
  { title: "Your Readiness",      desc: "Finally — where are you in the application process?" },
]

const TOTAL = QUESTIONS.length

// ── Helpers ───────────────────────────────────────────────────────────────────

function readinessLabel(level: ScoreResult["readinessLevel"]) {
  return {
    fully_ready:  "Fully Ready",
    semi_ready:   "Semi-Ready",
    not_ready:    "Not Ready Yet",
    not_eligible: "Build More First",
  }[level] ?? level
}

function readinessColor(level: ScoreResult["readinessLevel"]) {
  return {
    fully_ready:  "#06B6D4",
    semi_ready:   "#7C3AED",
    not_ready:    "#D97706",
    not_eligible: "#94A3B8",
  }[level] ?? "#94A3B8"
}

function trackLabel(track: "et" | "ep" | "neither") {
  return { et: "Exceptional Talent", ep: "Exceptional Promise", neither: "Needs Preparation" }[track]
}

// ── Slide variants ────────────────────────────────────────────────────────────

const slideVariants = {
  enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 48 : -48 }),
  center: { opacity: 1, x: 0 },
  exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -48 : 48 }),
}

// ── OptionCard ────────────────────────────────────────────────────────────────

function OptionCard({
  option,
  selected,
  onSelect,
  wide = false,
}: {
  option: { value: string; label: string; desc: string }
  selected: boolean
  onSelect: () => void
  wide?: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`${wide ? "w-full" : "w-full"} text-left p-5 rounded-2xl border transition-all duration-200 ${
        selected
          ? "border-brand bg-brand/10 shadow-[0_0_24px_rgba(124,58,237,0.2)]"
          : "border-void-border bg-void-surface hover:border-brand/40 hover:bg-brand/5"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            selected ? "border-brand bg-brand" : "border-platinum-faint"
          }`}
        >
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 rounded-full bg-white"
            />
          )}
        </div>
        <div>
          <p className={`font-medium text-sm leading-snug ${selected ? "text-platinum" : "text-platinum-dim"}`}>
            {option.label}
          </p>
          <p className="text-xs text-platinum-faint mt-1 leading-relaxed">{option.desc}</p>
        </div>
      </div>
    </motion.button>
  )
}

// ── Shared header ─────────────────────────────────────────────────────────────

function AssessmentHeader({ right }: { right: React.ReactNode }) {
  return (
    <div className="border-b border-void-border px-6 py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
          <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">
            Global Talent Visa
          </span>
        </Link>
        <span className="text-xs font-mono text-platinum-faint">{right}</span>
      </div>
    </div>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-0.5 bg-void-border">
      <motion.div
        className="h-full bg-gradient-to-r from-brand via-data to-gold"
        initial={{ width: "0%" }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReadinessPage() {
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>("intro")
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<ReadinessInput>>({})
  const [direction, setDirection] = useState(1)
  const [pendingSection, setPendingSection] = useState(0)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [checkedDocs, setCheckedDocs] = useState<Set<string>>(new Set())
  const [leadData, setLeadData] = useState({ name: "", email: "", phone: "", linkedinUrl: "" })

  const [sessionId] = useState<string>(() => {
    if (typeof window === "undefined") return crypto.randomUUID()
    let id = localStorage.getItem("meridian.readiness.session")
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem("meridian.readiness.session", id)
    }
    return id
  })

  // ── Helpers ──────────────────────────────────────────────────────────────

  const q = QUESTIONS[step]
  const currentSection = q?.section ?? 0
  const selected = answers[q?.id]

  function selectAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: value as never }))
  }

  function goBack() {
    if (step === 0) return
    setDirection(-1)
    setStep(step - 1)
  }

  function goNext() {
    if (!answers[q.id as keyof ReadinessInput]) return

    if (step < TOTAL - 1) {
      const nextStep = step + 1
      const nextQ = QUESTIONS[nextStep]
      if (nextQ.section !== q.section) {
        setPendingSection(nextQ.section)
        setDirection(1)
        setPhase("transition")
      } else {
        setDirection(1)
        setStep(nextStep)
      }
    } else {
      callScoreAPI()
    }
  }

  function continueFromTransition() {
    setPhase("questions")
    setDirection(1)
    setStep(QUESTIONS.findIndex((qu) => qu.section === pendingSection))
  }

  async function callScoreAPI() {
    setPhase("calculating")
    try {
      const res = await fetch("/api/readiness/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      })
      const data = (await res.json()) as ScoreResult
      setScoreResult(data)
      setPhase("checklist")
    } catch {
      setPhase("checklist")
    }
  }

  async function handleLeadSubmit() {
    if (!leadData.name || !leadData.email) return
    setPhase("submitting")
    try {
      if (scoreResult?.assessmentId) {
        await fetch("/api/readiness/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId: scoreResult.assessmentId, ...leadData }),
        })
      }
      if (scoreResult) {
        sessionStorage.setItem("readiness_result", JSON.stringify(scoreResult))
      }
      router.push(
        `/readiness/result${scoreResult?.assessmentId ? "?id=" + scoreResult.assessmentId : ""}`,
      )
    } catch {
      router.push("/readiness/result")
    }
  }

  function toggleDoc(id: string) {
    setCheckedDocs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Phase: intro ─────────────────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-void flex flex-col relative overflow-hidden">
        {/* Orbs */}
        <div className="orb-violet absolute -top-32 -left-32 w-[500px] h-[500px] opacity-50 pointer-events-none" />
        <div className="orb-cyan absolute -bottom-32 -right-32 w-[400px] h-[400px] opacity-40 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 border-b border-void-border px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">
                Global Talent Visa
              </span>
            </Link>
            <span className="text-xs font-mono text-platinum-faint">Free · ~5 min</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-16 h-16 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center mx-auto mb-8"
            >
              <span className="text-brand text-2xl">✦</span>
            </motion.div>

            <h1 className="font-display text-4xl md:text-5xl text-platinum mb-5 leading-tight">
              Global Talent Visa{" "}
              <span className="text-gradient-brand">Readiness Score</span>
            </h1>

            <p className="text-platinum-dim leading-relaxed mb-8 text-base">
              Answer 20 questions in under 5 minutes. Get an AI-powered readiness
              score, track recommendation, and personalized document checklist.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mb-10">
              {["20 questions", "AI-scored", "Free"].map((stat) => (
                <div key={stat} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand inline-block" />
                  <span className="font-mono text-xs text-platinum-dim">{stat}</span>
                </div>
              ))}
            </div>

            <motion.button
              onClick={() => {
                setPhase("questions")
                setStep(0)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary px-10 py-4 rounded-xl text-white font-medium text-base w-full sm:w-auto"
            >
              Start Free Assessment →
            </motion.button>

            <p className="text-xs text-platinum-faint mt-5 leading-relaxed">
              Free assessment · ~5 minutes · Not immigration legal advice
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── Phase: transition ────────────────────────────────────────────────────

  if (phase === "transition") {
    const sec = SECTIONS[pendingSection]
    return (
      <div className="min-h-screen bg-void flex flex-col">
        <AssessmentHeader right={`Section ${pendingSection + 1} of 4`} />
        <ProgressBar value={((QUESTIONS.findIndex((qu) => qu.section === pendingSection)) / TOTAL) * 100} />

        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md text-center"
          >
            <p className="font-mono text-xs text-brand mb-4 tracking-wider uppercase">
              Section {pendingSection + 1} of 4
            </p>

            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-brand text-3xl mb-6 inline-block"
            >
              ✦
            </motion.div>

            <h2 className="font-display text-4xl md:text-5xl text-platinum mb-4 leading-tight">
              {sec.title}
            </h2>
            <p className="text-platinum-dim leading-relaxed mb-10">{sec.desc}</p>

            <motion.button
              onClick={continueFromTransition}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary px-10 py-3.5 rounded-xl text-white font-medium text-sm"
            >
              Continue →
            </motion.button>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── Phase: calculating ───────────────────────────────────────────────────

  if (phase === "calculating") {
    return (
      <div className="min-h-screen bg-void flex flex-col">
        <AssessmentHeader right="Analyzing..." />
        <ProgressBar value={100} />

        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-brand/20 border-t-brand rounded-full mx-auto mb-6"
            />
            <h2 className="font-display text-2xl text-platinum mb-3">
              Analyzing your profile across 5 dimensions...
            </h2>
            <p className="text-platinum-dim text-sm leading-relaxed max-w-sm mx-auto">
              AI is assessing your evidence, track fit, and documentation readiness.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── Phase: submitting ────────────────────────────────────────────────────

  if (phase === "submitting") {
    return (
      <div className="min-h-screen bg-void flex flex-col">
        <AssessmentHeader right="Almost done..." />
        <ProgressBar value={100} />

        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-brand/20 border-t-brand rounded-full mx-auto mb-6"
            />
            <h2 className="font-display text-2xl text-platinum mb-3">
              Generating your personalized report...
            </h2>
            <p className="text-platinum-dim text-sm">
              This will only take a moment.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── Phase: checklist ─────────────────────────────────────────────────────

  if (phase === "checklist") {
    const track = scoreResult?.recommendedTrack ?? "neither"
    const trackName = trackLabel(track)
    const level = scoreResult?.readinessLevel ?? "not_ready"
    const levelColor = readinessColor(level)
    const levelText = readinessLabel(level)
    const score = scoreResult?.overallScore ?? 0

    const mandatory = scoreResult?.documentChecklist?.filter((d) => d.category === "mandatory") ?? []
    const strong    = scoreResult?.documentChecklist?.filter((d) => d.category === "strong")    ?? []
    const optional  = scoreResult?.documentChecklist?.filter((d) => d.category === "optional")  ?? []

    return (
      <div className="min-h-screen bg-void flex flex-col">
        <AssessmentHeader right="Document Checklist" />
        <ProgressBar value={100} />

        <div className="flex-1 overflow-y-auto px-6 py-10">
          <div className="max-w-2xl mx-auto">

            {/* Score summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="card-border p-6 mb-8"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-mono text-xs text-platinum-faint mb-1 uppercase tracking-wider">
                    Your Readiness Score
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-5xl font-bold text-platinum">{score}</span>
                    <span className="text-platinum-dim font-mono text-lg">/ 100</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: levelColor }}
                    />
                    <span className="font-mono text-xs text-platinum-dim">{levelText}</span>
                  </div>
                </div>

                {track !== "neither" && (
                  <div className="text-right">
                    <p className="font-mono text-xs text-platinum-faint mb-1 uppercase tracking-wider">
                      Recommended Track
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand/10 border border-brand/25">
                      <span className="text-brand text-sm font-mono font-medium uppercase tracking-wide">
                        {track.toUpperCase()}
                      </span>
                      <span className="text-platinum-dim text-xs">— {trackName}</span>
                    </div>
                  </div>
                )}
              </div>

              {scoreResult?.trackExplanation && (
                <p className="text-platinum-dim text-sm leading-relaxed mt-4 pt-4 border-t border-void-border">
                  {scoreResult.trackExplanation}
                </p>
              )}
            </motion.div>

            {/* Checklist title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-6"
            >
              <h2 className="font-display text-2xl text-platinum mb-1">
                Your Document Checklist
                {track !== "neither" && (
                  <span className="text-brand"> for {track.toUpperCase()} Track</span>
                )}
              </h2>
              <p className="text-platinum-dim text-sm">
                Mark what you already have. Your advisor will focus on what's missing.
              </p>
            </motion.div>

            {/* Checklist sections */}
            {[
              { items: mandatory, label: "Mandatory Documents", dot: "#EF4444", bg: "bg-red-50 border-red-100" },
              { items: strong,    label: "Strong Supporting Evidence", dot: "#D97706", bg: "bg-amber-50 border-amber-100" },
              { items: optional,  label: "Optional but Valuable", dot: "#94A3B8", bg: "bg-void-surface border-void-border" },
            ].map(({ items, label, dot, bg }) =>
              items.length > 0 ? (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="mb-8"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
                    <h3 className="font-mono text-xs uppercase tracking-wider text-platinum-dim">{label}</h3>
                  </div>
                  <div className="space-y-3">
                    {items.map((doc) => {
                      const checked = checkedDocs.has(doc.id)
                      return (
                        <motion.div
                          key={doc.id}
                          whileHover={{ scale: 1.005 }}
                          className={`rounded-xl border p-4 transition-all duration-200 cursor-pointer ${
                            checked ? "opacity-60" : ""
                          } ${bg}`}
                          onClick={() => toggleDoc(doc.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                checked
                                  ? "border-brand bg-brand"
                                  : "border-platinum-faint bg-white"
                              }`}
                            >
                              {checked && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`font-medium text-sm ${checked ? "line-through text-platinum-faint" : "text-platinum"}`}>
                                  {doc.label}
                                </p>
                                <span
                                  className="font-mono text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                                  style={{ background: dot + "20", color: dot }}
                                >
                                  {doc.importance}/10
                                </span>
                              </div>
                              <p className="text-xs text-platinum-faint mt-1 leading-relaxed">{doc.description}</p>
                              {doc.tip && (
                                <p className="text-xs text-data mt-1.5 leading-relaxed italic">{doc.tip}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              ) : null,
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="pt-4 pb-8"
            >
              <motion.button
                onClick={() => setPhase("gate")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full py-4 rounded-xl text-white font-medium text-base"
              >
                Continue to Get Your Full Report →
              </motion.button>
              <p className="text-xs text-platinum-faint text-center mt-3">
                Free assessment · Not immigration legal advice
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // ── Phase: gate ──────────────────────────────────────────────────────────

  if (phase === "gate") {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadData.email)
    const canSubmit = leadData.name.trim().length > 0 && emailValid

    return (
      <div className="min-h-screen bg-void flex flex-col">
        <AssessmentHeader right="Almost there" />
        <ProgressBar value={100} />

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center mx-auto mb-6">
              <span className="text-brand text-xl">✦</span>
            </div>

            <h1 className="font-display text-3xl text-platinum mb-3 text-center">
              Your readiness report is ready.
            </h1>
            <p className="text-platinum-dim leading-relaxed mb-8 text-center text-sm">
              Enter your details to receive your AI readiness report and document strategy.
            </p>

            <div className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block font-mono text-xs text-platinum-dim mb-1.5 uppercase tracking-wide">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={leadData.name}
                  onChange={(e) => setLeadData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Arjun Mehta"
                  className="input-field"
                  autoFocus
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-mono text-xs text-platinum-dim mb-1.5 uppercase tracking-wide">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={leadData.email}
                  onChange={(e) => setLeadData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="arjun@yourcompany.com"
                  className="input-field"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block font-mono text-xs text-platinum-dim mb-1.5 uppercase tracking-wide">
                  Phone Number{" "}
                  <span className="text-platinum-faint normal-case font-sans tracking-normal">(recommended)</span>
                </label>
                <input
                  type="tel"
                  value={leadData.phone}
                  onChange={(e) => setLeadData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block font-mono text-xs text-platinum-dim mb-1.5 uppercase tracking-wide">
                  LinkedIn URL{" "}
                  <span className="text-platinum-faint normal-case font-sans tracking-normal">(recommended)</span>
                </label>
                <input
                  type="url"
                  value={leadData.linkedinUrl}
                  onChange={(e) => setLeadData((p) => ({ ...p, linkedinUrl: e.target.value }))}
                  placeholder="linkedin.com/in/arjunmehta"
                  className="input-field"
                />
              </div>

              {/* Submit */}
              <motion.button
                onClick={handleLeadSubmit}
                disabled={!canSubmit}
                whileHover={canSubmit ? { scale: 1.02 } : {}}
                whileTap={canSubmit ? { scale: 0.98 } : {}}
                className={`btn-primary w-full py-4 rounded-xl text-white font-medium text-base transition-all mt-2 ${
                  !canSubmit ? "opacity-40 cursor-not-allowed" : ""
                }`}
              >
                See my full score →
              </motion.button>
            </div>

            <p className="text-xs text-platinum-faint text-center mt-4 leading-relaxed">
              Amit may personally review high-potential profiles. No spam.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── Phase: questions ─────────────────────────────────────────────────────

  const isBinary = q.options.length === 2
  const progressValue = ((step + 1) / TOTAL) * 100

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <AssessmentHeader right={`Step ${step + 1} of ${TOTAL}`} />
      <ProgressBar value={progressValue} />

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Section + step badge */}
              <div className="flex items-center gap-3 mb-8">
                <span className="font-mono text-xs text-brand">
                  Q{String(step + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-xs text-platinum-faint">
                  · SECTION {currentSection + 1} OF 4 — {SECTIONS[currentSection].title.toUpperCase()}
                </span>
                <div className="flex-1 flex gap-1 justify-end">
                  {QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className="h-0.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === step ? "20px" : "6px",
                        background: i <= step ? "#7C3AED" : "#E2E8F0",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Question */}
              <h1 className="font-display text-3xl md:text-4xl text-platinum mb-2 leading-tight">
                {q.text}
              </h1>
              {q.sub && (
                <p className="text-platinum-dim text-sm mb-8 leading-relaxed">{q.sub}</p>
              )}
              {!q.sub && <div className="mb-8" />}

              {/* Options */}
              {isBinary ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      option={opt}
                      selected={selected === opt.value}
                      onSelect={() => selectAnswer(opt.value)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {q.options.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      option={opt}
                      selected={selected === opt.value}
                      onSelect={() => selectAnswer(opt.value)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={goBack}
              disabled={step === 0}
              className="text-sm text-platinum-dim hover:text-platinum transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              ← Back
            </button>
            <motion.button
              onClick={goNext}
              disabled={!selected}
              whileHover={selected ? { scale: 1.02 } : {}}
              whileTap={selected ? { scale: 0.98 } : {}}
              className={`btn-primary px-8 py-3 rounded-xl text-sm font-medium text-white transition-all ${
                !selected ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              {step === TOTAL - 1 ? "Calculate my score →" : "Continue →"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-void-border text-center">
        <p className="text-xs text-platinum-faint">
          Free assessment · ~5 minutes · Not immigration legal advice
        </p>
      </div>
    </div>
  )
}
