import { getPost, getAllPosts } from "@/lib/blog"
import { MDXRemote } from "next-mdx-remote/rsc"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { SiteFooter } from "@/components/SiteFooter"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

// Allow dynamic rendering for slugs that exist in Convex but were added after build —
// the daily cron triggers a redeploy, so this is mostly belt-and-braces.
export const dynamicParams = true

const SITE_URL = "https://meridiangtv.co.uk"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}
  return {
    title: `${post.title}`,
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
    alternates: {
      canonical: `${SITE_URL}/blog/${slug}`,
    },
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

  const col = CATEGORY_COLORS[post.category] ?? "#7C3AED"
  const allPosts = await getAllPosts()
  const related = allPosts.filter((p) => p.slug !== slug && p.category === post.category).slice(0, 3)

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
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/blog/${slug}` },
    ],
  }

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Header */}
      <div className="border-b border-void-border bg-white/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
          </Link>
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
      <SiteFooter />
    </div>
  )
}
