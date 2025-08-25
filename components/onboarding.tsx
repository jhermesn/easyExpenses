"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Sparkles, PieChart, TrendingUp, ArrowRight } from "lucide-react"
import { t } from "@/lib/i18n"
import { useRouter } from "next/navigation"

export function Onboarding() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <Card className="relative bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header with gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green-500/20 to-transparent"></div>

          <CardHeader className="relative text-center pt-12 pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 text-blue-400 text-4xl font-bold animate-bounce">$</span>
                <span className="absolute -bottom-2 -left-2 text-purple-400 text-3xl font-bold animate-bounce delay-300">£</span>
              </div>
            </div>

            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent mb-4">
              {t("welcome")}
            </CardTitle>

            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">{t("welcomeMessage")}</p>
          </CardHeader>

          <CardContent className="relative space-y-8 pb-12">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-green-500/30 transition-all duration-300 group">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Layers className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{t("organizeByCategoriesTitle")}</h3>
                <p className="text-gray-400 text-sm">{t("organizeByCategoriesDesc")}</p>
              </div>

              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{t("completeControlTitle")}</h3>
                <p className="text-gray-400 text-sm">{t("completeControlDesc")}</p>
              </div>

              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all duration-300 group">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <PieChart className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">{t("visualReportsTitle")}</h3>
                <p className="text-gray-400 text-sm">{t("visualReportsDesc")}</p>
              </div>
            </div>

            {/* Action */}
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/categories")}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 backdrop-blur-sm border border-green-500/30 shadow-2xl text-white font-semibold py-4 text-lg group transition-all duration-300"
              >
                <div className="flex items-center justify-center space-x-3">
                  <Layers className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>{t("createCategories")}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Button>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-white/10 rounded-xl p-6 mt-8">
              <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>{t("quickTip")}</span>
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{t("quickTipText")}</p>
            </div>

            {/* PWA Info */}
            <div className="text-center pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm">💡 {t("pwaInfo")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}