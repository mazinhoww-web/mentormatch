"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  MessageCircle,
  MapPin,
  Play,
  Send,
  Flame,
  Briefcase,
  PlayCircle,
  Calendar,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"

interface Skill {
  id: string
  skill: { id: string; name: string }
}

interface MentorProfile {
  id: string
  name: string
  email: string
  image?: string | null
  headline?: string | null
  bio?: string | null
  education?: string | null
  experience?: string | null
  linkedin?: string | null
  whatsapp?: string | null
  maxMentees: number
  activeConnections: number
  skills: Skill[]
}

interface ExperienceEntry {
  company: string
  role: string
  dates: string
  description: string
}

function parseExperience(experience?: string | null): ExperienceEntry[] {
  if (!experience) return []
  const entries = experience.split(/\n\n+/).filter(Boolean)
  return entries.map((entry) => {
    const lines = entry.split("\n").filter(Boolean)
    return {
      company: lines[0] || "Empresa",
      role: lines[1] || "",
      dates: lines[2] || "",
      description: lines.slice(3).join(" ") || lines.slice(1).join(" ") || "",
    }
  })
}

export default function MentorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const mentorId = params.id as string

  const [loading, setLoading] = useState(true)
  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [hasActiveConnection, setHasActiveConnection] = useState(false)

  useEffect(() => {
    async function fetchMentor() {
      try {
        const [mentorsRes, connectionsRes] = await Promise.all([
          fetch(`/api/mentors?tenantId=${encodeURIComponent(slug)}`),
          fetch("/mentormatch/api/connections?status=ACCEPTED"),
        ])
        const mentors: MentorProfile[] = await mentorsRes.json()
        const found = mentors.find((m) => m.id === mentorId) || null
        setMentor(found)

        const connections = await connectionsRes.json()
        if (Array.isArray(connections)) {
          const active = connections.some(
            (c: { mentor?: { id: string }; mentorId?: string; status: string }) =>
              (c.mentor?.id === mentorId || c.mentorId === mentorId) &&
              c.status === "ACCEPTED"
          )
          setHasActiveConnection(active)
        }
      } catch (err) {
        console.error("Erro ao carregar mentor:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMentor()
  }, [slug, mentorId])

  function openWhatsApp(phone?: string | null) {
    if (!phone) return
    const cleaned = phone.replace(/\D/g, "")
    window.open(`https://wa.me/${cleaned}`, "_blank")
  }

  if (loading) {
    return <Loading text="Carregando perfil..." />
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-[#faf8ff]">
        <div className="p-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-[#434655]">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-16">
          <p className="text-lg font-medium text-[#131b2e]">Mentor nao encontrado</p>
          <p className="text-sm text-[#434655] mt-1">
            O perfil que voce procura nao existe ou nao esta mais disponivel.
          </p>
        </div>
      </div>
    )
  }

  const experienceEntries = parseExperience(mentor.experience)
  const primarySkills = mentor.skills.slice(0, 3)
  const secondarySkills = mentor.skills.slice(3)

  return (
    <div className="max-w-[900px] mx-auto flex flex-col gap-8">
      {/* Profile Header */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-8 flex flex-col items-center text-center shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md mb-6">
          <Avatar
            src={mentor.image}
            name={mentor.name}
            size="xl"
            className="w-full h-full"
          />
        </div>

        <h2 className="text-[28px] md:text-[36px] leading-[34px] md:leading-[44px] font-bold text-[#131b2e] mb-2">
          {mentor.name}
        </h2>
        {mentor.headline && (
          <p className="text-lg leading-7 text-[#004ac6] font-medium mb-1">
            {mentor.headline}
          </p>
        )}
        <p className="text-sm text-[#505f76] mb-6 flex items-center justify-center gap-1">
          <MapPin className="h-4 w-4" />
          Sao Paulo, SP (Remoto)
        </p>

        {mentor.bio && (
          <p className="text-base leading-6 text-[#434655] max-w-2xl mb-8 leading-relaxed">
            {mentor.bio}
          </p>
        )}

        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 justify-center">
          {submitted ? (
            <Button disabled className="bg-[#c3c6d7] text-[#434655] px-8 py-3">
              <Send className="h-4 w-4" />
              Solicitacao Enviada
            </Button>
          ) : (
            <button
              className="bg-[#004ac6] text-white text-sm font-semibold tracking-[0.05em] px-8 py-3 rounded-lg hover:bg-[#004ac6]/90 transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95"
              onClick={() => router.push(`/t/${slug}/confirm/${mentorId}`)}
            >
              <Calendar className="h-5 w-5" />
              Solicitar Mentoria
            </button>
          )}

          {hasActiveConnection && mentor.whatsapp ? (
            <button
              onClick={() => openWhatsApp(mentor.whatsapp)}
              className="bg-transparent border-2 border-[#004ac6] text-[#004ac6] text-sm font-semibold tracking-[0.05em] px-8 py-3 rounded-lg hover:bg-[#dae2fd]/30 transition-colors flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </button>
          ) : mentor.whatsapp ? (
            <button
              disabled
              title="Disponivel apos conexao ativa"
              className="bg-transparent border-2 border-[#c3c6d7] text-[#c3c6d7] text-sm font-semibold tracking-[0.05em] px-8 py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 opacity-60"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </button>
          ) : null}
        </div>
      </section>

      {/* Bento Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Skills Card */}
        {mentor.skills.length > 0 && (
          <section className="md:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
            <h3 className="text-xl leading-7 font-semibold text-[#131b2e] mb-5 flex items-center gap-2">
              <Flame className="h-5 w-5 text-[#004ac6]" />
              Habilidades
            </h3>
            <div className="flex flex-wrap gap-2">
              {primarySkills.map((s) => (
                <span
                  key={s.id}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-medium"
                >
                  {s.skill.name}
                </span>
              ))}
              {secondarySkills.map((s) => (
                <span
                  key={s.id}
                  className="bg-[#dae2fd] text-[#434655] px-4 py-1.5 rounded-full text-xs font-medium"
                >
                  {s.skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Video Presentation Card */}
        <section className={`${mentor.skills.length > 0 ? "md:col-span-3" : "md:col-span-5"} bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)] flex flex-col`}>
          <h3 className="text-xl leading-7 font-semibold text-[#131b2e] mb-5 flex items-center gap-2">
            <PlayCircle className="h-5 w-5 text-[#004ac6]" />
            Apresentacao
          </h3>
          <div className="relative w-full flex-grow min-h-[200px] bg-[#e2e7ff] rounded-lg overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-[#dae2fd] to-[#c3c6d7]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg group-hover:bg-[#004ac6] transition-colors duration-300 z-10">
                <Play className="h-8 w-8 text-[#004ac6] group-hover:text-white transition-colors ml-1" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Experience Timeline */}
      {(experienceEntries.length > 0 || mentor.experience) && (
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
          <h3 className="text-xl leading-7 font-semibold text-[#131b2e] mb-8 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#004ac6]" />
            Experiencia
          </h3>
          {experienceEntries.length > 0 ? (
            <div className="flex flex-col gap-8 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-[#dae2fd]">
              {experienceEntries.map((entry, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div className={`w-6 h-6 rounded-full border-[3px] border-white shadow-sm flex items-center justify-center z-10 shrink-0 mt-1 ${
                    i === 0 ? "bg-[#004ac6]" : "bg-[#dae2fd]"
                  }`} />
                  <div>
                    <h4 className="text-sm font-semibold tracking-[0.05em] text-[#131b2e] text-lg">
                      {entry.role || entry.company}
                    </h4>
                    <p className="text-sm text-[#004ac6] font-medium mb-2">
                      {entry.company} {entry.dates && `• ${entry.dates}`}
                    </p>
                    {entry.description && (
                      <p className="text-base leading-6 text-[#434655]">{entry.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : mentor.experience ? (
            <p className="text-[#434655] whitespace-pre-line">{mentor.experience}</p>
          ) : null}
        </section>
      )}

      {/* Education */}
      {mentor.education && (
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 md:p-8 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
          <h3 className="text-xl leading-7 font-semibold text-[#131b2e] mb-4">Formacao</h3>
          <p className="text-[#434655] whitespace-pre-line">{mentor.education}</p>
        </section>
      )}
    </div>
  )
}
