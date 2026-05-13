import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const createAssessment = mutation({
  args: {
    sessionId:        v.string(),
    answers:          v.any(),
    overallScore:     v.number(),
    readinessLevel:   v.string(),
    recommendedTrack: v.string(),
    secondaryTrack:   v.optional(v.string()),
    trackExplanation: v.string(),
    subScores:        v.any(),
    insights:         v.array(v.string()),
    documentChecklist:v.any(),
    leadQuality:      v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("readinessAssessments", {
      ...args,
      leadCaptured:      false,
      emailSentToAmit:   false,
      reportEmailSent:   false,
      nurtureEmailsSent: 0,
      consultationBooked:false,
      createdAt:         Date.now(),
    })
  },
})

export const captureLeadData = mutation({
  args: {
    assessmentId: v.id("readinessAssessments"),
    name:         v.string(),
    email:        v.string(),
    phone:        v.string(),
    linkedinUrl:  v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.assessmentId, {
      name:        args.name,
      email:       args.email,
      phone:       args.phone,
      linkedinUrl: args.linkedinUrl,
      leadCaptured:true,
    })
  },
})

export const updateEmailStatus = mutation({
  args: {
    assessmentId:    v.id("readinessAssessments"),
    emailSentToAmit: v.optional(v.boolean()),
    reportEmailSent: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const update: Record<string, boolean> = {}
    if (args.emailSentToAmit !== undefined) update.emailSentToAmit = args.emailSentToAmit
    if (args.reportEmailSent !== undefined) update.reportEmailSent = args.reportEmailSent
    await ctx.db.patch(args.assessmentId, update)
  },
})

export const getAssessment = query({
  args: { assessmentId: v.id("readinessAssessments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.assessmentId)
  },
})

export const getAllAssessments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("readinessAssessments")
      .withIndex("by_created")
      .order("desc")
      .take(100)
  },
})

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("readinessAssessments")
      .order("desc")
      .take(500)
    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const total    = all.length
    const hotLeads = all.filter(a => a.leadQuality === "hot").length
    const warmLeads= all.filter(a => a.leadQuality === "warm").length
    const avgScore = total > 0
      ? Math.round(all.reduce((s, a) => s + a.overallScore, 0) / total)
      : 0
    const thisWeek = all.filter(a => a.createdAt > weekAgo).length
    return { total, hotLeads, warmLeads, avgScore, thisWeek }
  },
})
