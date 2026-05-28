"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Video,
  ArrowRight,
  BookOpen,
  Star,
  ChevronRight,
  Clock,
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
          fetch("/mentormatch/api/connections?status=ACCEPTED"),
          fetch(`/mentormatch/api/library?tenantId=${encodeURIComponent(slug)}`),
          fetch(`/mentormatch/api/mentors?tenantId=${encodeURIComponent(slug)}`),
          fetch("/mentormatch/api/auth/session"),
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
    <div className="space-y-4">
      {/* Personalized Greeting */}
      <section className="mb-8">
        <h1 className="text-[28px] md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          Ola, {userName || "Mentorado"}! <span role="img" aria-label="wave">&#128075;</span>
        </h1>
        <p className="text-lg text-slate-500">
          Pronto para continuar seu desenvolvimento profissional hoje?
        </p>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Mentorship Status Box (Spans 8 cols on desktop) */}
        <div className="col-span-1 md:col-span-8 bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-[0_10px_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Sua Proxima Sessao</h2>
              {activeConnection?.mentor.skills?.[0]?.skill.name && (
                <p className="text-sm text-slate-500 mt-1">
                  Trilha de {activeConnection.mentor.skills[0].skill.name}
                </p>
              )}
            </div>
          </div>
          {activeConnection?.mentor ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center gap-4 hover:border-blue-300 transition-colors">
              <Avatar
                src={activeConnection.mentor.image}
                name={activeConnection.mentor.name}
                size="lg"
                className="w-14 h-14 shrink-0"
              />
              <div className="flex-grow min-w-0">
                <h3 className="text-sm font-semibold tracking-wide text-slate-900">
                  {activeConnection.mentor.name}
                </h3>
                {activeConnection.mentor.headline && (
                  <p className="text-sm text-slate-500">
                    {activeConnection.mentor.headline}
                  </p>
                )}
              </div>
              <button
                className="hidden sm:flex bg-blue-700 text-white text-sm font-semibold tracking-wide px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors items-center gap-2 active:scale-95"
              >
                <Video className="h-4 w-4" />
                Entrar na Sala
              </button>
              <button
                className="sm:hidden bg-blue-700 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors active:scale-95 shrink-0"
              >
                <Video className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
              <p className="text-sm text-slate-600 mb-3">Voce ainda nao tem sessoes agendadas.</p>
              <button
                onClick={() => router.push(`/t/${slug}/mentors`)}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                Encontre um mentor &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Library Quick Access (Spans 4 cols on desktop) */}
        <div className="col-span-1 md:col-span-4 bg-blue-600 border border-blue-500/20 rounded-xl p-4 relative overflow-hidden group">
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-4 flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Biblioteca</h2>
            </div>
            <div className="space-y-3 flex-grow flex flex-col justify-end">
              <p className="text-sm text-white/80 mb-2">Recomendados para voce</p>
              {materials.length > 0 ? (
                materials.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/t/${slug}/library/${item.id}`)}
                    className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-lg p-3 flex items-center justify-between hover:bg-white transition-colors group/link cursor-pointer text-left w-full"
                  >
                    <span className="text-xs font-medium text-slate-900 truncate pr-4">{item.title}</span>
                    <ArrowRight className="h-4 w-4 text-slate-500 group-hover/link:text-blue-700 transition-colors shrink-0" />
                  </button>
                ))
              ) : (
                <p className="text-sm text-white/70 italic">Nenhum material disponivel ainda.</p>
              )}
            </div>
          </div>
        </div>

        {/* Featured Mentors Full Width Area */}
        <div className="col-span-1 md:col-span-12 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Mentores em Destaque</h2>
            <button
              onClick={() => router.push(`/t/${slug}/mentors`)}
              className="text-sm font-semibold tracking-wide text-blue-700 hover:underline flex items-center gap-1"
            >
              Ver todos <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {/* Grid of Mentor Cards */}
          {mentors.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-sm text-slate-600 mb-3">Voce ainda nao tem mentores conectados.</p>
              <button
                onClick={() => router.push(`/t/${slug}/mentors`)}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                Explore a plataforma &rarr;
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] hover:border-blue-300 transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    src={mentor.image}
                    name={mentor.name}
                    size="lg"
                    className="border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-wide text-slate-900 group-hover:text-blue-700 transition-colors">{mentor.name}</h3>
                    {mentor.headline && (
                      <p className="text-sm text-slate-500">{mentor.headline}</p>
                    )}
                  </div>
                </div>
                {mentor.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 flex-grow content-start">
                    {mentor.skills.slice(0, 3).map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 bg-blue-50 text-slate-500 text-xs font-medium rounded-full"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => router.push(`/t/${slug}/mentors/${mentor.id}`)}
                  className="w-full border border-blue-700 text-blue-700 text-sm font-semibold tracking-wide py-2 rounded-lg hover:bg-blue-50 transition-colors mt-auto"
                >
                  Ver Perfil
                </button>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  )
}
