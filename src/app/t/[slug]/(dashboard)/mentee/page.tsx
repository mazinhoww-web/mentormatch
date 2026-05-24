"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Video,
  ArrowRight,
  BookOpen,
  Star,
  ChevronRight,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"

interface Skill {
  id: string
  skill: { id: string; name: string }
}

interface Mentor {
  id: string
  name: string
  email: string
  image?: string | null
  headline?: string | null
  whatsapp?: string | null
  skills: Skill[]
}

interface Connection {
  id: string
  status: string
  message: string
  createdAt: string
  mentor: Mentor
}

interface LibraryItem {
  id: string
  title: string
  description?: string | null
  fileType: string
  fileUrl: string
  createdAt: string
}

interface MentorListing {
  id: string
  name: string
  image?: string | null
  headline?: string | null
  skills: { id: string; skill: { id: string; name: string } }[]
}

export default function MenteeDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null)
  const [materials, setMaterials] = useState<LibraryItem[]>([])
  const [mentors, setMentors] = useState<MentorListing[]>([])
  const [userName, setUserName] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [connectionsRes, libraryRes, mentorsRes, sessionRes] =
        await Promise.all([
          fetch("/api/connections?status=ACCEPTED"),
          fetch(`/api/library?tenantId=${encodeURIComponent(slug)}`),
          fetch(`/api/mentors?tenantId=${encodeURIComponent(slug)}`),
          fetch("/api/auth/session"),
        ])

      const active: Connection[] = await connectionsRes.json()
      const session = await sessionRes.json()

      let items: LibraryItem[] = []
      try {
        const libData = await libraryRes.json()
        items = Array.isArray(libData) ? libData : []
      } catch {
        items = []
      }

      let mentorList: MentorListing[] = []
      try {
        const mentorData = await mentorsRes.json()
        mentorList = Array.isArray(mentorData) ? mentorData : []
      } catch {
        mentorList = []
      }

      const mentorConnection = active.length > 0 ? active[0] : null
      setActiveConnection(mentorConnection)
      setMaterials(items.slice(0, 3))
      setMentors(mentorList.slice(0, 3))
      setUserName(session?.user?.name?.split(" ")[0] || "")
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading text="Carregando dashboard..." />
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Ola, {userName || "Mentorado"}! <span role="img" aria-label="wave">&#128075;</span>
        </h1>
        <p className="text-slate-400 mt-1">
          Pronto para continuar seu desenvolvimento profissional hoje?
        </p>
      </div>

      {/* Sua Proxima Sessao */}
      {activeConnection && (
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Sua Proxima Sessao
            </h2>
            <span className="rounded-full bg-blue-600/20 px-3 py-1 text-xs font-medium text-blue-400">
              Hoje, 14:30
            </span>
          </div>

          <p className="text-white font-medium mb-1">
            Sessao de Acompanhamento
          </p>
          <p className="text-sm text-slate-400 mb-4">
            Trilha de {activeConnection.mentor.skills?.[0]?.skill.name || "Desenvolvimento"}
          </p>

          <div className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={activeConnection.mentor.image}
                name={activeConnection.mentor.name}
                size="md"
              />
              <div>
                <p className="text-sm font-medium text-white">
                  {activeConnection.mentor.name}
                </p>
                {activeConnection.mentor.headline && (
                  <p className="text-xs text-slate-400">
                    {activeConnection.mentor.headline}
                  </p>
                )}
              </div>
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              <Video className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Biblioteca */}
      <div className="rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 p-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-blue-200" />
          <h2 className="font-semibold text-white">Biblioteca</h2>
        </div>
        <p className="text-sm text-blue-200 mb-4">Recomendados para voce</p>

        {materials.length > 0 ? (
          <div className="space-y-2">
            {materials.map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(`/t/${slug}/library/${item.id}`)}
                className="flex w-full items-center justify-between rounded-lg bg-white/10 px-4 py-3 text-left transition-colors hover:bg-white/20"
              >
                <span className="text-sm font-medium text-white truncate pr-2">
                  {item.title}
                </span>
                <ArrowRight className="h-4 w-4 text-blue-200 shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-blue-200/70 text-center py-4">
            Nenhum material disponivel ainda.
          </p>
        )}

        <Button
          variant="ghost"
          className="w-full mt-3 text-blue-100 hover:text-white hover:bg-white/10"
          onClick={() => router.push(`/t/${slug}/library`)}
        >
          Ver todos os materiais
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Mentores em Destaque */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Mentores em Destaque</h2>
          <button
            onClick={() => router.push(`/t/${slug}/mentors`)}
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {mentors.length > 0 ? (
          <div className="space-y-3">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="rounded-xl bg-slate-900 border border-slate-800 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    src={mentor.image}
                    name={mentor.name}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{mentor.name}</h3>
                    {mentor.headline && (
                      <p className="text-sm text-slate-400 truncate">
                        {mentor.headline}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-slate-400">4.9</span>
                    </div>
                  </div>
                </div>

                {mentor.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {mentor.skills.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => router.push(`/t/${slug}/mentors/${mentor.id}`)}
                >
                  Ver Perfil
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-8 text-center">
            <p className="text-slate-400">Nenhum mentor disponivel no momento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
