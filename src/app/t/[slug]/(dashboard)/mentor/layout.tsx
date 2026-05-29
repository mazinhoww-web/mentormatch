import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// Role-route guard (DB-authoritative). Only MENTOR (and ADMIN/SUPER_ADMIN)
// may view the mentor dashboard. Reads the DB rather than the JWT, which can
// be stale right after onboarding.
export default async function MentorRouteGuard({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (dbUser?.role === "MENTEE") {
    redirect(`/t/${slug}/mentee`)
  }

  return <>{children}</>
}
