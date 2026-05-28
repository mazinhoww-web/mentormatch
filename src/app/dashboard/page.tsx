import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { resolvePostLoginHref } from "@/lib/post-login-href"

export const dynamic = "force-dynamic"

export default async function DashboardAliasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  redirect(await resolvePostLoginHref(session.user.id))
}
