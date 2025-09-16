import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { PWAProvider } from "@/components/pwa-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Lutong BahAI - Filipino Recipe Recommender",
  description:
    "Discover authentic Filipino recipes based on your available ingredients with AI-powered recommendations",
  generator: "v0.app",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lutong BahAI",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="Lutong BahAI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <PWAProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </PWAProvider>
        <Analytics />
      </body>
    </html>
  )
}
