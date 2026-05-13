import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  // FCI scorecard completions
  scores: defineTable({
    sessionId:        v.string(),            // anonymous session ID
    inputData:        v.any(),               // FCIInput object
    fciScore:         v.number(),            // 0–100
    tier:             v.number(),            // 1 | 2 | 3
    tierLabel:        v.string(),
    subScores:        v.any(),               // SubScores object
    confidence:       v.string(),
    primaryGap:       v.string(),
    primaryStrength:  v.string(),
    patternAlignment: v.number(),
    advisoryPath:     v.string(),
    createdAt:        v.number(),            // Unix timestamp
  }),

  // Strategic Review applications
  applications: defineTable({
    refId:       v.string(),                 // MRD-YYYY-XXXX
    name:        v.string(),
    email:       v.string(),
    role:        v.string(),
    company:     v.string(),
    built:       v.string(),
    globalGoal:  v.string(),
    biggestGap:  v.string(),
    fciScore:    v.optional(v.number()),     // from scorecard if taken
    status:      v.string(),                 // "pending" | "reviewed" | "accepted" | "declined"
    tier:        v.optional(v.string()),     // assigned advisory tier
    amitNotes:   v.optional(v.string()),     // Amit's internal notes
    createdAt:   v.number(),
  }),

  // Payment records (wired when Stripe is added)
  payments: defineTable({
    applicationId: v.id("applications"),
    refId:         v.string(),
    amount:        v.number(),               // in pence
    currency:      v.string(),               // "gbp"
    status:        v.string(),               // "pending" | "paid" | "failed"
    stripeIntentId:v.optional(v.string()),
    tier:          v.string(),
    createdAt:     v.number(),
  }),

  // Community waitlist
  communityWaitlist: defineTable({
    email:        v.string(),
    name:         v.optional(v.string()),
    source:       v.string(),               // "homepage" | "result" | "advisory"
    fciScore:     v.optional(v.number()),
    createdAt:    v.number(),
  }),

  // ── Scheduled blog queue (filled by the batch generator, drained by daily cron) ──
  scheduledBlogs: defineTable({
    slug:            v.string(),
    title:           v.string(),
    category:        v.string(),
    excerpt:         v.string(),
    readTime:        v.string(),
    date:            v.string(),                 // ISO yyyy-mm-dd, used as the post's display date
    mdxBody:         v.string(),                 // post body only (no frontmatter)
    mdxFull:         v.string(),                 // full MDX with frontmatter (kept for re-export)
    scheduledFor:    v.number(),                 // ms timestamp — cron picks up when scheduledFor <= now
    published:       v.boolean(),
    publishedAt:     v.optional(v.number()),
    generatedAt:     v.number(),
  }).index("by_slug", ["slug"]).index("by_published_schedule", ["published", "scheduledFor"]),

  // ── Chat widget tables (Aria, the on-site assistant) ────────────────────────

  // One row per chat session (anonymous until lead is captured)
  chatSessions: defineTable({
    sessionId:      v.string(),              // anonymous session ID (UUID, browser-generated)
    startedAt:      v.number(),
    lastMessageAt:  v.number(),
    messageCount:   v.number(),
    pageEntered:    v.optional(v.string()),  // URL where chat was first opened
    referrer:       v.optional(v.string()),
    leadEmail:      v.optional(v.string()),  // captured later
    leadName:       v.optional(v.string()),
    leadCaptured:   v.boolean(),
    qualifyScore:   v.optional(v.number()),  // 0–100, set by the assistant
  }).index("by_session", ["sessionId"]),

  // Each message in a chat session, in order
  chatMessages: defineTable({
    sessionId:  v.string(),
    role:       v.string(),                  // "user" | "assistant"
    content:    v.string(),
    timestamp:  v.number(),
  }).index("by_session", ["sessionId"]),

  // High-intent leads (email captured) — Amit gets notified for these
  chatLeads: defineTable({
    sessionId:     v.string(),
    email:         v.string(),
    name:          v.optional(v.string()),
    intent:        v.string(),               // free-text snapshot of what they want
    qualifyScore:  v.number(),               // 0–100
    transcript:    v.string(),               // full conversation as plain text
    notifiedAmit:  v.boolean(),
    createdAt:     v.number(),
  }).index("by_session", ["sessionId"]),

  // End-of-chat feedback (rating + optional comment, optional email)
  chatFeedback: defineTable({
    sessionId:    v.string(),
    rating:       v.number(),                // 1–5
    comment:      v.optional(v.string()),
    emailShared:  v.optional(v.string()),    // captured here if user opted to email Amit on exit
    messageCount: v.number(),
    pageContext:  v.optional(v.string()),    // URL where chat was open
    createdAt:    v.number(),
  }).index("by_session", ["sessionId"]),

  // ── Visa Readiness Assessment tables ────────────────────────────────────────

  readinessAssessments: defineTable({
    sessionId:           v.string(),
    answers:             v.any(),
    overallScore:        v.number(),
    readinessLevel:      v.string(),
    recommendedTrack:    v.string(),
    secondaryTrack:      v.optional(v.string()),
    trackExplanation:    v.string(),
    subScores:           v.any(),
    insights:            v.array(v.string()),
    documentChecklist:   v.any(),
    leadQuality:         v.string(),
    leadCaptured:        v.boolean(),
    name:                v.optional(v.string()),
    email:               v.optional(v.string()),
    phone:               v.optional(v.string()),
    linkedinUrl:         v.optional(v.string()),
    emailSentToAmit:     v.boolean(),
    reportEmailSent:     v.boolean(),
    nurtureEmailsSent:   v.number(),
    lastNurtureAt:       v.optional(v.number()),
    consultationBooked:  v.boolean(),
    createdAt:           v.number(),
  })
    .index("by_session",      ["sessionId"])
    .index("by_email",        ["email"])
    .index("by_lead_quality", ["leadQuality"])
    .index("by_created",      ["createdAt"]),

  documentUploads: defineTable({
    assessmentId:     v.id("readinessAssessments"),
    fileName:         v.string(),
    fileType:         v.string(),
    evidenceCategory: v.string(),
    aiScore:          v.number(),
    aiAnalysis:       v.string(),
    strengthens:      v.boolean(),
    uploadedAt:       v.number(),
  }).index("by_assessment", ["assessmentId"]),

  // Admin action items — per-client to-do list for Amit
  adminActions: defineTable({
    sessionId:  v.string(),
    task:       v.string(),
    dueAt:      v.optional(v.number()),
    completed:  v.boolean(),
    dismissed:  v.boolean(),
    createdAt:  v.number(),
  })
    .index("by_session",   ["sessionId"])
    .index("by_completed", ["completed"]),

  // All emails sent from admin dashboard
  emailLog: defineTable({
    sessionId:   v.optional(v.string()),
    to:          v.string(),
    subject:     v.string(),
    template:    v.string(),
    bodyPreview: v.string(),
    sentAt:      v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_sent",    ["sentAt"]),

  // Amit's timestamped notes on clients
  clientNotes: defineTable({
    sessionId: v.string(),
    note:      v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // Pipeline stage history — every move is appended
  clientStages: defineTable({
    sessionId: v.string(),
    stage:     v.string(),
    movedAt:   v.number(),
  }).index("by_session", ["sessionId"]),
})
