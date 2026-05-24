import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const isMentor = session.user.role === "MENTOR"

    const entries = await db.waitlistEntry.findMany({
      where: isMentor
        ? { mentorId: session.user.id }
        : { menteeId: session.user.id },
      include: {
        mentee: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
          },
        },
        mentor: {
          select: {
            id: true,
            name: true,
            image: true,
            headline: true,
          },
        },
      },
      orderBy: { position: "asc" },
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error("[WAITLIST_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao buscar lista de espera" },
      { status: 500 }
    )
  }
}

const reorderSchema = z.object({
  entries: z.array(
    z.object({
      id: z.string(),
      position: z.number().int().positive(),
    })
  ),
})

export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    if (session.user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Apenas mentores podem reordenar a lista de espera" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { entries } = reorderSchema.parse(body)

    // Verify all entries belong to this mentor
    const existingEntries = await db.waitlistEntry.findMany({
      where: {
        id: { in: entries.map((e) => e.id) },
        mentorId: session.user.id,
      },
    })

    if (existingEntries.length !== entries.length) {
      return NextResponse.json(
        { error: "Uma ou mais entradas não pertencem a este mentor" },
        { status: 403 }
      )
    }

    // Update positions
    await Promise.all(
      entries.map((entry) =>
        db.waitlistEntry.update({
          where: { id: entry.id },
          data: { position: entry.position },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[WAITLIST_PATCH_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao reordenar lista de espera" },
      { status: 500 }
    )
  }
}

const deleteSchema = z.object({
  id: z.string(),
})

export async function DELETE(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id } = deleteSchema.parse(body)

    const entry = await db.waitlistEntry.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json(
        { error: "Entrada não encontrada" },
        { status: 404 }
      )
    }

    // Only the mentor who owns the waitlist or the mentee themselves can remove
    if (entry.mentorId !== session.user.id && entry.menteeId !== session.user.id) {
      return NextResponse.json(
        { error: "Sem permissão para remover esta entrada" },
        { status: 403 }
      )
    }

    await db.waitlistEntry.delete({
      where: { id },
    })

    // Reorder remaining positions
    await db.waitlistEntry.updateMany({
      where: {
        mentorId: entry.mentorId,
        position: { gt: entry.position },
      },
      data: { position: { decrement: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[WAITLIST_DELETE_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao remover da lista de espera" },
      { status: 500 }
    )
  }
}
