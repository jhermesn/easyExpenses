"use client"

import type { ReactNode } from "react"
import { useBasePath } from "@/lib/use-basepath"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"
import { useUIStore } from "@/lib/ui-store"

interface AppChromeProps {
  children?: ReactNode
}

export function AppChrome({ children }: AppChromeProps) {
  const { mounted, inBasePath, isAbsoluteRoot } = useBasePath()
  const isOnboarding = useUIStore((s) => s.isOnboarding)

  if (!mounted) return null
  if (!inBasePath) return null
  if (isAbsoluteRoot) return null

  return (
    <>
      {children}
      {!isOnboarding && <BottomNav />}
      <Footer />
    </>
  )
}


