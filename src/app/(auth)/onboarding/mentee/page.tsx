"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2,
  Upload,
  X,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  TrendingUp,
  Code,
  Rocket,
  Check,
} from "lucide-react"

import { menteeProfileSchema, type MenteeProfileInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const steps = [
  { number: 1, label: "Perfil" },
  { number: 2, label: "Objetivos" },
  { number: 3, label: "Habilidades" },
]

const objectives = [
  {
    value: "career",
    icon: TrendingUp,
    label: "Crescimento de Carreira",
    description: "Promocoes, transicao de area ou lideranca.",
  },
  {
    value: "skills",
    icon: Code,
    label: "Habilidades Tecnicas",
    description: "Aprender novas ferramentas ou linguagens.",
  },
  {
    value: "startup",
    icon: Rocket,
    label: "Empreendedorismo",
    description: "Criar ou escalar um negocio proprio.",
    fullWidth: true,
  },
]

const suggestedSkills = [
  "Lideranca",
  "UX/UI Design",
  "Desenvolvimento Web",
  "Gestao de Projetos",
  "Marketing Digital",
  "Ciencia de Dados",
  "Product Management",
]

export default function MenteeOnboardingPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedObjective, setSelectedObjective] = useState("career")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<MenteeProfileInput>({
    resolver: zodResolver(menteeProfileSchema),
    defaultValues: {
      learningSkills: [],
    },
  })

  const learningSkills = watch("learningSkills")

  function toggleSuggestedSkill(skill: string) {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill]
    setSelectedSkills(newSkills)
    setValue("learningSkills", newSkills, { shouldValidate: true })
  }

  function removeSkill(skill: string) {
    const newSkills = selectedSkills.filter((s) => s !== skill)
    setSelectedSkills(newSkills)
    setValue("learningSkills", newSkills, { shouldValidate: true })
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/mentormatch/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erro ao enviar foto")
      }

      const data = await response.json()
      setPhotoUrl(data.url)
    } catch {
      setError("Erro ao enviar foto. Tente novamente.")
    } finally {
      setUploading(false)
    }
  }

  async function handleNext() {
    if (currentStep === 1) {
      const valid = await trigger(["name", "whatsapp"])
      if (valid) setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(3)
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function onSubmit(data: MenteeProfileInput) {
    setError(null)

    try {
      const response = await fetch("/mentormatch/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          role: "MENTEE",
          photoUrl,
        }),
      })

      if (!response.ok) {
        const body = await response.json()
        setError(body.message || "Erro ao salvar perfil. Tente novamente.")
        return
      }

      router.push("/welcome")
    } catch {
      setError("Erro de conexao. Tente novamente.")
    }
  }

  const progressWidth = `${(currentStep / 3) * 100}%`

  return (
    <div className="bg-[#F8FAFC] text-[#131b2e] min-h-screen flex flex-col font-sans">
      {/* TopAppBar */}
      <header className="bg-white border-b border-[#E2E8F0] fixed top-0 w-full z-50 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-2 text-[#004ac6]">
          <GraduationCap className="h-6 w-6" />
          <span className="font-heading text-[28px] leading-[36px] tracking-[-0.01em] font-bold">MentorMatch</span>
        </div>
        <Link href="/select-profile" className="text-[#434655] hover:text-[#004ac6] transition-colors">
          <X className="h-6 w-6" />
        </Link>
      </header>

      <main className="flex-grow pt-24 pb-12 px-4 md:px-10 flex items-center justify-center relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center">
          <div className="w-[800px] h-[800px] bg-[#b4c5ff]/30 rounded-full blur-[100px] absolute top-[-20%] left-[-10%]" />
          <div className="w-[600px] h-[600px] bg-[#d0e1fb]/40 rounded-full blur-[80px] absolute bottom-[-10%] right-[-5%]" />
        </div>

        <div className="bg-white/90 backdrop-blur-[10px] w-full max-w-2xl rounded-xl border border-[#E2E8F0] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] z-10 p-6 md:p-10">
          {/* Header Section */}
          <div className="mb-8 text-center">
            <h1 className="font-heading text-[28px] leading-[34px] font-bold md:text-[36px] md:leading-[44px] md:tracking-[-0.02em] text-[#131b2e] mb-2">
              Junte-se a nos
            </h1>
            <p className="text-[16px] leading-[24px] text-[#434655]">
              Encontre o mentor ideal para impulsionar sua carreira.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-10 relative">
            <div className="flex justify-between mb-2">
              {steps.map((step) => (
                <span
                  key={step.number}
                  className={`text-[12px] leading-[14px] font-medium ${
                    currentStep >= step.number ? "text-[#004ac6]" : "text-[#434655]"
                  }`}
                >
                  {step.label}
                </span>
              ))}
            </div>
            <div className="h-2 bg-[#e2e7ff] rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-[#004ac6] transition-all duration-500 ease-out rounded-full"
                style={{ width: progressWidth }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e] mb-2" htmlFor="name">
                    Nome Completo
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] bg-white focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-colors text-[16px] leading-[24px] text-[#131b2e] placeholder:text-[#737686]"
                    id="name"
                    placeholder="Seu nome completo"
                    type="text"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-[#ba1a1a]">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e] mb-2" htmlFor="email">
                    E-mail Profissional
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] bg-white focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-colors text-[16px] leading-[24px] text-[#131b2e] placeholder:text-[#737686]"
                    id="email"
                    placeholder="exemplo@email.com"
                    type="email"
                    {...register("headline")}
                  />
                </div>

                <div>
                  <label className="block text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e] mb-2" htmlFor="whatsapp">
                    WhatsApp
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 py-3 rounded-l-lg border border-r-0 border-[#E2E8F0] bg-[#f2f3ff] text-[#434655] text-[16px] leading-[24px]">
                      +55
                    </span>
                    <input
                      className="w-full px-4 py-3 rounded-r-lg border border-[#E2E8F0] bg-white focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] outline-none transition-colors text-[16px] leading-[24px] text-[#131b2e] placeholder:text-[#737686]"
                      id="whatsapp"
                      placeholder="(11) 90000-0000"
                      type="tel"
                      {...register("whatsapp")}
                    />
                  </div>
                  <p className="mt-1 text-[14px] leading-[20px] text-[#434655]">
                    Usado para conectar voce ao seu mentor via wa.me
                  </p>
                  {errors.whatsapp && (
                    <p className="mt-1 text-sm text-[#ba1a1a]">{errors.whatsapp.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Objectives */}
            {currentStep === 2 && (
              <div>
                <h2 className="font-heading text-[20px] leading-[28px] font-semibold text-[#131b2e] mb-4">
                  Qual e o seu objetivo principal?
                </h2>
                <p className="text-[14px] leading-[20px] text-[#434655] mb-6">
                  Isso nos ajuda a recomendar os mentores certos para voce.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {objectives.map((obj) => (
                    <label
                      key={obj.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none hover:border-[#004ac6] transition-colors ${
                        obj.fullWidth ? "md:col-span-2" : ""
                      } ${
                        selectedObjective === obj.value
                          ? "border-[#004ac6] bg-[#dbe1ff]/20"
                          : "border-[#E2E8F0] bg-white"
                      }`}
                    >
                      <input
                        className="sr-only"
                        name="objective"
                        type="radio"
                        value={obj.value}
                        checked={selectedObjective === obj.value}
                        onChange={() => setSelectedObjective(obj.value)}
                      />
                      <div className={`flex ${obj.fullWidth ? "items-center gap-4" : "flex-col gap-2"} relative z-10 w-full`}>
                        <obj.icon className="h-7 w-7 text-[#004ac6] flex-shrink-0" />
                        <div>
                          <span className="block text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]">
                            {obj.label}
                          </span>
                          <span className="text-[14px] leading-[20px] text-[#434655]">
                            {obj.description}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Skills */}
            {currentStep === 3 && (
              <div>
                <h2 className="font-heading text-[20px] leading-[28px] font-semibold text-[#131b2e] mb-2">
                  O que voce quer aprender?
                </h2>
                <p className="text-[14px] leading-[20px] text-[#434655] mb-6">
                  Selecione pelo menos 3 areas de interesse para refinar seu match.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {suggestedSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSuggestedSkill(skill)}
                        className={`px-4 py-2 rounded-full border text-[14px] leading-[16px] tracking-[0.05em] font-semibold transition-colors ${
                          isSelected
                            ? "bg-[#004ac6] text-white border-[#004ac6]"
                            : "border-[#E2E8F0] bg-white text-[#434655] hover:border-[#004ac6] hover:text-[#004ac6]"
                        }`}
                      >
                        {skill}
                      </button>
                    )
                  })}
                </div>
                {errors.learningSkills && (
                  <p className="mt-1 text-sm text-[#ba1a1a]">
                    {errors.learningSkills.message}
                  </p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-[#E2E8F0] flex justify-between items-center">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#004ac6] text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:bg-[#f2f3ff] transition-colors h-auto"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Voltar
                </Button>
              ) : (
                <div className="invisible">
                  <Button type="button" variant="ghost" className="h-auto">Voltar</Button>
                </div>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#004ac6] text-white text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:bg-[#0053db] active:scale-95 transition-all shadow-md h-auto"
                >
                  Continuar
                  <ArrowRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#004ac6] text-white text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:bg-[#0053db] active:scale-95 transition-all shadow-md h-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Concluir
                      <Check className="h-5 w-5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
