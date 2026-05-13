import { getPost, getAllPosts } from "@/lib/blog"
import { MDXRemote } from "next-mdx-remote/rsc"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SiteFooter } from "@/components/SiteFooter"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map(p => ({ slug: p.slug }))
}

export const dynamicParams = true

const SITE_URL = "https://meridiangtv.co.uk"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: "Amit Tyagi", url: "https://www.linkedin.com/in/amitisb1tyagi/" }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: ["Amit Tyagi"],
      tags: ["UK Global Talent Visa", post.category, "Tech Nation"],
      url: `${SITE_URL}/blog/${slug}`,
      siteName: "Meridian Global Talent Visa",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
  }
}

const CATEGORY_COLORS: Record<string, string> = {
  "Understanding the Visa": "#7C3AED",
  "Evidence Strategy":      "#06B6D4",
  "Founder Positioning":    "#D97706",
  "Product & Engineering":  "#9F6EF5",
  "Tactical Breakdowns":    "#0891B2",
  "UK Ecosystem":           "#059669",
  "Career Positioning":     "#DC2626",
  "Premium Insights":       "#7C3AED",
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const col      = CATEGORY_COLORS[post.category] ?? "#7C3AED"
  const allPosts = await getAllPosts()
  const related  = allPosts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
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
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${slug}` },
    keywords: `UK Global Talent Visa, ${post.category}, Tech Nation, Amit Tyagi`,
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",     item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-canvas)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Nav ─────────────────────────────────────────── */}
      <nav style={{ borderBottom: "1px solid var(--color-line)", background: "rgba(246,241,231,0.9)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 40 }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="18" stroke="var(--color-violet)" strokeWidth="1.5"/>
              <ellipse cx="24" cy="24" rx="7.5" ry="18" stroke="var(--color-violet)" strokeWidth="1.5"/>
              <line x1="6" y1="24" x2="42" y2="24" stroke="var(--color-violet)" strokeWidth="1.5"/>
              <circle cx="24" cy="6" r="2.3" fill="var(--color-violet)"/>
            </svg>
            <div>
              <div className="font-display text-sm leading-none" style={{ color: "var(--color-ink)" }}>Meridian</div>
              <div className="font-mono text-[9px] uppercase tracking-widest leading-none mt-0.5" style={{ color: "var(--color-ink-faint)" }}>Global Talent Advisory</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-xs font-medium transition-colors" style={{ color: "var(--color-ink-soft)" }}>← All insights</Link>
            <Link href="/scorecard" className="btn-primary text-xs text-white px-4 py-2 rounded-full font-medium">
              Check my readiness →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Post hero ───────────────────────────────────── */}
      <section style={{ background: `radial-gradient(800px 500px at 22% 0%, ${col}1A, transparent 60%), var(--color-canvas)`, padding: "64px 0 48px" }}>
        <div className="max-w-3xl mx-auto px-6">
          {/* Meta top */}
          <div className="flex items-center gap-4 flex-wrap mb-7 font-mono text-[11px] tracking-[0.1em]" style={{ color: "var(--color-ink-faint)" }}>
            <span className="px-3 py-1.5 rounded-full uppercase tracking-[0.14em] font-semibold text-[10px]"
              style={{ background: `${col}12`, color: col }}>
              {post.category}
            </span>
            <Link href="/blog" style={{ color: col, fontWeight: 600 }}>← All insights</Link>
            <span>{post.readTime?.toUpperCase()}</span>
            <span>{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase()}</span>
          </div>

          {/* Title */}
          <h1 className="font-display leading-tight mb-6" style={{ fontSize: "clamp(40px, 5.5vw, 68px)", letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
            {post.title}
          </h1>

          {/* Lede */}
          <p className="font-display text-xl leading-relaxed mb-9" style={{ color: "var(--color-ink-soft)", fontSize: 22, lineHeight: 1.45 }}>
            {post.excerpt}
          </p>

          {/* Byline */}
          <div className="flex items-center gap-4 pt-7" style={{ borderTop: "1px solid var(--color-line)" }}>
            <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white"
              style={{ background: "linear-gradient(135deg, #5B21B6, #B8893B)", border: "2px solid var(--color-gold)" }}>
              A
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: "var(--color-ink)" }}>Amit Tyagi</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-ink-soft)" }}>
                UK Global Talent · Exceptional Talent · Advisor to 20+ builders
              </div>
            </div>
            <a href="https://www.linkedin.com/in/amitisb1tyagi/" target="_blank" rel="noopener noreferrer"
              className="ml-auto w-8 h-8 rounded flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ background: "#0A66C2", fontSize: 10 }}>in</a>
          </div>
        </div>
      </section>

      {/* ── Article layout ──────────────────────────────── */}
      <div className="xl:grid xl:grid-cols-[1fr_minmax(640px,760px)_1fr] xl:gap-8 xl:max-w-6xl xl:mx-auto xl:px-6 xl:py-20">
        {/* TOC — desktop only */}
        <div className="hidden xl:block pt-4">
          <div className="sticky top-24 p-6 rounded-2xl" style={{ background: "var(--color-paper)", border: "1px solid var(--color-line)" }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-4" style={{ color: "var(--color-ink-faint)" }}>On this page</p>
            {/* If post has headings extracted, link them; fallback to generic links */}
            {[
              { href: "#one",   label: "1. Generic evidence" },
              { href: "#two",   label: "2. CV-shaped statement" },
              { href: "#three", label: "3. Relationship letters" },
              { href: "#four",  label: "4. Wrong category" },
              { href: "#fix",   label: "What to fix first" },
            ].map(item => (
              <a key={item.href} href={item.href}
                className="block py-1.5 pl-4 -ml-px text-sm border-l-2 transition-all hover:border-violet-600"
                style={{ color: "var(--color-ink-soft)", borderColor: "var(--color-line)" }}>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Body */}
        <article className="max-w-3xl mx-auto px-6 py-16 xl:px-0 xl:py-0 prose-meridian">
          <MDXRemote source={post.content} />

          {/* CTA callout */}
          <div className="mt-14 p-8 rounded-2xl border-2 text-center"
            style={{ borderColor: `${col}30`, background: `${col}06` }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] mb-3" style={{ color: col }}>
              Want a personal read on your case?
            </p>
            <h3 className="font-display text-2xl mb-3" style={{ color: "var(--color-ink)", letterSpacing: "-0.02em" }}>
              A 4-minute readiness check — or a £500 Diagnostic for the written version.
            </h3>
            <p className="text-sm leading-relaxed mb-6 max-w-sm mx-auto" style={{ color: "var(--color-ink-soft)" }}>
              The free check scores your case across the key dimensions in this post. If it surfaces things worth
              digging into, a £500 Diagnostic returns a written, role-specific gap analysis from Amit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/scorecard"
                className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full text-white font-semibold text-sm">
                Take the free check →
              </Link>
              <Link href="/apply"
                className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
                style={{ color: "var(--color-ink)", borderColor: "var(--color-line)" }}>
                Book a Diagnostic
              </Link>
            </div>
          </div>

          {/* Footer note */}
          <p className="font-mono text-xs mt-16 pt-8" style={{ color: "var(--color-ink-faint)", borderTop: "1px solid var(--color-line)", letterSpacing: "0.04em" }}>
            ADVISORY ONLY · NOT IMMIGRATION LEGAL ADVICE · © {new Date().getFullYear()} AMIT TYAGI / MERIDIAN
          </p>
        </article>

        {/* Right spacer (desktop grid) */}
        <div className="hidden xl:block" />
      </div>

      {/* ── Related posts ───────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-20" style={{ background: "var(--color-canvas-soft)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: "var(--color-violet)" }}>Keep reading</p>
            <h2 className="font-display text-4xl mb-10" style={{ color: "var(--color-ink)", letterSpacing: "-0.025em" }}>
              More <span className="text-gradient-brand italic">field notes.</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map(r => {
                const rCol = CATEGORY_COLORS[r.category] ?? "#7C3AED"
                return (
                  <Link key={r.slug} href={`/blog/${r.slug}`}
                    className="card-border p-6 block transition-all hover:-translate-y-1">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold mb-2"
                      style={{ color: rCol }}>
                      {r.category}
                    </div>
                    <h4 className="font-display text-xl leading-tight"
                      style={{ color: "var(--color-ink)", letterSpacing: "-0.02em" }}>
                      {r.title}
                    </h4>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  )
}
