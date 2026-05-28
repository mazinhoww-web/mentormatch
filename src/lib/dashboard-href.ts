type Role = "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "MENTEE" | string | null | undefined

export function getDashboardHref(role: Role, tenantSlug: string | null | undefined): string {
  if (role === "SUPER_ADMIN") return "/admin"
  if (!tenantSlug) return "/select-profile"
  if (role === "ADMIN") return `/t/${tenantSlug}/admin/users`
  if (role === "MENTOR") return `/t/${tenantSlug}/mentor`
  if (role === "MENTEE") return `/t/${tenantSlug}/mentee`
  return "/select-profile"
}
