import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getTenantStats } from "@/lib/tenant"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const tenantId = session.user.tenantId

    // Get base tenant stats
    const stats = await getTenantStats(tenantId)

    // Get connections over time (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const connectionsOverTime = await db.connection.groupBy({
      by: ["createdAt"],
      where: {
        tenantId,
        createdAt: { gte: sixMonthsAgo },
      },
      _count: { id: true },
    })

    // Aggregate connections by month
    const connectionsByMonth: Record<string, number> = {}
    for (const entry of connectionsOverTime) {
      const monthKey = `${entry.createdAt.getFullYear()}-${String(entry.createdAt.getMonth() + 1).padStart(2, "0")}`
      connectionsByMonth[monthKey] = (connectionsByMonth[monthKey] || 0) + entry._count.id
    }

    // Get additional metrics
    const [
      totalConnections,
      pendingConnections,
      rejectedConnections,
      completedConnections,
      totalWaitlistEntries,
      totalLibraryItems,
    ] = await Promise.all([
      db.connection.count({ where: { tenantId } }),
      db.connection.count({ where: { tenantId, status: "PENDING" } }),
      db.connection.count({ where: { tenantId, status: "REJECTED" } }),
      db.connection.count({ where: { tenantId, status: "COMPLETED" } }),
      db.waitlistEntry.count({
        where: {
          mentor: { tenantId },
        },
      }),
      db.libraryItem.count({ where: { tenantId } }),
    ])

    // Get top skills by usage
    const topSkills = await db.userSkill.groupBy({
      by: ["skillId"],
      where: {
        user: { tenantId },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    })

    const skillDetails = await db.skill.findMany({
      where: {
        id: { in: topSkills.map((s) => s.skillId) },
      },
      select: { id: true, name: true },
    })

    const topSkillsWithNames = topSkills.map((s) => ({
      skill: skillDetails.find((sd) => sd.id === s.skillId)?.name ?? "Unknown",
      count: s._count.id,
    }))

    return NextResponse.json({
      ...stats,
      totalConnections,
      pendingConnections,
      rejectedConnections,
      completedConnections,
      totalWaitlistEntries,
      totalLibraryItems,
      connectionsByMonth,
      topSkills: topSkillsWithNames,
    })
  } catch (error) {
    console.error("[ADMIN_REPORTS_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao gerar relatórios" },
      { status: 500 }
    )
  }
}
