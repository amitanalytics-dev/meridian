"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { SiteFooter } from "@/components/SiteFooter"
import { SiteNav } from "@/components/SiteNav"

const STATS = [
  { value: "20+",  label: "Builders advised",       accent: "violet" },
  { value: "48h",  label: "Personal response",       accent: "gold" },
  { value: "4",    label: "Continents represented",  accent: "violet" },
  { value: "£500", label: "Starting engagement",     accent: "gold" },
]

const METHODS = [
  {
    num: "01",
    title: "Evidence Architecture",
    body: "Map every proof point in your career against the specific signals evaluators are trained to look for. Identify what's missing, what's weak, and what to lead with — before you write a word of the statement.",
  },
  {
    num: "02",
    title: "Narrative Engineering",
    body: "Build the career story that creates a coherent, compelling case — not a job history. Structure it so evaluators can read your trajectory in 90 seconds and walk away with the right conclusion.",
  },
  {
    num: "03",
    title: "Recommendation Architecture",
    body: "Identify the right recommenders, coach them on what to write, and structure a three-letter portfolio where each letter covers a different dimension of your credibility. The most under-invested pillar.",
  },
]

const PRINCIPLES = [
  {
    n: "i.",
    title: "The case is yours, not a template.",
    body: "Two builders with similar profiles will end up with very different cases. Every engagement starts from your specific situation — your evidence, your career, your sector — and builds outward. No filled-in templates.",
  },
  {
    n: "ii.",
    title: "Strong work doesn't speak for itself.",
    body: "The most common mistake is assuming your work is self-evidently exceptional. It rarely is to a stranger reading 40 applications a day. The job of the case is to make the argument the work cannot make on its own.",
  },
  {
    n: "iii.",
    title: "Honesty over hype.",
    body: "If your case isn't ready, Amit will say so. The most valuable advice is sometimes \"build more evidence before applying\" — and a £500 diagnostic is enough to find that out cheaply.",
  },
  {
    n: "iv.",
    title: "Fixed scope. Fixed price.",
    body: "No open-ended retainers. No hourly billing. No surprise scope creep. Three tiers, three prices, every engagement defined before it begins.",
  },
  {
    n: "v.",
    title: "Advisory, not legal advice.",
    body: "Amit is not an immigration lawyer and is not OISC-regulated. He helps with case architecture and narrative — not with regulated immigration advice. If you need legal advice, you should consult an accredited immigration solicitor in parallel.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-canvas)" }}>

      <SiteNav />

      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        style={{
          background: "radial-gradient(800px 600px at 20% 0%, rgba(91,33,182,.15), transparent 60%), var(--color-canvas)",
          paddingTop: 80,
          paddingBottom: 0,
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--color-violet)" }}>
              About Amit
            </p>
            <h1 className="font-display text-5xl md:text-6xl leading-tight mb-6 max-w-4xl" style={{ letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
              He didn&apos;t learn this from a textbook.{" "}
              <span className="text-gradient-brand italic">He went through it.</span>
            </h1>
            <p className="text-lg max-w-2xl mb-14 leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
              Amit Tyagi is a UK Global Talent visa holder under{" "}
              <strong style={{ color: "var(--color-ink)" }}>Exceptional Talent</strong> — and the strategic advisor
              behind Meridian. Every engagement starts with one principle: the case is yours, not a template.
            </p>

            {/* Two-column: text + portrait */}
            <div className="grid md:grid-cols-[1.5fr_1fr] gap-16 items-center mb-0">
              <div>
                {[
                  "Amit applied for UK Global Talent under the Exceptional Talent category through a strategically engineered, evidence-led application. Not by luck. By understanding exactly how the assessment framework evaluates applicants — and building a case that spoke directly to that framework.",
                  "His background is in fintech and startups — founder, operator, product builder. He knows how exceptional work actually looks from the inside, and more importantly, how to translate that into the language evaluators recognise.",
                  "His advisory is not built on a template. Every engagement starts from your specific situation, your evidence, your career — and builds toward a case that is uniquely yours.",
                ].map((p, i) => (
                  <motion.p key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    className="text-lg leading-relaxed mb-4" style={{ color: "var(--color-ink-soft)" }}>
                    {p}
                  </motion.p>
                ))}
                <div className="flex gap-3 mt-8 flex-wrap">
                  <Link href="/apply" className="btn-primary text-white text-sm px-6 py-3 rounded-full font-medium inline-block">
                    Apply to work with Amit →
                  </Link>
                  <a href="https://www.linkedin.com/in/amitisb1tyagi/" target="_blank" rel="noopener noreferrer"
                    className="btn-secondary text-sm px-6 py-3 rounded-full font-medium inline-block"
                    style={{ color: "var(--color-ink)", borderColor: "var(--color-line)" }}>
                    Connect on LinkedIn
                  </a>
                </div>
              </div>

              {/* Portrait card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="relative rounded-3xl overflow-hidden"
                style={{
                  aspectRatio: "1.05",
                  background: "linear-gradient(135deg, #2E0F69 0%, #5B21B6 60%, #B8893B 100%)",
                  boxShadow: "var(--shadow-lift)",
                }}>
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, rgba(20,16,40,0) 55%, rgba(20,16,40,0.6) 100%)" }} />
                <div className="absolute top-5 right-5 px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest"
                  style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", color: "white", letterSpacing: "0.16em" }}>
                  Exceptional Talent
                </div>
                <div className="absolute bottom-5 left-5 font-display text-xl" style={{ color: "rgba(255,255,255,0.85)" }}>
                  Amit Tyagi
                </div>
                {/* Decorative glyph */}
                <div className="absolute inset-0 flex items-center justify-center font-display italic text-[120px] leading-none"
                  style={{ color: "rgba(255,255,255,0.12)", pointerEvents: "none", userSelect: "none" }}>
                  A
                </div>
              </motion.div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-16 pt-14"
              style={{ borderTop: "1px solid var(--color-line)" }}>
              {STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}>
                  <div className="font-display text-5xl leading-none mb-2" style={{ letterSpacing: "-0.03em", color: s.accent === "violet" ? "var(--color-violet)" : "var(--color-gold)" }}>
                    {s.value}
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em]" style={{ color: "var(--color-ink-faint)" }}>
                    {s.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Method ─────────────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--color-canvas-soft)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--color-violet)" }}>
            The method
          </p>
          <h2 className="font-display text-4xl mb-4 max-w-3xl" style={{ letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
            Three pillars of <span className="text-gradient-brand italic">a strong case.</span>
          </h2>
          <p className="max-w-xl mb-12 leading-relaxed" style={{ color: "var(--color-ink-soft)", fontSize: 16 }}>
            Every engagement, whatever the tier, is structured around the same three architectural questions.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {METHODS.map((m, i) => (
              <motion.div key={m.num} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="card-border p-8">
                <div className="font-display text-5xl leading-none mb-4" style={{ color: "var(--color-violet)" }}>
                  {m.num}
                </div>
                <h3 className="font-sans font-bold text-lg mb-3" style={{ color: "var(--color-ink)" }}>{m.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>{m.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principles ─────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--color-violet)" }}>
            Principles
          </p>
          <h2 className="font-display text-4xl mb-12" style={{ letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
            How <span className="text-gradient-brand italic">Amit works.</span>
          </h2>

          {PRINCIPLES.map((p, i) => (
            <motion.div key={p.n} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="grid grid-cols-[50px_1fr] gap-6 py-7"
              style={{ borderBottom: i < PRINCIPLES.length - 1 ? "1px solid var(--color-line)" : "none" }}>
              <div className="font-display text-3xl leading-none" style={{ color: "var(--color-gold)" }}>{p.n}</div>
              <div>
                <h3 className="font-sans font-bold text-xl mb-2" style={{ color: "var(--color-ink)" }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>{p.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="py-28 px-6 text-center relative overflow-hidden"
        style={{ background: "radial-gradient(800px 500px at 20% 0%, rgba(91,33,182,.55), transparent 60%), radial-gradient(700px 400px at 80% 100%, rgba(184,137,59,.3), transparent 60%), var(--color-ink)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-6 inline-flex" style={{ color: "rgba(255,255,255,0.5)" }}>
          Want Amit to read your case?
        </p>
        <h2 className="font-display text-4xl md:text-5xl mb-5 max-w-3xl mx-auto" style={{ color: "white", letterSpacing: "-0.025em" }}>
          Start with a <span className="text-gradient-brand italic">free 4-minute check.</span>
        </h2>
        <p className="max-w-xl mx-auto mb-10 text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
          Or skip the check and apply directly — Amit will respond personally within 48 hours.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/scorecard"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #B8893B, #8C6428)", boxShadow: "0 8px 32px -8px rgba(184,137,59,.5)" }}>
            Take the free assessment →
          </Link>
          <Link href="/apply"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5"
            style={{ border: "1px solid rgba(255,255,255,0.25)", color: "white", background: "rgba(255,255,255,0.06)" }}>
            Apply for advisory
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
