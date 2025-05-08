import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import SiteHeader from "@/components/site-header"

export const metadata: Metadata = {
  title: "Mockup Generator",
  description: "",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
