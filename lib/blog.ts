import fs from "fs"
import path from "path"
import matter from "gray-matter"

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
}

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR)
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.replace(".mdx", "")
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf8")
      const { data, content } = matter(raw)
      return { slug, content, ...data } as BlogPost
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPost(slug: string): BlogPost | null {
  try {
    const raw = fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), "utf8")
    const { data, content } = matter(raw)
    return { slug, content, ...data } as BlogPost
  } catch {
    return null
  }
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getAllPosts().filter((p) => p.category === category)
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
