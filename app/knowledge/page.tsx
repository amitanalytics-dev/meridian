import Link from "next/link"
import { SiteFooter } from "@/components/SiteFooter"

const SITE_URL = "https://meridiangtv.co.uk"

// ── FAQs (these become both the on-page content and the FAQPage schema) ───────
const FAQS = [
  {
    q: "What is the UK Global Talent Visa?",
    a: "The UK Global Talent Visa is a UK Home Office visa route for leaders and exceptional practitioners in digital technology, arts, research, and academia. In digital technology, applications are endorsed by Tech Nation under two categories — Exceptional Talent (established leaders) and Exceptional Promise (emerging leaders). It grants the right to live and work in the UK without an employer sponsor.",
  },
  {
    q: "Who is eligible for the UK Global Talent Visa in digital technology?",
    a: "Founders, engineers, product managers, designers, data scientists, AI researchers, and senior operators in digital technology can apply. The route is open to anyone — regardless of nationality, age, or current location — who can demonstrate exceptional talent (established leaders) or exceptional promise (rising leaders) in their sector.",
  },
  {
    q: "What is the difference between Exceptional Talent and Exceptional Promise?",
    a: "Exceptional Talent is for established leaders with a proven, externally-recognised track record of innovation in digital technology. Exceptional Promise is for those earlier in their career who demonstrate clear potential. The distinction is not about years of experience — it is about the type of evidence available. Talent requires evidence of established sector-level impact. Promise requires evidence of emerging trajectory.",
  },
  {
    q: "What evidence is required for the UK Global Talent Visa?",
    a: "You must satisfy at least one Mandatory Criterion (proven innovation as founder or senior employee, or recognition as a leading talent) and at least two of four Optional Criteria: significant technical or commercial recognition, contributions outside immediate occupation, exceptional ability evidenced through measurable contributions, or product-led contributions. Each criterion requires specific, dated, third-party-verifiable evidence.",
  },
  {
    q: "How many recommendation letters do I need?",
    a: "You need three recommendation letters. They must come from established, recognised experts in the digital technology sector who know your work directly. The letters should describe your specific impact — not the relationship — and demonstrate why you meet the Tech Nation criteria. Generic letters from senior people fail. Specific letters from recognised peers succeed.",
  },
  {
    q: "Why do strong UK Global Talent Visa applications get rejected?",
    a: "Most rejections happen not because the applicant lacks the profile, but because their evidence is generic, their narrative is unclear, or their recommendation letters describe relationships rather than impact. Tech Nation evaluators follow a structured assessment framework — applicants who do not present their case in that language fail regardless of their actual credentials.",
  },
  {
    q: "How long does the UK Global Talent Visa application take?",
    a: "The Tech Nation endorsement decision typically takes three to eight weeks. After endorsement, the visa application itself takes about three weeks (priority service available). Total time from submission to visa decision is commonly two to three months. Building a strong case before submission usually adds another four to eight weeks of preparation work.",
  },
  {
    q: "Can I apply for the UK Global Talent Visa without a job offer?",
    a: "Yes. The UK Global Talent Visa does not require a job offer or employer sponsorship. You apply based on your personal profile, evidence of exceptional work, and endorsement from a designated body (Tech Nation in digital technology). This is one of its main advantages over the Skilled Worker visa route — you keep full freedom to switch employers, work freelance, or found a company.",
  },
  {
    q: "What is the path to Indefinite Leave to Remain (ILR) on Global Talent?",
    a: "Exceptional Talent holders qualify for ILR after three years of continuous UK residence. Exceptional Promise holders qualify after five years. Both are significantly faster than the Skilled Worker visa, which generally requires five years and is tied to a sponsor.",
  },
  {
    q: "What does Meridian Advisory do?",
    a: "Meridian Advisory helps founders, engineers, product managers, and senior operators build strategically structured UK Global Talent Visa cases. Services include evidence architecture, personal statement structuring, recommendation strategy, and case readiness review — led by Amit Tyagi, a UK Global Talent visa holder under the Exceptional Talent category.",
  },
  {
    q: "Is Meridian an immigration law firm?",
    a: "No. Meridian is an independent advisory service. Amit Tyagi is not an immigration lawyer, is not OISC-registered, and does not provide regulated immigration advice. Meridian provides narrative positioning, evidence structuring, and credibility advisory only. For regulated immigration legal advice, you must consult an accredited immigration solicitor.",
  },
  {
    q: "How much does UK Global Talent Visa advisory cost at Meridian?",
    a: "Meridian Advisory offers three engagement tiers: a Readiness Diagnostic at £500, Application Advisory at £2,500, and a Full Case Build at £5,500. All are fixed-price with no open-ended retainers. The free 4-minute readiness assessment is the recommended starting point to understand which tier fits your situation.",
  },
]

// ── HowTo schema for "How to apply" ────────────────────────────────────────────
const howToSteps = [
  {
    name: "Confirm category fit",
    text: "Decide between Exceptional Talent (established leaders) and Exceptional Promise (emerging leaders) based on the type of evidence available to you, not your years of experience.",
  },
  {
    name: "Build your evidence portfolio",
    text: "Assemble dated, third-party-verifiable evidence against the Tech Nation Mandatory and Optional Criteria. Each piece of evidence must demonstrate specific impact, not generic responsibility.",
  },
  {
    name: "Secure three strong recommendation letters",
    text: "Identify three recognised digital technology leaders who know your work directly. Brief them so each letter describes specific impact and addresses one or more Tech Nation criteria — not just the relationship.",
  },
  {
    name: "Write a structured personal statement",
    text: "Argue your case in the assessment framework's language. Open with the strongest evidence of impact. Show throughline. Avoid CV-style chronology.",
  },
  {
    name: "Submit to Tech Nation for endorsement",
    text: "Lodge your endorsement application. Decision usually takes three to eight weeks.",
  },
  {
    name: "Apply for the visa with the Home Office",
    text: "Once endorsed, apply for the visa itself within three months. Decision usually takes around three weeks (priority option available).",
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
}

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to apply for the UK Global Talent Visa (Digital Technology)",
  description:
    "Six-step process to apply for the UK Global Talent Visa under the Tech Nation digital technology route — from category fit to visa decision.",
  step: howToSteps.map((s, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: s.name,
    text: s.text,
  })),
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Knowledge Hub", item: `${SITE_URL}/knowledge` },
  ],
}

const AUDIENCES = [
  { slug: "founders", label: "Founders" },
  { slug: "engineers", label: "Engineers" },
  { slug: "product-managers", label: "Product Managers" },
  { slug: "ai-researchers", label: "AI Researchers" },
  { slug: "fintech-professionals", label: "Fintech Professionals" },
  { slug: "data-scientists", label: "Data Scientists" },
]

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-void">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Header */}
      <div className="border-b border-void-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
          </Link>
          <Link href="/scorecard" className="btn-primary text-xs text-white px-4 py-2 rounded-lg font-medium">
            Free assessment →
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <header className="mb-14">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">Knowledge Hub</p>
          <h1 className="font-display text-4xl md:text-5xl text-platinum mb-5 leading-tight">
            UK Global Talent Visa — Complete Guide
          </h1>
          <p className="text-platinum-dim text-lg leading-relaxed">
            The UK Global Talent Visa is a sponsor-free UK visa route for leaders and exceptional practitioners in
            digital technology, arts, research, and academia. This page answers the most common questions about
            eligibility, evidence, recommendation letters, timelines, and the Tech Nation assessment framework.
          </p>
        </header>

        {/* Quick definition */}
        <section className="card-border p-7 mb-12" aria-label="Quick definition">
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">In one paragraph</p>
          <p className="text-platinum-dim leading-relaxed">
            The UK Global Talent Visa lets digital technology leaders work in the UK without employer sponsorship,
            switch jobs freely, freelance, or found a company. It is endorsed by{" "}
            <strong className="text-platinum">Tech Nation</strong> under two categories —{" "}
            <strong className="text-platinum">Exceptional Talent</strong> for established leaders and{" "}
            <strong className="text-platinum">Exceptional Promise</strong> for emerging leaders. Holders fast-track
            to Indefinite Leave to Remain in three years (Talent) or five years (Promise).
          </p>
        </section>

        {/* How to apply (HowTo on-page) */}
        <section className="mb-14" aria-label="How to apply for the UK Global Talent Visa">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">How to apply — six steps</h2>
          <p className="text-platinum-dim mb-6 leading-relaxed">
            The Tech Nation assessment framework is structured. The strongest applications follow this order.
          </p>
          <ol className="space-y-4">
            {howToSteps.map((s, i) => (
              <li key={s.name} className="card-border p-5 flex gap-4">
                <span className="font-mono text-xs text-brand flex-shrink-0 mt-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-platinum font-semibold text-base mb-1">{s.name}</h3>
                  <p className="text-platinum-dim text-sm leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mb-14" aria-label="Frequently Asked Questions">
          <h2 className="font-display text-3xl text-platinum mb-6 leading-tight">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="card-border p-6 group">
                <summary className="font-display text-lg text-platinum cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-brand text-2xl flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 pt-4 border-t border-void-border text-platinum-dim text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Audience routing */}
        <section className="mb-14" aria-label="UK Global Talent Visa by profession">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">By profession</h2>
          <p className="text-platinum-dim mb-6 leading-relaxed">
            The Tech Nation criteria apply universally, but the strongest evidence looks different in each profession.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {AUDIENCES.map((a) => (
              <Link key={a.slug} href={`/for/${a.slug}`}
                className="card-border p-5 group hover:shadow-md transition-all flex items-center justify-between gap-4">
                <span className="text-platinum font-medium">UK Global Talent Visa for {a.label}</span>
                <span className="text-brand group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="card-border p-10 text-center">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-3">Ready to find out where you stand?</p>
          <h2 className="font-display text-2xl text-platinum mb-4">Take the free 4-minute readiness assessment.</h2>
          <p className="text-platinum-dim mb-7 max-w-md mx-auto text-sm leading-relaxed">
            12 questions across four dimensions. Know exactly which gaps to fix before you apply.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/scorecard"
              className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-white font-semibold text-sm">
              Check my readiness — free →
            </Link>
            <Link href="/methodology"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-platinum">
              How Meridian works
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </div>
  )
}
