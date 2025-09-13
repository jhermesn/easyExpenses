"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SelectedPeriodState {
  year: number
  month: number
  setPeriod: (year: number, month: number) => void
  setFromDate: (date: Date) => void
}

function getInitialPeriod() {
  try {
    if (typeof window !== "undefined") {
      const yLs = Number.parseInt(localStorage.getItem("selectedYear") || "")
      const mLs = Number.parseInt(localStorage.getItem("selectedMonth") || "")
      if (Number.isFinite(yLs) && Number.isFinite(mLs) && mLs >= 1 && mLs <= 12) {
        return { year: yLs, month: mLs }
      }
    }
  } catch {}
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1 }
}

export const useSelectedPeriod = create<SelectedPeriodState>()(
  persist(
    (set) => ({
      ...getInitialPeriod(),
      setPeriod: (year: number, month: number) => {
        const safeMonth = Math.min(12, Math.max(1, Math.trunc(month)))
        set({ year: Math.trunc(year), month: safeMonth })
        try {
          localStorage.setItem("selectedYear", String(Math.trunc(year)))
          localStorage.setItem("selectedMonth", String(safeMonth))
        } catch {}
      },
      setFromDate: (date: Date) => {
        const y = date.getFullYear()
        const m = date.getMonth() + 1
        const safeMonth = Math.min(12, Math.max(1, Math.trunc(m)))
        set({ year: Math.trunc(y), month: safeMonth })
        try {
          localStorage.setItem("selectedYear", String(Math.trunc(y)))
          localStorage.setItem("selectedMonth", String(safeMonth))
        } catch {}
      },
    }),
    { name: "selectedPeriod" },
  ),
)


