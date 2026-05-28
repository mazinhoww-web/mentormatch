"use client"

import { useCallback } from "react"
import { useTenant } from "@/components/providers/TenantContext"
import { getTenantRoutePath } from "@/lib/tenant-href"

const BASE_PATH = "/mentormatch"

// pushTenant: full-page navigation via window.location.assign (which does NOT
// auto-prepend basePath), so we add it manually. hrefTenant returns the
// in-app path for use with <Link>, which auto-prepends basePath.
export function useTenantRouter() {
  const tenant = useTenant()

  const pushTenant = useCallback(
    (path: string) => {
      const href = getTenantRoutePath(tenant.slug, path)
      window.location.assign(`${BASE_PATH}${href}`)
    },
    [tenant.slug]
  )

  const hrefTenant = useCallback(
    (path: string) => getTenantRoutePath(tenant.slug, path),
    [tenant.slug]
  )

  return { pushTenant, hrefTenant, tenantSlug: tenant.slug }
}
