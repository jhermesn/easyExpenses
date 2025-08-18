import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Easy Expenses",
  description: "Nunca foi tão fácil controlar suas finanças",
  manifest: `/easyExpenses/manifest.json`,
  icons: {
    icon: "/easyExpenses/favicon.ico",
  },
  openGraph: {
    title: "Easy Expenses",
    description: "Nunca foi tão fácil controlar suas finanças",
    type: "website",
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
    card: "summary",
    title: "Easy Expenses",
    description: "Nunca foi tão fácil controlar suas finanças",
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
    <html lang="pt-BR">
      <body className={`${inter.className} bg-black text-white`}>
        {children}
        <Footer />
      </body>
    </html>
  )
}
