import type { Tenant } from "@prisma/client"

export type ThemeKey = "dark" | "sicredi" | (string & {})

export function resolveThemeClass(tenant: { themeKey?: string | null } | null): string {
  if (!tenant) return "theme-dark"
  return `theme-${tenant.themeKey ?? "dark"}`
}

export function tokensToCSS(themeKey: string, tokens: Record<string, string>): string {
  const vars = Object.entries(tokens)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n")
  return `.theme-${themeKey} {\n${vars}\n}`
}

export type TenantWithTheme = Pick<Tenant, "themeKey" | "themeCssUrl" | "tokens">
