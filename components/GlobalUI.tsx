"use client"

import { useState } from "react"
import { ChatWidget } from "./ChatWidget"
import { MobileBottomBar } from "./MobileBottomBar"

export function GlobalUI() {
  const [chatOpen, setChatOpen] = useState(false)
  return (
    <>
      <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />
      <MobileBottomBar onOpenChat={() => setChatOpen(true)} />
    </>
  )
}
