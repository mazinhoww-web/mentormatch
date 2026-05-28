import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { resolvePostLoginHref } from "@/lib/post-login-href"
import MentorOnboardingClient from "./MentorOnboardingClient"

export const dynamic = "force-dynamic"

export default async function MentorOnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingDone: true, role: true, tenantId: true },
  })

  if (user?.onboardingDone && user.role && user.tenantId) {
    redirect(await resolvePostLoginHref(session.user.id))
  }

  return <MentorOnboardingClient />
}
