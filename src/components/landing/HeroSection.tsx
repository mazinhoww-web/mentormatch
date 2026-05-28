"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { MatchPreview } from "./MatchPreview"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getDashboardHref } from "@/lib/dashboard-href"

const avatars = ["AM", "JB", "CL", "RS", "FT"]

export function HeroSection() {
  const { user, isAuthenticated } = useCurrentUser()

  const primaryHref = isAuthenticated
    ? user?.role && user?.tenantSlug
      ? getDashboardHref(user.role, user.tenantSlug)
      : "/select-profile"
    : "/register"

  const primaryLabel = isAuthenticated
    ? "Ir para o Dashboard"
    : "Comecar Gratis"

  return (
    <section className="relative z-10 mx-auto grid max-w-[1160px] items-center gap-10 px-6 pb-16 pt-14 md:grid-cols-2 md:gap-16 md:px-10 md:pb-16 md:pt-[88px]">
      <div className="fade-up">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5">
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{
              background: "#10B981",
              boxShadow: "0 0 8px rgba(16,185,129,0.55)",
            }}
          />
          <span className="text-xs font-medium text-emerald-700">
            50+ empresas ativas na plataforma
          </span>
        </div>

        <h1 className="mb-5 text-[42px] font-black leading-[1.08] tracking-[-0.03em] text-slate-900 md:text-[54px]">
          Conecte{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #004ac6, #4f46e5, #2563eb)",
            }}
          >
            mentores
          </span>{" "}
          e{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #004ac6, #4f46e5, #2563eb)",
            }}
          >
            mentorados
          </span>
        </h1>

        <p className="mb-9 max-w-[440px] text-[17px] leading-[1.7] text-slate-600">
          Plataforma white-label de mentoria empresarial. Crie programas
          internos com matching inteligente para sua empresa em minutos.
        </p>

        <div className="mb-10 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_28px_rgba(0,74,198,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_32px_rgba(0,74,198,0.4)]"
            style={{ background: "linear-gradient(135deg, #004ac6, #2563eb)" }}
          >
            {primaryLabel} <ArrowRight size={16} />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-[15px] font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
          >
            Ver Demo
          </Link>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="flex">
            {avatars.map((init, i) => (
              <div
                key={init}
                className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, hsl(${230 + i * 18},65%,52%), hsl(${250 + i * 18},65%,48%))`,
                  marginLeft: i > 0 ? -9 : 0,
                }}
              >
                {init}
              </div>
            ))}
          </div>
          <span className="text-[13px] text-slate-500">
            <span className="font-semibold text-slate-700">2.400+</span>{" "}
            mentorias realizadas
          </span>
        </div>
      </div>

      <div className="fade-up-2 flex flex-col items-center gap-6">
        <div className="relative w-full px-6 pb-8 pt-12">
          <MatchPreview />
          <div
            className="absolute right-3 top-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 backdrop-blur-md"
          >
            <span className="text-[11px] font-semibold text-emerald-700">
              98% satisfacao
            </span>
          </div>
          <div
            className="absolute bottom-3 left-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 backdrop-blur-md"
          >
            <span className="text-[11px] font-semibold text-blue-700">
              Setup em 5 min
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
