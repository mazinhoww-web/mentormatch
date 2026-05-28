"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Nao autorizado")
  return session
}

export async function acceptRequest(requestId: string) {
  await requireAuth()
  await db.connection.update({
    where: { id: requestId },
    data: { status: "ACCEPTED", startedAt: new Date() },
  })
  revalidatePath("/t")
}

export async function rejectRequest(requestId: string, _reason?: string) {
  await requireAuth()
  await db.connection.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  })
  revalidatePath("/t")
}

export async function removeFromWaitlist(waitlistId: string) {
  await requireAuth()
  await db.waitlistEntry.delete({ where: { id: waitlistId } })
  revalidatePath("/t")
}
