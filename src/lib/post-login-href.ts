import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { getDashboardHref } from "@/lib/dashboard-href"
import { getTenantRoutePath } from "@/lib/tenant-href"

async function readTenantCookie(): Promise<string | null> {
  try {
    const store = await cookies()
    return store.get("mm-tenant")?.value ?? null
  } catch {
    return null
  }
}

export async function resolvePostLoginHref(userId: string): Promise<string> {
  const tenantSlug = await readTenantCookie()
  const wrap = (path: string) => getTenantRoutePath(tenantSlug, path)

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      onboardingDone: true,
      tenant: { select: { slug: true } },
    },
  })
  if (!user) return wrap("/login")
  if (user.role === "SUPER_ADMIN") return wrap("/admin")
  if (!user.role) return wrap("/select-profile")
  if (!user.tenant?.slug) return wrap("/select-profile")
  if (!user.onboardingDone) {
    if (user.role === "MENTOR") return wrap("/onboarding/mentor")
    if (user.role === "MENTEE") return wrap("/onboarding/mentee")
    return wrap("/select-profile")
  }
  return wrap(getDashboardHref(user.role, user.tenant.slug, true))
}

export async function tenantWrappedRedirect(path: string): Promise<string> {
  const tenantSlug = await readTenantCookie()
  return getTenantRoutePath(tenantSlug, path)
}
