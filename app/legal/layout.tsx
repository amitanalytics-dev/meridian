import type { Metadata } from "next"

const SITE_URL = "https://meridiangtv.co.uk"

export const metadata: Metadata = {
  title: "Legal & Policies — Meridian Global Talent Visa Advisory",
  description:
    "Terms, privacy policy, NDA, refund policy, service delivery, and disclaimers for Meridian Advisory — independent UK Global Talent Visa strategic advisory by Amit Tyagi.",
  keywords: [
    "Meridian Global Talent Visa terms",
    "UK Global Talent Visa advisory privacy",
    "Meridian refund policy",
    "Meridian NDA confidentiality",
    "Amit Tyagi advisory legal",
  ],
  openGraph: {
    title: "Legal & Policies — Meridian Global Talent Visa",
    description:
      "Terms, privacy, NDA, refund policy, and service disclaimers for Meridian — independent UK Global Talent Visa advisory.",
    type: "website",
    url: `${SITE_URL}/legal`,
    siteName: "Meridian Global Talent Visa",
  },
  alternates: {
    canonical: `${SITE_URL}/legal`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
