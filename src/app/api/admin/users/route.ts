import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendAccountApprovedEmail } from "@/lib/email"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const role = searchParams.get("role")
    const q = searchParams.get("q")

    const users = await db.user.findMany({
      where: {
        tenantId: session.user.tenantId,
        ...(status ? { status: status as never } : {}),
        ...(role ? { role: role as never } : {}),
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { email: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        headline: true,
        createdAt: true,
        _count: {
          select: {
            mentorConns: { where: { status: "ACCEPTED" } },
            menteeConns: { where: { status: "ACCEPTED" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("[ADMIN_USERS_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    )
  }
}

const updateUserSchema = z.object({
  userId: z.string(),
  status: z.enum(["APPROVED", "REJECTED", "SUSPENDED"]),
})

export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, status } = updateUserSchema.parse(body)

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, tenantId: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Ensure the user belongs to the admin's tenant
    if (user.tenantId !== session.user.tenantId) {
      return NextResponse.json(
        { error: "Sem permissão para gerenciar este usuário" },
        { status: 403 }
      )
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    })

    if (status === "APPROVED") {
      // Get tenant name for the email
      const tenant = await db.tenant.findUnique({
        where: { id: session.user.tenantId },
        select: { name: true },
      })

      // Send approval email
      if (tenant) {
        await sendAccountApprovedEmail(user.email, tenant.name)
      }

      // Create in-app notification
      await db.notification.create({
        data: {
          userId: user.id,
          tenantId: session.user.tenantId,
          type: "ACCOUNT_APPROVED",
          title: "Conta aprovada!",
          message: "Sua conta foi aprovada. Bem-vindo ao programa de mentoria!",
        },
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[ADMIN_USERS_PATCH_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    )
  }
}
