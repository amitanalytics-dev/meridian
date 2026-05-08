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
    body: "We map your career against the Tech Nation Mandatory and Optional Criteria, identify gaps, and assemble dated, third-party-verifiable evidence in the order evaluators are trained to read. Generic role descriptions are replaced with specific, measurable, externally-recognised contributions.",
  },
  {
    n: "02",
    label: "Narrative Engineering",
    body: "Most personal statements describe a career. Strong personal statements argue a case. We re-architect the narrative around the strongest evidence of impact, build a clear throughline, and remove CV-style chronology. The result reads the way evaluators expect.",
  },
  {
    n: "03",
    label: "Recommendation Strategy",
    body: "Three recommendation letters are required. Most letters describe a working relationship. Strong letters demonstrate sector-level impact in the language of the criteria. We help you select the right recommenders, brief them on the framework, and structure each letter to address specific criteria.",
  },
  {
    n: "04",
    label: "External Validation",
    body: "Tech Nation evaluators look for evidence of recognition that is not self-generated. Speaking, writing, awards, citations, peer endorsement. Where validation is thin, we build a 12-week plan to add credible signals before submission.",
  },
]

const PROCESS = [
  {
    name: "Readiness Diagnostic",
    desc: "A scored assessment of your profile against the four dimensions. Delivered as a written document within 5–7 business days. Output: an evidence gap analysis and the top three areas to address before applying.",
    price: "£500",
  },
  {
    name: "Application Advisory",
    desc: "Two focused advisory sessions, written feedback on personal statement drafts, recommendation strategy, and 30 days of async support. Runs 3–6 weeks.",
    price: "£2,500",
  },
  {
    name: "Full Case Build",
    desc: "Everything in Application Advisory plus full personal statement drafting, per-recommender coaching briefs, and a final readiness review call. 90 days of async support. Runs 4–8 weeks.",
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
            Meridian is built on a single observation: most UK Global Talent Visa rejections are not about
            under-qualified profiles. They are about evidence presented in the wrong language. The Meridian method
            re-engineers a case to speak the Tech Nation assessment framework's language — directly, specifically,
            and in the order evaluators are trained to read.
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
            Tech Nation evaluators follow a structured assessment framework. They look for specific signals — scope
            of influence, independence of contribution, recognition by peers — presented in a defined order. The
            framework is not a secret. It is published. But applicants who treat the application as a CV exercise
            instead of an evidence-and-argument exercise consistently fail.
          </p>
          <p className="text-platinum-dim mb-4 leading-relaxed">
            Amit Tyagi went through this process and received UK Global Talent recognition under the{" "}
            <strong className="text-platinum">Exceptional Talent</strong> category. He did not hire an immigration
            consultancy. He read the framework, understood what evaluators were trained to look for, and built a case
            that spoke directly to it. Meridian is the methodology he developed, applied to other people's cases.
          </p>
          <p className="text-platinum-dim leading-relaxed">
            What Meridian provides is structural — narrative architecture, evidence ordering, recommendation
            briefing. What you provide is the underlying work. Meridian does not invent credentials. It surfaces and
            structures the credentials you already have.
          </p>
        </section>

        {/* Engagement model */}
        <section className="mb-14" aria-label="Engagement model and pricing">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">How engagements work</h2>
          <p className="text-platinum-dim mb-6 leading-relaxed">
            Three fixed-price tiers. No retainers. No outcome guarantees. Acceptance is by application — Amit
            reviews each one personally before confirming.
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
            See your scored breakdown across the four dimensions before deciding whether to engage.
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
