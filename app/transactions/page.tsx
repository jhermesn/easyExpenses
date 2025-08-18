"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  PieChart,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DatabaseService } from "@/lib/database"
import { formatCurrency, formatDate } from "@/lib/utils"
import { MonthNavigator } from "@/components/month-navigator"
import { InstallmentDeleteDialog } from "@/components/installment-delete-dialog"
import { CategoryOverview } from "@/components/category-overview"
import { exportMonthlyReport } from "@/lib/pdf-export"
import { getLocale, t, tStatic } from "@/lib/i18n"
import { AppLoader } from "@/components/app-loader"

interface Transaction {
  id: string
  categoryId: string
  subcategoryId?: string
  type: "income" | "expense"
  amount: number
  description: string
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
  const isClient = typeof window !== "undefined"
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    categoryId: "all",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    transaction: Transaction | null
  }>({ open: false, transaction: null })

  useEffect(() => {
    loadData()
  }, [currentDate])

  useEffect(() => {
    applyFilters()
  }, [transactions, filters])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const db = DatabaseService.getInstance()
      await db.init()

      const [transactionsData, categoriesData] = await Promise.all([
        db.getTransactionsByMonth(currentDate.getFullYear(), currentDate.getMonth() + 1),
        db.getCategories(),
      ])

      setTransactions(transactionsData)
      setCategories(categoriesData)
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

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.notes?.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((t) => t.type === filters.type)
    }

    // Category filter
    if (filters.categoryId !== "all") {
      filtered = filtered.filter((t) => t.categoryId === filters.categoryId)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(filtered)
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || t("category")
  }

  const getSubcategoryName = (categoryId: string, subcategoryId?: string) => {
    if (!subcategoryId) return null
    const category = categories.find((c) => c.id === categoryId)
    return category?.subcategories.find((s) => s.id === subcategoryId)?.name
  }

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (transaction.installmentInfo) {
      setDeleteDialog({ open: true, transaction })
    } else if (transaction.originalFixedId) {
      // Para transações fixas geradas, perguntar se quer deletar apenas este mês ou o template
      if (confirm(t("fixedTransactionDeleteQuestion"))) {
        // Excluir apenas deste mês - não fazer nada, pois será regenerada
        alert(t("fixedTransactionCannotDeleteIndividually"))
      }
    } else {
      if (confirm(t("confirmDeleteTransaction"))) {
        try {
          const db = DatabaseService.getInstance()
          await db.deleteTransaction(transaction.id)
          await loadData()
        } catch (error) {
          console.error("[ERRO] Erro ao excluir transação:", error)
        }
      }
    }
  }

  const handleInstallmentDelete = async (deleteAll: boolean) => {
    if (!deleteDialog.transaction) return

    try {
      const db = DatabaseService.getInstance()

      if (deleteAll && deleteDialog.transaction.installmentInfo) {
        await db.deleteInstallmentGroup(deleteDialog.transaction.installmentInfo.groupId)
      } else {
        await db.deleteTransaction(deleteDialog.transaction.id)
      }

      await loadData()
      setDeleteDialog({ open: false, transaction: null })
    } catch (error) {
      console.error("[ERRO] Erro ao excluir transação:", error)
    }
  }

  const handleExportPDF = async () => {
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
      alert(t("errorExportingReport"))
    } finally {
      setIsExporting(false)
    }
  }

  const totalIncome = filteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filteredTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  if (!isClient || !mounted) return <AppLoader />

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-400 text-lg">{tStatic("loading")}</div>
      </div>
    )
  }

  return (
      <div className="min-h-screen text-white p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
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
          <div className="flex space-x-3">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting || transactions.length === 0}
              className="bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm border border-blue-500/30 shadow-lg disabled:opacity-50"
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
              className="bg-green-600/80 hover:bg-green-600 backdrop-blur-sm border border-green-500/30 shadow-lg"
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
                    <SelectItem value="income">{t("income")}</SelectItem>
                    <SelectItem value="expense">{t("expenses")}</SelectItem>
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
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-white">{transaction.description}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
                              transaction.type === "income"
                                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                                : "bg-red-600/20 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {transaction.type === "income" ? "Entrada" : "Saída"}
                          </span>
                          {transaction.transactionType === "fixed" && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                              Fixa
                            </span>
                          )}
                          {transaction.originalFixedId && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                              Fixa
                            </span>
                          )}
                          {transaction.installmentInfo && (
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30">
                              {transaction.installmentInfo.current}/{transaction.installmentInfo.total}
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-400 space-y-1">
                          <div>Categoria: {getCategoryName(transaction.categoryId)}</div>
                          {transaction.subcategoryId && (
                            <div>
                              Subcategoria: {getSubcategoryName(transaction.categoryId, transaction.subcategoryId)}
                            </div>
                          )}
                          <div>Data: {formatDate(new Date(transaction.date))}</div>
                          {transaction.notes && <div>Obs: {transaction.notes}</div>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div
                          className={`text-lg font-bold ${
                            transaction.type === "income" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>

                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <InstallmentDeleteDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, transaction: null })}
          onConfirm={handleInstallmentDelete}
          currentInstallment={deleteDialog.transaction?.installmentInfo?.current || 1}
          totalInstallments={deleteDialog.transaction?.installmentInfo?.total || 1}
        />
      </div>
    </div>
  )
}
