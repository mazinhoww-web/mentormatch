"use server"

import { cookies } from "next/headers"

const COOKIE_NAME = "mm-tenant"
const MAX_AGE = 60 * 60 * 24 // 1 day

export async function setTenantCookie(slug: string) {
  const store = await cookies()
  store.set(COOKIE_NAME, slug, {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    httpOnly: false,
  })
}

export async function clearTenantCookie() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}

export async function getTenantCookie(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value ?? null
}
