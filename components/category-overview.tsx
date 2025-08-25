"use client"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { t } from "@/lib/i18n"
import { AlertTriangle } from "lucide-react"

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

interface Transaction {
  categoryId: string
  subcategoryId?: string
  type: "income" | "expense"
  amount: number
}

interface CategoryOverviewProps {
  categories: Category[]
  transactions: Transaction[]
}

export function CategoryOverview({ categories, transactions }: CategoryOverviewProps) {
  // Calcular total de entradas para usar como base do orçamento
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const getCategoryData = (category: Category) => {
    const categoryTransactions = transactions.filter((t) => t.categoryId === category.id)

    // Separar entradas e saídas
    const incomeTransactions = categoryTransactions.filter((t) => t.type === "income")
    const expenseTransactions = categoryTransactions.filter((t) => t.type === "expense")

    const categoryIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const categoryExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Para categorias com regras, calcular orçamento baseado no total de entradas
    const subcategoryData = category.subcategories.map((sub) => {
      const subExpenseTransactions = expenseTransactions.filter((t) => t.subcategoryId === sub.id)
      const subTotal = subExpenseTransactions.reduce((sum, t) => sum + t.amount, 0)

      // Calcular orçamento baseado no total de entradas
      const budgetAmount = sub.percentage && category.hasRules ? (totalIncome * sub.percentage) / 100 : 0
      const usedPercentage = budgetAmount > 0 ? (subTotal / budgetAmount) * 100 : 0
      const isOverBudget = usedPercentage > 100

      return {
        ...sub,
        spent: subTotal,
        budget: budgetAmount,
        usedPercentage: Math.min(usedPercentage, 100),
        actualUsedPercentage: usedPercentage,
        isOverBudget,
      }
    })

    return {
      category,
      totalIncome: categoryIncome,
      totalExpense: categoryExpense,
      subcategories: subcategoryData,
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-green-400 mb-2">{t("categories")}</h3>
        {totalIncome > 0 && (
          <p className="text-xs text-gray-400">{t("income")}: {formatCurrency(totalIncome)}</p>
        )}
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const data = getCategoryData(category)

          return (
            <div
              key={category.id}
              className="space-y-4 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/5"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-white">{category.name}</h4>
                <div className="text-right">
                  {data.totalIncome > 0 && (
                    <div className="text-sm text-green-400">{t("income")}: {formatCurrency(data.totalIncome)}</div>
                  )}
                  {data.totalExpense > 0 && (
                    <div className="text-sm text-red-400">{t("expenses")}: {formatCurrency(data.totalExpense)}</div>
                  )}
                </div>
              </div>

              {/* Mostrar regras apenas para categorias com saídas e regras ativas */}
              {category.hasRules && totalIncome > 0 && data.subcategories.length > 0 && (
                <div className="space-y-3 pl-4">
                  <div className="text-xs text-gray-400 mb-2">{t("hasRules")}</div>
                  {data.subcategories.map((sub) => (
                    <div key={sub.id} className="space-y-2 bg-black/20 rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300">{sub.name}</span>
                          {sub.isOverBudget && (
                            <div className="flex items-center space-x-1 text-red-400">
                              <AlertTriangle className="w-3 h-3" />
                              <span className="text-xs">{t("percentageExceeded")}</span>
                            </div>
                          )}
                        </div>
                        <span className={`${sub.isOverBudget ? "text-red-400" : "text-gray-400"}`}>
                          {formatCurrency(sub.spent)} / {formatCurrency(sub.budget)}
                        </span>
                      </div>
                      <Progress
                        value={sub.usedPercentage}
                        className="h-2"
                        style={{
                          backgroundColor: "rgba(55, 65, 81, 0.5)",
                        }}
                      />
                      <div className="flex justify-between items-center text-xs">
                        <span className={`${sub.isOverBudget ? "text-red-400" : "text-gray-500"}`}>
                          {sub.actualUsedPercentage.toFixed(1)}% {t("used")} ({sub.percentage}%)
                        </span>
                        {sub.isOverBudget && (
                          <span className="text-red-400 font-medium">+{formatCurrency(sub.spent - sub.budget)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Aviso quando não há entradas para calcular orçamento */}
              {category.hasRules && totalIncome === 0 && (
                <div className="pl-4">
                  <div className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
                    ⚠️ {t("addIncomeToCalculateRules")}
                  </div>
                </div>
              )}

              {/* Para categorias sem regras, mostrar apenas totais */}
              {!category.hasRules && data.subcategories.length > 0 && (
                <div className="space-y-2 pl-4">
                  <div className="text-xs text-gray-400 mb-2">{t("subcategories")}:</div>
                  {data.subcategories.map((sub) => (
                    <div key={sub.id} className="flex justify-between items-center text-sm bg-black/20 rounded p-2">
                      <span className="text-gray-300">{sub.name}</span>
                      <span className="text-gray-400">{formatCurrency(sub.spent)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {categories.length === 0 && <div className="text-center text-gray-400 py-8">{t("noCategoriesFound")}</div>}
      </div>
    </div>
  )
}
