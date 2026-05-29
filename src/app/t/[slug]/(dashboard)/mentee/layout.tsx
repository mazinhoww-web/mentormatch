import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

// Role-route guard: only MENTEE (and ADMIN/SUPER_ADMIN) may view the mentee
// dashboard. A MENTOR hitting /t/:slug/mentee is sent to the mentor dashboard.
export default async function MenteeRouteGuard({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()

  if (session?.user?.role === "MENTOR") {
    redirect(`/t/${slug}/mentor`)
  }

  return <>{children}</>
}
