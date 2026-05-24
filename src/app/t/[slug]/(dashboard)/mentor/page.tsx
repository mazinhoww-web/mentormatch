"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Users,
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  Calendar,
  AlertCircle,
  ArrowRight,
  Check,
  X,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { EmptyState } from "@/components/ui/empty-state"

interface Skill {
  id: string
  skill: { id: string; name: string }
}

interface Mentee {
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
  mentee: Mentee
}

interface Stats {
  activeMentees: number
  pendingRequests: number
  availableSlots: number
  totalSessions: number
}

export default function MentorDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    activeMentees: 0,
    pendingRequests: 0,
    availableSlots: 0,
    totalSessions: 0,
  })
  const [activeConnections, setActiveConnections] = useState<Connection[]>([])
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [connectionsRes, pendingRes] = await Promise.all([
        fetch("/api/connections?status=ACCEPTED"),
        fetch("/api/connections?status=PENDING"),
      ])

      const active: Connection[] = await connectionsRes.json()
      const pending: Connection[] = await pendingRes.json()

      setActiveConnections(active)
      setPendingConnections(pending)

      setStats({
        activeMentees: active.length,
        pendingRequests: pending.length,
        availableSlots: Math.max(0, 4 - active.length),
        totalSessions: active.length + pending.length,
      })
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRequest(connectionId: string, status: "ACCEPTED" | "REJECTED") {
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
    return <Loading text="Carregando dashboard..." />
  }

  const menteeStatuses = ["EM DIA", "AGUARDANDO", "ATIVO"]
  const statusColors: Record<string, string> = {
    "EM DIA": "bg-green-500/20 text-green-400",
    AGUARDANDO: "bg-yellow-500/20 text-yellow-400",
    ATIVO: "bg-blue-500/20 text-blue-400",
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Visao Geral</h1>
        <p className="text-slate-400 mt-1">
          Acompanhe seu impacto e gerencie suas mentorias.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="space-y-3">
        {/* Total de Mentorados */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Total de Mentorados</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">{stats.activeMentees}</p>
                {stats.activeMentees > 0 && (
                  <span className="flex items-center gap-0.5 text-xs text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    +{Math.min(stats.activeMentees, 2)} este mes
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Horas de Mentoria */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20">
              <Clock className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Horas de Mentoria</p>
              <p className="text-2xl font-bold text-white">
                {stats.activeMentees * 12}h
              </p>
            </div>
          </div>
        </div>

        {/* Nota Media */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-600/20">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Nota Media</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-white">4.8</p>
                <span className="text-sm text-slate-400">/ 5.0</span>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meus Mentorados Ativos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Meus Mentorados Ativos</h2>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
            {stats.activeMentees} de 4 slots preenchidos
          </span>
        </div>

        {activeConnections.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum mentorado ativo"
            description="Voce ainda nao possui mentorados. Aguarde solicitacoes de mentoria."
          />
        ) : (
          <div className="space-y-3">
            {activeConnections.map((conn, index) => {
              const progress = [85, 60, 45, 30][index % 4]
              const status = menteeStatuses[index % menteeStatuses.length]
              const nextMeeting = ["Amanha as 14:00", "Quinta as 10:00", "Sexta as 16:00"][index % 3]

              return (
                <div
                  key={conn.id}
                  className="rounded-xl bg-slate-900 border border-slate-800 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={conn.mentee.image}
                      name={conn.mentee.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-white truncate">
                          {conn.mentee.name}
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusColors[status]}`}>
                          {status}
                        </span>
                      </div>
                      {conn.mentee.skills.length > 0 && (
                        <p className="text-sm text-slate-400 mt-0.5">
                          {conn.mentee.skills.map((s) => s.skill.name).join(", ")}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Progresso</span>
                          <span className="text-white font-medium">{progress}% Concluido</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-800">
                          <div
                            className="h-1.5 rounded-full bg-blue-600"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        Proxima reuniao: {nextMeeting}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Solicitacoes Pendentes Banner */}
      {pendingConnections.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/20">
              <AlertCircle className="h-5 w-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">Solicitacoes Pendentes</h3>
              <p className="text-sm text-slate-300">
                Voce tem {pendingConnections.length} nova{pendingConnections.length > 1 ? "s" : ""} solicitacao{pendingConnections.length > 1 ? "oes" : ""} de mentoria
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {pendingConnections.slice(0, 3).map((conn) => (
              <div key={conn.id} className="flex items-center justify-between rounded-lg bg-slate-900/50 p-3">
                <div className="flex items-center gap-2">
                  <Avatar src={conn.mentee.image} name={conn.mentee.name} size="sm" />
                  <span className="text-sm text-white truncate">{conn.mentee.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-8 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleRequest(conn.id, "ACCEPTED")}
                    disabled={updatingId === conn.id}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 border-slate-600 text-slate-300 hover:bg-slate-800"
                    onClick={() => handleRequest(conn.id, "REJECTED")}
                    disabled={updatingId === conn.id}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full mt-3 bg-orange-600 hover:bg-orange-700 text-white"
            onClick={() => router.push(`/t/${slug}/requests`)}
          >
            Analisar Solicitacoes
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Acesso Rapido */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Acesso Rapido</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/t/${slug}/library`)}
            className="flex flex-col items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-5 transition-colors hover:bg-slate-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-white">Biblioteca</span>
          </button>

          <button
            onClick={() => router.push(`/t/${slug}/notifications`)}
            className="flex flex-col items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-5 transition-colors hover:bg-slate-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600/20">
              <Calendar className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-sm font-medium text-white">Agenda</span>
          </button>
        </div>
      </div>
    </div>
  )
}
