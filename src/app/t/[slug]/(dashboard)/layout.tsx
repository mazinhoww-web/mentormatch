import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
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

  // Tenant-ownership guard: a user from tenant A must not read tenant B's
  // dashboard. SUPER_ADMIN is exempt (manages every tenant). Anyone else is
  // sent to their own dashboard.
  if (
    session.user.role !== "SUPER_ADMIN" &&
    session.user.tenantSlug !== slug
  ) {
    redirect(getDashboardHref(session.user.role, session.user.tenantSlug, true))
  }

  return (
    <DashboardLayout
      tenantSlug={slug}
      role={session.user.role as "MENTOR" | "MENTEE" | "ADMIN"}
      userName={session.user.name}
      brandColor={tenant.brandColor}
      secondaryColor={tenant.secondaryColor}
    >
      {children}
    </DashboardLayout>
  )
}
