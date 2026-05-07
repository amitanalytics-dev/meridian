import { getPost, getAllPosts } from "@/lib/blog"
import { MDXRemote } from "next-mdx-remote/rsc"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — Meridian`,
    description: post.excerpt,
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
  const post = getPost(slug)
  if (!post) notFound()

  const col = CATEGORY_COLORS[post.category] ?? "#7C3AED"
  const allPosts = getAllPosts()
  const related = allPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-void-border bg-white/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg text-gradient-brand">Meridian</Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-xs text-platinum-dim hover:text-platinum transition-colors">← All posts</Link>
            <Link href="/scorecard" className="btn-primary text-xs text-white px-4 py-2 rounded-lg font-medium">
              Free assessment →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-14">
        {/* Post header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-mono px-2.5 py-1 rounded-full"
              style={{ background: `${col}12`, color: col }}>{post.category}</span>
            <span className="text-xs text-platinum-faint">{post.readTime}</span>
            <span className="text-xs text-platinum-faint">
              {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-platinum mb-5 leading-tight">{post.title}</h1>
          <p className="text-platinum-dim text-lg leading-relaxed">{post.excerpt}</p>
        </div>

        {/* Amit credential bar */}
        <div className="flex items-center gap-4 p-4 rounded-xl border border-void-border bg-white/50 mb-10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-data flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <p className="text-sm text-platinum font-medium">Amit Tyagi</p>
            <p className="text-xs text-platinum-faint">UK Global Talent — Exceptional Talent · Fintech founder · LBS Sloan Masters</p>
          </div>
          <a href="https://www.linkedin.com/in/amitisb1tyagi/" target="_blank" rel="noopener noreferrer"
            className="ml-auto w-7 h-7 rounded bg-[#0A66C2] flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ fontSize: "10px" }}>in</a>
        </div>

        {/* MDX content */}
        <div className="prose-meridian">
          <MDXRemote source={post.content} />
        </div>

        {/* CTA block */}
        <div className="mt-14 p-8 rounded-2xl border-2 text-center"
          style={{ borderColor: `${col}30`, background: `${col}06` }}>
          <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: col }}>
            Ready to find out where you stand?
          </p>
          <h3 className="font-display text-2xl text-platinum mb-3">Take the free 4-minute assessment.</h3>
          <p className="text-platinum-dim text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            See your Founder Credibility Index score and exactly which dimensions to fix first.
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
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14">
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-5">More from {post.category}</p>
            <div className="grid gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="card-border p-5 flex items-start justify-between gap-4 group hover:shadow-sm transition-all">
                  <div>
                    <h4 className="text-sm text-platinum font-medium group-hover:text-brand transition-colors mb-1">{r.title}</h4>
                    <p className="text-xs text-platinum-faint">{r.readTime} · {new Date(r.date).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p>
                  </div>
                  <span className="text-brand text-sm flex-shrink-0 mt-0.5">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
