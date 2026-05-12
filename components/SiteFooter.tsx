import Link from "next/link"
import Image from "next/image"

/**
 * Shared site-wide footer.
 *
 * Used on every page except the homepage (which has its inline animated footer)
 * and the scorecard quiz flow (transient state pages).
 *
 * Server component — no client interactivity needed.
 */

const SOCIALS = [
  { label: "Connect on LinkedIn", href: "https://www.linkedin.com/in/amitisb1tyagi/", iconLetter: "in", color: "#0A66C2" },
  { label: "WhatsApp +44 7776 842287", href: "https://wa.me/447776842287", iconLetter: "W", color: "#25D366" },
  { label: "Instagram @meridianglobaltalent", href: "https://www.instagram.com/meridianglobaltalent/", iconLetter: "IG", color: "#E1306C" },
]

const SERVICES_LINKS: [string, string][] = [
  ["Readiness Assessment", "/scorecard"],
  ["Apply for Advisory", "/apply"],
  ["Insights Blog", "/blog"],
  ["Knowledge Hub", "/knowledge"],
  ["Methodology", "/methodology"],
]

const AUDIENCE_LINKS: [string, string][] = [
  ["For Founders", "/for/founders"],
  ["For Engineers", "/for/engineers"],
  ["For Product Managers", "/for/product-managers"],
  ["For AI Researchers", "/for/ai-researchers"],
  ["For Fintech Operators", "/for/fintech-professionals"],
  ["For Data Scientists", "/for/data-scientists"],
]

const LEGAL_LINKS: [string, string][] = [
  ["Terms & Conditions", "/legal#terms"],
  ["Privacy Policy", "/legal#privacy"],
  ["Refund Policy", "/legal#refunds"],
  ["Disclaimer", "/legal#disclaimer"],
  ["NDA & Confidentiality", "/legal#nda"],
  ["Service Delivery", "/legal#delivery"],
]

export function SiteFooter() {
  return (
    <footer className="py-14 px-6 border-t border-void-border bg-void">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-5 gap-10 mb-10">
          {/* Brand + socials */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.png" alt="Meridian" width={28} height={28} className="rounded-lg" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-base text-platinum leading-none">Meridian</span>
                <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-platinum-dim leading-none">Global Talent Visa</span>
              </span>
            </Link>
            <p className="text-platinum-dim text-sm leading-relaxed max-w-xs mb-5">
              Strategic advisory for builders applying for UK Global Talent recognition.
              Evidence architecture, narrative engineering, recommendation strategy.
            </p>
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-3">Reach out directly</p>
            <div className="flex flex-col gap-2.5">
              {SOCIALS.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-platinum-dim hover:text-platinum transition-colors group">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors"
                    style={{ background: `${s.color}26`, border: `1px solid ${s.color}4D`, color: s.color }}
                  >
                    {s.iconLetter}
                  </span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">Services</p>
            <ul className="space-y-3">
              {SERVICES_LINKS.map(([l, h]) => (
                <li key={l}>
                  <Link href={h} className="text-sm text-platinum-dim hover:text-platinum transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Audiences */}
          <div>
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">By Profession</p>
            <ul className="space-y-3">
              {AUDIENCE_LINKS.map(([l, h]) => (
                <li key={l}>
                  <Link href={h} className="text-sm text-platinum-dim hover:text-platinum transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-mono text-platinum-faint uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(([l, h]) => (
                <li key={l}>
                  <Link href={h} className="text-sm text-platinum-dim hover:text-platinum transition-colors">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer + copyright */}
        <div className="pt-8 border-t border-void-border">
          <p className="text-xs text-platinum-faint leading-relaxed max-w-3xl">
            <strong className="text-platinum-dim">Advisory only — not immigration legal advice.</strong>{" "}
            Meridian is an independent advisory service. Amit Tyagi is not an immigration lawyer,
            is not OISC-registered, and does not provide regulated immigration advice. We are not affiliated
            with the UK Government, the Home Office, Tech Nation, or any visa body. For regulated immigration
            legal advice, consult an accredited immigration solicitor.
          </p>
          <p className="text-xs text-platinum-faint mt-3">© {new Date().getFullYear()} Meridian. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
