import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")
    const skill = searchParams.get("skill")
    const q = searchParams.get("q")

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId é obrigatório" },
        { status: 400 }
      )
    }

    const mentors = await db.user.findMany({
      where: {
        tenantId,
        role: "MENTOR",
        status: "APPROVED",
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { headline: { contains: q, mode: "insensitive" } },
                { bio: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(skill
          ? {
              skills: {
                some: {
                  type: "TEACHING",
                  skill: {
                    name: { equals: skill, mode: "insensitive" },
                  },
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        headline: true,
        bio: true,
        education: true,
        experience: true,
        linkedin: true,
        maxMentees: true,
        skills: {
          where: { type: "TEACHING" },
          include: { skill: true },
        },
        _count: {
          select: {
            mentorConns: {
              where: { status: "ACCEPTED" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    })

    const result = mentors.map((mentor) => ({
      ...mentor,
      activeConnections: mentor._count.mentorConns,
      _count: undefined,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("[MENTORS_LIST_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao buscar mentores" },
      { status: 500 }
    )
  }
}
