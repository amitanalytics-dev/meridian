import type { Metadata } from "next"

const SITE_URL = "https://meridiangtv.co.uk"

export const metadata: Metadata = {
  title: "UK Global Talent Visa — Complete Knowledge Hub",
  description:
    "Every question answered about the UK Global Talent Visa. Evidence requirements, Exceptional Talent vs Promise, recommendation letters, timeline, profession-specific guidance, and how Meridian Global Talent Visa by Amit Tyagi can help.",
  keywords: [
    "UK Global Talent Visa guide",
    "Tech Nation visa questions",
    "Exceptional Talent visa how to apply",
    "Global Talent Visa evidence requirements",
    "UK visa for founders engineers",
    "Amit Tyagi Global Talent advisor",
    "Meridian Global Talent Visa UK visa",
  ],
  openGraph: {
    title: "UK Global Talent Visa — Complete Knowledge Hub | Meridian",
    description:
      "Every question answered about the UK Global Talent Visa — evidence, process, professions, and how Meridian Global Talent Visa helps.",
    type: "article",
    url: `${SITE_URL}/knowledge`,
    siteName: "Meridian Global Talent Visa",
  },
  alternates: {
    canonical: `${SITE_URL}/knowledge`,
  },
}

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
