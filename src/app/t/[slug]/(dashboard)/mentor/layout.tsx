import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

// Role-route guard: only MENTOR (and ADMIN/SUPER_ADMIN) may view the mentor
// dashboard. A MENTEE hitting /t/:slug/mentor is sent to the mentee dashboard.
export default async function MentorRouteGuard({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()

  if (session?.user?.role === "MENTEE") {
    redirect(`/t/${slug}/mentee`)
  }

  return <>{children}</>
}
