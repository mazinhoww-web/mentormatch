"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Loader2,
  Upload,
  X,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
} from "lucide-react"

import { mentorProfileSchema, type MentorProfileInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTenantRouter } from "@/hooks/use-tenant-router"

const steps = [
  { number: 1, label: "Basico" },
  { number: 2, label: "Profissional" },
  { number: 3, label: "Habilidades" },
]

export default function MentorOnboardingClient() {
  const { update } = useSession()
  const { user, isLoading: sessionLoading } = useCurrentUser()
  const { pushTenant, hrefTenant } = useTenantRouter()
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [skillInput, setSkillInput] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<MentorProfileInput>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      teachingSkills: [],
    },
  })

  useEffect(() => {
    if (user) {
      if (user.name) setValue("name", user.name)
    }
  }, [user, setValue])

  const teachingSkills = watch("teachingSkills")

  function addSkill() {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    if (teachingSkills.includes(trimmed)) {
      setSkillInput("")
      return
    }
    setValue("teachingSkills", [...teachingSkills, trimmed], {
      shouldValidate: true,
    })
    setSkillInput("")
  }

  function removeSkill(skill: string) {
    setValue(
      "teachingSkills",
      teachingSkills.filter((s) => s !== skill),
      { shouldValidate: true }
    )
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addSkill()
    }
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
      const valid = await trigger(["headline", "bio"])
      if (valid) setCurrentStep(3)
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  async function handleFinalize() {
    setError(null)
    const valid = await trigger()
    if (!valid) {
      if (errors.name || errors.whatsapp || errors.linkedin) {
        setCurrentStep(1)
        setError("Verifique os campos do passo 1.")
      } else if (errors.headline || errors.bio) {
        setCurrentStep(2)
        setError("Verifique os campos do passo 2.")
      } else if (errors.teachingSkills) {
        setError("Adicione pelo menos 1 habilidade.")
      }
      return
    }
    const data = watch() as MentorProfileInput
    await submitProfile(data)
  }

  async function submitProfile(data: MentorProfileInput) {
    setError(null)

    try {
      const response = await fetch("/mentormatch/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          headline: data.headline,
          bio: data.bio,
          education: data.education,
          experience: data.experience,
          linkedin: data.linkedin,
          whatsapp: data.whatsapp,
          skills: data.teachingSkills,
          role: "MENTOR",
          image: photoUrl,
        }),
      })

      if (!response.ok) {
        const body = await response.json()
        setError(body.error || body.message || "Erro ao salvar perfil. Tente novamente.")
        return
      }

      await update()
      pushTenant("/welcome")
    } catch {
      setError("Erro de conexao. Tente novamente.")
    }
  }

  const progressWidth = `${(currentStep / 3) * 100}%`

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-6 w-6 animate-spin text-[#004ac6]" />
      </div>
    )
  }

  return (
    <div className="bg-[#F8FAFC] text-[#131b2e] min-h-screen flex flex-col font-sans">
      <header className="fixed top-0 w-full z-50 bg-white border-b border-[#E2E8F0]">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-[1280px] mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href={hrefTenant("/select-profile")}
              className="p-2 hover:bg-[#f2f3ff] transition-colors rounded-full active:scale-95 duration-150 text-[#434655]"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="font-heading text-[28px] leading-[36px] tracking-[-0.01em] font-bold text-[#004ac6]">
              MentorMatch
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center pt-24 pb-8 px-4 md:px-10 w-full max-w-[1280px] mx-auto">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 md:p-10">
          <div className="mb-8">
            <h2 className="font-heading text-[28px] leading-[34px] font-bold md:text-[36px] md:leading-[44px] md:tracking-[-0.02em] text-[#131b2e] mb-2">
              Torne-se um Mentor
            </h2>
            <p className="text-[16px] leading-[24px] text-[#434655] mb-6">
              Compartilhe seu conhecimento e ajude outros profissionais a crescerem.
            </p>

            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#e2e7ff] rounded-full -z-10" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#004ac6] rounded-full -z-10 transition-all duration-300"
                style={{ width: progressWidth }}
              />
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] leading-[16px] tracking-[0.05em] font-semibold mb-2 shadow-sm ${
                      currentStep >= step.number
                        ? "bg-[#004ac6] text-white"
                        : "bg-[#dae2fd] text-[#434655]"
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-[12px] leading-[14px] font-medium ${
                      currentStep >= step.number ? "text-[#004ac6]" : "text-[#434655]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-[#ffdad6] p-3 text-sm text-[#93000a]">
              {error}
            </div>
          )}

          <form key={user?.id ?? "anon"} onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && (
              <div className="space-y-4 animate-[fadeIn_0.3s_ease-out_forwards]">
                <h3 className="font-heading text-[20px] leading-[28px] font-semibold text-[#131b2e] mb-4">
                  Valide seus dados e inclua seu WhatsApp
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]" htmlFor="fullName">
                      Nome Completo
                    </label>
                    <input
                      className="px-4 py-3 rounded-lg text-[16px] leading-[24px] w-full border border-[#E2E8F0] bg-white text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-all"
                      id="fullName"
                      placeholder="Ex: Maria Silva"
                      type="text"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-[#ba1a1a]">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]" htmlFor="linkedin">
                      URL do LinkedIn
                    </label>
                    <input
                      className="px-4 py-3 rounded-lg text-[16px] leading-[24px] w-full border border-[#E2E8F0] bg-white text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-all"
                      id="linkedin"
                      placeholder="linkedin.com/in/mariasilva"
                      type="text"
                      {...register("linkedin")}
                    />
                    {errors.linkedin && (
                      <p className="text-sm text-[#ba1a1a]">{errors.linkedin.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="px-4 py-3 rounded-lg text-[16px] leading-[24px] w-full border border-[#E2E8F0] bg-[#f8f9fa] text-[#434655] cursor-not-allowed"
                      id="email"
                      type="email"
                      value={user?.email ?? ""}
                      readOnly
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]" htmlFor="whatsapp">
                      WhatsApp
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-[#E2E8F0] bg-[#f2f3ff] text-[#434655] text-[16px] leading-[24px]">
                        +55
                      </span>
                      <input
                        className="px-4 py-3 rounded-r-lg text-[16px] leading-[24px] w-full flex-1 border border-[#E2E8F0] bg-white text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-all"
                        id="whatsapp"
                        placeholder="(11) 99999-9999"
                        type="tel"
                        {...register("whatsapp")}
                      />
                    </div>
                    {errors.whatsapp && (
                      <p className="text-sm text-[#ba1a1a]">{errors.whatsapp.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 animate-[fadeIn_0.3s_ease-out_forwards]">
                <h3 className="font-heading text-[20px] leading-[28px] font-semibold text-[#131b2e] mb-4">
                  Informacoes Profissionais
                </h3>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]">
                    Titulo / Cargo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Engenheiro de Software Senior"
                    className="px-4 py-3 rounded-lg text-[16px] leading-[24px] w-full border border-[#E2E8F0] bg-white text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-all"
                    {...register("headline")}
                  />
                  {errors.headline && (
                    <p className="text-sm text-[#ba1a1a]">{errors.headline.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]">
                    Bio / Biografia curta
                  </label>
                  <textarea
                    placeholder="Conte um pouco sobre sua experiencia e como voce pode ajudar mentorados..."
                    rows={4}
                    className="px-4 py-3 rounded-lg text-[16px] leading-[24px] w-full border border-[#E2E8F0] bg-white text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-all resize-none"
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-sm text-[#ba1a1a]">{errors.bio.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]">
                    Formacao
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ciencia da Computacao - USP"
                    className="px-4 py-3 rounded-lg text-[16px] leading-[24px] w-full border border-[#E2E8F0] bg-white text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-all"
                    {...register("education")}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]">
                    Experiencia
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 10 anos em desenvolvimento de software"
                    className="px-4 py-3 rounded-lg text-[16px] leading-[24px] w-full border border-[#E2E8F0] bg-white text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-all"
                    {...register("experience")}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-[fadeIn_0.3s_ease-out_forwards]">
                <h3 className="font-heading text-[20px] leading-[28px] font-semibold text-[#131b2e] mb-4">
                  Habilidades
                </h3>
                <div>
                  <label className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e] mb-1.5 block">
                    Habilidades que deseja ensinar
                  </label>
                  <p className="mb-3 text-[14px] leading-[20px] text-[#434655]">
                    Digite uma habilidade e pressione Enter ou virgula para adicionar.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: React, Lideranca, Product Management..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      className="px-4 py-3 rounded-lg text-[16px] leading-[24px] w-full border border-[#E2E8F0] bg-white text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSkill}
                      className="h-auto py-3 rounded-lg border-[#E2E8F0] px-4 text-[14px] font-semibold text-[#131b2e] hover:border-[#004ac6] hover:text-[#004ac6]"
                    >
                      Adicionar
                    </Button>
                  </div>
                  {teachingSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {teachingSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1 rounded-full px-3 py-1 pr-1.5 bg-[#eaedff] text-[#004ac6] border border-[#c3c6d7]">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-1 rounded-full p-0.5 hover:bg-[#004ac6]/10"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  {errors.teachingSkills && (
                    <p className="mt-1 text-sm text-[#ba1a1a]">
                      {errors.teachingSkills.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-6 mt-8 border-t border-[#E2E8F0] flex justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#004ac6] text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:bg-[#f2f3ff] transition-colors border-transparent h-auto"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Voltar
                </Button>
              ) : (
                <div />
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-[#004ac6] text-white px-8 py-3 rounded-lg text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:bg-blue-600 transition-colors active:scale-95 flex items-center gap-2 shadow-sm h-auto"
                >
                  Proximo Passo
                  <ArrowRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalize}
                  className="bg-[#004ac6] text-white px-8 py-3 rounded-lg text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:bg-blue-600 transition-colors active:scale-95 flex items-center gap-2 shadow-sm h-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Finalizar
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
