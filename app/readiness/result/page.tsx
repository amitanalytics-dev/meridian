"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

// ── Score weights: index 0 = best answer, 3 = worst ───────────────────────────
const W = [100, 75, 55, 30]

// ── Pillar config ─────────────────────────────────────────────────────────────
const PILLARS = [
  {
    name: "Evidence strength",
    insights: {
      high: "Strong proof points. Focus on sequencing for maximum impact.",
      mid: "Signals are there. Make them visible and quantified.",
      low: "Surface your most impactful work. Assessors can't evaluate what's hidden.",
    },
  },
  {
    name: "Narrative clarity",
    insights: {
      high: "Career arc reads cleanly. Sharpen sector-level framing.",
      mid: "Story is there, but reads like a CV. It needs to argue, not list.",
      low: "Without a clear personal statement, even strong evidence gets discounted.",
    },
  },
  {
    name: "Recommendation quality",
    insights: {
      high: "Recommenders look strong. Make sure each covers a different dimension.",
      mid: "Brief them. Even strong recommenders write generic letters without one.",
      low: "Easiest pillar to fix. Right approach makes a fast difference.",
    },
  },
  {
    name: "External validation",
    insights: {
      high: "External signals are clear. Make them legible to evaluators.",
      mid: "Some external proof. More needed for a clean Talent-route case.",
      low: "External visibility is your biggest gap. Build it before applying.",
    },
  },
]

const RECOS_BY_PILLAR: Record<number, string[]> = {
  0: [
    "Audit your evidence portfolio against the published criteria — most builders skip this step.",
    "Surface 3 measurable outcomes per role with your name attached.",
    "Identify external recognition signals you may already have (and aren't using).",
  ],
  1: [
    "Rewrite your personal statement as an argument, not a CV. Lead with sector impact.",
    "Sharpen your career arc to a single, clear through-line evaluators can grasp in 90 seconds.",
    "Clarify whether you should apply under Talent or Promise — the framing matters.",
  ],
  2: [
    "Identify 3 recommenders covering different dimensions of your credibility.",
    "Write a structured brief for each — leaving recommenders to wing it is the #1 failure mode.",
    "Review at least one prior letter from each recommender to gauge their bar.",
  ],
  3: [
    "Make your online footprint coherent across LinkedIn, GitHub, talks, and writing.",
    "Pursue at least one externally-visible signal in the next 60 days (talk, mention, contribution).",
    "Surface third-party uses of your work (citations, derivatives, public deployments).",
  ],
}

// ── Logo mark ─────────────────────────────────────────────────────────────────

function LogoMark({ light = false }: { light?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      style={{ width: 36, height: 36, color: light ? "white" : "currentColor" }}
    >
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="24" cy="24" rx="7.5" ry="18" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="6" r="2.3" fill="currentColor" />
    </svg>
  )
}

// ── Animated score ring ───────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0)
  const [filled, setFilled] = useState(0)
  const circumference = 628

  useEffect(() => {
    const t1 = setTimeout(() => {
      // Animate ring fill
      setFilled(circumference - (circumference * score) / 100)

      // Animate counter
      let cur = 0
      const tick = () => {
        cur += 2
        if (cur >= score) {
          setDisplayed(score)
          return
        }
        setDisplayed(cur)
        requestAnimationFrame(tick)
      }
      tick()
    }, 200)
    return () => clearTimeout(t1)
  }, [score])

  return (
    <svg viewBox="0 0 240 240" style={{ width: "100%", maxWidth: 280, display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="bigring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5B21B6" />
          <stop offset="60%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#B8893B" />
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="100" stroke="#ECE4D2" strokeWidth="18" fill="none" />
      <circle
        cx="120"
        cy="120"
        r="100"
        stroke="url(#bigring)"
        strokeWidth="18"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={filled}
        strokeLinecap="round"
        transform="rotate(-90 120 120)"
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)" }}
      />
      <text
        x="120"
        y="118"
        textAnchor="middle"
        fontFamily="Instrument Serif, Times New Roman, serif"
        fontSize="82"
        fill="#1A1530"
      >
        {displayed}
      </text>
      <text
        x="120"
        y="146"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="11"
        fill="#8B8499"
        letterSpacing="3"
      >
        / 100
      </text>
    </svg>
  )
}

// ── Animated pillar bar ───────────────────────────────────────────────────────

function PillarBar({ score, delay }: { score: number; delay: number }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), delay)
    return () => clearTimeout(t)
  }, [score, delay])
  return (
    <div
      style={{
        height: 6,
        borderRadius: 3,
        background: "var(--line-soft, #ECE4D2)",
        overflow: "hidden",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 3,
          background: "var(--grad-primary)",
          width: `${width}%`,
          transition: "width 1.2s cubic-bezier(.22,1,.36,1)",
        }}
      />
    </div>
  )
}

// ── Main result page ──────────────────────────────────────────────────────────

export default function ReadinessResultPage() {
  const [answers, setAnswers] = useState<(number | null)[] | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem("mer_answers")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length === 20) {
          setAnswers(parsed)
          return
        }
      }
    } catch (_) {}
    // Fallback demo answers
    setAnswers([1, 1, 2, 1, 1, 1, 2, 2, 1, 1, 0, 1, 2, 1, 1, 1, 2, 1, 2, 1])
  }, [])

  if (!mounted || !answers) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--canvas)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid var(--line)",
            borderTopColor: "var(--violet)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Score calculation ──
  const PILLAR_DEF = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4]
  const pillarScores = [0, 0, 0, 0]
  const pillarCounts = [0, 0, 0, 0]

  answers.forEach((a, i) => {
    const p = PILLAR_DEF[i] - 1
    pillarScores[p] += W[a ?? 2]
    pillarCounts[p] += 1
  })

  const pillarFinal = pillarScores.map((s, i) =>
    Math.round(s / pillarCounts[i])
  )
  const overall = Math.round(
    pillarFinal.reduce((a, b) => a + b, 0) / 4
  )

  // ── Verdict text ──
  let verdict = ""
  let verdictSub = ""
  if (overall >= 75) {
    verdict = "Submission-ready — almost."
    verdictSub = "Strong foundations. Polish and packaging will unlock it."
  } else if (overall >= 55) {
    verdict = "Strong case, weak presentation."
    verdictSub = "Work is there. The framing is not."
  } else if (overall >= 35) {
    verdict = "Workable, but needs structure."
    verdictSub = "Get a diagnostic before spending time on a full application."
  } else {
    verdict = "Build the case before applying."
    verdictSub = "Build external evidence first. Amit can map the path."
  }

  // ── Top 3 recommendations ──
  const sorted = pillarFinal
    .map((s, i) => ({ s, i, name: PILLARS[i].name }))
    .sort((a, b) => a.s - b.s)

  const used = new Set<string>()
  const picks: { r: string; name: string; score: number }[] = []
  for (const p of sorted) {
    for (const r of RECOS_BY_PILLAR[p.i]) {
      if (used.has(r)) continue
      picks.push({ r, name: p.name, score: p.s })
      used.add(r)
      if (picks.length === 3) break
    }
    if (picks.length === 3) break
  }

  // ── Matched plan ──
  let planName = ""
  let planRationale = ""
  let planPrice = ""
  let planTitle = ""
  let planTname = ""

  if (overall >= 70) {
    planName = "Application Advisory."
    planTitle = "Application Advisory"
    planTname = "Tier 02 · Advisory"
    planPrice = "£2,500"
    planRationale =
      "Underlying case is strong. You need sharper packaging and a recommendation strategy. Not a full rebuild."
  } else if (overall >= 45) {
    planName = "Application Advisory."
    planTitle = "Application Advisory"
    planTname = "Tier 02 · Advisory"
    planPrice = "£2,500"
    planRationale =
      "Solid work. Case needs restructuring on narrative and recommendations. Advisory covers all three pillars."
  } else if (overall >= 30) {
    planName = "Readiness Diagnostic."
    planTitle = "Readiness Diagnostic"
    planTname = "Tier 01 · Diagnostic"
    planPrice = "£500"
    planRationale =
      "Start small. A diagnostic tells you whether to build evidence first. No reason to commit further until that's clear."
  } else {
    planName = "Readiness Diagnostic."
    planTitle = "Readiness Diagnostic"
    planTname = "Tier 01 · Diagnostic"
    planPrice = "£500"
    planRationale =
      "Work to do before applying. A £500 diagnostic saves months on the wrong path. Amit will show you what's next."
  }

  return (
    <div style={{ background: "var(--canvas)", minHeight: "100vh" }}>
      {/* ── Nav ── */}
      <nav
        style={{
          background: "rgba(246,241,231,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--line)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            padding: "0 32px",
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink)" }}>
            <LogoMark />
            <div>
              <div
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Meridian
              </div>
              <div
                style={{
                  fontFamily: "var(--f-mono)",
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink-faint)",
                  lineHeight: 1,
                  marginTop: 2,
                }}
              >
                Global Talent Advisory
              </div>
            </div>
          </Link>

          <Link
            href="/apply"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 8,
              background: "var(--grad-primary)",
              color: "white",
              fontFamily: "var(--f-sans)",
              fontSize: 13,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Apply for advisory →
          </Link>
        </div>
      </nav>

      {/* ── Hero section ── */}
      <section
        style={{
          background: `
            radial-gradient(800px 500px at 20% 0%, rgba(91,33,182,.15), transparent 60%),
            radial-gradient(600px 500px at 90% 30%, rgba(184,137,59,.12), transparent 60%),
            var(--canvas)
          `,
          padding: "64px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
          {/* Kicker */}
          <div
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              fontWeight: 500,
              marginBottom: 16,
            }}
          >
            <span style={{ width: 28, height: 1, background: "var(--ink-faint)", display: "inline-block" }} />
            Your readiness report
          </div>

          <h1
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(40px, 6vw, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              maxWidth: 920,
              fontWeight: 400,
              marginBottom: 22,
            }}
          >
            Closer than you think.{" "}
            <span
              style={{
                fontStyle: "italic",
                background: "linear-gradient(120deg, #5B21B6 0%, #86198F 50%, #B8893B 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Clearer on what to fix.
            </span>
          </h1>

          <p
            style={{
              fontSize: 19,
              lineHeight: 1.55,
              color: "var(--ink-soft)",
              maxWidth: 620,
              margin: 0,
            }}
          >
            Four dimensions. Indicative score. Not a guarantee — but a real starting point.
          </p>
        </div>

        {/* ── Score grid ── */}
        <div style={{ maxWidth: 1240, margin: "48px auto 0", padding: "0 32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "460px 1fr",
              gap: 56,
              alignItems: "start",
            }}
            className="res-grid"
          >
            {/* Big ring card */}
            <div
              style={{
                background: "var(--paper)",
                borderRadius: 24,
                padding: 36,
                boxShadow: "0 2px 4px rgba(26,21,48,.05), 0 24px 48px -16px rgba(91,33,182,.15)",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "linear-gradient(120deg, #5B21B6 0%, #86198F 50%, #B8893B 100%)",
                }}
              />

              {/* Stamp */}
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "rgba(184,137,59,.1)",
                  color: "#8C6428",
                  fontFamily: "var(--f-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  marginBottom: 20,
                }}
              >
                Indicative score
              </div>

              {/* Ring */}
              <ScoreRing score={overall} />

              {/* Verdict */}
              <div
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: 30,
                  lineHeight: 1.12,
                  marginTop: 20,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                  fontWeight: 400,
                }}
              >
                {verdict}
              </div>
              <p
                style={{
                  color: "var(--ink-soft)",
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  margin: "12px 0 28px",
                }}
              >
                {verdictSub}
              </p>

              <Link
                href="/apply"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "14px 24px",
                  borderRadius: 10,
                  background: "var(--grad-primary)",
                  color: "white",
                  fontFamily: "var(--f-sans)",
                  fontSize: 15,
                  fontWeight: 600,
                  width: "100%",
                  textDecoration: "none",
                }}
              >
                Apply for advisory →
              </Link>
            </div>

            {/* Pillar cards */}
            <div style={{ display: "grid", gap: 16 }}>
              {PILLARS.map((pillar, i) => {
                const s = pillarFinal[i]
                const insight =
                  s >= 70
                    ? pillar.insights.high
                    : s >= 45
                    ? pillar.insights.mid
                    : pillar.insights.low

                return (
                  <div
                    key={pillar.name}
                    style={{
                      background: "var(--paper)",
                      border: "1px solid var(--line)",
                      borderRadius: 18,
                      padding: "22px 24px",
                      transition: "transform .2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--f-sans)",
                          fontWeight: 700,
                          fontSize: 16,
                          color: "var(--ink)",
                        }}
                      >
                        {i + 1}. {pillar.name}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--f-display)",
                          fontSize: 36,
                          lineHeight: 1,
                          color: "var(--violet)",
                        }}
                      >
                        {s}
                      </span>
                    </div>
                    <PillarBar score={s} delay={i * 150 + 400} />
                    <div
                      style={{
                        fontSize: 13.5,
                        color: "var(--ink-soft)",
                        lineHeight: 1.55,
                      }}
                    >
                      {insight}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Recommendations ── */}
      <section style={{ padding: "112px 0", position: "relative" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
          {/* Kicker */}
          <div
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              fontWeight: 500,
            }}
          >
            <span style={{ width: 28, height: 1, background: "var(--ink-faint)", display: "inline-block" }} />
            Top 3 things to fix first
          </div>

          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontSize: "clamp(36px, 5vw, 60px)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              color: "var(--ink)",
              fontWeight: 400,
              marginTop: 20,
              maxWidth: 760,
            }}
          >
            Specific.{" "}
            <span
              style={{
                fontStyle: "italic",
                background: "linear-gradient(120deg, #5B21B6 0%, #86198F 50%, #B8893B 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              Actionable.
            </span>
          </h2>

          <p
            style={{
              marginTop: 16,
              color: "var(--ink-soft)",
              maxWidth: 640,
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            Sample priorities based on your answers. A paid £500 Diagnostic returns a written,
            personalised version of this — with the underlying signals Amit looked at, in your
            own words.
          </p>

          {/* Reco cards */}
          <div style={{ marginTop: 40, maxWidth: 880 }}>
            {picks.map((pick, i) => (
              <div
                key={i}
                style={{
                  background: "var(--paper)",
                  border: "1px solid var(--line)",
                  borderRadius: 18,
                  padding: 24,
                  marginBottom: 12,
                  display: "flex",
                  gap: 18,
                  alignItems: "flex-start",
                  transition: "all .25s",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--ink)",
                    color: "white",
                    flexShrink: 0,
                    fontFamily: "var(--f-display)",
                    fontSize: 16,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <h4
                    style={{
                      fontFamily: "var(--f-sans)",
                      fontSize: 16,
                      fontWeight: 700,
                      marginBottom: 6,
                      color: "var(--ink)",
                    }}
                  >
                    {pick.r}
                  </h4>
                  <p
                    style={{
                      fontSize: 13.5,
                      color: "var(--ink-soft)",
                      margin: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    <strong style={{ color: "var(--violet)" }}>{pick.name}</strong> · current
                    score {pick.score}/100 — biggest unlock is here.
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Plan banner ── */}
          <div
            style={{
              marginTop: 48,
              padding: 48,
              borderRadius: 24,
              background: `
                radial-gradient(800px 500px at 0% 0%, rgba(91,33,182,.55), transparent 60%),
                radial-gradient(700px 400px at 100% 100%, rgba(184,137,59,.3), transparent 60%),
                var(--ink)
              `,
              color: "white",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Matched badge */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 999,
                fontFamily: "var(--f-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--gold-soft)",
                  display: "inline-block",
                  animation: "pulse 1.6s infinite",
                }}
              />
              Matched plan based on your score
            </span>

            <h2
              style={{
                fontFamily: "var(--f-display)",
                fontSize: "clamp(28px, 4vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                color: "white",
                fontWeight: 400,
                marginTop: 20,
                maxWidth: 600,
              }}
            >
              You'd be a strong fit for{" "}
              <span style={{ fontStyle: "italic", color: "var(--gold-soft)" }}>
                {planName}
              </span>
            </h2>

            <p
              style={{
                color: "rgba(255,255,255,0.75)",
                maxWidth: 560,
                marginTop: 14,
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              {planRationale}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr",
                gap: 40,
                marginTop: 28,
                alignItems: "end",
              }}
              className="plan-cols"
            >
              <div>
                <p
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    margin: 0,
                    fontSize: 15,
                    lineHeight: 1.6,
                  }}
                >
                  Amit reviews within 48 hours. Confirms this tier or recommends another. No charge until he&apos;s seen your case.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 28,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    href="/apply"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "16px 28px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, #B8893B 0%, #D4A647 100%)",
                      color: "white",
                      fontFamily: "var(--f-sans)",
                      fontSize: 15,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Apply for this tier →
                  </Link>
                  <Link
                    href="/#pricing"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "16px 28px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "rgba(255,255,255,0.8)",
                      fontFamily: "var(--f-sans)",
                      fontSize: 15,
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    See all tiers
                  </Link>
                </div>
              </div>

              {/* Plan tier box */}
              <div
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 20,
                  padding: 24,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                    marginBottom: 10,
                  }}
                >
                  {planTname}
                </div>
                <div
                  style={{
                    fontFamily: "var(--f-display)",
                    fontSize: 26,
                    lineHeight: 1.1,
                    color: "white",
                    fontWeight: 400,
                  }}
                >
                  {planTitle}
                </div>
                <div
                  style={{
                    fontFamily: "var(--f-display)",
                    fontSize: 56,
                    lineHeight: 1,
                    background: "linear-gradient(135deg, #FFFFFF 0%, #D4A647 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  {planPrice}
                </div>
                <div
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.14em",
                    marginTop: 8,
                  }}
                >
                  FIXED. NO RETAINER.
                </div>
              </div>
            </div>

            {/* Trust signals */}
            <div
              style={{
                display: "flex",
                gap: 24,
                alignItems: "center",
                marginTop: 28,
                paddingTop: 28,
                borderTop: "1px solid rgba(255,255,255,0.12)",
                flexWrap: "wrap",
              }}
            >
              {["Reviewed personally by Amit", "48-hr response", "No open-ended retainers", "NDA on request"].map(
                (blip) => (
                  <span
                    key={blip}
                    style={{
                      fontFamily: "var(--f-mono)",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.6)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    <span style={{ color: "var(--gold-soft)", marginRight: 8 }}>✦</span>
                    {blip}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Save your report ── */}
      <section style={{ paddingTop: 0, paddingBottom: 112 }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              padding: 40,
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 32,
              alignItems: "center",
              background: "var(--canvas-soft, #EDE6D5)",
              border: 0,
              borderRadius: 18,
            }}
            className="save-row"
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--f-mono)",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--ink-faint)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  fontWeight: 500,
                }}
              >
                <span style={{ width: 28, height: 1, background: "var(--ink-faint)", display: "inline-block" }} />
                Save your report
              </div>
              <h3
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: 30,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                  fontWeight: 400,
                  marginTop: 14,
                }}
              >
                Want a written diagnostic — not just a score?
              </h3>
              <ul
                style={{
                  margin: "14px 0 0",
                  color: "var(--ink-soft)",
                  maxWidth: 560,
                  fontSize: 14.5,
                  lineHeight: 1.8,
                  listStyle: "none",
                  padding: 0,
                }}
              >
                <li>— £500 Diagnostic: written gap analysis from Amit.</li>
                <li>— Book Advisory or Full Build within 60 days — the <strong style={{ color: "var(--violet)" }}>£500 is credited</strong>.</li>
                <li>— No reason not to start here.</li>
              </ul>
            </div>

            <Link
              href="/apply"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "16px 28px",
                borderRadius: 10,
                background: "var(--grad-primary)",
                color: "white",
                fontFamily: "var(--f-sans)",
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Book a Diagnostic →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "var(--ink)",
          color: "rgba(255,255,255,0.65)",
          padding: "64px 0 40px",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: 40,
              marginBottom: 48,
            }}
            className="footer-grid"
          >
            <div>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, color: "white" }}>
                <LogoMark light />
                <div>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 18, color: "white", letterSpacing: "-0.02em" }}>
                    Meridian
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--f-mono)",
                      fontSize: 9,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.5)",
                      marginTop: 2,
                    }}
                  >
                    Global Talent Advisory
                  </div>
                </div>
              </Link>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  marginTop: 20,
                  maxWidth: 340,
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Strategic advisory for builders applying for UK Global Talent recognition.
              </p>
            </div>

            <div>
              <h4
                style={{
                  color: "white",
                  fontFamily: "var(--f-sans)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Services
              </h4>
              {[
                { href: "/readiness", label: "Readiness Assessment" },
                { href: "/apply", label: "Apply for Advisory" },
                { href: "/blog", label: "Insights Blog" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 14,
                    marginBottom: 10,
                    transition: "color .2s",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div>
              <h4
                style={{
                  color: "white",
                  fontFamily: "var(--f-sans)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Information
              </h4>
              {[
                { href: "/about", label: "About Amit" },
                { href: "/#pricing", label: "Pricing" },
                { href: "/#faq", label: "FAQ" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div>
              <h4
                style={{
                  color: "white",
                  fontFamily: "var(--f-sans)",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 16,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Legal
              </h4>
              {[
                { href: "/legal#disclaimer", label: "Disclaimer" },
                { href: "/legal#privacy", label: "Privacy" },
                { href: "/legal#terms", label: "Terms" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "block",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: 14,
                    marginBottom: 10,
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 24,
              fontSize: 12,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 20,
            }}
          >
            <strong style={{ color: "rgba(255,255,255,0.85)" }}>
              Advisory only — not immigration legal advice.
            </strong>{" "}
            Meridian is an independent advisory service. Amit Tyagi is not an immigration lawyer,
            is not OISC-registered.
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span>© 2025 Meridian.</span>
            <span>Designed for builders, by a builder.</span>
          </div>
        </div>
      </footer>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 900px) {
          .res-grid {
            grid-template-columns: 1fr !important;
          }
          .plan-cols {
            grid-template-columns: 1fr !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .save-row {
            grid-template-columns: 1fr !important;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
