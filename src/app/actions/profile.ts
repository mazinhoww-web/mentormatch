"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

type Result<T = void> = T extends void
  ? { ok: true } | { ok: false; error: string }
  : { ok: true; data: T } | { ok: false; error: string }

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Nao autorizado")
  return session
}

export async function updateProfile(data: {
  name?: string
  bio?: string
  headline?: string
  linkedin?: string | null
  whatsapp?: string
}): Promise<Result> {
  try {
    const session = await requireAuth()
    await db.user.update({
      where: { id: session.user.id },
      data,
    })
    revalidatePath("/t")
    return { ok: true }
  } catch (e) {
    console.error("[UPDATE_PROFILE_ERROR]", e)
    return { ok: false, error: "Erro ao atualizar perfil" }
  }
}

export async function changePassword(
  current: string,
  next: string
): Promise<Result> {
  try {
    const session = await requireAuth()
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })
    if (!user?.password) return { ok: false, error: "Usuario sem senha definida" }
    const ok = await bcrypt.compare(current, user.password)
    if (!ok) return { ok: false, error: "Senha atual incorreta" }
    const hash = await bcrypt.hash(next, 10)
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hash },
    })
    return { ok: true }
  } catch (e) {
    console.error("[CHANGE_PASSWORD_ERROR]", e)
    return { ok: false, error: "Erro ao trocar senha" }
  }
}

export async function uploadAvatar(file: File): Promise<Result<{ url: string }>> {
  try {
    const session = await requireAuth()
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const { url } = await put(
      `mentormatch/avatars/${session.user.id}-${Date.now()}-${safe}`,
      file,
      { access: "public" }
    )
    await db.user.update({
      where: { id: session.user.id },
      data: { image: url },
    })
    revalidatePath("/t")
    return { ok: true, data: { url } }
  } catch (e) {
    console.error("[UPLOAD_AVATAR_ERROR]", e)
    return { ok: false, error: "Erro ao enviar foto" }
  }
}
