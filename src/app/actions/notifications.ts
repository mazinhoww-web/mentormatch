"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Nao autorizado")
  return session
}

export async function markAsRead(notifId: string) {
  await requireAuth()
  await db.notification.update({
    where: { id: notifId },
    data: { read: true },
  })
  revalidatePath("/t")
}

export async function markAllAsRead() {
  const session = await requireAuth()
  await db.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })
  revalidatePath("/t")
}
