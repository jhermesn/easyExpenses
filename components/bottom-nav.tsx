"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSelectedPeriod } from "@/lib/period-store"
import { Button } from "@/components/ui/button"
import { Home, Layers, TrendingUp, Settings } from "lucide-react"
import { t } from "@/lib/i18n"
import { useUIStore } from "@/lib/ui-store"
import { DatabaseService } from "@/lib/database"

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [hide, setHide] = useState(false)
  const { year, month } = useSelectedPeriod()
  const isOnboarding = useUIStore((s) => s.isOnboarding)
  const [hasData, setHasData] = useState<boolean>(true)

  useEffect(() => {
    setHide(false)
  }, [pathname, year, month])

  useEffect(() => {
    let isActive = true
    const checkData = async () => {
      try {
        const db = DatabaseService.getInstance()
        await db.init()
        const categories = await db.getCategories()
        if (!isActive) return
        if (categories.length > 0) {
          setHasData(true)
          return
        }
        const now = new Date()
        const transactions = await db.getTransactionsByMonth(now.getFullYear(), now.getMonth() + 1)
        if (!isActive) return
        setHasData(transactions.length > 0)
      } catch {
        if (!isActive) return
        setHasData(false)
      }
    }
    checkData()
    return () => {
      isActive = false
    }
  }, [])

  const isActive = (target: string) => {
    if (target === "/" && pathname === "/") return true
    if (target !== "/" && pathname.startsWith(target)) return true
    return false
  }

  useEffect(() => {
    setHide(false)
  }, [pathname, year, month])

  if (hide || isOnboarding || !hasData) return null

  return (
    <nav className="sticky bottom-0 bg-black/40 backdrop-blur-xl border-t border-white/10 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={() => {
              router.push(`/`)
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
            onClick={() => router.push(`/categories`)}
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
              router.push(`/transactions`)
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
            onClick={() => router.push(`/settings`)}
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
