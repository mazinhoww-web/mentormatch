import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId é obrigatório" },
        { status: 400 }
      )
    }

    const skills = await db.skill.findMany({
      where: {
        OR: [
          { tenantId },
          { global: true },
        ],
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(skills)
  } catch (error) {
    console.error("[SKILLS_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao buscar habilidades" },
      { status: 500 }
    )
  }
}

const createSkillSchema = z.object({
  name: z.string().min(2),
  tenantId: z.string().optional(),
  global: z.boolean().optional().default(false),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = createSkillSchema.parse(body)

    const existingSkill = await db.skill.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
        OR: [
          { tenantId: data.tenantId ?? session.user.tenantId },
          { global: true },
        ],
      },
    })

    if (existingSkill) {
      return NextResponse.json(
        { error: "Habilidade já existe" },
        { status: 409 }
      )
    }

    const skill = await db.skill.create({
      data: {
        name: data.name,
        tenantId: data.global ? null : (data.tenantId ?? session.user.tenantId),
        global: data.global,
      },
    })

    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[SKILLS_POST_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao criar habilidade" },
      { status: 500 }
    )
  }
}
