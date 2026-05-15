"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { SiteFooter } from "@/components/SiteFooter"
import { SiteNav } from "@/components/SiteNav"

type Tier = "diagnostic" | "advisory" | "full" | "unsure"
type Step = 1 | 2 | 3

const TIERS: { id: Tier; name: string; desc: string; price: string; tag?: string; unsure?: boolean }[] = [
  { id: "diagnostic", name: "Readiness Diagnostic",    desc: "Written diagnostic — where you're strong, where you're weak, what to fix.", price: "£500" },
  { id: "advisory",   name: "Application Advisory",    desc: "Sessions, written feedback, recommendation strategy, 30-day support.", price: "£2,500", tag: "Most chosen" },
  { id: "full",       name: "Full Case Build",          desc: "Full build. Every component reviewed and coached end-to-end.", price: "£5,500" },
  { id: "unsure",     name: "Not sure yet — let Amit recommend", desc: "He'll confirm the right tier after reading your application.", price: "Recommended", unsure: true },
]

interface ApplyForm {
  firstName: string; lastName: string; email: string; phone: string
  role: string; location: string; linkedin: string
  built: string; whyNow: string; concern: string
  timeline: string; appliedBefore: string
}

const INITIAL_FORM: ApplyForm = {
  firstName: "", lastName: "", email: "", phone: "",
  role: "", location: "", linkedin: "",
  built: "", whyNow: "", concern: "",
  timeline: "1–3 months", appliedBefore: "No — first attempt",
}

const TIMELINE_OPTS = ["Within the next month", "1–3 months", "3–6 months", "Just exploring"]
const APPLIED_OPTS  = ["No — first attempt", "Yes — rejected, reapplying", "Yes — approved, asking for someone else"]

export default function ApplyPage() {
  const [step, setStep]       = useState<Step>(1)
  const [tier, setTier]       = useState<Tier>("advisory")
  const [form, setForm]       = useState<ApplyForm>(INITIAL_FORM)
  const [agreed, setAgreed]   = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  function upd(k: keyof ApplyForm, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function submit() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  const stepDot = (n: number) => {
    if (n < step) return { bg: "var(--color-ink)", color: "white", border: "var(--color-ink)" }
    if (n === step) return { bg: "var(--color-violet)", color: "white", border: "var(--color-violet)", boxShadow: "0 0 0 4px rgba(91,33,182,.15)" }
    return { bg: "transparent", color: "var(--color-ink-faint)", border: "var(--color-line)" }
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <label className="block font-mono text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: "var(--color-ink-faint)" }}>{label}</label>
      {children}
    </div>
  )

  const inputCls = "input-field"

  return (
    <div className="min-h-screen" style={{ background: "var(--color-canvas)" }}>

      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ background: "radial-gradient(800px 600px at 20% 0%, rgba(91,33,182,.15), transparent 60%), radial-gradient(600px 500px at 90% 30%, rgba(184,137,59,.1), transparent 60%), var(--color-canvas)", padding: "64px 0 32px" }}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--color-violet)" }}>
            Apply to work with Amit
          </p>
          <h1 className="font-display text-5xl md:text-[54px] leading-tight mb-5 max-w-3xl" style={{ letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
            A short application.{" "}
            <span className="text-gradient-brand italic">A 48-hour personal response.</span>
          </h1>
          <p className="text-lg max-w-xl leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            Tell Amit where you are. He reads every application. Replies within 48 hours with one specific observation — before any payment.
          </p>
        </div>
      </section>

      {/* ── Main shell ───────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-[1.4fr_1fr] gap-14 items-start">

        {/* Form card */}
        <div>
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div key="form" initial={{ opacity: 1 }}>
                <div className="card-border p-10">
                  {/* Step indicator */}
                  <div className="flex items-center gap-3 mb-8 font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: "var(--color-ink-faint)" }}>
                    {[1,2,3].map((n, i) => {
                      const styles = stepDot(n)
                      const labels = ["Tier", "About you", "Your case"]
                      return (
                        <div key={n} className="flex items-center gap-2">
                          {i > 0 && <div className="h-px flex-1 w-8" style={{ background: "var(--color-line)" }} />}
                          <div className="w-7 h-7 rounded-full flex items-center justify-center font-display text-sm transition-all"
                            style={{ background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`, boxShadow: (styles as { boxShadow?: string }).boxShadow }}>
                            {n < step ? "✓" : n}
                          </div>
                          <span>{labels[i]}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Step 1 — Tier */}
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <h2 className="font-display text-4xl mb-3" style={{ color: "var(--color-ink)", letterSpacing: "-0.025em" }}>
                        Which tier are you considering?
                      </h2>
                      <p className="text-sm mb-7" style={{ color: "var(--color-ink-soft)" }}>
                        No commitment. Amit confirms the tier after reading.
                      </p>
                      <div className="space-y-3 mb-7">
                        {TIERS.map(t => (
                          <button key={t.id} onClick={() => setTier(t.id)}
                            className="w-full text-left flex items-center gap-5 p-5 rounded-2xl border-[1.5px] transition-all"
                            style={{
                              border: tier === t.id ? "1.5px solid var(--color-violet)" : "1.5px solid var(--color-line)",
                              background: tier === t.id ? "rgba(91,33,182,.03)" : "var(--color-paper)",
                              boxShadow: tier === t.id ? "0 0 0 4px rgba(91,33,182,.06)" : "none",
                            }}>
                            <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 relative transition-all"
                              style={{
                                borderColor: tier === t.id ? "var(--color-violet)" : "var(--color-line)",
                                background: tier === t.id ? "var(--color-violet)" : "transparent",
                              }}>
                              {tier === t.id && (
                                <div className="absolute inset-[4px] rounded-full bg-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm flex items-center gap-2 mb-0.5" style={{ color: "var(--color-ink)" }}>
                                {t.name}
                                {t.tag && (
                                  <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(184,137,59,.1)", color: "#8C6428" }}>
                                    {t.tag}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs" style={{ color: "var(--color-ink-soft)" }}>{t.desc}</p>
                            </div>
                            <div className={`font-display flex-shrink-0 ${t.unsure ? "font-mono text-xs" : "text-2xl"}`}
                              style={{ color: t.unsure ? "var(--color-ink-faint)" : "var(--color-ink)" }}>
                              {t.price}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <button onClick={() => setStep(2)} className="btn-primary text-white text-sm px-6 py-3 rounded-full font-medium">
                          Continue →
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 — About you */}
                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <h2 className="font-display text-4xl mb-3" style={{ color: "var(--color-ink)", letterSpacing: "-0.025em" }}>
                        Quick details.
                      </h2>
                      <p className="text-sm mb-7" style={{ color: "var(--color-ink-soft)" }}>
                        Amit needs the basics to respond personally.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="First name"><input type="text" placeholder="Priya" value={form.firstName} onChange={e => upd("firstName", e.target.value)} className={inputCls} /></Field>
                        <Field label="Last name"><input type="text" placeholder="Sharma" value={form.lastName} onChange={e => upd("lastName", e.target.value)} className={inputCls} /></Field>
                        <Field label="Email"><input type="email" placeholder="you@example.com" value={form.email} onChange={e => upd("email", e.target.value)} className={inputCls} /></Field>
                        <Field label="WhatsApp / phone (optional)"><input type="tel" placeholder="+91 …" value={form.phone} onChange={e => upd("phone", e.target.value)} className={inputCls} /></Field>
                        <Field label="Current role"><input type="text" placeholder="Co-founder & CTO" value={form.role} onChange={e => upd("role", e.target.value)} className={inputCls} /></Field>
                        <Field label="Location"><input type="text" placeholder="Bengaluru, India" value={form.location} onChange={e => upd("location", e.target.value)} className={inputCls} /></Field>
                      </div>
                      <Field label="Best LinkedIn link"><input type="text" placeholder="linkedin.com/in/…" value={form.linkedin} onChange={e => upd("linkedin", e.target.value)} className={inputCls} /></Field>
                      <div className="flex justify-between gap-3 mt-2">
                        <button onClick={() => setStep(1)} className="btn-secondary text-sm px-5 py-2.5 rounded-full font-medium" style={{ color: "var(--color-ink)", borderColor: "var(--color-line)" }}>← Back</button>
                        <button onClick={() => setStep(3)} className="btn-primary text-white text-sm px-6 py-3 rounded-full font-medium">Continue →</button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 — Your case */}
                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <h2 className="font-display text-4xl mb-3" style={{ color: "var(--color-ink)", letterSpacing: "-0.025em" }}>
                        Your case in your own words.
                      </h2>
                      <p className="text-sm mb-7" style={{ color: "var(--color-ink-soft)" }}>
                        Three prompts. Amit&apos;s reply will reference one directly.
                      </p>
                      <Field label="What have you built that you'd describe as exceptional?">
                        <textarea rows={3} placeholder="A few sentences. Specific is better than impressive." value={form.built} onChange={e => upd("built", e.target.value)} className={`${inputCls} resize-none`} />
                      </Field>
                      <Field label="Why now? What's driving the application?">
                        <textarea rows={3} placeholder="Career move, family, employer change, ILR strategy…" value={form.whyNow} onChange={e => upd("whyNow", e.target.value)} className={`${inputCls} resize-none`} />
                      </Field>
                      <Field label="What's your biggest concern about your application?">
                        <textarea rows={3} placeholder="The honest answer. Amit reads these every day." value={form.concern} onChange={e => upd("concern", e.target.value)} className={`${inputCls} resize-none`} />
                      </Field>
                      <div className="grid sm:grid-cols-2 gap-4 mt-2">
                        <Field label="Timeline">
                          <select value={form.timeline} onChange={e => upd("timeline", e.target.value)} className={inputCls}>
                            {TIMELINE_OPTS.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </Field>
                        <Field label="Have you applied before?">
                          <select value={form.appliedBefore} onChange={e => upd("appliedBefore", e.target.value)} className={inputCls}>
                            {APPLIED_OPTS.map(o => <option key={o}>{o}</option>)}
                          </select>
                        </Field>
                      </div>
                      <label className="flex items-start gap-3 text-xs leading-relaxed mt-4 cursor-pointer" style={{ color: "var(--color-ink-soft)" }}>
                        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 flex-shrink-0" />
                        <span>
                          I understand this is advisory only and not regulated immigration legal advice. I&apos;ve read the{" "}
                          <Link href="/legal#disclaimer" className="font-semibold" style={{ color: "var(--color-violet)" }}>disclaimer</Link>.
                        </span>
                      </label>
                      <div className="flex justify-between gap-3 mt-6">
                        <button onClick={() => setStep(2)} className="btn-secondary text-sm px-5 py-2.5 rounded-full font-medium" style={{ color: "var(--color-ink)", borderColor: "var(--color-line)" }}>← Back</button>
                        <button onClick={submit} disabled={loading || !agreed}
                          className="btn-primary text-white text-sm px-7 py-3 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full inline-block" />
                              Sending…
                            </span>
                          ) : "Send to Amit →"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Success state */
              <motion.div key="success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="card-border p-12 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: "linear-gradient(135deg, #5B21B6, #2E0F69)", boxShadow: "0 16px 48px -16px rgba(91,33,182,.4)" }}>
                  <span className="text-white text-2xl">✓</span>
                </div>
                <h2 className="font-display text-4xl mb-4" style={{ color: "var(--color-ink)", letterSpacing: "-0.025em" }}>
                  Your application is on Amit&apos;s desk.
                </h2>
                <p className="max-w-md mx-auto mb-8 leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
                  He reads every one personally. Reply in{" "}
                  <strong style={{ color: "var(--color-ink)" }}>48 hours</strong> from{" "}
                  <strong style={{ color: "var(--color-ink)" }}>amit@meridian.advisory</strong>. One specific observation. No template.
                </p>

                {/* Timeline */}
                <div className="text-left max-w-sm mx-auto mb-8 rounded-2xl p-6" style={{ background: "var(--color-canvas)" }}>
                  {[
                    { n: "1", t: "Within 24 hours",    d: "Confirmation email with what Amit has read so far" },
                    { n: "2", t: "Within 48 hours",    d: "Personal response — one specific observation, no template" },
                    { n: "3", t: "If we're a fit",     d: "Confirmed tier & engagement scope · pricing only confirmed at this stage" },
                  ].map(row => (
                    <div key={row.n} className="flex items-start gap-4 py-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[11px] font-semibold flex-shrink-0"
                        style={{ background: "var(--color-paper)", border: "1px solid var(--color-line)", color: "var(--color-violet)" }}>
                        {row.n}
                      </div>
                      <div>
                        <div className="font-semibold text-sm mb-0.5" style={{ color: "var(--color-ink)" }}>{row.t}</div>
                        <div className="text-xs" style={{ color: "var(--color-ink-soft)" }}>{row.d}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center flex-wrap">
                  <Link href="/scorecard"
                    className="btn-secondary text-sm px-6 py-3 rounded-full font-medium"
                    style={{ color: "var(--color-ink)", borderColor: "var(--color-line)" }}>
                    Take the readiness check
                  </Link>
                  <Link href="/blog"
                    className="btn-primary text-white text-sm px-6 py-3 rounded-full font-medium">
                    Read Amit&apos;s insights →
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Sidebar ──────────────────────────────────────── */}
        <aside className="space-y-4 lg:sticky lg:top-24">
          {/* 48h card */}
          <div className="rounded-2xl p-7 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #2E0F69, #5B21B6 60%, #1A1530)" }}>
            <div className="absolute -right-14 -top-14 w-44 h-44 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(184,137,59,.25), transparent 70%)" }} />
            <div className="relative z-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>What happens next</p>
              <div className="font-display text-5xl leading-none mb-3"
                style={{ background: "linear-gradient(135deg, #fff 0%, #D4A647 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                48 hrs
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
                Personal response. Not an auto-reply. One specific observation.
              </p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="card-border p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--color-ink-faint)" }}>Recently advised</p>
            <p className="font-display text-lg leading-snug mb-4" style={{ color: "var(--color-ink)" }}>
              <span style={{ fontSize: 28, color: "var(--color-violet)", lineHeight: 0, verticalAlign: -8, marginRight: 2 }}>&ldquo;</span>
              First attempt rejected. Amit read the rejection letter and found the gap immediately. Second attempt approved in two weeks.
            </p>
            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--color-line)" }}>
              <span className="text-xs" style={{ color: "var(--color-ink-faint)" }}>K · CTO, Fintech startup</span>
              <span className="font-mono text-[10px] px-2 py-1 rounded-md"
                style={{ background: "rgba(91,33,182,.08)", color: "var(--color-violet)" }}>Approved</span>
            </div>
          </div>

          {/* What this is not */}
          <div className="card-border p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--color-ink-faint)" }}>What this is not</p>
            {[
              ["Not", "immigration legal advice. Amit is not OISC-regulated."],
              ["Not", "a form-filling service."],
              ["Not", "a guarantee of approval — anyone offering that is misleading you."],
            ].map(([b, rest], i) => (
              <p key={i} className="text-sm mb-3 last:mb-0" style={{ color: "var(--color-ink-soft)" }}>
                <strong style={{ color: "var(--color-ink)" }}>{b}</strong> {rest}
              </p>
            ))}
          </div>

          {/* Capacity */}
          <div className="card-border p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--color-ink-faint)" }}>Capacity this quarter</p>
            {[
              { label: "Full Case Build",       status: "1 of 6 left",    color: "var(--color-red)" },
              { label: "Application Advisory",  status: "8 of 12 left",   color: "var(--color-gold)" },
              { label: "Readiness Diagnostic",  status: "Open",           color: "var(--color-sage)" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 text-sm"
                style={{ borderBottom: "1px dashed var(--color-line-soft)" }}>
                <span style={{ color: "var(--color-ink-soft)" }}>{row.label}</span>
                <strong style={{ color: row.color }}>{row.status}</strong>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <SiteFooter />
    </div>
  )
}
