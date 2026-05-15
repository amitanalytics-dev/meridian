"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// ── Question data ─────────────────────────────────────────────────────────────

const QS = [
  {
    p: 1, pill: "Evidence strength",
    q: "How would you describe your most public-facing work?",
    opts: [
      { t: "Externally visible: products at scale, talks, papers, press, open source", s: "Strong" },
      { t: "Some external visibility: niche conferences, GitHub, internal at well-known companies", s: "Moderate" },
      { t: "Mostly internal: senior role at a private company, work under NDA", s: "Limited" },
      { t: "Not sure — strong work, but haven't thought about external visibility", s: "Needs framing" },
    ],
  },
  {
    p: 1, pill: "Evidence strength",
    q: "Can you point to specific innovations you led — not contributed to?",
    opts: [
      { t: "Yes — I can name 3+ initiatives I personally architected end-to-end", s: "Strong" },
      { t: "Yes, 1–2 clear examples where I led", s: "Moderate" },
      { t: "I led work, but distinguishing my contribution from team work is hard", s: "Needs work" },
      { t: "Most of my impact is embedded in team outcomes", s: "Reframe needed" },
    ],
  },
  {
    p: 1, pill: "Evidence strength",
    q: "Do you have measurable outcomes you can point to?",
    opts: [
      { t: "Yes — revenue, scale, performance, adoption with my name attached", s: "Strong" },
      { t: "Yes, but mostly in confidential contexts (NDA, private company)", s: "Workable" },
      { t: "Some metrics, but not the kind that would impress a UK evaluator", s: "Needs framing" },
      { t: "I struggle to quantify my impact", s: "Needs work" },
    ],
  },
  {
    p: 1, pill: "Evidence strength",
    q: "Have you been recognised externally for your work?",
    opts: [
      { t: "Awards, press features, named speaker invitations, listings", s: "Strong" },
      { t: "Industry mentions, podcast appearances, smaller awards", s: "Moderate" },
      { t: "Promoted internally, well-known in my company, but quiet externally", s: "Visibility gap" },
      { t: "None yet — but I'm planning to address this", s: "Gap to close" },
    ],
  },
  {
    p: 1, pill: "Evidence strength",
    q: "Is your current evidence organised for an evaluator's framework?",
    opts: [
      { t: "Yes — I've mapped my evidence against the published criteria", s: "Strong" },
      { t: "Sort of — I have a CV and a few documents, but no framework", s: "Needs structure" },
      { t: "No — my evidence lives across LinkedIn, emails, and memory", s: "Gather needed" },
      { t: "I'm not sure what 'framework' means here", s: "Start from zero" },
    ],
  },
  {
    p: 2, pill: "Narrative clarity",
    q: "If a stranger read your CV, could they describe your career arc in one sentence?",
    opts: [
      { t: "Yes — there's a clear through-line and an evident speciality", s: "Strong" },
      { t: "They'd see good work but the arc isn't obvious", s: "Needs sharpening" },
      { t: "Probably not — I've worn many hats", s: "Needs framing" },
      { t: "Definitely not — I've pivoted a lot", s: "Reframe needed" },
    ],
  },
  {
    p: 2, pill: "Narrative clarity",
    q: "Have you drafted a personal statement that argues a case (not lists a career)?",
    opts: [
      { t: "Yes, and it's been reviewed by someone who's been through the process", s: "Strong" },
      { t: "I have a draft but I think it reads like a CV in paragraphs", s: "Common — fixable" },
      { t: "No, but I have notes I could turn into one", s: "Workable" },
      { t: "No — and I'm not sure where to start", s: "Needs work" },
    ],
  },
  {
    p: 2, pill: "Narrative clarity",
    q: "Can you articulate why you matter to your sector (not your employer)?",
    opts: [
      { t: "Yes — I can describe my influence on the field, not just my company", s: "Strong" },
      { t: "Sort of — I'd need help framing it that way", s: "Workable" },
      { t: "Honestly, no — I'd describe my role, not my sector influence", s: "Critical gap" },
      { t: "I'm not sure my work matters at sector level", s: "Underselling likely" },
    ],
  },
  {
    p: 2, pill: "Narrative clarity",
    q: "Which category fits your profile?",
    opts: [
      { t: "Exceptional Talent — established track record, externally recognised", s: "Talent route" },
      { t: "Exceptional Promise — earlier career, clearly rising", s: "Promise route" },
      { t: "I genuinely don't know which fits", s: "Needs guidance" },
      { t: "I assumed Promise — but maybe I'm underselling", s: "Worth a check" },
    ],
  },
  {
    p: 2, pill: "Narrative clarity",
    q: "Is your seniority and scope clear from titles alone?",
    opts: [
      { t: "Yes — Director / VP / Founder / Principal-level roles", s: "Strong" },
      { t: "Mid-level titles but I owned more than the title implies", s: "Needs reframing" },
      { t: "I changed company stages so titles look smaller than my impact", s: "Reframe needed" },
      { t: "I work without formal titles (founder, freelance, advisor)", s: "Workable" },
    ],
  },
  {
    p: 3, pill: "Recommendation quality",
    q: "Have you identified 3 potential recommenders?",
    opts: [
      { t: "Yes — and they cover different dimensions of my credibility", s: "Strong" },
      { t: "Yes, but they're all from the same company/context", s: "Needs diversification" },
      { t: "I have a couple but I'm short one", s: "Workable" },
      { t: "No — I'm not sure who to ask", s: "Needs work" },
    ],
  },
  {
    p: 3, pill: "Recommendation quality",
    q: "Do your recommenders have the seniority and standing required?",
    opts: [
      { t: "Yes — sector-recognised leaders, well-known figures, executives", s: "Strong" },
      { t: "Senior people but not externally famous", s: "Workable" },
      { t: "Mix — one strong, one mid, one weak", s: "Strengthen weakest" },
      { t: "I'd be asking friends and direct managers", s: "Needs work" },
    ],
  },
  {
    p: 3, pill: "Recommendation quality",
    q: "Have you briefed recommenders on what to write?",
    opts: [
      { t: "Yes — each got a written brief covering specific dimensions to address", s: "Strong" },
      { t: "I told them to mention strengths, but no structured brief", s: "Common — risky" },
      { t: "I'll send them my CV and ask them to wing it", s: "Critical gap" },
      { t: "Haven't asked yet", s: "Plan needed" },
    ],
  },
  {
    p: 3, pill: "Recommendation quality",
    q: "Do your recommenders know each other?",
    opts: [
      { t: "No — they're independent voices from different contexts", s: "Ideal" },
      { t: "Two work together; one is external", s: "Workable" },
      { t: "Most know each other (same company)", s: "Diversify needed" },
      { t: "Not sure", s: "Check needed" },
    ],
  },
  {
    p: 3, pill: "Recommendation quality",
    q: "Confident letters will describe sector impact, not relationship?",
    opts: [
      { t: "Yes — I've reviewed past letters they've written and they understand the bar", s: "Strong" },
      { t: "Hopefully — but it's a known failure mode I'm worried about", s: "Coach them" },
      { t: "No — they'll describe how nice I am to work with", s: "Critical gap" },
      { t: "I haven't thought about this yet", s: "Plan needed" },
    ],
  },
  {
    p: 4, pill: "External validation",
    q: "Do you have a verifiable online footprint?",
    opts: [
      { t: "Yes — LinkedIn, GitHub, blog, talks, press all coherent", s: "Strong" },
      { t: "Some — LinkedIn is updated, the rest is patchy", s: "Tidy up" },
      { t: "Minimal — I'm a builder, not a poster", s: "Visibility gap" },
      { t: "I've kept a low profile deliberately", s: "Workable but harder" },
    ],
  },
  {
    p: 4, pill: "External validation",
    q: "Have you been invited to speak, mentor, judge, or advise externally?",
    opts: [
      { t: "Yes — multiple times, with names attached", s: "Strong" },
      { t: "A handful of small invitations", s: "Moderate" },
      { t: "Within my company only", s: "Limited" },
      { t: "Not yet", s: "Gap to close" },
    ],
  },
  {
    p: 4, pill: "External validation",
    q: "Has your work led to citations, derivatives, or third-party uses?",
    opts: [
      { t: "Yes — products built on my OSS, papers citing mine, projects derived from my work", s: "Strong" },
      { t: "Some — colleagues and partners reference my work", s: "Moderate" },
      { t: "Internal influence but limited external trace", s: "Surface needed" },
      { t: "Not directly traceable", s: "Reframe needed" },
    ],
  },
  {
    p: 4, pill: "External validation",
    q: "Have you previously applied for Global Talent or a similar visa?",
    opts: [
      { t: "Yes — approved", s: "Already there" },
      { t: "Yes — rejected, planning to reapply", s: "We help here" },
      { t: "No — this would be my first application", s: "Most common" },
      { t: "Still deciding if it's right for me", s: "Start here" },
    ],
  },
  {
    p: 4, pill: "External validation",
    q: "What's your honest assessment of your readiness today?",
    opts: [
      { t: "Strong — I just need to package and submit", s: "Diagnostic enough" },
      { t: "Good underlying case, weak presentation", s: "Advisory likely" },
      { t: "Uncertain — I'd like a professional eye on it", s: "Diagnostic first" },
      { t: "Early — need to build evidence before I apply", s: "Strategy first" },
    ],
  },
]

const TOTAL = QS.length

const PILLAR_LABELS = [
  "Evidence strength",
  "Narrative clarity",
  "Recommendation quality",
  "External validation",
]

// ── Logo mark ─────────────────────────────────────────────────────────────────

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" style={{ width: 36, height: 36 }}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="24" cy="24" rx="7.5" ry="18" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="24" cy="6" r="2.3" fill="currentColor" />
    </svg>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ReadinessPage() {
  const router = useRouter()
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(TOTAL).fill(null))
  const [animKey, setAnimKey] = useState(0)
  const [slideDir, setSlideDir] = useState<"forward" | "back">("forward")

  const q = QS[idx]
  const selected = answers[idx]
  const pct = Math.round(((idx + 1) / TOTAL) * 100)
  const activePillar = q.p

  function selectOpt(i: number) {
    setAnswers((prev) => {
      const next = [...prev]
      next[idx] = i
      return next
    })
  }

  function goNext() {
    if (selected === null) return
    if (idx < TOTAL - 1) {
      setSlideDir("forward")
      setAnimKey((k) => k + 1)
      setIdx(idx + 1)
    } else {
      try {
        localStorage.setItem("mer_answers", JSON.stringify(answers))
      } catch (_) {}
      router.push("/readiness/result")
    }
  }

  function goBack() {
    if (idx === 0) return
    setSlideDir("back")
    setAnimKey((k) => k + 1)
    setIdx(idx - 1)
  }

  // Auto-advance on selection
  function handleSelect(i: number) {
    selectOpt(i)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--canvas)",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "var(--ink)",
            }}
          >
            <LogoMark />
            <div>
              <div
                style={{
                  fontFamily: "var(--f-display)",
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  color: "var(--ink)",
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
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 8,
              border: "1.5px solid var(--line)",
              fontFamily: "var(--f-sans)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--ink-soft)",
              background: "transparent",
              transition: "all .2s",
            }}
          >
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* ── Shell ── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "380px 1fr",
        }}
        className="ra-shell"
      >
        {/* ── Sidebar ── */}
        <aside
          style={{
            background: `
              radial-gradient(700px 600px at 0% 0%, rgba(91,33,182,.45), transparent 60%),
              radial-gradient(500px 400px at 100% 100%, rgba(184,137,59,.25), transparent 60%),
              var(--ink)
            `,
            color: "white",
            padding: "52px 40px",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Free badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.18)",
              fontFamily: "var(--f-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "white",
              alignSelf: "flex-start",
              marginBottom: 0,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--gold-soft)",
                display: "inline-block",
              }}
            />
            Free · 4 minutes
          </div>

          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontSize: 38,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              color: "white",
              marginTop: 28,
              marginBottom: 16,
              fontWeight: 400,
            }}
          >
            Your free{" "}
            <span
              style={{
                fontStyle: "italic",
                color: "var(--gold-soft)",
              }}
            >
              readiness
            </span>{" "}
            check.
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 14.5,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            20 questions. Four dimensions. Honest answers give honest scores.
          </p>

          {/* Pillars */}
          <div style={{ marginTop: 32 }}>
            {PILLAR_LABELS.map((label, i) => {
              const pillarNum = i + 1
              const isActive = activePillar === pillarNum
              const isDone = activePillar > pillarNum
              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom:
                      i < PILLAR_LABELS.length - 1
                        ? "1px solid rgba(255,255,255,0.08)"
                        : "none",
                    fontSize: 13.5,
                    color: isActive
                      ? "white"
                      : isDone
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(255,255,255,0.55)",
                    fontWeight: isActive ? 500 : 400,
                    transition: "color .3s",
                  }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: isActive
                        ? "var(--gold-soft)"
                        : isDone
                        ? "white"
                        : "rgba(255,255,255,0.2)",
                      boxShadow: isActive
                        ? "0 0 0 4px rgba(212,166,71,0.2)"
                        : "none",
                      transition: "all .3s",
                    }}
                  />
                  {label}
                </div>
              )
            })}
          </div>

          {/* Meta */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: 32,
              borderTop: "1px solid rgba(255,255,255,0.12)",
              fontFamily: "var(--f-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.9,
            }}
          >
            <div>
              <strong style={{ color: "white", fontWeight: 600 }}>
                No account required
              </strong>
            </div>
            <div>No email needed to start</div>
            <div>Your answers stay on this device</div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main
          style={{
            padding: "64px",
            maxWidth: 720,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
          }}
          className="ra-main"
        >
          {/* Progress label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--ink-faint)",
              }}
            >
              Question{" "}
              <strong style={{ color: "var(--violet)", fontWeight: 600 }}>
                {idx + 1}
              </strong>{" "}
              of {TOTAL}
            </div>
            <div
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: 11,
                color: "var(--ink-faint)",
              }}
            >
              {pct}% complete
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 4,
              background: "var(--line)",
              borderRadius: 2,
              overflow: "hidden",
              marginBottom: 56,
            }}
          >
            <div
              style={{
                height: "100%",
                background: "var(--grad-primary)",
                borderRadius: 2,
                width: `${pct}%`,
                transition: "width .5s cubic-bezier(.22,1,.36,1)",
              }}
            />
          </div>

          {/* Question card — keyed to animate on change */}
          <div
            key={animKey}
            style={{
              animation: `slideIn${slideDir === "forward" ? "Right" : "Left"} .35s cubic-bezier(.22,1,.36,1) both`,
            }}
          >
            {/* Pillar pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                background: "rgba(91,33,182,.08)",
                color: "var(--violet)",
                fontFamily: "var(--f-mono)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              Pillar {q.p} · {q.pill}
            </div>

            {/* Question text */}
            <h1
              style={{
                fontFamily: "var(--f-display)",
                fontSize: 38,
                lineHeight: 1.15,
                marginBottom: 14,
                letterSpacing: "-0.025em",
                color: "var(--ink)",
                fontWeight: 400,
              }}
            >
              {q.q}
            </h1>

            {/* Hint */}
            <p
              style={{
                fontSize: 15,
                color: "var(--ink-soft)",
                marginBottom: 40,
                lineHeight: 1.55,
              }}
            >
              Pick the closest answer. Honest is better than impressive.
            </p>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.opts.map((opt, i) => {
                const isSelected = selected === i
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "18px 22px",
                      borderRadius: 14,
                      border: isSelected
                        ? "1.5px solid var(--violet)"
                        : "1.5px solid var(--line)",
                      background: isSelected
                        ? "rgba(91,33,182,.04)"
                        : "var(--paper)",
                      boxShadow: isSelected
                        ? "0 0 0 4px rgba(91,33,182,.06)"
                        : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      fontSize: 15,
                      color: "var(--ink)",
                      transition: "all .2s",
                      width: "100%",
                    }}
                  >
                    {/* Radio dot */}
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: isSelected
                          ? "2px solid var(--violet)"
                          : "2px solid var(--line)",
                        background: isSelected ? "var(--violet)" : "transparent",
                        flexShrink: 0,
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .2s",
                      }}
                    >
                      {isSelected && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "white",
                            display: "block",
                          }}
                        />
                      )}
                    </span>

                    {/* Label */}
                    <span style={{ flex: 1 }}>{opt.t}</span>

                    {/* Score tag */}
                    <span
                      style={{
                        fontFamily: "var(--f-mono)",
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        color: "var(--ink-faint)",
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "var(--canvas)",
                        textTransform: "uppercase",
                        flexShrink: 0,
                      }}
                    >
                      {opt.s}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: 56,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
            }}
          >
            <button
              onClick={goBack}
              disabled={idx === 0}
              style={{
                background: "none",
                border: "none",
                color: "var(--ink-soft)",
                fontSize: 14,
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: 8,
                fontFamily: "inherit",
                cursor: idx === 0 ? "not-allowed" : "pointer",
                opacity: idx === 0 ? 0.3 : 1,
                transition: "opacity .2s",
              }}
            >
              ← Back
            </button>

            <button
              onClick={goNext}
              disabled={selected === null}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 28px",
                borderRadius: 10,
                background:
                  selected === null
                    ? "rgba(91,33,182,.35)"
                    : "var(--grad-primary)",
                color: "white",
                fontFamily: "var(--f-sans)",
                fontSize: 15,
                fontWeight: 600,
                border: "none",
                cursor: selected === null ? "not-allowed" : "pointer",
                opacity: selected === null ? 0.4 : 1,
                transition: "all .2s",
                pointerEvents: selected === null ? "none" : "auto",
              }}
            >
              {idx === TOTAL - 1 ? "See my score →" : "Continue →"}
            </button>
          </div>

          {/* Disclaimer */}
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              fontFamily: "var(--f-mono)",
              fontSize: 11,
              color: "var(--ink-faint)",
              letterSpacing: "0.06em",
            }}
          >
            Advisory only — not immigration legal advice.
          </div>
        </main>
      </div>

      {/* ── Slide animations ── */}
      <style>{`
        .ra-shell {
          min-height: calc(100vh - 72px);
        }
        @media (max-width: 900px) {
          .ra-shell {
            grid-template-columns: 1fr !important;
          }
          .ra-main {
            padding: 40px 24px !important;
          }
          aside {
            padding: 40px 24px !important;
          }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
