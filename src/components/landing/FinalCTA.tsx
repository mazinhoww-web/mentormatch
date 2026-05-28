"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getDashboardHref } from "@/lib/dashboard-href"

export function FinalCTA() {
  const { user, isAuthenticated } = useCurrentUser()

  const primaryHref = isAuthenticated
    ? user?.role && user?.tenantSlug
      ? getDashboardHref(user.role, user.tenantSlug)
      : "/select-profile"
    : "/register"

  const primaryLabel = isAuthenticated
    ? "Ir para o Dashboard"
    : "Criar Programa Gratis"

  return (
    <section className="relative z-10 mx-auto max-w-[1160px] px-6 pb-16 md:px-10 md:pb-[88px]">
      <div
        className="relative overflow-hidden rounded-3xl border border-blue-200 p-10 text-center md:p-14"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,74,198,0.06), rgba(37,99,235,0.10))",
        }}
      >
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0,74,198,0.08), transparent)",
          }}
        />
        <div className="relative z-10">
          <h2 className="mb-3.5 text-[28px] font-extrabold tracking-[-0.025em] text-slate-900 md:text-[36px]">
            Pronto para transformar sua empresa?
          </h2>
          <p className="mx-auto mb-8 max-w-[460px] text-base text-slate-600">
            Configure seu programa de mentoria em minutos e comece a conectar
            talentos hoje.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_32px_rgba(0,74,198,0.28)] transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #004ac6, #2563eb)",
              }}
            >
              {primaryLabel} <ArrowRight size={16} />
            </Link>
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-[15px] font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
            >
              Falar com especialista
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
