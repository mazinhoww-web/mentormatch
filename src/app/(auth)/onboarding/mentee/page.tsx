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
  User,
  Link2,
  Phone,
  BookOpen,
} from "lucide-react"

import { menteeProfileSchema, type MenteeProfileInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const steps = [
  { number: 1, label: "Basico" },
  { number: 2, label: "Sobre voce" },
  { number: 3, label: "Habilidades" },
]

export default function MenteeOnboardingPage() {
  const router = useRouter()
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
  } = useForm<MenteeProfileInput>({
    resolver: zodResolver(menteeProfileSchema),
    defaultValues: {
      learningSkills: [],
    },
  })

  const learningSkills = watch("learningSkills")

  function addSkill() {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    if (learningSkills.includes(trimmed)) {
      setSkillInput("")
      return
    }
    setValue("learningSkills", [...learningSkills, trimmed], {
      shouldValidate: true,
    })
    setSkillInput("")
  }

  function removeSkill(skill: string) {
    setValue(
      "learningSkills",
      learningSkills.filter((s) => s !== skill),
      { shouldValidate: true }
    )
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
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

      const response = await fetch("/api/upload", {
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
      const valid = await trigger(["bio"])
      if (valid) setCurrentStep(3)
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
      const response = await fetch("/api/auth/complete-profile", {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div className="w-full max-w-md flex flex-col items-center">
      {/* Header */}
      <div className="mb-6 flex w-full items-center gap-3">
        <Link href="/select-profile" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">MentorMatch</span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900">Torne-se um Mentorado</h1>
          <p className="mt-1 text-sm text-gray-500">
            Preencha suas informacoes para encontrar o mentor ideal.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-0">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${
                    currentStep >= step.number
                      ? "bg-[#2563eb] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.number}
                </div>
                <span
                  className={`mt-1.5 text-xs ${
                    currentStep >= step.number ? "font-medium text-[#2563eb]" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`mx-3 mb-5 h-0.5 w-12 ${
                    currentStep > step.number ? "bg-[#2563eb]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basico */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {/* Photo */}
              <div className="flex items-center gap-4">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Foto de perfil"
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <Upload className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  className="text-sm font-medium text-[#2563eb] hover:underline"
                  disabled={uploading}
                  onClick={() => document.getElementById("photo-upload")?.click()}
                >
                  {uploading ? "Enviando..." : "Escolher foto"}
                </button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Headline */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Titulo profissional
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ex: Estudante de Engenharia"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    {...register("headline")}
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  URL do LinkedIn
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/seu-perfil"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    {...register("linkedin")}
                  />
                </div>
                {errors.linkedin && (
                  <p className="mt-1 text-sm text-red-500">{errors.linkedin.message}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  WhatsApp
                </label>
                <div className="flex gap-2">
                  <div className="flex h-11 w-20 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-600">
                    +55
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                      {...register("whatsapp")}
                    />
                  </div>
                </div>
                {errors.whatsapp && (
                  <p className="mt-1 text-sm text-red-500">{errors.whatsapp.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Sobre voce */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Bio */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Sobre voce
                </label>
                <textarea
                  placeholder="Conte um pouco sobre voce e o que busca em uma mentoria..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  {...register("bio")}
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
                )}
              </div>

              {/* Education */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Formacao
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ex: Engenharia de Software - UNICAMP"
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                    {...register("education")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Habilidades */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Habilidades que deseja aprender
                </label>
                <p className="mb-3 text-xs text-gray-500">
                  Digite uma habilidade e pressione Enter ou clique em Adicionar.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: React, Lideranca, Product Management..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSkill}
                    className="h-11 rounded-lg border-gray-300 px-4 text-sm"
                  >
                    Adicionar
                  </Button>
                </div>
                {learningSkills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {learningSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1 rounded-full px-3 py-1 pr-1.5">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 rounded-full p-0.5 hover:bg-gray-300/50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                {errors.learningSkills && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.learningSkills.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                className="h-11 flex-1 rounded-lg border-gray-300 text-sm font-medium text-gray-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="h-11 flex-1 rounded-lg bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8]"
              >
                Proximo Passo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="h-11 flex-1 rounded-lg bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8]"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Finalizar
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
    </div>
  )
}
