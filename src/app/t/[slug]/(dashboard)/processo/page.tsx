"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Phone,
  Ban,
  CalendarDays,
  History,
  Loader2,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Loading } from "@/components/ui/loading"
import { formatDate } from "@/lib/utils"

interface Skill {
  id: string
  skill: { id: string; name: string }
}

interface UserInfo {
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
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"
  message: string | null
  createdAt: string
  startedAt: string | null
  endedAt: string | null
  mentor: UserInfo
  mentee: UserInfo
}

type TabValue = "ativos" | "pendentes" | "historico"

function daysAgo(dateStr: string): number {
  const now = new Date()
  const date = new Date(dateStr)
  return Math.floor((now.getTime() - date.getTime()) / 86400000)
}

export default function ProcessoPage() {
  const params = useParams<{ slug: string }>()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabValue>("ativos")
  const [userRole, setUserRole] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [confirmEndId, setConfirmEndId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const [connectionsRes, sessionRes] = await Promise.all([
        fetch("/api/connections"),
        fetch("/api/auth/session"),
      ])

      const conns: Connection[] = await connectionsRes.json()
      const session = await sessionRes.json()
      setUserRole(session?.user?.role || "MENTEE")
      setUserId(session?.user?.id || "")
      setConnections(conns)
    } catch (error) {
      console.error("Erro ao carregar conexoes:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleUpdateStatus(
    connectionId: string,
    status: "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"
  ) {
    setUpdatingId(connectionId)
    try {
      const res = await fetch("/api/connections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status }),
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Erro ao atualizar conexao:", error)
    } finally {
      setUpdatingId(null)
      setConfirmEndId(null)
    }
  }

  if (loading) {
    return <Loading text="Carregando conexoes..." />
  }

  const isMentor = userRole === "MENTOR"

  const activeConnections = connections.filter((c) => c.status === "ACCEPTED")
  const pendingConnections = connections.filter((c) => c.status === "PENDING")
  const historyConnections = connections.filter(
    (c) => c.status === "COMPLETED" || c.status === "CANCELLED" || c.status === "REJECTED"
  )

  function getOtherPerson(conn: Connection): UserInfo {
    return isMentor ? conn.mentee : conn.mentor
  }

  function getWhatsAppLink(person: UserInfo): string | null {
    if (!person.whatsapp) return null
    const phone = person.whatsapp.replace(/\D/g, "")
    return `https://wa.me/${phone}`
  }

  const tabs: { value: TabValue; label: string; count: number }[] = [
    { value: "ativos", label: "Ativos", count: activeConnections.length },
    { value: "pendentes", label: "Pendentes", count: pendingConnections.length },
    { value: "historico", label: "Historico", count: historyConnections.length },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-[28px] md:text-[36px] leading-[34px] md:leading-[44px] font-bold tracking-[-0.02em] text-[#131b2e]">
          Minhas Conexoes
        </h1>
        <p className="text-base leading-6 text-[#434655] mt-1">
          Gerencie suas mentorias ativas e historico.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full md:w-auto">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2 ${
              tab === t.value
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.value
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ativos Tab */}
      {tab === "ativos" && (
        <div>
          {activeConnections.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhuma mentoria ativa"
              description="Voce nao possui conexoes de mentoria ativas no momento."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeConnections.map((conn) => {
                const person = getOtherPerson(conn)
                const whatsappLink = getWhatsAppLink(person)
                const days = daysAgo(conn.createdAt)

                return (
                  <div
                    key={conn.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 hover:border-blue-300 transition-colors"
                  >
                    {/* Person info */}
                    <div className="flex items-start gap-3">
                      <Avatar
                        src={person.image}
                        name={person.name || ""}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold tracking-wide text-slate-900 truncate">
                          {person.name}
                        </h3>
                        {person.headline && (
                          <p className="text-sm text-slate-500 truncate">
                            {person.headline}
                          </p>
                        )}
                        {person.skills && person.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {person.skills.slice(0, 3).map((s) => (
                              <span
                                key={s.id}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                              >
                                {s.skill.name}
                              </span>
                            ))}
                            {person.skills.length > 3 && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                                +{person.skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meeting info */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>
                        {days === 0
                          ? "Conectado hoje"
                          : days === 1
                            ? "Ultima reuniao: 1 dia atras"
                            : `Ultima reuniao: ${days} dias atras`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100">
                      {whatsappLink && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                          WhatsApp
                        </a>
                      )}
                      {confirmEndId === conn.id ? (
                        <div className="flex-1 flex gap-2">
                          <button
                            onClick={() => handleUpdateStatus(conn.id, "COMPLETED")}
                            disabled={updatingId === conn.id}
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                          >
                            {updatingId === conn.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Confirmar"
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmEndId(null)}
                            className="flex-1 flex items-center justify-center py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmEndId(conn.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                          Encerrar Mentoria
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Pendentes Tab */}
      {tab === "pendentes" && (
        <div>
          {pendingConnections.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Nenhuma solicitacao pendente"
              description="Nao ha solicitacoes de mentoria pendentes."
            />
          ) : (
            <div className="space-y-3">
              {pendingConnections.map((conn) => {
                const person = getOtherPerson(conn)

                return (
                  <div
                    key={conn.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={person.image}
                        name={person.name || ""}
                        size="md"
                      />
                      <div>
                        <h3 className="text-sm font-semibold tracking-wide text-slate-900">
                          {person.name}
                        </h3>
                        {person.headline && (
                          <p className="text-sm text-slate-500">
                            {person.headline}
                          </p>
                        )}
                        {person.skills && person.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {person.skills.slice(0, 3).map((s) => (
                              <span
                                key={s.id}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                              >
                                {s.skill.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          Solicitado em {formatDate(conn.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {isMentor ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(conn.id, "REJECTED")}
                            disabled={updatingId === conn.id}
                            className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                          >
                            <XCircle className="h-4 w-4" />
                            Recusar
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(conn.id, "ACCEPTED")}
                            disabled={updatingId === conn.id}
                            className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                          >
                            {updatingId === conn.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            Aceitar
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                            <Clock className="h-4 w-4" />
                            Aguardando resposta...
                          </span>
                          <button
                            onClick={() => handleUpdateStatus(conn.id, "CANCELLED")}
                            disabled={updatingId === conn.id}
                            className="flex items-center gap-1 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
                          >
                            <Ban className="h-4 w-4" />
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Historico Tab */}
      {tab === "historico" && (
        <div>
          {historyConnections.length === 0 ? (
            <EmptyState
              icon={History}
              title="Nenhum historico"
              description="Seu historico de mentorias aparecera aqui."
            />
          ) : (
            <div className="space-y-3">
              {historyConnections.map((conn) => {
                const person = getOtherPerson(conn)
                const statusConfig: Record<
                  string,
                  { label: string; className: string }
                > = {
                  COMPLETED: {
                    label: "Concluida",
                    className: "bg-slate-100 text-slate-600",
                  },
                  CANCELLED: {
                    label: "Cancelada",
                    className: "bg-red-50 text-red-600",
                  },
                  REJECTED: {
                    label: "Recusada",
                    className: "bg-red-50 text-red-600",
                  },
                }
                const config = statusConfig[conn.status] || statusConfig.COMPLETED

                return (
                  <div
                    key={conn.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar
                        src={person.image}
                        name={person.name || ""}
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold tracking-wide text-slate-700">
                            {person.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
                          >
                            {config.label}
                          </span>
                        </div>
                        {person.headline && (
                          <p className="text-sm text-slate-400">
                            {person.headline}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(conn.createdAt)}
                          {conn.endedAt && ` - ${formatDate(conn.endedAt)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
