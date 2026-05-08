import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// ── Inserting from the batch generator ────────────────────────────────────────

export const enqueue = mutation({
  args: {
    slug:         v.string(),
    title:        v.string(),
    category:     v.string(),
    excerpt:      v.string(),
    readTime:     v.string(),
    date:         v.string(),
    mdxBody:      v.string(),
    mdxFull:      v.string(),
    scheduledFor: v.number(),
  },
  handler: async (ctx, args) => {
    // Idempotent: if a row with this slug already exists, update it
    const existing = await ctx.db
      .query("scheduledBlogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
    const now = Date.now()
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        published: existing.published,
        publishedAt: existing.publishedAt,
        generatedAt: now,
      })
      return existing._id
    }
    return await ctx.db.insert("scheduledBlogs", {
      ...args,
      published: false,
      generatedAt: now,
    })
  },
})

// ── Cron: pick the next due unpublished entry and mark it published ───────────

export const claimNextDue = mutation({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const due = await ctx.db
      .query("scheduledBlogs")
      .withIndex("by_published_schedule", (q) =>
        q.eq("published", false).lte("scheduledFor", args.now)
      )
      .order("asc")
      .first()
    if (!due) return null
    await ctx.db.patch(due._id, { published: true, publishedAt: args.now })
    return {
      _id: due._id,
      slug: due.slug,
      title: due.title,
      scheduledFor: due.scheduledFor,
    }
  },
})

// ── Reads used by lib/blog.ts at build time ───────────────────────────────────

export const allPublished = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("scheduledBlogs").collect()
    return rows
      .filter((r) => r.published)
      .map((r) => ({
        slug: r.slug,
        title: r.title,
        category: r.category,
        excerpt: r.excerpt,
        readTime: r.readTime,
        date: r.date,
        mdxBody: r.mdxBody,
        publishedAt: r.publishedAt ?? r.generatedAt,
      }))
  },
})

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("scheduledBlogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
    if (!row || !row.published) return null
    return {
      slug: row.slug,
      title: row.title,
      category: row.category,
      excerpt: row.excerpt,
      readTime: row.readTime,
      date: row.date,
      mdxBody: row.mdxBody,
    }
  },
})

// ── Admin/inspection ──────────────────────────────────────────────────────────

export const queueStats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("scheduledBlogs").collect()
    const total = rows.length
    const published = rows.filter((r) => r.published).length
    const dueNow = rows.filter((r) => !r.published && r.scheduledFor <= Date.now()).length
    const nextDue = rows
      .filter((r) => !r.published)
      .sort((a, b) => a.scheduledFor - b.scheduledFor)[0]
    return {
      total,
      published,
      pending: total - published,
      dueNow,
      nextDueSlug: nextDue?.slug,
      nextDueAt: nextDue?.scheduledFor,
    }
  },
})
