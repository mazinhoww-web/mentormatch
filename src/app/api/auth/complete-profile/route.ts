import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// Resolve the tenant a self-registered user belongs to. Public registration
// leaves tenantId null; the active tenant is carried by the `mm-tenant` cookie
// (set by the branded landing, e.g. /sicredi), falling back to "default".
// Without this the user finishes onboarding with tenantId=null and gets sent
// back to /select-profile forever.
async function resolveTenantId(currentTenantId: string | null): Promise<string | null> {
  if (currentTenantId) return currentTenantId
  const store = await cookies()
  const slug = store.get("mm-tenant")?.value || "default"
  const tenant =
    (await db.tenant.findUnique({ where: { slug, active: true }, select: { id: true } })) ??
    (await db.tenant.findUnique({ where: { slug: "default", active: true }, select: { id: true } }))
  return tenant?.id ?? null
}

const profileSchema = z.object({
  role: z.enum(["MENTOR", "MENTEE"]),
  name: z.string().min(2),
  headline: z.string().optional(),
  bio: z.string().optional(),
  education: z.string().optional(),
  experience: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal("")).or(z.literal(undefined)),
  whatsapp: z.string().min(10),
  image: z.string().url().optional().nullable(),
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

    const existing = await db.user.findUnique({
      where: { id: session.user.id },
      select: { tenantId: true },
    })

    const tenantId = await resolveTenantId(existing?.tenantId ?? null)
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant nao encontrado. Contate o administrador." },
        { status: 400 }
      )
    }

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
          tenantId,
          status: "APPROVED",
          onboardingDone: true,
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
