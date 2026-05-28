import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDashboardHref } from "@/lib/dashboard-href"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "SUPER_ADMIN") {
    redirect(getDashboardHref(session.user.role, session.user.tenantSlug))
  }

  return <>{children}</>
}
