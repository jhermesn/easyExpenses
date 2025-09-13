import { generateId } from "./utils"

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

export class DatabaseService {
  private static instance: DatabaseService
  private db: IDBDatabase | null = null
  private dbName = "FinancasDB"
  private version = 1
  private initPromise: Promise<IDBDatabase> | null = null

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  private init(): Promise<IDBDatabase> {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        reject(new Error("IndexedDB not supported"))
        return
      }

      const request = indexedDB.open(this.dbName, this.version)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("transactions")) {
          const transactionStore = db.createObjectStore("transactions", {
            keyPath: "id",
          })
          transactionStore.createIndex("date", "date", { unique: false })
          transactionStore.createIndex("categoryId", "categoryId", {
            unique: false,
          })
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" })
        }
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve(this.db)
      }

      request.onerror = (event) => {
        console.error(
          "[ERRO] Erro ao abrir o banco de dados:",
          (event.target as IDBOpenDBRequest).error,
        )
        reject((event.target as IDBOpenDBRequest).error)
      }
    })

    return this.initPromise
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }
    return this.init()
  }

  async addCategory(category: Omit<Category, "id" | "createdAt">): Promise<string> {
    const db = await this.getDB()
    const newId = generateId()
    const newCategory: Category = {
      ...category,
      id: newId,
      createdAt: new Date(),
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction("categories", "readwrite")
      const store = transaction.objectStore("categories")
      const request = store.add(newCategory)

      request.onsuccess = () => resolve(newId)
      request.onerror = () => reject(request.error)
    })
  }

  async getCategories(): Promise<Category[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("categories", "readonly")
      const store = transaction.objectStore("categories")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async updateCategory(category: Category): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("categories", "readwrite")
      const store = transaction.objectStore("categories")
      const request = store.put(category)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteCategory(id: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("categories", "readwrite")
      const store = transaction.objectStore("categories")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async addTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<string> {
    const db = await this.getDB()
    const newId = generateId()
    const newTransaction: Transaction = {
      ...transaction,
      id: newId,
      createdAt: new Date(),
    }

    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite")
      const store = tx.objectStore("transactions")
      const request = store.add(newTransaction)

      request.onsuccess = () => resolve(newId)
      request.onerror = () => reject(request.error)
    })
  }

  async getTransactions(): Promise<Transaction[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly")
      const store = transaction.objectStore("transactions")
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly")
      const store = transaction.objectStore("transactions")
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result as Transaction | undefined)
      request.onerror = () => reject(request.error)
    })
  }

  async getTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
    const db = await this.getDB()
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const generatedFixed = await this.generateFixedTransactions(year, month)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly")
      const store = transaction.objectStore("transactions")
      const index = store.index("date")
      const range = IDBKeyRange.bound(startDate, endDate)
      const request = index.getAll(range)

      request.onsuccess = async () => {
        try {
          const uniqueAndInstallmentTransactions = (request.result || []).filter(
            (t: Transaction) => t.transactionType === "unique" || t.installmentInfo,
          )

          resolve([...uniqueAndInstallmentTransactions, ...generatedFixed])
        } catch (error) {
          reject(error)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  private async generateFixedTransactions(year: number, month: number): Promise<Transaction[]> {
    const db = await this.getDB()
    const fixedTemplates = await this.getFixedTransactionTemplates()
    const existingTransactions = await this.getRawTransactionsByMonth(year, month)

    const toGenerate: Transaction[] = []
    const generatedIds = new Set<string>()

    fixedTemplates.forEach((template) => {
      const dayOfMonth = template.dayOfMonth || 1
      const date = new Date(year, month - 1, dayOfMonth)

      const fixedId = `fixed-${template.id}-${year}-${month}`
      const exists = existingTransactions.some((t) => t.id === fixedId)

      if (!exists && !generatedIds.has(fixedId)) {
        toGenerate.push({
          ...template,
          id: fixedId,
          date,
          transactionType: "unique" as const,
          originalFixedId: template.id,
        })
        generatedIds.add(fixedId)
      }
    })

    toGenerate.sort((a, b) => (a.date > b.date ? 1 : -1))

    const dailyLimit = 3
    const dailyCounts: { [key: string]: number } = {}

    return toGenerate.filter((tx) => {
      const txDate = tx.date.toISOString().split("T")[0]
      dailyCounts[txDate] = (dailyCounts[txDate] || 0) + 1
      return dailyCounts[txDate] <= dailyLimit
    })
  }

  async getRawTransactionsByMonth(year: number, month: number): Promise<Transaction[]> {
    const db = await this.getDB()
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly")
      const store = transaction.objectStore("transactions")
      const index = store.index("date")
      const range = IDBKeyRange.bound(startDate, endDate)
      const request = index.getAll(range)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction("transactions", "readwrite")
      const store = tx.objectStore("transactions")
      const request = store.put(transaction)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteTransaction(id: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readwrite")
      const store = transaction.objectStore("transactions")
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deleteTransactionsByGroup(groupId: string): Promise<void> {
    const db = await this.getDB()
    const allTransactions = await this.getTransactions()
    const groupTransactions = allTransactions.filter((t) => t.installmentInfo?.groupId === groupId)

    const transaction = db.transaction("transactions", "readwrite")
    const store = transaction.objectStore("transactions")

    return new Promise((resolve, reject) => {
      let deletedCount = 0
      const totalToDelete = groupTransactions.length

      if (totalToDelete === 0) {
        resolve()
        return
      }

      groupTransactions.forEach((t) => {
        const request = store.delete(t.id)
        request.onsuccess = () => {
          deletedCount++
          if (deletedCount === totalToDelete) {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })
    })
  }

  async renameInstallmentGroup(groupId: string, newBaseTitle: string): Promise<void> {
    const db = await this.getDB()
    const allTransactions = await this.getTransactions()
    const groupTransactions = allTransactions.filter((t) => t.installmentInfo?.groupId === groupId)

    const transaction = db.transaction("transactions", "readwrite")
    const store = transaction.objectStore("transactions")

    return new Promise((resolve, reject) => {
      let updatedCount = 0
      const totalToUpdate = groupTransactions.length

      if (totalToUpdate === 0) {
        resolve()
        return
      }

      groupTransactions.forEach((t) => {
        if (t.installmentInfo) {
          const newTitle = `${newBaseTitle} (${t.installmentInfo.current}/${t.installmentInfo.total})`
          const updatedTransaction = { ...t, title: newTitle }
          const request = store.put(updatedTransaction)

          request.onsuccess = () => {
            updatedCount++
            if (updatedCount === totalToUpdate) {
              resolve()
            }
          }
          request.onerror = () => reject(request.error)
        }
      })
    })
  }

  async getFixedTransactionTemplates(): Promise<Transaction[]> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("transactions", "readonly")
      const store = transaction.objectStore("transactions")
      const request = store.getAll()

      request.onsuccess = () => {
        const result = (request.result || []).filter((t: Transaction) => t.transactionType === "fixed")
        resolve(result)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getSetting<T>(key: string): Promise<T | undefined> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("settings", "readonly")
      const store = transaction.objectStore("settings")
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result?.value)
      request.onerror = () => reject(request.error)
    })
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("settings", "readwrite")
      const store = transaction.objectStore("settings")
      const request = store.put({ key, value })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearDatabase(): Promise<void> {
    const db = await this.getDB()
    const transaction = db.transaction(["categories", "transactions", "settings"], "readwrite")

    const stores = ["categories", "transactions", "settings"]
    return new Promise((resolve, reject) => {
      let completedRequests = 0
      const totalStores = stores.length

      stores.forEach((storeName) => {
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onsuccess = () => {
          completedRequests++
          if (completedRequests === totalStores) {
            resolve()
          }
        }
        request.onerror = () => reject(request.error)
      })

      transaction.onerror = () => reject(transaction.error)
    })
  }
}

if (typeof window !== "undefined") {
  DatabaseService.getInstance()
}
