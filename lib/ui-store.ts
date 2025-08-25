"use client"

import { create } from "zustand"

interface UIState {
  isOnboarding: boolean
  setIsOnboarding: (value: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isOnboarding: false,
  setIsOnboarding: (value: boolean) => set({ isOnboarding: value }),
}))