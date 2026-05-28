import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDashboardHref } from "@/lib/dashboard-href"

export default async function DashboardAliasPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  redirect(getDashboardHref(session.user.role, session.user.tenantSlug))
}
