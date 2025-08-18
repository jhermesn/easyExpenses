"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { t } from "@/lib/i18n"

interface InstallmentDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (deleteAll: boolean) => void
  currentInstallment: number
  totalInstallments: number
}

export function InstallmentDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  currentInstallment,
  totalInstallments,
}: InstallmentDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 border-gray-800">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{t("installment")}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            {t("installmentPreview")} ({currentInstallment}/{totalInstallments})
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white">
            {t("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(false)} className="bg-yellow-600 hover:bg-yellow-700 text-white">
            {t("delete")} {t("installment")}
          </AlertDialogAction>
          <AlertDialogAction onClick={() => onConfirm(true)} className="bg-red-600 hover:bg-red-700 text-white">
            {t("delete")} {t("installments")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
