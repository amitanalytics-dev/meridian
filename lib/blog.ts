import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const BLOG_DIR = path.join(process.cwd(), "content/blog")

export interface BlogPost {
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  readTime: string
  featured?: boolean
  content: string
  source: "filesystem" | "convex"
}

// ── Filesystem-backed posts (the original 57) ─────────────────────────────────

function readFsPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR)
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(".mdx", "")
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf8")
      const { data, content } = matter(raw)
      return { slug, content, ...data, source: "filesystem" } as BlogPost
    })
}

// ── Convex-backed posts (the daily-published batch generator output) ──────────

function getConvexClient(): ConvexHttpClient | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!url) return null
  return new ConvexHttpClient(url)
}

async function readConvexPosts(): Promise<BlogPost[]> {
  const convex = getConvexClient()
  if (!convex) return []
  try {
    const rows = await convex.query(api.scheduledBlogs.allPublished, {})
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      date: r.date,
      category: r.category,
      excerpt: r.excerpt,
      readTime: r.readTime,
      content: r.mdxBody,
      featured: false,
      source: "convex" as const,
    }))
  } catch {
    return []
  }
}

async function readConvexPost(slug: string): Promise<BlogPost | null> {
  const convex = getConvexClient()
  if (!convex) return null
  try {
    const row = await convex.query(api.scheduledBlogs.bySlug, { slug })
    if (!row) return null
    return {
      slug: row.slug,
      title: row.title,
      date: row.date,
      category: row.category,
      excerpt: row.excerpt,
      readTime: row.readTime,
      content: row.mdxBody,
      featured: false,
      source: "convex",
    }
  } catch {
    return null
  }
}

// ── Public API (async — callers must await) ───────────────────────────────────

export async function getAllPosts(): Promise<BlogPost[]> {
  const [fs, cv] = await Promise.all([Promise.resolve(readFsPosts()), readConvexPosts()])
  // Filesystem wins on slug collision
  const seen = new Set(fs.map((p) => p.slug))
  const merged = [...fs, ...cv.filter((p) => !seen.has(p.slug))]
  return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  // Filesystem first
  try {
    const file = path.join(BLOG_DIR, `${slug}.mdx`)
    const raw = fs.readFileSync(file, "utf8")
    const { data, content } = matter(raw)
    return { slug, content, ...data, source: "filesystem" } as BlogPost
  } catch {
    // Fall through to Convex
  }
  return await readConvexPost(slug)
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const all = await getAllPosts()
  return all.filter((p) => p.category === category)
}

export const CATEGORIES = [
  "Understanding the Visa",
  "Evidence Strategy",
  "Founder Positioning",
  "Product & Engineering",
  "Tactical Breakdowns",
  "UK Ecosystem",
  "Career Positioning",
  "Premium Insights",
]
