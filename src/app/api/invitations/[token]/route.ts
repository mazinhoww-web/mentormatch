import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invitation = await db.invitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json(
        { valid: false, reason: "Convite nao encontrado" },
        { status: 200 }
      )
    }

    if (invitation.used) {
      return NextResponse.json(
        { valid: false, reason: "Este convite ja foi utilizado" },
        { status: 200 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { valid: false, reason: "Este convite expirou" },
        { status: 200 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      role: invitation.role,
      tenantId: invitation.tenantId,
    })
  } catch (error) {
    console.error("[INVITATION_VALIDATE_ERROR]", error)
    return NextResponse.json(
      { valid: false, reason: "Erro ao validar convite" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    const invitation = await db.invitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: "Convite nao encontrado" },
        { status: 404 }
      )
    }

    const updated = await db.invitation.update({
      where: { token },
      data: { used: body.used ?? true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[INVITATION_PATCH_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao atualizar convite" },
      { status: 500 }
    )
  }
}
