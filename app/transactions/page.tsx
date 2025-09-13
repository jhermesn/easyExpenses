"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DatabaseService } from "@/lib/database"
import { useSelectedPeriod } from "@/lib/period-store"
import { AppLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { exportMonthlyReport } from "@/lib/pdf-export"
import { formatCurrencyI18n as formatCurrency, getLocale, t } from "@/lib/i18n"
import { formatDate } from "@/lib/utils"
import { useClientMount } from "@/lib/use-client-mount"
import {
  ArrowLeft,
  Download,
  FileText,
  Plus,
  TrendingDown,
  TrendingUp,
  Edit,
  Trash2,
  PieChart,
  Filter,
  Search,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MonthNavigator } from "@/components/month-navigator"
import { CategoryOverview } from "@/components/category-overview"

interface Transaction {
  id: string
  categoryId: string
  subcategoryId?: string
  type: "income" | "expense"
  amount: number
  title: string
  transactionType: "fixed" | "unique" | "installment"
  date: Date
  installmentInfo?: {
    current: number
    total: number
    groupId: string
  }
  notes?: string
  originalFixedId?: string
}

interface Category {
  id: string
  name: string
  hasRules: boolean
  subcategories: { id: string; name: string; percentage?: number }[]
}

export default function TransactionsPage() {
  const mounted = useClientMount()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const { year, month, setFromDate } = useSelectedPeriod()
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1))
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    categoryId: "all",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  const [dialogState, setDialogState] = useState<{
    open: boolean
    title: string
    description?: string
    actions: Array<{ label: string; color?: "default" | "yellow" | "red"; onClick: () => void }>
  }>({ open: false, title: "", description: "", actions: [] })

  useEffect(() => {
    loadData()
  }, [currentDate])

  useEffect(() => {
    setFromDate(currentDate)
  }, [currentDate, setFromDate])

  useEffect(() => {
    applyFilters()
  }, [transactions, filters])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const db = DatabaseService.getInstance()
      const [loadedTransactions, loadedCategories] = await Promise.all([
        db.getTransactionsByMonth(currentDate.getFullYear(), currentDate.getMonth() + 1),
        db.getCategories(),
      ])
      setTransactions(loadedTransactions)
      setCategories(loadedCategories)
    } catch (error) {
      console.error("[ERRO] Erro ao carregar dados:", error)
      setTransactions([])
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    if (filters.search) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.notes?.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type)
    }

    if (filters.categoryId !== "all") {
      filtered = filtered.filter((t) => t.categoryId === filters.categoryId)
    }

    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(filtered)
  }

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || "N/A"
  }

  const getSubcategoryName = (catId: string, subId?: string) => {
    if (!subId) return ""
    const category = categories.find((c) => c.id === catId)
    return category?.subcategories.find((s) => s.id === subId)?.name || ""
  }

  const handleDeleteTransaction = (transaction: Transaction) => {
    if (transaction.installmentInfo) {
      setDialogState({
        open: true,
        title: t("confirmDeleteInstallmentTitle"),
        description: t("confirmDeleteInstallmentDescription"),
        actions: [
          {
            label: t("delete"),
            color: "red",
            onClick: async () => {
              try {
                const db = DatabaseService.getInstance()
                await db.deleteTransaction(transaction.id)
                await loadData()
              } catch (error) {
                console.error("[ERRO] Erro ao deletar transação:", error)
              }
              setDialogState({ ...dialogState, open: false })
            },
          },
          {
            label: t("deleteAll"),
            color: "red",
            onClick: async () => {
              try {
                const db = DatabaseService.getInstance()
                await db.deleteTransactionsByGroup(transaction.installmentInfo!.groupId)
                await loadData()
              } catch (error) {
                console.error("[ERRO] Erro ao deletar parcelas:", error)
              }
              setDialogState({ ...dialogState, open: false })
            },
          },
        ],
      })
    } else if (transaction.originalFixedId) {
      setDialogState({
        open: true,
        title: t("confirmDeleteFixedTitle"),
        description: t("confirmDeleteFixedDescription"),
        actions: [
          {
            label: t("delete"),
            color: "red",
            onClick: async () => {
              try {
                const db = DatabaseService.getInstance()
                await db.deleteTransaction(transaction.id)
                await loadData()
              } catch (error) {
                console.error("[ERRO] Erro ao deletar transação:", error)
              }
              setDialogState({ ...dialogState, open: false })
            },
          },
        ],
      })
    } else {
      setDialogState({
        open: true,
        title: t("confirmDeleteSingleTitle"),
        description: t("confirmDeleteSingleDescription"),
        actions: [
          {
            label: t("delete"),
            color: "red",
            onClick: async () => {
              try {
                const db = DatabaseService.getInstance()
                await db.deleteTransaction(transaction.id)
                await loadData()
              } catch (error) {
                console.error("[ERRO] Erro ao deletar transação:", error)
              }
              setDialogState({ ...dialogState, open: false })
            },
          },
        ],
      })
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
      const monthName = new Intl.DateTimeFormat(getLocale(), { month: "long" }).format(currentDate)

      const reportData = {
        month: monthName,
        year: currentDate.getFullYear(),
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        transactions,
        categories,
      }

      await exportMonthlyReport(reportData)
    } catch (error) {
      console.error("[ERRO] Erro ao exportar relatório:", error)
      setDialogState({
        open: true,
        title: t("error"),
        description: t("errorExportingReport"),
        actions: [
          {
            label: t("ok"),
            onClick: () => setDialogState((s) => ({ ...s, open: false })),
          },
        ],
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    const monthName = new Intl.DateTimeFormat(getLocale(), { month: "long" }).format(currentDate)
    const totalIncome = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    await exportMonthlyReport({
      month: monthName,
      year,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactions: filteredTransactions,
      categories,
    })
    setIsExporting(false)
  }

  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

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

  return (
      <div className="min-h-screen text-white p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/`)}
              className="text-green-400 hover:bg-green-600/20 backdrop-blur-sm border border-green-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                {t("transactionsAndReports")}
              </h1>
              <p className="text-gray-400 mt-1">{t("transactionsPageSubtitle")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto sm:ml-auto sm:flex sm:flex-row sm:gap-3">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting || transactions.length === 0}
              className="h-11 bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm border border-blue-500/30 shadow-lg disabled:opacity-50 w-full sm:w-auto"
            >
              {isExporting ? (
                <>
                  <FileText className="w-4 h-4 mr-2 animate-spin" />
                  {t("exporting")}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {t("exportPDF")}
                </>
              )}
            </Button>
            <Button
              onClick={() => router.push("/transactions/add")}
              aria-label={t("newTransaction")}
              className="h-11 bg-green-600/80 hover:bg-green-600 backdrop-blur-sm border border-green-500/30 shadow-lg w-full sm:w-auto rounded-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("newTransaction")}
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
              <div className="text-2xl font-bold text-green-400">{formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-red-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{t("expenses")}</CardTitle>
              <TrendingDown className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-blue-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{t("balance")}</CardTitle>
              <PieChart className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {formatCurrency(totalIncome - totalExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Overview */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6">
          <CategoryOverview categories={categories} transactions={transactions} />
        </div>

        {/* Filters */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>{t("filter")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">{t("search")}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="bg-black/40 backdrop-blur-sm border-white/10 text-white pl-10 placeholder:text-gray-500"
                    placeholder={t("searchByTitlePlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">{t("transactionType")}</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                    <SelectItem value="all">{t("all")}</SelectItem>
                    <SelectItem value="income">{t("incomeShort")}</SelectItem>
                    <SelectItem value="expense">{t("expenseShort")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">{t("category")}</label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                    <SelectItem value="all">{t("all")}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">{t("transactions")} ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">{t("noTransactionsFound")}</p>
                <Button
                  onClick={() => router.push("/transactions/add")}
                  className="bg-green-600/80 hover:bg-green-600 backdrop-blur-sm border border-green-500/30"
                >
                  {t("addFirstTransaction")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-lg font-bold ${
                            transaction.type === "income" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          <span className="whitespace-nowrap">{formatCurrency(transaction.amount)}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const idToEdit = transaction.originalFixedId || transaction.id
                              router.push(`/transactions/edit?id=${idToEdit}`)
                            }}
                            className="text-blue-400 hover:bg-blue-600/20 backdrop-blur-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="text-red-400 hover:bg-red-600/20 backdrop-blur-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap gap-x-3 gap-y-2">
                        <h3 className="font-medium text-white break-words">{transaction.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                            transaction.type === "income"
                              ? "bg-green-600/20 text-green-400 border border-green-500/30"
                              : "bg-red-600/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {transaction.type === "income" ? t("incomeShort") : t("expenseShort")}
                        </span>
                        {transaction.transactionType === "fixed" && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            {t("fixedShort")}
                          </span>
                        )}
                        {transaction.originalFixedId && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            {t("fixedShort")}
                          </span>
                        )}
                        {transaction.installmentInfo && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30">
                            {transaction.installmentInfo.current}/{transaction.installmentInfo.total}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-400 space-y-1">
                        <div>{t("category")}: {getCategoryName(transaction.categoryId)}</div>
                        {transaction.subcategoryId && (
                          <div>
                            {t("subcategory")}: {getSubcategoryName(transaction.categoryId, transaction.subcategoryId)}
                          </div>
                        )}
                        <div>{t("date")}: {formatDate(new Date(transaction.date))}</div>
                        {transaction.notes && <div>{t("notes")}: {transaction.notes}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <ConfirmDialog
          open={dialogState.open}
          onOpenChange={(open) => setDialogState((s) => ({ ...s, open }))}
          title={dialogState.title}
          description={dialogState.description}
          actions={dialogState.actions}
          cancelLabel={t("cancel")}
        />
      </div>
    </div>
  )
}
