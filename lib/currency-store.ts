"use client"

import { create } from "zustand"

export type CurrencyCode = "BRL" | "USD" | "EUR"

interface CurrencyState {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  currency: "BRL",
  setCurrency: (currency) => set({ currency }),
}))
