import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  invitationToken: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, invitationToken } = registerSchema.parse(body)

    // If invitation token is provided, validate it
    let invitation = null
    if (invitationToken) {
      invitation = await db.invitation.findUnique({
        where: { token: invitationToken },
      })

      if (!invitation) {
        return NextResponse.json(
          { error: "Convite invalido" },
          { status: 400 }
        )
      }

      if (invitation.used) {
        return NextResponse.json(
          { error: "Este convite ja foi utilizado" },
          { status: 400 }
        )
      }

      if (new Date() > invitation.expiresAt) {
        return NextResponse.json(
          { error: "Este convite expirou" },
          { status: 400 }
        )
      }

      if (invitation.email !== email) {
        return NextResponse.json(
          { error: "E-mail nao corresponde ao convite" },
          { status: 400 }
        )
      }
    }

    const existingUser = await db.user.findFirst({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Um usuário com este email já existe" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: invitation ? "APPROVED" : "PENDING",
        ...(invitation ? { role: invitation.role, tenantId: invitation.tenantId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
      },
    })

    // Mark invitation as used
    if (invitation) {
      await db.invitation.update({
        where: { id: invitation.id },
        data: { used: true },
      })
    }

    sendWelcomeEmail(user.email, user.name ?? "").catch(() => {})

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
