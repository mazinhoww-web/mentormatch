"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Loader2, Upload, X } from "lucide-react"

import { mentorProfileSchema, type MentorProfileInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function MentorOnboardingPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [skillInput, setSkillInput] = useState("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MentorProfileInput>({
    resolver: zodResolver(mentorProfileSchema),
    defaultValues: {
      teachingSkills: [],
    },
  })

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

  async function onSubmit(data: MentorProfileInput) {
    setError(null)

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          role: "MENTOR",
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
      setError("Erro de conexão. Tente novamente.")
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Perfil de Mentor</CardTitle>
        <CardDescription>
          Preencha suas informações para se cadastrar como mentor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Photo upload */}
          <div className="space-y-2">
            <Label>Foto de perfil</Label>
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Foto de perfil"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() =>
                    document.getElementById("photo-upload")?.click()
                  }
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Escolher foto"
                  )}
                </Button>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" error={!!errors.name}>
              Nome completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline" error={!!errors.headline}>
              Título profissional
            </Label>
            <Input
              id="headline"
              type="text"
              placeholder="Ex: Engenheiro de Software Sênior"
              {...register("headline")}
            />
            {errors.headline && (
              <p className="text-sm text-destructive">
                {errors.headline.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" error={!!errors.bio}>
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Conte um pouco sobre sua experiência e como você pode ajudar mentorados..."
              rows={4}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Formação</Label>
            <Input
              id="education"
              type="text"
              placeholder="Ex: Ciência da Computação - USP"
              {...register("education")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experiência</Label>
            <Input
              id="experience"
              type="text"
              placeholder="Ex: 10 anos em desenvolvimento de software"
              {...register("experience")}
            />
          </div>

          {/* Teaching skills selector */}
          <div className="space-y-2">
            <Label error={!!errors.teachingSkills}>
              Habilidades que deseja ensinar
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Digite uma habilidade e pressione Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                size="default"
                onClick={addSkill}
              >
                Adicionar
              </Button>
            </div>
            {teachingSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {teachingSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {errors.teachingSkills && (
              <p className="text-sm text-destructive">
                {errors.teachingSkills.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/seu-perfil"
              {...register("linkedin")}
            />
            {errors.linkedin && (
              <p className="text-sm text-destructive">
                {errors.linkedin.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" error={!!errors.whatsapp}>
              WhatsApp
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="(11) 99999-9999"
              {...register("whatsapp")}
            />
            {errors.whatsapp && (
              <p className="text-sm text-destructive">
                {errors.whatsapp.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Finalizar cadastro
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
