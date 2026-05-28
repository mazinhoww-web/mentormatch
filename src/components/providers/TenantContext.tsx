"use client"

import { createContext, useContext } from "react"

export type TenantContextValue = {
  slug: string | null
  name: string
  brandColor: string
  themeKey: string
  logoUrl: string | null
}

const DEFAULT_CONTEXT: TenantContextValue = {
  slug: null,
  name: "MentorMatch",
  brandColor: "#4F46E5",
  themeKey: "dark",
  logoUrl: null,
}

const TenantContext = createContext<TenantContextValue>(DEFAULT_CONTEXT)

export function TenantProvider({
  value,
  children,
}: {
  value: TenantContextValue
  children: React.ReactNode
}) {
  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}
