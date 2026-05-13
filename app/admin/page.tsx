"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeadData {
  _id: string
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
  answers: Record<string, string>
  createdAt: number
  leadCaptured: boolean
}

interface Stats {
  total: number
  hotLeads: number
  warmLeads: number
  avgScore: number
  thisWeek: number
}

interface CopilotMessage {
  role: "user" | "assistant"
  content: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  <  2) return "just now"
  if (mins  < 60) return `${mins} minutes ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  if (days  <  7) return `${days} day${days > 1 ? "s" : ""} ago`
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

function leadQualityStyle(quality: string) {
  if (quality === "hot")  return { bg: "#EF444418", color: "#EF4444", border: "#EF444440", label: "Hot" }
  if (quality === "warm") return { bg: "#F59E0B18", color: "#F59E0B", border: "#F59E0B40", label: "Warm" }
  return { bg: "#47556918", color: "#475569", border: "#47556940", label: "Cold" }
}

function readinessLabel(level: string) {
  const map: Record<string, string> = {
    not_eligible: "Not Eligible",
    not_ready:    "Not Ready",
    semi_ready:   "Semi Ready",
    fully_ready:  "Fully Ready",
  }
  return map[level] ?? level
}

function exportCSV(leads: LeadData[]) {
  const headers = ["Name", "Email", "Phone", "Score", "Track", "Level", "Quality", "Date", "LinkedIn"]
  const rows = leads.map(l => [
    l.name ?? "Anonymous",
    l.email ?? "",
    l.phone ?? "",
    l.overallScore,
    l.recommendedTrack,
    l.readinessLevel,
    l.leadQuality,
    new Date(l.createdAt).toLocaleDateString("en-GB"),
    l.linkedinUrl ?? "",
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url
  a.download = `meridian-leads-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Sub-score mini bars ───────────────────────────────────────────────────────

function MiniBar({ label, val, color }: { label: string; val: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-platinum-dim">{label}</span>
        <span className="text-xs font-mono text-platinum">{val}</span>
      </div>
      <div className="h-1 bg-void-border rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${val}%`, background: color }} />
      </div>
    </div>
  )
}

// ── Login gate ────────────────────────────────────────────────────────────────

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "meridian2025"

function LoginGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [pw, setPw] = useState("")
  const [error, setError] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === ADMIN_KEY) {
      onAuth(pw)
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6">
      <div className="card-border p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="flex flex-col items-center leading-none mb-4">
            <span className="font-display text-2xl text-gradient-brand leading-none">Meridian</span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim">
              Global Talent Visa
            </span>
          </Link>
          <p className="text-sm font-mono text-platinum-faint uppercase tracking-widest">
            Admin Access
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-platinum-dim uppercase tracking-widest block mb-2">
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className={`input-field ${error ? "border-red-400 focus:border-red-400" : ""}`}
              placeholder="Enter admin password"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-400 mt-1.5">Incorrect password.</p>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary w-full py-3 rounded-xl text-sm text-white font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Copilot panel ─────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  "Who are my hottest leads?",
  "Draft a follow-up email for the most recent lead",
  "What's my average conversion rate?",
  "Which tracks are most popular?",
]

function CopilotPanel({
  password,
  stats,
  leads,
}: {
  password: string
  stats: Stats | null
  leads: LeadData[]
}) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      role: "assistant",
      content: "Hi Amit — I have access to your lead data and analytics. What would you like to know or do?",
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

  const send = useCallback(async (userMsg: string) => {
    if (!userMsg.trim() || loading) return
    const newMessages: CopilotMessage[] = [...messages, { role: "user", content: userMsg }]
    setMessages([...newMessages, { role: "assistant", content: "" }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/copilot", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": password },
        body: JSON.stringify({
          messages: newMessages,
          context: { stats, recentLeads: leads.slice(0, 10) },
        }),
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
  }, [messages, loading, password, stats, leads])

  return (
    <div className="card-border flex flex-col" style={{ height: "520px" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-void-border">
        <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <span className="text-sm font-medium text-platinum">AI Copilot</span>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand/10 text-brand border border-brand/20">
          BETA
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-brand text-white rounded-br-sm"
                  : "bg-void-surface border border-void-border text-platinum-dim rounded-bl-sm"
              }`}
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

      {/* Quick prompts */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={loading}
            className="flex-shrink-0 px-3 py-1.5 rounded-full border border-void-border text-xs text-platinum-dim hover:border-brand/40 hover:text-brand transition-colors bg-void-surface"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-void-border flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input) } }}
          placeholder="Ask about your leads…"
          className="input-field text-sm py-2.5"
          disabled={loading}
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="btn-primary px-4 py-2.5 rounded-xl text-sm text-white font-medium flex-shrink-0 disabled:opacity-50 disabled:pointer-events-none"
        >
          Send
        </button>
      </div>
    </div>
  )
}

// ── Row expansion ─────────────────────────────────────────────────────────────

function LeadRowExpanded({ lead }: { lead: LeadData }) {
  const answerLabels: Record<string, string> = {
    role:     "Role",
    sector:   "Sector",
    yearsExp: "Experience",
    country:  "Country",
  }
  const subMeta = [
    { key: "technicalLeadership",  label: "Tech Leadership", color: "#7C3AED" },
    { key: "evidenceQuality",      label: "Evidence",        color: "#06B6D4" },
    { key: "externalRecognition",  label: "Recognition",     color: "#9F6EF5" },
    { key: "independence",         label: "Independence",    color: "#F59E0B" },
    { key: "globalProfile",        label: "Global Profile",  color: "#22D3EE" },
  ]

  return (
    <div className="bg-void-surface border-t border-void-border px-6 py-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Insights */}
        <div>
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">
            AI Insights
          </p>
          <div className="space-y-2">
            {(lead.insights ?? []).slice(0, 3).map((ins, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-xs font-mono text-brand flex-shrink-0 mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-xs text-platinum-dim leading-relaxed">{ins}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sub-scores */}
        <div>
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">
            Sub-scores
          </p>
          <div className="space-y-2">
            {subMeta.map(m => (
              <MiniBar
                key={m.key}
                label={m.label}
                val={lead.subScores?.[m.key] ?? 0}
                color={m.color}
              />
            ))}
          </div>
        </div>

        {/* Profile + actions */}
        <div>
          <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">
            Profile
          </p>
          <div className="space-y-1.5 mb-4">
            {Object.entries(answerLabels).map(([key, label]) => (
              lead.answers?.[key] ? (
                <div key={key} className="flex gap-2">
                  <span className="text-xs text-platinum-faint w-20 flex-shrink-0">{label}:</span>
                  <span className="text-xs text-platinum capitalize">{lead.answers[key]}</span>
                </div>
              ) : null
            ))}
            {lead.leadCaptured && lead.phone && (
              <div className="flex gap-2">
                <span className="text-xs text-platinum-faint w-20 flex-shrink-0">Phone:</span>
                <span className="text-xs text-platinum">{lead.phone}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-void-border text-xs text-platinum-dim hover:border-brand/40 hover:text-brand transition-colors bg-void"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Email
              </a>
            )}
            {lead.linkedinUrl && (
              <a
                href={lead.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-void-border text-xs text-platinum-dim hover:border-data/40 hover:text-data transition-colors bg-void"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ password }: { password: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [leads, setLeads] = useState<LeadData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "hot" | "warm" | "cold">("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [sortKey, setSortKey] = useState<"score" | "date">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/data", {
          headers: { "x-admin-key": password },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json() as { stats: Stats; leads: LeadData[] }
        setStats(data.stats)
        setLeads(data.leads)
      } catch (e) {
        setError(String(e))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [password])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-platinum-dim">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="card-border p-8 max-w-sm text-center">
          <p className="text-platinum mb-2">Failed to load data</p>
          <p className="text-sm text-platinum-dim">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <div className="border-b border-void-border px-6 py-4 bg-void">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-display text-base text-gradient-brand leading-none">Meridian</span>
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim">
                Global Talent Visa
              </span>
            </Link>
            <span className="text-platinum-faint text-xs font-mono">/ Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCopilotOpen(o => !o)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                copilotOpen
                  ? "bg-brand text-white border-brand"
                  : "border-void-border text-platinum-dim hover:border-brand/40 hover:text-brand"
              }`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              AI Copilot
            </button>
            <button
              onClick={() => exportCSV(leads)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-void-border text-platinum-dim hover:border-brand/40 hover:text-brand transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid gap-6 ${copilotOpen ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"}`}>
          {/* Main content */}
          <div className={copilotOpen ? "lg:col-span-2" : ""}>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Total Assessments",
                  value: stats?.total ?? 0,
                  color: "#0F172A",
                  accent: "#0F172A",
                },
                {
                  label: "Hot Leads",
                  value: stats?.hotLeads ?? 0,
                  color: "#EF4444",
                  accent: "#EF4444",
                },
                {
                  label: "Avg Score",
                  value: stats?.avgScore ? `${stats.avgScore}/100` : "—",
                  color: "#7C3AED",
                  accent: "#7C3AED",
                },
                {
                  label: "This Week",
                  value: stats?.thisWeek ?? 0,
                  color: "#06B6D4",
                  accent: "#06B6D4",
                },
              ].map(s => (
                <div
                  key={s.label}
                  className="card-border p-5 relative overflow-hidden"
                  style={{ borderTop: `3px solid ${s.accent}` }}
                >
                  <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-1">
                    {s.label}
                  </p>
                  <p className="text-2xl font-mono font-bold" style={{ color: s.color }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Leads table */}
            <div className="card-border overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-void-border">
                <h2 className="text-sm font-medium text-platinum">
                  All Assessments <span className="text-platinum-faint font-mono">({filtered.length})</span>
                </h2>
                <div className="flex gap-1">
                  {(["all", "hot", "warm", "cold"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                        filter === f
                          ? "bg-brand text-white"
                          : "text-platinum-dim hover:text-platinum"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table head */}
              <div className="grid grid-cols-12 gap-2 px-6 py-3 border-b border-void-border bg-void-surface">
                <div className="col-span-4 text-xs font-mono text-platinum-faint uppercase tracking-widest">
                  Name / Email
                </div>
                <button
                  onClick={() => toggleSort("score")}
                  className="col-span-2 text-xs font-mono text-platinum-faint uppercase tracking-widest text-left flex items-center gap-1 hover:text-platinum transition-colors"
                >
                  Score
                  <span className="text-[10px]">{sortKey === "score" ? (sortDir === "desc" ? "▼" : "▲") : "⇅"}</span>
                </button>
                <div className="col-span-2 text-xs font-mono text-platinum-faint uppercase tracking-widest">
                  Track
                </div>
                <div className="col-span-2 text-xs font-mono text-platinum-faint uppercase tracking-widest">
                  Quality
                </div>
                <button
                  onClick={() => toggleSort("date")}
                  className="col-span-2 text-xs font-mono text-platinum-faint uppercase tracking-widest text-left flex items-center gap-1 hover:text-platinum transition-colors"
                >
                  Date
                  <span className="text-[10px]">{sortKey === "date" ? (sortDir === "desc" ? "▼" : "▲") : "⇅"}</span>
                </button>
              </div>

              {/* Rows */}
              <div className="divide-y divide-void-border">
                {filtered.length === 0 && (
                  <div className="px-6 py-10 text-center text-sm text-platinum-faint">
                    No assessments found.
                  </div>
                )}
                {filtered.map(lead => {
                  const scoreStyle = scoreBadgeStyle(lead.overallScore)
                  const trackStyle = trackBadgeStyle(lead.recommendedTrack)
                  const qualStyle  = leadQualityStyle(lead.leadQuality)
                  const isExpanded = expandedId === lead._id

                  return (
                    <div key={lead._id}>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : lead._id)}
                        className="w-full grid grid-cols-12 gap-2 px-6 py-4 hover:bg-void-surface transition-colors text-left"
                      >
                        {/* Name + email */}
                        <div className="col-span-4">
                          <p className="text-sm text-platinum font-medium truncate">
                            {lead.name ?? "Anonymous"}
                          </p>
                          {lead.email && (
                            <p className="text-xs text-platinum-faint truncate">{lead.email}</p>
                          )}
                        </div>

                        {/* Score */}
                        <div className="col-span-2 flex items-center">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border"
                            style={{
                              background: scoreStyle.bg,
                              color: scoreStyle.color,
                              borderColor: scoreStyle.border,
                            }}
                          >
                            {lead.overallScore}
                          </span>
                        </div>

                        {/* Track */}
                        <div className="col-span-2 flex items-center">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-mono border"
                            style={{
                              background: trackStyle.bg,
                              color: trackStyle.color,
                              borderColor: trackStyle.border,
                            }}
                          >
                            {trackStyle.label}
                          </span>
                        </div>

                        {/* Quality */}
                        <div className="col-span-2 flex items-center">
                          <span
                            className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                            style={{
                              background: qualStyle.bg,
                              color: qualStyle.color,
                              borderColor: qualStyle.border,
                            }}
                          >
                            {qualStyle.label}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="col-span-2 flex items-center">
                          <span className="text-xs text-platinum-faint">
                            {relativeTime(lead.createdAt)}
                          </span>
                        </div>
                      </button>

                      {/* Expanded row */}
                      {isExpanded && <LeadRowExpanded lead={lead} />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Copilot panel */}
          {copilotOpen && (
            <div className="lg:col-span-1 sticky top-6 self-start">
              <CopilotPanel password={password} stats={stats} leads={leads} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState("")

  const handleAuth = (pw: string) => {
    setPassword(pw)
    setAuthed(true)
  }

  if (!authed) return <LoginGate onAuth={handleAuth} />
  return <Dashboard password={password} />
}
