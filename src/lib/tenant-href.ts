const CANONICAL_HOST = "https://aurimarnogueira.com.br"

export function getTenantLandingUrl(slug: string | null | undefined): string {
  if (!slug) return `${CANONICAL_HOST}/mentormatch`
  return `${CANONICAL_HOST}/${slug}/mentormatch`
}

export function getTenantRoutePath(
  slug: string | null | undefined,
  path: string
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`
  if (!slug) return `/mentormatch${normalized}`
  return `/${slug}/mentormatch${normalized}`
}
