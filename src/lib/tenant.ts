import { db } from "./db"
import { cache } from "react"

export const getTenantBySlug = cache(async (slug: string) => {
  return db.tenant.findUnique({
    where: { slug, active: true },
    include: {
      subscription: {
        include: { plan: true },
      },
    },
  })
})

export const getTenantStats = cache(async (tenantId: string) => {
  const [totalUsers, totalMentors, totalMentees, activeConnections, pendingUsers] =
    await Promise.all([
      db.user.count({ where: { tenantId } }),
      db.user.count({ where: { tenantId, role: "MENTOR" } }),
      db.user.count({ where: { tenantId, role: "MENTEE" } }),
      db.connection.count({ where: { tenantId, status: "ACCEPTED" } }),
      db.user.count({ where: { tenantId, status: "PENDING" } }),
    ])

  return { totalUsers, totalMentors, totalMentees, activeConnections, pendingUsers }
})
