"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Link from "next/link"

interface FormData {
  name: string
  email: string
  role: string
  company: string
  built: string
  globalGoal: string
  biggestGap: string
}

const INITIAL: FormData = {
  name: "", email: "", role: "", company: "", built: "", globalGoal: "", biggestGap: "",
}

export default function ApplyPage() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refId] = useState(`MRD-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`)

  function update(key: keyof FormData, val: string) {
    setForm((p) => ({ ...p, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false)
    setSubmitted(true)
  }

  const allFilled = Object.values(form).every((v) => v.trim().length > 0)

  if (submitted) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg w-full text-center">
          <div className="orb-violet absolute inset-0 pointer-events-none opacity-20" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-brand">✦</span>
          </motion.div>
          <h1 className="font-display text-4xl text-platinum mb-4">Application received.</h1>
          <p className="text-platinum-dim leading-relaxed mb-6">
            Amit will review your application personally and respond within 48 hours with a diagnostic observation specific to what you shared.
          </p>
          <div className="card-border p-6 mb-6">
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">Your reference</p>
            <p className="font-mono text-2xl text-gradient-brand">{refId}</p>
            <p className="text-xs text-platinum-faint mt-2">Use this as your payment reference</p>
          </div>
          <p className="text-sm text-platinum-dim mb-6">
            Response will come to <span className="text-platinum">{form.email}</span> within 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Link href="/pay"
              className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-white font-medium">
              View payment details →
            </Link>
            <Link href="/" className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm text-platinum font-medium">
              ← Back to Meridian
            </Link>
          </div>
          <p className="text-xs text-platinum-faint text-center">
            Your session will only be confirmed once payment is received.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-lg text-gradient-brand">Meridian</Link>
          <span className="text-xs font-mono text-platinum-faint">Strategic Review Application</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}>

          <div className="mb-10">
            <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">
              Apply for Strategic Review
            </p>
            <h1 className="font-display text-4xl text-platinum mb-4 leading-tight">
              Tell us about<br />
              <span className="text-gradient-brand">what you have built.</span>
            </h1>
            <p className="text-platinum-dim leading-relaxed">
              Every application is reviewed personally by Amit. Be specific — the more context you share,
              the better the diagnostic observation you receive in the response.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name + email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Your full name"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="your@email.com"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Role + company */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">
                  Current Role / Title
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  placeholder="Founder, CTO, Head of Product..."
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">
                  Company / Organisation
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="Your company name"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* What you have built */}
            <div>
              <label className="block text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">
                What have you built? (the most significant work)
              </label>
              <textarea
                value={form.built}
                onChange={(e) => update("built", e.target.value)}
                placeholder="Describe the most significant thing you have built — product, company, team, system. Be specific about scale and outcomes where possible."
                rows={4}
                className="input-field resize-none"
                required
              />
            </div>

            {/* Global goal */}
            <div>
              <label className="block text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">
                What is your global recognition goal?
              </label>
              <textarea
                value={form.globalGoal}
                onChange={(e) => update("globalGoal", e.target.value)}
                placeholder="UK Global Talent recognition, international investor relationships, global speaking roles, general global visibility — what specifically are you trying to achieve?"
                rows={3}
                className="input-field resize-none"
                required
              />
            </div>

            {/* Biggest credibility gap */}
            <div>
              <label className="block text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">
                What do you believe is your biggest credibility gap?
              </label>
              <textarea
                value={form.biggestGap}
                onChange={(e) => update("biggestGap", e.target.value)}
                placeholder="Narrative clarity? External validation? Evidence depth? Visibility? Be honest — this is what Amit will focus on in his response."
                rows={3}
                className="input-field resize-none"
                required
              />
            </div>

            {/* Consent + submit */}
            <div className="pt-2">
              <motion.button
                type="submit"
                disabled={!allFilled || loading}
                whileHover={allFilled && !loading ? { scale: 1.01 } : {}}
                whileTap={allFilled && !loading ? { scale: 0.99 } : {}}
                className={`btn-primary w-full py-4 rounded-xl text-white font-medium text-base transition-all ${
                  !allFilled || loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Submitting...
                  </span>
                ) : (
                  "Submit Strategic Review Application →"
                )}
              </motion.button>
              <p className="text-xs text-platinum-faint text-center mt-4 leading-relaxed">
                Your application is reviewed personally by Amit within 48 hours.
                This is not a booking — it is an application. Acceptance is not guaranteed.
              </p>
            </div>
          </form>

          {/* Legal note */}
          <div className="mt-10 pt-8 border-t border-void-border">
            <p className="text-xs text-platinum-faint leading-relaxed">
              <strong className="text-platinum-dim">Advisory only.</strong> Meridian provides narrative positioning
              and credibility advisory services. We are not an immigration consultancy, legal advisory firm, or
              accredited immigration representative. We are independent and not affiliated with the UK Government,
              Tech Nation, or any official visa body. Nothing in our services constitutes legal advice.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
