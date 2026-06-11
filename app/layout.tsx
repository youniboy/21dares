import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://21dares.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "21 Dares — Free Online Party Game",
    template: "%s | 21 Dares",
  },
  description:
    "21 Dares is a free online multiplayer party game. Count to 21, then face Truth, Dare, Double Dare, Situation or Burning House challenges. Play with friends in the same room or anywhere in the world.",
  keywords: [
    "party game",
    "party game online",
    "truth or dare",
    "truth dare double dare",
    "online party game for adults",
    "multiplayer party game",
    "free party game",
    "dare game",
    "21 dares",
    "fun party games",
    "party game with friends",
    "drinking game",
    "nsfw party game",
    "adult party game",
    "party game no download",
  ],
  authors: [{ name: "youniboy", url: "https://github.com/youniboy" }],
  creator: "youniboy",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "21 Dares",
    title: "21 Dares — Free Online Party Game",
    description:
      "Count to 21. Pick a card. Survive. Free multiplayer party game — Truth, Dare, Double Dare, Situation & Burning House. No download needed.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "21 Dares Party Game" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "21 Dares — Free Online Party Game",
    description:
      "Count to 21. Pick a card. Survive. Free multiplayer party game for groups — no download needed.",
    images: ["/opengraph-image"],
    creator: "@youniboy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: siteUrl },
  icons: { icon: "/favicon.ico" },
  verification: {
    google: "1s_7YvHEPuM1vjqM4SWAY8IouwiaFbbzl764HUJNggs",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f13",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "21 Dares",
  url: siteUrl,
  description:
    "Free online multiplayer party game. Count to 21, then face Truth, Dare, Double Dare, Situation or Burning House challenges.",
  applicationCategory: "Game",
  genre: "Party Game",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "youniboy", url: "https://github.com/youniboy" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
