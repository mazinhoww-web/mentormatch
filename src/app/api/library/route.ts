import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("tenantId")

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId é obrigatório" },
        { status: 400 }
      )
    }

    const items = await db.libraryItem.findMany({
      where: { tenantId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error("[LIBRARY_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao buscar itens da biblioteca" },
      { status: 500 }
    )
  }
}

const createLibraryItemSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  fileUrl: z.string().url(),
  fileType: z.enum(["PDF", "VIDEO", "ARTICLE", "OTHER"]),
  fileSize: z.number().optional(),
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

    // Only ADMIN or MENTOR can create library items
    if (session.user.role !== "ADMIN" && session.user.role !== "MENTOR") {
      return NextResponse.json(
        { error: "Sem permissão para criar itens na biblioteca" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = createLibraryItemSchema.parse(body)

    const item = await db.libraryItem.create({
      data: {
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        tenantId: session.user.tenantId,
        uploadedById: session.user.id,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.issues },
        { status: 400 }
      )
    }

    console.error("[LIBRARY_POST_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao criar item na biblioteca" },
      { status: 500 }
    )
  }
}
