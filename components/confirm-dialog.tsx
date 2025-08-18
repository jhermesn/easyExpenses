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

type ActionColor = "default" | "yellow" | "red" | "outline"

interface ConfirmDialogAction {
  label: string
  onClick: () => void
  color?: ActionColor
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  actions: ConfirmDialogAction[]
  cancelLabel?: string
}

const colorToClass: Record<ActionColor, string> = {
  default: "bg-primary hover:bg-primary/90 text-white",
  yellow: "bg-yellow-600 hover:bg-yellow-700 text-white",
  red: "bg-red-600 hover:bg-red-700 text-white",
  outline: "border-white/20 text-gray-300 hover:bg-white/10 hover:text-white",
}

export function ConfirmDialog({ open, onOpenChange, title, description, actions, cancelLabel }: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-black/90 border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription className="text-gray-300">{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto border-white/20 text-gray-300 hover:bg-white/10 hover:text-white">
            {cancelLabel || "Cancel"}
          </AlertDialogCancel>
          {actions.map((action, idx) => (
            <AlertDialogAction
              key={idx}
              onClick={action.onClick}
              className={`w-full sm:w-auto whitespace-normal text-center ${colorToClass[action.color || "default"]}`}
            >
              {action.label}
            </AlertDialogAction>
          ))}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


