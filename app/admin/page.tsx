"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

// ── Types ──────────────────────────────────────────────────────────────────────

interface LeadData {
  _id: string
  sessionId: string
  name?: string
  email?: string
  phone?: string
  linkedinUrl?: string
  overallScore: number
  readinessLevel: string
  recommendedTrack: string
  leadQuality: string
  insights: string[]
  subScores: Record<string, number>
  answers: Record<string, unknown>
  documentChecklist: unknown
  leadCaptured: boolean
  nurtureEmailsSent: number
  lastNurtureAt?: number
  createdAt: number
}

interface Stats {
  total: number
  hotLeads: number
  warmLeads: number
  avgScore: number
  thisWeek: number
}

type PipelineStage =
  | "lead"
  | "contacted"
  | "onboarded"
  | "building"
  | "review"
  | "ready"
  | "submitted"
  | "won"
  | "lost"

interface ActionItem {
  _id: string
  sessionId: string
  task: string
  dueAt?: number
  completed: boolean
  dismissed: boolean
  createdAt: number
}

interface NoteItem {
  _id: string
  sessionId: string
  note: string
  createdAt: number
}

interface EmailItem {
  _id: string
  sessionId?: string
  to: string
  subject: string
  template: string
  bodyPreview: string
  sentAt: number
}

interface ProfileData {
  notes: NoteItem[]
  actions: ActionItem[]
  emails: EmailItem[]
}

interface CopilotMessage {
  role: "user" | "assistant"
  content: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "meridian2025"

const STAGE_ORDER: PipelineStage[] = [
  "lead",
  "contacted",
  "onboarded",
  "building",
  "review",
  "ready",
  "submitted",
  "won",
]

const STAGE_CONFIG: Record<
  string,
  { label: string; color: string; next?: PipelineStage }
> = {
  lead:      { label: "New Lead",      color: "#EF4444", next: "contacted" },
  contacted: { label: "Contacted",     color: "#F59E0B", next: "onboarded" },
  onboarded: { label: "Onboarded",     color: "#7C3AED", next: "building" },
  building:  { label: "Building",      color: "#06B6D4", next: "review" },
  review:    { label: "Under Review",  color: "#9F6EF5", next: "ready" },
  ready:     { label: "Visa Ready",    color: "#10B981", next: "submitted" },
  submitted: { label: "Submitted",     color: "#3B82F6", next: "won" },
  won:       { label: "Won",           color: "#10B981" },
  lost:      { label: "Lost",          color: "#6B7280" },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  <  2) return "just now"
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  <  7) return `${days}d ago`
  return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

function scoreBadgeStyle(score: number) {
  if (score >= 75) return { bg: "#10B98118", color: "#10B981", border: "#10B98140" }
  if (score >= 55) return { bg: "#06B6D418", color: "#06B6D4", border: "#06B6D440" }
  if (score >= 35) return { bg: "#F59E0B18", color: "#F59E0B", border: "#F59E0B40" }
  return { bg: "#EF444418", color: "#EF4444", border: "#EF444440" }
}

function trackBadgeStyle(track: string) {
  if (track === "et") return { bg: "#7C3AED18", color: "#7C3AED", border: "#7C3AED40", label: "ET" }
  if (track === "ep") return { bg: "#06B6D418", color: "#06B6D4", border: "#06B6D440", label: "EP" }
  return { bg: "#47556918", color: "#475569", border: "#47556940", label: "N/A" }
}

function qualityStyle(quality: string) {
  if (quality === "hot")  return { bg: "#EF444418", color: "#EF4444", border: "#EF444440", label: "Hot" }
  if (quality === "warm") return { bg: "#F59E0B18", color: "#F59E0B", border: "#F59E0B40", label: "Warm" }
  return { bg: "#47556918", color: "#475569", border: "#47556940", label: "Cold" }
}

function trackLabel(track: string) {
  if (track === "et") return "Exceptional Talent"
  if (track === "ep") return "Exceptional Promise"
  return "N/A"
}

function exportCSV(leads: LeadData[]) {
  const headers = ["Name", "Email", "Phone", "Score", "Track", "Level", "Quality", "Date"]
  const rows = leads.map(l => [
    l.name ?? "Anonymous",
    l.email ?? "",
    l.phone ?? "",
    l.overallScore,
    l.recommendedTrack,
    l.readinessLevel,
    l.leadQuality,
    new Date(l.createdAt).toLocaleDateString("en-GB"),
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url
  a.download = `meridian-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function generateHtml(template: string, body: string, name: string): string {
  const lines = body
    .split("\n")
    .map(l => l.trim() === "" ? "<br/>" : `<p style="margin:0 0 12px 0;line-height:1.6;">${l}</p>`)
    .join("")
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:linear-gradient(135deg,#7C3AED,#06B6D4);padding:28px 36px;border-radius:12px 12px 0 0;">
    <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:-0.5px;">Meridian</span>
    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.7);margin-top:2px;">Global Talent Visa Advisory</span>
  </td></tr>
  <tr><td style="background:#fff;padding:36px;color:#1e293b;font-size:15px;">
    ${lines}
  </td></tr>
  <tr><td style="background:#f8fafc;padding:20px 36px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
    <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
      This email was sent by Meridian Advisory. Meridian is an independent advisory service and is not affiliated with the UK Government, the Home Office, or any visa endorsement body. This is not immigration legal advice.
    </p>
    <p style="margin:8px 0 0 0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} Meridian Advisory · amit@berriesadvisory.com</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// ── Template definitions ───────────────────────────────────────────────────────

const TEMPLATES: Record<string, {
  id: string
  label: string
  subject: (name: string, score: number, track: string) => string
  body: (name: string, score: number, track: string, quality: string) => string
}> = {
  welcome: {
    id: "welcome",
    label: "Welcome + Assessment",
    subject: (name) => `Your Global Talent readiness report, ${name}`,
    body: (name, score, track, quality) =>
      `Hi ${name},\n\nThank you for completing the readiness assessment. Your score is ${score}/100 and your recommended track is ${trackLabel(track)}.\n\nBased on your profile, here's what I'd suggest as a next step:${quality === "hot" ? "\n\nBook a call to discuss your case in detail — https://meridiangtv.co.uk/apply" : "\n\nReview the evidence gaps highlighted in your report first, then book a call when you're ready."}\n\nAmit`,
  },
  onboarding: {
    id: "onboarding",
    label: "Engagement Kick-off",
    subject: (name) => `We're starting — here's what happens next`,
    body: (name) =>
      `Hi ${name},\n\nWelcome to Meridian. Here's how the engagement works:\n\n1. We start with a full evidence audit\n2. I'll map your proof points to the specific signals evaluators look for\n3. We build your narrative and recommendation strategy together\n\nTo get started, please send me:\n- Your CV\n- Any relevant publications, press, or evidence of external recognition\n- Names of 3 potential recommenders\n\nAmit`,
  },
  "document-request": {
    id: "document-request",
    label: "Document Request",
    subject: () => `A few documents I need from you`,
    body: (name) =>
      `Hi ${name},\n\nTo move forward with your case, I need the following:\n\n[ list here ]\n\nPlease send them to amit@berriesadvisory.com at your earliest convenience.\n\nAmit`,
  },
  "case-review": {
    id: "case-review",
    label: "Case Ready to Review",
    subject: () => `Your case draft is ready — let's review it`,
    body: (name) =>
      `Hi ${name},\n\nI've completed the initial review of your case. Overall I think your profile is strong.\n\nKey observations:\n\n[ add observations here ]\n\nI'd suggest we schedule a call to go through this together. Reply with your availability.\n\nAmit`,
  },
  checkin: {
    id: "checkin",
    label: "Weekly Check-in",
    subject: () => `Quick check-in`,
    body: (name) =>
      `Hi ${name},\n\nJust checking in on progress. Where are things standing with the personal statement / evidence gathering / the recommendations?\n\nLet me know if anything is blocking you.\n\nAmit`,
  },
  submitted: {
    id: "submitted",
    label: "Application Submitted",
    subject: () => `Application submitted — what to expect`,
    body: (name) =>
      `Hi ${name},\n\nGreat news — your application has been submitted. Here's what to expect:\n\n- Tech Nation typically takes 6–8 weeks to process endorsements\n- You'll receive an email update from them directly\n- If they need anything additional, they'll contact you\n\nYou did the hard work. Now we wait.\n\nAmit`,
  },
  custom: {
    id: "custom",
    label: "Custom Email",
    subject: () => ``,
    body: () => ``,
  },
}

// ── Shared UI atoms ────────────────────────────────────────────────────────────

function Badge({
  children,
  style,
}: {
  children: React.ReactNode
  style: { bg: string; color: string; border: string }
}) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-medium border"
      style={{ background: style.bg, color: style.color, borderColor: style.border }}
    >
      {children}
    </span>
  )
}

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="border-2 border-t-transparent rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        borderColor: "#7C3AED40",
        borderTopColor: "#7C3AED",
      }}
    />
  )
}

// ── Login gate ─────────────────────────────────────────────────────────────────

function LoginGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [pw, setPw] = useState("")
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === ADMIN_KEY) {
      onAuth(pw)
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => { setError(false); setShake(false) }, 2000)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#0a0018" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div
          className="rounded-2xl p-8 border"
          style={{ background: "#0f0022", borderColor: "#1e1040" }}
        >
          <div className="text-center mb-8">
            <Link href="/" className="flex flex-col items-center leading-none mb-5">
              <span
                className="text-3xl font-bold tracking-tight"
                style={{
                  background: "linear-gradient(90deg, #7C3AED, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Meridian
              </span>
              <span
                className="font-mono text-[9px] uppercase tracking-[0.15em] mt-1"
                style={{ color: "#475569" }}
              >
                Admin Console
              </span>
            </Link>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-mono uppercase tracking-widest mb-2"
                style={{ color: "#94A3B8" }}
              >
                Password
              </label>
              <motion.input
                animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.3 }}
                type="password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: "#0a0018",
                  border: `1px solid ${error ? "#EF4444" : "#1e1040"}`,
                  color: "#E2E8F0",
                }}
                placeholder="Enter admin password"
                autoFocus
              />
              {error && (
                <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>
                  Incorrect password.
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
            >
              Enter
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

// ── MODULE 1 — ACTION QUEUE ────────────────────────────────────────────────────

interface ActionQueueProps {
  leads: LeadData[]
  stageMap: Record<string, PipelineStage>
  stageTimeMap: Record<string, number>
  pendingMap: Record<string, number>
  adminKey: string
  onSelectLead: (lead: LeadData, mode?: "communicate") => void
  onRefresh: () => void
}

interface QueueItem {
  id: string
  color: string
  dot: string
  label: string
  sublabel: string
  action: string
  lead: LeadData
  mode?: "communicate"
}

function ActionQueue({
  leads,
  stageMap,
  stageTimeMap,
  pendingMap,
  onSelectLead,
}: ActionQueueProps) {
  const now = Date.now()
  const items: QueueItem[] = []

  leads.forEach(lead => {
    const stage = stageMap[lead.sessionId]
    const createdAgo = now - lead.createdAt
    const isRecent = createdAgo < 72 * 3_600_000

    // New uncontacted hot/warm leads
    if (
      (!stage || stage === "lead") &&
      (lead.leadQuality === "hot" || lead.leadQuality === "warm") &&
      isRecent
    ) {
      items.push({
        id: `new-${lead.sessionId}`,
        color: lead.leadQuality === "hot" ? "#EF4444" : "#F59E0B",
        dot: lead.leadQuality === "hot" ? "#EF4444" : "#F59E0B",
        label: `New ${lead.leadQuality} lead — ${lead.name ?? "Anonymous"}`,
        sublabel: relativeTime(lead.createdAt),
        action: "View + Contact →",
        lead,
      })
    }

    // Overdue follow-up
    if (stage === "contacted") {
      const movedAt = stageTimeMap[lead.sessionId]
      if (movedAt && now - movedAt > 7 * 86_400_000) {
        items.push({
          id: `overdue-${lead.sessionId}`,
          color: "#F59E0B",
          dot: "#F59E0B",
          label: `${lead.name ?? "Anonymous"} hasn't heard from you in 7+ days`,
          sublabel: `Last contact: ${relativeTime(movedAt)}`,
          action: "View Profile →",
          lead,
        })
      }
    }

    // Awaiting review
    if (stage === "review") {
      items.push({
        id: `review-${lead.sessionId}`,
        color: "#9F6EF5",
        dot: "#9F6EF5",
        label: `${lead.name ?? "Anonymous"}'s case is waiting for your review`,
        sublabel: stageTimeMap[lead.sessionId]
          ? `In review for ${relativeTime(stageTimeMap[lead.sessionId])}`
          : "Awaiting action",
        action: "Open →",
        lead,
      })
    }

    // Nurture due
    if (lead.nurtureEmailsSent > 0 && lead.nurtureEmailsSent < 5 && lead.lastNurtureAt) {
      const gaps = [0, 3, 7, 14, 21]
      const nextGapDays = gaps[lead.nurtureEmailsSent] ?? 14
      const nextDue = lead.lastNurtureAt + nextGapDays * 86_400_000
      if (now >= nextDue) {
        items.push({
          id: `nurture-${lead.sessionId}`,
          color: "#06B6D4",
          dot: "#06B6D4",
          label: `Email #${lead.nurtureEmailsSent + 1} ready for ${lead.name ?? lead.email ?? "Anonymous"}`,
          sublabel: `Last sent: ${relativeTime(lead.lastNurtureAt)}`,
          action: "Send →",
          lead,
          mode: "communicate",
        })
      }
    }
  })

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-8 text-center"
        style={{ borderColor: "#1e1040", background: "#0f0022" }}
      >
        <span style={{ color: "#475569" }} className="text-sm font-mono">
          ✦ No pending actions — you&apos;re all caught up
        </span>
      </div>
    )
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {items.map(item => (
        <div
          key={item.id}
          className="flex-shrink-0 rounded-xl border p-4 flex flex-col gap-3"
          style={{
            minWidth: 260,
            maxWidth: 280,
            background: "#0f0022",
            borderColor: "#1e1040",
            borderLeft: `3px solid ${item.color}`,
          }}
        >
          <div className="flex items-start gap-2.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
              style={{ background: item.dot }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: "#E2E8F0" }}>
                {item.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
                {item.sublabel}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectLead(item.lead, item.mode)}
            className="self-start text-xs px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              borderColor: item.color + "50",
              color: item.color,
              background: item.color + "10",
            }}
          >
            {item.action}
          </button>
        </div>
      ))}
    </div>
  )
}

// ── MODULE 2 — PIPELINE KANBAN ─────────────────────────────────────────────────

interface PipelineKanbanProps {
  leads: LeadData[]
  stageMap: Record<string, PipelineStage>
  adminKey: string
  onSelectLead: (lead: LeadData) => void
  onStageUpdate: () => void
}

function PipelineKanban({
  leads,
  stageMap,
  adminKey,
  onSelectLead,
  onStageUpdate,
}: PipelineKanbanProps) {
  const [moving, setMoving] = useState<string | null>(null)

  const grouped: Record<string, LeadData[]> = {}
  STAGE_ORDER.forEach(s => { grouped[s] = [] })
  grouped["lost"] = []

  leads.forEach(lead => {
    const s = stageMap[lead.sessionId] ?? "lead"
    if (grouped[s]) grouped[s].push(lead)
    else grouped["lead"].push(lead)
  })

  const columns = [
    ...STAGE_ORDER,
    "lost" as PipelineStage,
  ]

  async function moveToNext(lead: LeadData) {
    const current = stageMap[lead.sessionId] ?? "lead"
    const next = STAGE_CONFIG[current]?.next
    if (!next) return
    setMoving(lead.sessionId)
    try {
      await fetch("/api/admin/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ sessionId: lead.sessionId, stage: next }),
      })
      onStageUpdate()
    } finally {
      setMoving(null)
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4" style={{ minWidth: `${columns.length * 260}px` }}>
        {columns.map(stage => {
          const cfg = STAGE_CONFIG[stage]
          const colLeads = grouped[stage] ?? []
          return (
            <div
              key={stage}
              className="flex-shrink-0 rounded-xl border flex flex-col"
              style={{
                width: 240,
                minWidth: 240,
                background: "#0f0022",
                borderColor: "#1e1040",
              }}
            >
              {/* Column header */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-b"
                style={{ borderColor: "#1e1040" }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: cfg.color }}
                />
                <span className="text-xs font-medium" style={{ color: "#E2E8F0" }}>
                  {cfg.label}
                </span>
                <span
                  className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ background: cfg.color + "20", color: cfg.color }}
                >
                  {colLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-3 flex-1">
                {colLeads.length === 0 && (
                  <div
                    className="rounded-lg border border-dashed px-3 py-4 text-center"
                    style={{ borderColor: "#1e1040" }}
                  >
                    <span className="text-xs" style={{ color: "#475569" }}>
                      Empty
                    </span>
                  </div>
                )}
                {colLeads.map(lead => {
                  const sStyle = scoreBadgeStyle(lead.overallScore)
                  const tStyle = trackBadgeStyle(lead.recommendedTrack)
                  return (
                    <div
                      key={lead._id}
                      className="rounded-xl border p-3 cursor-pointer transition-colors"
                      style={{ background: "#0a0018", borderColor: "#1e1040" }}
                      onClick={() => onSelectLead(lead)}
                    >
                      <p className="text-sm font-medium truncate mb-1.5" style={{ color: "#E2E8F0" }}>
                        {lead.name ?? "Anonymous"}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <Badge style={sStyle}>{lead.overallScore}</Badge>
                        <Badge style={tStyle}>{tStyle.label}</Badge>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); moveToNext(lead) }}
                        disabled={!STAGE_CONFIG[stageMap[lead.sessionId] ?? "lead"]?.next || moving === lead.sessionId}
                        className="w-full text-xs py-1.5 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed mt-1"
                        style={{
                          borderColor: cfg.color + "40",
                          color: cfg.color,
                          background: cfg.color + "08",
                        }}
                      >
                        {moving === lead.sessionId ? "Moving…" : "Move forward →"}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── MODULE 3 — CLIENT DRAWER ───────────────────────────────────────────────────

interface ClientDrawerProps {
  lead: LeadData | null
  adminKey: string
  onClose: () => void
  onRefresh: () => void
  onSwitchToCommunicate: (lead: LeadData) => void
}

function ClientDrawer({
  lead,
  adminKey,
  onClose,
  onRefresh,
  onSwitchToCommunicate,
}: ClientDrawerProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [drawerTab, setDrawerTab] = useState<"profile" | "notes" | "actions" | "emails">("profile")
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [addingNote, setAddingNote] = useState(false)
  const [taskText, setTaskText] = useState("")
  const [taskDue, setTaskDue] = useState("")
  const [addingTask, setAddingTask] = useState(false)
  const [stage, setStage] = useState<PipelineStage>("lead")
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    if (!lead) return
    setDrawerTab("profile")
    setProfileData(null)
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead?.sessionId])

  async function fetchProfile() {
    if (!lead) return
    setLoadingProfile(true)
    try {
      const res = await fetch(`/api/admin/profile?sessionId=${lead.sessionId}`, {
        headers: { "x-admin-key": adminKey },
      })
      if (res.ok) {
        const data = await res.json() as ProfileData
        setProfileData(data)
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  async function addNote() {
    if (!lead || !noteText.trim()) return
    setAddingNote(true)
    try {
      await fetch("/api/admin/note", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({ sessionId: lead.sessionId, note: noteText.trim() }),
      })
      setNoteText("")
      fetchProfile()
    } finally {
      setAddingNote(false)
    }
  }

  async function addTask() {
    if (!lead || !taskText.trim()) return
    setAddingTask(true)
    try {
      await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          action: "create",
          sessionId: lead.sessionId,
          task: taskText.trim(),
          dueAt: taskDue ? new Date(taskDue).getTime() : undefined,
        }),
      })
      setTaskText("")
      setTaskDue("")
      fetchProfile()
    } finally {
      setAddingTask(false)
    }
  }

  async function completeAction(id: string) {
    await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ action: "complete", actionId: id }),
    })
    fetchProfile()
  }

  async function dismissAction(id: string) {
    await fetch("/api/admin/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ action: "dismiss", actionId: id }),
    })
    fetchProfile()
  }

  async function changeStage(newStage: PipelineStage) {
    if (!lead) return
    setStage(newStage)
    await fetch("/api/admin/stage", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
      body: JSON.stringify({ sessionId: lead.sessionId, stage: newStage }),
    })
    onRefresh()
  }

  if (!lead) return null

  const scoreStyle = scoreBadgeStyle(lead.overallScore)
  const trackStyle = trackBadgeStyle(lead.recommendedTrack)
  const qStyle     = qualityStyle(lead.leadQuality)
  const r = 35
  const size = 90
  const circ = 2 * Math.PI * r
  const offset = circ - (lead.overallScore / 100) * circ

  const subScoreMeta = [
    { key: "technicalLeadership", label: "Tech Leadership", color: "#7C3AED" },
    { key: "evidenceQuality",     label: "Evidence",        color: "#06B6D4" },
    { key: "externalRecognition", label: "Recognition",     color: "#9F6EF5" },
    { key: "independence",        label: "Independence",    color: "#F59E0B" },
    { key: "globalProfile",       label: "Global Profile",  color: "#10B981" },
  ]

  const pendingActions = (profileData?.actions ?? []).filter(a => !a.completed && !a.dismissed)
  const completedActions = (profileData?.actions ?? []).filter(a => a.completed)

  const docChecklist = lead.documentChecklist as Array<{ label: string; done: boolean }> | null
  const checkedCount = docChecklist ? docChecklist.filter(d => d.done).length : 0

  const linkedinHref = lead.linkedinUrl
    ? lead.linkedinUrl
    : `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(lead.name ?? "")}`

  const waHref = `https://wa.me/?text=${encodeURIComponent(`Hi ${lead.name ?? ""},`)}`

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-y-auto"
        style={{ width: 520, background: "#0f0022", borderLeft: "1px solid #1e1040" }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 px-6 py-5 border-b sticky top-0 z-10"
          style={{ background: "#0f0022", borderColor: "#1e1040" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold truncate" style={{ color: "#E2E8F0" }}>
              {lead.name ?? "Anonymous"}
            </p>
            {lead.email && (
              <p className="text-xs truncate mt-0.5" style={{ color: "#94A3B8" }}>
                {lead.email}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <Badge style={scoreStyle}>{lead.overallScore}</Badge>
              <Badge style={trackStyle}>{trackStyle.label}</Badge>
              <Badge style={qStyle}>{qStyle.label}</Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sm w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            style={{ color: "#94A3B8", border: "1px solid #1e1040" }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b px-6 pt-3 gap-1"
          style={{ borderColor: "#1e1040" }}
        >
          {(["profile", "notes", "actions", "emails"] as const).map(t => (
            <button
              key={t}
              onClick={() => setDrawerTab(t)}
              className="pb-3 px-3 text-xs font-medium capitalize transition-colors relative"
              style={{
                color: drawerTab === t ? "#E2E8F0" : "#475569",
                borderBottom: drawerTab === t ? "2px solid #7C3AED" : "2px solid transparent",
              }}
            >
              {t}
              {t === "actions" && profileData && pendingActions.length > 0 && (
                <span
                  className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                  style={{ background: "#7C3AED20", color: "#9F6EF5" }}
                >
                  {pendingActions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 px-6 py-5 overflow-y-auto">
          {loadingProfile && drawerTab !== "profile" && (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          )}

          {/* Profile tab */}
          {drawerTab === "profile" && (
            <div className="space-y-6">
              {/* Score ring */}
              <div className="flex items-center gap-6">
                <div style={{ width: size, height: size }} className="relative flex-shrink-0">
                  <svg width={size} height={size} className="-rotate-90" style={{ overflow: "visible" }}>
                    <defs>
                      <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={scoreStyle.color} />
                        <stop offset="100%" stopColor={scoreStyle.color + "80"} />
                      </linearGradient>
                    </defs>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e1040" strokeWidth="8" />
                    <motion.circle
                      cx={size / 2} cy={size / 2} r={r}
                      fill="none"
                      stroke="url(#score-grad)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circ}
                      initial={{ strokeDashoffset: circ }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-mono text-xl font-bold" style={{ color: scoreStyle.color }}>
                      {lead.overallScore}
                    </span>
                    <span className="text-[9px] font-mono" style={{ color: "#475569" }}>/100</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "#E2E8F0" }}>
                    {lead.readinessLevel.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
                    {trackLabel(lead.recommendedTrack)} track
                  </p>
                  <div className="mt-3">
                    <label className="text-xs font-mono uppercase tracking-widest block mb-1.5" style={{ color: "#475569" }}>
                      Stage
                    </label>
                    <select
                      value={stage}
                      onChange={e => changeStage(e.target.value as PipelineStage)}
                      className="text-xs rounded-lg px-3 py-2 outline-none"
                      style={{
                        background: "#0a0018",
                        border: "1px solid #1e1040",
                        color: "#E2E8F0",
                      }}
                    >
                      {Object.entries(STAGE_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-score bars */}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
                  Sub-scores
                </p>
                <div className="space-y-3">
                  {subScoreMeta.map(m => {
                    const val = lead.subScores?.[m.key] ?? 0
                    return (
                      <div key={m.key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs" style={{ color: "#94A3B8" }}>{m.label}</span>
                          <span className="text-xs font-mono" style={{ color: "#E2E8F0" }}>{val}</span>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: "#1e1040" }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="h-full rounded-full"
                            style={{ background: m.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI Insights */}
              {lead.insights?.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
                    AI Insights
                  </p>
                  <div className="space-y-2">
                    {lead.insights.slice(0, 4).map((ins, i) => (
                      <div
                        key={i}
                        className="flex gap-2.5 rounded-lg px-3 py-2.5"
                        style={{ background: "#06B6D408", border: "1px solid #06B6D420" }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: "#06B6D4" }}
                        />
                        <p className="text-xs leading-relaxed" style={{ color: "#94A3B8" }}>
                          {ins}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document checklist */}
              {docChecklist && docChecklist.length > 0 && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "#475569" }}>
                    Documents — {checkedCount}/{docChecklist.length} completed
                  </p>
                  <div className="space-y-1.5">
                    {docChecklist.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 text-[9px]"
                          style={{
                            background: doc.done ? "#10B98120" : "#1e1040",
                            border: `1px solid ${doc.done ? "#10B98140" : "#1e1040"}`,
                            color: doc.done ? "#10B981" : "#475569",
                          }}
                        >
                          {doc.done ? "✓" : ""}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: doc.done ? "#10B981" : "#94A3B8" }}
                        >
                          {doc.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes tab */}
          {drawerTab === "notes" && (
            <div className="space-y-4">
              <div>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                  placeholder="Add a note about this client…"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{
                    background: "#0a0018",
                    border: "1px solid #1e1040",
                    color: "#E2E8F0",
                  }}
                />
                <button
                  onClick={addNote}
                  disabled={addingNote || !noteText.trim()}
                  className="mt-2 px-4 py-2 rounded-lg text-xs font-medium text-white transition-opacity disabled:opacity-40"
                  style={{ background: "#7C3AED" }}
                >
                  {addingNote ? "Adding…" : "Add Note"}
                </button>
              </div>

              <div className="space-y-2">
                {(profileData?.notes ?? []).length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: "#475569" }}>
                    No notes yet.
                  </p>
                )}
                {(profileData?.notes ?? []).map(note => (
                  <div
                    key={note._id}
                    className="rounded-xl px-4 py-3"
                    style={{ background: "#0a0018", border: "1px solid #1e1040" }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: "#E2E8F0" }}>
                      {note.note}
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: "#475569" }}>
                      {relativeTime(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions tab */}
          {drawerTab === "actions" && (
            <div className="space-y-5">
              {/* Add task */}
              <div
                className="rounded-xl p-4"
                style={{ background: "#0a0018", border: "1px solid #1e1040" }}
              >
                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
                  Add task
                </p>
                <input
                  value={taskText}
                  onChange={e => setTaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTask() }}
                  placeholder="Task description…"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-2"
                  style={{ background: "#0f0022", border: "1px solid #1e1040", color: "#E2E8F0" }}
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={taskDue}
                    onChange={e => setTaskDue(e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: "#0f0022", border: "1px solid #1e1040", color: "#94A3B8" }}
                  />
                  <button
                    onClick={addTask}
                    disabled={addingTask || !taskText.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-medium text-white disabled:opacity-40"
                    style={{ background: "#7C3AED" }}
                  >
                    {addingTask ? "Adding…" : "Add"}
                  </button>
                </div>
              </div>

              {/* Pending tasks */}
              <div className="space-y-2">
                {pendingActions.length === 0 && (
                  <p className="text-xs text-center py-3" style={{ color: "#475569" }}>
                    No pending tasks.
                  </p>
                )}
                {pendingActions.map(action => {
                  const isOverdue = action.dueAt && action.dueAt < Date.now()
                  return (
                    <div
                      key={action._id}
                      className="flex items-start gap-3 rounded-xl px-4 py-3"
                      style={{
                        background: "#0a0018",
                        border: `1px solid ${isOverdue ? "#EF444430" : "#1e1040"}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        onChange={() => completeAction(action._id)}
                        className="mt-0.5 cursor-pointer"
                        style={{ accentColor: "#7C3AED" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ color: "#E2E8F0" }}>
                          {action.task}
                        </p>
                        {action.dueAt && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: isOverdue ? "#EF4444" : "#475569" }}
                          >
                            {isOverdue ? "Overdue — " : "Due: "}
                            {new Date(action.dueAt).toLocaleDateString("en-GB")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => dismissAction(action._id)}
                        className="text-xs flex-shrink-0"
                        style={{ color: "#475569" }}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Completed (collapsible) */}
              {completedActions.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowCompleted(v => !v)}
                    className="text-xs flex items-center gap-1 mb-2"
                    style={{ color: "#475569" }}
                  >
                    {showCompleted ? "▼" : "▶"} {completedActions.length} completed
                  </button>
                  {showCompleted && (
                    <div className="space-y-1.5 opacity-50">
                      {completedActions.map(action => (
                        <div
                          key={action._id}
                          className="flex items-center gap-3 rounded-lg px-4 py-2.5"
                          style={{ background: "#0a0018", border: "1px solid #1e1040" }}
                        >
                          <span style={{ color: "#10B981" }}>✓</span>
                          <p className="text-xs line-through" style={{ color: "#475569" }}>
                            {action.task}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Emails tab */}
          {drawerTab === "emails" && (
            <div className="space-y-4">
              <button
                onClick={() => onSwitchToCommunicate(lead)}
                className="w-full py-3 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
              >
                Compose email to {lead.name ?? "this person"} →
              </button>

              <div className="space-y-2">
                {(profileData?.emails ?? []).length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: "#475569" }}>
                    No emails sent yet.
                  </p>
                )}
                {(profileData?.emails ?? []).map(email => (
                  <div
                    key={email._id}
                    className="rounded-xl px-4 py-3"
                    style={{ background: "#0a0018", border: "1px solid #1e1040" }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium" style={{ color: "#E2E8F0" }}>
                        {email.subject}
                      </p>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
                        style={{ background: "#7C3AED20", color: "#9F6EF5" }}
                      >
                        {email.template}
                      </span>
                    </div>
                    <p className="text-xs truncate mb-1" style={{ color: "#94A3B8" }}>
                      {email.bodyPreview}
                    </p>
                    <p className="text-xs" style={{ color: "#475569" }}>
                      {relativeTime(email.sentAt)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick links footer */}
        <div
          className="px-6 py-4 border-t flex items-center gap-3"
          style={{ borderColor: "#1e1040", background: "#0a0018" }}
        >
          <a
            href={linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors"
            style={{ borderColor: "#0A66C230", color: "#0A66C2", background: "#0A66C210" }}
          >
            <span className="font-bold">in</span> LinkedIn
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors"
            style={{ borderColor: "#25D36630", color: "#25D366", background: "#25D36610" }}
          >
            W WhatsApp
          </a>
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors"
              style={{ borderColor: "#1e1040", color: "#94A3B8", background: "#1e104020" }}
            >
              ✉ Email
            </a>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ── MODULE 4 — LEADS TAB ───────────────────────────────────────────────────────

interface LeadsTabProps {
  leads: LeadData[]
  stats: Stats | null
  stageMap: Record<string, PipelineStage>
  pendingMap: Record<string, number>
  adminKey: string
  onSelectLead: (lead: LeadData) => void
}

function LeadsTab({
  leads,
  stats,
  stageMap,
  pendingMap,
  onSelectLead,
}: LeadsTabProps) {
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all")
  const [sortKey, setSortKey] = useState<"score" | "date">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const filtered = leads
    .filter(l => filter === "all" || l.leadQuality === filter)
    .sort((a, b) => {
      const aVal = sortKey === "score" ? a.overallScore : a.createdAt
      const bVal = sortKey === "score" ? b.overallScore : b.createdAt
      return sortDir === "desc" ? bVal - aVal : aVal - bVal
    })

  const toggleSort = (key: "score" | "date") => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc")
    else { setSortKey(key); setSortDir("desc") }
  }

  const statCards = [
    { label: "Total", value: stats?.total ?? 0, color: "#7C3AED" },
    { label: "Hot leads", value: stats?.hotLeads ?? 0, color: "#EF4444" },
    { label: "Avg score", value: stats?.avgScore ? `${stats.avgScore}/100` : "—", color: "#06B6D4" },
    { label: "This week", value: stats?.thisWeek ?? 0, color: "#F59E0B" },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div
            key={s.label}
            className="rounded-xl p-5"
            style={{
              background: "#0f0022",
              border: "1px solid #1e1040",
              borderTop: `3px solid ${s.color}`,
            }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-1.5" style={{ color: "#475569" }}>
              {s.label}
            </p>
            <p className="text-2xl font-mono font-bold" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden border"
        style={{ background: "#0f0022", borderColor: "#1e1040" }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#1e1040" }}
        >
          <span className="text-sm font-medium" style={{ color: "#E2E8F0" }}>
            All Assessments{" "}
            <span className="font-mono" style={{ color: "#475569" }}>
              ({filtered.length})
            </span>
          </span>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {(["all", "hot", "warm", "cold"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors"
                  style={{
                    background: filter === f ? "#7C3AED" : "transparent",
                    color: filter === f ? "#fff" : "#475569",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => exportCSV(leads)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors"
              style={{ borderColor: "#1e1040", color: "#94A3B8" }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              CSV
            </button>
          </div>
        </div>

        {/* Table head */}
        <div
          className="grid px-6 py-3 border-b text-xs font-mono uppercase tracking-widest"
          style={{
            gridTemplateColumns: "2fr 80px 70px 70px 80px 80px 100px",
            borderColor: "#1e1040",
            background: "#0a0018",
            color: "#475569",
          }}
        >
          <div>Name / Email</div>
          <button
            onClick={() => toggleSort("score")}
            className="text-left flex items-center gap-1 hover:text-platinum transition-colors"
            style={{ color: "#475569" }}
          >
            Score <span>{sortKey === "score" ? (sortDir === "desc" ? "▼" : "▲") : "⇅"}</span>
          </button>
          <div>Track</div>
          <div>Quality</div>
          <div>Stage</div>
          <div>Pending</div>
          <button
            onClick={() => toggleSort("date")}
            className="text-left flex items-center gap-1 hover:text-platinum transition-colors"
            style={{ color: "#475569" }}
          >
            Date <span>{sortKey === "date" ? (sortDir === "desc" ? "▼" : "▲") : "⇅"}</span>
          </button>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: "#1e1040" }}>
          {filtered.length === 0 && (
            <div className="px-6 py-10 text-center text-sm" style={{ color: "#475569" }}>
              No assessments found.
            </div>
          )}
          {filtered.map(lead => {
            const sStyle = scoreBadgeStyle(lead.overallScore)
            const tStyle = trackBadgeStyle(lead.recommendedTrack)
            const qStyle = qualityStyle(lead.leadQuality)
            const stg    = stageMap[lead.sessionId]
            const stgCfg = stg ? STAGE_CONFIG[stg] : null
            const pending = pendingMap[lead.sessionId] ?? 0

            return (
              <button
                key={lead._id}
                onClick={() => onSelectLead(lead)}
                className="w-full grid px-6 py-4 text-left transition-colors hover:bg-white/2"
                style={{ gridTemplateColumns: "2fr 80px 70px 70px 80px 80px 100px" }}
              >
                <div className="min-w-0 pr-4">
                  <p className="text-sm font-medium truncate" style={{ color: "#E2E8F0" }}>
                    {lead.name ?? "Anonymous"}
                  </p>
                  {lead.email && (
                    <p className="text-xs truncate" style={{ color: "#475569" }}>
                      {lead.email}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <Badge style={sStyle}>{lead.overallScore}</Badge>
                </div>
                <div className="flex items-center">
                  <Badge style={tStyle}>{tStyle.label}</Badge>
                </div>
                <div className="flex items-center">
                  <Badge style={qStyle}>{qStyle.label}</Badge>
                </div>
                <div className="flex items-center">
                  {stgCfg ? (
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ background: stgCfg.color + "20", color: stgCfg.color }}
                    >
                      {stgCfg.label}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "#475569" }}>—</span>
                  )}
                </div>
                <div className="flex items-center">
                  {pending > 0 ? (
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: "#9F6EF520", color: "#9F6EF5" }}
                    >
                      {pending}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: "#475569" }}>—</span>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-xs" style={{ color: "#475569" }}>
                    {relativeTime(lead.createdAt)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── MODULE 5 — COMMUNICATE TAB ─────────────────────────────────────────────────

interface CommunicateTabProps {
  leads: LeadData[]
  adminKey: string
  preselectedLead?: LeadData | null
  onEmailSent: () => void
}

function CommunicateTab({
  leads,
  adminKey,
  preselectedLead,
  onEmailSent,
}: CommunicateTabProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("welcome")
  const [selectedLeadId, setSelectedLeadId] = useState<string>(preselectedLead?.sessionId ?? "")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [preview, setPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [leadSearch, setLeadSearch] = useState("")

  const selectedLead = leads.find(l => l.sessionId === selectedLeadId) ?? preselectedLead ?? null

  // Update body/subject when template or lead changes
  useEffect(() => {
    const tpl = TEMPLATES[selectedTemplate]
    if (!tpl) return
    const name  = selectedLead?.name ?? "there"
    const score = selectedLead?.overallScore ?? 0
    const track = selectedLead?.recommendedTrack ?? ""
    const qual  = selectedLead?.leadQuality ?? ""
    setSubject(tpl.subject(name, score, track))
    setBody(tpl.body(name, score, track, qual))
  }, [selectedTemplate, selectedLeadId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (preselectedLead) setSelectedLeadId(preselectedLead.sessionId)
  }, [preselectedLead])

  async function send() {
    if (!selectedLead || !subject.trim() || !body.trim()) return
    setSending(true)
    try {
      const htmlBody = generateHtml(selectedTemplate, body, selectedLead.name ?? "")
      await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          to: selectedLead.email ?? "",
          toName: selectedLead.name ?? "",
          subject,
          htmlBody,
          template: selectedTemplate,
          sessionId: selectedLead.sessionId,
        }),
      })
      setSent(true)
      setTimeout(() => {
        setSent(false)
        setSubject("")
        setBody("")
        onEmailSent()
      }, 2500)
    } finally {
      setSending(false)
    }
  }

  const filteredLeads = leads.filter(l =>
    l.email &&
    (leadSearch === "" ||
      (l.name ?? "").toLowerCase().includes(leadSearch.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(leadSearch.toLowerCase()))
  )

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ background: "#0f0022", borderColor: "#1e1040" }}
    >
      <div className="flex divide-x" style={{ borderColor: "#1e1040" }}>
        {/* Left: template picker */}
        <div
          className="flex-shrink-0 flex flex-col border-r"
          style={{ width: 200, borderColor: "#1e1040" }}
        >
          <div
            className="px-4 py-3 border-b"
            style={{ borderColor: "#1e1040" }}
          >
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "#475569" }}>
              Template
            </p>
          </div>
          {Object.values(TEMPLATES).map(tpl => (
            <button
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl.id)}
              className="text-left px-4 py-3 text-xs transition-colors border-l-2"
              style={{
                color: selectedTemplate === tpl.id ? "#E2E8F0" : "#475569",
                background: selectedTemplate === tpl.id ? "#7C3AED10" : "transparent",
                borderLeftColor: selectedTemplate === tpl.id ? "#7C3AED" : "transparent",
              }}
            >
              {tpl.label}
            </button>
          ))}
        </div>

        {/* Right: compose */}
        <div className="flex-1 p-6 flex flex-col gap-4 min-w-0">
          {/* To field */}
          <div>
            <label className="text-xs font-mono uppercase tracking-widest block mb-1.5" style={{ color: "#475569" }}>
              To
            </label>
            <input
              value={leadSearch}
              onChange={e => setLeadSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-lg px-3 py-2 text-sm outline-none mb-1.5"
              style={{ background: "#0a0018", border: "1px solid #1e1040", color: "#E2E8F0" }}
            />
            {leadSearch && (
              <div
                className="rounded-lg border overflow-hidden max-h-40 overflow-y-auto"
                style={{ borderColor: "#1e1040", background: "#0a0018" }}
              >
                {filteredLeads.slice(0, 8).map(l => (
                  <button
                    key={l.sessionId}
                    onClick={() => {
                      setSelectedLeadId(l.sessionId)
                      setLeadSearch("")
                    }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors hover:bg-white/5"
                    style={{ color: "#E2E8F0" }}
                  >
                    <span>{l.name ?? "Anonymous"}</span>
                    <span className="ml-2" style={{ color: "#475569" }}>{l.email}</span>
                  </button>
                ))}
                {filteredLeads.length === 0 && (
                  <p className="px-3 py-2 text-xs" style={{ color: "#475569" }}>No leads found.</p>
                )}
              </div>
            )}
            {selectedLead && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: "#7C3AED10", border: "1px solid #7C3AED30" }}
              >
                <span className="text-xs" style={{ color: "#E2E8F0" }}>
                  {selectedLead.name ?? "Anonymous"}
                </span>
                <span className="text-xs" style={{ color: "#475569" }}>
                  {selectedLead.email}
                </span>
                <button
                  onClick={() => { setSelectedLeadId(""); setLeadSearch("") }}
                  className="ml-auto text-xs"
                  style={{ color: "#475569" }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-mono uppercase tracking-widest block mb-1.5" style={{ color: "#475569" }}>
              Subject
            </label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              style={{ background: "#0a0018", border: "1px solid #1e1040", color: "#E2E8F0" }}
            />
          </div>

          {/* Body + preview toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase tracking-widest" style={{ color: "#475569" }}>
                Body
              </label>
              <div className="flex gap-1">
                {["Edit", "Preview"].map(m => (
                  <button
                    key={m}
                    onClick={() => setPreview(m === "Preview")}
                    className="text-xs px-2.5 py-1 rounded-md transition-colors"
                    style={{
                      background: (preview ? m === "Preview" : m === "Edit") ? "#7C3AED20" : "transparent",
                      color: (preview ? m === "Preview" : m === "Edit") ? "#9F6EF5" : "#475569",
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {preview ? (
              <div
                className="rounded-xl p-4 min-h-[200px] text-sm leading-relaxed"
                style={{ background: "#0a0018", border: "1px solid #1e1040", color: "#94A3B8" }}
                dangerouslySetInnerHTML={{
                  __html: body.replace(/\n/g, "<br/>"),
                }}
              />
            ) : (
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={10}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ background: "#0a0018", border: "1px solid #1e1040", color: "#E2E8F0" }}
              />
            )}
          </div>

          {/* Send */}
          <div className="flex items-center gap-3">
            <button
              onClick={send}
              disabled={sending || sent || !selectedLead || !subject.trim() || !body.trim()}
              className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40 flex items-center gap-2"
              style={{ background: sent ? "#10B981" : "linear-gradient(135deg, #7C3AED, #06B6D4)" }}
            >
              {sending ? <><Spinner size={14} /> Sending…</> : sent ? "✦ Sent" : "Send Email →"}
            </button>
            {!selectedLead && (
              <p className="text-xs" style={{ color: "#EF4444" }}>Select a recipient first.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MODULE 6 — NURTURE TAB ─────────────────────────────────────────────────────

interface NurtureTabProps {
  leads: LeadData[]
  adminKey: string
  onRefresh: () => void
}

function NurtureTab({ leads, adminKey, onRefresh }: NurtureTabProps) {
  const [sending, setSending] = useState<string | null>(null)
  const [skipping, setSkipping] = useState<string | null>(null)

  const capturedLeads = leads.filter(l => l.leadCaptured)
  const total     = capturedLeads.length
  const completed = capturedLeads.filter(l => l.nurtureEmailsSent >= 5).length
  const active    = capturedLeads.filter(l => l.nurtureEmailsSent > 0 && l.nurtureEmailsSent < 5).length

  // Gap days per email in sequence (before this email is sent)
  const gapDays = [0, 3, 7, 14, 21]

  function nextDueTs(lead: LeadData): number | null {
    if (!lead.lastNurtureAt) return null
    const gap = gapDays[lead.nurtureEmailsSent] ?? 14
    return lead.lastNurtureAt + gap * 86_400_000
  }

  async function sendNurture(lead: LeadData) {
    setSending(lead.sessionId)
    const n = lead.nurtureEmailsSent + 1
    const body = `Hi ${lead.name ?? ""},\n\nThis is a follow-up from Meridian regarding your Global Talent Visa readiness.\n\nI wanted to check in and see if you have any questions after reviewing your assessment (Email #${n} of 5).\n\nAmit`
    try {
      await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          to: lead.email ?? "",
          toName: lead.name ?? "",
          subject: `Following up on your readiness assessment (${n}/5)`,
          htmlBody: generateHtml("nurture", body, lead.name ?? ""),
          template: `nurture-${n}`,
          sessionId: lead.sessionId,
        }),
      })
      onRefresh()
    } finally {
      setSending(null)
    }
  }

  async function skipNurture(lead: LeadData) {
    setSkipping(lead.sessionId)
    try {
      await fetch("/api/admin/note", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify({
          sessionId: lead.sessionId,
          note: `Nurture email #${lead.nurtureEmailsSent + 1} skipped on ${new Date().toLocaleDateString("en-GB")}`,
        }),
      })
      onRefresh()
    } finally {
      setSkipping(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Total in sequence", value: total, color: "#7C3AED" },
          { label: "Completed (5/5)", value: completed, color: "#10B981" },
          { label: "Active", value: active, color: "#06B6D4" },
        ].map(s => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl px-5 py-3 border"
            style={{ background: "#0f0022", borderColor: "#1e1040" }}
          >
            <span className="text-xl font-mono font-bold" style={{ color: s.color }}>
              {s.value}
            </span>
            <span className="text-xs" style={{ color: "#94A3B8" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0f0022", borderColor: "#1e1040" }}
      >
        {/* Head */}
        <div
          className="grid px-6 py-3 border-b text-xs font-mono uppercase tracking-widest"
          style={{
            gridTemplateColumns: "2fr 80px 80px 120px 120px 140px",
            borderColor: "#1e1040",
            background: "#0a0018",
            color: "#475569",
          }}
        >
          <div>Name / Email</div>
          <div>Quality</div>
          <div>Email #</div>
          <div>Last sent</div>
          <div>Next due</div>
          <div>Actions</div>
        </div>

        {/* Rows */}
        <div className="divide-y" style={{ borderColor: "#1e1040" }}>
          {capturedLeads.length === 0 && (
            <div className="px-6 py-10 text-center text-sm" style={{ color: "#475569" }}>
              No leads in nurture sequence.
            </div>
          )}
          {capturedLeads.map(lead => {
            const qStyle = qualityStyle(lead.leadQuality)
            const nextDue = nextDueTs(lead)
            const isDue = nextDue ? Date.now() >= nextDue : !lead.lastNurtureAt
            const isComplete = lead.nurtureEmailsSent >= 5

            return (
              <div
                key={lead._id}
                className="grid px-6 py-4 items-center"
                style={{ gridTemplateColumns: "2fr 80px 80px 120px 120px 140px" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "#E2E8F0" }}>
                    {lead.name ?? "Anonymous"}
                  </p>
                  {lead.email && (
                    <p className="text-xs" style={{ color: "#475569" }}>{lead.email}</p>
                  )}
                </div>
                <div>
                  <Badge style={qStyle}>{qStyle.label}</Badge>
                </div>
                <div>
                  {isComplete ? (
                    <span className="text-xs font-medium" style={{ color: "#10B981" }}>✓ Complete</span>
                  ) : (
                    <span className="text-xs font-mono" style={{ color: "#E2E8F0" }}>
                      {lead.nurtureEmailsSent}/5
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-xs" style={{ color: "#94A3B8" }}>
                    {lead.lastNurtureAt ? relativeTime(lead.lastNurtureAt) : "Not started"}
                  </span>
                </div>
                <div>
                  <span
                    className="text-xs"
                    style={{ color: isDue && !isComplete ? "#EF4444" : "#94A3B8" }}
                  >
                    {isComplete
                      ? "—"
                      : nextDue
                        ? (Date.now() >= nextDue ? "Due now" : new Date(nextDue).toLocaleDateString("en-GB"))
                        : "Now"}
                  </span>
                </div>
                <div className="flex gap-2">
                  {!isComplete && (
                    <>
                      <button
                        onClick={() => sendNurture(lead)}
                        disabled={sending === lead.sessionId}
                        className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                        style={{
                          borderColor: "#06B6D430",
                          color: "#06B6D4",
                          background: "#06B6D410",
                        }}
                      >
                        {sending === lead.sessionId ? "…" : "Send"}
                      </button>
                      <button
                        onClick={() => skipNurture(lead)}
                        disabled={skipping === lead.sessionId}
                        className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                        style={{ borderColor: "#1e1040", color: "#475569" }}
                      >
                        {skipping === lead.sessionId ? "…" : "Skip"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── MODULE 7 — COPILOT PANEL ───────────────────────────────────────────────────

const QUICK_CHIPS = [
  "What needs my attention today?",
  "Who are the hottest leads right now?",
  "Draft a welcome email for my newest lead",
  "Who hasn't heard from me in 5+ days?",
  "ET vs EP split this month",
  "What's blocking active clients?",
  "Summarize this week's activity",
  "Which leads are ready to apply?",
]

interface CopilotPanelProps {
  open: boolean
  onClose: () => void
  leads: LeadData[]
  stats: Stats | null
  stageMap: Record<string, PipelineStage>
  adminKey: string
}

function CopilotPanel({
  open,
  onClose,
  leads,
  stats,
  stageMap,
  adminKey,
}: CopilotPanelProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      role: "assistant",
      content: "Hi Amit — I have access to your lead data and pipeline. What would you like to know or do?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const send = useCallback(
    async (userMsg: string) => {
      if (!userMsg.trim() || loading) return
      const newMessages: CopilotMessage[] = [...messages, { role: "user", content: userMsg }]
      setMessages([...newMessages, { role: "assistant", content: "" }])
      setInput("")
      setLoading(true)

      const leadsContext = JSON.stringify({
        stats,
        topLeads: leads.slice(0, 15).map(l => ({
          name: l.name,
          email: l.email,
          score: l.overallScore,
          quality: l.leadQuality,
          track: l.recommendedTrack,
          createdAt: l.createdAt,
        })),
        pipeline: `${Object.keys(stageMap).length} clients in pipeline`,
        hotCount: leads.filter(l => l.leadQuality === "hot").length,
      })

      try {
        const res = await fetch("/api/admin/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
          body: JSON.stringify({ messages: newMessages, leadsContext }),
        })

        const reader = res.body?.getReader()
        if (!reader) { setLoading(false); return }
        const decoder = new TextDecoder()
        let full = ""
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          full += decoder.decode(value)
          setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: full }])
        }
      } catch (err) {
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: "assistant", content: `Error: ${String(err)}` },
        ])
      } finally {
        setLoading(false)
      }
    },
    [messages, loading, adminKey, stats, leads, stageMap]
  )

  const unreadCount = messages.filter(m => m.role === "assistant").length - 1

  return (
    <>
      {/* Toggle button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="copilot-toggle"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => {}} // handled by parent
            className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-white shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #06B6D4)",
              boxShadow: "0 0 30px rgba(124,58,237,0.4)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            ✦ Copilot
            {unreadCount > 0 && (
              <span
                className="text-[10px] font-mono px-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.25)" }}
              >
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="copilot-panel"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-30 flex flex-col rounded-2xl overflow-hidden border shadow-2xl"
            style={{
              width: 400,
              maxHeight: 600,
              background: "#0f0022",
              borderColor: "#1e1040",
              boxShadow: "0 0 40px rgba(124,58,237,0.25)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2.5 px-5 py-4 border-b flex-shrink-0"
              style={{ borderColor: "#1e1040" }}
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#7C3AED" }} />
              <span className="text-sm font-medium" style={{ color: "#E2E8F0" }}>
                Meridian Copilot
              </span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{ background: "#7C3AED10", color: "#9F6EF5", borderColor: "#7C3AED30" }}
              >
                AI
              </span>
              <button
                onClick={onClose}
                className="ml-auto text-xs"
                style={{ color: "#475569" }}
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
              style={{ minHeight: 0 }}
            >
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[86%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={
                      m.role === "user"
                        ? { background: "#7C3AED", color: "#fff", borderRadius: "18px 18px 4px 18px" }
                        : {
                            background: "#0a0018",
                            border: "1px solid #1e1040",
                            color: "#94A3B8",
                            borderRadius: "18px 18px 18px 4px",
                          }
                    }
                  >
                    {m.content || (
                      <span className="flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick chips */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => send(chip)}
                  disabled={loading}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors"
                  style={{ borderColor: "#1e1040", color: "#475569", background: "#0a0018" }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input */}
            <div
              className="p-4 border-t flex gap-2 flex-shrink-0"
              style={{ borderColor: "#1e1040" }}
            >
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                placeholder="Ask about your leads…"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "#0a0018", border: "1px solid #1e1040", color: "#E2E8F0" }}
                disabled={loading}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white flex-shrink-0 disabled:opacity-40"
                style={{ background: "#7C3AED" }}
              >
                →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── OVERVIEW TAB ───────────────────────────────────────────────────────────────

interface OverviewTabProps {
  leads: LeadData[]
  stats: Stats | null
  stageMap: Record<string, PipelineStage>
  stageTimeMap: Record<string, number>
  pendingMap: Record<string, number>
  adminKey: string
  onSelectLead: (lead: LeadData, mode?: "communicate") => void
  onStageUpdate: () => void
  onRefresh: () => void
}

function OverviewTab({
  leads,
  stats,
  stageMap,
  stageTimeMap,
  pendingMap,
  adminKey,
  onSelectLead,
  onStageUpdate,
  onRefresh,
}: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats?.total ?? 0, color: "#7C3AED" },
          { label: "Hot leads", value: stats?.hotLeads ?? 0, color: "#EF4444" },
          { label: "Warm leads", value: stats?.warmLeads ?? 0, color: "#F59E0B" },
          { label: "Avg score", value: stats?.avgScore ? `${stats.avgScore}` : "—", suffix: "/100", color: "#06B6D4" },
          { label: "This week", value: stats?.thisWeek ?? 0, color: "#10B981" },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-xl p-5"
            style={{
              background: "#0f0022",
              border: "1px solid #1e1040",
              borderTop: `3px solid ${s.color}`,
            }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-1.5" style={{ color: "#475569" }}>
              {s.label}
            </p>
            <p className="text-2xl font-mono font-bold" style={{ color: s.color }}>
              {s.value}
              {s.suffix && <span className="text-sm" style={{ color: "#475569" }}>{s.suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Action queue */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
          Action queue
        </p>
        <ActionQueue
          leads={leads}
          stageMap={stageMap}
          stageTimeMap={stageTimeMap}
          pendingMap={pendingMap}
          adminKey={adminKey}
          onSelectLead={onSelectLead}
          onRefresh={onRefresh}
        />
      </div>

      {/* Kanban */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
          Pipeline
        </p>
        <PipelineKanban
          leads={leads}
          stageMap={stageMap}
          adminKey={adminKey}
          onSelectLead={onSelectLead}
          onStageUpdate={onStageUpdate}
        />
      </div>
    </div>
  )
}

// ── SKELETON LOADER ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5 animate-pulse"
      style={{ background: "#0f0022", border: "1px solid #1e1040" }}
    >
      <div className="h-3 rounded mb-3" style={{ background: "#1e1040", width: "60%" }} />
      <div className="h-7 rounded" style={{ background: "#1e1040", width: "40%" }} />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div
      className="flex gap-4 px-6 py-4 animate-pulse"
      style={{ borderBottom: "1px solid #1e1040" }}
    >
      <div className="flex-1">
        <div className="h-3 rounded mb-2" style={{ background: "#1e1040", width: "50%" }} />
        <div className="h-2.5 rounded" style={{ background: "#1e1040", width: "70%" }} />
      </div>
      <div className="h-3 rounded w-12" style={{ background: "#1e1040" }} />
      <div className="h-3 rounded w-10" style={{ background: "#1e1040" }} />
      <div className="h-3 rounded w-14" style={{ background: "#1e1040" }} />
    </div>
  )
}

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────

function Dashboard({ adminKey }: { adminKey: string }) {
  const [leads, setLeads]       = useState<LeadData[]>([])
  const [stats, setStats]       = useState<Stats | null>(null)
  const [stageMap, setStageMap] = useState<Record<string, PipelineStage>>({})
  const [stageTimeMap, setStageTimeMap] = useState<Record<string, number>>({})
  const [pendingMap, setPendingMap] = useState<Record<string, number>>({})
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "communicate" | "nurture">("overview")
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null)
  const [communicateLead, setCommunicateLead] = useState<LeadData | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data", {
        headers: { "x-admin-key": adminKey },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json() as {
        stats: Stats
        leads: LeadData[]
        stageData: Array<{ sessionId: string; stage: string; movedAt: number }>
        pendingActionCounts: Array<{ sessionId: string; pending: number }>
      }
      setStats(data.stats)
      setLeads(data.leads)
      const sm: Record<string, PipelineStage> = {}
      const stm: Record<string, number> = {}
      ;(data.stageData ?? []).forEach(s => {
        sm[s.sessionId] = s.stage as PipelineStage
        stm[s.sessionId] = s.movedAt
      })
      setStageMap(sm)
      setStageTimeMap(stm)
      const pm: Record<string, number> = {}
      ;(data.pendingActionCounts ?? []).forEach(p => {
        pm[p.sessionId] = p.pending
      })
      setPendingMap(pm)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function handleSelectLead(lead: LeadData, mode?: "communicate") {
    if (mode === "communicate") {
      setCommunicateLead(lead)
      setActiveTab("communicate")
    } else {
      setSelectedLead(lead)
    }
  }

  if (loading) {
    return (
      <div style={{ background: "#0a0018", minHeight: "100vh" }}>
        {/* Header skeleton */}
        <div
          className="border-b px-6 py-4"
          style={{ background: "#0a0018", borderColor: "#1e1040" }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="h-5 rounded w-28 animate-pulse" style={{ background: "#1e1040" }} />
            <div className="h-8 rounded-xl w-40 animate-pulse" style={{ background: "#1e1040" }} />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "#0f0022", borderColor: "#1e1040" }}
          >
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0a0018" }}
      >
        <div
          className="rounded-2xl p-8 max-w-sm text-center border"
          style={{ background: "#0f0022", borderColor: "#EF444430" }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: "#EF4444" }}>
            Failed to load data
          </p>
          <p className="text-xs mb-5" style={{ color: "#94A3B8" }}>{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: "#7C3AED" }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "overview",   label: "Overview" },
    { id: "leads",      label: "Leads" },
    { id: "communicate",label: "Communicate" },
    { id: "nurture",    label: "Nurture" },
  ] as const

  return (
    <div style={{ background: "#0a0018", minHeight: "100vh" }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-20 border-b px-6"
        style={{ background: "#0a0018", borderColor: "#1e1040" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          {/* Logo + tabs */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex flex-col leading-none flex-shrink-0">
              <span
                className="text-base font-bold leading-none"
                style={{
                  background: "linear-gradient(90deg, #7C3AED, #06B6D4)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Meridian
              </span>
              <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: "#475569" }}>
                Admin
              </span>
            </Link>

            <div className="flex items-center">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-4 text-xs font-medium transition-colors relative"
                  style={{
                    color: activeTab === tab.id ? "#E2E8F0" : "#475569",
                    borderBottom: activeTab === tab.id ? "2px solid #7C3AED" : "2px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors"
              style={{ borderColor: "#1e1040", color: "#94A3B8" }}
              title="Refresh data"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              Refresh
            </button>
            <button
              onClick={() => setCopilotOpen(o => !o)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: copilotOpen ? "#7C3AED" : "transparent",
                color: copilotOpen ? "#fff" : "#94A3B8",
                border: copilotOpen ? "1px solid #7C3AED" : "1px solid #1e1040",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              ✦ Copilot
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <OverviewTab
            leads={leads}
            stats={stats}
            stageMap={stageMap}
            stageTimeMap={stageTimeMap}
            pendingMap={pendingMap}
            adminKey={adminKey}
            onSelectLead={handleSelectLead}
            onStageUpdate={fetchData}
            onRefresh={fetchData}
          />
        )}

        {activeTab === "leads" && (
          <LeadsTab
            leads={leads}
            stats={stats}
            stageMap={stageMap}
            pendingMap={pendingMap}
            adminKey={adminKey}
            onSelectLead={handleSelectLead}
          />
        )}

        {activeTab === "communicate" && (
          <CommunicateTab
            leads={leads}
            adminKey={adminKey}
            preselectedLead={communicateLead}
            onEmailSent={fetchData}
          />
        )}

        {activeTab === "nurture" && (
          <NurtureTab
            leads={leads}
            adminKey={adminKey}
            onRefresh={fetchData}
          />
        )}
      </div>

      {/* Client drawer */}
      <AnimatePresence>
        {selectedLead && (
          <ClientDrawer
            key={selectedLead.sessionId}
            lead={selectedLead}
            adminKey={adminKey}
            onClose={() => setSelectedLead(null)}
            onRefresh={fetchData}
            onSwitchToCommunicate={(lead) => {
              setCommunicateLead(lead)
              setActiveTab("communicate")
              setSelectedLead(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Copilot */}
      <CopilotPanel
        open={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        leads={leads}
        stats={stats}
        stageMap={stageMap}
        adminKey={adminKey}
      />
    </div>
  )
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed]     = useState(false)
  const [adminKey, setAdminKey] = useState("")

  const handleAuth = (pw: string) => {
    setAdminKey(pw)
    setAuthed(true)
  }

  if (!authed) return <LoginGate onAuth={handleAuth} />
  return <Dashboard adminKey={adminKey} />
}
