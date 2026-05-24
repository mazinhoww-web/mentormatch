import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const profileSchema = z.object({
  role: z.enum(["MENTOR", "MENTEE"]),
  name: z.string().min(2),
  headline: z.string().optional(),
  bio: z.string().min(10),
  education: z.string().optional(),
  experience: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")),
  whatsapp: z.string().min(10),
  image: z.string().url().optional(),
  skills: z.array(z.string()).min(1),
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
    const data = profileSchema.parse(body)

    const isTeaching = data.role === "MENTOR"

    const updatedUser = await db.$transaction(async (tx) => {
      // Update user profile
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: {
          name: data.name,
          role: data.role,
          headline: data.headline,
          bio: data.bio,
          education: data.education,
          experience: data.experience,
          linkedin: data.linkedin || null,
          whatsapp: data.whatsapp,
          image: data.image || undefined,
        },
      })

      // Remove existing skills
      await tx.userSkill.deleteMany({
        where: { userId: session.user.id },
      })

      // Create or find skills, then create UserSkill records
      for (const skillName of data.skills) {
        let skill = await tx.skill.findUnique({
          where: { name: skillName },
        })

        if (!skill) {
          skill = await tx.skill.create({
            data: {
              name: skillName,
            },
          })
        }

        await tx.userSkill.create({
          data: {
            userId: session.user.id,
            skillId: skill.id,
            isTeaching,
          },
        })
      }

      return tx.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          headline: true,
          bio: true,
          image: true,
          skills: {
            include: { skill: true },
          },
        },
      })
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[COMPLETE_PROFILE_ERROR]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
