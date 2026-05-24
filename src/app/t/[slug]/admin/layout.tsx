import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getTenantBySlug } from "@/lib/tenant"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

interface AdminLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { slug } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect(`/t/${slug}/${session.user.role === "MENTOR" ? "mentor" : "mentee"}`)
  }

  const tenant = await getTenantBySlug(slug)

  if (!tenant) {
    redirect("/login")
  }

  return (
    <DashboardLayout
      tenantSlug={slug}
      role="ADMIN"
      userName={session.user.name || "Admin"}
    >
      {children}
    </DashboardLayout>
  )
}
