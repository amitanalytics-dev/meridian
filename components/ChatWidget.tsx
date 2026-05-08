"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

/**
 * Aria — Meridian's on-site assistant.
 *
 * Floating chat widget. Mounted globally in app/layout.tsx via a client wrapper.
 * - Generates a session ID per browser (localStorage).
 * - Streams from /api/chat.
 * - Asks for email naturally on a high-intent turn (handled server-side via system prompt).
 *   When the user provides email through the small input that appears under the chat,
 *   we POST it on the next turn so the server can store the lead.
 */

interface Message {
  role: "user" | "assistant"
  content: string
}

const STORAGE_KEY = "meridian.aria.sessionId"
const SEEN_KEY = "meridian.aria.seen"

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}

const OPENING_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi — I'm Aria. I help with questions about the UK Global Talent Visa and how Meridian works. What's on your mind?",
}

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [showEmailField, setShowEmailField] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const sessionIdRef = useRef<string>("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId()
  }, [])

  useEffect(() => {
    // Auto-scroll on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streaming])

  // Reveal the email field once the assistant has asked a follow-up that includes "email"
  // (cheap heuristic — backed by the server-side qualifier)
  useEffect(() => {
    if (emailSubmitted) return
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant")
    if (lastAssistant && /\b(your email|drop.{0,15}email|share.{0,15}email|email.{0,15}follow up)\b/i.test(lastAssistant.content)) {
      setShowEmailField(true)
    }
  }, [messages, emailSubmitted])

  async function send() {
    const trimmed = input.trim()
    if (!trimmed || streaming) return

    const userMsg: Message = { role: "user", content: trimmed }
    const next = [...messages, userMsg]
    setMessages([...next, { role: "assistant", content: "" }])
    setInput("")
    setStreaming(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          messages: next,
          pageEntered: typeof window !== "undefined" ? window.location.pathname : undefined,
          email: emailSubmitted ? email : undefined,
          name: emailSubmitted ? name : undefined,
        }),
      })

      if (!res.ok || !res.body) {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: "assistant", content: "I'm having trouble reaching the server. Try again in a moment, or email Amit directly: amit@berriesadvisory.com" }
          return copy
        })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        // Filter the qualification trailer client-side too as a safety net
        const visible = acc.split(/\n?>>/)[0]
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: "assistant", content: visible }
          return copy
        })
      }
    } finally {
      setStreaming(false)
    }
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    setEmailSubmitted(true)
    setShowEmailField(false)
    // Append a confirmation message into the conversation
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `(email shared: ${email}${name ? `, name: ${name}` : ""})` },
      { role: "assistant", content: `Got it — I've passed your details to Amit. He'll follow up directly within 48 hours. In the meantime, the free 4-minute scorecard at /scorecard is the fastest way to see where your case stands.` },
    ])
  }

  // First-time nudge — pulse the bubble for a few seconds on first page view
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined") return
    if (sessionStorage.getItem(SEEN_KEY)) return
    sessionStorage.setItem(SEEN_KEY, "1")
    const t = setTimeout(() => setPulse(true), 4000)
    const t2 = setTimeout(() => setPulse(false), 14000)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setOpen(true)}
          aria-label="Open chat with Aria"
          className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-br from-brand to-data text-white font-medium text-sm shadow-[0_8px_30px_rgba(124,58,237,0.45)] hover:shadow-[0_12px_40px_rgba(124,58,237,0.6)] transition-shadow ${pulse ? "animate-pulse" : ""}`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          Ask Aria
        </motion.button>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-[60] w-[min(96vw,400px)] h-[min(85vh,640px)] flex flex-col rounded-2xl overflow-hidden border border-void-border bg-void shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
            role="dialog"
            aria-label="Chat with Aria"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-void-border bg-gradient-to-br from-brand/10 to-data/8 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-data flex items-center justify-center text-white font-bold text-sm flex-shrink-0">A</div>
                <div className="leading-tight">
                  <p className="text-sm text-platinum font-medium">Aria</p>
                  <p className="text-xs text-platinum-faint">Meridian's assistant · Replies in seconds</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-platinum-faint hover:text-platinum text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-void-surface transition-colors"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-void">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-brand text-white"
                        : "bg-void-surface border border-void-border text-platinum-dim"
                    }`}
                  >
                    {m.content || (streaming && i === messages.length - 1 ? <Dots /> : "")}
                  </div>
                </div>
              ))}
            </div>

            {/* Email capture (revealed when assistant invites it) */}
            {showEmailField && !emailSubmitted && (
              <form onSubmit={submitEmail} className="px-5 py-3 border-t border-void-border bg-void-surface space-y-2">
                <p className="text-xs text-platinum-faint">Drop your email and Amit will follow up within 48 hours.</p>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-void border border-void-border text-sm text-platinum placeholder:text-platinum-faint focus:outline-none focus:border-brand/50"
                />
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-void border border-void-border text-sm text-platinum placeholder:text-platinum-faint focus:outline-none focus:border-brand/50"
                    required
                  />
                  <button type="submit" className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-light transition-colors">
                    Share
                  </button>
                </div>
              </form>
            )}

            {/* Input */}
            <div className="px-5 py-4 border-t border-void-border bg-void-surface">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder="Ask about evidence, timelines, eligibility…"
                  rows={1}
                  className="flex-1 resize-none rounded-xl bg-void border border-void-border px-4 py-2.5 text-sm text-platinum placeholder:text-platinum-faint focus:outline-none focus:border-brand/50 max-h-32"
                />
                <button
                  onClick={send}
                  disabled={streaming || !input.trim()}
                  className="px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
              <p className="text-[10px] text-platinum-faint mt-2 text-center">
                Aria is a chat assistant. She is not Amit and not a lawyer. For regulated immigration advice consult a solicitor.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Dots() {
  return (
    <span className="inline-flex gap-1 items-center py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-platinum-faint animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-platinum-faint animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-platinum-faint animate-bounce" style={{ animationDelay: "240ms" }} />
    </span>
  )
}
