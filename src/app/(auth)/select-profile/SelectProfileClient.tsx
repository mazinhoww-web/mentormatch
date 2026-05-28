"use client"

import { useState } from "react"
import Image from "next/image"
import { Rocket, Award, CheckCircle, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTenant } from "@/components/providers/TenantContext"
import { useTenantRouter } from "@/hooks/use-tenant-router"

type ProfileRole = "mentee" | "mentor"

const profiles = [
  {
    role: "mentee" as ProfileRole,
    title: "Quero ser Mentorado",
    description:
      "Busco orientacao de especialistas para acelerar minha carreira, desenvolver novas habilidades e superar desafios profissionais.",
    icon: Rocket,
    checks: ["Acesso a rede de especialistas", "Sessoes 1:1 focadas"],
    href: "/onboarding/mentee",
  },
  {
    role: "mentor" as ProfileRole,
    title: "Quero ser Mentor",
    description:
      "Desejo compartilhar minha experiencia, guiar novos talentos e contribuir para o desenvolvimento da comunidade.",
    icon: Award,
    checks: ["Impacte carreiras ativamente", "Expanda seu networking"],
    href: "/onboarding/mentor",
  },
]

export default function SelectProfileClient() {
  const tenant = useTenant()
  const { pushTenant } = useTenantRouter()
  const [selected, setSelected] = useState<ProfileRole | null>(null)

  const isSicredi = tenant.slug === "sicredi"
  const accent = isSicredi ? "#33820D" : "#004ac6"
  const accentSoft = isSicredi ? "#e8f3e1" : "#eaedff"
  const accentTint = isSicredi ? "#f2f9ec" : "#f2f3ff"
  const accentDeep = isSicredi ? "#296A0A" : "#0053db"
  const fontFamily = isSicredi
    ? '"Nunito", sans-serif'
    : 'var(--font-inter), sans-serif'
  const headingFamily = isSicredi
    ? '"Exo 2", sans-serif'
    : 'var(--font-hanken-grotesk), sans-serif'
  const brandName = tenant.name || "MentorMatch"
  const brandLogo = tenant.logoUrl

  function handleContinue() {
    if (!selected) return
    const profile = profiles.find((p) => p.role === selected)
    if (profile) {
      pushTenant(profile.href)
    }
  }

  return (
    <div
      className="text-[#131b2e] antialiased min-h-screen flex flex-col"
      style={{ background: "#F8FAFC", fontFamily }}
    >
      <main className="flex-grow flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[800px] flex flex-col items-center">
          <header className="text-center mb-10 w-full">
            <div className="mb-8 inline-flex items-center justify-center gap-2">
              {brandLogo ? (
                <Image
                  src={brandLogo}
                  alt={brandName}
                  width={160}
                  height={48}
                  className="h-12 w-auto object-contain"
                  unoptimized
                  priority
                />
              ) : (
                <>
                  <GraduationCap className="h-9 w-9" style={{ color: accent }} />
                  <h1
                    className="text-[28px] leading-[34px] font-bold md:text-[36px] md:leading-[44px] md:tracking-[-0.02em]"
                    style={{ color: accent, fontFamily: headingFamily }}
                  >
                    {brandName}
                  </h1>
                </>
              )}
            </div>
            <h2
              className="text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#131b2e] mb-2"
              style={{ fontFamily: headingFamily }}
            >
              Qual e o seu objetivo?
            </h2>
            <p className="text-[18px] leading-[28px] text-[#434655] max-w-lg mx-auto">
              Selecione como voce deseja participar da nossa comunidade para personalizarmos sua experiencia.
            </p>
          </header>

          <div className="w-full flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((profile) => {
                const isSelected = selected === profile.role
                return (
                  <label key={profile.role} className="relative cursor-pointer group">
                    <input
                      className="peer sr-only"
                      name="role"
                      type="radio"
                      value={profile.role}
                      checked={isSelected}
                      onChange={() => setSelected(profile.role)}
                    />
                    <div
                      className="h-full flex flex-col p-6 rounded-xl border transition-all duration-200 hover:border-[#c3c6d7]"
                      style={{
                        borderColor: isSelected ? accent : "#E2E8F0",
                        background: isSelected ? accentTint : "#fff",
                        boxShadow: isSelected
                          ? "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)"
                          : "none",
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ background: accentSoft, color: accent }}
                        >
                          <profile.icon className="h-7 w-7" />
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors relative mt-1"
                          style={{
                            borderColor: isSelected ? accent : "#c3c6d7",
                          }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full transition-all absolute"
                            style={{
                              background: accent,
                              opacity: isSelected ? 1 : 0,
                              transform: isSelected ? "scale(1)" : "scale(0.5)",
                            }}
                          />
                        </div>
                      </div>
                      <h3
                        className="text-[20px] leading-[28px] font-semibold text-[#131b2e] mb-2"
                        style={{ fontFamily: headingFamily }}
                      >
                        {profile.title}
                      </h3>
                      <p className="text-[16px] leading-[24px] text-[#434655] flex-grow">
                        {profile.description}
                      </p>
                      <ul className="mt-4 space-y-2">
                        {profile.checks.map((check) => (
                          <li key={check} className="flex items-center text-[#434655] text-[14px] leading-[20px]">
                            <CheckCircle
                              className="h-[18px] w-[18px] mr-2 flex-shrink-0"
                              style={{ color: isSicredi ? accent : "#10B981" }}
                            />
                            {check}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="w-full flex flex-col items-center mt-4">
              <Button
                onClick={handleContinue}
                disabled={!selected}
                className="w-full md:w-auto min-w-[200px] text-white py-3 px-8 rounded-lg text-[14px] leading-[16px] tracking-[0.05em] font-semibold transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                style={{ background: accent }}
                onMouseEnter={(e) => {
                  if (!selected) return
                  e.currentTarget.style.background = accentDeep
                }}
                onMouseLeave={(e) => (e.currentTarget.style.background = accent)}
              >
                Continuar
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-[14px] text-[#434655]">
            Voce podera alterar seu perfil depois nas configuracoes.
          </p>
        </div>
      </main>
    </div>
  )
}
