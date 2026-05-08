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
  chips?: string[]    // Quick-reply chips suggested for the NEXT user turn
}

const META_SENTINEL = "\n<<<__ARIA_META__>>>"

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
    "Hi — I'm Aria, Amit's assistant. I'll point you to whether the UK Global Talent Visa fits, what your specific gaps are, and what to do next. Quickest start — pick one below or just tell me what you do.",
}

// Quick-reply chips shown only on the first turn (before user types anything).
// These pre-fill the input and submit, jumping straight to Stage 2 qualification.
const QUICK_REPLIES = [
  "I'm a founder",
  "I'm an engineer",
  "I'm a PM/operator",
  "I'm an AI researcher",
  "I've been rejected before",
  "Just researching",
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [showEmailField, setShowEmailField] = useState(false)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  // Farewell panel state (intercepts close after a real exchange)
  const [farewellMode, setFarewellMode] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState<number>(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [feedbackEmail, setFeedbackEmail] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

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

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || streaming) return

    const userMsg: Message = { role: "user", content: text }
    const next = [...messages, userMsg]
    setMessages([...next, { role: "assistant", content: "" }])
    if (!overrideText) setInput("")
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
        // Split on meta sentinel so the JSON tail never leaks into the visible reply
        const visible = acc.split(META_SENTINEL)[0]
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: "assistant", content: visible }
          return copy
        })
      }

      // After streaming completes, parse the meta JSON for chips
      const parts = acc.split(META_SENTINEL)
      const finalReply = parts[0].trim()
      let chips: string[] = []
      if (parts[1]) {
        try {
          const meta = JSON.parse(parts[1].trim()) as { chips?: string[] }
          if (Array.isArray(meta.chips)) chips = meta.chips
        } catch {
          /* ignore — chips just won't render */
        }
      }
      setMessages((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: "assistant", content: finalReply, chips }
        return copy
      })
    } finally {
      setStreaming(false)
    }
  }

  // Called when user clicks the X. If they had a real exchange, intercept and show farewell.
  function handleClose() {
    const hadExchange = messages.length >= 2 // opening + at least 1 user msg
    if (hadExchange && !farewellMode && !feedbackSent) {
      setFarewellMode(true)
    } else {
      setOpen(false)
      // reset farewell after fully closing so it shows again next session if they re-open
      setTimeout(() => {
        setFarewellMode(false)
        setFeedbackSent(false)
      }, 400)
    }
  }

  async function submitFeedback() {
    if (feedbackRating === 0) return
    setSubmittingFeedback(true)
    try {
      await fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          rating: feedbackRating,
          comment: feedbackComment || undefined,
          email: feedbackEmail || undefined,
          messageCount: messages.filter((m) => m.role === "user").length,
          pageContext: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      })
      setFeedbackSent(true)
    } catch {
      // network failed — still let them close gracefully
      setFeedbackSent(true)
    } finally {
      setSubmittingFeedback(false)
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
                onClick={handleClose}
                aria-label="Close chat"
                className="text-platinum-faint hover:text-platinum text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-void-surface transition-colors"
              >
                ×
              </button>
            </div>

            {/* Farewell panel — intercepts close after a real exchange */}
            {farewellMode && !feedbackSent && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0 top-[68px] bg-void z-10 flex flex-col"
              >
                <div className="flex-1 overflow-y-auto px-6 py-7 space-y-6">
                  <div>
                    <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">Before you go</p>
                    <h3 className="font-display text-2xl text-platinum mb-2 leading-tight">Was this useful?</h3>
                    <p className="text-sm text-platinum-dim leading-relaxed">A quick tap helps me get sharper. Then if you want, leave your email — Amit reads every one personally and replies within 48 hours.</p>
                  </div>

                  {/* Rating */}
                  <div>
                    <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">Your rating</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setFeedbackRating(n)}
                          aria-label={`${n} of 5`}
                          className={`flex-1 h-12 rounded-xl border text-lg font-medium transition-all ${
                            feedbackRating >= n
                              ? "border-brand bg-brand/15 text-platinum shadow-[0_0_24px_rgba(124,58,237,0.18)]"
                              : "border-void-border bg-void-surface text-platinum-faint hover:border-brand/40 hover:text-platinum-dim"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional comment */}
                  <div>
                    <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-2">What would have made this better? (optional)</p>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="A specific thing Aria didn't help with…"
                      rows={2}
                      className="w-full resize-none rounded-xl bg-void-surface border border-void-border px-3 py-2 text-sm text-platinum placeholder:text-platinum-faint focus:outline-none focus:border-brand/50"
                    />
                  </div>

                  {/* Email push */}
                  <div className="card-border p-4 bg-brand/4">
                    <p className="text-xs font-mono text-brand uppercase tracking-widest mb-2">Want a personal reply from Amit?</p>
                    <p className="text-xs text-platinum-dim leading-relaxed mb-3">
                      Drop your email below and Amit will write back within 48 hours with his honest read on whether the Global Talent route fits your situation. No obligation.
                    </p>
                    <input
                      type="email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-lg bg-void border border-void-border px-3 py-2 text-sm text-platinum placeholder:text-platinum-faint focus:outline-none focus:border-brand/50"
                    />
                  </div>
                </div>

                {/* Footer actions */}
                <div className="border-t border-void-border px-5 py-4 flex gap-2 bg-void">
                  <button
                    onClick={() => {
                      setFarewellMode(false)
                      setOpen(false)
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm text-platinum-faint hover:text-platinum transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={submitFeedback}
                    disabled={feedbackRating === 0 || submittingFeedback}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingFeedback ? "Sending…" : feedbackEmail ? "Send to Amit" : "Send feedback"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Thanks state — shown briefly after feedback submit */}
            {farewellMode && feedbackSent && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-x-0 bottom-0 top-[68px] bg-void z-10 flex flex-col items-center justify-center px-8 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand/15 border border-brand/40 flex items-center justify-center mb-5">
                  <span className="text-brand text-2xl">✦</span>
                </div>
                <h3 className="font-display text-2xl text-platinum mb-2">Thanks for the feedback.</h3>
                <p className="text-sm text-platinum-dim leading-relaxed mb-7 max-w-xs">
                  {feedbackEmail
                    ? "Amit will write back within 48 hours."
                    : "Whenever you're ready, the free 4-minute readiness assessment is the fastest next step."}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  {!feedbackEmail && (
                    <a
                      href="/scorecard"
                      onClick={() => setOpen(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-medium text-center hover:bg-brand-light transition-colors"
                    >
                      Take the free assessment →
                    </a>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false)
                      setTimeout(() => {
                        setFarewellMode(false)
                        setFeedbackSent(false)
                      }, 400)
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-void-border text-platinum-dim text-sm font-medium hover:text-platinum transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-void">
              {messages.map((m, i) => {
                const isLastAssistant =
                  m.role === "assistant" && i === messages.length - 1 && !streaming
                return (
                  <div key={i} className="space-y-2">
                    <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
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

                    {/* Dynamic chips emitted by Aria for the NEXT user turn */}
                    {isLastAssistant && m.chips && m.chips.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-1">
                        {m.chips.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => send(chip)}
                            className="text-xs px-3 py-1.5 rounded-full border border-brand/30 bg-brand/8 text-platinum-dim hover:text-platinum hover:border-brand/60 hover:bg-brand/15 transition-all"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* First-turn fallback chips (before any user message exists) */}
              {messages.length === 1 && !streaming && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-brand/30 bg-brand/8 text-platinum-dim hover:text-platinum hover:border-brand/60 hover:bg-brand/15 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
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
                  onClick={() => send()}
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
