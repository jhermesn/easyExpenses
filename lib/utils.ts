import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatCurrencyI18n, getLocale } from "./i18n"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, locale = "pt-BR", currency = "BRL"): string {
  return formatCurrencyI18n(amount)
}

export function formatDate(date: Date, locale?: string): string {
  const current = (locale as any) || getLocale()
  return new Intl.DateTimeFormat(current, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function getMonthName(date: Date, locale?: string): string {
  const current = (locale as any) || getLocale()
  return new Intl.DateTimeFormat(current, {
    month: "long",
    year: "numeric",
  }).format(date)
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function validatePercentages(subcategories: { percentage?: number }[]): boolean {
  const total = subcategories.reduce((sum, sub) => sum + (sub.percentage || 0), 0)
  return total <= 100
}
