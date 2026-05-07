"use client"

import { motion } from "framer-motion"
import Link from "next/link"

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4 py-4 border-b border-void-border last:border-0">
      <span className="text-xs font-mono text-platinum-faint uppercase tracking-widest pt-0.5 flex-shrink-0">{label}</span>
      <span className="text-sm text-platinum text-right">{value}</span>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-display text-lg text-gradient-brand">Meridian</Link>
          <span className="text-xs font-mono text-platinum-faint">About</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Title */}
          <div className="mb-12">
            <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">About Meridian</p>
            <h1 className="font-display text-5xl text-platinum mb-6 leading-tight">
              Built by someone<br />
              <span className="text-gradient-brand">who went through it.</span>
            </h1>
          </div>

          {/* Credential badge */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/8 mb-10"
          >
            <div className="w-2 h-2 rounded-full bg-gold" />
            <span className="text-sm text-gold font-medium">
              Amit Tyagi — UK Global Talent, Exceptional Talent
            </span>
          </motion.div>

          {/* Story */}
          <div className="space-y-5 mb-14">
            {[
              "Amit Tyagi received UK Global Talent recognition under the Exceptional Talent category. Not by luck, and not by hiring an expensive immigration consultancy. By understanding precisely how the Tech Nation assessment framework evaluates applicants — and building a case that spoke directly to that framework, in the language evaluators are trained to read.",
              "His background spans fintech, startups, product, and founding. He has built products, led teams, and operated at scale — and he knows what genuinely exceptional work looks like from the inside. More critically, he knows how to translate that work into the evidence portfolio, narrative, and recommendation structure that evaluators expect.",
              "Meridian exists because Amit recognised a gap. Most exceptional builders applying for Global Talent recognition are not rejected because they are unqualified. They are rejected because their case does not present their work the way the assessment panel is trained to look for it. Wrong sequencing. Generic evidence. Recommendation letters that describe the relationship instead of the work. A personal statement that reads like a CV.",
              "Meridian fixes that. Not with a template — with a case built specifically around your evidence, your career, and the specific gaps that are most likely to cost you the application.",
              "This is advisory, not legal. Amit is not an immigration lawyer and does not pretend to be. His value is that he has been through the process, he understands what a strong case looks like, and he works directly with you to build one.",
            ].map((para, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07 }}
                className="text-platinum-dim leading-relaxed"
              >
                {para}
              </motion.p>
            ))}
          </div>

          {/* Facts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-border p-8 mb-10"
          >
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">Credentials & Context</p>
            <Row label="Recognition"      value="UK Global Talent — Exceptional Talent" />
            <Row label="Background"       value="Fintech · Startups · Product · Founding" />
            <Row label="Advisory basis"   value="Direct personal experience of the application process" />
            <Row label="Advisory type"    value="Independent — not regulated immigration advice" />
            <Row label="Capacity"         value="Limited engagements per month, reviewed personally" />
            <Row label="Pricing"          value="£150 – £4,000 hard cap. No open-ended retainers." />
            <Row label="Contact"          value="amit@berriesadvisory.com" />
          </motion.div>

          {/* What Amit is not */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-6 rounded-xl border border-void-border bg-void-surface mb-10"
          >
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">Important</p>
            <p className="text-sm text-platinum-dim leading-relaxed">
              Amit Tyagi is not an immigration lawyer, is not OISC-registered, and does not provide
              regulated immigration legal advice. Meridian is an independent advisory service only.
              For regulated immigration legal advice, consult an accredited immigration solicitor.
            </p>
          </motion.div>

          {/* Reach out */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="card-border p-8 mb-8"
          >
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-5">Reach out directly</p>
            <p className="text-sm text-platinum-dim leading-relaxed mb-5">
              If you have a quick question or want to introduce yourself before applying,
              connect with Amit on LinkedIn or drop him a WhatsApp message.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://www.linkedin.com/in/amitisb1tyagi/"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-[#0A66C2]/30 bg-[#0A66C2]/8 text-sm text-platinum hover:bg-[#0A66C2]/15 transition-all">
                <span className="w-6 h-6 rounded bg-[#0A66C2] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">in</span>
                Connect on LinkedIn
              </a>
              <a href="https://wa.me/447776842287"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/8 text-sm text-platinum hover:bg-[#25D366]/15 transition-all">
                <span className="w-6 h-6 rounded bg-[#25D366] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">W</span>
                WhatsApp +44 7776 842287
              </a>
            </div>
          </motion.div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/scorecard"
              className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-medium text-sm">
              Take the free readiness assessment →
            </Link>
            <Link href="/apply"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-platinum font-medium text-sm">
              Apply to work with Amit
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
