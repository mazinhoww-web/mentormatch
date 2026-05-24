"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  MessageCircle,
  MapPin,
  Play,
  Send,
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
  // Try to split by double newlines for entries
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

  useEffect(() => {
    async function fetchMentor() {
      try {
        const res = await fetch(
          `/api/mentors?tenantId=${encodeURIComponent(slug)}`
        )
        const mentors: MentorProfile[] = await res.json()
        const found = mentors.find((m) => m.id === mentorId) || null
        setMentor(found)
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
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-gray-600">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        <div className="text-center py-16">
          <p className="text-lg font-medium text-gray-900">Mentor nao encontrado</p>
          <p className="text-sm text-gray-500 mt-1">
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
    <div className="min-h-screen bg-white -mx-4 -mt-6 sm:-mx-6 lg:-mx-8 lg:-mt-6">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => router.push(`/t/${slug}/mentors`)}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para mentores
        </button>

        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <Avatar
            src={mentor.image}
            name={mentor.name}
            size="xl"
            className="h-28 w-28 text-3xl"
          />
        </div>

        {/* Name and headline */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{mentor.name}</h1>
          {mentor.headline && (
            <p className="mt-1 text-blue-600 font-medium">{mentor.headline}</p>
          )}
          <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>Sao Paulo, SP (Remoto)</span>
          </div>
        </div>

        {/* Bio */}
        {mentor.bio && (
          <p className="text-gray-600 text-center leading-relaxed mb-6">
            {mentor.bio}
          </p>
        )}

        {/* Action buttons */}
        <div className="space-y-3 mb-8">
          {submitted ? (
            <Button disabled className="w-full h-12 bg-gray-300 text-gray-500">
              <Send className="h-4 w-4" />
              Solicitacao Enviada
            </Button>
          ) : (
            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
              onClick={() => router.push(`/t/${slug}/confirm/${mentorId}`)}
            >
              Solicitar Mentoria
            </Button>
          )}

          {mentor.whatsapp && (
            <button
              onClick={() => openWhatsApp(mentor.whatsapp)}
              className="w-full flex items-center justify-center gap-2 h-12 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </button>
          )}
        </div>

        {/* Habilidades */}
        {mentor.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Habilidades</h2>
            <div className="flex flex-wrap gap-2">
              {primarySkills.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white"
                >
                  {s.skill.name}
                </span>
              ))}
              {secondarySkills.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full border border-blue-600 px-3 py-1 text-sm font-medium text-blue-600"
                >
                  {s.skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Apresentacao (Video) */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Apresentacao</h2>
          <div className="relative rounded-xl bg-gray-100 aspect-video flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
            <button className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white transition-colors">
              <Play className="h-7 w-7 text-blue-600 ml-1" />
            </button>
          </div>
        </div>

        {/* Experiencia */}
        {(experienceEntries.length > 0 || mentor.experience) && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Experiencia</h2>
            {experienceEntries.length > 0 ? (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                  {experienceEntries.map((entry, i) => (
                    <div key={i} className="relative pl-7">
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full bg-blue-600 border-2 border-white" />

                      <div>
                        <h3 className="font-semibold text-gray-900">{entry.company}</h3>
                        {entry.dates && (
                          <p className="text-sm text-gray-400">{entry.dates}</p>
                        )}
                        {entry.role && (
                          <p className="text-sm font-medium text-gray-700 mt-0.5">{entry.role}</p>
                        )}
                        {entry.description && (
                          <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : mentor.experience ? (
              <p className="text-gray-600 whitespace-pre-line">{mentor.experience}</p>
            ) : null}
          </div>
        )}

        {/* Education */}
        {mentor.education && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Formacao</h2>
            <p className="text-gray-600 whitespace-pre-line">{mentor.education}</p>
          </div>
        )}
      </div>
    </div>
  )
}
