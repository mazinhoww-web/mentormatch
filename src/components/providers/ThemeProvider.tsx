"use client"

import { useEffect } from "react"

type ThemeProviderProps = {
  themeClass: string
  fontFaces?: string
  themeCssUrl?: string | null
  children: React.ReactNode
}

export function ThemeProvider({
  themeClass,
  fontFaces,
  themeCssUrl,
  children,
}: ThemeProviderProps) {
  useEffect(() => {
    const body = document.body
    Array.from(body.classList)
      .filter((c) => c.startsWith("theme-"))
      .forEach((c) => body.classList.remove(c))
    body.classList.add(themeClass)
    return () => {
      body.classList.remove(themeClass)
    }
  }, [themeClass])

  useEffect(() => {
    if (!fontFaces) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = fontFaces
    document.head.appendChild(link)
    return () => {
      if (link.parentNode) link.parentNode.removeChild(link)
    }
  }, [fontFaces])

  useEffect(() => {
    if (!themeCssUrl) return
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = themeCssUrl
    document.head.appendChild(link)
    return () => {
      if (link.parentNode) link.parentNode.removeChild(link)
    }
  }, [themeCssUrl])

  return <>{children}</>
}
