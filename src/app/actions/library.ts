"use server"

import { revalidatePath } from "next/cache"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Nao autorizado")
  return session
}

function detectFormat(filename: string): "PDF" | "VIDEO" | "ARTICLE" | "OTHER" {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  if (ext === "pdf") return "PDF"
  if (["mp4", "mov", "webm", "mkv"].includes(ext)) return "VIDEO"
  if (["md", "txt", "doc", "docx"].includes(ext)) return "ARTICLE"
  return "OTHER"
}

export async function uploadMaterial(
  formData: FormData
): Promise<Result<{ id: string }>> {
  try {
    const session = await requireAuth()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string
    const description = formData.get("description") as string | null
    const tenantId = formData.get("tenantId") as string

    if (!file || !title || !tenantId) {
      return { ok: false, error: "Dados invalidos" }
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const { url } = await put(
      `mentormatch/library/${tenantId}/${Date.now()}-${safeName}`,
      file,
      { access: "public" }
    )

    const created = await db.libraryItem.create({
      data: {
        title,
        description: description || null,
        fileUrl: url,
        fileType: detectFormat(file.name),
        fileSize: file.size,
        tenantId,
        uploadedById: session.user.id,
      },
    })

    revalidatePath("/t")
    return { ok: true, data: { id: created.id } }
  } catch (e) {
    console.error("[UPLOAD_MATERIAL_ERROR]", e)
    return { ok: false, error: "Erro ao enviar material" }
  }
}

export async function toggleSaveMaterial(_materialId: string) {
  await requireAuth()
  revalidatePath("/t")
}
