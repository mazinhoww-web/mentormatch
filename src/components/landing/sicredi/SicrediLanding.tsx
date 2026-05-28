"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BookOpen,
  Building2,
  Star,
  Users,
} from "lucide-react"
import { SicrediMatchPreview } from "./SicrediMatchPreview"
import { useCounter } from "@/hooks/use-counter"
import { useCurrentUser } from "@/hooks/use-current-user"
import { getDashboardHref } from "@/lib/dashboard-href"

const features = [
  {
    Icon: Users,
    title: "Matching Inteligente",
    desc: "Conecte lideres e talentos por habilidades, objetivos e disponibilidade real.",
  },
  {
    Icon: BookOpen,
    title: "Biblioteca de Materiais",
    desc: "Compartilhe artigos, PDFs e recursos formativos dentro da plataforma Sicredi.",
  },
  {
    Icon: Building2,
    title: "White-Label por Unidade",
    desc: "Cada cooperativa tem seu programa proprio com subdomain e identidade visual.",
  },
]

const steps = [
  {
    n: "01",
    title: "Configure sua unidade",
    desc: "Subdomain, logo e brand em 5 minutos. No padrao visual Sicredi.",
  },
  {
    n: "02",
    title: "Conecte colaboradores",
    desc: "Gestores e analistas entram pelo link da cooperativa. O algoritmo faz o match.",
  },
  {
    n: "03",
    title: "Acompanhe o impacto",
    desc: "Sessoes, progresso e metricas do programa de desenvolvimento em tempo real.",
  },
]

const testimonials = [
  {
    quote:
      "Conectou gestores de Marketing com analistas que queriam crescer em estrategia. Resultado imediato.",
    name: "Coordenadora de RH",
    org: "Sicredi Sul Brasil",
  },
  {
    quote:
      "A visibilidade do progresso das mentorias ajudou nossa equipe de T&D a medir impacto real.",
    name: "Gerente de Pessoas",
    org: "Sicredi Centro-Norte",
  },
  {
    quote:
      "Setup em menos de 10 minutos. Onboarding dos colaboradores foi muito simples.",
    name: "Analista de T&D",
    org: "Sicredi Nordeste",
  },
]

export function SicrediLanding() {
  const [scrolled, setScrolled] = useState(false)
  const [countersOn, setCountersOn] = useState(false)
  const trustRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated } = useCurrentUser()

  const mentorias = useCounter(2400, 1800, countersOn)
  const satisfacao = useCounter(98, 1400, countersOn)
  const cooperativas = useCounter(50, 1600, countersOn)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    fn()
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    if (!trustRef.current) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setCountersOn(true)
      },
      { threshold: 0.4 }
    )
    io.observe(trustRef.current)
    return () => io.disconnect()
  }, [])

  const ctaHref = isAuthenticated
    ? getDashboardHref(user?.role, user?.tenantSlug)
    : "/register"

  const ctaLabel = isAuthenticated
    ? "Ir para a plataforma"
    : "Acessar plataforma"

  return (
    <div
      className="min-h-screen text-[#323C32]"
      style={{ background: "#FFFFFF", fontFamily: "Nunito, sans-serif" }}
    >
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 flex h-20 items-center justify-between px-6 transition-all duration-200 md:px-10"
        style={{
          background: "#FFFFFF",
          borderBottom: `1px solid ${scrolled ? "#CDD3CD" : "transparent"}`,
          boxShadow: scrolled ? "0 2px 4px 0 #CDD3CD" : "none",
        }}
      >
        <Link href="/sicredi" className="flex items-center gap-3.5">
          <Image
            src="/mentormatch/sicredi-logo.png"
            alt="Sicredi"
            width={180}
            height={56}
            priority
            className="h-12 w-auto object-contain md:h-14"
          />
          <div
            className="h-9 w-px md:h-10"
            style={{ background: "#CDD3CD" }}
            aria-hidden="true"
          />
          <span
            className="text-[22px] font-light tracking-tight text-[#323C32] md:text-[24px]"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            MentorMatch
          </span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {[
            { label: "Como funciona", href: "#how-it-works" },
            { label: "Recursos", href: "#features" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-lg px-3.5 py-2 font-nunito text-[14px] font-bold text-[#33820D] transition-colors hover:bg-[#FAFAFA] hover:text-[#26610A]"
            >
              {l.label}
            </a>
          ))}
          <Link
            href={ctaHref}
            className="ml-2 inline-flex h-10 items-center gap-2 rounded-lg px-5 font-nunito text-[14px] font-bold text-white transition-colors hover:bg-[#26610A]"
            style={{ background: "#33820D" }}
          >
            {ctaLabel}
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1160px] items-center gap-10 px-6 pb-16 pt-12 md:grid-cols-2 md:gap-16 md:px-10 md:pb-16 md:pt-[72px]">
        <div>
          <div
            className="mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1"
            style={{
              background: "#D7E6C8",
              border: "1px solid rgba(51,130,13,0.13)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#33820D" }}
            />
            <span className="font-nunito text-[12px] font-bold text-[#0A4B1E]">
              Programa de Mentoria Sicredi
            </span>
          </div>
          <h1
            className="mb-5 text-[36px] font-light leading-[1.15] tracking-tight text-[#323C32] md:text-[44px] md:leading-[52px]"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            Conecte{" "}
            <span className="font-semibold text-[#33820D]">lideres</span> e{" "}
            <span className="font-semibold text-[#33820D]">talentos</span>{" "}
            dentro da sua cooperativa
          </h1>
          <p className="mb-8 max-w-[440px] font-nunito text-base leading-6 text-[#5A645A]">
            Plataforma white-label de mentoria para cooperativas Sicredi.
            Conecte gestores experientes a analistas em desenvolvimento com
            matching inteligente.
          </p>
          <div className="mb-9 flex flex-wrap gap-3">
            <Link
              href={ctaHref}
              className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-nunito text-base font-bold text-white transition-colors hover:bg-[#26610A]"
              style={{ background: "#33820D" }}
            >
              Comecar agora <ArrowRight size={16} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center gap-2 rounded-lg border px-6 font-nunito text-base font-bold text-[#33820D] transition-all hover:bg-[#26610A] hover:text-white"
              style={{ background: "#FFFFFF", borderColor: "#33820D" }}
            >
              Ver demonstracao
            </a>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex">
              {["AC", "PL", "RM", "JS", "FO"].map((init, i) => (
                <div
                  key={init}
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white font-nunito text-[10px] font-bold text-white"
                  style={{
                    background: i % 2 === 0 ? "#33820D" : "#26610A",
                    marginLeft: i > 0 ? -9 : 0,
                  }}
                >
                  {init}
                </div>
              ))}
            </div>
            <span className="font-nunito text-[13px] text-[#5A645A]">
              <strong className="text-[#323C32]">2.400+</strong> mentorias
              realizadas
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            className="relative w-full rounded-xl px-7 pb-9 pt-10"
            style={{ background: "#FAFAFA", border: "1px solid #CDD3CD" }}
          >
            <div className="mb-8 text-center">
              <span className="font-nunito text-[11px] font-bold uppercase tracking-[0.08em] text-[#5A645A]">
                Matching em tempo real
              </span>
            </div>
            <SicrediMatchPreview />
            <div
              className="mt-11 flex justify-around border-t pt-5"
              style={{ borderColor: "#CDD3CD" }}
            >
              {[
                { val: "98%", lbl: "Satisfacao" },
                { val: "5 min", lbl: "Setup" },
                { val: "4.9*", lbl: "Avaliacao" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="text-center">
                  <div
                    className="text-[18px] font-semibold text-[#33820D]"
                    style={{ fontFamily: "'Exo 2', sans-serif" }}
                  >
                    {val}
                  </div>
                  <div className="mt-0.5 font-nunito text-[11px] text-[#5A645A]">
                    {lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <div
        ref={trustRef}
        className="px-6 py-9 md:px-10"
        style={{ background: "#0A4B1E" }}
      >
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-around gap-7">
          {[
            { val: mentorias, suf: "+", lbl: "Mentorias realizadas" },
            { val: satisfacao, suf: "%", lbl: "Satisfacao dos usuarios" },
            { val: cooperativas, suf: "+", lbl: "Cooperativas ativas" },
          ].map(({ val, suf, lbl }) => (
            <div key={lbl} className="text-center">
              <div
                className="text-[40px] font-light leading-none text-white"
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                {val}
                <span className="font-semibold">{suf}</span>
              </div>
              <div className="mt-1.5 font-nunito text-[13px] text-white/65">
                {lbl}
              </div>
            </div>
          ))}
          <div className="text-center">
            <div className="mb-1.5 font-nunito text-[12px] text-white/55">
              Avaliacao media
            </div>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} fill="#FFFFFF" color="#FFFFFF" />
              ))}
            </div>
            <div className="mt-1 font-nunito text-[14px] font-bold text-white">
              4.9 / 5.0
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section
        id="how-it-works"
        className="px-6 py-16 md:px-10 md:py-[72px]"
        style={{ background: "#FAFAFA" }}
      >
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-13 text-center">
            <div className="mb-3 font-nunito text-[11px] font-bold uppercase tracking-[0.1em] text-[#33820D]">
              Como funciona
            </div>
            <h2
              className="text-[26px] font-light leading-[1.25] text-[#323C32] md:text-[32px] md:leading-[40px]"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              Pronto em{" "}
              <span className="font-semibold text-[#33820D]">3 passos</span>
            </h2>
            <p className="mt-2.5 font-nunito text-base text-[#5A645A]">
              Do cadastro ao primeiro match em minutos
            </p>
          </div>
          <div className="mt-13 grid gap-6 md:grid-cols-3">
            {steps.map(({ n, title, desc }) => (
              <div
                key={n}
                className="relative overflow-hidden rounded p-7 transition-all hover:shadow-[0_4px_16px_rgba(51,130,13,0.12)]"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #CDD3CD",
                  boxShadow: "0 2px 4px 0 #CDD3CD",
                }}
              >
                <div
                  className="pointer-events-none absolute right-5 top-4 select-none text-[52px] font-light leading-none"
                  style={{
                    fontFamily: "'Exo 2', sans-serif",
                    color: "rgba(51,130,13,0.06)",
                  }}
                >
                  {n}
                </div>
                <div
                  className="mb-4 flex h-9 w-9 items-center justify-center rounded-full font-semibold text-white"
                  style={{
                    background: "#33820D",
                    fontFamily: "'Exo 2', sans-serif",
                  }}
                >
                  {parseInt(n)}
                </div>
                <h4
                  className="mb-2.5 text-[20px] font-light leading-7 text-[#323C32]"
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                >
                  {title}
                </h4>
                <p className="font-nunito text-[14px] leading-5 text-[#5A645A]">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="px-6 py-16 md:px-10 md:py-[72px]"
        style={{ background: "#FFFFFF" }}
      >
        <div className="mx-auto max-w-[1160px]">
          <div className="mb-13 text-center">
            <div className="mb-3 font-nunito text-[11px] font-bold uppercase tracking-[0.1em] text-[#33820D]">
              Recursos
            </div>
            <h2
              className="text-[26px] font-light leading-[1.25] text-[#323C32] md:text-[32px] md:leading-[40px]"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              Tudo que seu programa precisa
            </h2>
          </div>
          <div className="mt-13 grid gap-6 md:grid-cols-3">
            {features.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="rounded p-7 transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(51,130,13,0.12)]"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #CDD3CD",
                  boxShadow: "0 2px 4px 0 #CDD3CD",
                }}
              >
                <div className="mb-4 flex items-start gap-4">
                  <div
                    className="w-1 flex-shrink-0 self-stretch rounded-sm"
                    style={{ background: "#33820D" }}
                  />
                  <div
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded"
                    style={{ background: "#D7E6C8" }}
                  >
                    <Icon size={22} color="#33820D" />
                  </div>
                </div>
                <h4
                  className="mb-2.5 text-[20px] font-light leading-7 text-[#323C32]"
                  style={{ fontFamily: "'Exo 2', sans-serif" }}
                >
                  {title}
                </h4>
                <p className="font-nunito text-[14px] leading-5 text-[#5A645A]">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="px-6 py-10 md:px-10"
        style={{
          background: "#FAFAFA",
          borderTop: "1px solid #CDD3CD",
          borderBottom: "1px solid #CDD3CD",
        }}
      >
        <div className="mx-auto grid max-w-[1160px] gap-6 md:grid-cols-3">
          {testimonials.map(({ quote, name, org }) => (
            <div
              key={name}
              className="relative overflow-hidden rounded px-[22px] pt-7 pb-5"
              style={{
                background: "#FFFFFF",
                border: "1px solid #CDD3CD",
                boxShadow: "0 2px 4px 0 #CDD3CD",
              }}
            >
              <div
                className="absolute left-0 right-0 top-0 h-1"
                style={{ background: "#33820D" }}
              />
              <p className="mb-3.5 font-nunito text-[14px] italic leading-5 text-[#323C32]">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="mb-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={12} fill="#33820D" color="#33820D" />
                ))}
              </div>
              <div className="font-nunito text-[13px] font-bold text-[#323C32]">
                {name}
              </div>
              <div className="font-nunito text-[12px] font-semibold text-[#33820D]">
                {org}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-16 md:px-10 md:py-[72px]"
        style={{ background: "#0A4B1E" }}
      >
        <div className="mx-auto max-w-[640px] text-center">
          <h2
            className="mb-4 text-[26px] font-light leading-[1.25] text-white md:text-[32px] md:leading-[40px]"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            Pronto para transformar sua{" "}
            <span className="font-semibold">cooperativa</span>?
          </h2>
          <p className="mb-9 font-nunito text-base leading-6 text-white/70">
            Configure seu programa de mentoria em minutos e desenvolva talentos
            dentro da Sicredi.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={ctaHref}
              className="inline-flex h-12 items-center gap-2 rounded-lg px-6 font-nunito text-base font-bold text-white transition-colors hover:bg-[#26610A]"
              style={{ background: "#33820D" }}
            >
              Criar programa gratuitamente <ArrowRight size={16} />
            </Link>
            <Link
              href="/contato"
              className="inline-flex h-12 items-center gap-2 rounded-lg border px-6 font-nunito text-base font-bold text-white transition-all hover:bg-[#33820D]"
              style={{ background: "transparent", borderColor: "#FFFFFF" }}
            >
              Falar com especialista
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-7 md:px-10"
        style={{ background: "#FFFFFF", borderTop: "1px solid #CDD3CD" }}
      >
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/mentormatch/sicredi-logo.png"
              alt="Sicredi"
              width={140}
              height={42}
              className="h-10 w-auto object-contain"
            />
            <div
              className="h-7 w-px"
              style={{ background: "#CDD3CD" }}
              aria-hidden="true"
            />
            <span
              className="text-[17px] font-light text-[#323C32]"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              MentorMatch
            </span>
          </div>
          <div className="flex gap-6">
            {["Privacidade", "Termos", "Suporte"].map((l) => (
              <a
                key={l}
                href="#"
                className="font-nunito text-[13px] font-bold text-[#33820D] no-underline"
              >
                {l}
              </a>
            ))}
          </div>
          <span className="font-nunito text-[12px] text-[#828A82]">
            &copy; 2026 MentorMatch &middot;
            aurimarnogueira.com.br/sicredi/mentormatch
          </span>
        </div>
      </footer>
    </div>
  )
}
