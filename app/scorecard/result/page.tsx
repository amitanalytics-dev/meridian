"use client"

import { motion, useInView } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useRef, Suspense } from "react"
import Link from "next/link"
import type { FCIOutput, SubScores } from "@/lib/fci"

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 200 }: { score: number; size?: number }) {
  const r = size / 2 - 16
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const ref = useRef(null)
  const visible = useInView(ref, { once: true })
  return (
    <div ref={ref} style={{ width: size, height: size }} className="relative">
      <svg width={size} height={size} className="-rotate-90" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#7C3AED" />
            <stop offset="50%"  stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1E1E40" strokeWidth="12" />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="url(#rg2)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={visible ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          filter="url(#glow2)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="font-mono text-5xl font-bold text-platinum"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={visible ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.9, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          {score}
        </motion.span>
        <span className="text-platinum-dim text-sm font-mono">/ 100</span>
      </div>
    </div>
  )
}

const SUB_META: Record<keyof SubScores, { label: string; col: string }> = {
  ess: { label: "Evidence Strength",   col: "#7C3AED" },
  iss: { label: "Impact Signal",       col: "#06B6D4" },
  ncs: { label: "Narrative Clarity",   col: "#9F6EF5" },
  evs: { label: "External Validation", col: "#22D3EE" },
  fos: { label: "Founder Signal",      col: "#F59E0B" },
  vds: { label: "Visibility",          col: "#FCD34D" },
}

const TIER_COLORS = { 1: "#F59E0B", 2: "#06B6D4", 3: "#7C3AED" } as const

const ADVISORY_LABELS = {
  diagnostic:         "Readiness Diagnostic · £500",
  signal_architecture:"Application Advisory · £2,500",
  builder_system:     "Full Case Build · £5,500",
}

// ── Result inner ──────────────────────────────────────────────────────────────
function ResultInner() {
  const params = useSearchParams()
  const raw = params.get("data")

  if (!raw) {
    return (
      <div className="min-h-screen flex items-center justify-center text-platinum-dim">
        <p>No score data found. <Link href="/scorecard" className="text-brand underline">Retake the assessment →</Link></p>
      </div>
    )
  }

  let result: FCIOutput
  try { result = JSON.parse(decodeURIComponent(raw)) }
  catch {
    return (
      <div className="min-h-screen flex items-center justify-center text-platinum-dim">
        <p>Could not parse score. <Link href="/scorecard" className="text-brand underline">Retake the assessment →</Link></p>
      </div>
    )
  }

  const tierColor = TIER_COLORS[result.tier]
  const confColor = result.confidence === "High" ? "#22D3EE" : result.confidence === "Medium" ? "#F59E0B" : "#9F6EF5"

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-lg text-gradient-brand">Meridian</Link>
          <Link href="/scorecard" className="text-xs text-platinum-dim hover:text-platinum transition-colors">
            Retake assessment
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">
            Your Founder Credibility Index™
          </p>
          <h1 className="font-display text-4xl text-platinum mb-2">Your score is ready.</h1>
          <p className="text-platinum-dim">Here is how global evaluators currently read your credibility.</p>
        </motion.div>

        {/* Score card */}
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="card-border p-8 md:p-12 mb-6">

          {/* Top: ring + tier */}
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-10">
            <div className="flex flex-col items-center gap-4">
              <ScoreRing score={result.score} size={200} />
              <div className="flex flex-col items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                  style={{ borderColor: `${tierColor}40`, background: `${tierColor}12` }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: tierColor }} />
                  <span className="text-xs font-mono" style={{ color: tierColor }}>
                    Tier {result.tier}: {result.tierLabel}
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                  style={{ background: `${confColor}12` }}>
                  <span className="text-xs font-mono" style={{ color: confColor }}>
                    Confidence: {result.confidence}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="text-platinum-dim text-sm leading-relaxed mb-6 italic">
                &ldquo;{result.tierDescription}&rdquo;
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-void-surface border border-void-border">
                  <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-1">Top strength</p>
                  <p className="text-sm text-platinum font-medium">{result.primaryStrength}</p>
                </div>
                <div className="p-4 rounded-xl bg-void-surface border border-void-border">
                  <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-1">Primary gap</p>
                  <p className="text-sm text-platinum font-medium">{result.primaryGap}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-brand/30 bg-brand/8">
                <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-1">
                  Tech Nation Pattern Alignment
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-void-border rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-brand to-data"
                      initial={{ width: 0 }}
                      animate={{ width: `${result.patternAlignment}%` }}
                      transition={{ duration: 1.5, delay: 1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-sm font-mono text-platinum">{result.patternAlignment}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insight line */}
          <div className="p-5 rounded-xl bg-void-surface border border-void-border mb-8">
            <p className="text-sm text-platinum leading-relaxed">
              <span className="text-brand font-medium">Insight: </span>
              {result.insightLine}
            </p>
          </div>

          {/* Sub-scores — blurred below first 2 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest">
                Dimension Breakdown
              </p>
              <span className="text-xs text-platinum-faint">Full breakdown unlocked in Strategic Review</span>
            </div>
            <div className="space-y-4 relative">
              {(Object.entries(result.subScores) as [keyof SubScores, number][]).map(([key, val], i) => {
                const meta = SUB_META[key]
                const isBlurred = i >= 2
                return (
                  <div key={key} className={isBlurred ? "relative" : ""}>
                    <div className={`${isBlurred ? "blur-sm select-none pointer-events-none" : ""}`}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm text-platinum-dim">{meta.label}</span>
                        <span className="text-sm font-mono text-platinum">{isBlurred ? "??" : val}</span>
                      </div>
                      <div className="h-1.5 bg-void-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: isBlurred ? "60%" : `${val}%` }}
                          transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg,${meta.col},${meta.col}80)` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Blur overlay + lock CTA */}
              <div className="absolute left-0 right-0" style={{ top: "calc(2 * (1.5rem + 1.5rem + 0.5rem) + 0.5rem)" }}>
                <div className="flex flex-col items-center justify-center py-6 px-4 rounded-xl border border-brand/30 bg-void/80 backdrop-blur-sm text-center">
                  <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center mb-3">
                    <span className="text-brand text-lg">⚲</span>
                  </div>
                  <p className="text-sm text-platinum font-medium mb-1">Full breakdown in Strategic Review</p>
                  <p className="text-xs text-platinum-dim mb-4">
                    Dimension breakdown, evidence mapping, gap analysis, and your recommended advisory path.
                  </p>
                  <Link href="/apply" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm text-white font-medium">
                    Apply for Strategic Review →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommended path */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card-border p-8 mb-6">
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">
            Recommended Advisory Path
          </p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg text-platinum font-medium mb-1">
                {ADVISORY_LABELS[result.advisoryPath]}
              </p>
              <p className="text-sm text-platinum-dim leading-relaxed">
                Based on your score of {result.score} and your identified gap in {result.primaryGap},
                this is the most appropriate starting point for your credibility architecture work.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/apply" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-white font-medium">
              Apply for Strategic Review →
            </Link>
            <Link href="/" className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-platinum font-medium">
              Learn more about Meridian
            </Link>
          </div>
        </motion.div>

        {/* Legal note */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="text-xs text-platinum-faint text-center leading-relaxed max-w-2xl mx-auto">
          This score is an advisory intelligence tool only. It does not constitute a legal assessment,
          immigration advice, or guarantee of any recognition outcome. Meridian is independent and not
          affiliated with the UK Government or any visa body.
        </motion.p>
      </div>
    </div>
  )
}

// ── Page with Suspense (required for useSearchParams) ─────────────────────────
export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="shimmer-skeleton w-48 h-4 rounded" />
      </div>
    }>
      <ResultInner />
    </Suspense>
  )
}
