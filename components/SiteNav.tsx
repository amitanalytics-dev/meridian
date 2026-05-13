"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const NAV_LINKS = [
  { label: "Services",  href: "/#services" },
  { label: "About",     href: "/about" },
  { label: "Pricing",   href: "/#pricing" },
  { label: "Insights",  href: "/blog" },
]

const SOCIALS = [
  { label: "in",  title: "LinkedIn",  href: "https://www.linkedin.com/in/amitisb1tyagi/",         color: "#0A66C2" },
  { label: "W",   title: "WhatsApp",  href: "https://wa.me/447776842287",                          color: "#25D366" },
  { label: "IG",  title: "Instagram", href: "https://www.instagram.com/meridianglobaltalent/",     color: "#E1306C" },
]

function LogoMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" width="32" height="32" style={{ color: "#5B21B6", flexShrink: 0 }}>
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="24" cy="24" rx="7.5" ry="18" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="6" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="24" cy="6" r="2.3" fill="currentColor"/>
    </svg>
  )
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  // Close drawer when route changes
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <>
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          transition: "all 0.3s",
          background: scrolled ? "rgba(246,241,231,0.96)" : "rgba(246,241,231,0.82)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #E2D9C4",
        }}
      >
        <div style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 32px",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}>

          {/* ── Logo ── */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 }}>
            <LogoMark />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <span style={{ fontFamily: "var(--f-display)", fontSize: 22, letterSpacing: "-0.02em", color: "#1A1530", lineHeight: 1 }}>
                Meridian
              </span>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8B8499", lineHeight: 1, marginTop: 3 }}>
                Global Talent Advisory
              </span>
            </span>
          </Link>

          {/* ── Desktop nav links ── */}
          <nav style={{ display: "flex", gap: 32, marginLeft: 12 }} className="hidden-mobile">
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={label}
                  href={href}
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: active ? "#1A1530" : "#5A5169",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#1A1530")}
                  onMouseLeave={e => (e.currentTarget.style.color = active ? "#1A1530" : "#5A5169")}
                >
                  {label}
                  {active && (
                    <span style={{
                      position: "absolute",
                      bottom: -2,
                      left: 0,
                      right: 0,
                      height: 1.5,
                      background: "#5B21B6",
                      borderRadius: 1,
                    }} />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Desktop right: socials + CTA ── */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }} className="hidden-mobile">
            {SOCIALS.map(({ label, title, href, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={title}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color,
                  background: `${color}12`,
                  border: `1px solid ${color}30`,
                  transition: "all 0.2s",
                  textDecoration: "none",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = `${color}22`
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = `${color}55`
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = `${color}12`
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = `${color}30`
                  ;(e.currentTarget as HTMLAnchorElement).style.transform = ""
                }}
              >
                {label}
              </a>
            ))}
            <Link
              href="/readiness"
              style={{
                background: "linear-gradient(135deg, #5B21B6, #2E0F69)",
                color: "white",
                padding: "10px 20px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px -4px rgba(91,33,182,0.4)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 20px -4px rgba(91,33,182,0.5)"
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.transform = ""
                ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 14px -4px rgba(91,33,182,0.4)"
              }}
            >
              Check my readiness →
            </Link>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            style={{
              marginLeft: "auto",
              width: 40,
              height: 40,
              display: "none",
              flexDirection: "column",
              justifyContent: "center",
              gap: 5,
              padding: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            className="show-mobile"
          >
            <span style={{
              display: "block", height: 2, borderRadius: 2, background: "#1A1530",
              transition: "all 0.3s",
              transform: open ? "rotate(45deg) translateY(7px)" : "none",
            }} />
            <span style={{
              display: "block", height: 2, borderRadius: 2, background: "#1A1530",
              transition: "all 0.3s",
              opacity: open ? 0 : 1,
            }} />
            <span style={{
              display: "block", height: 2, borderRadius: 2, background: "#1A1530",
              transition: "all 0.3s",
              transform: open ? "rotate(-45deg) translateY(-7px)" : "none",
            }} />
          </button>

        </div>
      </motion.nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 48,
                background: "rgba(26,21,48,0.4)",
                backdropFilter: "blur(2px)",
              }}
            />
            {/* Drawer panel */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed",
                top: 64,
                left: 0,
                right: 0,
                zIndex: 49,
                background: "#FFFFFF",
                borderBottom: "1px solid #E2D9C4",
                boxShadow: "0 20px 40px -10px rgba(26,21,48,0.2)",
              }}
            >
              <div style={{ padding: "24px 24px 32px" }}>

                {/* Primary CTA */}
                <Link
                  href="/readiness"
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px 20px",
                    background: "linear-gradient(135deg, #5B21B6, #2E0F69)",
                    color: "white",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                    marginBottom: 24,
                    boxShadow: "0 4px 16px -4px rgba(91,33,182,0.45)",
                  }}
                >
                  Check my readiness — free →
                </Link>

                {/* Nav links */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 24 }}>
                  {NAV_LINKS.map(({ label, href }) => {
                    const active = isActive(href)
                    return (
                      <Link
                        key={label}
                        href={href}
                        onClick={() => setOpen(false)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "14px 16px",
                          borderRadius: 10,
                          fontSize: 16,
                          fontWeight: active ? 600 : 500,
                          color: active ? "#5B21B6" : "#1A1530",
                          background: active ? "rgba(91,33,182,0.06)" : "transparent",
                          textDecoration: "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {label}
                        <span style={{ fontSize: 14, color: active ? "#5B21B6" : "#8B8499" }}>→</span>
                      </Link>
                    )
                  })}
                  <Link
                    href="/apply"
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      borderRadius: 10,
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#1A1530",
                      textDecoration: "none",
                    }}
                  >
                    Apply for advisory
                    <span style={{ fontSize: 14, color: "#8B8499" }}>→</span>
                  </Link>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "#E2D9C4", marginBottom: 20 }} />

                {/* Socials */}
                <div style={{ display: "flex", gap: 12 }}>
                  {SOCIALS.map(({ label, title, href, color }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#5A5169",
                        background: "#F6F1E7",
                        border: "1px solid #E2D9C4",
                        textDecoration: "none",
                      }}
                    >
                      <span style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        background: color,
                        color: "white",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 9,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}>
                        {label}
                      </span>
                      {title}
                    </a>
                  ))}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile   { display: none !important; }
        }
      `}</style>
    </>
  )
}
