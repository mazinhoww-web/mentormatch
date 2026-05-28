import { NextResponse } from "next/server"
import { clearTenantCookie } from "@/app/actions/tenant"

export async function POST() {
  await clearTenantCookie()
  return NextResponse.json({ ok: true })
}
