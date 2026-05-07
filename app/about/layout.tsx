import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Amit Tyagi — UK Global Talent Visa Advisor",
  description:
    "Amit Tyagi received UK Global Talent recognition under the Exceptional Talent category. Fintech founder, startup operator, and strategic advisor helping builders apply for the UK Global Talent Visa.",
  keywords: [
    "Amit Tyagi",
    "UK Global Talent Visa advisor",
    "Exceptional Talent visa holder",
    "Tech Nation advisory",
    "Global Talent visa mentor",
  ],
  openGraph: {
    title: "About Amit Tyagi — UK Global Talent Visa Advisor",
    description:
      "Amit Tyagi received UK Global Talent recognition under Exceptional Talent. He helps founders, engineers, and PMs build their case.",
    type: "profile",
  },
  alternates: {
    canonical: "https://meridian-pi-mauve.vercel.app/about",
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
