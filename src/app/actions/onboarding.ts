"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

type Result = { ok: true } | { ok: false; error: string }

export async function completeOnboarding(data: {
  name?: string
  bio?: string | null
  linkedin?: string | null
  availability: Record<string, { enabled: boolean; start: string; end: string }>
  timezone: string
  maxMentees?: number
  skipped?: boolean
}): Promise<Result> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { ok: false, error: "Nao autorizado" }

    await db.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.linkedin !== undefined ? { linkedin: data.linkedin } : {}),
        ...(typeof data.maxMentees === "number" ? { maxMentees: data.maxMentees } : {}),
        onboardingDone: true,
      },
    })

    revalidatePath("/t")
    return { ok: true }
  } catch (e) {
    console.error("[COMPLETE_ONBOARDING_ERROR]", e)
    return { ok: false, error: "Erro ao concluir onboarding" }
  }
}
