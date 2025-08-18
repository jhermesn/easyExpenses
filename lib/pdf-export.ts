import { formatCurrencyI18n, getLocale, t } from "./i18n"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  date: Date
  categoryId: string
  subcategoryId?: string
}

interface Category {
  id: string
  name: string
  subcategories: { id: string; name: string }[]
}

interface ReportData {
  month: string
  year: number
  totalIncome: number
  totalExpenses: number
  balance: number
  transactions: Transaction[]
  categories: Category[]
}

export async function exportMonthlyReport(data: ReportData): Promise<void> {
  const markdownContent = generateMarkdownReport(data)

  const blob = new Blob([markdownContent], { type: "text/markdown" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = `${t("reportFilePrefix")}-${data.month.toLowerCase()}-${data.year}.md`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

function generateMarkdownReport(data: ReportData): string {
  const currentDate = new Date().toLocaleDateString(getLocale())

  let markdown = `# ${t("monthlyReport")} - ${t("appName")}

## ${data.month} ${data.year}

---

## 📊 ${t("financialSummary")}

| ${t("typeLabel")} | ${t("valueLabel")} |
|------|-------|
| **${t("income")}** | ${formatCurrencyI18n(data.totalIncome)} |
| **${t("expenses")}** | ${formatCurrencyI18n(data.totalExpenses)} |
| **${t("balance")}** | ${formatCurrencyI18n(data.balance)} |

---

## 📈 ${t("transactionsByCategory")}

`

  // Calculate totals by category
  const categoryTotals = new Map<string, { income: number; expense: number }>()

  data.transactions.forEach((transaction) => {
    const category = data.categories.find((c) => c.id === transaction.categoryId)
    if (category) {
      const current = categoryTotals.get(category.name) || { income: 0, expense: 0 }
      if (transaction.type === "income") {
        current.income += transaction.amount
      } else {
        current.expense += transaction.amount
      }
      categoryTotals.set(category.name, current)
    }
  })

  markdown += `| ${t("category")} | ${t("income")} | ${t("expenses")} |
|-----------|----------|--------|
`

  categoryTotals.forEach((totals, categoryName) => {
    markdown += `| ${categoryName} | ${formatCurrencyI18n(totals.income)} | ${formatCurrencyI18n(totals.expense)} |
`
  })

  markdown += `
---

## 📋 ${t("transactionsList")}

`

  // Sort transactions by date
  const sortedTransactions = [...data.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Group transactions by date
  const transactionsByDate = new Map<string, Transaction[]>()

  sortedTransactions.forEach((transaction) => {
    const dateKey = new Date(transaction.date).toLocaleDateString(getLocale())
    if (!transactionsByDate.has(dateKey)) {
      transactionsByDate.set(dateKey, [])
    }
    transactionsByDate.get(dateKey)!.push(transaction)
  })

  transactionsByDate.forEach((transactions, date) => {
    markdown += `### ${date}

| ${t("typeLabel")} | ${t("titleLabel")} | ${t("category")} | ${t("valueLabel")} |
|------|--------|-----------|-------|
`

    transactions.forEach((transaction) => {
      const category = data.categories.find((c) => c.id === transaction.categoryId)
      const type = transaction.type === "income" ? `📈 ${t("income")}` : `📉 ${t("expenses")}`
      const amount = formatCurrencyI18n(transaction.amount)

      markdown += `| ${type} | ${transaction.description} | ${category?.name || "N/A"} | ${amount} |
`
    })

    markdown += `
`
  })

  markdown += `---

## ℹ️ ${t("reportInfo")}

- **${t("generatedOn")}:** ${currentDate}
- **${t("totalTransactions")}:** ${data.transactions.length}

---

*${t("monthlyReport")} - ${t("appName")} ${t("versionCode")}*
*${t("developedBy")} ${t("author")}*
`

  return markdown
}
