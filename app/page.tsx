"use client"

import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import Link from "next/link"
// Spots remaining — hardcoded; update manually as needed
const SPOTS_REMAINING = 67
const SPOTS_TOTAL = 100

const SITE_URL = "https://meridiangtv.co.uk"

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

// ── Helpers ──────────────────────────────────────────────────────────────────
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


// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return (
    <motion.nav initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-gradient-to-r from-[#0a0018] via-[#050010] to-[#000d1a] backdrop-blur-xl" : "bg-transparent"
      }`}>
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-brand/50 via-data/70 to-[#E1306C]/50" />
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand via-data to-[#06B6D4] flex items-center justify-center shadow-lg shadow-brand/40">
            <span className="text-white text-sm font-black">M</span>
          </div>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg leading-none" style={{ background: "linear-gradient(90deg, #7C3AED, #06B6D4, #D97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {[["Services", "#services"], ["About", "#about"], ["Pricing", "#pricing"], ["Blog", "/blog"]].map(([l, h]) => (
            <a key={l} href={h} className="text-sm font-bold text-platinum hover:text-brand transition-colors tracking-wide uppercase" style={{ fontSize: "12px", letterSpacing: "0.08em" }}>{l}</a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2.5">
          <a href="https://www.linkedin.com/in/amitisb1tyagi/"
            target="_blank" rel="noopener noreferrer" title="Connect on LinkedIn"
            className="w-8 h-8 rounded-lg border border-[#0A66C2]/50 bg-[#0A66C2]/15 flex items-center justify-center text-[#0A66C2] hover:bg-[#0A66C2]/30 transition-all font-black" style={{ fontSize: "10px" }}>in</a>
          <a href="https://wa.me/447776842287"
            target="_blank" rel="noopener noreferrer" title="WhatsApp +44 7776 842287"
            className="w-8 h-8 rounded-lg border border-[#25D366]/50 bg-[#25D366]/15 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/30 transition-all font-black" style={{ fontSize: "10px" }}>W</a>
          <a href="https://www.instagram.com/meridianglobaltalent/"
            target="_blank" rel="noopener noreferrer" title="Instagram @meridianglobaltalent"
            className="w-8 h-8 rounded-lg border border-[#E1306C]/50 bg-[#E1306C]/15 flex items-center justify-center text-[#E1306C] hover:bg-[#E1306C]/30 transition-all font-black" style={{ fontSize: "10px" }}>IG</a>
          <Link href="/scorecard"
            className="text-sm text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-brand/30 hover:shadow-brand/50 transition-all"
            style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
            Check my readiness →
          </Link>
        </div>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-platinum-dim">
          <div className={`w-5 h-0.5 bg-current mb-1.5 transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
          <div className={`w-5 h-0.5 bg-current mb-1.5 transition-all ${open ? "opacity-0" : ""}`} />
          <div className={`w-5 h-0.5 bg-current transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-void-surface border-t border-void-border px-6 py-5 flex flex-col gap-5">
            {[["Check my readiness", "/scorecard"], ["Services", "#services"], ["About Amit", "#about"], ["Pricing", "#pricing"], ["Book a call", "/apply"]].map(([l, h]) => (
              <Link key={l} href={h} onClick={() => setOpen(false)}
                className="text-sm text-platinum-dim hover:text-platinum transition-colors">{l}</Link>
            ))}
            <div className="flex gap-3 pt-1 border-t border-void-border">
              <a href="https://www.linkedin.com/in/amitisb1tyagi/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-platinum-dim hover:text-platinum transition-colors">
                <span className="w-5 h-5 rounded bg-[#0A66C2] flex items-center justify-center text-white font-bold" style={{ fontSize: "9px" }}>in</span>
                LinkedIn
              </a>
              <a href="https://wa.me/447776842287" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-platinum-dim hover:text-platinum transition-colors">
                <span className="w-5 h-5 rounded bg-[#25D366] flex items-center justify-center text-white font-bold" style={{ fontSize: "9px" }}>W</span>
                WhatsApp
              </a>
              <a href="https://www.instagram.com/meridianglobaltalent/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-platinum-dim hover:text-platinum transition-colors">
                <span className="w-5 h-5 rounded bg-[#E1306C] flex items-center justify-center text-white font-bold" style={{ fontSize: "9px" }}>IG</span>
                Instagram
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="orb-violet absolute -left-40 top-1/3 w-[500px] h-[500px] opacity-40" />
      <div className="orb-cyan absolute right-0 bottom-1/4 w-96 h-96 opacity-30" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* Urgency banner */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="inline-flex mb-6">
          <span className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#EF4444]/40 bg-[#EF4444]/8 text-sm font-medium text-[#EF4444]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]" />
            </span>
            Only {SPOTS_REMAINING} of {SPOTS_TOTAL} free assessments remaining
          </span>
        </motion.div>

        {/* Amit's credential badge with photo */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex mb-8">
          <a href="https://www.linkedin.com/in/amitisb1tyagi/"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/8 hover:bg-gold/15 hover:border-gold/50 transition-all">
            <span className="text-sm text-gold font-medium">
              Amit Tyagi — UK Global Talent, Exceptional Talent
            </span>
            <span className="w-4 h-4 rounded bg-[#0A66C2] flex items-center justify-center text-white font-bold flex-shrink-0" style={{ fontSize: "9px" }}>in</span>
          </a>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-7xl text-platinum leading-[1.08] tracking-tight mb-6">
          You&apos;re probably good enough for{" "}
          <span className="text-gradient-brand">UK Global Talent.</span>
          {" "}Your application probably isn&apos;t.
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38 }}
          className="text-lg md:text-xl text-platinum-dim max-w-2xl mx-auto mb-10 leading-relaxed">
          Tech Nation rejects strong applications every month — not because the builder isn&apos;t exceptional,
          but because their evidence doesn&apos;t speak the evaluator&apos;s language.
          Amit received UK Global Talent recognition under{" "}
          <span className="text-platinum font-medium">Exceptional Talent</span>.
          {" "}He knows exactly what that language sounds like.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link href="/scorecard"
            className="btn-primary text-white px-8 py-4 rounded-xl font-semibold text-base inline-flex items-center justify-center gap-2.5 shadow-[0_0_40px_rgba(124,58,237,0.4)]">
            Check if my case is ready — free
            <span className="text-data-light text-lg">→</span>
          </Link>
          <a href="#about"
            className="btn-secondary text-platinum px-8 py-4 rounded-xl font-medium text-base inline-flex items-center justify-center gap-2">
            How Amit got his visa
          </a>
        </motion.div>

        {/* Scarcity nudge under CTA */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
          className="text-xs text-[#EF4444] font-medium mb-10">
          ⚡ Free · Takes 4 minutes · {SPOTS_REMAINING} spots left before this closes
        </motion.p>

        {/* Proof strip */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-platinum-dim">
          {[
            { icon: "✦", text: "20+ builders advised", col: "#F59E0B" },
            { icon: "✦", text: "Exceptional Talent & Promise", col: "#7C3AED" },
            { icon: "✦", text: "India · UAE · Singapore · Europe", col: "#06B6D4" },
            { icon: "✦", text: "4-min free readiness check", col: "#9F6EF5" },
          ].map(({ icon, text, col }) => (
            <span key={text} className="flex items-center gap-2">
              <span className="text-xs" style={{ color: col }}>{icon}</span>{text}
            </span>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
          className="w-0.5 h-7 bg-gradient-to-b from-brand to-transparent rounded-full" />
      </motion.div>
    </section>
  )
}

// ── Who this is for ───────────────────────────────────────────────────────────
function WhoThisIsFor() {
  const professions = [
    { label: "Startup Founders",         col: "#7C3AED", href: "/blog/how-founders-position-global-talent-visa" },
    { label: "Product Managers",         col: "#06B6D4", href: "/blog/product-manager-global-talent" },
    { label: "Software Engineers",       col: "#F59E0B", href: "/blog/scale-up-engineer-global-talent" },
    { label: "CTOs",                     col: "#9F6EF5", href: "/blog/cto-application-strategy" },
    { label: "AI / ML Engineers",        col: "#22D3EE", href: "/blog/ai-ml-engineer-application" },
    { label: "Data Engineers",           col: "#7C3AED", href: "/blog/data-engineering-global-talent" },
    { label: "Fintech Professionals",    col: "#06B6D4", href: "/blog/fintech-founder-case-study" },
    { label: "SaaS Founders",            col: "#F59E0B", href: "/blog/b2b-saas-founder-positioning" },
    { label: "Deep Tech Founders",       col: "#9F6EF5", href: "/blog/deep-tech-founder-positioning" },
    { label: "Climate Tech Founders",    col: "#22D3EE", href: "/blog/climate-tech-global-talent" },
    { label: "Healthtech Founders",      col: "#7C3AED", href: "/blog/healthtech-founder-global-talent" },
    { label: "Engineering Managers",     col: "#06B6D4", href: "/blog/employee-at-big-tech-global-talent" },
    { label: "Cybersecurity Engineers",  col: "#F59E0B", href: "/blog/cybersecurity-global-talent" },
    { label: "Startup Operators",        col: "#9F6EF5", href: "/blog/narrative-engineering-for-tech-professionals" },
    { label: "Angel Investors",          col: "#22D3EE", href: "/blog/angel-investment-as-evidence" },
    { label: "Open Source Contributors", col: "#7C3AED", href: "/blog/open-source-as-evidence" },
  ]

  return (
    <section className="py-16 px-6 border-t border-void-border bg-void-surface">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-10">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-3">Who this is for</p>
          <h2 className="font-display text-3xl md:text-4xl text-platinum leading-tight mb-3">
            Built for every kind of exceptional builder.
          </h2>
          <p className="text-platinum-dim text-base max-w-2xl mx-auto leading-relaxed">
            The UK Global Talent Visa is open to any digital technology professional with evidence of
            exceptional work. Here are the profiles Meridian Advisory has worked with most.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex flex-wrap gap-3 justify-center">
            {professions.map((p) => (
              <a
                key={p.label}
                href={p.href}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all hover:scale-105"
                style={{
                  borderColor: `${p.col}35`,
                  background: `${p.col}0A`,
                  color: p.col,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.col }} />
                {p.label}
              </a>
            ))}
          </div>
        </FadeUp>
        <FadeUp delay={0.2} className="mt-8 text-center">
          <p className="text-xs text-platinum-faint">
            From India, UAE, Singapore, Nigeria, Brazil, the US, and across Europe.{" "}
            <a href="/scorecard" className="text-brand underline underline-offset-2 hover:opacity-80 transition-opacity">
              Find out where your profile stands →
            </a>
          </p>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Pain section ──────────────────────────────────────────────────────────────
function Pain() {
  const pains = [
    {
      stat: "~80%",
      headline: "of strong applications are rejected",
      body: "Not because the builder isn't exceptional — because their case doesn't demonstrate it the way the assessment panel expects.",
      col: "#7C3AED",
    },
    {
      stat: "#1",
      headline: "rejection reason: generic evidence",
      body: "Most applicants describe what they did. Evaluators need to see scope, independence, and influence — in that order.",
      col: "#06B6D4",
    },
    {
      stat: "3 of 3",
      headline: "recommendation letters need to be specific",
      body: "One weak letter — even with two strong ones — significantly weakens the overall submission. Most applicants don't know how to brief recommenders.",
      col: "#F59E0B",
    },
  ]
  return (
    <section className="py-24 px-6 border-t border-void-border">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">The Problem</p>
          <h2 className="font-display text-4xl md:text-5xl text-platinum leading-tight">
            Why exceptional builders<br />
            <span className="text-gradient-brand">get rejected.</span>
          </h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5">
          {pains.map((p, i) => (
            <motion.div key={p.headline}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.55 }}
              className="card-border p-9">
              <div className="font-mono text-4xl font-bold mb-4" style={{ color: p.col }}>{p.stat}</div>
              <h3 className="text-platinum font-semibold text-base mb-4 leading-snug">{p.headline}</h3>
              <p className="text-platinum-dim text-sm leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>
        <FadeUp delay={0.3} className="mt-8">
          <div className="card-border p-6 flex flex-col md:flex-row items-center gap-5 bg-brand/5">
            <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center flex-shrink-0">
              <span className="text-brand text-xl">✦</span>
            </div>
            <p className="text-platinum-dim text-base leading-relaxed">
              <span className="text-platinum font-medium">Amit was in your position.</span>{" "}
              He was approved under Exceptional Talent — and spent time understanding exactly why the case worked,
              what evaluators actually look for, and where most applicants lose the decision before they've started.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Scorecard CTA ─────────────────────────────────────────────────────────────
function ScorecardCTA() {
  const dims = [
    { label: "Evidence strength",    val: 72, col: "#7C3AED" },
    { label: "Narrative clarity",    val: 45, col: "#06B6D4" },
    { label: "Recommendation quality", val: 80, col: "#F59E0B" },
    { label: "External validation",  val: 58, col: "#9F6EF5" },
  ]
  const ref = useRef(null)
  const visible = useInView(ref, { once: true })

  const r = 70, size = 180
  const circ = 2 * Math.PI * r
  const offset = circ - (67 / 100) * circ

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className="card-border overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left: copy */}
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-5">Free · 4 minutes</p>
              <h2 className="font-display text-4xl text-platinum mb-4 leading-tight">
                Know exactly where your<br />
                <span className="text-gradient-brand">application stands.</span>
              </h2>
              <p className="text-platinum-dim leading-relaxed mb-8">
                Answer 12 questions. Get a scored readiness report across the 4 dimensions
                Tech Nation evaluates — and a specific recommendation on what to fix first.
              </p>
              <Link href="/scorecard"
                className="btn-primary inline-flex items-center gap-2.5 px-7 py-4 rounded-xl text-white font-semibold w-fit">
                Take the free assessment
                <span className="text-data-light">→</span>
              </Link>
              <p className="text-xs text-platinum-faint mt-4">No account. No email required to start.</p>
            </div>

            {/* Right: score preview */}
            <div className="bg-void-surface border-t md:border-t-0 md:border-l border-void-border p-10 flex flex-col items-center justify-center gap-8">
              <div style={{ width: size, height: size }} className="relative">
                <svg width={size} height={size} className="-rotate-90" style={{ overflow: "visible" }}>
                  <defs>
                    <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="60%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                  <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
                  <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
                    stroke="url(#sg)" strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={visible ? { strokeDashoffset: offset } : {}}
                    transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span className="font-mono text-4xl font-bold text-platinum"
                    initial={{ opacity: 0 }} animate={visible ? { opacity: 1 } : {}}
                    transition={{ delay: 0.9 }}>67</motion.span>
                  <span className="text-platinum-dim text-xs font-mono">/ 100</span>
                </div>
              </div>
              <div className="w-full space-y-4">
                {dims.map((d, i) => (
                  <div key={d.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-platinum-dim">{d.label}</span>
                      <span className="text-xs font-mono text-platinum">{d.val}</span>
                    </div>
                    <div className="h-1.5 bg-void-border rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={visible ? { width: `${d.val}%` } : {}}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg,${d.col},${d.col}80)` }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-platinum-faint text-center">Sample score — yours will differ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── What Amit does ────────────────────────────────────────────────────────────
function Services() {
  const services = [
    {
      n: "01",
      title: "Evidence Architecture",
      desc: "Map every proof point in your career against the specific signals evaluators are trained to look for. Identify what's missing, what's weak, and what to lead with.",
      items: ["Proof point audit", "Signal gap analysis", "Evidence sequencing strategy"],
      col: "#7C3AED",
    },
    {
      n: "02",
      title: "Narrative Engineering",
      desc: "Build the career story that creates a coherent, compelling case — not a job history. Structure it so evaluators can read your trajectory in 90 seconds.",
      items: ["Personal statement drafting", "Career arc positioning", "Role-by-role framing"],
      col: "#06B6D4",
    },
    {
      n: "03",
      title: "Recommendation Architecture",
      desc: "Identify the right recommenders, coach them on what to write, and structure a three-letter portfolio where each letter covers a different dimension of your credibility.",
      items: ["Recommender selection strategy", "Brief templates per recommender", "Letter review and strengthening"],
      col: "#F59E0B",
    },
  ]
  return (
    <section id="services" className="py-24 px-6 border-t border-void-border">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="mb-14">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">What Amit does</p>
          <h2 className="font-display text-4xl md:text-5xl text-platinum leading-tight max-w-xl">
            Not filing. Not form-filling. Case-building.
          </h2>
        </FadeUp>
        <div className="space-y-5">
          {services.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="card-border p-8">
              <div className="grid md:grid-cols-[auto_1fr_auto] gap-6 items-start">
                <div className="font-mono text-sm font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: `${s.col}18`, color: s.col }}>{s.n}</div>
                <div>
                  <h3 className="text-platinum font-semibold text-lg mb-2">{s.title}</h3>
                  <p className="text-platinum-dim text-sm leading-relaxed">{s.desc}</p>
                </div>
                <ul className="space-y-2 md:min-w-[220px]">
                  {s.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-platinum-dim">
                      <span className="text-xs mt-0.5" style={{ color: s.col }}>✦</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
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
    { n: "01", title: "Take the free readiness assessment", desc: "12 questions. A scored report across 4 dimensions. Know exactly where your case stands before you invest anything.", tag: "Free · 4 min", col: "#7C3AED", href: "/scorecard" },
    { n: "02", title: "Apply for a Strategic Review", desc: "Amit reviews your application and responds personally within 48 hours with one specific observation about your case.", tag: "48-hr response", col: "#06B6D4", href: "/apply" },
    { n: "03", title: "Build the case together", desc: "Evidence mapping, personal statement, recommendation coaching — structured around the evaluator's framework, not a generic template.", tag: "£500 – £5,500", col: "#9F6EF5", href: "/apply" },
    { n: "04", title: "Submit with confidence", desc: "A submission-ready case where every component has been stress-tested against the criteria that determines approval.", tag: "No open-ended retainers", col: "#F59E0B", href: "/apply" },
  ]
  return (
    <section id="process" className="py-24 px-6 border-t border-void-border">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-14">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">The Process</p>
          <h2 className="font-display text-4xl md:text-5xl text-platinum">Four steps to a stronger case.</h2>
        </FadeUp>
        <div className="grid md:grid-cols-2 gap-5">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card-border p-8 flex gap-6 items-start">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center font-mono text-sm font-bold flex-shrink-0"
                style={{ background: `${s.col}18`, color: s.col, border: `1px solid ${s.col}35` }}>{s.n}</div>
              <div>
                <h3 className="text-platinum font-semibold text-base mb-2 leading-snug">{s.title}</h3>
                <p className="text-platinum-dim text-sm leading-relaxed mb-3">{s.desc}</p>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full"
                  style={{ background: `${s.col}18`, color: s.col }}>{s.tag}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── About Amit ────────────────────────────────────────────────────────────────
function AboutAmit() {
  return (
    <section id="about" className="py-24 px-6 border-t border-void-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <FadeUp>
            <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-6">About Amit</p>
            <h2 className="font-display text-4xl text-platinum mb-6 leading-tight">
              He didn&apos;t learn this from a textbook.
              <br />
              He went through it.
            </h2>
            <p className="text-platinum-dim leading-relaxed mb-4">
              Amit Tyagi received UK Global Talent recognition under the Exceptional Talent category
              through a strategically engineered, evidence-led application. Not by luck. By understanding
              exactly how the assessment framework evaluates applicants — and building a case that spoke
              directly to that framework.
            </p>
            <p className="text-platinum-dim leading-relaxed mb-4">
              His background is in fintech and startups, as a founder, operator, and product builder.
              He knows how exceptional work actually looks from the inside — and more importantly,
              how to translate that into the language evaluators recognise.
            </p>
            <p className="text-platinum-dim leading-relaxed mb-8">
              His advisory is not built on a template. Every engagement starts from your specific situation,
              your evidence, your career — and builds toward a case that is uniquely yours.
            </p>
            <Link href="/apply"
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm text-platinum font-medium">
              Apply to work with Amit →
            </Link>
          </FadeUp>

          <FadeUp delay={0.15} className="space-y-4">
            {[
              { label: "Recognition received",  value: "UK Global Talent — Exceptional Talent" },
              { label: "Background",            value: "Fintech · Startups · Product · Founding" },
              { label: "Advisory style",        value: "Specific to your case — not a template" },
              { label: "Capacity",              value: "Limited engagements per month" },
              { label: "What Amit is not",      value: "Not an immigration lawyer or OISC-regulated advisor" },
            ].map((row, i) => (
              <motion.div key={row.label} initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="card-border px-6 py-5 flex justify-between items-start gap-4">
                <span className="text-xs font-mono text-platinum-faint uppercase tracking-wider pt-0.5 flex-shrink-0">{row.label}</span>
                <span className="text-sm text-platinum text-right">{row.value}</span>
              </motion.div>
            ))}
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const tiers = [
    {
      name: "Readiness Diagnostic",
      price: "£500",
      ideal: "Just starting to think about applying",
      desc: "A written diagnostic of your case — where you are strong, where you're weak, and what to fix before you spend time on a full application.",
      deliverables: [
        "Scored profile audit (4 dimensions)",
        "Evidence gap analysis — specific to your role",
        "Top 3 things to fix before you apply",
        "One written insight brief from Amit",
      ],
      cta: "Book a Diagnostic",
      highlight: false,
      col: "#7C3AED",
    },
    {
      name: "Application Advisory",
      price: "£2,500",
      ideal: "Ready to build and submit",
      desc: "The full advisory engagement. Amit works through your evidence, personal statement, and recommendation strategy with you — sessions, written feedback, and async support.",
      deliverables: [
        "Everything in Diagnostic",
        "2 × focused sessions with Amit",
        "Personal statement structuring + feedback",
        "Recommendation strategy (who, what, how)",
        "Evidence sequencing document",
        "30-day async support",
      ],
      cta: "Apply for Advisory",
      highlight: true,
      col: "#06B6D4",
    },
    {
      name: "Full Case Build",
      price: "£5,500",
      ideal: "Want the whole case built end-to-end",
      desc: "Amit builds the full submission with you — every component reviewed, every letter coached, personal statement iteration, and a final readiness check before you hit submit.",
      deliverables: [
        "Everything in Application Advisory",
        "Submission-ready personal statement",
        "Recommendation letter coaching per recommender",
        "Final readiness review (go / not yet)",
        "90-day async support",
      ],
      cta: "Apply for Full Build",
      highlight: false,
      col: "#F59E0B",
    },
  ]
  return (
    <section id="pricing" className="py-24 px-6 border-t border-void-border">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="mb-14">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">Pricing</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-4xl md:text-5xl text-platinum leading-tight max-w-xl mb-3">
                Three tiers. One goal. A stronger case.
              </h2>
              <span className="inline-flex items-center gap-2 text-xs font-medium text-[#EF4444] border border-[#EF4444]/30 bg-[#EF4444]/6 px-3 py-1.5 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#EF4444]" />
                </span>
                Amit takes {SPOTS_REMAINING} new clients per quarter — {SPOTS_REMAINING} spots open now
              </span>
            </div>
            <p className="text-platinum-dim text-sm max-w-xs leading-relaxed">
              Fixed prices. No open-ended retainers.
              No surprises. Amit recommends the right tier after reviewing your application.
            </p>
          </div>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {tiers.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`card-border p-8 flex flex-col relative overflow-hidden ${t.highlight ? "md:-mt-4" : ""}`}>
              {t.highlight && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-data to-transparent" />}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: t.col }}>{t.name}</p>
                <div className="font-mono text-3xl font-bold text-platinum mb-1">{t.price}</div>
                <p className="text-xs text-platinum-faint mb-4 italic">Best for: {t.ideal}</p>
                <p className="text-platinum-dim text-sm leading-relaxed mb-6">{t.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {t.deliverables.map(d => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-platinum-dim">
                      <span className="mt-0.5 text-xs" style={{ color: t.col }}>✦</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/apply"
                className="mt-auto inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: t.highlight ? t.col : "transparent",
                  border: `1px solid ${t.col}${t.highlight ? "" : "50"}`,
                  color: t.highlight ? "#fff" : t.col,
                }}>
                {t.cta} →
              </Link>
            </motion.div>
          ))}
        </div>
        <FadeUp delay={0.3} className="mt-6 text-center">
          <p className="text-xs text-platinum-faint">
            Pricing is confirmed after Amit reviews your application — you choose a tier, he confirms it&apos;s right for your situation.
          </p>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Trust bar ─────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { value: "UK Global Talent",   label: "Exceptional Talent — Amit's own recognition", col: "#F59E0B" },
    { value: "20+ builders",       label: "Helped across India, UAE, Singapore & Europe", col: "#7C3AED" },
    { value: "48-hr response",     label: "Every application reviewed personally",        col: "#06B6D4" },
    { value: "£500 – £5,500",      label: "Fixed pricing · no open-ended retainers",     col: "#9F6EF5" },
    { value: "Advisory only",      label: "Not immigration legal advice",                col: "#22D3EE" },
  ]
  return (
    <section className="py-10 px-6 border-y border-void-border bg-void-surface">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
        {items.map((item, i) => (
          <FadeUp key={item.value} delay={i * 0.07} className="flex flex-col gap-1">
            <div className="text-sm font-semibold font-mono" style={{ color: item.col }}>{item.value}</div>
            <div className="text-xs text-platinum-faint leading-snug">{item.label}</div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { quote: "I had strong work behind me but no idea how to present it the way assessors look for. Amit restructured my evidence portfolio and personal statement in three weeks. Approved on first attempt.", name: "Founder, B2B SaaS", recognition: "Exceptional Talent", initial: "S", col: "#7C3AED" },
  { quote: "As a PM my impact was always embedded in team outcomes. Amit helped me reframe five years of product work into a case that made my individual contribution undeniable to the assessors.", name: "Senior Product Manager", recognition: "Exceptional Promise", initial: "P", col: "#06B6D4" },
  { quote: "I'd been in ML for eight years but all my evidence was internal. Amit helped me identify the external signals I'd been ignoring — papers, deployment impact, open source — and build a real case.", name: "ML Engineer, Series B", recognition: "Exceptional Talent", initial: "R", col: "#F59E0B" },
  { quote: "My first attempt was rejected. Amit read the feedback letter and immediately identified what was missing. My second application was completely different — and approved in under two weeks.", name: "CTO, Fintech startup", recognition: "Approved on reapplication", initial: "A", col: "#9F6EF5" },
  { quote: "Coming from Singapore, I wasn't sure my profile would translate. Amit knew exactly how to frame the scale of what I'd built in Southeast Asia in terms a UK panel would recognise.", name: "Co-founder, Consumer App", recognition: "Exceptional Talent", initial: "N", col: "#22D3EE" },
  { quote: "Three of my recommendation letters were describing our working relationship instead of my impact. Amit coached me on what they should say — and coached my recommenders too. The difference was stark.", name: "Engineering Manager", recognition: "Exceptional Promise", initial: "K", col: "#7C3AED" },
  { quote: "I thought listing my GitHub stats was strong evidence. Amit showed me they weren't framed as evidence at all — just facts. Learning to make the argument rather than present the data changed everything.", name: "Senior Software Engineer", recognition: "Exceptional Talent", initial: "D", col: "#06B6D4" },
  { quote: "My personal statement before working with Amit was a CV in paragraph form. He helped me understand the difference between describing what I did and arguing what it meant for the sector.", name: "Growth Lead, VC-backed startup", recognition: "Exceptional Promise", initial: "T", col: "#F59E0B" },
  { quote: "What I valued most was that Amit had done it himself. He wasn't reading from a playbook — he was telling me what actually worked, what assessors genuinely respond to, and what to cut.", name: "Startup Operator, UAE", recognition: "Exceptional Talent", initial: "F", col: "#9F6EF5" },
  { quote: "I was going to apply under Promise because I didn't think I qualified for Talent. Amit looked at my profile and told me I was underselling myself significantly. I submitted Talent and was approved.", name: "Data Scientist, Series A", recognition: "Exceptional Talent", initial: "M", col: "#22D3EE" },
  { quote: "I had two failed attempts before finding Amit. He identified the exact pattern in my evidence that wasn't landing — I wasn't showing sector influence, only personal impact. Third attempt approved.", name: "Founder & Angel Investor", recognition: "Exceptional Talent", initial: "V", col: "#7C3AED" },
]

function Testimonial() {
  return (
    <section className="py-20 px-6 border-t border-void-border">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-12">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-3">In their words</p>
          <h2 className="font-display text-4xl text-platinum">20+ builders helped.</h2>
          <p className="text-platinum-dim mt-3 text-sm">Founders, PMs, engineers, and operators across India, UAE, Singapore, and Europe.</p>
        </FadeUp>
        <div className="grid md:grid-cols-2 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: (i % 4) * 0.08 }}
              className="card-border p-6">
              <div className="text-2xl leading-none mb-4 select-none" style={{ color: `${t.col}50` }}>&ldquo;</div>
              <p className="text-platinum-dim text-sm leading-relaxed mb-5 italic">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: `${t.col}20`, color: t.col, border: `1px solid ${t.col}40` }}>
                  {t.initial}
                </div>
                <div>
                  <p className="text-xs text-platinum font-medium">{t.name}</p>
                  <p className="text-xs font-mono" style={{ color: t.col }}>{t.recognition}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Visa Explainer (SEO content anchor) ──────────────────────────────────────
function VisaExplainer() {
  return (
    <section className="py-24 px-6 border-t border-void-border bg-void-surface" aria-label="What is the UK Global Talent Visa">
      <div className="max-w-4xl mx-auto">
        <FadeUp className="mb-10">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">The Visa, Explained</p>
          <h2 className="font-display text-4xl md:text-5xl text-platinum leading-tight mb-2">
            What is the UK Global Talent Visa?
          </h2>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            {
              label: "Who it is for",
              col: "#7C3AED",
              body: "Leaders and exceptional practitioners in digital technology, arts, research, and academia. In tech, it covers founders, engineers, product leaders, data scientists, AI researchers, and operators who have demonstrably shaped their sector.",
            },
            {
              label: "How it works",
              col: "#06B6D4",
              body: "You apply to an endorsement body, which assesses your profile against a published criteria framework. Endorsement unlocks the visa application itself. Unlike Skilled Worker, no employer sponsor is required — you are endorsed on personal merit alone.",
            },
            {
              label: "Why it matters",
              col: "#F59E0B",
              body: "Global Talent holders can work for any employer, switch freely between roles, work freelance or found a company, and fast-track to Indefinite Leave to Remain (ILR) in 3 years. It is the most flexible UK visa route for senior tech professionals.",
            },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="card-border p-7">
              <div className="w-8 h-1 rounded-full mb-4" style={{ background: card.col }} />
              <h3 className="text-platinum font-semibold text-sm mb-3">{card.label}</h3>
              <p className="text-platinum-dim text-sm leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <FadeUp>
            <h3 className="text-platinum font-semibold text-lg mb-4 font-display">
              Exceptional Talent vs Exceptional Promise
            </h3>
            <p className="text-platinum-dim text-sm leading-relaxed mb-4">
              The digital technology route has two sub-categories. <strong className="text-platinum">Exceptional Talent</strong> is
              for established leaders — professionals with a proven, externally-recognised track record of innovation
              in the digital technology sector. <strong className="text-platinum">Exceptional Promise</strong> is for
              those earlier in their career who show clear, demonstrable potential for future leadership.
            </p>
            <p className="text-platinum-dim text-sm leading-relaxed mb-4">
              The distinction is widely misunderstood. It is not about years of experience.
              It is about the type of evidence available to you. Talent requires evidence of established
              sector-level impact. Promise requires evidence of rising trajectory.{" "}
              <a href="/blog/exceptional-talent-vs-exceptional-promise" className="text-brand underline underline-offset-2 hover:opacity-80 transition-opacity">
                Read the full breakdown →
              </a>
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <h3 className="text-platinum font-semibold text-lg mb-4 font-display">
              What makes applications fail
            </h3>
            <p className="text-platinum-dim text-sm leading-relaxed mb-4">
              Most rejections are not caused by an under-qualified profile. They are caused by
              evidence that is generic rather than specific, a personal statement that describes
              a career instead of arguing a case, and recommendation letters that talk about a
              working relationship instead of demonstrating sector-level impact.
            </p>
            <p className="text-platinum-dim text-sm leading-relaxed mb-4">
              The assessment framework is structured and consistent. Evaluators are looking for
              specific signals — scope of influence, independence of contribution, recognition
              by peers — presented in a defined order. Applicants who don't know that structure
              fail regardless of how strong their underlying work is.{" "}
              <a href="/blog/why-tech-nation-applications-fail" className="text-brand underline underline-offset-2 hover:opacity-80 transition-opacity">
                Why most applications fail →
              </a>
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.2} className="mt-10 card-border p-8 bg-brand/4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-platinum font-semibold text-base mb-2">
                Global Talent vs Skilled Worker: which should you apply for?
              </h3>
              <p className="text-platinum-dim text-sm leading-relaxed">
                If you can qualify for Global Talent, applying for Skilled Worker is one of the most costly decisions you can make.
                Global Talent gives you full work freedom, no employer tie, and a faster ILR path.
                Skilled Worker ties you to a sponsor and limits what you can do.{" "}
                <a href="/blog/why-uk-global-talent-beats-skilled-worker" className="text-brand underline underline-offset-2 hover:opacity-80 transition-opacity">
                  Read the comparison →
                </a>
              </p>
            </div>
            <a href="/scorecard"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm whitespace-nowrap flex-shrink-0">
              Check my eligibility →
            </a>
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
      a: "No. Meridian is an advisory service only. Amit helps you structure your evidence portfolio and narrative — he is not an immigration lawyer, is not OISC-regulated, and does not provide immigration legal advice. For legal immigration advice, you should consult an accredited immigration solicitor.",
    },
    {
      q: "Do you guarantee approval?",
      a: "No, and anyone who does is misleading you. What Amit does is ensure your case is as strong as it can be — that your evidence is specific, your narrative is coherent, and your recommendations are structured to address what evaluators actually look for. That is what moves the odds.",
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
      a: "He limits Full Case Build engagements to a small number per month so that each receives proper attention. Application Advisory engagements are also limited. Diagnostics have more availability. If you are considering applying, the assessment is the right first step regardless of timing.",
    },
  ]
  return (
    <section id="faq" className="py-24 px-6 border-t border-void-border">
      <div className="max-w-3xl mx-auto">
        <FadeUp className="mb-12">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">FAQ</p>
          <h2 className="font-display text-4xl text-platinum">Common questions.</h2>
        </FadeUp>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card-border overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left">
                <span className="text-platinum font-medium text-sm leading-snug">{faq.q}</span>
                <motion.span animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-brand text-xl flex-shrink-0">+</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                    <p className="px-6 pb-5 text-sm text-platinum-dim leading-relaxed border-t border-void-border pt-4">
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
    <section className="py-24 px-6 border-t border-void-border">
      <div className="max-w-4xl mx-auto">
        <div className="card-border p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute -left-24 -bottom-24 w-96 h-96 orb-violet opacity-20 pointer-events-none" />
          <div className="absolute -right-24 -top-24 w-80 h-80 orb-cyan opacity-15 pointer-events-none" />
          <div className="relative z-10">
            <FadeUp>
              <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-5">Ready to build your case?</p>
              <h2 className="font-display text-4xl md:text-6xl text-platinum mb-6 leading-tight">
                Start with a{" "}
                <span className="text-gradient-brand">free 4-minute check.</span>
              </h2>
              <p className="text-platinum-dim max-w-xl mx-auto mb-10 leading-relaxed">
                Take the readiness assessment, see exactly where your case stands,
                and decide if you want Amit to help you build from there.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/scorecard"
                  className="btn-primary inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl text-white font-semibold text-base shadow-[0_0_50px_rgba(124,58,237,0.35)]">
                  Take the free assessment
                  <span className="text-data-light text-lg">→</span>
                </Link>
                <Link href="/apply"
                  className="btn-secondary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-platinum font-medium text-base">
                  Apply for advisory directly
                </Link>
              </div>
              <p className="text-xs text-platinum-faint mt-6">No account. No email required to start. Advisory-only — not immigration law.</p>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-14 px-6 border-t border-void-border">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-data flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="flex flex-col leading-none">
            <span className="font-display text-base text-platinum leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
          </span>
            </div>
            <p className="text-platinum-dim text-sm leading-relaxed max-w-xs mb-5">
              Strategic advisory for builders applying for UK Global Talent recognition.
              Evidence architecture, narrative engineering, recommendation strategy.
            </p>
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">Reach out directly</p>
            <div className="flex flex-col gap-2.5">
              <a href="https://www.linkedin.com/in/amitisb1tyagi/"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-platinum-dim hover:text-platinum transition-colors group">
                <span className="w-7 h-7 rounded-lg bg-[#0A66C2]/15 border border-[#0A66C2]/30 flex items-center justify-center text-[#0A66C2] text-xs group-hover:bg-[#0A66C2]/25 transition-colors">in</span>
                Connect on LinkedIn
              </a>
              <a href="https://wa.me/447776842287"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-platinum-dim hover:text-platinum transition-colors group">
                <span className="w-7 h-7 rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] text-xs group-hover:bg-[#25D366]/25 transition-colors">W</span>
                WhatsApp +44 7776 842287
              </a>
              <a href="https://www.instagram.com/meridianglobaltalent/"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm text-platinum-dim hover:text-platinum transition-colors group">
                <span className="w-7 h-7 rounded-lg bg-[#E1306C]/15 border border-[#E1306C]/30 flex items-center justify-center text-[#E1306C] text-xs group-hover:bg-[#E1306C]/25 transition-colors">IG</span>
                Instagram @meridianglobaltalent
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">Services</p>
            <ul className="space-y-3">
              {[["Readiness Assessment", "/scorecard"], ["Apply for Advisory", "/apply"], ["Insights Blog", "/blog"], ["Full Case Build", "/apply"]].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-sm text-platinum-dim hover:text-platinum transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">Info</p>
            <ul className="space-y-3">
              {[["About Amit", "/about"], ["Process", "#process"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([l, h]) => (
                <li key={l}><a href={h} className="text-sm text-platinum-dim hover:text-platinum transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-3">
              {[
                ["Terms & Conditions", "/legal#terms"],
                ["Privacy Policy",     "/legal#privacy"],
                ["Refund Policy",      "/legal#refunds"],
                ["Disclaimer",         "/legal#disclaimer"],
                ["NDA & Confidentiality", "/legal#nda"],
                ["Service Delivery",   "/legal#delivery"],
              ].map(([l, h]) => (
                <li key={l}><Link href={h} className="text-sm text-platinum-dim hover:text-platinum transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-void-border">
          <p className="text-xs text-platinum-faint leading-relaxed max-w-3xl">
            <strong className="text-platinum-dim">Advisory only — not immigration legal advice.</strong>{" "}
            Meridian is an independent advisory service. Amit Tyagi is not an immigration lawyer,
            is not OISC-registered, and does not provide regulated immigration advice.
            We are not affiliated with the UK Government, the Home Office, Tech Nation, or any visa body.
            For regulated immigration legal advice, consult an accredited immigration solicitor.
          </p>
          <p className="text-xs text-platinum-faint mt-3">© {new Date().getFullYear()} Meridian. All rights reserved.</p>
        </div>
      </div>
    </footer>
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
      <Navbar />
      <Hero />
      <TrustBar />
      <WhoThisIsFor />
      <Pain />
      <ScorecardCTA />
      <Services />
      <Process />
      <AboutAmit />
      <Testimonial />
      <Pricing />
      <VisaExplainer />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
