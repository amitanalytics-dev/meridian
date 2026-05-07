#!/usr/bin/env node
/**
 * Meridian Lead Finder
 * ─────────────────────────────────────────────────────────────────────
 * Scans Reddit for high-intent Global Talent Visa posts.
 * Scores each post, drafts a personalised reply in Amit's voice,
 * and saves a markdown report.
 *
 * Run:   node scripts/find-leads.mjs
 * Needs: ANTHROPIC_API_KEY in .env.local or environment
 */

import Anthropic from "@anthropic-ai/sdk"
import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Env ──────────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(__dirname, "..", ".env.local")
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const [k, ...v] = line.split("=")
      if (k && v.length && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join("=").trim().replace(/^"|"$/g, "")
      }
    }
  }
}
loadEnv()

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error("\n❌  ANTHROPIC_API_KEY not found. Add it to .env.local\n")
  process.exit(1)
}

// ── Config ────────────────────────────────────────────────────────────────────
const MAX_AGE_HOURS    = 72
const MIN_SCORE        = 4      // only show posts scoring >= this
const DRAFT_REPLY_MIN  = 6      // only draft replies for posts scoring >= this
const USER_AGENT       = "MeridianResearch/1.0 (personal-research-tool)"
const SEEN_FILE        = join(__dirname, "leads-seen.json")
const REPORT_FILE      = join(__dirname, "leads-report.md")
const DELAY_MS         = 1000   // pause between Reddit requests

const SEARCH_QUERIES = [
  "global talent visa feedback",
  "global talent visa review profile",
  "tech nation application help",
  "exceptional talent visa UK",
  "exceptional promise visa UK",
  "tech nation endorsement advice",
  "global talent visa chances",
  "global talent visa mentor",
  "uk visa evidence review",
  "tech nation peer review",
  "global talent visa rejected",
  "global talent visa reapply",
]

// Subreddits searched with "global talent visa"
const SUBREDDITS = [
  "ukvisa",
  "immigration",
  "cscareerquestions",
  "cscareerquestionsuk",
  "digitalnomad",
  "startups",
  "unitedkingdom",
  "founderopinions",
  "techuk",
]

const HIGH_INTENT = [
  "feedback", "review", "help", "chances", "qualify", "eligible",
  "mentor", "evaluate", "profile", "assessment", "advice", "guidance",
  "check my", "thoughts on", "opinion", "realistic", "strong enough",
  "weak", "missing", "improve", "rejected", "rejection", "reapply",
  "critique", "honest", "brutal", "am i ready", "what do you think",
  "does my", "should i apply", "would i qualify",
]

const MED_INTENT = [
  "applying", "planning to apply", "thinking about", "considering",
  "preparing", "working on my", "need help", "looking for advice",
  "any tips", "any experience", "has anyone",
]

// ── ANSI colours ──────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m",
  bold:  "\x1b[1m",
  red:   "\x1b[31m",
  grn:   "\x1b[32m",
  yel:   "\x1b[33m",
  cyn:   "\x1b[36m",
  dim:   "\x1b[2m",
}
const col = (c, s) => `${c}${s}${C.reset}`

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadSeen() {
  if (!existsSync(SEEN_FILE)) return new Set()
  try { return new Set(JSON.parse(readFileSync(SEEN_FILE, "utf8"))) }
  catch { return new Set() }
}
function saveSeen(seen) {
  writeFileSync(SEEN_FILE, JSON.stringify([...seen], null, 2))
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
function ageHours(utcSec) { return (Date.now() / 1000 - utcSec) / 3600 }
function timeAgo(utcSec) {
  const h = ageHours(utcSec)
  if (h < 1)  return `${Math.round(h * 60)}m ago`
  if (h < 24) return `${Math.round(h)}h ago`
  return `${Math.round(h / 24)}d ago`
}

function scorePost(title, body) {
  const text = (title + " " + (body || "")).toLowerCase()
  let score = 0
  for (const kw of HIGH_INTENT) if (text.includes(kw)) score += 2
  for (const kw of MED_INTENT)  if (text.includes(kw)) score += 1
  if (text.includes("global talent"))       score += 3
  if (text.includes("tech nation"))         score += 3
  if (text.includes("exceptional talent"))  score += 3
  if (text.includes("exceptional promise")) score += 3
  if (text.includes("endorsement"))         score += 2
  if (text.includes("evidence"))            score += 1
  if (text.includes("recommendation letter")) score += 2
  if (text.includes("personal statement"))  score += 2
  return Math.min(10, score)
}

function scoreLabel(n) {
  if (n >= 8) return col(C.red + C.bold, `[${n}/10] 🔴 HIGH`)
  if (n >= 6) return col(C.yel, `[${n}/10] 🟡 MED`)
  return col(C.dim, `[${n}/10] ⚪ LOW`)
}

// ── Reddit API ────────────────────────────────────────────────────────────────
async function redditSearch(query, subreddit = null) {
  const base = subreddit
    ? `https://www.reddit.com/r/${subreddit}/search.json`
    : "https://www.reddit.com/search.json"
  const qs = new URLSearchParams({
    q: query, sort: "new", limit: "25", t: "week",
    ...(subreddit ? { restrict_sr: "1" } : {}),
  })
  try {
    const res = await fetch(`${base}?${qs}`, {
      headers: { "User-Agent": USER_AGENT },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data?.data?.children ?? []).map(c => c.data)
  } catch {
    return []
  }
}

// ── Reply generation (Claude) ─────────────────────────────────────────────────
const ai = new Anthropic({ apiKey: API_KEY })

async function draftReply(post) {
  const prompt = `You are Amit Tyagi — a UK Global Talent visa holder (Exceptional Talent category), fintech founder, and operator.

Someone posted the following on Reddit asking for help with their Global Talent / Tech Nation application:

TITLE: ${post.title}
BODY: ${(post.selftext || "").slice(0, 1200)}
SUBREDDIT: ${post.subreddit_name_prefixed}

Write a Reddit reply in Amit's first-person voice. Rules:
- Sound like a founder helping another founder — peer-level, not an agency
- Reference something specific from their post to show you read it
- Share one genuine, specific insight about what they described (evidence quality, narrative framing, category choice, etc.)
- Mention that you went through this yourself and got Exceptional Talent
- Softly mention you offer a free readiness assessment at https://meridian-pi-mauve.vercel.app/ — one natural sentence, not a pitch
- DO NOT: use bullet points, headers, immigration jargon, hype language, salesy phrases, or guarantee any outcome
- Length: 3–5 short paragraphs, conversational, no corporate polish
- End naturally — no forced CTA

Write only the reply text. No preamble.`

  try {
    const msg = await ai.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    })
    return msg.content[0].text.trim()
  } catch (e) {
    return `(Reply generation failed: ${e.message})`
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(col(C.bold + C.cyn, "\n━━━ Meridian Lead Finder ━━━\n"))

  const seen   = loadSeen()
  const rawMap = new Map()   // url → { post, matchedQuery }

  // 1. Global Reddit search
  process.stdout.write("Scanning Reddit searches ")
  for (const q of SEARCH_QUERIES) {
    process.stdout.write(".")
    const posts = await redditSearch(q)
    for (const p of posts) {
      const url = "https://reddit.com" + p.permalink
      if (!rawMap.has(url)) rawMap.set(url, { post: p, query: q })
    }
    await sleep(DELAY_MS)
  }

  // 2. Subreddit-scoped search
  process.stdout.write("\nScanning subreddits   ")
  for (const sub of SUBREDDITS) {
    process.stdout.write(".")
    const posts = await redditSearch("global talent visa", sub)
    for (const p of posts) {
      const url = "https://reddit.com" + p.permalink
      if (!rawMap.has(url)) rawMap.set(url, { post: p, query: `r/${sub}` })
    }
    await sleep(DELAY_MS)
  }

  console.log("\n")

  // 3. Filter by age + score
  const scored = []
  for (const [url, { post, query }] of rawMap) {
    if (ageHours(post.created_utc) > MAX_AGE_HOURS) continue
    const score = scorePost(post.title, post.selftext)
    if (score < MIN_SCORE) continue
    scored.push({
      url,
      score,
      isNew: !seen.has(url),
      title:     post.title,
      author:    post.author,
      sub:       post.subreddit_name_prefixed,
      age:       timeAgo(post.created_utc),
      comments:  post.num_comments,
      body:      (post.selftext || "").slice(0, 800),
      query,
      post,
      reply: null,
    })
  }

  scored.sort((a, b) => (b.isNew - a.isNew) || (b.score - a.score))

  const newLeads = scored.filter(r => r.isNew)
  const oldLeads = scored.filter(r => !r.isNew)

  if (scored.length === 0) {
    console.log(col(C.grn, "✅  No relevant posts found in the last 72 hours.\n"))
    return
  }

  // 4. Draft replies for high-intent new leads
  const needsReply = newLeads.filter(r => r.score >= DRAFT_REPLY_MIN)
  if (needsReply.length > 0) {
    console.log(col(C.cyn, `✍  Drafting replies for ${needsReply.length} high-intent leads...\n`))
    for (const lead of needsReply) {
      process.stdout.write(`  Drafting: ${lead.title.slice(0, 55)}...`)
      lead.reply = await draftReply(lead.post)
      console.log(col(C.grn, " ✓"))
      await sleep(500)
    }
    console.log()
  }

  // 5. Terminal output
  if (newLeads.length > 0) {
    console.log(col(C.bold, `🔴  ${newLeads.length} NEW LEADS\n`) + "─".repeat(60))
    for (const r of newLeads) {
      console.log(`\n${scoreLabel(r.score)}  ${col(C.dim, r.sub)}  ${col(C.dim, r.age)}`)
      console.log(col(C.bold, `  ${r.title}`))
      console.log(col(C.dim, `  u/${r.author} · ${r.comments} comments`))
      console.log(col(C.cyn, `  ${r.url}`))
      if (r.reply) {
        console.log(col(C.yel, "\n  ── DRAFT REPLY ──"))
        for (const line of r.reply.split("\n")) {
          console.log(`  ${line}`)
        }
      }
      console.log()
    }
    console.log("─".repeat(60))
  }

  if (oldLeads.length > 0) {
    console.log(col(C.dim, `\n⚪  ${oldLeads.length} previously seen (still within 72h):`))
    for (const r of oldLeads) {
      console.log(col(C.dim, `  [${r.score}/10] ${r.title.slice(0, 70)}`))
      console.log(col(C.dim, `         ${r.url}`))
    }
  }

  // 6. Mark new leads as seen
  for (const r of newLeads) seen.add(r.url)
  saveSeen(seen)

  // 7. Write markdown report
  const now    = new Date()
  const stamp  = now.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })
  const lines  = [
    `# Meridian Lead Report`,
    `**Run:** ${stamp}  ·  **New:** ${newLeads.length}  ·  **Total active:** ${scored.length}`,
    "",
  ]

  if (newLeads.length > 0) {
    lines.push("---\n## 🔴 New Leads\n")
    for (const r of newLeads) {
      lines.push(`### [${r.score}/10] ${r.title}`)
      lines.push(`| Field | Value |`)
      lines.push(`|---|---|`)
      lines.push(`| Platform | Reddit ${r.sub} |`)
      lines.push(`| Author | u/${r.author} |`)
      lines.push(`| Age | ${r.age} |`)
      lines.push(`| Comments | ${r.comments} |`)
      lines.push(`| URL | [Open post](${r.url}) |`)
      lines.push(`| Matched query | ${r.query} |`)
      lines.push("")
      if (r.body) {
        lines.push(`**Post excerpt:**\n> ${r.body.replace(/\n/g, "\n> ").slice(0, 400)}`)
        lines.push("")
      }
      if (r.reply) {
        lines.push("**Draft reply (Amit's voice):**\n")
        lines.push(r.reply)
      }
      lines.push("\n---\n")
    }
  }

  if (oldLeads.length > 0) {
    lines.push("## ⚪ Previously Seen (still active)\n")
    for (const r of oldLeads) {
      lines.push(`- **[${r.score}/10]** [${r.title}](${r.url}) · ${r.age} · u/${r.author}`)
    }
    lines.push("")
  }

  writeFileSync(REPORT_FILE, lines.join("\n"))
  console.log(col(C.grn, `\n📄  Report saved → scripts/leads-report.md`))
  console.log(col(C.dim,  `    Total active leads: ${scored.length}  ·  New: ${newLeads.length}\n`))
}

main().catch(e => {
  console.error(col(C.red, `\n❌  Error: ${e.message}\n`))
  process.exit(1)
})
