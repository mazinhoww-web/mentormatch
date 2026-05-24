"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  ClipboardList,
  Check,
  X,
  Ban,
  Inbox,
  Send,
  Clock,
  Calendar,
  UserPlus,
  Rocket,
  MoreVertical,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { Loading } from "@/components/ui/loading"
import { formatDate } from "@/lib/utils"

interface Skill {
  id: string
  skill: { id: string; name: string }
}

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  headline?: string | null
  skills: Skill[]
}

interface Connection {
  id: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"
  message: string
  createdAt: string
  mentor: User
  mentee: User
}

interface WaitlistEntry {
  id: string
  position: number
  createdAt: string
  mentee: {
    id: string
    name: string
    image?: string | null
    headline?: string | null
  }
  mentor: {
    id: string
    name: string
    image?: string | null
    headline?: string | null
  }
}

type TabValue = "received" | "sent"

const statusConfig: Record<
  string,
  { label: string; variant: "warning" | "success" | "destructive" | "secondary" }
> = {
  PENDING: { label: "Pendente", variant: "warning" },
  ACCEPTED: { label: "Aceita", variant: "success" },
  REJECTED: { label: "Rejeitada", variant: "destructive" },
  CANCELLED: { label: "Cancelada", variant: "secondary" },
  COMPLETED: { label: "Concluida", variant: "secondary" },
}

export default function RequestsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabValue>("received")
  const [receivedConnections, setReceivedConnections] = useState<Connection[]>([])
  const [sentConnections, setSentConnections] = useState<Connection[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([])
  const [removingWaitlistId, setRemovingWaitlistId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [connectionsRes, sessionRes, waitlistRes] = await Promise.all([
        fetch("/api/connections"),
        fetch("/api/auth/session"),
        fetch("/api/waitlist"),
      ])

      const connections: Connection[] = await connectionsRes.json()
      const session = await sessionRes.json()
      const role = session?.user?.role || "MENTEE"
      setUserRole(role)

      let waitlistData: WaitlistEntry[] = []
      try {
        const wData = await waitlistRes.json()
        waitlistData = Array.isArray(wData) ? wData : []
      } catch {
        waitlistData = []
      }
      setWaitlistEntries(waitlistData)

      if (role === "MENTOR") {
        setReceivedConnections(connections)
        setSentConnections([])
        setTab("received")
      } else {
        setSentConnections(connections)
        setReceivedConnections([])
        setTab("sent")
      }
    } catch (error) {
      console.error("Erro ao carregar solicitacoes:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRemoveFromWaitlist(entryId: string) {
    setRemovingWaitlistId(entryId)
    try {
      const res = await fetch("/api/waitlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entryId }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Erro ao remover da lista de espera:", error)
    } finally {
      setRemovingWaitlistId(null)
    }
  }

  async function handleRequest(
    connectionId: string,
    status: "ACCEPTED" | "REJECTED" | "CANCELLED"
  ) {
    setUpdatingId(connectionId)
    try {
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      })

      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Erro ao atualizar solicitacao:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return <Loading text="Carregando solicitacoes..." />
  }

  const isMentor = userRole === "MENTOR"
  const pendingCount = receivedConnections.filter((c) => c.status === "PENDING").length
  const activeCount = receivedConnections.filter((c) => c.status === "ACCEPTED").length

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-[36px] leading-[34px] md:leading-[44px] font-bold tracking-[-0.02em] text-[#131b2e]">
            Gestao de Mentoria
          </h1>
          <p className="text-base leading-6 text-[#434655] mt-1">
            Acompanhe suas solicitacoes, mentorados ativos e fila de espera.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-lg px-4 py-2 w-fit">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold tracking-[0.05em] text-[#131b2e]">
            Aceitando novos mentorados
          </span>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Section: Pending Requests */}
          {isMentor && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Inbox className="h-5 w-5 text-[#004ac6]" />
                <h2 className="text-xl leading-7 font-semibold text-[#131b2e]">
                  Solicitacoes Pendentes
                </h2>
                {pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full ml-2">
                    {pendingCount}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {receivedConnections
                  .filter((c) => c.status === "PENDING")
                  .map((conn) => (
                    <div
                      key={conn.id}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#b4c5ff] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={conn.mentee.image}
                          name={conn.mentee.name}
                          size="md"
                          className="border border-[#E2E8F0]"
                        />
                        <div>
                          <h3 className="text-sm font-semibold tracking-[0.05em] text-[#131b2e]">
                            {conn.mentee.name}
                          </h3>
                          {conn.mentee.headline && (
                            <p className="text-sm text-[#434655]">
                              {conn.mentee.headline}
                            </p>
                          )}
                          {conn.mentee.skills && conn.mentee.skills.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {conn.mentee.skills.slice(0, 3).map((s) => (
                                <span
                                  key={s.id}
                                  className="bg-[#e2e7ff] text-[#434655] text-xs font-medium px-2 py-1 rounded-full"
                                >
                                  {s.skill.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleRequest(conn.id, "REJECTED")}
                          disabled={updatingId === conn.id}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-white border border-[#E2E8F0] text-[#434655] px-4 py-2 rounded-lg text-sm font-semibold tracking-[0.05em] hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                          Recusar
                        </button>
                        <button
                          onClick={() => handleRequest(conn.id, "ACCEPTED")}
                          disabled={updatingId === conn.id}
                          className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-[#004ac6] text-white px-4 py-2 rounded-lg text-sm font-semibold tracking-[0.05em] hover:bg-[#003ea8] transition-colors duration-200 shadow-sm"
                        >
                          <Check className="h-4 w-4" />
                          Aceitar
                        </button>
                      </div>
                    </div>
                  ))}
                {pendingCount === 0 && (
                  <EmptyState
                    icon={Inbox}
                    title="Nenhuma solicitacao pendente"
                    description="Voce nao possui solicitacoes pendentes de mentoria."
                  />
                )}
              </div>
            </section>
          )}

          {/* Section: Active Mentees */}
          <section className={isMentor ? "mt-4" : ""}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#004ac6]" />
                <h2 className="text-xl leading-7 font-semibold text-[#131b2e]">
                  {isMentor ? "Mentorados Ativos" : "Minhas Mentorias"}
                </h2>
              </div>
              {isMentor && (
                <span className="text-xs font-medium text-[#434655]">
                  {activeCount} / 4 Vagas Preenchidas
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {(isMentor ? receivedConnections : sentConnections)
                .filter((c) => c.status === "ACCEPTED")
                .map((conn, index) => {
                  const person = isMentor ? conn.mentee : conn.mentor
                  const progress = [33, 83, 15][index % 3]
                  const month = [2, 5, 1][index % 3]
                  const totalMonths = [6, 6, 3][index % 3]

                  return (
                    <div
                      key={conn.id}
                      className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group hover:border-[#b4c5ff] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={person.image}
                          name={person.name}
                          size="sm"
                        />
                        <div>
                          <h3 className="text-sm font-semibold tracking-[0.05em] text-[#131b2e]">
                            {person.name}
                          </h3>
                          {person.headline && (
                            <p className="text-sm text-[#434655]">
                              {person.headline}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="border-t border-[#E2E8F0] pt-3 mt-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-[#434655]">
                            Progresso (Mes {month}/{totalMonths})
                          </span>
                          <span className="text-xs font-medium text-[#004ac6]">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-[#e2e7ff] rounded-full h-1.5">
                          <div
                            className="bg-[#004ac6] h-1.5 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}

              {/* Empty Slot */}
              {isMentor && activeCount < 4 && (
                <div className="bg-[#faf8ff] border border-dashed border-[#c3c6d7] rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center h-full min-h-[120px]">
                  <UserPlus className="h-6 w-6 text-[#737686]" />
                  <span className="text-xs font-medium text-[#434655]">
                    {4 - activeCount} Vaga{4 - activeCount > 1 ? "s" : ""} Disponive{4 - activeCount > 1 ? "is" : "l"}
                  </span>
                </div>
              )}
            </div>

            {/* Sent connections (for mentees) */}
            {!isMentor && (
              <div className="space-y-3 mt-4">
                {sentConnections
                  .filter((c) => c.status !== "ACCEPTED")
                  .map((conn) => {
                    const config = statusConfig[conn.status] || statusConfig.PENDING
                    return (
                      <div
                        key={conn.id}
                        className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#b4c5ff] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={conn.mentor.image}
                            name={conn.mentor.name}
                            size="md"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold tracking-[0.05em] text-[#131b2e]">
                                {conn.mentor.name}
                              </p>
                              <Badge variant={config.variant}>
                                {config.label}
                              </Badge>
                            </div>
                            {conn.mentor.headline && (
                              <p className="text-sm text-[#434655] mt-0.5">
                                {conn.mentor.headline}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-[#434655]">
                              {formatDate(conn.createdAt)}
                            </p>
                          </div>
                        </div>

                        {conn.status === "PENDING" && (
                          <button
                            onClick={() => handleRequest(conn.id, "CANCELLED")}
                            disabled={updatingId === conn.id}
                            className="flex items-center gap-1 bg-white border border-[#E2E8F0] text-[#434655] px-4 py-2 rounded-lg text-sm font-semibold tracking-[0.05em] hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                          >
                            <Ban className="h-4 w-4" />
                            Cancelar
                          </button>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Waitlist Panel */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sticky top-24 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl leading-7 font-semibold text-[#131b2e]">
                  Fila de Espera
                </h2>
              </div>
              {isMentor && (
                <span className="text-xs font-medium bg-[#eaedff] text-[#434655] px-2 py-1 rounded-md">
                  Ordenado por chegada
                </span>
              )}
            </div>
            <div className="space-y-3">
              {isMentor ? (
                <>
                  {waitlistEntries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="bg-[#faf8ff] rounded-r-xl p-3 flex flex-col gap-1"
                      style={{
                        borderLeftWidth: index === 0 ? "4px" : "2px",
                        borderLeftStyle: "solid",
                        borderLeftColor: index === 0 ? "#F59E0B" : "#c3c6d7",
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={entry.mentee.image}
                            name={entry.mentee.name}
                            size="sm"
                          />
                          <div>
                            <h3 className="text-sm font-semibold tracking-[0.05em] text-[#131b2e]">
                              {entry.mentee.name}
                            </h3>
                            {entry.mentee.headline && (
                              <p className="text-xs text-[#434655]">
                                {entry.mentee.headline}
                              </p>
                            )}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium shrink-0 ${
                            index === 0
                              ? "text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded"
                              : "text-[#434655]"
                          }`}
                        >
                          {entry.position}o
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-medium text-[#c3c6d7] flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Aguardando ha{" "}
                          {Math.max(
                            1,
                            Math.floor(
                              (Date.now() - new Date(entry.createdAt).getTime()) /
                                86400000
                            )
                          )}{" "}
                          dias
                        </span>
                        <button
                          onClick={() => handleRemoveFromWaitlist(entry.id)}
                          disabled={removingWaitlistId === entry.id}
                          className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                          {removingWaitlistId === entry.id ? "..." : "Remover"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {waitlistEntries.length === 0 && (
                    <p className="text-sm text-[#434655] text-center py-4">
                      Nenhum mentorado na fila de espera.
                    </p>
                  )}
                </>
              ) : (
                <>
                  {waitlistEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-[#faf8ff] rounded-xl p-3 flex flex-col gap-1 border border-[#E2E8F0]"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar
                            src={entry.mentor.image}
                            name={entry.mentor.name}
                            size="sm"
                          />
                          <div>
                            <h3 className="text-sm font-semibold tracking-[0.05em] text-[#131b2e]">
                              {entry.mentor.name}
                            </h3>
                            {entry.mentor.headline && (
                              <p className="text-xs text-[#434655]">
                                {entry.mentor.headline}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded shrink-0">
                          {entry.position}o na fila
                        </span>
                      </div>
                    </div>
                  ))}
                  {waitlistEntries.length === 0 && (
                    <p className="text-sm text-[#434655] text-center py-4">
                      Voce nao esta em nenhuma fila de espera.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
