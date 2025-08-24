"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { DatabaseService } from "@/lib/database"
import { formatCurrency } from "@/lib/utils"
import { t, tStatic } from "@/lib/i18n"
import { AppLoader } from "@/components/app-loader"

interface Category {
  id: string
  name: string
  hasRules: boolean
  subcategories: Subcategory[]
}

interface Subcategory {
  id: string
  name: string
  percentage?: number
}

export default function AddTransactionPage() {
  const isClient = typeof window !== "undefined"
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    categoryId: "",
    subcategoryId: "",
    amount: "",
    title: "",
    transactionType: "unique" as "fixed" | "unique" | "installment",
    date: new Date().toISOString().split("T")[0],
    dayOfMonth: "1",
    installments: "1",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    loadCategories()
  }, [])

  // Reset transaction type when changing to income
  useEffect(() => {
    if (formData.type === "income" && formData.transactionType === "installment") {
      setFormData((prev) => ({ ...prev, transactionType: "unique" }))
    }
  }, [formData.type])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const db = DatabaseService.getInstance()
      await db.init()
      const data = await db.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("[ERRO] Erro ao carregar categorias:", error)
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId)
  const subcategoriesTotal = (selectedCategory?.subcategories ?? []).reduce(
    (sum, s) => sum + (s.percentage || 0),
    0,
  )
  const isRuleSum100 = !!selectedCategory?.hasRules && subcategoriesTotal === 100

  // Get available transaction types based on income/expense
  const getAvailableTransactionTypes = () => {
    if (formData.type === "income") {
      return [
        { value: "unique", label: t("unique") },
        { value: "fixed", label: t("fixed") },
      ]
    } else {
      return [
        { value: "unique", label: t("unique") },
        { value: "fixed", label: t("fixed") },
        { value: "installment", label: t("installment") },
      ]
    }
  }

  const validateForm = () => {
    const newErrors: string[] = []

    if (!formData.categoryId) {
      newErrors.push(`${t("category")} ${t("required")}`)
    }

    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      newErrors.push(t("invalidAmount"))
    }

    if (!formData.title.trim()) {
      newErrors.push(`${t("title")} ${t("required")}`)
    }

    if (formData.transactionType === "installment") {
      const installmentsNumber = Number.parseInt(formData.installments)
      if (!Number.isFinite(installmentsNumber) || installmentsNumber < 2) {
        newErrors.push(t("invalidInstallments"))
      }
    }

    // Entradas não podem ser parceladas
    if (formData.type === "income" && formData.transactionType === "installment") {
      newErrors.push(t("incomeCannotBeInstallment"))
    }

    // Exigir subcategoria apenas quando categoria tem regras e a soma = 100%
    if (formData.type === "expense" && isRuleSum100 && !formData.subcategoryId) {
      newErrors.push(t("subcategoryRequiredForRuleBasedExpense"))
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSaving(true)

    try {
      const db = DatabaseService.getInstance()
      const amount = Number.parseFloat(formData.amount)
      const installments = Number.parseInt(formData.installments)

      if (formData.transactionType === "installment") {
        // Criar múltiplas transações para parcelamento (apenas para saídas)
        const groupId = crypto.randomUUID()
        const baseDate = new Date(formData.date)

        for (let i = 0; i < installments; i++) {
          const installmentDate = new Date(baseDate)
          installmentDate.setMonth(installmentDate.getMonth() + i)

          await db.addTransaction({
            categoryId: formData.categoryId,
            subcategoryId: formData.subcategoryId || undefined,
            type: formData.type,
            amount: amount / installments,
            title: `${formData.title} (${i + 1}/${installments})`,
            transactionType: "unique",
            date: installmentDate,
            installmentInfo: {
              current: i + 1,
              total: installments,
              groupId,
            },
            notes: formData.notes || undefined,
          })
        }
      } else {
        await db.addTransaction({
          categoryId: formData.categoryId,
          subcategoryId: formData.type === "expense" ? formData.subcategoryId || undefined : undefined, // Subcategoria apenas para saídas
          type: formData.type,
          amount,
          title: formData.title,
          transactionType: formData.transactionType,
          date: formData.transactionType === "fixed" ? new Date() : new Date(formData.date),
          dayOfMonth: formData.transactionType === "fixed" ? Number.parseInt(formData.dayOfMonth) : undefined,
          notes: formData.notes || undefined,
        })
      }

      router.push("/")
    } catch (error) {
      console.error("[ERRO] Erro ao salvar transação:", error)
      setErrors(["Erro ao salvar transação. Tente novamente."])
    } finally {
      setIsSaving(false)
    }
  }

  if (!isClient || !mounted) return <AppLoader />

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-400 text-lg">{tStatic("loading")}</div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-green-400 text-2xl">{t("noCategoriesYet")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-300 text-center leading-relaxed">{t("createFirstCategoryPrompt")}</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/categories")}
                className="w-full bg-green-600/80 hover:bg-green-600 backdrop-blur-sm border border-green-500/30 shadow-lg"
              >
                {t("createCategories")}
              </Button>
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                className="w-full border-white/20 text-gray-300 hover:bg-white/10 backdrop-blur-sm"
              >
                {t("dashboard")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              {t("newTransaction")}
            </h1>
            <p className="text-gray-400 mt-1">{t("transactionsPageSubtitle")}</p>
          </div>
        </div>

        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xl">{t("addTransaction")}</span>
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

              {/* Type and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("transactionType")}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "income" | "expense") =>
                      setFormData((prev) => ({
                        ...prev,
                        type: value,
                        categoryId: "",
                        subcategoryId: "",
                        transactionType:
                          value === "income" && prev.transactionType === "installment"
                            ? "unique"
                            : prev.transactionType,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white hover:border-green-500/50 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                      <SelectItem value="income">{t("income")}</SelectItem>
                      <SelectItem value="expense">{t("expenses")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("category")}</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: value, subcategoryId: "" }))
                    }
                  >
                    <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white hover:border-green-500/50 transition-all duration-300">
                      <SelectValue placeholder={t("selectACategory")} />
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

              {/* Subcategory of expenses */}
              {formData.type === "expense" && (selectedCategory?.subcategories?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">
                    {t("subcategory")} {isRuleSum100 && <span className="text-red-400">*</span>}
                  </Label>
                  <Select
                    value={formData.subcategoryId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategoryId: value }))}
                  >
                    <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white hover:border-green-500/50 transition-all duration-300">
                      <SelectValue placeholder={t("selectASubcategory")} />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                      {(selectedCategory?.subcategories ?? []).map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isRuleSum100 && (
                    <p className="text-xs text-gray-400">{t("subcategoryRequiredForRuleBasedExpense")}</p>
                  )}
                </div>
              )}

              {/* Amount and Title */}
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
                    placeholder={t("amountPlaceholder")}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("transactionType")}</Label>
                  <Select
                    value={formData.transactionType}
                    onValueChange={(value: "fixed" | "unique" | "installment") =>
                      setFormData((prev) => ({ ...prev, transactionType: value }))
                    }
                  >
                    <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white hover:border-green-500/50 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                      {getAvailableTransactionTypes().map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-3">
                <Label className="text-gray-300 text-sm font-medium">{t("title")}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-black/40 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 transition-all duration-300"
                  placeholder={formData.type === "income" ? t("titlePlaceholderIncome") : t("titlePlaceholderExpense")}
                />
              </div>

              {/* Date/Day Configuration */}
              {formData.transactionType === "unique" && (
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

              {formData.transactionType === "fixed" && (
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm font-medium">{t("dayOfMonth")}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dayOfMonth: e.target.value }))}
                    className="bg-black/40 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 transition-all duration-300"
                    placeholder={t("dayOfMonthPlaceholder")}
                  />
                  <p className="text-xs text-gray-400">
                    {formData.type === "income" ? t("fixedIncomeDayHint") : t("fixedExpenseDayHint")}
                  </p>
                </div>
              )}

              {formData.transactionType === "installment" && formData.type === "expense" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm font-medium">{t("firstInstallmentDate")}</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      className="bg-black/40 backdrop-blur-sm border-white/10 text-white focus:border-green-500/50 transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-300 text-sm font-medium">{t("installments")}</Label>
                    <Input
                      type="number"
                      min="2"
                      value={formData.installments}
                      onChange={(e) => setFormData((prev) => ({ ...prev, installments: e.target.value }))}
                      required={formData.transactionType === "installment"}
                      className="bg-black/40 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 transition-all duration-300"
                      placeholder={t("installmentsPlaceholder")}
                    />
                  </div>
                </div>
              )}

              {/* Preview for installments */}
              {formData.transactionType === "installment" &&
                formData.type === "expense" &&
                formData.amount &&
                formData.installments && (
                  <div className="bg-green-900/20 backdrop-blur-sm p-4 rounded-lg border border-green-500/20">
                    <h4 className="text-green-400 font-medium mb-2">{t("installmentPreview")}</h4>
                    <p className="text-gray-300 text-sm">
                      {formData.installments}x de{" "}
                      {formatCurrency(Number.parseFloat(formData.amount) / Number.parseInt(formData.installments))}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{t("total")}: {formatCurrency(Number.parseFloat(formData.amount))}</p>
                  </div>
                )}

              {/* Notes */}
              <div className="space-y-3">
                <Label className="text-gray-300 text-sm font-medium">
                  {t("notes")} <span className="text-gray-500">({t("optional")})</span>
                </Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 transition-all duration-300"
                  placeholder={t("transactionNotesPlaceholder")}
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
