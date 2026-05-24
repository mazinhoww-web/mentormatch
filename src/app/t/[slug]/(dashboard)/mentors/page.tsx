"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Search, SearchX, Star, X, ChevronDown } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { Loading } from "@/components/ui/loading"

interface Skill {
  id: string
  name: string
}

interface MentorSkill {
  id: string
  skill: Skill
}

interface Mentor {
  id: string
  name: string
  email: string
  image?: string | null
  headline?: string | null
  bio?: string | null
  maxMentees: number
  activeConnections: number
  skills: MentorSkill[]
}

const PAGE_SIZE = 12

export default function MentorsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [search, setSearch] = useState("")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  const fetchMentors = useCallback(
    async (q: string, skill: string) => {
      setLoading(true)
      try {
        const searchParams = new URLSearchParams({ tenantId: slug })
        if (q.trim()) searchParams.set("q", q.trim())
        if (skill) searchParams.set("skill", skill)

        const res = await fetch(`/api/mentors?${searchParams.toString()}`)
        const data: Mentor[] = await res.json()
        setMentors(Array.isArray(data) ? data : [])
        setDisplayCount(PAGE_SIZE)
      } catch (error) {
        console.error("Erro ao buscar mentores:", error)
        setMentors([])
      } finally {
        setLoading(false)
      }
    },
    [slug]
  )

  useEffect(() => {
    async function fetchSkills() {
      try {
        const res = await fetch(
          `/api/skills?tenantId=${encodeURIComponent(slug)}`
        )
        const data: Skill[] = await res.json()
        setAllSkills(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Erro ao buscar habilidades:", error)
      }
    }

    fetchSkills()
    fetchMentors("", "")
  }, [slug, fetchMentors])

  function handleSearchChange(value: string) {
    setSearch(value)
    if (searchTimeout) clearTimeout(searchTimeout)
    const timeout = setTimeout(() => {
      fetchMentors(value, selectedSkills[0] || "")
    }, 400)
    setSearchTimeout(timeout)
  }

  function handleSkillToggle(skillName: string) {
    let newSelected: string[]
    if (selectedSkills.includes(skillName)) {
      newSelected = selectedSkills.filter((s) => s !== skillName)
    } else {
      newSelected = [...selectedSkills, skillName]
    }
    setSelectedSkills(newSelected)
    fetchMentors(search, newSelected[0] || "")
  }

  function clearFilters() {
    setSelectedSkills([])
    setSearch("")
    fetchMentors("", "")
  }

  const visibleMentors = mentors.slice(0, displayCount)
  const hasMore = displayCount < mentors.length

  return (
    <div className="min-h-screen space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar por nome, cargo ou empresa..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-xl bg-slate-900 border border-slate-800 py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
      </div>

      {/* Skill Filter Chips */}
      {allSkills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-400">Habilidades</span>
            {selectedSkills.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.name)
              return (
                <button
                  key={skill.id}
                  onClick={() => handleSkillToggle(skill.name)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-transparent border border-slate-700 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {skill.name}
                  {isSelected && <X className="h-3 w-3" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <Loading text="Buscando mentores..." />
      ) : visibleMentors.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Nenhum mentor encontrado"
          description={
            search || selectedSkills.length > 0
              ? "Tente alterar os filtros ou termos de busca."
              : "Ainda nao ha mentores disponiveis nesta organizacao."
          }
          action={
            search || selectedSkills.length > 0 ? (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {visibleMentors.map((mentor) => {
              const isOnline = Math.random() > 0.4
              const mentorshipCount = 12 + Math.floor(Math.random() * 20)

              return (
                <div
                  key={mentor.id}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-5"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Avatar with online indicator */}
                    <div className="relative mb-3">
                      <Avatar
                        src={mentor.image}
                        name={mentor.name}
                        size="xl"
                      />
                      <span
                        className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-slate-900 ${
                          isOnline ? "bg-green-500" : "bg-slate-500"
                        }`}
                      />
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      {mentor.name}
                    </h3>
                    {mentor.headline && (
                      <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                        {mentor.headline}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-white">4.9</span>
                      <span className="text-sm text-slate-400">
                        ({mentorshipCount} mentorias)
                      </span>
                    </div>

                    {/* Skills */}
                    {mentor.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                        {mentor.skills.slice(0, 4).map((s) => (
                          <span
                            key={s.id}
                            className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
                          >
                            {s.skill.name}
                          </span>
                        ))}
                        {mentor.skills.length > 4 && (
                          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                            +{mentor.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      className="mt-4 w-full rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
                      onClick={() =>
                        router.push(`/t/${slug}/mentors/${mentor.id}`)
                      }
                    >
                      Ver Perfil
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-2 pb-4">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
              >
                <ChevronDown className="h-4 w-4" />
                Carregar mais mentores
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
