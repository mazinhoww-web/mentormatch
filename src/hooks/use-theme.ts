"use client"

import { useEffect, useState, useCallback } from "react"

type Theme = "light" | "dark"

const STORAGE_KEY = "mm-theme"

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
      if (stored === "light" || stored === "dark") {
        setThemeState(stored)
        applyTheme(stored)
        return
      }
    } catch {
      // localStorage unavailable
    }
    // Default to light
    setThemeState("light")
    applyTheme("light")
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light")
  }, [theme, setTheme])

  return { theme, setTheme, toggle, mounted }
}
