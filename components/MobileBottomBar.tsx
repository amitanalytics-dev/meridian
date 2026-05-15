"use client"

import Link from "next/link"

export function MobileBottomBar({ onOpenChat }: { onOpenChat: () => void }) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex sm:hidden"
      style={{
        background: "#FFFFFF",
        borderTop: "1px solid #E2D9C4",
        padding: "10px 16px",
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
        gap: 10,
      }}
    >
      {/* Start free */}
      <Link
        href="/readiness"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          height: 46,
          background: "linear-gradient(135deg, #5B21B6, #2E0F69)",
          color: "white",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          boxShadow: "0 4px 14px -4px rgba(91,33,182,0.4)",
        }}
      >
        Start free →
      </Link>

      {/* Ask Aria */}
      <button
        onClick={onOpenChat}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 46,
          background: "linear-gradient(135deg, #7C3AED, #0F766E)",
          color: "white",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 14px -4px rgba(124,58,237,0.4)",
        }}
      >
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        Ask Aria
      </button>
    </div>
  )
}
