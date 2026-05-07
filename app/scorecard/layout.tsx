import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free UK Global Talent Visa Readiness Assessment — Meridian",
  description:
    "Take the free 4-minute UK Global Talent Visa readiness assessment. Get a scored report across 4 dimensions: evidence strength, narrative clarity, recommendation quality, and external validation. Built by Amit Tyagi — Exceptional Talent holder.",
  keywords: [
    "UK Global Talent Visa readiness check",
    "Tech Nation application assessment",
    "Global Talent Visa score",
    "am I ready for Global Talent Visa",
    "UK visa eligibility check",
    "Exceptional Talent visa assessment",
  ],
  openGraph: {
    title: "Free UK Global Talent Visa Readiness Assessment",
    description:
      "4 minutes. 12 questions. Get a scored breakdown of your UK Global Talent Visa case — and know exactly what to fix first.",
    type: "website",
  },
  alternates: {
    canonical: "https://meridiangtv.co.uk/scorecard",
  },
}

export default function ScorecardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
