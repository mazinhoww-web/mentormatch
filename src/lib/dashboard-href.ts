type Role = "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "MENTEE" | string | null | undefined

export function getDashboardHref(
  role: Role,
  tenantSlug: string | null | undefined,
  onboardingDone?: boolean
): string {
  if (role === "SUPER_ADMIN") return "/admin"
  if (!role) return "/select-profile"
  if (!tenantSlug) return "/select-profile"
  if (onboardingDone === false) return "/onboarding/setup"
  if (role === "ADMIN") return `/t/${tenantSlug}/admin/users`
  if (role === "MENTOR") return `/t/${tenantSlug}/mentor`
  if (role === "MENTEE") return `/t/${tenantSlug}/mentee`
  return "/select-profile"
}
