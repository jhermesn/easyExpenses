"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, Layers, TrendingUp, Settings } from "lucide-react"
import { t } from "@/lib/i18n"

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [hide, setHide] = useState(false)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)

  const readYearMonth = () => {
    let y = NaN
    let m = NaN
    try {
      const sp = new URLSearchParams(window.location.search)
      const yQ = Number.parseInt(sp.get("year") || "")
      const mQ = Number.parseInt(sp.get("month") || "")
      if (Number.isFinite(yQ)) y = yQ
      if (Number.isFinite(mQ) && mQ >= 1 && mQ <= 12) m = mQ
    } catch {}

    if (!Number.isFinite(y) || !Number.isFinite(m)) {
      try {
        const yLs = Number.parseInt(localStorage.getItem("selectedYear") || "")
        const mLs = Number.parseInt(localStorage.getItem("selectedMonth") || "")
        if (!Number.isFinite(y) && Number.isFinite(yLs)) y = yLs
        if (!Number.isFinite(m) && Number.isFinite(mLs) && mLs >= 1 && mLs <= 12) m = mLs
      } catch {}
    }

    if (!Number.isFinite(y) || !Number.isFinite(m)) {
      const now = new Date()
      y = now.getFullYear()
      m = now.getMonth() + 1
    }
    return { y, m }
  }

  useEffect(() => {
    const { y, m } = readYearMonth()
    setYear(y)
    setMonth(m)
  }, [pathname])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "selectedYear" || e.key === "selectedMonth") {
        try {
          const { y, m } = readYearMonth()
          setYear(y)
          setMonth(m)
        } catch {}
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const isActive = (target: string) => {
    if (target === "/" && pathname === "/") return true
    if (target !== "/" && pathname.startsWith(target)) return true
    return false
  }

  useEffect(() => {
    setHide(false)
  }, [pathname, year, month])

  if (hide) return null

  return (
    <nav className="sticky bottom-0 bg-black/40 backdrop-blur-xl border-t border-white/10 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={() => {
              const { y, m } = readYearMonth()
              router.push(`/?year=${y}&month=${m}`)
            }}
            variant="ghost"
            className={`h-14 md:h-16 bg-black/40 backdrop-blur-xl border ${
              isActive("/") ? "border-green-500/50" : "border-white/10"
            } hover:border-green-500/50 hover:bg-green-600/20 text-white shadow-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-1`}
          >
            <Home className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            <span className="hidden sm:inline text-[10px] md:text-xs truncate">{t("dashboard")}</span>
          </Button>

          <Button
            onClick={() => router.push("/categories")}
            variant="ghost"
            className={`h-14 md:h-16 bg-black/40 backdrop-blur-xl border ${
              isActive("/categories") ? "border-purple-500/50" : "border-white/10"
            } hover:border-purple-500/50 hover:bg-purple-600/20 text-white shadow-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-1`}
          >
            <Layers className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            <span className="hidden sm:inline text-[10px] md:text-xs truncate">{t("categories")}</span>
          </Button>

          <Button
            onClick={() => {
              const { y, m } = readYearMonth()
              router.push(`/transactions?year=${y}&month=${m}`)
            }}
            variant="ghost"
            className={`h-14 md:h-16 bg-black/40 backdrop-blur-xl border ${
              isActive("/transactions") ? "border-blue-500/50" : "border-white/10"
            } hover:border-blue-500/50 hover:bg-blue-600/20 text-white shadow-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-1`}
          >
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            <span className="hidden sm:inline text-[10px] md:text-xs truncate">{t("transactionsAndReports")}</span>
          </Button>

          <Button
            onClick={() => router.push("/settings")}
            variant="ghost"
            className={`h-14 md:h-16 bg-black/40 backdrop-blur-xl border ${
              isActive("/settings") ? "border-gray-500/50" : "border-white/10"
            } hover:border-gray-500/50 hover:bg-gray-600/20 text-white shadow-2xl transition-all duration-300 flex flex-col items-center justify-center space-y-1`}
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <span className="hidden sm:inline text-[10px] md:text-xs truncate">{t("settings")}</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
