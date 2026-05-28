"use client"

import { useState } from "react"
import { Rocket, Award, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTenantRouter } from "@/hooks/use-tenant-router"
import { TenantBrandMark } from "@/components/brand/TenantBrandMark"

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
  const { pushTenant } = useTenantRouter()
  const [selected, setSelected] = useState<ProfileRole | null>(null)

  function handleContinue() {
    if (!selected) return
    const profile = profiles.find((p) => p.role === selected)
    if (profile) {
      pushTenant(profile.href)
    }
  }

  return (
    <div
      className="antialiased min-h-screen flex flex-col"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body, var(--font-sans))",
      }}
    >
      <main className="flex-grow flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[800px] flex flex-col items-center">
          <header className="text-center mb-10 w-full">
            <div className="mb-8 flex justify-center">
              <TenantBrandMark size="lg" />
            </div>
            <h2
              className="text-[28px] leading-[36px] tracking-[-0.01em] mb-2"
              style={{
                fontFamily: "var(--font-display, var(--font-heading))",
                fontWeight: 300,
              }}
            >
              Qual e o seu objetivo?
            </h2>
            <p
              className="text-[18px] leading-[28px] max-w-lg mx-auto"
              style={{ color: "var(--muted-foreground)" }}
            >
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
                      className="h-full flex flex-col p-6 rounded-xl border transition-all duration-200"
                      style={{
                        borderColor: isSelected ? "var(--primary)" : "var(--border)",
                        background: isSelected
                          ? "color-mix(in srgb, var(--primary) 8%, transparent)"
                          : "var(--card)",
                        boxShadow: isSelected
                          ? "var(--shadow-card, 0 4px 6px -1px rgba(0,0,0,0.05))"
                          : "none",
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{
                            background:
                              "color-mix(in srgb, var(--primary) 12%, transparent)",
                            color: "var(--primary)",
                          }}
                        >
                          <profile.icon className="h-7 w-7" />
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors relative mt-1"
                          style={{
                            borderColor: isSelected ? "var(--primary)" : "var(--border)",
                          }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full transition-all absolute"
                            style={{
                              background: "var(--primary)",
                              opacity: isSelected ? 1 : 0,
                              transform: isSelected ? "scale(1)" : "scale(0.5)",
                            }}
                          />
                        </div>
                      </div>
                      <h3
                        className="text-[20px] leading-[28px] font-semibold mb-2"
                        style={{
                          color: "var(--foreground)",
                          fontFamily: "var(--font-display, var(--font-heading))",
                          fontWeight: 600,
                        }}
                      >
                        {profile.title}
                      </h3>
                      <p
                        className="text-[16px] leading-[24px] flex-grow"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {profile.description}
                      </p>
                      <ul className="mt-4 space-y-2">
                        {profile.checks.map((check) => (
                          <li
                            key={check}
                            className="flex items-center text-[14px] leading-[20px]"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            <CheckCircle
                              className="h-[18px] w-[18px] mr-2 flex-shrink-0"
                              style={{ color: "var(--primary)" }}
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
                className="w-full md:w-auto min-w-[200px] py-3 px-8 text-[14px] leading-[16px] tracking-[0.05em] font-semibold transition-all focus:ring-2 focus:ring-offset-2 focus:outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed h-auto"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderRadius: "var(--radius-btn, 0.5rem)",
                }}
              >
                Continuar
              </Button>
            </div>
          </div>

          <p
            className="mt-8 text-center text-[14px]"
            style={{ color: "var(--muted-foreground)" }}
          >
            Voce podera alterar seu perfil depois nas configuracoes.
          </p>
        </div>
      </main>
    </div>
  )
}
