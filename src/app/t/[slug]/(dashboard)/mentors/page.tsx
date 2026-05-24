"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Search, SearchX, Filter, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
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
  const [selectedSkill, setSelectedSkill] = useState("")
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
      fetchMentors(value, selectedSkill)
    }, 400)
    setSearchTimeout(timeout)
  }

  function handleSkillFilter(skillName: string) {
    const newSkill = selectedSkill === skillName ? "" : skillName
    setSelectedSkill(newSkill)
    fetchMentors(search, newSkill)
  }

  const visibleMentors = mentors.slice(0, displayCount)
  const hasMore = displayCount < mentors.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buscar Mentores</h1>
        <p className="text-muted-foreground">
          Encontre o mentor ideal para sua jornada de aprendizado.
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, especialidade ou palavra-chave..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Skill Filter Chips */}
      {allSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mr-1">
            <Filter className="h-4 w-4" />
            Filtrar:
          </div>
          {allSkills.map((skill) => (
            <Badge
              key={skill.id}
              variant={selectedSkill === skill.name ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => handleSkillFilter(skill.name)}
            >
              {skill.name}
            </Badge>
          ))}
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
            search || selectedSkill
              ? "Tente alterar os filtros ou termos de busca."
              : "Ainda não há mentores disponíveis nesta organização."
          }
          action={
            (search || selectedSkill) ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("")
                  setSelectedSkill("")
                  fetchMentors("", "")
                }}
              >
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMentors.map((mentor) => {
              const availableSlots = Math.max(
                0,
                mentor.maxMentees - mentor.activeConnections
              )
              return (
                <Card
                  key={mentor.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Avatar
                        src={mentor.image}
                        name={mentor.name}
                        size="lg"
                      />
                      <h3 className="mt-3 text-lg font-semibold">
                        {mentor.name}
                      </h3>
                      {mentor.headline && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {mentor.headline}
                        </p>
                      )}

                      {/* Skills */}
                      {mentor.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                          {mentor.skills.slice(0, 4).map((s) => (
                            <Badge key={s.id} variant="secondary">
                              {s.skill.name}
                            </Badge>
                          ))}
                          {mentor.skills.length > 4 && (
                            <Badge variant="outline">
                              +{mentor.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Availability */}
                      <div className="mt-3">
                        <Badge
                          variant={availableSlots > 0 ? "success" : "warning"}
                        >
                          {availableSlots > 0
                            ? `${availableSlots}/${mentor.maxMentees} vagas`
                            : "Sem vagas"}
                        </Badge>
                      </div>

                      <Button
                        className="mt-4 w-full"
                        variant="outline"
                        onClick={() =>
                          router.push(`/t/${slug}/mentors/${mentor.id}`)
                        }
                      >
                        Ver Perfil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
              >
                <ChevronDown className="h-4 w-4" />
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
