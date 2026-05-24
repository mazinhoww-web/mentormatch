"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Rocket, Trophy, Check, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

type ProfileRole = "mentee" | "mentor"

const profiles = [
  {
    role: "mentee" as ProfileRole,
    title: "Quero ser Mentorado",
    description: "Encontre mentores experientes para guiar seu desenvolvimento profissional.",
    icon: Rocket,
    iconBg: "bg-[#2563eb]",
    iconColor: "text-white",
    checks: ["Acesso a rede de especialistas", "Sessoes 1:1 focadas"],
    href: "/onboarding/mentee",
  },
  {
    role: "mentor" as ProfileRole,
    title: "Quero ser Mentor",
    description: "Compartilhe sua experiencia e ajude outros profissionais a evoluirem.",
    icon: Trophy,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div className="w-full max-w-md flex flex-col items-center">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb]">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">MentorMatch</span>
      </div>

      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Qual e o seu objetivo?</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Selecione como deseja participar da nossa comunidade para personalizarmos sua experiencia.
        </p>
      </div>

      {/* Profile cards */}
      <div className="mb-6 w-full space-y-4">
        {profiles.map((profile) => {
          const isSelected = selected === profile.role
          return (
            <button
              key={profile.role}
              type="button"
              onClick={() => setSelected(profile.role)}
              className={`w-full rounded-2xl border-2 p-5 text-left transition-all ${
                isSelected
                  ? "border-[#2563eb] bg-blue-50/50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Radio indicator */}
                <div className="mt-0.5 flex-shrink-0">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-[#2563eb] bg-[#2563eb]" : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${profile.iconBg}`}>
                  <profile.icon className={`h-5 w-5 ${profile.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-900">{profile.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{profile.description}</p>
                  <div className="mt-3 space-y-1.5">
                    {profile.checks.map((check) => (
                      <div key={check} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-[#2563eb]" />
                        <span className="text-xs text-gray-600">{check}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Continue button */}
      <Button
        onClick={handleContinue}
        disabled={!selected}
        className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:bg-gray-200 disabled:text-gray-400"
      >
        Continuar
      </Button>

      {/* Bottom link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Ja tem uma conta?{" "}
        <Link href="/login" className="font-medium text-[#2563eb] hover:underline">
          Faca Login
        </Link>
      </p>
    </div>
    </div>
  )
}
