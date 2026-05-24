import { NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendInvitationEmail } from "@/lib/email"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (
      !session?.user?.id ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { error: "Nao autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId") || session.user.tenantId

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId obrigatorio" },
        { status: 400 }
      )
    }

    const invitations = await db.invitation.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        invitedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    const result = invitations.map((inv) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role,
      token: inv.token,
      used: inv.used,
      expired: new Date() > inv.expiresAt,
      expiresAt: inv.expiresAt,
      createdAt: inv.createdAt,
      invitedBy: inv.invitedBy,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("[INVITATIONS_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao buscar convites" },
      { status: 500 }
    )
  }
}

const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(["MENTOR", "MENTEE"]),
  tenantId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (
      !session?.user?.id ||
      (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
    ) {
      return NextResponse.json(
        { error: "Nao autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { email, role, tenantId: bodyTenantId } = createInvitationSchema.parse(body)

    const tenantId = bodyTenantId || session.user.tenantId

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId obrigatorio" },
        { status: 400 }
      )
    }

    // Check if there's already a pending invitation for this email in this tenant
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        tenantId,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Ja existe um convite pendente para este e-mail" },
        { status: 409 }
      )
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    const invitation = await db.invitation.create({
      data: {
        email,
        role,
        tenantId,
        token,
        expiresAt,
        invitedById: session.user.id,
      },
    })

    // Send invitation email
    const tenant = await db.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true },
    })

    const inviterName = session.user.name || "Um administrador"
    const tenantName = tenant?.name || "MentorMatch"

    try {
      await sendInvitationEmail(email, inviterName, tenantName, token)
    } catch (emailError) {
      console.error("[INVITATION_EMAIL_ERROR]", emailError)
      // Don't fail the request if email fails - invitation is still created
    }

    return NextResponse.json(invitation, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados invalidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[INVITATIONS_POST_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao criar convite" },
      { status: 500 }
    )
  }
}
