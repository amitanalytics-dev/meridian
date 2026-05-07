import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apply for UK Global Talent Visa Advisory — Work with Amit Tyagi",
  description:
    "Apply to work with Amit Tyagi on your UK Global Talent Visa application. Strategic advisory covering evidence architecture, personal statement, and recommendation strategy. Limited engagements per month.",
  keywords: [
    "UK Global Talent Visa advisory",
    "Tech Nation application help",
    "work with Amit Tyagi",
    "Global Talent Visa consultant",
    "UK visa strategy session",
    "Exceptional Talent visa advisor",
  ],
  openGraph: {
    title: "Apply for UK Global Talent Visa Advisory — Meridian",
    description:
      "Work directly with Amit Tyagi on your UK Global Talent Visa case. Evidence architecture, narrative engineering, recommendation strategy. Limited spots.",
    type: "website",
  },
  alternates: {
    canonical: "https://meridiangtv.co.uk/apply",
  },
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
