import Link from "next/link"
import { getAllPosts, CATEGORIES } from "@/lib/blog"
import type { Metadata } from "next"
import { SiteFooter } from "@/components/SiteFooter"
import { NewsletterForm } from "@/components/NewsletterForm"
import { SiteNav } from "@/components/SiteNav"

type Props = { searchParams: Promise<{ category?: string }> }

export const metadata: Metadata = {
  title: "UK Global Talent Visa Insights & Strategy — Meridian Blog",
  description:
    "Expert insights on UK Global Talent Visa applications. Evidence strategy, narrative engineering, recommendation letters, and case positioning for founders, engineers, and product managers — by Amit Tyagi, Exceptional Talent holder.",
  keywords: [
    "UK Global Talent Visa guide",
    "Tech Nation application strategy",
    "Exceptional Talent evidence",
    "Global Talent Visa blog",
    "UK visa for founders",
    "UK visa for engineers",
  ],
  openGraph: {
    title: "UK Global Talent Visa Insights — Meridian",
    description:
      "Expert strategy and deep-dive analysis on UK Global Talent Visa applications. Written by Amit Tyagi — Exceptional Talent holder.",
    type: "website",
  },
  alternates: { canonical: "https://meridiangtv.co.uk/blog" },
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

// Deterministic colour cycling for visual card variety
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #2E0F69 0%, #5B21B6 50%, #6D28D9 100%)",
  "linear-gradient(135deg, #1A1530 0%, #5B21B6 70%, #B8893B 100%)",
  "linear-gradient(135deg, #5B21B6 0%, #B8893B 100%)",
  "linear-gradient(135deg, #1A1530 0%, #2E0F69 60%, #B8893B 100%)",
  "linear-gradient(135deg, #2E0F69 0%, #1A1530 100%)",
]

export default async function BlogPage({ searchParams }: Props) {
  const { category: activeCategory } = await searchParams
  const posts   = await getAllPosts()
  const filtered = activeCategory ? posts.filter(p => p.category === activeCategory) : posts
  const featured = activeCategory ? [] : posts.filter(p => p.featured).slice(0, 1)
  const rest     = activeCategory ? filtered : posts.filter(p => !p.featured)

  return (
    <div className="min-h-screen" style={{ background: "var(--color-canvas)" }}>

      <SiteNav />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ background: "radial-gradient(800px 500px at 22% 0%, rgba(91,33,182,.15), transparent 60%), radial-gradient(600px 400px at 85% 30%, rgba(184,137,59,.12), transparent 60%), var(--color-canvas)", padding: "80px 0 56px" }}>
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-5" style={{ color: "var(--color-violet)" }}>
            Insights
          </p>
          <h1 className="font-display leading-tight mb-5 max-w-4xl" style={{ fontSize: "clamp(40px, 5.5vw, 64px)", letterSpacing: "-0.025em", color: "var(--color-ink)" }}>
            Field notes from{" "}
            <span className="text-gradient-brand italic">inside the framework.</span>
          </h1>
          <p className="text-lg max-w-2xl mb-10 leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
            What evaluators actually look for. Why strong applicants get rejected. How to build a case that lands. By Amit Tyagi.
          </p>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2.5">
            <Link href="/blog"
              className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
              style={!activeCategory
                ? { background: "var(--color-ink)", color: "white", border: "1px solid var(--color-ink)" }
                : { background: "var(--color-paper)", color: "var(--color-ink-soft)", border: "1px solid var(--color-line)" }}>
              All
            </Link>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat
              return (
                <Link key={cat}
                  href={isActive ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
                  className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                  style={isActive
                    ? { background: "var(--color-ink)", color: "white", border: "1px solid var(--color-ink)" }
                    : { background: "var(--color-paper)", color: "var(--color-ink-soft)", border: "1px solid var(--color-line)" }}>
                  {cat}
                </Link>
              )
            })}
          </div>

          {/* Featured post */}
          {featured.length > 0 && featured.map(post => {
            const col = CATEGORY_COLORS[post.category] ?? "#7C3AED"
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="mt-14 grid md:grid-cols-[1.3fr_1fr] rounded-3xl overflow-hidden block transition-all hover:-translate-y-1"
                style={{ background: "var(--color-paper)", border: "1px solid var(--color-line)", boxShadow: "var(--shadow-lift)" }}>
                {/* Image pane */}
                <div className="relative overflow-hidden flex items-center justify-center"
                  style={{ aspectRatio: "1.3", background: "linear-gradient(135deg, #2E0F69, #5B21B6 60%, #1A1530)" }}>
                  <div className="absolute inset-0"
                    style={{ background: "radial-gradient(circle at 30% 30%, rgba(184,137,59,.3), transparent 55%), radial-gradient(circle at 70% 70%, rgba(91,33,182,.4), transparent 55%)" }} />
                  <div className="absolute top-6 left-6 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.7)", zIndex: 1 }}>
                    FEATURED · {post.readTime?.toUpperCase()}
                  </div>
                  <span className="font-display italic relative z-10 leading-none" style={{ fontSize: 200, color: "rgba(255,255,255,0.9)" }}>
                    i.
                  </span>
                </div>
                {/* Body pane */}
                <div className="p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono mb-5 w-fit"
                    style={{ background: `${col}12`, color: col, border: `1px solid ${col}30` }}>
                    Most read
                  </div>
                  <h2 className="font-display text-3xl leading-tight mb-4" style={{ color: "var(--color-ink)", letterSpacing: "-0.025em" }}>
                    {post.title}
                  </h2>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--color-ink-soft)" }}>{post.excerpt}</p>
                  <div className="flex gap-4 font-mono text-[11px] tracking-[0.1em]" style={{ color: "var(--color-ink-faint)" }}>
                    <span>By Amit Tyagi</span>
                    <span style={{ color: "var(--color-line)" }}>·</span>
                    <span>{post.readTime}</span>
                    <span style={{ color: "var(--color-line)" }}>·</span>
                    <span>{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Posts grid ─────────────────────────────────── */}
      <section className="pt-12 pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-7">
            {rest.map((post, i) => {
              const col = CATEGORY_COLORS[post.category] ?? "#7C3AED"
              const gradIdx = i % CARD_GRADIENTS.length
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                  className="flex flex-col rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                  style={{ background: "var(--color-paper)", border: "1px solid var(--color-line)" }}>
                  {/* Card image */}
                  <div className="relative flex items-center justify-center"
                    style={{ aspectRatio: "1.5", background: CARD_GRADIENTS[gradIdx], position: "relative" }}>
                    <div className="absolute top-4 right-4 font-mono text-[11px] tracking-[0.16em]"
                      style={{ color: "rgba(255,255,255,0.6)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <span className="font-display italic text-7xl leading-none relative z-10"
                      style={{ color: "rgba(255,255,255,0.85)" }}>
                      {post.title.charAt(0)}
                    </span>
                  </div>
                  {/* Card body */}
                  <div className="p-7 flex flex-col flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold mb-2.5"
                      style={{ color: col }}>
                      {post.category}
                    </div>
                    <h3 className="font-display text-2xl leading-tight mb-2.5 flex-1"
                      style={{ color: "var(--color-ink)", letterSpacing: "-0.02em" }}>
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-ink-soft)" }}>
                      {post.excerpt}
                    </p>
                    <div className="flex justify-between items-center pt-3 font-mono text-[11px] tracking-[0.06em]"
                      style={{ borderTop: "1px solid var(--color-line)", color: "var(--color-ink-faint)" }}>
                      <span>{post.readTime}</span>
                      <span>{new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Newsletter block */}
          <div className="mt-20 rounded-3xl p-14 grid md:grid-cols-[1.4fr_1fr] gap-14 items-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #2E0F69, #5B21B6 60%, #1A1530)" }}>
            <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(184,137,59,.3), transparent 70%)" }} />
            <div className="relative z-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Field notes</p>
              <h3 className="font-display text-4xl leading-tight mb-3" style={{ color: "white", letterSpacing: "-0.025em" }}>
                One specific insight, every other Friday.
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                Short. No-fluff. Sent to ~800 builders considering or already in the process.
                No spam, no upsells, easy unsubscribe.
              </p>
            </div>
            <div className="relative z-10">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
