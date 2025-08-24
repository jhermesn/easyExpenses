"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Pencil } from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { t, tStatic } from "@/lib/i18n"
import { AppLoader } from "@/components/app-loader"

interface Subcategory {
  id: string
  name: string
  percentage?: number
}

interface Category {
  id: string
  name: string
  hasRules: boolean
  subcategories: Subcategory[]
}

interface Transaction {
  id: string
  categoryId: string
  subcategoryId?: string
  type: "income" | "expense"
  amount: number
  title: string
  transactionType: "fixed" | "unique" | "installment"
  date: Date
  dayOfMonth?: number
  installmentInfo?: {
    current: number
    total: number
    groupId: string
  }
  notes?: string
  createdAt: Date
  originalFixedId?: string
}

export default function EditTransactionStaticPage() {
  const isClient = typeof window !== "undefined"
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const router = useRouter()
  const [transactionId, setTransactionId] = useState<string>("")
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search)
      const id = sp.get("id") || ""
      setTransactionId(id)
    } catch {}
  }, [])

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRenamingAll, setIsRenamingAll] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [original, setOriginal] = useState<Transaction | null>(null)

  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    categoryId: "",
    subcategoryId: "",
    amount: "",
    title: "",
    transactionType: "unique" as "fixed" | "unique" | "installment",
    date: new Date().toISOString().split("T")[0],
    dayOfMonth: "1",
    notes: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const db = DatabaseService.getInstance()
        await db.init()
        const [cats, tx] = await Promise.all([
          db.getCategories(),
          transactionId ? db.getTransaction(transactionId) : Promise.resolve(undefined),
        ])
        setCategories(cats)
        if (tx) {
          setOriginal(tx)
          const baseTitle = tx.installmentInfo
            ? String(tx.title).replace(/\s*\(\d+\s*\/\s*\d+\)\s*$/, "").trim()
            : tx.title
          setFormData({
            type: tx.type,
            categoryId: tx.categoryId,
            subcategoryId: tx.subcategoryId || "",
            amount: String(tx.amount),
            title: baseTitle,
            transactionType: tx.installmentInfo ? "installment" : tx.transactionType,
            date: new Date(tx.date).toISOString().split("T")[0],
            dayOfMonth: String(tx.dayOfMonth || 1),
            notes: tx.notes || "",
          })
        }
      } catch (error) {
        console.error("[ERRO] Erro ao carregar transação:", error)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [transactionId])

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === formData.categoryId),
    [categories, formData.categoryId],
  )
  const subcategoriesTotal = (selectedCategory?.subcategories ?? []).reduce(
    (sum, s) => sum + (s.percentage || 0),
    0,
  )
  const isRuleSum100 = !!selectedCategory?.hasRules && subcategoriesTotal === 100

  const validateForm = () => {
    const newErrors: string[] = []
    if (!formData.categoryId) newErrors.push(`${t("category")} ${t("required")}`)

    const amountNum = Number.parseFloat(formData.amount)
    if (!formData.amount || !Number.isFinite(amountNum) || amountNum <= 0) newErrors.push(t("invalidAmount"))

    if (!formData.title.trim()) newErrors.push(`${t("title")} ${t("required")}`)

    // Exigir subcategoria apenas quando categoria tem regras e a soma = 100%
    if (formData.type === "expense" && isRuleSum100 && !formData.subcategoryId) {
      newErrors.push(t("subcategoryRequiredForRuleBasedExpense"))
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!original) return
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const db = DatabaseService.getInstance()
      const updated: Transaction = {
        ...original,
        categoryId: formData.categoryId,
        subcategoryId: original.type === "expense" ? formData.subcategoryId || undefined : undefined,
        amount: Number.parseFloat(formData.amount),
        title: formData.title,
        notes: formData.notes || undefined,
      }

      if (original.installmentInfo) {
        updated.date = new Date(formData.date)
        updated.transactionType = "unique"
      } else if (original.transactionType === "fixed") {
        updated.dayOfMonth = Number.parseInt(formData.dayOfMonth)
        updated.transactionType = "fixed"
      } else {
        updated.date = new Date(formData.date)
        updated.transactionType = "unique"
      }

      await db.updateTransaction(updated)
      router.push("/")
    } catch (error) {
      console.error("[ERRO] Erro ao salvar transação:", error)
      setErrors(["Erro ao salvar transação. Tente novamente."])
    } finally {
      setIsSaving(false)
    }
  }

  const handleRenameAll = async () => {
    if (!original?.installmentInfo) return
    if (!formData.title.trim()) return
    setIsRenamingAll(true)
    try {
      const base = formData.title.replace(/\s*\(\d+\s*\/\s*\d+\)\s*$/, "").trim()
      const db = DatabaseService.getInstance()
      await db.renameInstallmentGroup(original.installmentInfo.groupId, base)
      router.push("/")
    } catch (error) {
      console.error("[ERRO] Erro ao renomear parcelas:", error)
    } finally {
      setIsRenamingAll(false)
    }
  }

  if (!isClient || !mounted) return <AppLoader />

  if (isLoading || !original) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-400 text-lg">{tStatic("loading")}</div>
      </div>
    )
  }

  const isFixed = original.transactionType === "fixed"

  return (
      <div className="min-h-screen text-white p-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
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
              {t("edit")} {t("transaction")}
            </h1>
            <p className="text-gray-400 mt-1">{t("transactionsPageSubtitle")}</p>
          </div>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Pencil className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xl">{t("edit")} {original.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2">{t("fixErrors")}</h4>
                  <ul className="text-red-300 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Type (read-only) and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("transactionType")}</Label>
                  <Input value={original.type === "income" ? t("income") : t("expenses")} disabled className="bg-black/40 backdrop-blur-sm border-white/10 text-white" />
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("category")}</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value, subcategoryId: "" }))}
                  >
                    <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white hover:border-green-500/50 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subcategory */}
              {original.type === "expense" && (selectedCategory?.subcategories?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("subcategory")}</Label>
                  <Select value={formData.subcategoryId} onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategoryId: value }))}>
                    <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white hover:border-green-500/50 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                      {(selectedCategory?.subcategories ?? []).map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Amount and Transaction Type (read-only) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("amount")}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    className="bg-black/40 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 transition-all duration-300"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("transactionType")}</Label>
                  <Input
                    value={
                      formData.transactionType === "unique"
                        ? t("unique")
                        : formData.transactionType === "fixed"
                        ? t("fixed")
                        : t("installment")
                    }
                    disabled
                    className="bg-black/40 backdrop-blur-sm border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <Label className="text-gray-300 text-sm font-medium">{t("title")}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-black/40 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 transition-all duration-300"
                />
              </div>

              {/* Date / Day of month */}
              {original.transactionType !== "fixed" && (
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("date")}</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                    className="bg-black/40 backdrop-blur-sm border-white/10 text-white focus:border-green-500/50 transition-all duration-300"
                  />
                </div>
              )}

              {original.transactionType === "fixed" && (
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("dayOfMonth")}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dayOfMonth: e.target.value }))}
                    className="bg-black/40 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 transition-all duration-300"
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-3">
                <Label className="text-gray-300 text-sm font-medium">{t("notes")} <span className="text-gray-500">({t("optional")})</span></Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 transition-all duration-300"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-green-600/80 hover:bg-green-600 backdrop-blur-sm border border-green-500/30 shadow-lg disabled:opacity-50 py-3"
                >
                  {isSaving ? t("saving") : t("save")}
                </Button>
                {original.installmentInfo && (
                  <Button
                    type="button"
                    onClick={handleRenameAll}
                    disabled={isRenamingAll || !formData.title.trim()}
                    className="flex-1 bg-blue-600/80 hover:bg-blue-600 backdrop-blur-sm border border-blue-500/30 shadow-lg disabled:opacity-50 py-3"
                  >
                    {t("renameAllInstallments")}
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 backdrop-blur-sm py-3"
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


