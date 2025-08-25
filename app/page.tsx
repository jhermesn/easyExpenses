"use client"

import { useEffect, useState } from "react"
import { AppLoader } from "@/components/app-loader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, PieChart, Layers, Sparkles, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { DatabaseService } from "@/lib/database"
import { formatCurrency } from "@/lib/utils"
import { MonthNavigator } from "@/components/month-navigator"
import { useSelectedPeriod } from "@/lib/period-store"
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
  const isClient = typeof window !== "undefined"
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
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
  const [hasData, setHasData] = useState(false)
  const router = useRouter()

  

  useEffect(() => {
    loadDashboardData()
  }, [currentDate])

  // Sync store when month changes via UI
  useEffect(() => {
    setFromDate(currentDate)
  }, [currentDate, setFromDate])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      const db = DatabaseService.getInstance()

      // Ensure database is initialized
      await db.init()

      const categories = await db.getCategories()
      const transactions = await db.getTransactionsByMonth(currentDate.getFullYear(), currentDate.getMonth() + 1)

      const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

      setData({
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        categories,
        transactions,
      })

      setHasData(categories.length > 0 || transactions.length > 0)
    } catch (error) {
      console.error("[ERRO] Erro ao carregar dados:", error)
      // Set empty data on error
      setData({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        categories: [],
        transactions: [],
      })
      setHasData(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isClient || !mounted) return <AppLoader />

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-green-400 text-lg">
            {tStatic("loading")}
          </span>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <Card className="relative bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header with gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green-500/20 to-transparent"></div>

            <CardHeader className="relative text-center pt-12 pb-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-blue-400 text-4xl font-bold animate-bounce">$</span>
                  <span className="absolute -bottom-2 -left-2 text-purple-400 text-3xl font-bold animate-bounce delay-300">£</span>
                </div>
              </div>

              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent mb-4">
                {t("welcome")}
              </CardTitle>

              <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">{t("welcomeMessage")}</p>
            </CardHeader>

            <CardContent className="relative space-y-8 pb-12">
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-green-500/30 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Layers className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{t("organizeByCategoriesTitle")}</h3>
                  <p className="text-gray-400 text-sm">{t("organizeByCategoriesDesc")}</p>
                </div>

                <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{t("completeControlTitle")}</h3>
                  <p className="text-gray-400 text-sm">{t("completeControlDesc")}</p>
                </div>

                <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <PieChart className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{t("visualReportsTitle")}</h3>
                  <p className="text-gray-400 text-sm">{t("visualReportsDesc")}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={() => router.push("/categories")}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 backdrop-blur-sm border border-green-500/30 shadow-2xl text-white font-semibold py-4 text-lg group transition-all duration-300"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Layers className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>{t("createCategories")}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Button>
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 mt-8">
                <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>{t("quickTip")}</span>
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {t("quickTipText")}
                </p>
              </div>

              {/* PWA Info */}
              <div className="text-center pt-6 border-t border-white/10">
                <p className="text-gray-400 text-sm">💡 {t("pwaInfo")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                // fallback to logo if icon is not available
                (e.currentTarget as HTMLImageElement).src = "/easyExpenses/logo.png"
              }}
              alt="Easy Expenses Icon"
              className="w-8 h-8 rounded-md"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Easy Expenses
            </h1>
          </div>
          <Button
            onClick={() => router.push("/transactions/add")}
            aria-label={t("newTransaction")}
            className="bg-green-600/80 hover:bg-green-600 backdrop-blur-sm border border-green-500/30 shadow-lg px-0 md:px-6 w-10 h-10 md:w-auto md:h-auto rounded-full md:rounded-md"
          >
            <Plus className="w-5 h-5 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden md:inline">{t("newTransaction")}</span>
          </Button>
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
