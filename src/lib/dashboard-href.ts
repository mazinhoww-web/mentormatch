type Role = "SUPER_ADMIN" | "ADMIN" | "MENTOR" | "MENTEE" | string | null | undefined

export function getDashboardHref(
  role: Role,
  tenantSlug: string | null | undefined,
  onboardingDone?: boolean
): string {
  if (role === "SUPER_ADMIN") return "/admin"
  if (!role) return "/select-profile"
  if (!tenantSlug) return "/select-profile"
  // Canonical onboarding is the role-specific flow (mentor|mentee), matching
  // resolvePostLoginHref. The old /onboarding/setup wizard was a divergent
  // second flow and has been removed.
  if (onboardingDone === false) {
    if (role === "MENTOR") return "/onboarding/mentor"
    if (role === "MENTEE") return "/onboarding/mentee"
    return "/select-profile"
  }
  if (role === "ADMIN") return `/t/${tenantSlug}/admin/users`
  if (role === "MENTOR") return `/t/${tenantSlug}/mentor`
  if (role === "MENTEE") return `/t/${tenantSlug}/mentee`
  return "/select-profile"
}
