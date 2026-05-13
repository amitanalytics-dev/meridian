"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import Link from "next/link"
import { SiteNav } from "@/components/SiteNav"

// ── Document Checker ──────────────────────────────────────────────────────────
function DocumentChecker() {
  const [state, setState] = useState<"idle"|"dragging"|"loading"|"result"|"error">("idle")
  const [result, setResult] = useState<{
    evidenceType: string
    strength: "strong"|"moderate"|"weak"
    keySignal: string
    improvementTip: string
    score: number
  } | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function analyzeFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File too large (max 5MB)")
      setState("error")
      return
    }
    setState("loading")
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/doc-check", { method: "POST", body: fd })
      if (!res.ok) {
        const err = await res.json()
        setErrorMsg(err.error || "Analysis failed")
        setState("error")
        return
      }
      const data = await res.json()
      setResult(data)
      setState("result")
    } catch {
      setErrorMsg("Something went wrong. Please try again.")
      setState("error")
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setState("idle")
    const file = e.dataTransfer.files[0]
    if (file) analyzeFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) analyzeFile(file)
  }

  function reset() { setState("idle"); setResult(null); setErrorMsg("") }

  const strengthColor = result?.strength === "strong" ? "#4A6347" : result?.strength === "moderate" ? "#B8893B" : "#A93838"
  const strengthLabel = result?.strength === "strong" ? "Strong Evidence" : result?.strength === "moderate" ? "Moderate Evidence" : "Weak Evidence"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
      className="w-full max-w-xl mx-auto mt-8 mb-2"
    >
      {/* Label */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="h-px flex-1 max-w-16" style={{ background: "#E2D9C4" }} />
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "#8B8499" }}>Quick Evidence Check</span>
        <div className="h-px flex-1 max-w-16" style={{ background: "#E2D9C4" }} />
      </div>

      {state === "idle" && (
        <div
          onDragEnter={() => setState("dragging")}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setState("idle")}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-2xl p-6 flex flex-col items-center gap-3 transition-all duration-200"
          style={{ background: "#FFFFFF", border: "1px dashed #E2D9C4" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(91,33,182,0.35)"
            ;(e.currentTarget as HTMLDivElement).style.background = "rgba(91,33,182,0.02)"
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#E2D9C4"
            ;(e.currentTarget as HTMLDivElement).style.background = "#FFFFFF"
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(91,33,182,0.18)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B21B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "#1A1530" }}>Drop a document to check its evidence strength</p>
            <p className="text-xs mt-1" style={{ color: "#8B8499" }}>Recommendation letter, CV, pay slip, publication — PDF or TXT · Max 5MB</p>
          </div>
          <input ref={inputRef} type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {state === "dragging" && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onDragLeave={() => setState("idle")}
          className="rounded-2xl p-6 flex flex-col items-center gap-2 transition-all"
          style={{ border: "2px solid #5B21B6", background: "rgba(91,33,182,0.04)" }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(91,33,182,0.20)" }}>
            <span style={{ color: "#5B21B6" }} className="text-lg">✦</span>
          </div>
          <p className="text-sm font-medium" style={{ color: "#5B21B6" }}>Drop to analyze</p>
        </div>
      )}

      {state === "loading" && (
        <div className="rounded-2xl p-6 flex flex-col items-center gap-3" style={{ border: "1px solid #E2D9C4", background: "#FFFFFF" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 rounded-full"
            style={{ border: "2px solid rgba(91,33,182,0.2)", borderTop: "2px solid #5B21B6" }}
          />
          <p className="text-sm font-medium" style={{ color: "#1A1530" }}>Analyzing your document...</p>
          <p className="text-xs" style={{ color: "#8B8499" }}>AI is checking evidence type and strength</p>
        </div>
      )}

      {state === "result" && result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-5"
          style={{ border: "1px solid #E2D9C4", background: "#FFFFFF" }}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "#8B8499" }}>{result.evidenceType}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: strengthColor }} />
                <span className="font-semibold text-sm" style={{ color: strengthColor }}>{strengthLabel}</span>
                <span className="font-mono text-sm ml-auto" style={{ color: "#5A5169" }}>{result.score}/100</span>
              </div>
            </div>
            <button onClick={reset} className="text-xs transition-colors flex-shrink-0 mt-1" style={{ color: "#8B8499" }}>✕</button>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex gap-2 text-xs">
              <span className="w-20 flex-shrink-0 pt-0.5" style={{ color: "#8B8499" }}>Key signal</span>
              <span className="leading-relaxed" style={{ color: "#1A1530" }}>{result.keySignal}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="w-20 flex-shrink-0 pt-0.5" style={{ color: "#8B8499" }}>Improve by</span>
              <span className="leading-relaxed" style={{ color: "#5A5169" }}>{result.improvementTip}</span>
            </div>
          </div>
          <Link href="/readiness" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium w-full justify-center">
            Take the full readiness assessment →
          </Link>
        </motion.div>
      )}

      {state === "error" && (
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ border: "1px solid rgba(169,56,56,0.25)", background: "rgba(169,56,56,0.04)" }}>
          <span style={{ color: "#A93838" }}>⚠</span>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: "#1A1530" }}>{errorMsg || "Analysis failed"}</p>
            <p className="text-xs mt-0.5" style={{ color: "#8B8499" }}>Only PDF and plain text files are supported</p>
          </div>
          <button onClick={reset} className="text-xs hover:underline" style={{ color: "#5B21B6" }}>Try again</button>
        </div>
      )}
    </motion.div>
  )
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SPOTS_REMAINING = 67
const SPOTS_TOTAL = 100
const SITE_URL = "https://meridiangtv.co.uk"

// ── JSON-LD ───────────────────────────────────────────────────────────────────
const homepageFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the UK Global Talent Visa?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The UK Global Talent Visa is a visa route for leaders and specialists in digital technology, arts, research, and academia. In digital technology, it is endorsed by a designated body and available under two categories: Exceptional Talent (established leaders) and Exceptional Promise (emerging leaders). It grants the right to work in the UK without a sponsor.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Exceptional Talent and Exceptional Promise?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Exceptional Talent is for established leaders with a proven track record of innovation in digital technology. Exceptional Promise is for those earlier in their career who demonstrate clear potential. The key difference is not years of experience — it is the type of evidence available. Talent requires evidence of established impact; Promise requires evidence of emerging potential.",
      },
    },
    {
      "@type": "Question",
      name: "Why do strong Global Talent Visa applications get rejected?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most rejections happen not because the applicant lacks the profile, but because their evidence is generic, their narrative is unclear, or their recommendation letters describe relationships rather than impact. Evaluators follow a specific assessment framework — and applicants who don't present their case in that language fail regardless of their actual credentials.",
      },
    },
    {
      "@type": "Question",
      name: "What does Meridian Advisory do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Meridian Advisory helps founders, engineers, product managers, and senior operators build strategically structured UK Global Talent Visa cases. This includes evidence architecture, personal statement structuring, and recommendation strategy — led by Amit Tyagi, a UK Global Talent visa holder under the Exceptional Talent category.",
      },
    },
    {
      "@type": "Question",
      name: "Who is Amit Tyagi?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amit Tyagi is a fintech founder and startup operator who received UK Global Talent recognition under the Exceptional Talent category. He founded Meridian Advisory to help other ambitious builders structure their applications correctly — from an insider's perspective of what evaluators actually look for.",
      },
    },
    {
      "@type": "Question",
      name: "How much does UK Global Talent Visa advisory cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Meridian Advisory offers three engagement tiers: a Readiness Diagnostic at £500, Application Advisory at £2,500, and a Full Case Build at £5,500. All are fixed-price with no open-ended retainers. The free 4-minute readiness assessment is the best starting point to understand which tier fits your situation.",
      },
    },
    {
      "@type": "Question",
      name: "Can I apply for the UK Global Talent Visa without a job offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The UK Global Talent Visa does not require a job offer or employer sponsorship. You apply based on your personal profile, evidence of exceptional work, and endorsement from a designated body. This is one of its main advantages over the Skilled Worker visa route.",
      },
    },
  ],
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.15 })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  )
}


// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      style={{
        background: "radial-gradient(900px 600px at 22% 18%, rgba(91,33,182,.18), transparent 60%), radial-gradient(700px 500px at 85% 28%, rgba(184,137,59,.14), transparent 65%), #F6F1E7",
      }}>
      <div className="absolute inset-0 dot-grid opacity-40" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* Two pills */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="flex justify-center gap-3 flex-wrap mb-9">
          {/* Urgency pill */}
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ border: "1px solid rgba(169,56,56,0.35)", background: "rgba(169,56,56,0.08)", color: "#A93838" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#A93838" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#A93838" }} />
            </span>
            <strong style={{ fontWeight: 600 }}>{SPOTS_REMAINING} of {SPOTS_TOTAL}</strong>&nbsp;free assessments remaining this quarter
          </span>
          {/* Gold LinkedIn pill */}
          <a href="https://www.linkedin.com/in/amitisb1tyagi/"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{ border: "1px solid rgba(184,137,59,0.35)", background: "rgba(184,137,59,0.10)", color: "#B8893B" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(184,137,59,0.18)"
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(184,137,59,0.55)"
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(184,137,59,0.10)"
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(184,137,59,0.35)"
            }}>
            Amit Tyagi — UK Global Talent · Exceptional Talent
            <span className="w-4 h-4 rounded flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: "#0A66C2", fontSize: "9px" }}>in</span>
          </a>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-7xl leading-[1.08] tracking-tight mb-6"
          style={{ color: "#1A1530" }}>
          You&apos;re probably good enough for{" "}
          <span className="text-gradient-brand">UK Global Talent.</span>
          {" "}Your application probably{" "}
          <em className="not-italic text-gradient-brand">isn&apos;t.</em>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "#5A5169" }}>
          Tech Nation rejects strong applications every month — not because the builder isn&apos;t exceptional,
          but because their evidence doesn&apos;t speak the evaluator&apos;s language. Amit was approved under{" "}
          <strong style={{ color: "#1A1530" }}>Exceptional Talent</strong>. He knows exactly what that language
          sounds like — and exactly where most applicants lose the decision.
        </motion.p>

        {/* CTA buttons */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link href="/readiness"
            className="btn-primary text-white px-8 py-4 font-semibold text-base inline-flex items-center justify-center gap-2.5"
            style={{ borderRadius: "999px" }}>
            Check if my case is ready — free →
          </Link>
          <a href="/about"
            className="btn-secondary px-8 py-4 font-medium text-base inline-flex items-center justify-center gap-2"
            style={{ color: "#5B21B6", borderRadius: "999px" }}>
            How Amit got his visa
          </a>
        </motion.div>

        {/* Trust line */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.62 }}
          className="text-xs font-mono mb-6" style={{ color: "#8B8499", letterSpacing: "0.04em" }}>
          ⚡ Free · 4 minutes · No email required ·{" "}
          <strong style={{ color: "#A93838", fontWeight: 600 }}>{SPOTS_REMAINING} spots left</strong>{" "}before this closes
        </motion.p>

        {/* Live ticker */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68 }}
          className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full mb-8"
          style={{ background: "#FFFFFF", border: "1px solid #E2D9C4", fontSize: "13px", color: "#5A5169" }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "#5C7A5C", boxShadow: "0 0 0 3px rgba(92,122,92,.2)" }} />
          <span>4 builders took the readiness check in the last 24 hours ·{" "}
            <strong style={{ color: "#1A1530", fontWeight: 600 }}>Sanjay (Bengaluru)</strong>{" "}just scored 71/100
          </span>
        </motion.div>

        {/* Document checker */}
        <DocumentChecker />

        {/* Proof bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8"
          style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12px", letterSpacing: "0.05em", color: "#5A5169" }}>
          {["20+ builders advised", "Exceptional Talent & Promise", "India · UAE · Singapore · Europe", "4-min free readiness check"].map((text) => (
            <span key={text} className="flex items-center gap-2">
              <span style={{ color: "#B8893B" }}>✦</span>{text}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
          className="w-0.5 h-7 rounded-full"
          style={{ background: "linear-gradient(to bottom, #5B21B6, transparent)" }} />
      </motion.div>
    </section>
  )
}

// ── Trust Bar (dark) ──────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { value: "UK Global Talent",  label: "Exceptional Talent — Amit's own recognition", col: "#D4A647" },
    { value: "20+ builders",      label: "Across India, UAE, Singapore & Europe",        col: "#2BA89A" },
    { value: "48-hr response",    label: "Every application reviewed personally",         col: "#FFFFFF" },
    { value: "£500 – £5,500",     label: "Fixed pricing · no retainers",                 col: "#C49AED" },
    { value: "Advisory only",     label: "Not immigration legal advice",                  col: "#6B8E68" },
  ]
  return (
    <section className="py-8 px-6 relative overflow-hidden" style={{ background: "#1A1530" }}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #B8893B, #5B21B6, #B8893B, transparent)", opacity: 0.7 }} />
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        {items.map((item, i) => (
          <FadeUp key={item.value} delay={i * 0.07} className="flex flex-col gap-1.5">
            <div className="font-display text-xl leading-tight" style={{ color: item.col }}>{item.value}</div>
            <div className="font-mono text-[10.5px] leading-snug uppercase tracking-wide"
              style={{ color: "rgba(255,255,255,0.5)" }}>{item.label}</div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

// ── Who This Is For ───────────────────────────────────────────────────────────
function WhoThisIsFor() {
  const professions = [
    { label: "Startup Founders",         col: "#5B21B6" },
    { label: "Product Managers",         col: "#0F766E" },
    { label: "Software Engineers",       col: "#B8893B" },
    { label: "CTOs",                     col: "#86198F" },
    { label: "AI / ML Engineers",        col: "#2BA89A" },
    { label: "Data Engineers",           col: "#5B21B6" },
    { label: "Fintech Professionals",    col: "#0F766E" },
    { label: "SaaS Founders",            col: "#B8893B" },
    { label: "Deep Tech Founders",       col: "#86198F" },
    { label: "Climate Tech Founders",    col: "#2BA89A" },
    { label: "Healthtech Founders",      col: "#5B21B6" },
    { label: "Engineering Managers",     col: "#0F766E" },
    { label: "Cybersecurity Engineers",  col: "#B8893B" },
    { label: "Startup Operators",        col: "#86198F" },
    { label: "Angel Investors",          col: "#2BA89A" },
    { label: "Open Source Contributors", col: "#5B21B6" },
  ]
  return (
    <section id="who" className="py-20 px-6" style={{ background: "#F6F1E7", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-5xl mx-auto text-center">
        <FadeUp>
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>Who this is for</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight mb-6" style={{ color: "#1A1530" }}>
            Built for every kind of <span className="text-gradient-brand italic-accent">exceptional builder.</span>
          </h2>
          <p className="text-base max-w-2xl mx-auto leading-relaxed" style={{ color: "#5A5169" }}>
            The UK Global Talent Visa is open to any digital technology professional with evidence of
            exceptional work. Here are the profiles Meridian has worked with most.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex flex-wrap gap-2.5 justify-center mt-10">
            {professions.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2D9C4",
                  color: "#1A1530",
                }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.col }} />
                {p.label}
              </span>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={0.2} className="mt-11">
          <p style={{ color: "#5A5169", fontSize: "15px" }}>
            From India, UAE, Singapore, Nigeria, Brazil, the US, and across Europe.{" "}
            <a href="/readiness" style={{ color: "#5B21B6", fontWeight: 600, marginLeft: "8px" }}>
              Find out where your profile stands →
            </a>
          </p>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Pain ──────────────────────────────────────────────────────────────────────
function Pain() {
  return (
    <section className="py-24 px-6" style={{ background: "#F6F1E7", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>The problem</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl" style={{ color: "#1A1530" }}>
            Why exceptional builders <em className="not-italic" style={{ color: "#A93838" }}>get rejected.</em>
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-5 mt-14">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0, duration: 0.55 }}
            className="p-9 relative overflow-hidden transition-all hover:-translate-y-1"
            style={{ background: "#FFFFFF", border: "1px solid #E2D9C4", borderRadius: "20px", boxShadow: "0 1px 2px rgba(26,21,48,.04), 0 8px 24px rgba(26,21,48,.05)" }}>
            <div className="font-display leading-none mb-4"
              style={{ fontSize: "88px", letterSpacing: "-0.04em", background: "linear-gradient(135deg,#5B21B6,#86198F)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              ~80%
            </div>
            <h3 className="font-bold text-lg mb-3" style={{ color: "#1A1530" }}>of strong applications are rejected</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#5A5169" }}>
              Not because the builder isn&apos;t exceptional — because their case doesn&apos;t demonstrate it the way the assessment panel expects.
            </p>
          </motion.div>

          {/* Card 2 — featured dark */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.55 }}
            className="p-9 relative overflow-hidden transition-all hover:-translate-y-1"
            style={{ background: "linear-gradient(155deg, #1A0A35 0%, #2E0F69 100%)", border: "none", borderRadius: "20px", color: "white" }}>
            <div className="font-display leading-none mb-4"
              style={{ fontSize: "88px", letterSpacing: "-0.04em", background: "linear-gradient(135deg, #D4A647, #B8893B)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              #1
            </div>
            <h3 className="font-bold text-lg mb-3" style={{ color: "white" }}>rejection reason: generic evidence</h3>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
              Most applicants describe what they did. Evaluators need to see scope, independence, and influence — in that order.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.55 }}
            className="p-9 relative overflow-hidden transition-all hover:-translate-y-1"
            style={{ background: "#FFFFFF", border: "1px solid #E2D9C4", borderRadius: "20px", boxShadow: "0 1px 2px rgba(26,21,48,.04), 0 8px 24px rgba(26,21,48,.05)" }}>
            <div className="font-display leading-none mb-4"
              style={{ fontSize: "88px", letterSpacing: "-0.04em", background: "linear-gradient(135deg,#0F766E,#2BA89A)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              3 of 3
            </div>
            <h3 className="font-bold text-lg mb-3" style={{ color: "#1A1530" }}>recommendation letters need to be specific</h3>
            <p className="text-sm leading-relaxed" style={{ color: "#5A5169" }}>
              One weak letter — even with two strong ones — significantly weakens the submission. Most applicants don&apos;t know how to brief recommenders.
            </p>
          </motion.div>
        </div>

        {/* Pain quote */}
        <FadeUp delay={0.3} className="mt-7">
          <div className="p-10 rounded-2xl"
            style={{ background: "linear-gradient(120deg, rgba(91,33,182,0.05), rgba(184,137,59,0.04))", border: "1px solid rgba(91,33,182,.15)" }}>
            <p className="font-display text-2xl leading-snug" style={{ color: "#1A1530", letterSpacing: "-0.01em" }}>
              <strong style={{ fontWeight: 400, color: "#5B21B6" }}>Amit was in your position.</strong>{" "}
              He was approved under Exceptional Talent — and spent time understanding exactly why the case worked, what evaluators actually look for, and where most applicants lose the decision before they&apos;ve started.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Cost of Getting It Wrong ──────────────────────────────────────────────────
function CostOfWrong() {
  const rows = [
    { l: "Endorsement fee (UKVI)", sub: "Non-refundable", v: "£561", isTotal: false },
    { l: "Lost time", sub: "4–8 weeks preparing + 8 weeks waiting", v: "~3 months", isTotal: false },
    { l: "Recommender goodwill", sub: "Hard to ask the same names twice", v: "Burned", isTotal: false },
    { l: "Cooldown before reapplying", sub: "Strategic — to gather new evidence", v: "6–12 months", isTotal: false },
    { l: "UK visa Plan B (Skilled Worker)", sub: "If you give up on Global Talent", v: "~£4–8K", isTotal: false },
    { l: "Total downside risk", sub: "", v: "~£10K+ & 12 mo", isTotal: true },
  ]
  return (
    <section className="py-24 px-6" style={{ background: "#EDE6D5", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>The cost of getting it wrong</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl" style={{ color: "#1A1530" }}>
            A rejected application costs{" "}
            <span className="text-gradient-brand italic-accent">more than £500.</span>
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed" style={{ color: "#5A5169", fontSize: "17px", lineHeight: "1.55" }}>
            Most applicants think the gamble is between £0 (DIY) and £5,500 (full advisory). The real cost of a rejection — money, time, momentum — is the number nobody runs the math on.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-14 items-center mt-14">
          {/* Ledger */}
          <FadeUp delay={0.1}>
            <div className="p-8 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid #E2D9C4", boxShadow: "0 1px 2px rgba(26,21,48,.04), 0 8px 24px rgba(26,21,48,.05)" }}>
              <p className="text-xs font-mono tracking-widest uppercase mb-2" style={{ color: "#8B8499" }}>If your application is rejected</p>
              {rows.map((row) => (
                <div key={row.l}
                  className="flex justify-between items-center gap-4 py-4"
                  style={{
                    borderBottom: row.isTotal ? "none" : "1px dashed #E2D9C4",
                    borderTop: row.isTotal ? "2px solid #1A1530" : "none",
                    marginTop: row.isTotal ? "8px" : "0",
                  }}>
                  <div style={{ flex: 1 }}>
                    <span className="text-sm" style={{ color: "#1A1530", fontWeight: row.isTotal ? 600 : 400 }}>{row.l}</span>
                    {row.sub && <span className="block text-xs mt-0.5" style={{ color: "#8B8499" }}>{row.sub}</span>}
                  </div>
                  {row.isTotal ? (
                    <span className="font-display text-3xl flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#5B21B6,#86198F,#B8893B)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                      {row.v}
                    </span>
                  ) : (
                    <span className="font-display text-xl flex-shrink-0" style={{ color: "#A93838" }}>{row.v}</span>
                  )}
                </div>
              ))}
              {/* VS row */}
              <div className="flex justify-between items-center pt-5 mt-2"
                style={{ borderTop: "1px solid #E2D9C4", fontFamily: "monospace", fontSize: "12px", letterSpacing: "0.04em", color: "#5A5169" }}>
                <span>Application Advisory engagement</span>
                <strong className="font-display text-xl" style={{ color: "#5B21B6" }}>£2,500</strong>
              </div>
            </div>
          </FadeUp>

          {/* Right copy */}
          <FadeUp delay={0.2}>
            <h3 className="font-display text-3xl leading-tight mb-5" style={{ color: "#1A1530" }}>
              It is significantly{" "}
              <span className="text-gradient-brand italic-accent">cheaper</span>{" "}
              to get the case right the first time.
            </h3>
            <p className="leading-relaxed mb-5" style={{ color: "#5A5169", fontSize: "16px", lineHeight: "1.6" }}>
              A rejection isn&apos;t a setback — it&apos;s a 12-month delay with sunk costs, a burned recommender list, and a Plan B that locks you into employer sponsorship.
            </p>
            <p className="leading-relaxed mb-8" style={{ color: "#5A5169", fontSize: "16px", lineHeight: "1.6" }}>
              Advisory is not an expense; it&apos;s a way to compress the variance. Amit&apos;s job is to make sure your case is the best version of itself before it goes anywhere near a panel.
            </p>
            <Link href="/readiness"
              className="btn-primary inline-flex items-center gap-2 px-7 py-4 text-white font-semibold"
              style={{ borderRadius: "999px" }}>
              Check my readiness — free →
            </Link>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ── Scorecard CTA ─────────────────────────────────────────────────────────────
function ScorecardCTA() {
  const dims = [
    { label: "Evidence strength",       val: 72, col: "#5B21B6" },
    { label: "Narrative clarity",       val: 45, col: "#0F766E" },
    { label: "Recommendation quality",  val: 80, col: "#B8893B" },
    { label: "External validation",     val: 58, col: "#86198F" },
  ]
  const ref = useRef(null)
  const visible = useInView(ref, { once: true })

  const r = 84, size = 200
  const circ = 2 * Math.PI * r
  const offset = circ - (67 / 100) * circ

  return (
    <section className="py-24 px-6" ref={ref} style={{ background: "#F6F1E7" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <FadeUp>
            <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>Free · 4 minutes</p>
            <h2 className="font-display text-4xl md:text-5xl leading-tight mb-6" style={{ color: "#1A1530" }}>
              Know exactly where your{" "}
              <span className="text-gradient-brand italic-accent">application stands.</span>
            </h2>
            <p className="leading-relaxed mb-6" style={{ color: "#5A5169" }}>
              Answer 20 questions. Get a scored readiness report across the 4 dimensions Tech Nation evaluates — and a specific recommendation on what to fix first.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "No account · No email needed to start",
                "Personalised plan: Diagnostic, Advisory or Full Build",
                "Top 3 things to fix — specific to your role",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm" style={{ color: "#1A1530" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                    style={{ background: "#5B21B6" }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/readiness"
              className="btn-primary inline-flex items-center gap-2.5 px-7 py-4 text-white font-semibold"
              style={{ borderRadius: "999px" }}>
              Take the free assessment →
            </Link>
            <p className="text-xs mt-4 font-mono" style={{ color: "#8B8499", letterSpacing: "0.05em" }}>
              ⚡ &nbsp;{SPOTS_REMAINING} of {SPOTS_TOTAL} free assessments left this quarter
            </p>
          </FadeUp>

          {/* Right score ring card */}
          <FadeUp delay={0.15}>
            <div className="rounded-2xl p-9 relative overflow-hidden"
              style={{ background: "#FFFFFF", border: "1px solid #E2D9C4", boxShadow: "0 2px 4px rgba(26,21,48,.04), 0 12px 32px rgba(26,21,48,.08)" }}>
              <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "linear-gradient(90deg, #5B21B6, #86198F, #B8893B)" }} />
              <p className="text-center font-mono text-xs tracking-widest uppercase mb-4" style={{ color: "#8B8499" }}>Sample report</p>
              <div style={{ width: size, height: size, margin: "0 auto" }} className="relative">
                <svg width={size} height={size} style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#5B21B6"/>
                      <stop offset="55%" stopColor="#6D28D9"/>
                      <stop offset="100%" stopColor="#B8893B"/>
                    </linearGradient>
                  </defs>
                  <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ECE4D2" strokeWidth="14"/>
                  <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
                    stroke="url(#ringg)" strokeWidth="14" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={visible ? { strokeDashoffset: offset } : {}}
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                    transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
                  <text x={size/2} y={size/2 + 16} textAnchor="middle" fontFamily="var(--font-display, Georgia)" fontSize="64" fill="#1A1530">67</text>
                  <text x={size/2} y={size/2 + 36} textAnchor="middle" fontFamily="monospace" fontSize="10" fill="#8B8499" letterSpacing="3">/ 100</text>
                </svg>
              </div>
              <div className="mt-6 space-y-3.5">
                {dims.map((d, i) => (
                  <div key={d.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm" style={{ color: "#5A5169", fontWeight: 500 }}>{d.label}</span>
                      <span className="text-sm font-mono font-semibold" style={{ color: "#1A1530" }}>{d.val}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#E2D9C4" }}>
                      <motion.div initial={{ width: 0 }} animate={visible ? { width: `${d.val}%` } : {}}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${d.col}, ${d.col}80)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ── Services ──────────────────────────────────────────────────────────────────
function Services() {
  const services = [
    {
      n: "01",
      title: "Evidence Architecture",
      desc: "Map every proof point in your career against the specific signals evaluators are trained to look for. Identify what's missing, what's weak, and what to lead with.",
      items: ["Proof point audit", "Signal gap analysis", "Evidence sequencing strategy"],
      col: "#5B21B6",
    },
    {
      n: "02",
      title: "Narrative Engineering",
      desc: "Build the career story that creates a coherent, compelling case — not a job history. Structure it so evaluators can read your trajectory in 90 seconds.",
      items: ["Personal statement drafting", "Career arc positioning", "Role-by-role framing"],
      col: "#0F766E",
    },
    {
      n: "03",
      title: "Recommendation Architecture",
      desc: "Identify the right recommenders, coach them on what to write, and structure a three-letter portfolio where each letter covers a different dimension of your credibility.",
      items: ["Recommender selection strategy", "Brief templates per recommender", "Letter review and strengthening"],
      col: "#B8893B",
    },
  ]
  return (
    <section id="services" className="py-24 px-6" style={{ background: "#EDE6D5", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp className="mb-14">
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>What Amit does</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-2xl" style={{ color: "#1A1530" }}>
            Not filing. Not form-filling.{" "}
            <span className="text-gradient-brand italic-accent">Case-building.</span>
          </h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-10 flex flex-col relative overflow-hidden transition-all"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2D9C4",
                borderRadius: "20px",
                boxShadow: "0 1px 2px rgba(26,21,48,.04), 0 8px 24px rgba(26,21,48,.05)",
              }}>
              <div className="absolute top-0 left-0 w-16 h-0.5" style={{ background: s.col }} />
              <div className="font-display text-5xl leading-none mb-3" style={{ color: s.col }}>{s.n}</div>
              <h3 className="font-bold text-xl mb-3" style={{ color: "#1A1530" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed flex-1" style={{ color: "#5A5169" }}>{s.desc}</p>
              <ul className="mt-5 pt-4 space-y-2" style={{ borderTop: "1px solid #E2D9C4" }}>
                {s.items.map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "#5A5169" }}>
                    <span style={{ color: "#B8893B", fontWeight: 600 }}>→</span>{item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Process ───────────────────────────────────────────────────────────────────
function Process() {
  const steps = [
    { n: "01", title: "Take the free readiness check", desc: "20 questions. A scored report across 4 dimensions. Know exactly where your case stands before you invest anything.", tag: "FREE · 4 MIN", col: "#5B21B6", href: "/readiness" },
    { n: "02", title: "Apply for a Strategic Review", desc: "Amit reviews your application and responds personally within 48 hours with one specific observation about your case.", tag: "48-HR RESPONSE", col: "#0F766E", href: "/apply" },
    { n: "03", title: "Build the case together", desc: "Evidence mapping, personal statement, recommendation coaching — structured around the evaluator's framework, not a template.", tag: "£500 – £5,500", col: "#86198F", href: "/apply" },
    { n: "04", title: "Submit with confidence", desc: "A submission-ready case where every component has been stress-tested against the criteria that determines approval.", tag: "NO OPEN RETAINERS", col: "#B8893B", href: "/apply" },
  ]
  return (
    <section id="process" className="py-24 px-6" style={{ background: "#F6F1E7", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp className="mb-14">
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>The process</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-2xl" style={{ color: "#1A1530" }}>
            Four steps to a{" "}
            <span className="text-gradient-brand italic-accent">stronger case.</span>
          </h2>
        </FadeUp>
        <div className="grid md:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <motion.a key={s.n} href={s.href}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="p-7 block transition-all"
              style={{
                background: "#FFFFFF",
                border: "1px solid #E2D9C4",
                borderRadius: "20px",
                boxShadow: "0 1px 2px rgba(26,21,48,.04), 0 8px 24px rgba(26,21,48,.05)",
                textDecoration: "none",
              }}>
              <div className="flex justify-between items-center mb-6">
                <span className="font-mono text-xs tracking-widest" style={{ color: "#8B8499" }}>STEP {s.n}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-display text-base"
                  style={{ background: "#F6F1E7", border: `1px solid ${s.col}50`, color: s.col }}>{s.n}</div>
              </div>
              <h3 className="font-bold text-base mb-2 leading-snug" style={{ color: "#1A1530" }}>{s.title}</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#5A5169" }}>{s.desc}</p>
              <span className="inline-block text-xs font-mono font-semibold px-2.5 py-1 rounded-md"
                style={{ background: `${s.col}12`, color: s.col, letterSpacing: "0.04em" }}>{s.tag}</span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── About Amit ────────────────────────────────────────────────────────────────
function AboutAmit() {
  const facts = [
    { l: "Recognition", v: "UK Global Talent — Exceptional Talent" },
    { l: "Background",  v: "Fintech · Startups · Product" },
    { l: "Style",       v: "Specific to your case — not a template" },
    { l: "Capacity",    v: "Limited engagements per month" },
    { l: "Not a",       v: "Lawyer or OISC-regulated advisor" },
  ]
  return (
    <section id="about" className="py-24 px-6" style={{ background: "#EDE6D5", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>About Amit</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-3xl mb-14" style={{ color: "#1A1530" }}>
            He didn&apos;t learn this from a textbook.{" "}
            <span className="text-gradient-brand italic-accent">He went through it.</span>
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: copy */}
          <FadeUp delay={0.05}>
            <p className="leading-relaxed mb-5" style={{ color: "#5A5169", fontSize: "17.5px", lineHeight: "1.62" }}>
              Amit Tyagi received UK Global Talent recognition under the{" "}
              <strong style={{ color: "#1A1530", fontWeight: 600 }}>Exceptional Talent</strong>{" "}
              category through a strategically engineered, evidence-led application. Not by luck. By understanding exactly how the assessment framework evaluates applicants — and building a case that spoke directly to that framework.
            </p>
            <p className="leading-relaxed mb-5" style={{ color: "#5A5169", fontSize: "17.5px", lineHeight: "1.62" }}>
              His background is in fintech and startups, as a founder, operator, and product builder. He knows how exceptional work actually looks from the inside — and more importantly, how to translate that into the language evaluators recognise.
            </p>
            <p className="leading-relaxed mb-8" style={{ color: "#5A5169", fontSize: "17.5px", lineHeight: "1.62" }}>
              His advisory is not built on a template. Every engagement starts from your specific situation, your evidence, your career — and builds toward a case that is uniquely yours.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/apply"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-white font-semibold text-sm"
                style={{ borderRadius: "999px" }}>
                Apply to work with Amit →
              </Link>
              <a href="/about"
                className="btn-secondary inline-flex items-center gap-2 px-6 py-3 font-medium text-sm"
                style={{ color: "#5B21B6", borderRadius: "999px" }}>
                Read the full story
              </a>
            </div>
          </FadeUp>

          {/* Right: amit-card */}
          <FadeUp delay={0.15}>
            <div className="rounded-2xl p-7" style={{ background: "#FFFFFF", border: "1px solid #E2D9C4", boxShadow: "0 1px 2px rgba(26,21,48,.04), 0 8px 24px rgba(26,21,48,.05)" }}>
              {/* Portrait */}
              <div className="relative rounded-2xl mb-5 overflow-hidden"
                style={{
                  aspectRatio: "1.05",
                  background: "linear-gradient(155deg, #1A0A35 0%, #2E0F69 60%, #0E0820 100%)",
                  backgroundImage: "url('/amit.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center 18%",
                  minHeight: "240px",
                }}>
                {/* Overlay gradients */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(180deg, rgba(20,16,40,0) 50%, rgba(20,16,40,0.55) 100%)" }} />
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 12% 88%, rgba(91,33,182,.35), transparent 45%)" }} />
                {/* Badge top-right */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full z-10"
                  style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", color: "white", fontFamily: "monospace", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Exceptional Talent
                </div>
                {/* Corner text bottom-left */}
                <span className="absolute bottom-5 left-5 z-10"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.18em" }}>
                  AMIT TYAGI
                </span>
              </div>
              {/* Fact rows */}
              {facts.map((row, i) => (
                <div key={row.l}
                  className="flex justify-between items-start gap-5 py-3.5"
                  style={{ borderBottom: i < facts.length - 1 ? "1px dashed #E2D9C4" : "none" }}>
                  <span className="font-mono text-xs uppercase tracking-wider flex-shrink-0" style={{ color: "#8B8499" }}>{row.l}</span>
                  <span className="text-sm font-semibold text-right" style={{ color: "#1A1530" }}>{row.v}</span>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { quote: "I had strong work behind me but no idea how to present it the way assessors look for. Amit restructured my evidence portfolio and personal statement in three weeks. Approved on first attempt.", name: "S", title: "Founder, B2B SaaS", badge: "Exceptional Talent", badgeType: "talent" },
  { quote: "As a PM my impact was always embedded in team outcomes. Amit helped me reframe five years of product work into a case that made my individual contribution undeniable to the assessors.", name: "P", title: "Senior Product Manager", badge: "Exceptional Promise", badgeType: "promise" },
  { quote: "I'd been in ML for eight years but all my evidence was internal. Amit helped me identify the external signals I'd been ignoring — papers, deployment impact, open source — and build a real case.", name: "R", title: "ML Engineer, Series B", badge: "Exceptional Talent", badgeType: "talent" },
  { quote: "My first attempt was rejected. Amit read the feedback letter and immediately identified what was missing. My second application was completely different — and approved in under two weeks.", name: "K", title: "CTO, Fintech startup", badge: "Reapplication approved", badgeType: "reapp" },
  { quote: "Coming from Singapore, I wasn't sure my profile would translate. Amit knew exactly how to frame the scale of what I'd built in Southeast Asia in terms a UK panel would recognise.", name: "J", title: "Co-founder, Consumer App", badge: "Exceptional Talent", badgeType: "talent" },
  { quote: "Three of my recommendation letters were describing our working relationship instead of my impact. Amit coached me on what they should say — and coached my recommenders too. The difference was stark.", name: "M", title: "Engineering Manager", badge: "Exceptional Promise", badgeType: "promise" },
  { quote: "I thought listing my GitHub stats was strong evidence. Amit showed me they weren't framed as evidence at all — just facts. Learning to make the argument rather than present the data changed everything.", name: "A", title: "Senior Software Engineer", badge: "Exceptional Talent", badgeType: "talent" },
  { quote: "My personal statement before working with Amit was a CV in paragraph form. He helped me understand the difference between describing what I did and arguing what it meant for the sector.", name: "N", title: "Growth Lead, VC-backed", badge: "Exceptional Promise", badgeType: "promise" },
  { quote: "What I valued most was that Amit had done it himself. He wasn't reading from a playbook — he was telling me what actually worked, what assessors genuinely respond to, and what to cut.", name: "D", title: "Startup Operator, UAE", badge: "Exceptional Talent", badgeType: "talent" },
  { quote: "I was going to apply under Promise because I didn't think I qualified for Talent. Amit looked at my profile and told me I was underselling myself significantly. I submitted Talent and was approved.", name: "V", title: "Data Scientist, Series A", badge: "Exceptional Talent", badgeType: "talent" },
  { quote: "I had two failed attempts before finding Amit. He identified the exact pattern in my evidence that wasn't landing — I wasn't showing sector influence, only personal impact. Third attempt approved.", name: "T", title: "Founder & Angel Investor", badge: "Exceptional Talent", badgeType: "talent" },
]

function Testimonials() {
  const badgeStyle = (type: string) => {
    if (type === "promise") return { background: "rgba(15,118,110,.1)", color: "#0F766E" }
    if (type === "reapp") return { background: "rgba(169,56,56,.08)", color: "#A93838" }
    return { background: "rgba(91,33,182,.08)", color: "#5B21B6" }
  }
  return (
    <section className="py-24 px-6" style={{ background: "#F6F1E7", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp>
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>In their words</p>
          <div className="flex justify-between items-end flex-wrap gap-6 mb-14">
            <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-2xl" style={{ color: "#1A1530" }}>
              <span className="text-gradient-brand italic-accent">20+ builders</span> helped.
            </h2>
            <p className="max-w-xs text-sm leading-relaxed" style={{ color: "#5A5169" }}>
              Founders, PMs, engineers, and operators across India, UAE, Singapore, and Europe.
            </p>
          </div>
        </FadeUp>
        {/* Masonry 2-column */}
        <div style={{ columns: 2, columnGap: "20px" }} className="max-md:block">
          <style>{`@media (max-width: 768px) { .testimonial-masonry { columns: 1 !important; } }`}</style>
          <div className="testimonial-masonry" style={{ columns: 2, columnGap: "20px" }}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: (i % 4) * 0.08 }}
                className="break-inside-avoid mb-5 p-7 transition-all hover:-translate-y-0.5"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2D9C4",
                  borderRadius: "18px",
                  boxShadow: "0 1px 2px rgba(26,21,48,.04), 0 8px 24px rgba(26,21,48,.05)",
                }}>
                <p className="font-display text-lg leading-snug mb-5"
                  style={{ color: "#1A1530", letterSpacing: "-0.01em" }}>
                  <span style={{ fontSize: "36px", color: "#5B21B6", marginRight: "2px", lineHeight: 0, verticalAlign: "-10px" }}>&ldquo;</span>
                  {t.quote}
                </p>
                <div className="flex justify-between items-center pt-3.5" style={{ borderTop: "1px solid #E2D9C4" }}>
                  <span className="flex items-center gap-2.5 text-xs" style={{ color: "#5A5169" }}>
                    <span className="w-8 h-8 rounded-full inline-flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{ background: "#1A1530", color: "white", border: "2px solid #B8893B" }}>
                      {t.name}
                    </span>
                    {t.title}
                  </span>
                  <span className="text-xs font-mono font-semibold px-2 py-1 rounded-md"
                    style={{ ...badgeStyle(t.badgeType), letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {t.badge}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const tiers = [
    {
      tier: "Tier 01 · Diagnostic",
      name: "Readiness Diagnostic",
      best: "Still deciding if you're ready",
      price: "£500",
      perq: "CREDITED IF YOU CONTINUE TO ADVISORY",
      desc: "A written diagnostic of your case — where you are strong, where you're weak, and what to fix before you spend time on a full application.",
      items: [
        "Scored profile audit (4 dimensions)",
        "Evidence gap analysis — specific to your role",
        "Top 3 things to fix before you apply",
        "One written insight brief from Amit",
      ],
      cta: "Book a Diagnostic →",
      highlight: false,
      col: "#5B21B6",
    },
    {
      tier: "Tier 02 · Advisory",
      name: "Application Advisory",
      best: "Ready to build and submit",
      price: "£2,500",
      perq: "FIXED · NO RETAINER · NO SURPRISES",
      desc: "The full advisory engagement. Amit works through your evidence, personal statement, and recommendation strategy with you — sessions, written feedback, and async support.",
      items: [
        "Everything in Diagnostic",
        "2 × focused sessions with Amit",
        "Personal statement structuring + feedback",
        "Recommendation strategy (who, what, how)",
        "Evidence sequencing document",
        "30-day async support",
      ],
      cta: "Apply for Advisory →",
      highlight: true,
      col: "#D4A647",
    },
    {
      tier: "Tier 03 · Full Build",
      name: "Full Case Build",
      best: "Want the case built end-to-end",
      price: "£5,500",
      perq: "LIMITED — 2 SLOTS PER MONTH",
      desc: "Amit builds the full submission with you — every component reviewed, every letter coached, personal statement iteration, and a final readiness check before you submit.",
      items: [
        "Everything in Application Advisory",
        "Submission-ready personal statement",
        "Recommendation letter coaching per recommender",
        "Final readiness review (go / not yet)",
        "90-day async support",
      ],
      cta: "Apply for Full Build →",
      highlight: false,
      col: "#B8893B",
    },
  ]
  return (
    <section id="pricing" className="py-24 px-6" style={{ background: "#EDE6D5", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp className="mb-14">
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>Pricing</p>
          <div className="flex justify-between items-end flex-wrap gap-6">
            <div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight max-w-xl mb-4" style={{ color: "#1A1530" }}>
                Three tiers. One goal.{" "}
                <span className="text-gradient-brand italic-accent">A stronger case.</span>
              </h2>
              <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ color: "#A93838", border: "1px solid rgba(169,56,56,0.3)", background: "rgba(169,56,56,0.08)" }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: "#A93838" }} />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#A93838" }} />
                </span>
                Only 8 advisory slots left this quarter
              </span>
            </div>
          </div>
          <p className="mt-5 max-w-2xl leading-relaxed" style={{ color: "#5A5169", fontSize: "16px" }}>
            Fixed prices. No open-ended retainers. No surprises. Amit recommends the right tier after reviewing your application — you don&apos;t pay until that&apos;s confirmed.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`p-9 flex flex-col relative overflow-hidden ${t.highlight ? "md:-mt-4" : ""}`}
              style={t.highlight ? {
                background: "linear-gradient(155deg, #1A0A35 0%, #2E0F69 100%)",
                border: "none",
                borderRadius: "24px",
                boxShadow: "0 30px 60px -20px rgba(91,33,182,.4)",
                zIndex: 2,
              } : {
                background: "#FFFFFF",
                border: "1px solid #E2D9C4",
                borderRadius: "24px",
                boxShadow: "0 1px 2px rgba(26,21,48,.04), 0 8px 24px rgba(26,21,48,.05)",
              }}>
              {t.highlight && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: "linear-gradient(90deg, #5B21B6, #B8893B)" }} />
                  <div className="absolute right-[-100px] top-[-100px] w-[300px] h-[300px] rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(184,137,59,.2), transparent 70%)" }} />
                </>
              )}
              {/* Most chosen ribbon for featured */}
              {t.highlight && (
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-4 self-start"
                  style={{ background: "linear-gradient(135deg, #B8893B, #D4A647)", color: "white", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.16em", fontWeight: 600, textTransform: "uppercase", boxShadow: "0 6px 16px -4px rgba(184,137,59,.45)" }}>
                  ★ &nbsp;Most chosen
                </div>
              )}
              <div className="relative z-10 flex flex-col flex-1">
                <p className="font-mono text-xs uppercase tracking-widest mb-2"
                  style={{ color: t.highlight ? "rgba(255,255,255,0.55)" : "#8B8499" }}>{t.tier}</p>
                <h3 className="font-display text-2xl leading-tight mb-1"
                  style={{ color: t.highlight ? "white" : "#1A1530" }}>{t.name}</h3>
                <p className="text-xs mb-6 italic"
                  style={{ color: t.highlight ? "rgba(255,255,255,0.55)" : "#8B8499" }}>Best for: {t.best}</p>
                <div className="font-display text-5xl leading-none mb-1"
                  style={t.highlight ? { background: "linear-gradient(135deg, #FFFFFF 0%, #D4A647 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } : { color: "#1A1530" }}>
                  {t.price}
                </div>
                <p className="font-mono text-xs mb-6" style={{ color: t.highlight ? "rgba(255,255,255,0.45)" : "#8B8499", letterSpacing: "0.08em" }}>{t.perq}</p>
                <p className="text-sm leading-relaxed mb-6" style={{ color: t.highlight ? "rgba(255,255,255,0.7)" : "#5A5169" }}>{t.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {t.items.map(d => (
                    <li key={d} className="flex items-start gap-2.5 text-sm"
                      style={{ color: t.highlight ? "rgba(255,255,255,0.85)" : "#5A5169" }}>
                      <span className="flex-shrink-0 w-4.5 h-4.5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                        style={t.highlight ? { background: "rgba(184,137,59,.25)", color: "#D4A647" } : { background: "rgba(91,33,182,.1)", color: "#5B21B6" }}>✓</span>
                      {d}
                    </li>
                  ))}
                </ul>
                <Link href="/apply"
                  className="mt-auto inline-flex items-center justify-center px-5 py-3 text-sm font-semibold transition-all"
                  style={t.highlight ? {
                    background: "linear-gradient(135deg, #B8893B, #D4A647)",
                    color: "#1A1530",
                    fontWeight: 700,
                    borderRadius: "999px",
                  } : {
                    background: "transparent",
                    border: `1px solid ${t.col}50`,
                    color: t.col,
                    borderRadius: "999px",
                  }}>
                  {t.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Diagnostic credit banner */}
        <FadeUp delay={0.3} className="mt-8">
          <div className="flex items-center gap-4 p-5 rounded-2xl"
            style={{ background: "rgba(184,137,59,.07)", border: "1px solid rgba(184,137,59,.2)" }}>
            <span className="text-2xl" style={{ color: "#B8893B" }}>◇</span>
            <p className="text-sm leading-relaxed" style={{ color: "#8C6428" }}>
              <strong style={{ color: "#1A1530" }}>Diagnostic credit:</strong>{" "}
              the £500 Diagnostic fee is credited toward Advisory or Full Build if you choose to continue within 60 days. No reason not to start there.
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.35} className="mt-6 text-center">
          <p className="text-xs" style={{ color: "#8B8499" }}>
            Pricing is confirmed after Amit reviews your application — you choose a tier, he confirms it&apos;s right for your situation.
          </p>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Visa Explainer ────────────────────────────────────────────────────────────
function VisaExplainer() {
  return (
    <section className="py-24 px-6" aria-label="What is the UK Global Talent Visa" style={{ background: "#F6F1E7", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-5xl mx-auto">
        <FadeUp className="mb-12">
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>The visa, explained</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: "#1A1530" }}>
            What is the{" "}
            <span className="text-gradient-brand italic-accent">UK Global Talent Visa?</span>
          </h2>
        </FadeUp>

        {/* 3 cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-6">
          {[
            { icon: "◇", col: "#5B21B6", bg: "rgba(91,33,182,.08)", label: "Who it is for",
              body: "Leaders and exceptional practitioners in digital technology, arts, research, and academia. In tech, it covers founders, engineers, product leaders, data scientists, AI researchers, and operators who have demonstrably shaped their sector." },
            { icon: "↻", col: "#0F766E", bg: "rgba(15,118,110,.1)", label: "How it works",
              body: "You apply to an endorsement body, which assesses your profile against a published criteria framework. Endorsement unlocks the visa application itself. Unlike Skilled Worker, no employer sponsor is required — you are endorsed on personal merit alone." },
            { icon: "★", col: "#8C6428", bg: "rgba(184,137,59,.12)", label: "Why it matters",
              body: "Global Talent holders can work for any employer, switch freely between roles, work freelance or found a company, and fast-track to Indefinite Leave to Remain (ILR) in 3 years. The most flexible UK visa route for senior tech professionals." },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-8 transition-all hover:-translate-y-0.5"
              style={{ background: "#FFFFFF", border: "1px solid #E2D9C4", borderRadius: "20px", boxShadow: "0 1px 2px rgba(26,21,48,.04), 0 8px 24px rgba(26,21,48,.05)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5"
                style={{ background: card.bg, color: card.col }}>{card.icon}</div>
              <h3 className="font-bold text-lg mb-3" style={{ color: "#1A1530" }}>{card.label}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5A5169" }}>{card.body}</p>
            </motion.div>
          ))}
        </div>

        {/* 2 explainer blocks */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          <FadeUp>
            <div className="p-8 h-full" style={{ background: "#FFFFFF", border: "1px solid #E2D9C4", borderRadius: "20px" }}>
              <p className="text-xs font-mono tracking-widest uppercase mb-2.5" style={{ color: "#8B8499" }}>Sub-categories</p>
              <h4 className="font-display text-2xl mb-4 leading-tight" style={{ color: "#1A1530", letterSpacing: "-0.02em" }}>Exceptional Talent vs Exceptional Promise</h4>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#5A5169" }}>
                The digital technology route has two sub-categories.{" "}
                <strong style={{ color: "#1A1530" }}>Exceptional Talent</strong> is for established leaders with a proven, externally-recognised track record.{" "}
                <strong style={{ color: "#1A1530" }}>Exceptional Promise</strong> is for those earlier in their career who show clear potential for future leadership.
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#5A5169" }}>
                The distinction is widely misunderstood. It is not about years of experience. It is about the type of evidence available to you.
              </p>
              <a href="/blog/exceptional-talent-vs-exceptional-promise" className="text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: "#5B21B6" }}>
                Read the full breakdown →
              </a>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="p-8 h-full" style={{ background: "#FFFFFF", border: "1px solid #E2D9C4", borderRadius: "20px" }}>
              <p className="text-xs font-mono tracking-widest uppercase mb-2.5" style={{ color: "#8B8499" }}>Why applications fail</p>
              <h4 className="font-display text-2xl mb-4 leading-tight" style={{ color: "#1A1530", letterSpacing: "-0.02em" }}>What makes applications fail</h4>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#5A5169" }}>
                Most rejections are not caused by an under-qualified profile. They are caused by evidence that is generic, a personal statement that describes a career instead of arguing a case, and recommendation letters that talk about a working relationship instead of demonstrating sector-level impact.
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#5A5169" }}>
                The assessment framework is structured and consistent. Applicants who don&apos;t know the structure fail regardless of how strong their underlying work is.
              </p>
              <a href="/blog/why-tech-nation-applications-fail" className="text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity" style={{ color: "#5B21B6" }}>
                Why most applications fail →
              </a>
            </div>
          </FadeUp>
        </div>

        {/* VS banner — dark */}
        <FadeUp delay={0.2}>
          <div className="p-10 rounded-2xl relative overflow-hidden"
            style={{ background: "linear-gradient(155deg, #1A0A35 0%, #2E0F69 100%)", color: "white" }}>
            <div className="absolute right-[-100px] top-[-150px] w-[380px] h-[380px] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(184,137,59,.22), transparent 70%)" }} />
            <div className="relative z-10 grid md:grid-cols-[1.6fr_auto] gap-8 items-center">
              <div>
                <h4 className="font-display text-2xl mb-2 leading-tight" style={{ color: "white", letterSpacing: "-0.02em" }}>Global Talent vs Skilled Worker</h4>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
                  If you can qualify for Global Talent, applying for Skilled Worker is one of the most costly long-term decisions you can make. Global Talent gives you full work freedom, no employer tie, and a faster ILR path. Skilled Worker ties you to a sponsor and limits what you can do.
                </p>
              </div>
              <Link href="/readiness"
                className="inline-flex items-center justify-center px-6 py-3 font-semibold text-sm whitespace-nowrap flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #B8893B, #D4A647)", color: "#1A1530", borderRadius: "999px" }}>
                Check my eligibility →
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const faqs = [
    {
      q: "Is this an immigration service or legal advice?",
      a: "No. Meridian is an advisory service only. Amit helps you structure your evidence portfolio and narrative — he is not an immigration lawyer, is not OISC-regulated, and does not provide immigration legal advice. For legal immigration advice, consult an accredited immigration solicitor.",
    },
    {
      q: "Do you guarantee approval?",
      a: "No, and anyone who does is misleading you. What Amit does is ensure your case is as strong as it can be — that your evidence is specific, your narrative coherent, and your recommendations are structured to address what evaluators actually look for. That is what moves the odds.",
    },
    {
      q: "Can I just do this myself?",
      a: "Yes, absolutely. Many people do. But the most common mistake is not knowing what evaluators actually prioritise — which means applicants spend time on the wrong things and miss what would have made the difference. Amit's value is knowing what strong looks like from the inside.",
    },
    {
      q: "What is the difference between Exceptional Talent and Exceptional Promise?",
      a: "Exceptional Talent is for those with an established track record of innovation in the digital tech sector. Exceptional Promise is for those earlier in their career who show clear potential. The evidence requirements differ significantly. Amit can help you understand which category fits your profile before you apply.",
    },
    {
      q: "How long does the engagement take?",
      a: "A Readiness Diagnostic is typically completed within 5–7 days of payment. An Application Advisory engagement runs 3–6 weeks depending on how quickly you can produce materials. A Full Case Build runs 4–8 weeks. Amit does not rush the work — the timeline reflects what's needed to do it properly.",
    },
    {
      q: "What if I've already had an application rejected?",
      a: "A previous rejection is not disqualifying — many people get approved on a second application after strengthening their case. Amit specifically helps with understanding what a rejection feedback letter is pointing to and how to address it. This is some of his most valuable advisory work.",
    },
    {
      q: "How many clients does Amit take per month?",
      a: "Full Case Build is limited to 2 engagements per month so each receives proper attention. Application Advisory is limited to 4. Diagnostics have more availability. If you are considering applying, the assessment is the right first step regardless of timing.",
    },
  ]
  return (
    <section id="faq" className="py-24 px-6" style={{ background: "#EDE6D5", borderTop: "1px solid #E2D9C4" }}>
      <div className="max-w-3xl mx-auto">
        <FadeUp className="mb-12">
          <p className="text-xs font-mono tracking-widest uppercase mb-5" style={{ color: "#8B8499" }}>FAQ</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight" style={{ color: "#1A1530" }}>
            Common <span className="text-gradient-brand italic-accent">questions.</span>
          </h2>
        </FadeUp>
        <div className="mt-12">
          {faqs.map((faq, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="overflow-hidden"
              style={{ borderBottom: "1px solid #E2D9C4", cursor: "pointer" }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full py-6 flex items-center justify-between gap-6 text-left">
                <span className="font-display text-xl leading-snug" style={{ color: "#1A1530", letterSpacing: "-0.015em" }}>{faq.q}</span>
                <motion.span animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base font-light transition-all"
                  style={open === i
                    ? { background: "#5B21B6", color: "white", border: "1px solid #5B21B6" }
                    : { background: "#F6F1E7", color: "#5B21B6", border: "1px solid #E2D9C4" }}>
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                    <p className="pb-6 text-sm leading-relaxed" style={{ color: "#5A5169", lineHeight: "1.65" }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-32 px-8 text-center relative overflow-hidden"
      style={{
        background: "radial-gradient(900px 600px at 22% 0%, rgba(91,33,182,.55), transparent 60%), radial-gradient(700px 500px at 82% 100%, rgba(184,137,59,.3), transparent 60%), #1A1530",
        color: "white",
      }}>
      <div className="relative z-10 max-w-3xl mx-auto">
        <FadeUp>
          <p className="inline-flex text-xs font-mono tracking-widest uppercase mb-6"
            style={{ color: "rgba(255,255,255,0.5)" }}>Ready to build your case?</p>
          <h2 className="font-display text-4xl md:text-6xl mb-6 leading-tight" style={{ color: "white" }}>
            Start with a{" "}
            <span className="text-gradient-brand italic-accent">free 4-minute check.</span>
          </h2>
          <p className="max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.75)", fontSize: "18px" }}>
            Take the readiness assessment, see where your case stands, and decide if you want Amit to help you build from there. No payment, no commitment, no auto-charge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/readiness"
              className="inline-flex items-center justify-center gap-2.5 px-10 py-4 font-semibold text-base"
              style={{ background: "linear-gradient(135deg, #B8893B, #D4A647)", color: "#1A1530", borderRadius: "999px" }}>
              Take the free assessment →
            </Link>
            <Link href="/apply"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-medium text-base transition-all"
              style={{ border: "1px solid rgba(226,217,196,0.25)", color: "rgba(226,217,196,0.8)", borderRadius: "999px" }}>
              Apply for advisory directly
            </Link>
          </div>
          <p className="text-xs mt-7" style={{ color: "rgba(255,255,255,0.45)" }}>
            No account · No email required to start · Advisory-only — not immigration law
          </p>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-14 px-6" style={{ background: "#0E0820", borderTop: "1px solid rgba(226,217,196,0.12)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Brand col */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <svg viewBox="0 0 48 48" fill="none" width="32" height="32" style={{ color: "#D4A647" }}>
                <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5"/>
                <ellipse cx="24" cy="24" rx="7.5" ry="18" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="6" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="24" cy="6" r="2.3" fill="currentColor"/>
              </svg>
              <span className="flex flex-col leading-none">
                <span className="font-display text-base leading-none" style={{ color: "#E2D9C4", letterSpacing: "-0.02em" }}>Meridian</span>
                <span className="font-mono text-[8px] uppercase leading-none" style={{ letterSpacing: "0.2em", color: "#8B8499" }}>Global Talent Advisory</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "340px", lineHeight: "1.6" }}>
              Strategic advisory for builders applying for UK Global Talent recognition. Evidence architecture, narrative engineering, recommendation strategy.
            </p>
            <div className="flex gap-2.5">
              {[
                { href: "https://www.linkedin.com/in/amitisb1tyagi/", label: "in" },
                { href: "https://wa.me/447776842287", label: "W" },
                { href: "https://www.instagram.com/meridianglobaltalent/", label: "IG" },
              ].map(({ href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.15)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"}
                >{label}</a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "rgba(226,217,196,0.4)" }}>Services</p>
            <ul className="space-y-3">
              {[["Readiness Assessment", "/readiness"], ["Apply for Advisory", "/apply"], ["Insights Blog", "/blog"], ["Full Case Build", "/apply"]].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-sm transition-colors"
                  style={{ color: "rgba(226,217,196,0.55)" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "#E2D9C4"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(226,217,196,0.55)"}
                >{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "rgba(226,217,196,0.4)" }}>Information</p>
            <ul className="space-y-3">
              {[["About Amit", "/about"], ["Process", "#process"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => (
                <li key={l}><a href={h} className="text-sm transition-colors"
                  style={{ color: "rgba(226,217,196,0.55)" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "#E2D9C4"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(226,217,196,0.55)"}
                >{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "rgba(226,217,196,0.4)" }}>Legal</p>
            <ul className="space-y-3">
              {[
                ["Terms & Conditions", "/legal#terms"],
                ["Privacy Policy",     "/legal#privacy"],
                ["Refund Policy",      "/legal#refunds"],
                ["Disclaimer",         "/legal#disclaimer"],
                ["NDA & Confidentiality", "/legal#nda"],
              ].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-sm transition-colors"
                  style={{ color: "rgba(226,217,196,0.55)" }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "#E2D9C4"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = "rgba(226,217,196,0.55)"}
                >{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="pt-8" style={{ borderTop: "1px solid rgba(226,217,196,0.12)" }}>
          <p className="text-xs leading-relaxed max-w-3xl mb-3" style={{ color: "rgba(226,217,196,0.4)" }}>
            <strong style={{ color: "rgba(226,217,196,0.85)" }}>Advisory only — not immigration legal advice.</strong>{" "}
            Meridian is an independent advisory service. Amit Tyagi is not an immigration lawyer,
            is not OISC-registered, and does not provide regulated immigration advice.
            We are not affiliated with the UK Government, the Home Office, Tech Nation, or any visa body.
            For regulated immigration legal advice, consult an accredited immigration solicitor.
          </p>
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-xs" style={{ color: "rgba(226,217,196,0.35)" }}>© 2025 Meridian. All rights reserved.</p>
            <p className="text-xs" style={{ color: "rgba(226,217,196,0.35)" }}>Designed for builders, by a builder.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── Sticky Nudge ──────────────────────────────────────────────────────────────
function StickyNudge() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    const fn = () => {
      if (window.scrollY > 1400) setShow(true)
    }
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [dismissed])

  if (dismissed) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-5 left-1/2 z-40 flex items-center gap-3.5"
          style={{
            transform: "translateX(-50%)",
            background: "#FFFFFF",
            border: "1px solid #E2D9C4",
            borderRadius: "999px",
            padding: "8px 8px 8px 20px",
            boxShadow: "0 20px 50px -10px rgba(26,21,48,.3)",
            fontSize: "13.5px",
            fontWeight: 500,
            color: "#1A1530",
            whiteSpace: "nowrap",
          }}>
          <span className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: "#A93838" }} />
            <strong style={{ fontWeight: 600 }}>{SPOTS_REMAINING} free spots left.</strong>
            &nbsp;Check readiness in 4 min.
          </span>
          <Link href="/readiness"
            className="btn-primary inline-flex items-center px-4 py-2 text-white font-semibold text-xs"
            style={{ borderRadius: "999px" }}>
            Start free →
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all flex-shrink-0"
            style={{ background: "#E2D9C4", color: "#5A5169" }}
            aria-label="Dismiss">
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFAQSchema) }}
      />
      <SiteNav />
      <Hero />
      <TrustBar />
      <WhoThisIsFor />
      <Pain />
      <CostOfWrong />
      <ScorecardCTA />
      <Services />
      <Process />
      <AboutAmit />
      <Testimonials />
      <Pricing />
      <VisaExplainer />
      <FAQ />
      <FinalCTA />
      <Footer />
      <StickyNudge />
    </main>
  )
}
