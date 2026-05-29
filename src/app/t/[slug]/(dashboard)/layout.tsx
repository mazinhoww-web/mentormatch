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

  if (!session?.user?.id) {
    redirect("/login")
  }

  const tenant = await getTenantBySlug(slug)

  if (!tenant) {
    notFound()
  }

  // Authoritative read from the DB (same source of truth as select-profile /
  // resolvePostLoginHref). The JWT can be stale right after onboarding (it was
  // minted at login, before role/tenant existed); trusting it here made this
  // guard disagree with select-profile and bounce the user in an infinite
  // redirect loop (ERR_TOO_MANY_REDIRECTS).
  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, tenant: { select: { slug: true } } },
  })

  if (!dbUser) {
    redirect("/login")
  }

  // Tenant-ownership guard: a user from tenant A must not read tenant B's
  // dashboard. SUPER_ADMIN is exempt (manages every tenant).
  if (dbUser.role !== "SUPER_ADMIN" && dbUser.tenant?.slug !== slug) {
    redirect(getDashboardHref(dbUser.role, dbUser.tenant?.slug, true))
  }

  return (
    <DashboardLayout
      tenantSlug={slug}
      role={dbUser.role as "MENTOR" | "MENTEE" | "ADMIN"}
      userName={dbUser.name ?? session.user.name}
      brandColor={tenant.brandColor}
      secondaryColor={tenant.secondaryColor}
    >
      {children}
    </DashboardLayout>
  )
}
