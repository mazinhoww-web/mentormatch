"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

type Props = {
  className?: string
}

export function ThemeToggle({ className = "" }: Props) {
  const { theme, toggle, mounted } = useTheme()

  if (!mounted) {
    return (
      <button
        aria-label="Trocar tema"
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 ${className}`}
      >
        <Sun size={16} className="text-white/60" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white ${className}`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
