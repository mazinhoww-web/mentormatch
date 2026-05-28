import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      bio: true,
      headline: true,
      position: true,
      department: true,
      education: true,
      experience: true,
      linkedin: true,
      whatsapp: true,
      maxMentees: true,
      tenant: { select: { slug: true } },
      skills: {
        include: { skill: true },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 })
  }

  return NextResponse.json(user)
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  headline: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  linkedin: z.string().optional().nullable(),
  whatsapp: z.string().optional(),
  image: z.string().optional().nullable(),
  maxMentees: z.number().int().min(1).max(20).optional(),
  role: z.enum(["MENTOR", "MENTEE"]).optional(),
})

export async function PATCH(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    const updated = await db.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        bio: true,
        headline: true,
        linkedin: true,
        whatsapp: true,
        maxMentees: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados invalidos", details: error.issues },
        { status: 400 }
      )
    }
    console.error("[USERS_ME_PATCH_ERROR]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
