import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
  "/api/invitations",
  "/sicredi",
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js"
  ) {
    return NextResponse.next()
  }

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))
  if (isPublicPath) {
    return NextResponse.next()
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
