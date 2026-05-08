import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// ── Sessions ──────────────────────────────────────────────────────────────────

export const startSession = mutation({
  args: {
    sessionId: v.string(),
    pageEntered: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotent — only insert if a row for this sessionId doesn't exist yet
    const existing = await ctx.db
      .query("chatSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first()
    if (existing) return existing._id

    const now = Date.now()
    return await ctx.db.insert("chatSessions", {
      sessionId: args.sessionId,
      startedAt: now,
      lastMessageAt: now,
      messageCount: 0,
      pageEntered: args.pageEntered,
      referrer: args.referrer,
      leadCaptured: false,
    })
  },
})

export const appendMessage = mutation({
  args: {
    sessionId: v.string(),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert("chatMessages", {
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      timestamp: now,
    })
    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first()
    if (session) {
      await ctx.db.patch(session._id, {
        lastMessageAt: now,
        messageCount: session.messageCount + 1,
      })
    }
  },
})

export const captureLead = mutation({
  args: {
    sessionId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    intent: v.string(),
    qualifyScore: v.number(),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert("chatLeads", {
      sessionId: args.sessionId,
      email: args.email,
      name: args.name,
      intent: args.intent,
      qualifyScore: args.qualifyScore,
      transcript: args.transcript,
      notifiedAmit: false,
      createdAt: now,
    })
    const session = await ctx.db
      .query("chatSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first()
    if (session) {
      await ctx.db.patch(session._id, {
        leadEmail: args.email,
        leadName: args.name,
        leadCaptured: true,
        qualifyScore: args.qualifyScore,
      })
    }
  },
})

export const getSessionMessages = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect()
    return messages.sort((a, b) => a.timestamp - b.timestamp)
  },
})

export const markAmitNotified = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const lead = await ctx.db
      .query("chatLeads")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first()
    if (lead) await ctx.db.patch(lead._id, { notifiedAmit: true })
  },
})
