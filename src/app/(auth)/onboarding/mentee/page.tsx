"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Loader2,
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
import { useCurrentUser } from "@/hooks/use-current-user"

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
  const { user, isLoading: sessionLoading } = useCurrentUser()
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedObjective, setSelectedObjective] = useState("career")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")

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

  useEffect(() => {
    if (user) {
      if (user.name) setValue("name", user.name)
    }
  }, [user, setValue])

  const learningSkills = watch("learningSkills")

  function toggleSuggestedSkill(skill: string) {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill]
    setSelectedSkills(newSkills)
    setValue("learningSkills", newSkills, { shouldValidate: true })
  }

  function addCustomSkill() {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    if (selectedSkills.includes(trimmed)) {
      setSkillInput("")
      return
    }
    const newSkills = [...selectedSkills, trimmed]
    setSelectedSkills(newSkills)
    setValue("learningSkills", newSkills, { shouldValidate: true })
    setSkillInput("")
  }

  function removeSkill(skill: string) {
    const newSkills = selectedSkills.filter((s) => s !== skill)
    setSelectedSkills(newSkills)
    setValue("learningSkills", newSkills, { shouldValidate: true })
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addCustomSkill()
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
      setCurrentStep(3)
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
      if (errors.name || errors.whatsapp) {
        setCurrentStep(1)
        setError("Verifique os campos do passo 1.")
      } else if (errors.learningSkills) {
        setError("Selecione pelo menos 1 habilidade.")
      }
      return
    }
    const data = watch() as MenteeProfileInput
    await submitProfile(data)
  }

  async function submitProfile(data: MenteeProfileInput) {
    setError(null)

    try {
      const response = await fetch("/mentormatch/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          headline: data.headline,
          bio: selectedObjective,
          whatsapp: data.whatsapp,
          skills: data.learningSkills,
          role: "MENTEE",
          image: photoUrl,
        }),
      })

      if (!response.ok) {
        const body = await response.json()
        setError(body.error || body.message || "Erro ao salvar perfil. Tente novamente.")
        return
      }

      router.push("/welcome")
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
      <header className="bg-white border-b border-[#E2E8F0] fixed top-0 w-full z-50 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/select-profile"
            className="p-2 hover:bg-[#f2f3ff] transition-colors rounded-full active:scale-95 duration-150 text-[#434655]"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-2 text-[#004ac6]">
            <GraduationCap className="h-6 w-6" />
            <span className="font-heading text-[28px] leading-[36px] tracking-[-0.01em] font-bold">MentorMatch</span>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-4 md:px-10 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center">
          <div className="w-[800px] h-[800px] bg-[#b4c5ff]/30 rounded-full blur-[100px] absolute top-[-20%] left-[-10%]" />
          <div className="w-[600px] h-[600px] bg-[#d0e1fb]/40 rounded-full blur-[80px] absolute bottom-[-10%] right-[-5%]" />
        </div>

        <div className="bg-white/90 backdrop-blur-[10px] w-full max-w-2xl rounded-xl border border-[#E2E8F0] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] z-10 p-6 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-[28px] leading-[34px] font-bold md:text-[36px] md:leading-[44px] md:tracking-[-0.02em] text-[#131b2e] mb-2">
              Junte-se a nos
            </h1>
            <p className="text-[16px] leading-[24px] text-[#434655]">
              Encontre o mentor ideal para impulsionar sua carreira.
            </p>
          </div>

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

          <form onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="font-heading text-[20px] leading-[28px] font-semibold text-[#131b2e] mb-2">
                  Valide seus dados e inclua seu WhatsApp
                </h3>

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
                    Email
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] bg-[#f8f9fa] text-[#434655] cursor-not-allowed text-[16px] leading-[24px]"
                    id="email"
                    type="email"
                    value={user?.email ?? ""}
                    readOnly
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

            {currentStep === 3 && (
              <div>
                <h2 className="font-heading text-[20px] leading-[28px] font-semibold text-[#131b2e] mb-2">
                  O que voce quer aprender?
                </h2>
                <p className="text-[14px] leading-[20px] text-[#434655] mb-6">
                  Selecione areas de interesse ou digite as suas.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
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

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Digite outra habilidade..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="px-4 py-3 rounded-lg text-[16px] leading-[24px] w-full border border-[#E2E8F0] bg-white text-[#131b2e] placeholder:text-[#737686] focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomSkill}
                    className="h-auto py-3 rounded-lg border-[#E2E8F0] px-4 text-[14px] font-semibold text-[#131b2e] hover:border-[#004ac6] hover:text-[#004ac6]"
                  >
                    Adicionar
                  </Button>
                </div>

                {selectedSkills.filter((s) => !suggestedSkills.includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedSkills.filter((s) => !suggestedSkills.includes(s)).map((skill) => (
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

                {errors.learningSkills && (
                  <p className="mt-1 text-sm text-[#ba1a1a]">
                    {errors.learningSkills.message}
                  </p>
                )}
              </div>
            )}

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
                <div />
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
                  type="button"
                  onClick={handleFinalize}
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
