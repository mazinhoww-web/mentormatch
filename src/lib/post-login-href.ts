import { db } from "@/lib/db"
import { getDashboardHref } from "@/lib/dashboard-href"

export async function resolvePostLoginHref(userId: string): Promise<string> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      onboardingDone: true,
      tenant: { select: { slug: true } },
    },
  })
  if (!user) return "/login"
  if (user.role === "SUPER_ADMIN") return "/admin"
  if (!user.role) return "/select-profile"
  if (!user.tenant?.slug) return "/select-profile"
  if (!user.onboardingDone) {
    if (user.role === "MENTOR") return "/onboarding/mentor"
    if (user.role === "MENTEE") return "/onboarding/mentee"
    return "/select-profile"
  }
  return getDashboardHref(user.role, user.tenant.slug, true)
}
