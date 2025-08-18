interface Category {
  id: string
  name: string
  hasRules: boolean
  subcategories: Subcategory[]
  notes?: string
  createdAt: Date
}

interface Subcategory {
  id: string
  name: string
  percentage?: number
  notes?: string
}

interface Transaction {
  id: string
  categoryId: string
  subcategoryId?: string
  type: "income" | "expense"
  amount: number
  description: string
  transactionType: "fixed" | "unique" | "installment"
  date: Date
  dayOfMonth?: number // Para transações fixas
  installmentInfo?: {
    current: number
    total: number
    groupId: string
  }
  notes?: string
  createdAt: Date
  originalFixedId?: string // Para identificar transações geradas de templates fixos
}

export class DatabaseService {
  private static instance: DatabaseService
  private db: IDBDatabase | null = null
  private dbName = "FinancasDB"
  private version = 1
  private initPromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("IndexedDB not available"))
        return
      }

      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Categories store
        if (!db.objectStoreNames.contains("categories")) {
          const categoryStore = db.createObjectStore("categories", { keyPath: "id" })
        }

        // Transactions store
        if (!db.objectStoreNames.contains("transactions")) {
          const transactionStore = db.createObjectStore("transactions", { keyPath: "id" })
          transactionStore.createIndex("categoryId", "categoryId", { unique: false })
          transactionStore.createIndex("date", "date", { unique: false })
          transactionStore.createIndex("type", "type", { unique: false })
        }

        // Settings store
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" })
        }
      }
    })

    return this.initPromise
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.db) {
      await this.init()
    }
  }

  // Categories
  async addCategory(category: Omit<Category, "id" | "createdAt">): Promise<string> {
    await this.ensureInitialized()

    const id = crypto.randomUUID()
    const newCategory: Category = {
      ...category,
      id,
      createdAt: new Date(),
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["categories"], "readwrite")
      const store = transaction.objectStore("categories")
      const request = store.add(newCategory)

      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  async getCategories(): Promise<Category[]> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["categories"], "readonly")
      const store = transaction.objectStore("categories")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async updateCategory(category: Category): Promise<void> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["categories"], "readwrite")
      const store = transaction.objectStore("categories")
      const request = store.put(category)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteCategory(id: string): Promise<void> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["categories"], "readwrite")
      const store = transaction.objectStore("categories")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Transactions
  async addTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<string> {
    await this.ensureInitialized()

    const id = crypto.randomUUID()
    const newTransaction: Transaction = {
      ...transaction,
      id,
      createdAt: new Date(),
    }

    return new Promise((resolve, reject) => {
      const dbTransaction = this.db!.transaction(["transactions"], "readwrite")
      const store = dbTransaction.objectStore("transactions")
      const request = store.add(newTransaction)

      request.onsuccess = () => resolve(id)
      request.onerror = () => reject(request.error)
    })
  }

  async getTransactions(): Promise<Transaction[]> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["transactions"], "readonly")
      const store = transaction.objectStore("transactions")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
    await this.ensureInitialized()

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    return new Promise(async (resolve, reject) => {
      try {
        const transaction = this.db!.transaction(["transactions"], "readonly")
        const store = transaction.objectStore("transactions")
        const index = store.index("date")
        const range = IDBKeyRange.bound(startDate, endDate)
        const request = index.getAll(range)

        request.onsuccess = async () => {
          try {
            // Pegar apenas transações únicas e parceladas
            const uniqueAndInstallmentTransactions = (request.result || []).filter(
              (t: Transaction) => t.transactionType === "unique" || t.installmentInfo,
            )

            // Gerar transações fixas
            const fixedTransactions = await this.generateFixedTransactions(year, month)

            resolve([...uniqueAndInstallmentTransactions, ...fixedTransactions])
          } catch (error) {
            reject(error)
          }
        }
        request.onerror = () => reject(request.error)
      } catch (error) {
        reject(error)
      }
    })
  }

  private async generateFixedTransactions(year: number, month: number): Promise<Transaction[]> {
    try {
      // Buscar todas as transações fixas
      const allTransactions = await this.getTransactions()
      const fixedTemplates = allTransactions.filter((t) => t.transactionType === "fixed")

      return fixedTemplates.map((template) => {
        // Calcular o dia correto
        const lastDayOfMonth = new Date(year, month, 0).getDate()
        const dayToUse = Math.min(template.dayOfMonth || 1, lastDayOfMonth)

        return {
          ...template,
          id: `fixed-${template.id}-${year}-${month}`,
          date: new Date(year, month - 1, dayToUse),
          transactionType: "unique" as const,
          originalFixedId: template.id,
        }
      })
    } catch (error) {
      console.error("[ERRO] Erro ao gerar transações fixas:", error)
      return []
    }
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const dbTransaction = this.db!.transaction(["transactions"], "readwrite")
      const store = dbTransaction.objectStore("transactions")
      const request = store.put(transaction)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["transactions"], "readwrite")
      const store = transaction.objectStore("transactions")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteInstallmentGroup(groupId: string): Promise<void> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["transactions"], "readwrite")
      const store = transaction.objectStore("transactions")
      const request = store.getAll()

      request.onsuccess = () => {
        const transactions = request.result || []
        const installmentTransactions = transactions.filter((t) => t.installmentInfo?.groupId === groupId)

        let deleteCount = 0
        const totalToDelete = installmentTransactions.length

        if (totalToDelete === 0) {
          resolve()
          return
        }

        installmentTransactions.forEach((t) => {
          const deleteRequest = store.delete(t.id)
          deleteRequest.onsuccess = () => {
            deleteCount++
            if (deleteCount === totalToDelete) {
              resolve()
            }
          }
          deleteRequest.onerror = () => reject(deleteRequest.error)
        })
      }
      request.onerror = () => reject(request.error)
    })
  }

  async hasFixedTransactionForMonth(templateId: string, year: number, month: number): Promise<boolean> {
    await this.ensureInitialized()

    const fixedId = `fixed-${templateId}-${year}-${month}`

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["transactions"], "readonly")
      const store = transaction.objectStore("transactions")
      const request = store.get(fixedId)

      request.onsuccess = () => resolve(!!request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Settings
  async getSetting(key: string): Promise<any> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["settings"], "readonly")
      const store = transaction.objectStore("settings")
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result?.value)
      request.onerror = () => reject(request.error)
    })
  }

  async setSetting(key: string, value: any): Promise<void> {
    await this.ensureInitialized()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["settings"], "readwrite")
      const store = transaction.objectStore("settings")
      const request = store.put({ key, value })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Inicializa database
if (typeof window !== "undefined") {
  DatabaseService.getInstance().init().catch(console.error)
}
