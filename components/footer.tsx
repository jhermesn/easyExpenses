"use client"

import Link from "next/link"
import { t, tStatic } from "@/lib/i18n"
import { useEffect, useState } from "react"

export function Footer() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const tr = (key: Parameters<typeof t>[0]) => (mounted ? t(key) : tStatic(key))
  const year = new Date().getFullYear()
  return (
    <footer className="mt-0 bg-black/40 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-6 text-xs sm:text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="opacity-80">
          <Link href="https://jhermesn.dev/easyExpenses" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
            {tr("appName")}
          </Link>
        </span>
        <span className="opacity-80 text-center sm:text-right">
          © {year} {tr("by")} <span className="text-white/90">
            <Link href="https://jhermesn.dev" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              {tr("author")}
            </Link>
          </span> {tr("licensedUnder")} {" "}
          <Link href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
            {tr("licenseShortName")}
          </Link>
        </span>
      </div>
    </footer>
  )
}


