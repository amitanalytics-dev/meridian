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
})
