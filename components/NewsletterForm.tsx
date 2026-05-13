"use client"

import { useState } from "react"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setDone(true)
  }

  if (done) {
    return (
      <p className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>
        ✓ You&apos;re in. Talk soon.
      </p>
    )
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 p-1.5 rounded-full"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        <input
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-transparent outline-none px-4 py-2 text-sm"
          style={{ color: "white" }}
        />
        <button
          type="submit"
          className="text-white text-xs px-5 py-2 rounded-full font-medium flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #B8893B, #8C6428)" }}
        >
          Subscribe →
        </button>
      </form>
      <p className="font-mono text-[11px] mt-3 tracking-[0.06em]" style={{ color: "rgba(255,255,255,0.5)" }}>
        800+ builders subscribed · 0 spam
      </p>
    </>
  )
}
