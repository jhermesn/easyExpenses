import { formatCurrencyI18n, getLocale, t } from "./i18n"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  title: string
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
  const _markdownContent = generateMarkdownReport(data)

  const html = generateHtmlReport(data)
  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "0"
  iframe.setAttribute("aria-hidden", "true")
  document.body.appendChild(iframe)

  const anyIframe = iframe as HTMLIFrameElement & { srcdoc?: string }
  let blobUrl: string | null = null

  const onLoad = () => {
    try {
      anyIframe.contentWindow?.focus()
      anyIframe.contentWindow?.print()
    } finally {
      setTimeout(() => {
        if (blobUrl) {
          try {
            URL.revokeObjectURL(blobUrl)
          } catch {}
        }
        try {
          document.body.removeChild(anyIframe)
        } catch {}
      }, 1000)
    }
  }

  anyIframe.addEventListener("load", onLoad, { once: true } as AddEventListenerOptions)
  try {
    anyIframe.srcdoc = html
  } catch {
    blobUrl = URL.createObjectURL(new Blob([html], { type: "text/html" }))
    anyIframe.src = blobUrl
  }
}

function generateMarkdownReport(data: ReportData): string {
  const currentDate = new Date().toLocaleDateString(getLocale())

  let markdown = `\ufeff# ${t("monthlyReport")} - ${t("appName")}

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

      markdown += `| ${type} | ${transaction.title} | ${category?.name || "N/A"} | ${amount} |
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

function generateHtmlReport(data: ReportData): string {
  const currentDate = new Date().toLocaleDateString(getLocale())

  // Totais por categoria
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

  // Transações por data (ordenadas desc)
  const sortedTransactions = [...data.transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const transactionsByDate = new Map<string, Transaction[]>()
  sortedTransactions.forEach((transaction) => {
    const dateKey = new Date(transaction.date).toLocaleDateString(getLocale())
    if (!transactionsByDate.has(dateKey)) {
      transactionsByDate.set(dateKey, [])
    }
    transactionsByDate.get(dateKey)!.push(transaction)
  })

  const style = `
    <style>
      @page { margin: 16mm; }
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: #111; }
      h1, h2, h3 { margin: 0 0 8px; }
      h1 { font-size: 22px; }
      h2 { font-size: 18px; margin-top: 16px; }
      h3 { font-size: 16px; margin-top: 12px; }
      .muted { color: #555; }
      .section { margin: 16px 0; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; text-align: left; }
      th { background: #f5f5f5; }
      .summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
      .card { border: 1px solid #e5e7eb; padding: 8px; border-radius: 6px; }
      .right { text-align: right; }
      .footer { margin-top: 24px; font-size: 12px; color: #555; }
    </style>
  `

  let categoriesRows = ""
  categoryTotals.forEach((totals, categoryName) => {
    categoriesRows += `<tr><td>${escapeHtml(categoryName)}</td><td class="right">${escapeHtml(
      formatCurrencyI18n(totals.income),
    )}</td><td class="right">${escapeHtml(formatCurrencyI18n(totals.expense))}</td></tr>`
  })

  let transactionsHtml = ""
  transactionsByDate.forEach((transactions, date) => {
    let rows = ""
    transactions.forEach((transaction) => {
      const category = data.categories.find((c) => c.id === transaction.categoryId)
      const type = transaction.type === "income" ? `📈 ${t("income")}` : `📉 ${t("expenses")}`
      const amount = formatCurrencyI18n(transaction.amount)
      rows += `<tr><td>${escapeHtml(type)}</td><td>${escapeHtml(
        transaction.title,
      )}</td><td>${escapeHtml(category?.name || "N/A")}</td><td class="right">${escapeHtml(amount)}</td></tr>`
    })
    transactionsHtml += `
      <div class="section">
        <h3>${escapeHtml(date)}</h3>
        <table>
          <thead>
            <tr><th>${escapeHtml(t("typeLabel"))}</th><th>${escapeHtml(t("titleLabel"))}</th><th>${
      t("category")
    }</th><th class="right">${escapeHtml(t("valueLabel"))}</th></tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `
  })

  return `<!doctype html>
  <html lang="${escapeHtml(getLocale())}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(t("monthlyReport"))} - ${escapeHtml(t("appName"))}</title>
    ${style}
  </head>
  <body>
    <h1>${escapeHtml(t("monthlyReport"))} - ${escapeHtml(t("appName"))}</h1>
    <div class="muted">${escapeHtml(data.month)} ${escapeHtml(String(data.year))}</div>

    <div class="section">
      <h2>📊 ${escapeHtml(t("financialSummary"))}</h2>
      <div class="summary">
        <div class="card"><div><strong>${escapeHtml(t("income"))}</strong></div><div class="right">${escapeHtml(
          formatCurrencyI18n(data.totalIncome),
        )}</div></div>
        <div class="card"><div><strong>${escapeHtml(t("expenses"))}</strong></div><div class="right">${escapeHtml(
          formatCurrencyI18n(data.totalExpenses),
        )}</div></div>
        <div class="card"><div><strong>${escapeHtml(t("balance"))}</strong></div><div class="right">${escapeHtml(
          formatCurrencyI18n(data.balance),
        )}</div></div>
      </div>
    </div>

    <div class="section">
      <h2>📈 ${escapeHtml(t("transactionsByCategory"))}</h2>
      <table>
        <thead>
          <tr>
            <th>${escapeHtml(t("category"))}</th>
            <th class="right">${escapeHtml(t("income"))}</th>
            <th class="right">${escapeHtml(t("expenses"))}</th>
          </tr>
        </thead>
        <tbody>
          ${categoriesRows}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>📋 ${escapeHtml(t("transactionsList"))}</h2>
      ${transactionsHtml}
    </div>

    <div class="footer">
      <div><strong>${escapeHtml(t("generatedOn"))}:</strong> ${escapeHtml(currentDate)}</div>
      <div><strong>${escapeHtml(t("totalTransactions"))}:</strong> ${escapeHtml(
        String(data.transactions.length),
      )}</div>
      <div style="margin-top:8px">${escapeHtml(t("monthlyReport"))} - ${escapeHtml(t("appName"))} ${escapeHtml(
        t("versionCode"),
      )}</div>
      <div>${escapeHtml(t("developedBy"))} ${escapeHtml(t("author"))}</div>
    </div>
  </body>
  </html>`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
