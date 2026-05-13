"use client"

import { motion, useInView } from "framer-motion"
import { useRef, Suspense, useState, useEffect, useCallback } from "react"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────────────────────────

type SubScores = {
  technicalLeadership: number
  evidenceQuality: number
  externalRecognition: number
  independence: number
  globalProfile: number
}

type DocItem = {
  id: string
  label: string
  category: "mandatory" | "strong" | "optional"
  importance: number
  description: string
  tip: string
}

type ScoreResult = {
  assessmentId: string
  overallScore: number
  readinessLevel: "not_eligible" | "not_ready" | "semi_ready" | "fully_ready"
  recommendedTrack: "et" | "ep" | "neither"
  secondaryTrack?: "et" | "ep"
  trackExplanation: string
  subScores: SubScores
  insights: string[]
  documentChecklist: DocItem[]
  leadQuality: "hot" | "warm" | "cold"
}

// ── Score ring (same pattern as scorecard/result) ─────────────────────────────

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
          <linearGradient id="rr_grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#7C3AED" />
            <stop offset="50%"  stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <filter id="rr_glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth="12" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke="url(#rr_grad)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={visible ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          filter="url(#rr_glow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-mono text-5xl font-bold text-platinum"
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

// ── Sub-score bar ─────────────────────────────────────────────────────────────

const SUB_META: Record<keyof SubScores, { label: string; col: string }> = {
  technicalLeadership:  { label: "Technical Leadership",     col: "#7C3AED" },
  evidenceQuality:      { label: "Evidence Quality",         col: "#06B6D4" },
  externalRecognition:  { label: "External Recognition",     col: "#9F6EF5" },
  independence:         { label: "Independence & Innovation", col: "#F59E0B" },
  globalProfile:        { label: "Global Profile",           col: "#22D3EE" },
}

function SubScoreBar({ dim, val, index }: { dim: keyof SubScores; val: number; index: number }) {
  const ref = useRef(null)
  const visible = useInView(ref, { once: true })
  const meta = SUB_META[dim]
  return (
    <div ref={ref}>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm text-platinum-dim">{meta.label}</span>
        <span className="text-sm font-mono text-platinum">{val}</span>
      </div>
      <div className="h-1.5 bg-void-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={visible ? { width: `${val}%` } : {}}
          transition={{ duration: 1, delay: index * 0.1 + 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${meta.col}, ${meta.col}80)` }}
        />
      </div>
    </div>
  )
}

// ── Doc checklist item ────────────────────────────────────────────────────────

function DocChecklistItem({
  item,
  checked,
  onToggle,
}: {
  item: DocItem
  checked: boolean
  onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const importanceColor =
    item.importance >= 9 ? "#EF4444" :
    item.importance >= 7 ? "#F59E0B" : "#06B6D4"

  return (
    <div className={`p-4 rounded-xl border transition-all duration-200 ${
      checked ? "border-brand/40 bg-brand/4" : "border-void-border bg-void"
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            checked
              ? "border-brand bg-brand"
              : "border-void-border bg-void hover:border-brand/50"
          }`}
          aria-label={`Mark ${item.label} as ${checked ? "unchecked" : "checked"}`}
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${checked ? "line-through text-platinum-faint" : "text-platinum"}`}>
              {item.label}
            </span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-mono"
              style={{ color: importanceColor, background: `${importanceColor}15` }}
            >
              {item.importance}/10
            </span>
          </div>
          <p className="text-xs text-platinum-dim mt-1 leading-relaxed">{item.description}</p>

          {/* Expand tip */}
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-xs text-brand mt-2 hover:text-brand-dark transition-colors"
          >
            {expanded ? "Hide tip ▲" : "Show tip ▼"}
          </button>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 rounded-lg bg-brand/6 border border-brand/20"
            >
              <p className="text-xs text-platinum-dim leading-relaxed">
                <span className="text-brand font-medium">Tip: </span>
                {item.tip}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Readiness badge config ────────────────────────────────────────────────────

const READINESS_CONFIG = {
  not_eligible: { label: "Not Yet Eligible",  color: "#EF4444" },
  not_ready:    { label: "Not Ready to Apply", color: "#F59E0B" },
  semi_ready:   { label: "Semi Ready",         color: "#06B6D4" },
  fully_ready:  { label: "Fully Ready",        color: "#10B981" },
}

const TRACK_LABELS = {
  et:      "Exceptional Talent",
  ep:      "Exceptional Promise",
  neither: "Profile Needs Development",
}

// ── Main result page ──────────────────────────────────────────────────────────

function ReadinessResultInner() {
  const [result, setResult] = useState<ScoreResult | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("readiness_result")
      if (!raw) { setLoadError(true); return }
      const parsed = JSON.parse(raw) as ScoreResult
      setResult(parsed)
    } catch {
      setLoadError(true)
    }
  }, [])

  const toggleCheck = useCallback((id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  if (loadError || !result) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-6">
        <div className="card-border p-8 max-w-sm w-full text-center">
          <p className="font-display text-2xl text-platinum mb-3">No result found.</p>
          <p className="text-sm text-platinum-dim mb-6">
            Your session may have expired or you arrived here directly.
          </p>
          <Link href="/readiness" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-white font-medium">
            Take the assessment →
          </Link>
        </div>
      </div>
    )
  }

  const readinessCfg = READINESS_CONFIG[result.readinessLevel]
  const mandatory = result.documentChecklist.filter(d => d.category === "mandatory")
  const strong    = result.documentChecklist.filter(d => d.category === "strong")
  const optional  = result.documentChecklist.filter(d => d.category === "optional")
  const totalDocs = result.documentChecklist.length
  const checkedCount = Object.values(checked).filter(Boolean).length
  const completionPct = totalDocs > 0 ? Math.round((checkedCount / totalDocs) * 100) : 0

  const shareText = `I just got my UK Global Talent Visa readiness score: ${result.overallScore}/100 (${readinessCfg.label}). Recommended track: ${TRACK_LABELS[result.recommendedTrack]}. Assessed by Meridian.`
  const shareUrl = typeof window !== "undefined" ? window.location.origin + "/readiness" : "https://meridian.amittyagi.com/readiness"
  const linkedInShare = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-void">
      {/* ── Header ── */}
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">
              Global Talent Visa
            </span>
          </Link>
          <span className="font-mono text-xs text-platinum-faint uppercase tracking-widest">
            Readiness Report
          </span>
        </div>
        {/* Gradient line */}
        <div className="h-px bg-gradient-to-r from-brand via-data to-gold mt-4 opacity-40" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* ── Score hero ── */}
        <div className="relative overflow-hidden rounded-2xl mb-6">
          {/* Dot grid bg */}
          <div className="dot-grid absolute inset-0 opacity-50" />
          {/* Orb effects */}
          <div className="orb-violet absolute -top-20 -left-20 w-64 h-64 animate-pulse-slow" />
          <div className="orb-cyan absolute -bottom-20 -right-20 w-64 h-64 animate-pulse-slow" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 card-border p-8 md:p-12 text-center"
          >
            {/* Readiness badge */}
            <div className="flex justify-center mb-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-mono"
                style={{
                  borderColor: `${readinessCfg.color}50`,
                  background: `${readinessCfg.color}12`,
                  color: readinessCfg.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: readinessCfg.color }}
                />
                {readinessCfg.label}
              </div>
            </div>

            {/* Score ring */}
            <div className="flex justify-center mb-6">
              <ScoreRing score={result.overallScore} size={200} />
            </div>

            {/* Track badge */}
            <div className="flex flex-col items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/30 bg-brand/8">
                <span className="text-xs font-mono text-brand uppercase tracking-wider">
                  Recommended Track
                </span>
                <span className="text-sm font-medium text-platinum">
                  {TRACK_LABELS[result.recommendedTrack]}
                </span>
              </div>

              {result.secondaryTrack && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-data/30 bg-data/8">
                  <span className="text-xs font-mono text-data">
                    Also possible: {TRACK_LABELS[result.secondaryTrack]}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Sub-scores ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="card-border p-8 mb-6"
        >
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-6">
            Dimension Breakdown
          </p>
          <div className="space-y-5">
            {(Object.entries(result.subScores) as [keyof SubScores, number][]).map(([key, val], i) => (
              <SubScoreBar key={key} dim={key} val={val} index={i} />
            ))}
          </div>
        </motion.div>

        {/* ── AI Insights ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-6"
        >
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">
            AI Assessment Insights
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.insights.slice(0, 3).map((insight, i) => (
              <div key={i} className="card-border p-5 flex flex-col gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-sm text-platinum-dim leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Track explanation ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="card-border p-8 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="px-3 py-1.5 rounded-full text-xs font-mono font-medium"
              style={
                result.recommendedTrack === "et"
                  ? { background: "#7C3AED18", color: "#7C3AED", border: "1px solid #7C3AED40" }
                  : result.recommendedTrack === "ep"
                  ? { background: "#06B6D418", color: "#06B6D4", border: "1px solid #06B6D440" }
                  : { background: "#47556918", color: "#475569", border: "1px solid #47556940" }
              }
            >
              {result.recommendedTrack === "et"
                ? "Exceptional Talent Track"
                : result.recommendedTrack === "ep"
                ? "Exceptional Promise Track"
                : "Neither Track Yet"}
            </div>
          </div>

          <p className="text-sm text-platinum leading-relaxed mb-4">{result.trackExplanation}</p>

          {result.recommendedTrack === "et" && (
            <div className="p-4 rounded-xl bg-void-surface border border-void-border">
              <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">
                About Exceptional Talent
              </p>
              <p className="text-xs text-platinum-dim leading-relaxed">
                Exceptional Talent is for established leaders who have already made a significant and
                demonstrable contribution to their field at the national or international level.
                Applications require strong peer endorsement and substantial evidence of sector impact.
              </p>
            </div>
          )}

          {result.recommendedTrack === "ep" && (
            <div className="p-4 rounded-xl bg-void-surface border border-void-border">
              <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">
                About Exceptional Promise
              </p>
              <p className="text-xs text-platinum-dim leading-relaxed">
                Exceptional Promise is for professionals early in their leadership journey who show
                clear, evidenced potential for future sector impact. The bar is trajectory and
                emerging recognition — not established seniority.
              </p>
            </div>
          )}
        </motion.div>

        {/* ── Document checklist ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="card-border p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest">
              Your Document Checklist
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 bg-void-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-data"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs font-mono text-platinum-dim">{completionPct}%</span>
            </div>
          </div>
          <p className="text-xs text-platinum-faint mb-6">
            Tick documents you already have to track your completion percentage.
          </p>

          {/* Mandatory */}
          {mandatory.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <p className="text-xs font-mono text-platinum-dim uppercase tracking-widest">
                  Mandatory ({mandatory.length})
                </p>
              </div>
              <div className="space-y-3">
                {mandatory.map(item => (
                  <DocChecklistItem
                    key={item.id}
                    item={item}
                    checked={!!checked[item.id]}
                    onToggle={() => toggleCheck(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Strong supporting */}
          {strong.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-light" />
                <p className="text-xs font-mono text-platinum-dim uppercase tracking-widest">
                  Strong Supporting ({strong.length})
                </p>
              </div>
              <div className="space-y-3">
                {strong.map(item => (
                  <DocChecklistItem
                    key={item.id}
                    item={item}
                    checked={!!checked[item.id]}
                    onToggle={() => toggleCheck(item.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Optional */}
          {optional.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-data" />
                <p className="text-xs font-mono text-platinum-dim uppercase tracking-widest">
                  Optional ({optional.length})
                </p>
              </div>
              <div className="space-y-3">
                {optional.map(item => (
                  <DocChecklistItem
                    key={item.id}
                    item={item}
                    checked={!!checked[item.id]}
                    onToggle={() => toggleCheck(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mb-6"
        >
          {result.leadQuality === "hot" ? (
            <div className="relative overflow-hidden rounded-2xl p-8 md:p-10"
              style={{ background: "linear-gradient(135deg, #0F172A 0%, #1e1148 50%, #0c2a3a 100%)" }}
            >
              <div className="orb-violet absolute -top-16 -right-16 w-64 h-64 opacity-40" />
              <div className="relative z-10">
                <p className="text-xs font-mono text-brand uppercase tracking-widest mb-3">
                  Strong Application Potential
                </p>
                <h2 className="font-display text-2xl md:text-3xl text-white mb-4">
                  Your profile shows strong application potential.
                </h2>
                <p className="text-sm text-white/70 leading-relaxed mb-6 max-w-lg">
                  You may already qualify for a competitive submission. A 1:1 strategy session with
                  Amit would help you finalise your approach and avoid the mistakes that cause strong
                  profiles to fail.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/apply" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-white font-medium">
                    Book Your Strategy Session →
                  </Link>
                  <Link href="/readiness" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors">
                    Take the assessment again
                  </Link>
                </div>
              </div>
            </div>
          ) : result.leadQuality === "warm" ? (
            <div className="card-border p-8 md:p-10 border-brand/30 bg-brand/4">
              <p className="text-xs font-mono text-brand uppercase tracking-widest mb-3">
                Solid Foundation
              </p>
              <h2 className="font-display text-2xl md:text-3xl text-platinum mb-4">
                You're closer than most applicants.
              </h2>
              <p className="text-sm text-platinum-dim leading-relaxed mb-6 max-w-lg">
                Your profile has a solid foundation. A focused advisory session would map exactly
                what to build or fix before submitting.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/apply" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-white font-medium">
                  Book a Readiness Review →
                </Link>
                <Link href="/readiness" className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-platinum font-medium">
                  Retake assessment
                </Link>
              </div>
            </div>
          ) : (
            <div className="card-border p-8 md:p-10">
              <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">
                Development Roadmap
              </p>
              <h2 className="font-display text-2xl md:text-3xl text-platinum mb-4">
                Your profile needs development before applying.
              </h2>
              <p className="text-sm text-platinum-dim leading-relaxed mb-6 max-w-lg">
                The good news: most gaps are fixable with the right strategy. A diagnostic session
                with Amit would give you a clear roadmap.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/apply" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-white font-medium">
                  Get a Free Roadmap Review →
                </Link>
                <Link href="/readiness" className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-platinum font-medium">
                  Retake assessment
                </Link>
              </div>
            </div>
          )}

          {/* Trust signals */}
          <div className="mt-4 text-center">
            <p className="text-xs text-platinum-faint">
              20+ builders advised · Exceptional Talent &amp; Promise approvals
            </p>
            <p className="text-xs text-platinum-faint mt-1">
              Advisory only · Not immigration legal advice · Amit Tyagi is not an OISC-regulated advisor
            </p>
          </div>
        </motion.div>

        {/* ── Share ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="card-border p-6 mb-8 text-center"
        >
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">
            Share Your Score
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={linkedInShare}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Share on LinkedIn
            </a>
            <button
              onClick={handleCopyLink}
              className="btn-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm text-platinum font-medium"
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy link
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Legal ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-platinum-faint text-center leading-relaxed max-w-2xl mx-auto"
        >
          This readiness report is an advisory intelligence tool only. It does not constitute a
          legal assessment, immigration advice, or guarantee of any visa outcome. Meridian is
          independent and not affiliated with the UK Government or any visa body.
        </motion.p>

      </div>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function ReadinessResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="shimmer-skeleton w-48 h-4 rounded" />
      </div>
    }>
      <ReadinessResultInner />
    </Suspense>
  )
}
