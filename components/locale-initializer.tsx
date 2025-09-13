"use client"

import { useEffect } from "react"
import { DatabaseService } from "@/lib/database"
import { type Locale, setLocale } from "@/lib/i18n"
import { useClientMount } from "@/lib/use-client-mount"

export function LocaleInitializer() {
  const mounted = useClientMount()

  useEffect(() => {
    const initializeLocale = async () => {
      if (!mounted) return
      try {
        const db = DatabaseService.getInstance()
        const savedLocale = await db.getSetting("locale")
        if (savedLocale && ["pt-BR", "en-US", "es-ES"].includes(savedLocale as string)) {
          setLocale(savedLocale as Locale)
        }
      } catch (error) {
        console.error("[ERRO] Falha ao inicializar o idioma:", error)
      }
    }

    initializeLocale()
  }, [mounted])

  return null
}