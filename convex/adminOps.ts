import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server"
import { v } from "convex/values"

// ── adminActions ──────────────────────────────────────────────────────────────

export const createAction = mutation({
  args: {
    sessionId: v.string(),
    task:      v.string(),
    dueAt:     v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("adminActions", {
      sessionId:  args.sessionId,
      task:       args.task,
      dueAt:      args.dueAt,
      completed:  false,
      dismissed:  false,
      createdAt:  Date.now(),
    })
  },
})

export const completeAction = mutation({
  args: { actionId: v.id("adminActions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.actionId, { completed: true })
  },
})

export const dismissAction = mutation({
  args: { actionId: v.id("adminActions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.actionId, { dismissed: true })
  },
})

export const getActions = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("adminActions")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(200)
    // filter out dismissed in memory (no filter in query per guidelines)
    return rows.filter(r => !r.dismissed)
  },
})

export const getAllPendingActions = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("adminActions")
      .withIndex("by_completed", q => q.eq("completed", false))
      .take(200)
    return rows.filter(r => !r.dismissed)
  },
})

// ── emailLog ──────────────────────────────────────────────────────────────────

export const logEmail = mutation({
  args: {
    sessionId:   v.optional(v.string()),
    to:          v.string(),
    subject:     v.string(),
    template:    v.string(),
    bodyPreview: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailLog", {
      sessionId:   args.sessionId,
      to:          args.to,
      subject:     args.subject,
      template:    args.template,
      bodyPreview: args.bodyPreview,
      sentAt:      Date.now(),
    })
  },
})

export const getEmailLog = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailLog")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(100)
  },
})

export const getAllRecentEmails = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("emailLog")
      .withIndex("by_sent")
      .order("desc")
      .take(100)
  },
})

// ── clientNotes ───────────────────────────────────────────────────────────────

export const addNote = mutation({
  args: {
    sessionId: v.string(),
    note:      v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clientNotes", {
      sessionId: args.sessionId,
      note:      args.note,
      createdAt: Date.now(),
    })
  },
})

export const getNotes = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clientNotes")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(200)
  },
})

// ── clientStages ──────────────────────────────────────────────────────────────

export const setStage = mutation({
  args: {
    sessionId: v.string(),
    stage:     v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clientStages", {
      sessionId: args.sessionId,
      stage:     args.stage,
      movedAt:   Date.now(),
    })
  },
})

export const getCurrentStage = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("clientStages")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(100)
    if (rows.length === 0) return null
    // rows are ordered desc by _creationTime; we want highest movedAt
    return rows.reduce((best, r) => r.movedAt > best.movedAt ? r : best)
  },
})

export const getAllCurrentStages = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("clientStages")
      .withIndex("by_session")
      .take(500)
    // Deduplicate: keep only the record with the highest movedAt per sessionId
    const map = new Map<string, { sessionId: string; stage: string; movedAt: number }>()
    for (const r of rows) {
      const existing = map.get(r.sessionId)
      if (!existing || r.movedAt > existing.movedAt) {
        map.set(r.sessionId, { sessionId: r.sessionId, stage: r.stage, movedAt: r.movedAt })
      }
    }
    return Array.from(map.values())
  },
})

// ── Nurture internals ─────────────────────────────────────────────────────────

const NURTURE_DELAYS_MS: Record<number, number> = {
  1: 3 * 24 * 60 * 60 * 1000,
  2: 2 * 24 * 60 * 60 * 1000,
  3: 3 * 24 * 60 * 60 * 1000,
  4: 4 * 24 * 60 * 60 * 1000,
}

export const getLeadsDueForNurture = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now  = Date.now()
    const rows = await ctx.db
      .query("readinessAssessments")
      .withIndex("by_lead_quality")
      .take(500)

    const due: Array<{
      sessionId:        string
      email:            string
      name:             string
      nurtureEmailsSent:number
      overallScore:     number
      recommendedTrack: string
    }> = []

    for (const a of rows) {
      // Must have email, be a captured lead, and have fewer than 5 nurture emails
      if (!a.email || !a.leadCaptured || a.nurtureEmailsSent >= 5) continue

      const sent  = a.nurtureEmailsSent
      const delay = NURTURE_DELAYS_MS[sent]
      if (!delay) continue

      const lastAt = a.lastNurtureAt ?? a.createdAt
      if (now - lastAt < delay) continue

      due.push({
        sessionId:        a.sessionId,
        email:            a.email,
        name:             a.name ?? "there",
        nurtureEmailsSent:sent,
        overallScore:     a.overallScore,
        recommendedTrack: a.recommendedTrack,
      })
    }

    return due
  },
})

export const markNurtureSent = internalMutation({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("readinessAssessments")
      .withIndex("by_session", q => q.eq("sessionId", args.sessionId))
      .unique()
    if (!record) return
    await ctx.db.patch(record._id, {
      nurtureEmailsSent: record.nurtureEmailsSent + 1,
      lastNurtureAt:     Date.now(),
    })
  },
})
