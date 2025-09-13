"use client"

import { useEffect } from "react"
import { DatabaseService } from "@/lib/database"
import { useClientMount } from "@/lib/use-client-mount"
import { useCurrencyStore, type CurrencyCode } from "@/lib/currency-store"

export function CurrencyInitializer() {
  const mounted = useClientMount()

  useEffect(() => {
    const initializeCurrency = async () => {
      if (!mounted) return
      try {
        const db = DatabaseService.getInstance()
        const savedCurrency = (await db.getSetting("currencyCode")) as CurrencyCode
        if (savedCurrency && ["BRL", "USD", "EUR"].includes(savedCurrency)) {
          useCurrencyStore.getState().setCurrency(savedCurrency)
        }
      } catch (error) {
        console.error("[ERRO] Falha ao inicializar a moeda:", error)
      }
    }

    initializeCurrency()
  }, [mounted])

  return null
}
