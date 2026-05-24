import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/api/auth"]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  if (!isAuthenticated && !isPublicPath && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
    const tenantSlug = req.auth?.user?.tenantSlug || "default"
    const role = req.auth?.user?.role?.toLowerCase() || "mentee"
    return NextResponse.redirect(new URL(`/t/${tenantSlug}/${role}`, req.url))
  }

  if (pathname.startsWith("/t/") && pathname.includes("/admin")) {
    if (req.auth?.user?.role !== "ADMIN") {
      const tenantSlug = req.auth?.user?.tenantSlug || "default"
      return NextResponse.redirect(new URL(`/t/${tenantSlug}/mentee`, req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"],
}
