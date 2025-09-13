import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "../styles/globals.css"
import { AppChrome } from "@/components/app-chrome"
import { LocaleInitializer } from "@/components/locale-initializer"
import { CurrencyInitializer } from "@/components/currency-initializer"

const inter = Inter({ subsets: ["latin"] })

const siteUrl = "https://jhermesn.dev"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Easy Expenses",
  description: "Nunca foi tão fácil administrar suas finanças.",
  applicationName: "Easy Expenses",
  keywords: [
    "finanças",
    "despesas",
    "controle financeiro",
    "gastos",
    "orçamento",
    "pessoal",
  ],
  category: "finance",
  alternates: {
    canonical: "/easyExpenses/",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Easy Expenses",
  },
  manifest: `/easyExpenses/manifest.json`,
  icons: {
    icon: "/easyExpenses/favicon.ico",
    apple: "/easyExpenses/apple-touch-icon.png",
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
  themeColor: "#1d1f40",
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
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} bg-black text-white`}>
        <LocaleInitializer />
        <CurrencyInitializer />
        {children}
        <AppChrome />
      </body>
    </html>
  )
}
