import Link from "next/link"
import { getAllPosts, CATEGORIES } from "@/lib/blog"
import type { Metadata } from "next"

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
  alternates: {
    canonical: "https://meridiangtv.co.uk/blog",
  },
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

export default async function BlogPage({ searchParams }: Props) {
  const { category: activeCategory } = await searchParams
  const posts = getAllPosts()
  const filtered = activeCategory ? posts.filter((p) => p.category === activeCategory) : posts
  const featured = activeCategory ? [] : posts.filter((p) => p.featured).slice(0, 2)
  const rest = activeCategory ? filtered : posts.filter((p) => !p.featured)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-void-border bg-white/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
          </Link>
          <Link href="/scorecard" className="btn-primary text-xs text-white px-4 py-2 rounded-lg font-medium">
            Free assessment →
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="mb-14">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">Meridian Insights</p>
          <h1 className="font-display text-5xl md:text-6xl text-platinum mb-4 leading-tight">
            Built for founders.<br />
            <span className="text-gradient-brand">Not for applicants.</span>
          </h1>
          <p className="text-platinum-dim text-lg max-w-2xl leading-relaxed">
            Strategic thinking on credibility, evidence, and career positioning for ambitious
            technology professionals building toward global recognition.
          </p>
        </div>

        {/* Featured posts */}
        {featured.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-14">
            {featured.map((post) => {
              const col = CATEGORY_COLORS[post.category] ?? "#7C3AED"
              return (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                  className="card-border p-8 group hover:shadow-lg transition-all duration-300 block">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full"
                      style={{ background: `${col}12`, color: col }}>
                      {post.category}
                    </span>
                    <span className="text-xs text-platinum-faint">{post.readTime}</span>
                  </div>
                  <h2 className="font-display text-2xl text-platinum mb-3 leading-tight group-hover:text-brand transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-platinum-dim text-sm leading-relaxed mb-6">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-platinum-faint">
                      {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="text-sm text-brand font-medium group-hover:translate-x-1 transition-transform inline-block">
                      Read →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Category nav */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link href="/blog"
            className="text-xs font-mono px-3 py-1.5 rounded-full border transition-all"
            style={{
              borderColor: activeCategory ? "#ffffff20" : "#7C3AED",
              color: activeCategory ? "#888" : "#7C3AED",
              background: activeCategory ? "transparent" : "#7C3AED18",
            }}>
            All · {posts.length}
          </Link>
          {CATEGORIES.map((cat) => {
            const col = CATEGORY_COLORS[cat] ?? "#7C3AED"
            const count = posts.filter((p) => p.category === cat).length
            const isActive = activeCategory === cat
            return (
              <Link key={cat}
                href={isActive ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
                className="text-xs font-mono px-3 py-1.5 rounded-full border transition-all"
                style={{
                  borderColor: isActive ? col : `${col}30`,
                  color: col,
                  background: isActive ? `${col}22` : `${col}08`,
                  fontWeight: isActive ? 600 : 400,
                }}>
                {cat} · {count}
              </Link>
            )
          })}
        </div>

        {/* All posts grid */}
        <div className="grid md:grid-cols-3 gap-5">
          {rest.map((post) => {
            const col = CATEGORY_COLORS[post.category] ?? "#7C3AED"
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="card-border p-6 group hover:shadow-md transition-all duration-300 block flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full"
                    style={{ background: `${col}10`, color: col }}>
                    {post.category}
                  </span>
                </div>
                <h3 className="font-display text-lg text-platinum mb-2 leading-tight group-hover:text-brand transition-colors flex-1">
                  {post.title}
                </h3>
                <p className="text-platinum-dim text-xs leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-void-border">
                  <span className="text-xs text-platinum-faint">
                    {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                  <span className="text-xs text-platinum-faint">{post.readTime}</span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 card-border p-10 md:p-14 text-center">
          <p className="text-xs font-mono text-platinum-faint tracking-widest uppercase mb-4">Ready to find out where you stand?</p>
          <h2 className="font-display text-3xl text-platinum mb-4">Take the free readiness assessment.</h2>
          <p className="text-platinum-dim mb-8 max-w-md mx-auto text-sm leading-relaxed">
            12 questions. A scored breakdown across 4 dimensions. Know exactly what to fix before you apply.
          </p>
          <Link href="/scorecard"
            className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold">
            Check my readiness — free →
          </Link>
        </div>
      </div>
    </div>
  )
}
