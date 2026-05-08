import type { Metadata } from "next"
import { Inter, DM_Serif_Display, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ChatWidget } from "@/components/ChatWidget"

const SITE_URL = "https://meridiangtv.co.uk"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UK Global Talent Visa Advisory — Meridian | Amit Tyagi",
    template: "%s — Meridian",
  },
  description:
    "Strategic advisory for founders, engineers, and product managers applying for the UK Global Talent Visa. Evidence architecture, narrative engineering, and case strategy from Amit Tyagi — UK Exceptional Talent visa holder.",
  keywords: [
    "UK Global Talent Visa",
    "Tech Nation visa",
    "UK Exceptional Talent visa",
    "Exceptional Promise visa",
    "Global Talent visa founders",
    "UK visa engineers",
    "UK visa product managers",
    "UK visa fintech professionals",
    "Global Talent visa advisory",
    "Tech Nation application help",
    "UK Global Talent visa strategy",
    "Amit Tyagi",
    "Meridian advisory",
    "founder visa UK",
    "UK digital technology visa",
    "Global Talent visa startup founders",
    "UK visa AI founders",
  ],
  authors: [{ name: "Amit Tyagi", url: "https://www.linkedin.com/in/amitisb1tyagi/" }],
  creator: "Amit Tyagi",
  openGraph: {
    title: "UK Global Talent Visa Advisory — Meridian | Amit Tyagi",
    description:
      "Strategic advisory for founders, engineers, and PMs applying for the UK Global Talent Visa. Evidence architecture and case strategy from an Exceptional Talent holder.",
    type: "website",
    locale: "en_GB",
    siteName: "Meridian Global Talent Visa",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "UK Global Talent Visa Advisory — Meridian",
    description:
      "Strategic advisory for founders, engineers, and PMs applying for the UK Global Talent Visa. From Amit Tyagi — Exceptional Talent holder.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Meridian Global Talent Visa",
  url: SITE_URL,
  description:
    "Strategic advisory for UK Global Talent Visa applicants. Evidence architecture, narrative engineering, and case strategy from Amit Tyagi — UK Exceptional Talent visa holder.",
  founder: {
    "@type": "Person",
    name: "Amit Tyagi",
    url: `${SITE_URL}/about`,
    sameAs: [
      "https://www.linkedin.com/in/amitisb1tyagi/",
      "https://www.instagram.com/meridianglobaltalent/",
    ],
  },
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Amit Tyagi",
  url: `${SITE_URL}/about`,
  jobTitle: "Founder & UK Global Talent Visa Strategic Advisor",
  description:
    "UK Global Talent visa holder (Exceptional Talent category). Fintech founder, startup operator, and strategic advisor helping ambitious builders apply for the UK Global Talent Visa.",
  sameAs: [
    "https://www.linkedin.com/in/amitisb1tyagi/",
    "https://www.instagram.com/meridianglobaltalent/",
  ],
  knowsAbout: [
    "UK Global Talent Visa",
    "Tech Nation endorsement",
    "Exceptional Talent visa",
    "Exceptional Promise visa",
    "Evidence architecture",
    "Fintech",
    "Startups",
    "Founder credibility",
  ],
  worksFor: { "@type": "Organization", name: "Meridian Global Talent Visa" },
}

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Meridian Global Talent Visa",
  url: SITE_URL,
  description:
    "UK Global Talent Visa strategic advisory — evidence architecture, narrative engineering, and case strategy.",
  author: { "@type": "Person", name: "Amit Tyagi" },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerifDisplay.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-sans bg-void text-platinum antialiased">
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
