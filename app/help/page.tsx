"use client"

import { ArrowLeft, BookOpen, Info, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLoader } from "@/components/app-loader"
import { t } from "@/lib/i18n"
import { useClientMount } from "@/lib/use-client-mount"
import { useRouter } from "next/navigation"

export default function HelpPage() {
  const mounted = useClientMount()
  const router = useRouter()

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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              {t("helpAndGlossary")}
            </h1>
            <p className="text-gray-400 mt-1">{t("helpAndGlossarySubtitle")}</p>
          </div>
        </div>

        {/* Glossary */}
        <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-xl">{t("glossaryTitle")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-white font-semibold">{t("termCategoriesTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("termCategoriesDesc")}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-semibold">{t("termSubcategoriesTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("termSubcategoriesDesc")}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-semibold">{t("termRulesTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("termRulesDesc")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-white font-semibold flex items-center"><TrendingUp className="w-4 h-4 mr-2 text-green-400" />{t("termIncomeTitle")}</h3>
                <p className="text-gray-400 text-sm">{t("termIncomeDesc")}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold flex items-center"><TrendingDown className="w-4 h-4 mr-2 text-red-400" />{t("termExpensesTitle")}</h3>
                <p className="text-gray-400 text-sm">{t("termExpensesDesc")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-white font-semibold">{t("termFixedTitle")}</h3>
                <p className="text-gray-400 text-sm">{t("termFixedDesc")}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold">{t("termInstallmentsTitle")}</h3>
                <p className="text-gray-400 text-sm">{t("termInstallmentsDesc")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-semibold">{t("termBalanceTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("termBalanceDesc")}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-semibold">{t("termWeeklyFlowTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("termWeeklyFlowDesc")}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-semibold">{t("termPDFExportTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("termPDFExportDesc")}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-semibold flex items-center"><Info className="w-4 h-4 mr-2 text-blue-400" />{t("termPWAOfflineTitle")}</h3>
              <p className="text-gray-400 text-sm">{t("termPWAOfflineDesc")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
