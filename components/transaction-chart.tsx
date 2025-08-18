"use client"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { formatCurrency } from "@/lib/utils"
import { t } from "@/lib/i18n"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  date: Date
  description: string
}

interface TransactionChartProps {
  transactions: Transaction[]
}

export function TransactionChart({ transactions }: TransactionChartProps) {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const incomeVsExpense = [
    {
      name: t("income"),
      value: totalIncome,
      color: "#10b981",
    },
    {
      name: t("expenses"),
      value: totalExpenses,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0) // Only show items with value > 0

  // Dados para gráfico de barras por semana
  const weeklyData = getWeeklyData(transactions)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{payload[0].payload.name}</p>
          <p className="text-green-400">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (transactions.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-green-400 mb-4">
            {t("income")} vs {t("expenses")}
          </h3>
          <div className="flex items-center justify-center h-64 text-gray-400">
            <p>{t("noTransactionsFound")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-green-400 mb-4">{t("income")} vs {t("expenses")}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={incomeVsExpense}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${formatCurrency(Number(value ?? 0))}`}
              outerRadius={90}
              fill="#8884d8"
              dataKey="value"
            >
              {incomeVsExpense.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-green-400 mb-4">{t("weeklyFlow")}</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomBarTooltip />} />
            <Legend />
            <Bar dataKey="income" fill="#10b981" name={t("income")} radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" name={t("expenses")} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function getWeeklyData(transactions: Transaction[]) {
  const weeks = Array.from({ length: 4 }, (_, i) => `${t("week")} ${i + 1}`)

  return weeks.map((week, index) => {
    const startDay = index * 7 + 1
    const endDay = Math.min((index + 1) * 7, 31)

    const weekTransactions = transactions.filter((t) => {
      const day = new Date(t.date).getDate()
      return day >= startDay && day <= endDay
    })

    return {
      week,
      income: weekTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
      expense: weekTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
    }
  })
}
