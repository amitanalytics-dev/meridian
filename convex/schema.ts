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
})
