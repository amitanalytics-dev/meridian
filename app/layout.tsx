import type { Metadata } from "next"
import { Inter, DM_Serif_Display, Geist_Mono } from "next/font/google"
import "./globals.css"

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
  title: "Meridian — Engineer Your Global Credibility",
  description:
    "The global credibility layer for ambitious technology builders. Founder Credibility Index™, narrative engineering, and evidence architecture for exceptional builders.",
  keywords: [
    "founder credibility",
    "global talent recognition",
    "builder positioning",
    "narrative engineering",
    "credibility architecture",
  ],
  openGraph: {
    title: "Meridian — Engineer Your Global Credibility",
    description:
      "Most exceptional builders fail global recognition systems not due to capability — but due to poor credibility architecture.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmSerifDisplay.variable} ${geistMono.variable}`}
    >
      <body className="font-sans bg-void text-platinum antialiased">
        {children}
      </body>
    </html>
  )
}
