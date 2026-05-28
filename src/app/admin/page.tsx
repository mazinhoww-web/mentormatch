import { db } from "@/lib/db"
import { AdminGeralClient } from "@/components/admin-geral/AdminGeralClient"

export type TenantWithStats = {
  id: string
  name: string
  slug: string
  brandColor: string
  active: boolean
  logoUrl: string | null
  createdAt: string
  users: number
  mentors: number
  sessions: number
  hasDesignMd: boolean
}

export default async function SuperAdminPage() {
  const tenants = await db.tenant.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      brandColor: true,
      active: true,
      logoUrl: true,
      createdAt: true,
    },
  })

  const stats: TenantWithStats[] = await Promise.all(
    tenants.map(async (t) => {
      const [users, mentors, sessions] = await Promise.all([
        db.user.count({ where: { tenantId: t.id } }),
        db.user.count({ where: { tenantId: t.id, role: "MENTOR" } }),
        db.connection.count({
          where: { tenantId: t.id, status: "ACCEPTED" },
        }),
      ])
      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        brandColor: t.brandColor,
        active: t.active,
        logoUrl: t.logoUrl,
        createdAt: t.createdAt.toISOString(),
        users,
        mentors,
        sessions,
        hasDesignMd: Boolean(t.logoUrl?.endsWith(".md")),
      }
    })
  )

  return <AdminGeralClient tenants={stats} />
}
