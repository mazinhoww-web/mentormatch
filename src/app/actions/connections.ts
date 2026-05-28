"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Nao autorizado")
  return session
}

export async function scheduleSession(connectionId: string, _datetime: string) {
  await requireAuth()
  await db.connection.update({
    where: { id: connectionId },
    data: { updatedAt: new Date() },
  })
  revalidatePath("/t")
}

export async function endMentorship(connectionId: string) {
  await requireAuth()
  await db.connection.update({
    where: { id: connectionId },
    data: { status: "COMPLETED", endedAt: new Date() },
  })
  revalidatePath("/t")
}

export async function sendConnectionRequest(
  mentorId: string,
  menteeId: string,
  message?: string,
  tenantId?: string
) {
  await requireAuth()
  if (!tenantId) throw new Error("tenantId obrigatorio")

  const existing = await db.connection.findFirst({
    where: {
      mentorId,
      menteeId,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  })
  if (existing) {
    throw new Error("Ja existe uma solicitacao em andamento")
  }

  const created = await db.connection.create({
    data: {
      mentorId,
      menteeId,
      tenantId,
      status: "PENDING",
      message: message || null,
    },
  })

  revalidatePath("/t")
  return created
}
