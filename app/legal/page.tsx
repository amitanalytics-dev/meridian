"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { SiteFooter } from "@/components/SiteFooter"

const SECTIONS = [
  {
    id: "terms",
    title: "Terms & Conditions",
    content: `
**Last updated: May 2026**

These Terms & Conditions govern your engagement with Meridian, a trading name of Amit Tyagi ("Meridian", "we", "us"). By engaging our advisory services you agree to these terms.

**1. Nature of Services**
Meridian provides independent credibility advisory services to individuals applying for recognition programmes including but not limited to the UK Global Talent visa route. Our services are advisory in nature only. We do not provide immigration legal advice, regulated legal services, or OISC-regulated advice.

**2. No Guarantee of Outcome**
We make no representation, warranty, or guarantee that use of our services will result in approval of any visa application, recognition programme, or any other outcome. Advisory services improve the quality and presentation of an application — they do not determine or influence decisions made by any government body, assessor, or endorsing body.

**3. Engagement and Payment**
An engagement begins upon receipt of cleared payment. No advisory work, including calls, written feedback, or sessions, will commence until payment has been received and confirmed. Engagements are scoped individually — the scope, deliverables, and price are confirmed in writing by Amit before payment is requested.

**4. Client Responsibilities**
You are responsible for providing accurate information about your background, credentials, and career history. Meridian relies on information you provide. We accept no liability for outcomes resulting from inaccurate or incomplete information.

**5. Intellectual Property**
All written materials, templates, frameworks, and documents produced by Meridian remain our intellectual property until full payment is received, at which point a limited licence to use them for the purpose of your visa application is granted.

**6. Confidentiality**
We treat all client information as confidential. See our NDA & Confidentiality policy for full details.

**7. Limitation of Liability**
To the maximum extent permitted by law, Meridian's total liability in connection with any engagement shall not exceed the amount paid for that engagement. We are not liable for indirect, consequential, or special damages.

**8. Governing Law**
These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.

**9. Changes to These Terms**
We may update these terms from time to time. The version in force at the time of your engagement applies.

For questions: amit@berriesadvisory.com
    `,
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    content: `
**Last updated: May 2026**

Meridian (Amit Tyagi) is committed to protecting your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

**1. What Data We Collect**
We collect information you provide when using our assessment tool, submitting an application, or contacting us directly. This includes: name, email address, professional background, career history, and information about your visa goals. We also collect standard website usage data (page views, device type) via analytics.

**2. How We Use Your Data**
Your data is used to: provide and personalise our advisory services; respond to your application; communicate about your engagement; and improve our services. We do not use your data for unsolicited marketing.

**3. Legal Basis for Processing**
We process your data on the basis of contractual necessity (to deliver services you have requested) and legitimate interests (to improve our advisory offering).

**4. Data Sharing**
We do not sell or share your personal data with third parties for marketing purposes. We may share data with: service providers who support our operations (e.g. email, document storage) on a strictly necessary basis; and where required by law.

**5. Data Retention**
We retain your data for the duration of your engagement and for up to 3 years afterwards, or as required by applicable law.

**6. Your Rights**
Under UK GDPR you have the right to: access your data; correct inaccurate data; request deletion; restrict or object to processing; and data portability. To exercise these rights, contact amit@berriesadvisory.com.

**7. Cookies**
Our website uses functional cookies necessary for operation. No third-party tracking cookies are set without consent.

**8. Contact**
Data controller: Amit Tyagi. Email: amit@berriesadvisory.com

You have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.
    `,
  },
  {
    id: "nda",
    title: "NDA & Confidentiality",
    content: `
**Last updated: May 2026**

**Our Commitment to You**
Meridian treats all information shared during an advisory engagement as strictly confidential. This includes your career history, visa strategy, application materials, personal statement drafts, and any other information you share with us.

We will not disclose your information to any third party without your explicit written consent, except where required by law.

**Mutual Confidentiality**
Any proprietary frameworks, methodologies, templates, or materials shared with you by Meridian in the course of an engagement are also confidential. You agree not to reproduce, distribute, or share these with third parties, including other visa applicants or advisors.

**Formal NDA**
If you require a formal mutual non-disclosure agreement before sharing sensitive information, we are happy to provide one. Contact amit@berriesadvisory.com to request a signed NDA before your engagement begins.

**Testimonials and Case Studies**
We will never share details of your engagement, application, or outcome publicly without your explicit written permission. Any case studies used on our platform are anonymised unless express permission has been given.

**Data Handling**
All documents and materials are handled in accordance with our Privacy Policy. Files are not stored on third-party public platforms without your consent.
    `,
  },
  {
    id: "refunds",
    title: "Refund Policy",
    content: `
**Last updated: May 2026**

**General Principle**
Meridian's engagements involve significant preparation time before sessions take place. Our refund policy reflects the value of that preparation work.

**Readiness Diagnostic (£150 – £500)**
No refund once the written diagnostic has been delivered. If you cancel before delivery begins, a full refund is provided within 5 business days.

**Application Advisory (£800 – £2,000)**
If you cancel before the first session has taken place: 50% refund within 5 business days.
If you cancel after the first session: no refund, as significant advisory time will have been invested.

**Full Case Build (£2,000 – £4,000)**
If you cancel within 48 hours of payment and before any work has commenced: full refund.
If you cancel after work has commenced: a partial refund may be offered at Amit's discretion, reflecting the proportion of work not yet completed.

**Change of Circumstances**
If your personal circumstances change materially (e.g. visa route no longer relevant), contact us and we will discuss options individually. We aim to be fair.

**How to Request a Refund**
Email amit@berriesadvisory.com with your name, reference number, reason for cancellation, and the tier you paid for. We will respond within 5 business days.

**Disputes**
If you are not satisfied with our response, you may refer the matter to an independent dispute resolution service. We are bound by the laws of England and Wales.
    `,
  },
  {
    id: "delivery",
    title: "Service Delivery",
    content: `
**Last updated: May 2026**

**How Meridian Delivers Services**

**Readiness Diagnostic**
Delivered as a written document via email within 5–7 business days of payment confirmation. The diagnostic covers a scored assessment of your profile across the four key dimensions, an evidence gap analysis specific to your background, and the top three areas to address before applying.

**Application Advisory**
Delivered over 3–6 weeks from the date of payment confirmation, depending on your responsiveness and the volume of materials to review. Includes: two focused advisory sessions via video call (Google Meet, Zoom, or equivalent); written feedback on personal statement drafts; recommendation strategy document delivered via email; and 30 days of async support via email.

**Full Case Build**
Delivered over 4–8 weeks from the date of payment confirmation. Includes everything in Application Advisory plus: full personal statement drafting and iteration; per-recommender coaching briefs; a final readiness review call; and 90 days of async email support.

**Session Format**
All sessions are conducted via video call. A session recording may be provided upon request. Sessions are scheduled by mutual agreement after payment is confirmed.

**Scheduling**
Amit will contact you within 48 hours of payment confirmation to agree a schedule. All timelines are estimates — complex cases may take longer, and Amit will communicate any delays proactively.

**Rescheduling**
Sessions can be rescheduled with at least 48 hours notice. Rescheduling within 48 hours of a session may result in the session being forfeited if Amit is unable to reallocate the time.
    `,
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    content: `
**Last updated: May 2026**

**Independent Advisory Service**
Meridian is an independent advisory service operated by Amit Tyagi. We are not affiliated with the UK Government, the Home Office, Tech Nation, the UKVI (UK Visas and Immigration), or any official visa body, endorsing body, or recognition programme.

**Not Immigration Legal Advice**
Nothing on this website or in any communication from Meridian constitutes immigration legal advice. Amit Tyagi is not an immigration lawyer, is not registered with the Office of the Immigration Services Commissioner (OISC), and is not authorised to provide regulated immigration advice. For regulated immigration legal advice, you must consult an accredited immigration solicitor or OISC-registered advisor.

**No Guarantee of Outcome**
The Founder Credibility Index™ (FCI) score produced by our assessment tool is an advisory intelligence instrument. It is not a prediction of visa outcome, nor does it constitute an assessment by any official body. Scores are based on self-reported information and a proprietary algorithm. They are indicative only.

**Accuracy of Information**
While we take care to ensure the information on this site is accurate and up to date, visa requirements, assessment criteria, and recognition programmes change regularly. You should always verify current requirements directly with the relevant authority or a qualified immigration professional.

**External Links**
This website may contain links to external sites. We are not responsible for the content or practices of those sites.

**Liability**
To the maximum extent permitted by law, Meridian accepts no liability for decisions made in reliance on information provided on this website or in advisory communications.
    `,
  },
]

function Section({ s, isOpen, toggle }: {
  s: typeof SECTIONS[0]
  isOpen: boolean
  toggle: () => void
}) {
  return (
    <div id={s.id} className="card-border overflow-hidden scroll-mt-24">
      <button
        onClick={toggle}
        className="w-full px-8 py-6 flex items-center justify-between gap-4 text-left"
      >
        <span className="font-display text-lg text-platinum">{s.title}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-brand text-2xl flex-shrink-0"
        >+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-8 pb-8 border-t border-void-border pt-6">
              <div className="prose prose-sm max-w-none">
                {s.content.trim().split("\n\n").map((block, i) => {
                  if (block.startsWith("**") && block.endsWith("**") && !block.slice(2).includes("**")) {
                    return <h3 key={i} className="text-platinum font-semibold text-sm mb-2 mt-4 first:mt-0">{block.replace(/\*\*/g, "")}</h3>
                  }
                  return (
                    <p key={i} className="text-platinum-dim text-sm leading-relaxed mb-3"
                      dangerouslySetInnerHTML={{
                        __html: block
                          .replace(/\*\*(.+?)\*\*/g, '<strong class="text-platinum">$1</strong>')
                      }}
                    />
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LegalPage() {
  const [openId, setOpenId] = useState<string | null>("terms")

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
          </Link>
          <span className="text-xs font-mono text-platinum-faint">Legal</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-12">
            <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">Legal</p>
            <h1 className="font-display text-4xl text-platinum mb-4">Legal & Policies</h1>
            <p className="text-platinum-dim leading-relaxed">
              Meridian is an independent advisory service. These policies govern our engagement
              with clients. If you have questions about any of these, contact{" "}
              <a href="mailto:amit@berriesadvisory.com" className="text-brand hover:text-brand-light transition-colors">
                amit@berriesadvisory.com
              </a>
            </p>
          </div>

          {/* Quick nav */}
          <div className="flex flex-wrap gap-2 mb-10">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`}
                onClick={() => setOpenId(s.id)}
                className="text-xs font-mono px-3 py-1.5 rounded-full border border-void-border text-platinum-dim hover:text-platinum hover:border-brand/40 transition-all">
                {s.title}
              </a>
            ))}
          </div>

          <div className="space-y-3">
            {SECTIONS.map((s) => (
              <Section
                key={s.id}
                s={s}
                isOpen={openId === s.id}
                toggle={() => setOpenId(openId === s.id ? null : s.id)}
              />
            ))}
          </div>
        </motion.div>
      </div>
      <SiteFooter />
    </div>
  )
}
