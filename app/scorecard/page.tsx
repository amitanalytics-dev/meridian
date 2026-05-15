"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { computeFCI, type FCIInput } from "@/lib/fci"

// ── Question type ─────────────────────────────────────────────────────────────
interface Question {
  id: keyof FCIInput
  text: string
  sub?: string
  options: { value: string; label: string; desc?: string }[]
}

// ── 12 questions ──────────────────────────────────────────────────────────────
const QUESTIONS: Question[] = [
  {
    id: "path",
    text: "What best describes your professional path?",
    options: [
      { value: "founder",    label: "Founder",          desc: "Started a company (any stage, any outcome)" },
      { value: "operator",   label: "Senior Operator",  desc: "Executive, director, or VP level" },
      { value: "builder",    label: "Product / Engineer Builder", desc: "Built products, tools, or systems" },
      { value: "researcher", label: "Researcher",        desc: "Academic, research lab, or technical author" },
    ],
  },
  {
    id: "experience",
    text: "How long have you been building in the technology ecosystem?",
    options: [
      { value: "lt3",    label: "Under 3 years",  desc: "Early in career" },
      { value: "3to7",   label: "3–7 years",      desc: "Building real depth" },
      { value: "7to12",  label: "7–12 years",     desc: "Senior practitioner" },
      { value: "gt12",   label: "12+ years",      desc: "Deep expertise" },
    ],
  },
  {
    id: "scale",
    text: "What was the scale of your most significant role?",
    options: [
      { value: "small",    label: "Team of 2–15, early stage",         desc: "Pre-product or early product stage" },
      { value: "medium",   label: "Organisation of 50–500",            desc: "Growth stage or established SME" },
      { value: "large",    label: "10,000+ direct users or customers", desc: "Market-facing product impact" },
      { value: "defining", label: "Sector-defining impact",            desc: "Industry-wide recognition or influence" },
    ],
  },
  {
    id: "evidence",
    text: "Can you point to quantified outcomes in your work?",
    sub: "Revenue, user growth, percentage improvements, ARR, MAU — specific numbers.",
    options: [
      { value: "specific",    label: "Yes — specific metrics",           desc: "Numbers, percentages, scale" },
      { value: "qualitative", label: "Yes — mostly qualitative",         desc: "Strong descriptions, no numbers" },
      { value: "partial",     label: "Partially — some numbers, some narrative", desc: "Mixed evidence" },
      { value: "none",        label: "Not really — mostly responsibilities", desc: "Role descriptions without outcomes" },
    ],
  },
  {
    id: "narrative",
    text: "How would you describe the clarity of your career story?",
    sub: "Can an outsider understand who you are and what you've built in 90 seconds?",
    options: [
      { value: "clear",          label: "Clear arc, outcome-based",    desc: "Strong career progression narrative" },
      { value: "understandable", label: "Understandable but unstructured", desc: "Clear enough but not optimised" },
      { value: "disconnected",   label: "Multiple roles, some disconnected", desc: "Hard to see the throughline" },
      { value: "unclear",        label: "Hard to summarise in a paragraph", desc: "Fragmented identity signals" },
    ],
  },
  {
    id: "validation",
    text: "What external validation do you currently have?",
    options: [
      { value: "strong_rec", label: "Strong recommendations from industry leaders", desc: "Specific, relationship-evidencing letters" },
      { value: "media",      label: "Media mentions or public recognitions",         desc: "Press, awards, citations" },
      { value: "speaking",   label: "Speaking at credible events",                  desc: "Industry conferences, podcasts, panels" },
      { value: "none",       label: "None or minimal third-party proof",            desc: "Mostly self-described work" },
    ],
  },
  {
    id: "independence",
    text: "Have you built anything independently?",
    options: [
      { value: "founded",       label: "Founded a company",                 desc: "Any outcome, any stage counts" },
      { value: "built_product", label: "Built a product or tool outside work", desc: "Side project, SaaS, community" },
      { value: "open_source",   label: "Open-source contribution",           desc: "Maintained repos with real usage" },
      { value: "none",          label: "Not yet — primarily employed",        desc: "All work inside organisations" },
    ],
  },
  {
    id: "visibility",
    text: "How visible are you outside your immediate network?",
    options: [
      { value: "writing",      label: "Published writing or regular content", desc: "Blog, Substack, LinkedIn articles" },
      { value: "speaking_pub", label: "Speaking presence",                    desc: "Recorded, public, not internal" },
      { value: "community",    label: "Community building or contribution",   desc: "Organiser, mentor, ecosystem builder" },
      { value: "minimal",      label: "Minimal public presence",              desc: "Known mainly inside my company" },
    ],
  },
  {
    id: "impact",
    text: "How would your closest collaborators describe your impact?",
    options: [
      { value: "changed_direction",  label: "Changed the direction of the organisation", desc: "Strategic, decisive influence" },
      { value: "built_lasting",      label: "Built something that outlasted my tenure",   desc: "Lasting product, system, or team" },
      { value: "led_initiatives",    label: "Led major initiatives with measurable outcomes", desc: "Clear ownership and delivery" },
      { value: "strong_contributor", label: "Strong contributor, good execution",           desc: "Reliable, valued team member" },
    ],
  },
  {
    id: "goal",
    text: "What is your primary global recognition goal?",
    options: [
      { value: "global_talent", label: "UK Global Talent or equivalent recognition", desc: "Formal global talent designation" },
      { value: "investor",      label: "International investor or board attention",   desc: "Funding or advisory relationships" },
      { value: "speaking",      label: "Global speaking or advisory roles",           desc: "Thought leadership positioning" },
      { value: "profile",       label: "General global profile building",             desc: "Broader international visibility" },
    ],
  },
  {
    id: "gap",
    text: "What is your biggest credibility gap — honestly?",
    sub: "This becomes the primary focus of your advisory path.",
    options: [
      { value: "narrative",   label: "Narrative clarity",    desc: "Hard to tell my story compellingly" },
      { value: "validation",  label: "External validation",  desc: "Limited third-party proof of my work" },
      { value: "evidence",    label: "Evidence depth",       desc: "I know I've done it — hard to prove it" },
      { value: "visibility",  label: "Visibility",           desc: "Not known outside my immediate network" },
    ],
  },
  {
    id: "timeline",
    text: "What is your timeline for taking action?",
    options: [
      { value: "now",       label: "Active right now",    desc: "Ready to start immediately" },
      { value: "3months",   label: "Within 3 months",    desc: "Building towards it" },
      { value: "6months",   label: "Within 6 months",    desc: "Planning stage" },
      { value: "exploring", label: "Exploring options",  desc: "No fixed timeline yet" },
    ],
  },
]

// ── Option card ───────────────────────────────────────────────────────────────
function OptionCard({
  option, selected, onSelect,
}: {
  option: Question["options"][0]
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
        selected
          ? "border-brand bg-brand/10 shadow-[0_0_24px_rgba(124,58,237,0.2)]"
          : "border-void-border bg-void-surface hover:border-brand/40 hover:bg-brand/5"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          selected ? "border-brand bg-brand" : "border-platinum-faint"
        }`}>
          {selected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-white" />
          )}
        </div>
        <div>
          <p className={`font-medium text-sm leading-snug ${selected ? "text-platinum" : "text-platinum-dim"}`}>
            {option.label}
          </p>
          {option.desc && (
            <p className="text-xs text-platinum-faint mt-1 leading-relaxed">{option.desc}</p>
          )}
        </div>
      </div>
    </motion.button>
  )
}

// ── Email gate ────────────────────────────────────────────────────────────────
function EmailGate({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    onSubmit(email)
  }

  return (
    <div className="min-h-screen bg-void flex flex-col">
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
          </Link>
          <span className="text-xs font-mono text-platinum-faint">Almost there</span>
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-brand via-data to-gold" />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center mx-auto mb-6">
            <span className="text-brand text-xl">✦</span>
          </div>
          <h1 className="font-display text-3xl text-platinum mb-3">Your score is ready.</h1>
          <p className="text-platinum-dim leading-relaxed mb-8">
            Enter your email to see your FCI score and where your case stands.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field text-center text-base"
              autoFocus
              required
            />
            <motion.button
              type="submit"
              disabled={!valid || loading}
              whileHover={valid && !loading ? { scale: 1.02 } : {}}
              whileTap={valid && !loading ? { scale: 0.98 } : {}}
              className={`btn-primary w-full py-4 rounded-xl text-white font-medium text-base transition-all ${
                !valid || loading ? "opacity-40 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Calculating...
                </span>
              ) : (
                "See my score →"
              )}
            </motion.button>
          </form>
          <p className="text-xs text-platinum-faint mt-4 leading-relaxed">
            No spam. Amit may follow up with one specific observation.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// ── Main scorecard ────────────────────────────────────────────────────────────
export default function ScorecardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<FCIInput>>({})
  const [direction, setDirection] = useState(1)
  const [showEmailGate, setShowEmailGate] = useState(false)

  const q = QUESTIONS[step]
  const total = QUESTIONS.length
  const selected = answers[q?.id] as string | undefined

  function selectAnswer(value: string) {
    setAnswers((prev) => ({ ...prev, [q.id]: value as never }))
  }

  function goNext() {
    if (!selected) return
    if (step < total - 1) {
      setDirection(1)
      setStep(step + 1)
    } else {
      setShowEmailGate(true)
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1)
      setStep(step - 1)
    }
  }

  function handleEmailSubmit(email: string) {
    const result = computeFCI(answers as FCIInput)
    const encoded = encodeURIComponent(JSON.stringify(result))
    const encodedEmail = encodeURIComponent(email)
    router.push(`/scorecard/result?data=${encoded}&email=${encodedEmail}`)
  }

  if (showEmailGate) {
    return <EmailGate onSubmit={handleEmailSubmit} />
  }

  const variants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  }

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Header */}
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
          </Link>
          <span className="text-xs font-mono text-platinum-faint">
            {step + 1} / {total}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-void-border">
        <motion.div
          className="h-full bg-gradient-to-r from-brand via-data to-gold"
          initial={{ width: "0%" }}
          animate={{ width: `${((step + 1) / total) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step badge */}
              <div className="flex items-center gap-3 mb-8">
                <span className="font-mono text-xs text-brand">
                  Q{String(step + 1).padStart(2, "0")}
                </span>
                <div className="flex gap-1">
                  {QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className="h-0.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === step ? "24px" : "8px",
                        background: i <= step ? "#7C3AED" : "#232348",
                      }}
                    />
                  ))}
                </div>
              </div>

              <h1 className="font-display text-3xl md:text-4xl text-platinum mb-2 leading-tight">
                {q.text}
              </h1>
              {q.sub && (
                <p className="text-platinum-dim text-sm mb-8 leading-relaxed">{q.sub}</p>
              )}
              {!q.sub && <div className="mb-8" />}

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
              {step === total - 1 ? "Calculate my score →" : "Continue →"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 py-4 border-t border-void-border text-center">
        <p className="text-xs text-platinum-faint">
          Free assessment · 4 minutes · Not an immigration service
        </p>
      </div>
    </div>
  )
}
