"use client"

import { useCallback } from "react"
import { useTenant } from "@/components/providers/TenantContext"
import { getTenantRoutePath } from "@/lib/tenant-href"

// pushTenant navigates to a path in the current tenant ecosystem.
// Uses window.location.assign for a full-page transition that preserves the
// tenant URL prefix (e.g. /sicredi/mentormatch/...).
export function useTenantRouter() {
  const tenant = useTenant()

  const pushTenant = useCallback(
    (path: string) => {
      const href = getTenantRoutePath(tenant.slug, path)
      window.location.assign(href)
    },
    [tenant.slug]
  )

  const hrefTenant = useCallback(
    (path: string) => getTenantRoutePath(tenant.slug, path),
    [tenant.slug]
  )

  return { pushTenant, hrefTenant, tenantSlug: tenant.slug }
}
