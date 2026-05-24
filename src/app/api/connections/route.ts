import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const isMentor = session.user.role === "MENTOR"

    const connections = await db.connection.findMany({
      where: {
        ...(isMentor
          ? { mentorId: session.user.id }
          : { menteeId: session.user.id }),
        ...(status ? { status: status as never } : {}),
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            headline: true,
            skills: {
              where: { type: "TEACHING" },
              include: { skill: true },
            },
          },
        },
        mentee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            headline: true,
            skills: {
              where: { type: "LEARNING" },
              include: { skill: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(connections)
  } catch (error) {
    console.error("[CONNECTIONS_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao buscar conexões" },
      { status: 500 }
    )
  }
}

const createConnectionSchema = z.object({
  mentorId: z.string(),
  message: z.string().min(10).max(500),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { mentorId, message } = createConnectionSchema.parse(body)

    // Check if connection already exists
    const existingConnection = await db.connection.findFirst({
      where: {
        mentorId,
        menteeId: session.user.id,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    })

    if (existingConnection) {
      return NextResponse.json(
        { error: "Já existe uma conexão com este mentor" },
        { status: 409 }
      )
    }

    // Check mentor capacity
    const mentor = await db.user.findUnique({
      where: { id: mentorId },
      select: {
        id: true,
        maxMentees: true,
        tenantId: true,
        name: true,
        _count: {
          select: {
            mentorConns: {
              where: { status: "ACCEPTED" },
            },
          },
        },
      },
    })

    if (!mentor) {
      return NextResponse.json(
        { error: "Mentor não encontrado" },
        { status: 404 }
      )
    }

    const activeConnections = mentor._count.mentorConns

    // If mentor is at capacity, create a waitlist entry
    if (activeConnections >= mentor.maxMentees) {
      const lastWaitlistEntry = await db.waitlistEntry.findFirst({
        where: { mentorId },
        orderBy: { position: "desc" },
      })

      const position = (lastWaitlistEntry?.position ?? 0) + 1

      await db.waitlistEntry.create({
        data: {
          mentorId,
          menteeId: session.user.id,
          position,
        },
      })

      return NextResponse.json(
        { waitlisted: true, position },
        { status: 201 }
      )
    }

    // Create connection
    const connection = await db.connection.create({
      data: {
        mentorId,
        menteeId: session.user.id,
        tenantId: session.user.tenantId,
        message,
        status: "PENDING",
      },
      include: {
        mentor: {
          select: { id: true, name: true, email: true, image: true },
        },
        mentee: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })

    // Create notification for the mentor
    await db.notification.create({
      data: {
        userId: mentorId,
        tenantId: session.user.tenantId,
        type: "CONNECTION_REQUEST",
        title: "Nova solicitação de mentoria",
        message: `${session.user.name} gostaria de ser mentorado por você.`,
        metadata: { connectionId: connection.id },
      },
    })

    return NextResponse.json(connection, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[CONNECTIONS_POST_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao criar conexão" },
      { status: 500 }
    )
  }
}

const updateConnectionSchema = z.object({
  connectionId: z.string(),
  status: z.enum(["ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"]),
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

    const body = await request.json()
    const { connectionId, status } = updateConnectionSchema.parse(body)

    const connection = await db.connection.findUnique({
      where: { id: connectionId },
      include: {
        mentor: { select: { id: true, name: true, maxMentees: true } },
        mentee: { select: { id: true, name: true } },
      },
    })

    if (!connection) {
      return NextResponse.json(
        { error: "Conexão não encontrada" },
        { status: 404 }
      )
    }

    // Only the mentor can accept or reject
    if (
      (status === "ACCEPTED" || status === "REJECTED") &&
      connection.mentorId !== session.user.id
    ) {
      return NextResponse.json(
        { error: "Apenas o mentor pode aceitar ou rejeitar" },
        { status: 403 }
      )
    }

    // When accepting, check capacity again
    if (status === "ACCEPTED") {
      const activeCount = await db.connection.count({
        where: {
          mentorId: connection.mentorId,
          status: "ACCEPTED",
        },
      })

      if (activeCount >= connection.mentor.maxMentees) {
        return NextResponse.json(
          { error: "Mentor atingiu o limite de mentorados" },
          { status: 409 }
        )
      }
    }

    const updatedConnection = await db.connection.update({
      where: { id: connectionId },
      data: { status },
    })

    // Create notification for the mentee
    if (status === "ACCEPTED") {
      await db.notification.create({
        data: {
          userId: connection.menteeId,
          tenantId: connection.tenantId,
          type: "CONNECTION_ACCEPTED",
          title: "Solicitação aceita!",
          message: `${connection.mentor.name} aceitou sua solicitação de mentoria.`,
          metadata: { connectionId },
        },
      })
    }

    if (status === "REJECTED") {
      await db.notification.create({
        data: {
          userId: connection.menteeId,
          tenantId: connection.tenantId,
          type: "CONNECTION_REJECTED",
          title: "Solicitação recusada",
          message: `${connection.mentor.name} recusou sua solicitação de mentoria.`,
          metadata: { connectionId },
        },
      })

      // Check if there's a waitlist entry to promote
      const nextInLine = await db.waitlistEntry.findFirst({
        where: { mentorId: connection.mentorId },
        orderBy: { position: "asc" },
        include: {
          mentee: { select: { id: true, name: true } },
        },
      })

      if (nextInLine) {
        // Create a connection for the promoted mentee
        await db.connection.create({
          data: {
            mentorId: connection.mentorId,
            menteeId: nextInLine.menteeId,
            tenantId: connection.tenantId,
            status: "PENDING",
            message: "Promovido da lista de espera",
          },
        })

        // Notify the promoted mentee
        await db.notification.create({
          data: {
            userId: nextInLine.menteeId,
            tenantId: connection.tenantId,
            type: "WAITLIST_PROMOTED",
            title: "Promovido da lista de espera!",
            message: `Uma vaga se abriu com ${connection.mentor.name}. Sua solicitação foi enviada automaticamente.`,
          },
        })

        // Remove from waitlist
        await db.waitlistEntry.delete({
          where: { id: nextInLine.id },
        })

        // Reorder remaining waitlist entries
        await db.waitlistEntry.updateMany({
          where: {
            mentorId: connection.mentorId,
            position: { gt: nextInLine.position },
          },
          data: { position: { decrement: 1 } },
        })
      }
    }

    return NextResponse.json(updatedConnection)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[CONNECTIONS_PATCH_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao atualizar conexão" },
      { status: 500 }
    )
  }
}
