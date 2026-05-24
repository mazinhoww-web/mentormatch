"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Camera,
  Save,
  CheckCircle,
  LogOut,
  User,
  Lock,
  CalendarClock,
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
        <p className="text-lg font-medium text-[#131b2e]">Erro ao carregar perfil</p>
        <p className="text-sm text-[#434655] mt-1">
          Nao foi possivel carregar seus dados. Tente novamente mais tarde.
        </p>
      </div>
    )
  }

  const roleLabel =
    profile.role === "MENTOR" ? "Mentor de Carreira" : profile.role === "ADMIN" ? "Administrador" : "Mentorado"

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[28px] md:text-[36px] leading-[34px] md:leading-[44px] font-bold tracking-[-0.02em] text-[#131b2e] mb-2">
          Meu Perfil
        </h1>
        <p className="text-base leading-6 text-[#434655]">
          Gerencie suas informacoes pessoais, seguranca e disponibilidade.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 mb-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Avatar & Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Profile Photo Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-4 group cursor-pointer">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#faf8ff] shadow-sm">
                <Avatar
                  src={image || null}
                  name={name}
                  size="xl"
                  className="w-full h-full"
                />
              </div>
              <div
                className="absolute inset-0 bg-[#131b2e]/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-8 w-8 text-white" />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#004ac6] text-white p-2 rounded-full border-2 border-white hover:bg-[#0053db] transition-colors shadow-sm"
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
              <p className="text-sm text-[#434655] mt-2">Enviando...</p>
            )}
            <h2 className="text-xl leading-7 font-semibold text-[#131b2e]">{name}</h2>
            <p className="text-sm text-[#434655] mb-6">{roleLabel}</p>
            <button
              onClick={() => router.push("/login")}
              className="w-full flex items-center justify-center gap-2 border border-red-500 text-red-500 rounded-lg px-4 py-2.5 text-sm font-semibold tracking-[0.05em] hover:bg-red-50 active:scale-95 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </div>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Personal Info Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 flex flex-col gap-4">
            <h3 className="text-xl leading-7 font-semibold text-[#131b2e] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-[#004ac6]" />
              Informacoes Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#434655]">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#faf8ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] text-[#131b2e] text-base transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#434655]">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-[#faf8ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] text-[#131b2e] text-base transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-medium text-[#434655]">WhatsApp</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-[#E2E8F0] bg-[#dae2fd]/30 text-[#434655] text-base">
                    +55
                  </span>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className="w-full bg-[#faf8ff] border border-[#E2E8F0] rounded-r-lg px-4 py-2.5 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] text-[#131b2e] text-base transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-medium text-[#434655]">Biografia Curta</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre voce..."
                  rows={3}
                  className="w-full bg-[#faf8ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] text-[#131b2e] text-base transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Availability Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 flex flex-col gap-4">
            <h3 className="text-xl leading-7 font-semibold text-[#131b2e] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[#004ac6]" />
              Disponibilidade
            </h3>
            <div className="flex flex-col gap-4 mt-2">
              {DAYS.slice(0, 2).map((day) => {
                const dayConfig = availability[day]
                return (
                  <div
                    key={day}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-[#faf8ff]/50"
                  >
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      <button
                        onClick={() => toggleDay(day)}
                        className="relative"
                      >
                        <div
                          className={`w-11 h-6 rounded-full transition-colors ${
                            dayConfig.enabled ? "bg-emerald-500" : "bg-[#dae2fd]"
                          }`}
                        >
                          <div
                            className={`absolute top-[2px] left-[2px] h-5 w-5 bg-white border border-[#E2E8F0] rounded-full transition-transform ${
                              dayConfig.enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </div>
                      </button>
                      <span className="text-sm font-semibold tracking-[0.05em] text-[#131b2e]">
                        {day}
                      </span>
                    </div>
                    {dayConfig.enabled && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={dayConfig.start}
                          onChange={(e) => updateTime(day, "start", e.target.value)}
                          className="bg-white border border-[#E2E8F0] rounded-md px-3 py-1.5 focus:outline-none focus:border-[#004ac6] text-[#131b2e] text-sm w-28"
                        />
                        <span className="text-[#434655] text-sm">ate</span>
                        <input
                          type="time"
                          value={dayConfig.end}
                          onChange={(e) => updateTime(day, "end", e.target.value)}
                          className="bg-white border border-[#E2E8F0] rounded-md px-3 py-1.5 focus:outline-none focus:border-[#004ac6] text-[#131b2e] text-sm w-28"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8 flex flex-col gap-4">
            <h3 className="text-xl leading-7 font-semibold text-[#131b2e] border-b border-[#E2E8F0] pb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#004ac6]" />
              Seguranca
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-medium text-[#434655]">Senha Atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#faf8ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] text-[#131b2e] text-base transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#434655]">Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#faf8ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] text-[#131b2e] text-base transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#434655]">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#faf8ff] border border-[#E2E8F0] rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] text-[#131b2e] text-base transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Global Action */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#004ac6] text-white rounded-lg px-8 py-3 text-sm font-semibold tracking-[0.05em] hover:bg-[#0053db] active:scale-95 transition-all w-full sm:w-auto shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Alteracoes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
