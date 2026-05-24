"use client"

import { useEffect, useState, useRef } from "react"
import {
  Camera,
  Plus,
  X,
  Save,
  CheckCircle,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loading } from "@/components/ui/loading"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
  headline?: string | null
  bio?: string | null
  education?: string | null
  experience?: string | null
  linkedin?: string | null
  whatsapp?: string | null
  skills: { id: string; type: string; skill: { id: string; name: string } }[]
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState("")
  const [headline, setHeadline] = useState("")
  const [bio, setBio] = useState("")
  const [education, setEducation] = useState("")
  const [experience, setExperience] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [image, setImage] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()

      if (!session?.user?.id) return

      const userProfile: UserProfile = {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role || "",
        image: session.user.image || null,
        headline: null,
        bio: null,
        education: null,
        experience: null,
        linkedin: null,
        whatsapp: null,
        skills: [],
      }

      // Try to get detailed profile data from mentor list
      if (session.user.tenantSlug) {
        try {
          const mentorRes = await fetch(
            `/api/mentors?tenantId=${encodeURIComponent(session.user.tenantSlug)}`
          )
          const mentors = await mentorRes.json()
          if (Array.isArray(mentors)) {
            const me = mentors.find(
              (m: { id: string }) => m.id === session.user.id
            )
            if (me) {
              userProfile.headline = me.headline
              userProfile.bio = me.bio
              userProfile.education = me.education
              userProfile.experience = me.experience
              userProfile.linkedin = me.linkedin
              userProfile.skills = me.skills || []
            }
          }
        } catch {
          // Mentor data not available for this user
        }
      }

      setProfile(userProfile)
      setName(userProfile.name)
      setHeadline(userProfile.headline || "")
      setBio(userProfile.bio || "")
      setEducation(userProfile.education || "")
      setExperience(userProfile.experience || "")
      setLinkedin(userProfile.linkedin || "")
      setWhatsapp(userProfile.whatsapp || "")
      setImage(userProfile.image || "")
      setSkills(
        userProfile.skills.map(
          (s: { skill: { name: string } }) => s.skill.name
        )
      )
    } catch (err) {
      console.error("Erro ao carregar perfil:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const { url } = await res.json()
        setImage(url)
      }
    } catch (err) {
      console.error("Erro no upload:", err)
    } finally {
      setUploading(false)
    }
  }

  function addSkill() {
    const trimmed = newSkill.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
      setNewSkill("")
    }
  }

  function removeSkill(skillName: string) {
    setSkills((prev) => prev.filter((s) => s !== skillName))
  }

  function handleSkillKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  async function handleSave() {
    if (!profile) return

    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const payload = {
        role: profile.role,
        name,
        headline: headline || undefined,
        bio,
        education: education || undefined,
        experience: experience || undefined,
        linkedin: linkedin || "",
        whatsapp,
        image: image || undefined,
        skills,
      }

      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erro ao salvar perfil.")
        return
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("Erro ao salvar perfil:", err)
      setError("Erro ao salvar perfil. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading text="Carregando perfil..." />
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium">Erro ao carregar perfil</p>
        <p className="text-sm text-muted-foreground mt-1">
          Não foi possível carregar seus dados. Tente novamente mais tarde.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground">
          Atualize suas informações pessoais e profissionais.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Perfil atualizado com sucesso!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Photo Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Foto</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar src={image || null} name={name} size="xl" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 rounded-full bg-primary p-2 text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
            {uploading && (
              <p className="text-sm text-muted-foreground">Enviando...</p>
            )}
            <p className="text-sm text-muted-foreground text-center">
              Clique no botão para alterar sua foto.
            </p>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="opacity-60"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Título Profissional</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Ex: Engenheiro de Software Senior"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você, sua experiência e objetivos..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Informações Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="education">Formação</Label>
                <Textarea
                  id="education"
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="Ex: Bacharelado em Ciência da Computação - USP (2018)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experiência</Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Descreva sua experiência profissional..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="5511999999999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/seu-perfil"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Habilidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1 pr-1"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma habilidade adicionada.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Adicionar habilidade..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  disabled={!newSkill.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
