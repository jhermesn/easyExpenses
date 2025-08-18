"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getMonthName } from "@/lib/utils"
import { t } from "@/lib/i18n"

interface MonthNavigatorProps {
  currentDate: Date
  onDateChange: (date: Date) => void
}

export function MonthNavigator({ currentDate, onDateChange }: MonthNavigatorProps) {
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    onDateChange(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    onDateChange(newDate)
  }

  const goToCurrentMonth = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center justify-between bg-black/40 backdrop-blur-xl rounded-xl p-6 border border-white/10 shadow-2xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPreviousMonth}
        className="text-green-400 hover:bg-green-600/20 hover:text-green-300 backdrop-blur-sm border border-green-500/20"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-white capitalize">{getMonthName(currentDate)}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={goToCurrentMonth}
          className="border-green-500/30 text-green-400 hover:bg-green-600/20 hover:text-green-300 bg-transparent backdrop-blur-sm"
        >
          {t("today")}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={goToNextMonth}
        className="text-green-400 hover:bg-green-600/20 hover:text-green-300 backdrop-blur-sm border border-green-500/20"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  )
}
