"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DatabaseService } from "@/lib/database"
import { AppLoader } from "@/components/app-loader"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useI18n, setLocale, Locale } from "@/lib/i18n"
import { useClientMount } from "@/lib/use-client-mount"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, DollarSign, ExternalLink, Globe, Info } from "lucide-react"
import { useCurrencyStore, type CurrencyCode } from "@/lib/currency-store"

export default function SettingsPage() {
  const mounted = useClientMount()
  const { t, locale } = useI18n()
  const { currency, setCurrency } = useCurrencyStore()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  const handleCurrencyChange = (currencyCode: CurrencyCode) => {
    setCurrency(currencyCode)
  }

  const languages = [
    { code: "pt-BR" as Locale, name: "Português (Brasil)", flag: "🇧🇷" },
    { code: "en-US" as Locale, name: "English (US)", flag: "🇺🇸" },
    { code: "es-ES" as Locale, name: "Español (España)", flag: "🇪🇸" },
  ]

  const currencies = [
    { code: "BRL", name: "Real Brasileiro (R$)" },
    { code: "USD", name: "US Dollar ($)" },
    { code: "EUR", name: "Euro (€)" },
  ]

  if (!mounted) return <AppLoader />

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-green-400 hover:bg-green-600/20 backdrop-blur-sm border border-green-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-400 to-slate-300 bg-clip-text text-transparent">
              {t("settings")}
            </h1>
            <p className="text-gray-400 mt-1">{t("settingsSubtitle")}</p>
          </div>
        </div>

        {/* Language & Currency Settings */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-blue-500/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-xl">{t("languageAndCurrency")}</span>
                <p className="text-sm text-gray-400 font-normal mt-1">{t("languageAndCurrencySubtitle")}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm text-gray-300 font-medium">{t("language")}</label>
                <Select value={locale} onValueChange={handleLocaleChange} disabled={isLoading}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white hover:border-blue-500/50 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm text-gray-300 font-medium">{t("currency")}</label>
                <Select value={currency} onValueChange={handleCurrencyChange} disabled={isLoading}>
                  <SelectTrigger className="bg-black/40 backdrop-blur-sm border-white/10 text-white hover:border-blue-500/50 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-xl border-white/10">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center space-x-3">
                          <DollarSign className="w-4 h-4" />
                          <span>{currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading && (
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-blue-300 text-sm">{t("applyingChanges")}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-gray-500/30 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600/20 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <span className="text-xl">{t("appInfo")}</span>
                <p className="text-sm text-gray-400 font-normal mt-1">{t("appDetails")}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-white/5">
                  <span className="text-gray-300">{t("version")}:</span>
                  <span className="text-white font-medium">{t("versionCode")}</span>
                </div>
                <button
                  onClick={() => router.push("/help")}
                  className="w-full text-left p-3 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-lg border border-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Info className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-200">{t("helpAndGlossary")}</span>
                    </div>
                    <span className="text-gray-400 text-sm">{t("helpAndGlossarySubtitle")}</span>
                  </div>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-white/5">
                  <span className="text-gray-300">{t("developedBy")}:</span>
                  <a
                    href="https://jhermesn.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 transition-colors duration-200"
                  >
                    <span>{t("author")}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
