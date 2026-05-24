import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function escapeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCsvField).join(",")
  const dataLines = rows.map((row) => row.map(escapeCsvField).join(","))
  return [headerLine, ...dataLines].join("\n")
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (
      !session?.user?.id ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const tenantId = searchParams.get("tenantId") || session.user.tenantId

    if (!type || !["users", "connections", "skills"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo de exportacao invalido. Use: users, connections ou skills" },
        { status: 400 }
      )
    }

    let csv = ""

    if (type === "users") {
      const users = await db.user.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      })

      const headers = ["id", "name", "email", "role", "status", "createdAt"]
      const rows = users.map((u) => [
        u.id,
        u.name,
        u.email,
        u.role,
        u.status,
        u.createdAt.toISOString(),
      ])
      csv = buildCsv(headers, rows)
    }

    if (type === "connections") {
      const connections = await db.connection.findMany({
        where: { tenantId },
        include: {
          mentor: { select: { name: true } },
          mentee: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      })

      const headers = ["mentor_name", "mentee_name", "status", "createdAt"]
      const rows = connections.map((c) => [
        c.mentor.name,
        c.mentee.name,
        c.status,
        c.createdAt.toISOString(),
      ])
      csv = buildCsv(headers, rows)
    }

    if (type === "skills") {
      const skills = await db.skill.findMany({
        select: {
          name: true,
          category: true,
          usageCount: true,
        },
        orderBy: { usageCount: "desc" },
      })

      const headers = ["name", "category", "usageCount"]
      const rows = skills.map((s) => [s.name, s.category, s.usageCount])
      csv = buildCsv(headers, rows)
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="mentormatch-${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  } catch (error) {
    console.error("[ADMIN_EXPORT_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao exportar dados" },
      { status: 500 }
    )
  }
}
