"use client"

import type { ReactNode } from "react"
import { useBasePath } from "@/lib/use-basepath"
import { BottomNav } from "@/components/bottom-nav"
import { Footer } from "@/components/footer"

interface AppChromeProps {
  children?: ReactNode
}

export function AppChrome({ children }: AppChromeProps) {
  const { mounted, inBasePath, isAbsoluteRoot } = useBasePath()

  if (!mounted) return null
  if (!inBasePath) return null
  if (isAbsoluteRoot) return null

  return (
    <>
      {children}
      <BottomNav />
      <Footer />
    </>
  )
}


