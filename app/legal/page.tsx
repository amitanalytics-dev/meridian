"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteFooter } from "@/components/SiteFooter"
import { SiteNav } from "@/components/SiteNav"

const SECTIONS = [
  {
    id: "disclaimer",
    title: "Disclaimer",
    updated: "Updated · February 2026",
    content: (
      <>
        <div className="mb-5 p-5 rounded-r-xl" style={{ background: "rgba(169,56,56,.06)", borderLeft: "3px solid var(--color-red)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
            <strong style={{ color: "var(--color-red)" }}>Meridian is an advisory service. It is not immigration legal advice.</strong>{" "}
            Amit Tyagi is not an immigration lawyer, is not regulated by the OISC (Office of the Immigration Services
            Commissioner), and does not provide regulated immigration advice. For regulated legal advice, consult an
            accredited immigration solicitor in parallel.
          </p>
        </div>
        <h3 className="font-sans font-bold text-base mb-2 mt-5" style={{ color: "var(--color-ink)" }}>What Meridian does</h3>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--color-ink-soft)" }}>
          Meridian provides strategic advisory services covering evidence architecture, narrative engineering, and
          recommendation strategy for individuals preparing applications for UK Global Talent endorsement and similar
          talent-based visa routes. The engagement is fundamentally an editorial and structural advisory relationship
          — comparable to a writing coach or career strategist — not a legal one.
        </p>
        <h3 className="font-sans font-bold text-base mb-2 mt-5" style={{ color: "var(--color-ink)" }}>What Meridian does not do</h3>
        <ul className="text-sm leading-relaxed mb-3 space-y-1.5" style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          {["Submit, file, or sign applications on your behalf","Provide regulated immigration advice as defined by the Immigration and Asylum Act 1999","Guarantee an endorsement, visa approval, or any other immigration outcome","Act as a sponsor, employer, or intermediary with the Home Office or Tech Nation"].map(item => (
            <li key={item} className="list-disc">{item}</li>
          ))}
        </ul>
        <h3 className="font-sans font-bold text-base mb-2 mt-5" style={{ color: "var(--color-ink)" }}>No affiliation</h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
          Meridian is independent. It is not affiliated with, endorsed by, or representative of the UK Government,
          the Home Office, UK Visas &amp; Immigration, Tech Nation, the Royal Academy of Engineering, or any other
          endorsement body or visa authority.
        </p>
      </>
    ),
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    updated: "Updated · February 2026",
    content: (
      <>
        {[
          { h: "1. Agreement", p: "By engaging Meridian for any paid service, you agree to these terms. Free assessments and tools available on this website are governed by sections 1, 2, 6, 7, 8, and the disclaimer above." },
          { h: "2. Engagement scope", p: "Each paid engagement is defined by the tier you book — Diagnostic, Application Advisory, or Full Case Build — and confirmed in writing before payment is taken. Deliverables and timelines are fixed at the point of confirmation. Scope changes are by mutual written agreement only." },
          { h: "3. Capacity & scheduling", p: "Amit takes a limited number of engagements per month. Confirmation of a booking is at his discretion based on capacity and fit. If you apply and we cannot accept you immediately, you will be offered the next available slot or a refund." },
          { h: "5. Intellectual property", p: "Templates, frameworks, briefs, and methodologies provided by Meridian remain Meridian intellectual property and are licensed to you for use in your own application. They may not be redistributed, resold, or repurposed for advising third parties." },
          { h: "6. Limitation of liability", p: "To the maximum extent permitted by law, Meridian's total liability arising from any engagement is limited to the amount paid for that engagement. Meridian is not liable for indirect, consequential, or incidental losses including but not limited to visa rejection, missed deadlines, or downstream financial impact." },
          { h: "7. Governing law", p: "These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of the courts of England and Wales." },
          { h: "8. Changes", p: "Meridian may update these terms from time to time. The version in effect at the start of your engagement governs your engagement. Material changes will be communicated by email where you have an active engagement." },
        ].map(item => (
          <div key={item.h}>
            <h3 className="font-sans font-bold text-base mb-2 mt-5 first:mt-0" style={{ color: "var(--color-ink)" }}>{item.h}</h3>
            <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--color-ink-soft)" }}>{item.p}</p>
          </div>
        ))}
        <h3 className="font-sans font-bold text-base mb-2 mt-5" style={{ color: "var(--color-ink)" }}>4. Client responsibilities</h3>
        <ul className="text-sm leading-relaxed mb-3 space-y-1.5" style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          {["Provide accurate information about your background, evidence, and intent","Respond to communications within reasonable timeframes (typically 5 working days) to keep timelines on track","Do not represent Meridian as a legal advisor in any correspondence with UK authorities"].map(item => (
            <li key={item} className="list-disc">{item}</li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    updated: "Updated · February 2026",
    content: (
      <>
        <h3 className="font-sans font-bold text-base mb-2" style={{ color: "var(--color-ink)" }}>What we collect</h3>
        <ul className="text-sm leading-relaxed mb-4 space-y-1.5" style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          {["Contact details: name, email, phone, location, role — provided when you apply or subscribe","Application content: the materials you share with us as part of an engagement (CV, drafts, recommendation letters)","Assessment answers: stored in your browser's localStorage only — never sent to us unless you choose to share","Analytics: aggregated page-view data via privacy-preserving analytics. No third-party advertising trackers."].map(item => (
            <li key={item} className="list-disc">{item}</li>
          ))}
        </ul>
        <h3 className="font-sans font-bold text-base mb-2 mt-5" style={{ color: "var(--color-ink)" }}>How we use it</h3>
        <ul className="text-sm leading-relaxed mb-4 space-y-1.5" style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          {["To respond to your application and deliver the engagement","To improve the readiness check and the materials on this site","To send the field-notes newsletter (only with your explicit consent — easy unsubscribe in every email)"].map(item => (
            <li key={item} className="list-disc">{item}</li>
          ))}
        </ul>
        <h3 className="font-sans font-bold text-base mb-2 mt-5" style={{ color: "var(--color-ink)" }}>What we do not do</h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-ink-soft)" }}>
          We do not sell your data, share it with marketing partners, or use it for behavioural advertising.
          We do not use AI training on your application materials.
        </p>
        <h3 className="font-sans font-bold text-base mb-2 mt-5" style={{ color: "var(--color-ink)" }}>Your rights</h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
          Under UK GDPR you can request access to, correction of, or deletion of your personal data at any time.
          Email{" "}
          <a href="mailto:privacy@meridian.advisory" className="font-semibold" style={{ color: "var(--color-violet)" }}>
            privacy@meridian.advisory
          </a>.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refund Policy",
    updated: "Updated · February 2026",
    content: (
      <>
        <div className="mb-5 p-5 rounded-r-xl" style={{ background: "rgba(91,33,182,.05)", borderLeft: "3px solid var(--color-violet)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink)" }}>
            <strong>Plain version:</strong> If a Diagnostic doesn&apos;t help you, full refund within 14 days. For Advisory and Full Build, pro-rata refund based on work completed.
          </p>
        </div>
        {[
          { h: "Readiness Diagnostic — £500", p: "Full refund if requested within 14 days of receiving the written diagnostic, no questions asked. If you decide the diagnostic was not useful, we'd rather give the money back than keep an unhappy client." },
          { h: "Application Advisory — £2,500", p: "50% refund if requested within 7 days of the first session and before the second. After the second session has taken place, refund is pro-rata based on remaining sessions and deliverables (typically 25–40%). No refund once the engagement is more than 70% complete." },
          { h: "Full Case Build — £5,500", p: "Pro-rata refund based on stage of work. Full refund if Amit determines after kick-off that he cannot effectively help your case. Stage milestones and refund percentages are stated in your engagement letter at signing." },
          { h: "Diagnostic credit", p: "If you book a £500 Diagnostic and choose to continue to Application Advisory or Full Case Build within 60 days, the Diagnostic fee is credited toward the new engagement." },
        ].map(item => (
          <div key={item.h}>
            <h3 className="font-sans font-bold text-base mb-2 mt-5 first:mt-0" style={{ color: "var(--color-ink)" }}>{item.h}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>{item.p}</p>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "nda",
    title: "NDA & Confidentiality",
    updated: "Updated · February 2026",
    content: (
      <>
        {[
          { h: "Default confidentiality", p: "Everything you share as part of an engagement is treated as confidential by default. Amit will not discuss the specifics of your case, your employer, or your evidence with any third party — including in anonymised form on this blog or in talks — without your explicit written permission." },
          { h: "Mutual NDA", p: "A formal mutual NDA is available on request before any engagement begins and will be signed before you share sensitive materials. There is no additional fee for this." },
          { h: "Recommender communications", p: "Where the engagement involves direct communication with your recommenders (e.g. coaching their letter), this is always done with your prior knowledge and at your direction. Amit does not contact your network without your explicit instruction." },
          { h: "Testimonials", p: "The testimonials on this site are real but anonymised — first initial only, no surname, no company name, no identifying detail. Clients consent to their testimonial being published in this anonymised form. We do not use full names, photographs, or identifying details without separate explicit consent." },
        ].map(item => (
          <div key={item.h}>
            <h3 className="font-sans font-bold text-base mb-2 mt-5 first:mt-0" style={{ color: "var(--color-ink)" }}>{item.h}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>{item.p}</p>
          </div>
        ))}
      </>
    ),
  },
  {
    id: "delivery",
    title: "Service Delivery",
    updated: "Updated · February 2026",
    content: (
      <>
        <h3 className="font-sans font-bold text-base mb-2" style={{ color: "var(--color-ink)" }}>Format</h3>
        <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-ink-soft)" }}>
          Engagements are delivered remotely — sessions over video call (Google Meet by default; Zoom or Teams on
          request), written deliverables in shared document form, and async communication via email or a private
          Slack channel for Advisory and Full Build tiers.
        </p>
        <h3 className="font-sans font-bold text-base mb-2 mt-5" style={{ color: "var(--color-ink)" }}>Timeline</h3>
        <ul className="text-sm leading-relaxed mb-4 space-y-1.5" style={{ color: "var(--color-ink-soft)", paddingLeft: 20 }}>
          {["Readiness Diagnostic: typically completed within 5–7 working days of payment","Application Advisory: 3–6 weeks depending on responsiveness and material readiness","Full Case Build: 4–8 weeks, including reviewer cycles and recommendation letter coaching"].map(item => (
            <li key={item} className="list-disc">{item}</li>
          ))}
        </ul>
        <h3 className="font-sans font-bold text-base mb-2 mt-5" style={{ color: "var(--color-ink)" }}>Working hours</h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
          Amit works UK time. Async responses are typically within 24 working hours; session bookings respect your
          timezone where reasonable.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    updated: "For everything else",
    content: (
      <ul className="space-y-3 text-sm" style={{ listStyle: "none", padding: 0 }}>
        {[
          { label: "General & engagement enquiries", value: "hello@meridian.advisory", href: "mailto:hello@meridian.advisory" },
          { label: "Privacy & data",   value: "privacy@meridian.advisory", href: "mailto:privacy@meridian.advisory" },
          { label: "Legal",            value: "legal@meridian.advisory",   href: "mailto:legal@meridian.advisory" },
          { label: "WhatsApp",         value: "+44 7776 842287",           href: "https://wa.me/447776842287" },
          { label: "LinkedIn",         value: "amitisb1tyagi",             href: "https://www.linkedin.com/in/amitisb1tyagi/" },
        ].map(item => (
          <li key={item.label} className="py-2.5" style={{ borderBottom: "1px solid var(--color-line-soft)" }}>
            <strong style={{ color: "var(--color-ink)" }}>{item.label}: </strong>
            <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="font-semibold transition-colors hover:opacity-80" style={{ color: "var(--color-violet)" }}>
              {item.value}
            </a>
          </li>
        ))}
      </ul>
    ),
  },
]

const NAV_ITEMS = SECTIONS.map(s => ({ id: s.id, label: s.title }))

export default function LegalPage() {
  const [activeId, setActiveId] = useState("disclaimer")
  const [openId, setOpenId]     = useState<string | null>(null)

  // Sync active TOC link on scroll
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY + 200
      let current = SECTIONS[0].id
      SECTIONS.forEach(s => {
        const el = document.getElementById(s.id)
        if (el && el.offsetTop <= y) current = s.id
      })
      setActiveId(current)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: "var(--color-canvas)" }}>

      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ background: "radial-gradient(700px 400px at 20% 0%, rgba(91,33,182,.1), transparent 60%), var(--color-canvas)", padding: "64px 0 32px" }}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: "var(--color-violet)" }}>Legal</p>
          <h1 className="font-display mb-4 max-w-3xl" style={{ fontSize: 56, lineHeight: 1.05, letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
            The boring (but important){" "}
            <span className="text-gradient-brand italic">small print.</span>
          </h1>
          <p className="max-w-xl leading-relaxed" style={{ color: "var(--color-ink-soft)", fontSize: 16 }}>
            Everything in one place. Last reviewed February 2026. Plain English where possible, defined terms where necessary.
          </p>
        </div>
      </section>

      {/* ── Layout: sidebar + content ─────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid lg:grid-cols-[260px_1fr] gap-14 items-start">

        {/* Sticky sidebar nav */}
        <aside className="hidden lg:block sticky top-24">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-4" style={{ color: "var(--color-ink-faint)" }}>Contents</p>
          {NAV_ITEMS.map(item => (
            <a key={item.id} href={`#${item.id}`}
              onClick={() => setOpenId(item.id)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all"
              style={{
                color:      activeId === item.id ? "var(--color-violet)" : "var(--color-ink-soft)",
                background: activeId === item.id ? "rgba(91,33,182,.06)" : "transparent",
              }}>
              {item.label}
            </a>
          ))}
        </aside>

        {/* Content sections */}
        <div className="space-y-14">
          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-24 pb-14"
              style={{ borderBottom: "1px solid var(--color-line)" }}>
              <h2 className="font-display text-4xl mb-2" style={{ color: "var(--color-ink)", letterSpacing: "-0.025em", lineHeight: 1.05 }}>
                {s.title}
              </h2>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] mb-7" style={{ color: "var(--color-ink-faint)" }}>
                {s.updated}
              </p>
              {s.content}
            </section>
          ))}
        </div>
      </div>

      {/* ── Mobile quick-nav (accordion buttons) ──────── */}
      <div className="lg:hidden max-w-6xl mx-auto px-6 pb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] mb-3" style={{ color: "var(--color-ink-faint)" }}>Jump to section</p>
        <div className="flex flex-wrap gap-2">
          {NAV_ITEMS.map(item => (
            <a key={item.id} href={`#${item.id}`}
              className="px-3 py-1.5 rounded-full text-xs font-mono border transition-all"
              style={{ border: "1px solid var(--color-line)", color: "var(--color-ink-soft)" }}>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
