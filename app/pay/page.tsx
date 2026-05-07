"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

const BANK = {
  name:    "Amit Tyagi",
  sort:    "09-01-30",
  account: "10676628",
  email:   "amit@berriesadvisory.com",
}

const TIERS = [
  { name: "Readiness Diagnostic",  range: "£500",   col: "#7C3AED" },
  { name: "Application Advisory",  range: "£2,500", col: "#06B6D4" },
  { name: "Full Case Build",       range: "£5,500", col: "#F59E0B" },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="text-xs font-mono px-2.5 py-1 rounded-md border border-void-border text-platinum-faint hover:text-platinum hover:border-brand/40 transition-all"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  )
}

export default function PayPage() {
  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-lg text-gradient-brand">Meridian</Link>
          <span className="text-xs font-mono text-platinum-faint">Payment</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Title */}
          <div className="mb-10">
            <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">
              Secure your engagement
            </p>
            <h1 className="font-display text-4xl text-platinum mb-4 leading-tight">
              Payment details.
            </h1>
            <p className="text-platinum-dim leading-relaxed">
              Transfer the agreed amount using the bank details below, then email Amit
              with your payment confirmation. Your call or advisory session will be confirmed
              only once payment has been received.
            </p>
          </div>

          {/* Important notice */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-4 p-5 rounded-xl border border-gold/30 bg-gold/6 mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-gold mt-1.5 flex-shrink-0" />
            <p className="text-sm text-gold leading-relaxed">
              <strong>Your session is not confirmed until payment clears.</strong>{" "}
              Even if a time has been agreed, Amit will only proceed once the bank transfer
              has been received and confirmed by email.
            </p>
          </motion.div>

          {/* Bank details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card-border p-8 mb-6"
          >
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-6">
              UK Bank Transfer Details
            </p>

            <div className="space-y-4">
              {[
                { label: "Account name", value: BANK.name },
                { label: "Sort code",    value: BANK.sort },
                { label: "Account number", value: BANK.account },
              ].map((row) => (
                <div key={row.label}
                  className="flex items-center justify-between gap-4 py-3.5 border-b border-void-border last:border-0">
                  <div>
                    <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-1">
                      {row.label}
                    </p>
                    <p className="font-mono text-lg text-platinum">{row.value}</p>
                  </div>
                  <CopyButton text={row.value} />
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-void-surface border border-void-border">
              <p className="text-xs text-platinum-faint leading-relaxed">
                <strong className="text-platinum-dim">Payment reference:</strong>{" "}
                Use your application reference number (e.g. MRD-2026-XXXX) as the payment reference
                so Amit can match the transfer to your application.
              </p>
            </div>
          </motion.div>

          {/* Step 2: email */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="card-border p-8 mb-6"
          >
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-5">
              After you pay — email Amit
            </p>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-1">Email</p>
                <p className="font-mono text-base text-platinum">{BANK.email}</p>
              </div>
              <CopyButton text={BANK.email} />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a href="https://www.linkedin.com/in/amitisb1tyagi/"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/8 text-sm text-platinum hover:bg-[#0A66C2]/15 transition-all">
                <span className="w-5 h-5 rounded bg-[#0A66C2] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">in</span>
                Message on LinkedIn
              </a>
              <a href="https://wa.me/447776842287"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#25D366]/30 bg-[#25D366]/8 text-sm text-platinum hover:bg-[#25D366]/15 transition-all">
                <span className="w-5 h-5 rounded bg-[#25D366] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">W</span>
                WhatsApp +44 7776 842287
              </a>
              <a href="https://www.instagram.com/meridianglobaltalent/"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-[#E1306C]/30 bg-[#E1306C]/8 text-sm text-platinum hover:bg-[#E1306C]/15 transition-all">
                <span className="w-5 h-5 rounded bg-[#E1306C] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">IG</span>
                @meridianglobaltalent
              </a>
            </div>
            <p className="text-sm text-platinum-dim leading-relaxed mb-4">
              Send a short email or message with:
            </p>
            <ul className="space-y-2">
              {[
                "Your name and application reference (MRD-2026-XXXX)",
                "Screenshot or confirmation of the bank transfer",
                "The tier you are paying for",
                "Any preferred dates / times if a call has been discussed",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-platinum-dim">
                  <span className="text-brand text-xs mt-1">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Pricing reminder */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="card-border p-8 mb-8"
          >
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-5">
              Agreed pricing tiers
            </p>
            <p className="text-xs text-platinum-faint mb-4 leading-relaxed">
              Pay the amount Amit confirmed in his response to your application.
              If you haven't applied yet, start there.
            </p>
            <div className="space-y-3">
              {TIERS.map((t) => (
                <div key={t.name}
                  className="flex items-center justify-between py-3 border-b border-void-border last:border-0">
                  <span className="text-sm text-platinum-dim">{t.name}</span>
                  <span className="font-mono text-sm font-medium" style={{ color: t.col }}>{t.range}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/apply"
                className="text-xs text-brand hover:text-brand-light transition-colors">
                Haven&apos;t applied yet? Submit an application →
              </Link>
            </div>
          </motion.div>

          {/* Legal */}
          <div className="pt-6 border-t border-void-border">
            <p className="text-xs text-platinum-faint leading-relaxed">
              <strong className="text-platinum-dim">Advisory only — not immigration legal advice.</strong>{" "}
              Meridian is an independent advisory service. Payment confirms an advisory engagement only.
              No guarantee of visa outcome is implied or offered. For regulated immigration legal advice,
              consult an accredited immigration solicitor.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
