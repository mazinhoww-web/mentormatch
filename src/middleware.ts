import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/invitations",
  "/api/users",
  "/sicredi",
  "/onboarding",
  "/select-profile",
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js"
  ) {
    return NextResponse.next()
  }

  if (pathname === "/") {
    const res = NextResponse.next()
    res.cookies.delete("mm-tenant")
    return res
  }

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  if (isPublicPath) {
    const res = NextResponse.next()
    if (pathname.startsWith("/sicredi")) {
      res.cookies.set("mm-tenant", "sicredi", {
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        httpOnly: false,
      })
    }
    return res
  }

  const sessionToken =
    req.cookies.get("mm.session-token")?.value ||
    req.cookies.get("__Secure-mm.session-token")?.value

  if (!sessionToken) {
    const loginUrl = new URL("/mentormatch/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"],
}
