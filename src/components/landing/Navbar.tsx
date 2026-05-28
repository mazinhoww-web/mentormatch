"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getDashboardHref } from "@/lib/dashboard-href"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user, isAuthenticated } = useCurrentUser()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const ctaHref = isAuthenticated
    ? user?.role && user?.tenantSlug
      ? getDashboardHref(user.role, user.tenantSlug)
      : "/select-profile"
    : "/register"

  const ctaLabel = isAuthenticated ? "Ir para o Dashboard" : "Comecar Gratis"

  return (
    <nav
      className={`sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6 backdrop-blur-2xl transition-colors duration-300 md:px-10 ${
        scrolled
          ? "border-slate-200 bg-white/95"
          : "border-transparent bg-white/80"
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: "linear-gradient(135deg, #004ac6, #2563eb)",
            boxShadow: "0 4px 12px rgba(0,74,198,0.20)",
          }}
        >
          <BookOpen size={15} color="#fff" />
        </div>
        <span className="text-[18px] font-extrabold tracking-tight text-slate-900">
          MentorMatch
        </span>
        <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9px] font-bold tracking-[0.06em] text-blue-700 sm:inline">
          WHITE-LABEL
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {!isAuthenticated && (
          <Link
            href="/login"
            className="hidden text-[13px] font-medium text-slate-600 transition-colors hover:text-slate-900 md:inline-block"
          >
            Entrar
          </Link>
        )}
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-xl border-0 px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(0,74,198,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,74,198,0.32)]"
          style={{ background: "linear-gradient(135deg, #004ac6, #2563eb)" }}
        >
          {ctaLabel} <ArrowRight size={13} />
        </Link>
      </div>
    </nav>
  )
}
