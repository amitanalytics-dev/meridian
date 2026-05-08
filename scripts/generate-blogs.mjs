#!/usr/bin/env node
/**
 * Meridian blog batch generator.
 *
 * Three-phase workflow using Anthropic's Message Batches API (50% off, <24h turnaround).
 *
 *   1. node scripts/generate-blogs.mjs submit
 *      Reads scripts/blog-topics.json, packages 43 messages, submits one batch.
 *      Saves the batch ID to scripts/.batch-state.json.
 *
 *   2. node scripts/generate-blogs.mjs poll
 *      Checks status of the in-flight batch. Prints progress.
 *
 *   3. node scripts/generate-blogs.mjs collect
 *      Once the batch is "ended", downloads results, parses each MDX,
 *      and writes them into content/blog-queue.json with scheduled dates
 *      starting tomorrow, one per day. They are NOT yet on the live site.
 *      The /api/publish-daily cron will move one entry per day from the
 *      queue into content/blog/ as a real .mdx file.
 *
 * Required env: ANTHROPIC_API_KEY
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Anthropic from "@anthropic-ai/sdk"
import matter from "gray-matter"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const TOPICS_FILE = path.join(ROOT, "scripts/blog-topics.json")
const STATE_FILE = path.join(ROOT, "scripts/.batch-state.json")

// ── System prompt (cached on every request) ───────────────────────────────────
const SYSTEM_PROMPT = `You are writing a blog post for Meridian (https://meridiangtv.co.uk), an independent UK Global Talent Visa advisory service operated by Amit Tyagi — a fintech founder who himself received UK Global Talent recognition under Exceptional Talent.

## VOICE — non-negotiable

- Long-form, narrative-driven, framework-heavy. NOT a listicle.
- Direct, calm, observational. No hype. No emoji. No "in this article we will...".
- Plain words. If using a technical term, explain it in the same sentence.
- Strong opinions, gently held. Push back on common misconceptions where relevant.
- Concrete examples over abstract claims. Numbers over adjectives.
- Acknowledges nuance — never claims guarantees about visa outcomes.
- Reads like a smart friend who has been through the process, not a marketing page.
- British spelling (organisation, recognise, programme).
- Present tense for general principles. Past tense only for specific examples.

## STRUCTURE — required

- ~1000 words (target given per topic; treat ±100 as fine).
- Opens with a single concrete observation, contradiction, or insight — never "The UK Global Talent Visa is...".
- 3–5 H2 sections (## headings). No H3 unless absolutely needed.
- Each H2 section is 2–4 paragraphs.
- One short bulleted list maximum per post — and only if genuinely useful.
- One bolded "**The fix:**" or "**The takeaway:**" line per section is fine; do not overuse.
- Closes with 2–3 sentences that name what the reader should do next, ideally pointing toward Meridian's free readiness assessment or methodology.

## REQUIRED FRAMING

- Always anchor in the real Tech Nation assessment framework — Mandatory Criteria, Optional Criteria, the assessment panel, the endorsement letter.
- When mentioning evidence, always require it to be "specific, dated, third-party-verifiable" or similar.
- When mentioning outcomes, never promise approval. Use "moves the odds", "strengthens the case", "what evaluators are trained to look for".
- Reference Meridian and Amit Tyagi at most once in the post body — naturally, not promotionally. Do not name the founder more than twice.
- If asked to mention a particular slug from the linkTo list, do so as an inline markdown link with descriptive anchor text inside the post — exactly once per linked slug. Format: \`[descriptive anchor](/blog/SLUG)\`. For pages outside /blog, use the path as given (e.g. \`[methodology](/methodology)\`).

## OUTPUT FORMAT — STRICT

Return ONLY the MDX file contents, with frontmatter, ready to drop into content/blog/.

Frontmatter format (YAML between --- markers):
- title: the exact title given
- date: leave as "DATE_PLACEHOLDER" — the script replaces this
- category: the exact category given
- excerpt: a 25–35 word summary, single sentence preferred
- readTime: estimate to the nearest minute (e.g. "9 min read")
- featured: false

After the frontmatter, the post body in plain markdown. Do NOT wrap in code fences. Do NOT include a top-level # heading — the title comes from frontmatter.

Begin output with --- and end with the final paragraph of the post. Do not include any commentary, preface, or sign-off outside the MDX.`

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadTopics() {
  const raw = fs.readFileSync(TOPICS_FILE, "utf8")
  return JSON.parse(raw).topics
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return null
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"))
}

function userPromptFor(topic) {
  const links = topic.linkTo?.length
    ? `\n\nInternal links to weave in naturally (use each exactly once):\n${topic.linkTo.map((l) => `- ${l.startsWith("/") ? l : "/blog/" + l}`).join("\n")}`
    : ""
  return `Write the Meridian blog post for the following topic.

Topic: ${topic.title}
Slug: ${topic.slug}
Category: ${topic.category}
Primary keyword: ${topic.primaryKeyword}
Target word count: ${topic.wordTarget}
Target audience: ${topic.audience}${links}

Output the MDX file contents now, beginning with the frontmatter --- block.`
}

function getClient() {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    console.error("ERROR: ANTHROPIC_API_KEY not set in environment.")
    console.error("Add it to .env.local and re-run with: ANTHROPIC_API_KEY=$(grep ANTHROPIC_API_KEY .env.local | cut -d= -f2) node scripts/generate-blogs.mjs submit")
    process.exit(1)
  }
  return new Anthropic({ apiKey: key })
}

// ── Phase 1: submit ───────────────────────────────────────────────────────────
async function submit() {
  const topics = loadTopics()
  console.log(`Submitting batch with ${topics.length} blog requests...`)

  const client = getClient()

  const requests = topics.map((topic) => ({
    custom_id: topic.slug,
    params: {
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: [
        // Cached: same system prompt across all 43 requests → near-instant cache hits after the first
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: userPromptFor(topic) }],
    },
  }))

  const batch = await client.messages.batches.create({ requests })
  console.log(`Batch created: ${batch.id}`)
  console.log(`Status: ${batch.processing_status}`)
  console.log(`Created at: ${batch.created_at}`)
  saveState({ batchId: batch.id, submittedAt: Date.now(), topicCount: topics.length })
  console.log(`\nState saved to ${STATE_FILE}`)
  console.log(`\nNext: run \`node scripts/generate-blogs.mjs poll\` periodically.`)
}

// ── Phase 2: poll ─────────────────────────────────────────────────────────────
async function poll() {
  const state = loadState()
  if (!state?.batchId) {
    console.error("No batch in flight. Run `submit` first.")
    process.exit(1)
  }

  const client = getClient()
  const batch = await client.messages.batches.retrieve(state.batchId)
  const c = batch.request_counts
  const total = c.processing + c.succeeded + c.errored + c.canceled + c.expired

  console.log(`Batch: ${batch.id}`)
  console.log(`Status: ${batch.processing_status}`)
  console.log(`Counts: ${c.succeeded} succeeded, ${c.processing} processing, ${c.errored} errored, ${c.canceled} canceled, ${c.expired} expired (${total} total)`)
  if (batch.ended_at) {
    console.log(`Ended at: ${batch.ended_at}`)
    console.log(`\nNext: run \`node scripts/generate-blogs.mjs collect\`.`)
  } else {
    console.log(`\nStill in progress. Check again in ~30 minutes.`)
  }
}

// ── Phase 3: collect ──────────────────────────────────────────────────────────
async function collect() {
  const state = loadState()
  if (!state?.batchId) {
    console.error("No batch in flight. Run `submit` first.")
    process.exit(1)
  }

  const client = getClient()
  const batch = await client.messages.batches.retrieve(state.batchId)
  if (batch.processing_status !== "ended") {
    console.error(`Batch is not yet ended. Status: ${batch.processing_status}. Run \`poll\` first.`)
    process.exit(1)
  }

  console.log(`Streaming results from batch ${batch.id}...`)
  const results = client.messages.batches.results(batch.id)

  const topics = loadTopics()
  const topicMap = Object.fromEntries(topics.map((t) => [t.slug, t]))

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    console.error("ERROR: NEXT_PUBLIC_CONVEX_URL not set. Run `npx convex dev` first.")
    process.exit(1)
  }
  const convex = new ConvexHttpClient(convexUrl)

  // One scheduled date per blog, starting tomorrow at 09:00 UTC, one per day.
  const startDay = new Date()
  startDay.setUTCDate(startDay.getUTCDate() + 1)
  startDay.setUTCHours(9, 0, 0, 0)

  let i = 0
  let succeeded = 0
  let errored = 0

  for await (const r of results) {
    const slug = r.custom_id
    const topic = topicMap[slug]
    if (!topic) {
      console.warn(`  ! Unknown slug in result: ${slug}`)
      continue
    }
    if (r.result.type !== "succeeded") {
      console.warn(`  ✗ ${slug}: ${r.result.type}`)
      errored++
      continue
    }
    const block = r.result.message.content.find((c) => c.type === "text")
    if (!block) {
      console.warn(`  ✗ ${slug}: no text content`)
      errored++
      continue
    }

    const scheduledFor = new Date(startDay)
    scheduledFor.setUTCDate(startDay.getUTCDate() + i)
    const isoDate = scheduledFor.toISOString().slice(0, 10)
    const mdxFull = block.text.replace("DATE_PLACEHOLDER", isoDate)

    // Parse frontmatter so we can store fields separately in Convex
    let parsed
    try {
      parsed = matter(mdxFull)
    } catch (err) {
      console.warn(`  ✗ ${slug}: frontmatter parse error: ${err.message}`)
      errored++
      continue
    }
    const fm = parsed.data
    if (!fm.title || !fm.category || !fm.excerpt) {
      console.warn(`  ✗ ${slug}: frontmatter missing required fields`)
      errored++
      continue
    }

    await convex.mutation(api.scheduledBlogs.enqueue, {
      slug,
      title: String(fm.title),
      category: String(fm.category),
      excerpt: String(fm.excerpt),
      readTime: String(fm.readTime ?? "8 min read"),
      date: isoDate,
      mdxBody: parsed.content.trim(),
      mdxFull,
      scheduledFor: scheduledFor.getTime(),
    })

    succeeded++
    i++
    console.log(`  ✓ ${slug} → enqueued, will publish ${isoDate}`)
  }

  console.log(`\n${succeeded} blogs enqueued in Convex, ${errored} failed.`)
  console.log(`Run \`npx convex run scheduledBlogs:queueStats\` to inspect.`)
  console.log(`The /api/publish-daily cron will publish one per day at 09:00 UTC.`)
}

// ── Phase: dry-run (test prompt with one topic, no batch) ──────────────────────
async function dryRun() {
  const topics = loadTopics()
  const topic = topics[0]
  console.log(`Dry-run with: ${topic.title}\n`)

  const client = getClient()
  const r = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: userPromptFor(topic) }],
  })
  const text = r.content.find((b) => b.type === "text")?.text ?? ""
  console.log(text)
  console.log(`\n--- usage ---`)
  console.log(r.usage)
}

// ── CLI ───────────────────────────────────────────────────────────────────────
const cmd = process.argv[2]
const handlers = { submit, poll, collect, "dry-run": dryRun }
if (!handlers[cmd]) {
  console.log(`Usage: node scripts/generate-blogs.mjs <submit|poll|collect|dry-run>`)
  process.exit(0)
}
handlers[cmd]().catch((err) => {
  console.error(err)
  process.exit(1)
})
