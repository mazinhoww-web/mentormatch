import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { resolvePostLoginHref } from "@/lib/post-login-href"
import SelectProfileClient from "./SelectProfileClient"

export const dynamic = "force-dynamic"

export default async function SelectProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, tenantId: true, onboardingDone: true },
  })

  if (user?.role && user?.tenantId) {
    redirect(await resolvePostLoginHref(session.user.id))
  }

  return <SelectProfileClient />
}
