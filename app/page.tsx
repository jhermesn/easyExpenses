"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DatabaseService } from "@/lib/database"
import { useUIStore } from "@/lib/ui-store"
import { useSelectedPeriod } from "@/lib/period-store"
import { AppLoader } from "@/components/app-loader"
import { Onboarding } from "@/components/onboarding"
import { useClientMount } from "@/lib/use-client-mount"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, PieChart, HelpCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { MonthNavigator } from "@/components/month-navigator"
import { TransactionChart } from "@/components/transaction-chart"
import { CategoryOverview } from "@/components/category-overview"
import { t, tStatic } from "@/lib/i18n"

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  balance: number
  categories: any[]
  transactions: any[]
}

export default function Dashboard() {
  const mounted = useClientMount()
  const setIsOnboarding = useUIStore((s) => s.setIsOnboarding)
  const [data, setData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    categories: [],
    transactions: [],
  })
  const { year, month, setFromDate } = useSelectedPeriod()
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1))
  const [isLoading, setIsLoading] = useState(true)
  const isOnboarding = useUIStore((s) => s.isOnboarding)
  const router = useRouter()

  useEffect(() => {
    loadDashboardData()
  }, [currentDate])

  useEffect(() => {
    setFromDate(currentDate)
  }, [currentDate, setFromDate])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const db = DatabaseService.getInstance()

      const categories = await db.getCategories()
      const transactions = await db.getTransactionsByMonth(currentDate.getFullYear(), currentDate.getMonth() + 1)

      const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
      const balance = totalIncome - totalExpenses

      setData({
        totalIncome,
        totalExpenses,
        balance,
        categories,
        transactions,
      })

      if (categories.length === 0 && transactions.length === 0) {
        setIsOnboarding(true)
      } else {
        setIsOnboarding(false)
      }
    } catch (error) {
      console.error("[ERRO] Erro ao carregar dados do dashboard:", error)
      setIsOnboarding(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return <AppLoader />

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-400 text-lg">{t("loading")}</span>
        </div>
      </div>
    )
  }

  if (isOnboarding) {
    return <Onboarding />
  }

  return (
      <div className="min-h-screen text-white p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src="/easyExpenses/icon.png"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/easyExpenses/logo.png"
              }}
              alt="Easy Expenses Icon"
              className="w-8 h-8 rounded-md"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Easy Expenses
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => router.push("/help")}
              variant="ghost"
              aria-label="Help"
              className="text-gray-300 hover:bg-white/10"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => router.push("/transactions/add")}
              aria-label={t("newTransaction")}
              className="bg-green-600/80 hover:bg-green-600 backdrop-blur-sm border border-green-500/30 shadow-lg px-0 md:px-6 w-10 h-10 md:w-auto md:h-auto rounded-full md:rounded-md"
            >
              <Plus className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">{t("newTransaction")}</span>
            </Button>
          </div>
        </div>

        {/* Month Navigator */}
        <MonthNavigator currentDate={currentDate} onDateChange={setCurrentDate} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-green-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{t("income")}</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(data.totalIncome)}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-red-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{t("expenses")}</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{formatCurrency(data.totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-blue-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{t("balance")}</CardTitle>
              <PieChart className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.balance >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(data.balance)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 h-[760px]">
            <TransactionChart transactions={data.transactions} />
          </div>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 h-[760px] overflow-y-auto">
            <CategoryOverview categories={data.categories} transactions={data.transactions} />
          </div>
        </div>
      </div>
      </div>
  )
}
