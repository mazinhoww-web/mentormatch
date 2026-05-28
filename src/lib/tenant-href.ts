const CANONICAL_HOST = "https://aurimarnogueira.com.br"

export function getTenantLandingUrl(slug: string | null | undefined): string {
  if (!slug) return `${CANONICAL_HOST}/mentormatch`
  return `${CANONICAL_HOST}/${slug}/mentormatch`
}

// In-app path for use with `redirect()` and `<Link>`. Next.js auto-prepends
// basePath; the active tenant is carried via the `mm-tenant` cookie, not the URL.
export function getTenantRoutePath(
  _slug: string | null | undefined,
  path: string
): string {
  return path.startsWith("/") ? path : `/${path}`
}
