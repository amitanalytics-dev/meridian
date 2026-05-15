import Link from "next/link"
import type { Metadata } from "next"
import { SiteFooter } from "@/components/SiteFooter"

const SITE_URL = "https://meridiangtv.co.uk"

export const metadata: Metadata = {
  title: "Methodology — How Meridian Builds UK Global Talent Visa Cases",
  description:
    "How Meridian Advisory builds UK Global Talent Visa cases. The four-dimension Founder Credibility Index, evidence architecture, narrative engineering, and recommendation strategy — by Amit Tyagi, Exceptional Talent holder.",
  keywords: [
    "Meridian methodology",
    "UK Global Talent Visa case strategy",
    "Founder Credibility Index",
    "Tech Nation evidence framework",
    "Global Talent Visa narrative engineering",
    "Amit Tyagi advisory method",
  ],
  openGraph: {
    title: "Methodology — How Meridian Builds Global Talent Cases",
    description:
      "The four-dimension Founder Credibility Index, evidence architecture, narrative engineering, and recommendation strategy.",
    type: "article",
    url: `${SITE_URL}/methodology`,
    siteName: "Meridian Global Talent Visa",
  },
  alternates: { canonical: `${SITE_URL}/methodology` },
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Methodology", item: `${SITE_URL}/methodology` },
  ],
}

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How Meridian Builds UK Global Talent Visa Cases",
  description:
    "The Meridian methodology for UK Global Talent Visa cases — four-dimension Founder Credibility Index, evidence architecture, narrative engineering, and recommendation strategy.",
  author: {
    "@type": "Person",
    name: "Amit Tyagi",
    url: `${SITE_URL}/about`,
    jobTitle: "UK Global Talent Visa Strategic Advisor",
    sameAs: ["https://www.linkedin.com/in/amitisb1tyagi/"],
  },
  publisher: {
    "@type": "Organization",
    name: "Meridian Global Talent Visa",
    url: SITE_URL,
  },
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/methodology` },
}

const DIMENSIONS = [
  {
    n: "01",
    label: "Evidence Architecture",
    body: "Map your career against Tech Nation's criteria. Find the gaps. Sequence evidence the way evaluators read it. No generic role descriptions — specific, dated, measurable proof only.",
  },
  {
    n: "02",
    label: "Narrative Engineering",
    body: "Most statements describe a career. Strong ones argue a case. Restructure around impact. Remove CV chronology. Write what evaluators expect to read.",
  },
  {
    n: "03",
    label: "Recommendation Strategy",
    body: "Three letters required. Most describe a relationship. Strong letters prove sector impact. Pick the right recommenders. Brief each one. Structure every letter against specific criteria.",
  },
  {
    n: "04",
    label: "External Validation",
    body: "Evaluators want proof you didn't generate yourself. Speaking, awards, citations, peer endorsements. Thin validation gets a 12-week build plan before submission.",
  },
]

const PROCESS = [
  {
    name: "Readiness Diagnostic",
    desc: "Scored against the four dimensions. Written document in 5–7 days. Output: evidence gaps and top three fixes before applying.",
    price: "£500",
  },
  {
    name: "Application Advisory",
    desc: "Two sessions. Written feedback on drafts. Recommendation strategy. 30 days async support. 3–6 weeks total.",
    price: "£2,500",
  },
  {
    name: "Full Case Build",
    desc: "Everything in Advisory plus full statement drafting, per-recommender briefs, and final review call. 90 days async. 4–8 weeks.",
    price: "£5,500",
  },
]

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-void">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

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
        <header className="mb-14">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">Methodology</p>
          <h1 className="font-display text-4xl md:text-5xl text-platinum mb-5 leading-tight">
            How Meridian builds UK Global Talent Visa cases.
          </h1>
          <p className="text-platinum-dim text-lg leading-relaxed">
            Most rejections are not about weak profiles.<br />
            They&apos;re about evidence in the wrong language.<br />
            Meridian re-engineers the case to speak Tech Nation&apos;s language — in the order evaluators read it.
          </p>
        </header>

        {/* Four dimensions */}
        <section className="mb-14" aria-label="Four-dimension Founder Credibility Index">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">The four dimensions</h2>
          <p className="text-platinum-dim mb-8 leading-relaxed">
            Every case is assessed against four credibility dimensions — the same structure the free readiness
            scorecard uses. Each dimension maps to specific Tech Nation criteria.
          </p>
          <div className="space-y-4">
            {DIMENSIONS.map((d) => (
              <div key={d.label} className="card-border p-7 flex gap-5">
                <span className="font-mono text-xs text-brand flex-shrink-0 mt-1">{d.n}</span>
                <div>
                  <h3 className="text-platinum font-semibold text-lg mb-2">{d.label}</h3>
                  <p className="text-platinum-dim text-sm leading-relaxed">{d.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why this works */}
        <section className="mb-14" aria-label="Why this method works">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">Why this works</h2>
          <p className="text-platinum-dim mb-4 leading-relaxed">
            Evaluators follow a structured framework. They look for specific signals:
          </p>
          <ul className="text-platinum-dim mb-4 space-y-1 ml-4">
            <li>— Scope of influence</li>
            <li>— Independence of contribution</li>
            <li>— Peer recognition</li>
          </ul>
          <p className="text-platinum-dim mb-4 leading-relaxed">
            The framework is published. Most people treat it as a CV exercise. They fail consistently.
          </p>
          <p className="text-platinum-dim mb-4 leading-relaxed">
            Amit read the framework. Understood how evaluators think. Built a case that matched exactly. Got approved under{" "}
            <strong className="text-platinum">Exceptional Talent</strong>. Meridian is that method, applied to your case.
          </p>
          <p className="text-platinum-dim leading-relaxed">
            Meridian provides structure: narrative architecture, evidence ordering, recommendation briefing.<br />
            You provide the work. Meridian doesn&apos;t invent credentials. It surfaces the ones you already have.
          </p>
        </section>

        {/* Engagement model */}
        <section className="mb-14" aria-label="Engagement model and pricing">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">How engagements work</h2>
          <p className="text-platinum-dim mb-6 leading-relaxed">
            Three fixed-price tiers. No retainers. No outcome guarantees. Amit reviews every application personally.
          </p>
          <div className="space-y-4">
            {PROCESS.map((p) => (
              <div key={p.name} className="card-border p-7">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-platinum font-semibold text-lg">{p.name}</h3>
                  <span className="font-mono text-base text-brand flex-shrink-0">{p.price}</span>
                </div>
                <p className="text-platinum-dim text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Boundaries */}
        <section className="mb-14" aria-label="What Meridian is not">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">What Meridian is not</h2>
          <ul className="space-y-3">
            {[
              "Not an immigration law firm — Amit is not OISC-registered and does not provide regulated immigration advice.",
              "Not affiliated with the UK Government, Home Office, Tech Nation, UKVI, or any endorsing body.",
              "Not a guarantee — outcome depends on the strength of underlying work, not advisory inputs alone.",
              "Not a template service — every case is structured around the specific applicant's career and evidence.",
            ].map((b) => (
              <li key={b} className="flex gap-3 text-sm text-platinum-dim leading-relaxed">
                <span className="text-brand flex-shrink-0 mt-1">✦</span>
                {b}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="card-border p-10 text-center">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-3">Start with the diagnostic</p>
          <h2 className="font-display text-2xl text-platinum mb-4">Take the free 4-minute readiness assessment.</h2>
          <p className="text-platinum-dim mb-7 max-w-md mx-auto text-sm leading-relaxed">
            Know your score before committing. Free. 4 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/scorecard"
              className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-white font-semibold text-sm">
              Check my readiness — free →
            </Link>
            <Link href="/apply"
              className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-platinum">
              Apply to work with Amit
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </div>
  )
}
