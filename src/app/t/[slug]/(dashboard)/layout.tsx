import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getTenantBySlug } from "@/lib/tenant"
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

  return (
    <DashboardLayout
      tenantSlug={slug}
      role={session.user.role as "MENTOR" | "MENTEE" | "ADMIN"}
      userName={session.user.name}
    >
      {children}
    </DashboardLayout>
  )
}
