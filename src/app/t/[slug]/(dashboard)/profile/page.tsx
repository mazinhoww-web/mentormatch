"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Camera,
  Save,
  CheckCircle,
  LogOut,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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

const DAYS = [
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
  "Domingo",
]

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [image, setImage] = useState("")

  // Security
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Availability
  const [availability, setAvailability] = useState<Record<string, { enabled: boolean; start: string; end: string }>>(
    DAYS.reduce((acc, day) => {
      acc[day] = { enabled: day !== "Sabado" && day !== "Domingo", start: "09:00", end: "18:00" }
      return acc
    }, {} as Record<string, { enabled: boolean; start: string; end: string }>)
  )

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
      setBio(userProfile.bio || "")
      setLinkedin(userProfile.linkedin || "")
      setWhatsapp(userProfile.whatsapp || "")
      setImage(userProfile.image || "")
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

  function toggleDay(day: string) {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }))
  }

  function updateTime(day: string, field: "start" | "end", value: string) {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
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
        bio,
        linkedin: linkedin || "",
        whatsapp,
        image: image || undefined,
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
        <p className="text-lg font-medium text-gray-900">Erro ao carregar perfil</p>
        <p className="text-sm text-gray-500 mt-1">
          Nao foi possivel carregar seus dados. Tente novamente mais tarde.
        </p>
      </div>
    )
  }

  const roleLabel =
    profile.role === "MENTOR" ? "Mentor" : profile.role === "ADMIN" ? "Administrador" : "Mentorado"

  return (
    <div className="min-h-screen bg-white -mx-4 -mt-6 sm:-mx-6 lg:-mx-8 lg:-mt-6">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-500 mt-1">
            Gerencie suas informacoes pessoais, seguranca e disponibilidade.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 mb-6">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">Perfil atualizado com sucesso!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mb-6">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <Avatar src={image || null} name={name} size="xl" className="h-24 w-24 text-2xl" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
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
            <p className="text-sm text-gray-500 mt-2">Enviando...</p>
          )}
          <h2 className="text-lg font-semibold text-gray-900 mt-3">{name}</h2>
          <p className="text-sm text-gray-500">{roleLabel}</p>
        </div>

        {/* Sair da conta button */}
        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mb-8"
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </button>

        {/* Informacoes Pessoais */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Informacoes Pessoais</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-700">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="mt-1.5 border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="linkedin" className="text-gray-700">LinkedIn URL</Label>
              <Input
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/seu-perfil"
                className="mt-1.5 border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp" className="text-gray-700">WhatsApp</Label>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="flex h-10 items-center rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                  +55
                </span>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="11999999999"
                  className="flex-1 border-gray-300"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio" className="text-gray-700">Biografia Curta</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre voce..."
                rows={3}
                className="mt-1.5 border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Disponibilidade */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Disponibilidade</h3>

          <div className="space-y-3">
            {DAYS.map((day) => {
              const dayConfig = availability[day]
              return (
                <div key={day} className="flex items-center gap-3">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleDay(day)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      dayConfig.enabled ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm ${
                        dayConfig.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  <span className={`text-sm w-28 shrink-0 ${dayConfig.enabled ? "text-gray-900" : "text-gray-400"}`}>
                    {day}
                  </span>

                  {dayConfig.enabled && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <input
                        type="time"
                        value={dayConfig.start}
                        onChange={(e) => updateTime(day, "start", e.target.value)}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm text-gray-700"
                      />
                      <span className="text-gray-400">ate</span>
                      <input
                        type="time"
                        value={dayConfig.end}
                        onChange={(e) => updateTime(day, "end", e.target.value)}
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm text-gray-700"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Seguranca */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Seguranca</h3>

          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-gray-700">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="mt-1.5 border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-gray-700">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
                className="mt-1.5 border-gray-300"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="mt-1.5 border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-200 p-4 lg:left-72 lg:bottom-0">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
          >
            <Save className="h-5 w-5" />
            {saving ? "Salvando..." : "Salvar Alteracoes"}
          </Button>
        </div>
      </div>
    </div>
  )
}
