import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import { AppShell } from "@/components/app-shell"
import { Providers } from "@/components/providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "DealFlow AI — Acquisition OS",
  description:
    "AI-assisted real estate acquisition platform: score leads, underwrite deals, and manage your wholesale pipeline.",
  applicationName: "DealFlow AI",
}

export const viewport: Viewport = {
  themeColor: "#070b12",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  )
}
