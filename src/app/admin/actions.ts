"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

async function requireSuperAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Nao autorizado")
  }
  return session
}

const createSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug invalido"),
  brandColor: z.string().optional(),
})

export type CreateTenantResult =
  | { ok: true; slug: string }
  | { ok: false; error: string }

export async function createTenant(formData: FormData): Promise<CreateTenantResult> {
  try {
    await requireSuperAdmin()

    const parsed = createSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      brandColor: formData.get("brandColor") || undefined,
    })
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados invalidos" }
    }
    const { name, slug, brandColor } = parsed.data

    const existing = await db.tenant.findUnique({ where: { slug } })
    if (existing) {
      return { ok: false, error: "Slug ja em uso" }
    }

    const designMd = formData.get("designMd") as File | null
    let logoUrl: string | undefined

    const tenant = await db.tenant.create({
      data: {
        name,
        slug,
        brandColor: brandColor || "#4F46E5",
        active: true,
      },
    })

    if (designMd && designMd.size > 0 && designMd.name.endsWith(".md")) {
      try {
        const content = await designMd.text()
        const { url } = await put(
          `mentormatch/design-files/${slug}.md`,
          content,
          { access: "public", contentType: "text/markdown" }
        )
        logoUrl = url
        await db.tenant.update({
          where: { id: tenant.id },
          data: { logoUrl: url },
        })
      } catch (e) {
        console.error("[CREATE_TENANT_BLOB_ERROR]", e)
      }
    }

    revalidatePath("/admin")
    return { ok: true, slug }
  } catch (e) {
    console.error("[CREATE_TENANT_ERROR]", e)
    return { ok: false, error: "Erro ao criar tenant" }
  }
}

export async function setTenantActive(id: string, active: boolean) {
  await requireSuperAdmin()
  await db.tenant.update({ where: { id }, data: { active } })
  revalidatePath("/admin")
}

export async function deleteTenant(id: string) {
  await requireSuperAdmin()
  if (id) {
    await db.tenant.update({ where: { id }, data: { active: false } })
  }
  revalidatePath("/admin")
}
