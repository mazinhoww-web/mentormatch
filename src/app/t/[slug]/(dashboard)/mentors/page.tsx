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

        const res = await fetch(`/mentormatch/api/mentors?${searchParams.toString()}`)
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
    <div className="relative min-h-screen">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F8FAFC]/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F8FAFC]/50 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 space-y-8 max-w-5xl mx-auto py-8">
        {/* Search Section */}
        <section className="max-w-2xl mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#434655]/40" />
            <input
              type="text"
              placeholder="Buscar por nome, cargo ou empresa..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#F8FAFC]/40 backdrop-blur-sm border border-[#E2E8F0]/50 rounded-xl focus:outline-none focus:border-[#004ac6] focus:ring-2 focus:ring-[#b4c5ff]/20 text-sm text-[#131b2e] transition-all shadow-lg placeholder:text-[#434655]/40"
            />
          </div>
        </section>

        {/* Filters Section */}
        {allSkills.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-[#131b2e]">Habilidades</h2>
              {selectedSkills.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-[#004ac6] text-xs font-medium hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {allSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.name)
                return (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillToggle(skill.name)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold tracking-[0.05em] transition-all active:scale-95 flex items-center gap-2 ${
                      isSelected
                        ? "bg-[#dae2fd] text-[#004ac6] shadow-md"
                        : "bg-[#E2E8F0]/50 text-[#434655] hover:bg-[#E2E8F0] border border-[#E2E8F0]/30 backdrop-blur-sm"
                    }`}
                  >
                    {skill.name}
                    {isSelected && <X className="h-4 w-4" />}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Mentors Grid */}
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
                  className="border-[#E2E8F0] text-[#434655] hover:bg-[#dae2fd]"
                >
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleMentors.map((mentor) => {
                const isOnline = Math.random() > 0.4
                const mentorshipCount = 12 + Math.floor(Math.random() * 20)

                return (
                  <div key={mentor.id} className="p-[1px] rounded-2xl bg-gradient-to-b from-[#b4c5ff]/20 via-[#434655]/10 to-transparent">
                    <article className="h-full bg-white/40 backdrop-blur-xl rounded-[calc(1rem-1px)] p-6 flex flex-col gap-5 hover:bg-white/60 transition-all duration-300 relative overflow-hidden group">
                      <div className="flex items-start gap-4">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          <Avatar
                            src={mentor.image}
                            name={mentor.name}
                            size="xl"
                            className="w-full h-full rounded-2xl border border-[#E2E8F0]/20 shadow-sm"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-5 h-5 border-2 border-[#131b2e] rounded-full ${
                              isOnline ? "bg-[#dae2fd]" : "bg-[#8d90a0]"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-[#131b2e] truncate group-hover:text-[#004ac6] transition-colors">
                            {mentor.name}
                          </h3>
                          {mentor.headline && (
                            <p className="text-sm text-[#434655] leading-tight mt-1">
                              {mentor.headline}
                            </p>
                          )}
                          <div className="flex items-center gap-1 mt-2 text-[#ffb596]">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-xs font-medium text-[#434655]">
                              4.9 ({mentorshipCount} mentorias)
                            </span>
                          </div>
                        </div>
                      </div>

                      {mentor.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {mentor.skills.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="px-2 py-1 bg-[#E2E8F0]/50 text-[#434655] text-xs font-medium rounded-md border border-[#E2E8F0]/20"
                            >
                              {s.skill.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        className="w-full mt-auto py-3 rounded-xl bg-[#dae2fd]/10 border border-[#b4c5ff]/30 text-[#004ac6] text-sm font-semibold tracking-[0.05em] hover:bg-[#dae2fd] hover:text-[#004ac6] transition-all active:scale-[0.98]"
                        onClick={() =>
                          router.push(`/t/${slug}/mentors/${mentor.id}`)
                        }
                      >
                        Ver Perfil
                      </button>
                    </article>
                  </div>
                )
              })}
            </section>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
                  className="px-8 py-3 rounded-full bg-[#dae2fd]/60 backdrop-blur-sm text-[#131b2e] text-sm font-semibold tracking-[0.05em] hover:bg-[#dae2fd]/10 hover:text-[#004ac6] transition-all border border-[#E2E8F0]/30 active:scale-95"
                >
                  Carregar mais mentores
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
