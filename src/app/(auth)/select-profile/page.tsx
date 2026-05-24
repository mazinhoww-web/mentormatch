"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Rocket, Award, CheckCircle, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

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

export default function SelectProfilePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<ProfileRole | null>(null)

  function handleContinue() {
    if (!selected) return
    const profile = profiles.find((p) => p.role === selected)
    if (profile) {
      router.push(profile.href)
    }
  }

  return (
    <div className="bg-[#F8FAFC] text-[#131b2e] antialiased min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[800px] flex flex-col items-center">
          {/* Header Section */}
          <header className="text-center mb-10 w-full">
            <div className="mb-8 inline-flex items-center justify-center">
              <GraduationCap className="h-9 w-9 text-[#004ac6] mr-2" />
              <h1 className="font-heading text-[28px] leading-[34px] font-bold md:text-[36px] md:leading-[44px] md:tracking-[-0.02em] text-[#004ac6]">
                MentorMatch
              </h1>
            </div>
            <h2 className="font-heading text-[28px] leading-[36px] tracking-[-0.01em] font-semibold text-[#131b2e] mb-2">
              Qual e o seu objetivo?
            </h2>
            <p className="text-[18px] leading-[28px] text-[#434655] max-w-lg mx-auto">
              Selecione como voce deseja participar da nossa comunidade para personalizarmos sua experiencia.
            </p>
          </header>

          {/* Role Selection */}
          <div className="w-full flex flex-col gap-8">
            {/* Options Grid */}
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
                      className={`h-full flex flex-col p-6 rounded-xl border transition-all duration-200 hover:border-[#c3c6d7] ${
                        isSelected
                          ? "border-[#004ac6] bg-[#f2f3ff] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]"
                          : "border-[#E2E8F0] bg-white hover:bg-white/80"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#004ac6]">
                          <profile.icon className="h-7 w-7" />
                        </div>
                        {/* Radio indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors relative mt-1 ${
                            isSelected ? "border-[#004ac6]" : "border-[#c3c6d7]"
                          }`}
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full bg-[#004ac6] transition-all absolute ${
                              isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                            }`}
                          />
                        </div>
                      </div>
                      <h3 className="font-heading text-[20px] leading-[28px] font-semibold text-[#131b2e] mb-2">
                        {profile.title}
                      </h3>
                      <p className="text-[16px] leading-[24px] text-[#434655] flex-grow">
                        {profile.description}
                      </p>
                      <ul className="mt-4 space-y-2">
                        {profile.checks.map((check) => (
                          <li key={check} className="flex items-center text-[#434655] text-[14px] leading-[20px]">
                            <CheckCircle className="h-[18px] w-[18px] text-[#10B981] mr-2 flex-shrink-0" />
                            {check}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Action Button */}
            <div className="w-full flex flex-col items-center mt-4">
              <Button
                onClick={handleContinue}
                disabled={!selected}
                className="w-full md:w-auto min-w-[200px] bg-[#004ac6] text-white py-3 px-8 rounded-lg text-[14px] leading-[16px] tracking-[0.05em] font-semibold transition-all hover:bg-[#0053db] focus:ring-2 focus:ring-[#004ac6] focus:ring-offset-2 focus:outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed h-auto"
              >
                Continuar
              </Button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-[16px] leading-[24px] text-[#434655]">
              Ja tem uma conta?{" "}
              <Link
                href="/login"
                className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#004ac6] hover:text-[#0053db] transition-colors ml-1"
              >
                Faca Login
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
