import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// Authorize a tenant admin for the given slug. ADMIN may only manage their own
// tenant; SUPER_ADMIN may manage any tenant.
async function requireTenantAdmin(slug: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Nao autorizado", status: 401 as const }
  }
  const role = session.user.role
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return { error: "Acesso negado", status: 403 as const }
  }
  if (role === "ADMIN" && session.user.tenantSlug !== slug) {
    return { error: "Acesso negado", status: 403 as const }
  }
  return { session }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get("slug")
  if (!slug) {
    return NextResponse.json({ error: "slug obrigatorio" }, { status: 400 })
  }

  const guard = await requireTenantAdmin(slug)
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const tenant = await db.tenant.findUnique({
    where: { slug },
    include: { subscription: { include: { plan: true } } },
  })
  if (!tenant) {
    return NextResponse.json({ error: "Tenant nao encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logo: tenant.logoUrl,
    brandColor: tenant.brandColor,
    // No tenant-level column for this yet; expose a sane default so the form works.
    maxMenteesPerMentor: 4,
    subscription: tenant.subscription
      ? {
          plan: {
            name: tenant.subscription.plan?.name ?? "Free",
            maxUsers: tenant.subscription.plan?.maxUsers ?? 0,
            maxMentors: 0,
          },
        }
      : null,
  })
}

const patchSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(2).max(80),
  brandColor: z.string().optional(),
  logo: z.string().nullable().optional(),
  maxMenteesPerMentor: z.number().int().min(1).max(50).optional(),
})

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos", details: parsed.error.issues },
      { status: 400 }
    )
  }
  const { slug, name, brandColor, logo, maxMenteesPerMentor } = parsed.data

  const guard = await requireTenantAdmin(slug)
  if ("error" in guard) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  const updated = await db.tenant.update({
    where: { slug },
    data: {
      name,
      ...(brandColor ? { brandColor } : {}),
      logoUrl: logo ?? null,
      // maxMenteesPerMentor has no tenant-level column; not persisted here.
    },
    select: { id: true, name: true, slug: true, brandColor: true, logoUrl: true },
  })

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    slug: updated.slug,
    brandColor: updated.brandColor,
    logo: updated.logoUrl,
    maxMenteesPerMentor: maxMenteesPerMentor ?? 4,
  })
}
