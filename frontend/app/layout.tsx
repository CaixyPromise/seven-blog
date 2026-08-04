import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import "katex/dist/katex.min.css"

// Configure fonts with proper options
const geist = Geist({
  subsets: ["latin"],
  variable: '--font-geist',
  display: 'swap',
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-geist-mono',
  display: 'swap',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://eindev.ir'),
  title: {
    default: "CaixyPromise Blog",
    template: "%s | CaixyPromise",
  },
  description:
    "CaixyPromise Blog 记录 AI Agent、LLM 应用、后端工程、开源项目和持续学习。",
  keywords: ["AI Agent", "LLM", "MCP", "RAG", "Prompt Engineering", "Java", "Go", "Python", "Rust", "Backend Engineering"],
  authors: [{ name: "Maverick / CaixyPromise", url: "https://github.com/CaixyPromise" }],
  creator: "Maverick / CaixyPromise",
  publisher: "CaixyPromise",
  generator: "v0.app",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    title: "CaixyPromise Blog",
    description: "记录 AI Agent、LLM 应用、后端工程、开源项目和持续学习。",
    siteName: "CaixyPromise Blog",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CaixyPromise Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CaixyPromise Blog",
    description: "AI Agents, LLM applications, backend systems, and open-source projects.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="Blog RSS" href="/rss.xml" />
        <link rel="alternate" type="application/rss+xml" title="Notes RSS" href="/notes/rss.xml" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} storageKey="theme-mode">
          {children}
        </ThemeProvider>
        <Toaster position="bottom-right" richColors closeButton />
        <Analytics />
      </body>
    </html>
  )
}
