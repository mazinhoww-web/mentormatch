import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getTenantBySlug } from "@/lib/tenant"
import { getDashboardHref } from "@/lib/dashboard-href"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export const metadata = {
  title: "MentorMatch - Dashboard",
  description: "Plataforma de mentoria",
}

export default async function TenantDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const tenant = await getTenantBySlug(slug)

  if (!tenant) {
    notFound()
  }

  // Tenant-ownership guard. We read role/tenant from the DB (authoritative)
  // rather than the JWT session: right after onboarding the token is stale
  // (it was minted at login, before the user had a tenant/role) and trusting
  // it here vs. the DB-based redirect in /select-profile produced an infinite
  // redirect loop (ERR_TOO_MANY_REDIRECTS). A user from tenant A must not read
  // tenant B's dashboard; SUPER_ADMIN is exempt (manages every tenant).
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      role: true,
      onboardingDone: true,
      tenant: { select: { slug: true } },
    },
  })

  const role = dbUser?.role ?? null

  if (role !== "SUPER_ADMIN" && dbUser?.tenant?.slug !== slug) {
    redirect(getDashboardHref(role, dbUser?.tenant?.slug, dbUser?.onboardingDone))
  }

  return (
    <DashboardLayout
      tenantSlug={slug}
      role={role as "MENTOR" | "MENTEE" | "ADMIN"}
      userName={dbUser?.name ?? session.user.name}
      brandColor={tenant.brandColor}
      secondaryColor={tenant.secondaryColor}
    >
      {children}
    </DashboardLayout>
  )
}
