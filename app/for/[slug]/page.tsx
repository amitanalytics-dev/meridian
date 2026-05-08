import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SiteFooter } from "@/components/SiteFooter"

const SITE_URL = "https://meridiangtv.co.uk"

// ── Audience profiles ─────────────────────────────────────────────────────────
interface Audience {
  slug: string
  label: string                  // singular display ("Founder")
  plural: string                 // plural display ("Founders")
  h1: string
  intro: string                  // 2–3 sentence intro paragraph
  primaryKeyword: string         // appears in title + H1
  evidenceFocus: string[]        // 4–6 evidence types that matter most
  commonGaps: string[]           // 3–4 typical gaps for this audience
  category: string               // Talent vs Promise default
  extraKeywords: string[]
}

const AUDIENCES: Audience[] = [
  {
    slug: "founders",
    label: "Founder",
    plural: "Founders",
    primaryKeyword: "UK Global Talent Visa for Founders",
    h1: "UK Global Talent Visa for Founders",
    intro:
      "Founders make some of the strongest UK Global Talent Visa candidates — and some of the weakest applicants. The asymmetry comes from how founder evidence is presented, not what was built. Tech Nation's framework rewards independence of contribution and product-led impact, both of which founders have in abundance. Most founder rejections happen because the case reads like a startup pitch rather than an evidence portfolio.",
    evidenceFocus: [
      "Quantified product or company outcomes (revenue, ARR, MAU, fundraising rounds, exits)",
      "Independence of contribution — founding role, equity, decision authority",
      "External validation: investor letters, accelerator selections, press, awards",
      "Product-led innovation evidence — what the product solves and why it is non-obvious",
      "Sector influence beyond own company — speaking, advisory, ecosystem contribution",
      "Recognition from peer founders and operators in the digital technology sector",
    ],
    commonGaps: [
      "Pitch-deck language used in personal statement (vision-heavy, evidence-light)",
      "Recommendation letters from investors who describe the relationship instead of the founder's specific innovation",
      "Missing third-party validation when the company is early or in stealth",
      "Conflating company achievements with personal contributions evaluators can verify",
    ],
    category: "Most founders qualify under Exceptional Talent. Earlier-stage founders with strong trajectory may apply under Exceptional Promise.",
    extraKeywords: ["UK Global Talent Visa startup founders", "Tech Nation founder visa", "founder visa UK"],
  },
  {
    slug: "engineers",
    label: "Engineer",
    plural: "Engineers",
    primaryKeyword: "UK Global Talent Visa for Engineers",
    h1: "UK Global Talent Visa for Engineers",
    intro:
      "Engineers often have the strongest underlying credentials and the weakest applications. The work is technical, the impact is internal, and the evidence is locked inside private codebases. Tech Nation's framework rewards exceptional technical contribution — but only when it is presented as visible, externally-recognised, and independent. The strongest engineer applications translate technical work into sector-level impact.",
    evidenceFocus: [
      "Technical depth shown via open-source contribution, conference talks, or published work",
      "Architectural ownership — systems designed, not just built",
      "Quantified production impact (latency, throughput, cost, reliability)",
      "Recognition from senior engineers outside your direct reporting chain",
      "Patents, technical papers, or community-recognised technical contributions",
      "Independent contribution — side projects, open source maintainership, technical writing",
    ],
    commonGaps: [
      "Internal-only impact with no visible external footprint",
      "Recommendation letters from managers who describe collaboration rather than technical brilliance",
      "Personal statement that lists technologies instead of arguing innovation",
      "Confidentiality concerns blocking specific evidence — which can be navigated with structured anonymisation",
    ],
    category: "Senior engineers usually apply under Exceptional Talent. Earlier-career engineers with strong open-source or research signals may apply under Exceptional Promise.",
    extraKeywords: ["UK visa for software engineers", "Tech Nation engineer visa", "Global Talent Visa AI engineer"],
  },
  {
    slug: "product-managers",
    label: "Product Manager",
    plural: "Product Managers",
    primaryKeyword: "UK Global Talent Visa for Product Managers",
    h1: "UK Global Talent Visa for Product Managers",
    intro:
      "Product managers face a structural challenge with the Tech Nation framework. The role's value is cross-functional, integrative, and often invisible to people outside the team. The strongest PM applications reframe product leadership as innovation ownership — translating product decisions into measurable user, revenue, or market outcomes that meet the assessment criteria.",
    evidenceFocus: [
      "Quantified product outcomes — adoption, retention, revenue, engagement metrics tied to specific decisions",
      "Strategic ownership of product direction, not just feature delivery",
      "Cross-functional leadership of engineering, design, and go-to-market teams",
      "Recognition from senior product leaders outside the immediate company",
      "Public artefacts — talks, writing, podcasts, product launches with press coverage",
      "0-to-1 product launches or major strategic pivots driven by the applicant",
    ],
    commonGaps: [
      "Generic 'led product' language without specific decisions or outcomes attributed",
      "Recommendation letters from engineering managers who describe collaboration instead of product vision",
      "No external proof of product thinking — no writing, no talks, no public reflections",
      "Strong company brand carrying the application instead of the applicant's individual contribution",
    ],
    category: "Senior product leaders apply under Exceptional Talent. PMs with 5–8 years of strong trajectory may apply under Exceptional Promise.",
    extraKeywords: ["UK visa for product managers", "Tech Nation product visa", "Global Talent Visa product leader"],
  },
  {
    slug: "ai-researchers",
    label: "AI Researcher",
    plural: "AI Researchers",
    primaryKeyword: "UK Global Talent Visa for AI Researchers",
    h1: "UK Global Talent Visa for AI Researchers",
    intro:
      "AI researchers have one of the clearest paths through the UK Global Talent Visa — the framework is built to recognise exactly the kind of measurable, externally-validated contribution that AI research naturally produces. The challenge is selection and framing: which papers, citations, models, or applied contributions to foreground, and how to position research with industry impact alongside academic recognition.",
    evidenceFocus: [
      "Peer-reviewed publications with citation counts at top venues (NeurIPS, ICML, ICLR, ACL, CVPR)",
      "Open-source models, datasets, or tooling with significant adoption",
      "Industry impact — production AI systems shipped to scale, influence on a frontier lab or AI company",
      "Invited talks, panels, and workshop organisation at major AI conferences",
      "Recognition from senior researchers and lab leaders, not just co-authors",
      "Patents or applied research with commercial deployment",
    ],
    commonGaps: [
      "Citation counts undersold or poorly contextualised against field norms",
      "Pure-research applicants missing applied impact narrative — and vice versa",
      "Recommendation letters from PhD advisors that read as academic reference checks rather than peer endorsement of independent contribution",
      "No evidence of independence — work attributed to the lab or principal investigator",
    ],
    category: "Senior researchers apply under Exceptional Talent. PhD students and early postdocs with strong publications and trajectory apply under Exceptional Promise.",
    extraKeywords: ["UK Global Talent Visa AI", "Tech Nation AI researcher", "machine learning visa UK"],
  },
  {
    slug: "fintech-professionals",
    label: "Fintech Professional",
    plural: "Fintech Professionals",
    primaryKeyword: "UK Global Talent Visa for Fintech Professionals",
    h1: "UK Global Talent Visa for Fintech Professionals",
    intro:
      "Fintech is a Tech Nation focus sector, and the UK is the largest fintech ecosystem outside the US. The route is well-suited to fintech founders, senior operators, and specialist engineers — but the evidence requirements skew toward measurable scale, regulatory navigation, and cross-border impact. The strongest fintech cases translate sector experience into specific, externally-verifiable signals.",
    evidenceFocus: [
      "Customer or transaction scale (users, volume, ARR) with verifiable third-party sources",
      "Regulatory innovation or first-mover navigation in a complex jurisdiction",
      "Cross-border or emerging-market expansion led by the applicant",
      "Recognition from established fintech leaders, regulators, or institutional investors",
      "Public presence — writing, podcasts, conference speaking on fintech infrastructure",
      "Commercial outcomes — fundraising, revenue, partnerships with established financial institutions",
    ],
    commonGaps: [
      "Banking or finance background presented in financial-services language instead of fintech innovation language",
      "Strong company brand without clear individual contribution attribution",
      "Recommendation letters from corporate executives that describe seniority instead of innovation",
      "Missing UK or international ecosystem signals when the operator is based in an emerging market",
    ],
    category: "Senior fintech operators apply under Exceptional Talent. Earlier-stage operators with high-trajectory work may apply under Exceptional Promise.",
    extraKeywords: ["UK visa fintech founder", "Tech Nation fintech visa", "Global Talent Visa fintech operator"],
  },
  {
    slug: "data-scientists",
    label: "Data Scientist",
    plural: "Data Scientists",
    primaryKeyword: "UK Global Talent Visa for Data Scientists",
    h1: "UK Global Talent Visa for Data Scientists",
    intro:
      "Data scientists sit between research and engineering, which can confuse the Tech Nation evidence framework. The strongest data science applications choose a clear positioning — applied research, ML platform engineering, or business impact — and assemble evidence that matches. Tech Nation rewards demonstrable, externally-recognised contribution; it does not reward generic 'data science' role descriptions.",
    evidenceFocus: [
      "Production ML systems with quantified business impact (revenue lift, cost reduction, risk reduction)",
      "Published research, Kaggle achievements, or open-source ML contributions",
      "ML platform or infrastructure ownership at scale",
      "Recognition from senior data leaders and applied research leaders outside the immediate team",
      "Public artefacts — talks, blog posts, technical writing read by the data community",
      "Patents, publications, or applied research credited individually",
    ],
    commonGaps: [
      "Modelling work described in technical detail without business outcome attribution",
      "Recommendation letters from engineering or product managers instead of senior data leaders",
      "No external footprint — no Kaggle, no GitHub, no writing, no talks",
      "Confused positioning between research, applied ML, and analytics, weakening the criteria match",
    ],
    category: "Senior data leaders apply under Exceptional Talent. Mid-career data scientists with strong applied or research signals may apply under Exceptional Promise.",
    extraKeywords: ["UK visa data scientist", "Tech Nation data science visa", "Global Talent Visa machine learning"],
  },
]

// ── Static params + metadata ──────────────────────────────────────────────────
export function generateStaticParams() {
  return AUDIENCES.map((a) => ({ slug: a.slug }))
}

function getAudience(slug: string): Audience | null {
  return AUDIENCES.find((a) => a.slug === slug) ?? null
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const audience = getAudience(slug)
  if (!audience) return {}

  return {
    title: `${audience.primaryKeyword} — Meridian Advisory`,
    description: `Strategic UK Global Talent Visa advisory for ${audience.plural.toLowerCase()}. Evidence architecture, narrative engineering, and recommendation strategy specific to ${audience.plural.toLowerCase()} — by Amit Tyagi, Exceptional Talent visa holder.`,
    keywords: [
      audience.primaryKeyword,
      ...audience.extraKeywords,
      "UK Global Talent Visa",
      "Tech Nation visa",
      "Exceptional Talent visa",
      "Meridian Advisory",
    ],
    openGraph: {
      title: `${audience.primaryKeyword} — Meridian`,
      description: `UK Global Talent Visa advisory for ${audience.plural.toLowerCase()} — evidence architecture, narrative engineering, and recommendation strategy from Amit Tyagi.`,
      type: "article",
      url: `${SITE_URL}/for/${audience.slug}`,
      siteName: "Meridian Global Talent Visa",
    },
    alternates: { canonical: `${SITE_URL}/for/${audience.slug}` },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AudiencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const audience = getAudience(slug)
  if (!audience) notFound()

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Knowledge Hub", item: `${SITE_URL}/knowledge` },
      { "@type": "ListItem", position: 3, name: audience.primaryKeyword, item: `${SITE_URL}/for/${audience.slug}` },
    ],
  }

  const faqs = [
    {
      q: `Can ${audience.plural.toLowerCase()} apply for the UK Global Talent Visa?`,
      a: `Yes. ${audience.plural} are explicitly recognised by Tech Nation as eligible under the digital technology route. ${audience.category}`,
    },
    {
      q: `What is the strongest evidence for ${audience.plural.toLowerCase()}?`,
      a: `For ${audience.plural.toLowerCase()}, the strongest evidence usually includes: ${audience.evidenceFocus.slice(0, 3).join("; ").toLowerCase()}.`,
    },
    {
      q: `What is the most common reason ${audience.plural.toLowerCase()} get rejected?`,
      a: `${audience.commonGaps[0]}. Most rejections come from how the case is framed — not from the underlying credentials.`,
    },
  ]

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-void">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">For {audience.plural}</p>
          <h1 className="font-display text-4xl md:text-5xl text-platinum mb-5 leading-tight">{audience.h1}</h1>
          <p className="text-platinum-dim text-lg leading-relaxed">{audience.intro}</p>
        </header>

        {/* Category guidance */}
        <section className="card-border p-7 mb-12" aria-label="Category guidance">
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">Talent vs Promise</p>
          <p className="text-platinum-dim leading-relaxed">{audience.category}</p>
        </section>

        {/* Evidence focus */}
        <section className="mb-14" aria-label="Strongest evidence">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">
            What evidence matters most for {audience.plural.toLowerCase()}
          </h2>
          <p className="text-platinum-dim mb-6 leading-relaxed">
            The Tech Nation framework applies universally — but the evidence that lands strongest looks different
            for each profession. For {audience.plural.toLowerCase()}, the strongest signals are:
          </p>
          <ul className="space-y-3">
            {audience.evidenceFocus.map((e) => (
              <li key={e} className="card-border p-5 flex gap-4 text-sm text-platinum-dim leading-relaxed">
                <span className="text-brand flex-shrink-0 mt-0.5">✦</span>
                {e}
              </li>
            ))}
          </ul>
        </section>

        {/* Common gaps */}
        <section className="mb-14" aria-label="Common gaps">
          <h2 className="font-display text-3xl text-platinum mb-3 leading-tight">
            Where {audience.plural.toLowerCase()} typically lose the case
          </h2>
          <p className="text-platinum-dim mb-6 leading-relaxed">
            These are the patterns that cause strong {audience.plural.toLowerCase()} to receive rejections — usually
            structural, not credentials-based.
          </p>
          <ul className="space-y-3">
            {audience.commonGaps.map((g) => (
              <li key={g} className="card-border p-5 flex gap-4 text-sm text-platinum-dim leading-relaxed">
                <span className="text-[#EF4444] flex-shrink-0 mt-0.5">✕</span>
                {g}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-14" aria-label="FAQ">
          <h2 className="font-display text-3xl text-platinum mb-6 leading-tight">Common questions</h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="card-border p-6 group">
                <summary className="font-display text-base text-platinum cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <span className="text-brand text-2xl flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 pt-4 border-t border-void-border text-platinum-dim text-sm leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section className="mb-14" aria-label="Related">
          <h2 className="font-display text-2xl text-platinum mb-6 leading-tight">Related</h2>
          <div className="space-y-2">
            <Link href="/knowledge"
              className="card-border p-5 group hover:shadow-md transition-all flex items-center justify-between gap-4 block">
              <span className="text-platinum">UK Global Talent Visa knowledge hub — full guide</span>
              <span className="text-brand group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/methodology"
              className="card-border p-5 group hover:shadow-md transition-all flex items-center justify-between gap-4 block">
              <span className="text-platinum">How Meridian builds cases — methodology</span>
              <span className="text-brand group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link href="/blog"
              className="card-border p-5 group hover:shadow-md transition-all flex items-center justify-between gap-4 block">
              <span className="text-platinum">Strategy blog — evidence, narrative, and recommendation deep dives</span>
              <span className="text-brand group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="card-border p-10 text-center">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-3">Where do you stand?</p>
          <h2 className="font-display text-2xl text-platinum mb-4">Take the free 4-minute readiness assessment.</h2>
          <p className="text-platinum-dim mb-7 max-w-md mx-auto text-sm leading-relaxed">
            12 questions. Scored breakdown across the four credibility dimensions. Built for {audience.plural.toLowerCase()}.
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
