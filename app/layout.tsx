import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { AppChrome } from "@/components/app-chrome"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = "https://jhermesn.dev"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Easy Expenses",
  description: "Nunca foi tão fácil administrar suas finanças.",
  manifest: `/easyExpenses/manifest.json`,
  icons: {
    icon: "/easyExpenses/favicon.ico",
  },
  openGraph: {
    title: "Easy Expenses",
    description: "Nunca foi tão fácil administrar suas finanças.",
    type: "website",
    url: "/easyExpenses/",
    images: [
      {
        url: "/easyExpenses/logo.png",
        width: 512,
        height: 512,
        alt: "Easy Expenses Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Easy Expenses",
    description: "Nunca foi tão fácil administrar suas finanças.",
    images: ["/easyExpenses/logo.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="no-scrollbar">
      <body className={`${inter.className} bg-black text-white`}>
        {children}
        <AppChrome />
      </body>
    </html>
  )
}
