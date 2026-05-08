import type { Metadata } from "next"

const SITE_URL = "https://meridiangtv.co.uk"

export const metadata: Metadata = {
  title: "Payment Details — Meridian Global Talent Visa Advisory",
  description:
    "Secure bank transfer details for confirmed Meridian Global Talent Visa advisory engagements. Pay only after Amit Tyagi has confirmed your tier and reference number.",
  keywords: [
    "Meridian advisory payment",
    "UK Global Talent Visa advisory payment",
    "Amit Tyagi advisory bank transfer",
  ],
  openGraph: {
    title: "Payment Details — Meridian",
    description:
      "Confirmed engagement bank transfer details for Meridian Global Talent Visa advisory.",
    type: "website",
    url: `${SITE_URL}/pay`,
    siteName: "Meridian Global Talent Visa",
  },
  alternates: {
    canonical: `${SITE_URL}/pay`,
  },
  // Payment page should not be indexed — it's a transactional confirmation page
  robots: {
    index: false,
    follow: true,
  },
}

export default function PayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
