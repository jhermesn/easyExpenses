"use client"

import { useEffect, useMemo, useState } from "react"

export function useBasePath() {
  const [mounted, setMounted] = useState(false)
  const [pathname, setPathname] = useState<string>("")
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "/easyExpenses") as string

  useEffect(() => {
    setMounted(true)
    try {
      setPathname(window.location.pathname)
    } catch {}
  }, [])

  const inBasePath = useMemo(() => {
    if (!mounted) return false
    if (!basePath) return true
    return pathname.startsWith(basePath)
  }, [mounted, pathname, basePath])

  const isAbsoluteRoot = useMemo(() => {
    if (!mounted) return false
    return pathname === "/"
  }, [mounted, pathname])

  return { mounted, basePath, pathname, inBasePath, isAbsoluteRoot }
}


