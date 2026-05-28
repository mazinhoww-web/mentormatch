"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Users,
  Clock,
  Star,
  BookOpen,
  Calendar,
  AlertCircle,
  ArrowRight,
  Check,
  X,
  UserPlus,
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
        fetch("/mentormatch/api/connections?status=ACCEPTED"),
        fetch("/mentormatch/api/connections?status=PENDING"),
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
      const res = await fetch("/mentormatch/api/connections", {
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

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#131b2e]">
          Visao Geral
        </h2>
        <p className="text-base leading-6 text-[#434655]">
          Acompanhe seu impacto e gerencie suas mentorias.
        </p>
      </div>

      {/* Bento Grid: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total de Mentorados */}
        <div className="bg-blue-600/5 rounded-xl p-4 border border-[#004ac6]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold tracking-[0.05em] text-[#004ac6]">
              Total de Mentorados
            </span>
            <div className="p-2 bg-[#004ac6] text-white rounded-lg">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#131b2e]">
              {stats.activeMentees}
            </span>
          </div>
        </div>

        {/* Horas de Mentoria */}
        <div className="bg-[#d0e1fb]/20 rounded-xl p-4 border border-[#505f76]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold tracking-[0.05em] text-[#505f76]">
              Horas de Mentoria
            </span>
            <div className="p-2 bg-[#505f76] text-white rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#131b2e]">
              0h
            </span>
          </div>
        </div>

        {/* Nota Media */}
        <div className="bg-[#ffb596]/10 rounded-xl p-4 border border-[#943700]/20 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-sm font-semibold tracking-[0.05em] text-[#943700]">
              Nota Media
            </span>
            <div className="p-2 bg-[#943700] text-white rounded-lg">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#131b2e]">
              {stats.activeMentees > 0 ? "--" : "0"}
            </span>
            <span className="text-xs font-medium text-[#434655]">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Mentees */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-end border-b border-[#E2E8F0] pb-2">
            <h3 className="text-xl leading-7 font-semibold text-[#131b2e]">
              Meus Mentorados Ativos
            </h3>
            <span className="text-xs font-medium text-[#434655] bg-[#e2e7ff] px-3 py-1 rounded-full">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeConnections.map((conn) => (
                <div
                  key={conn.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col gap-3 hover:border-[#004ac6] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={conn.mentee.image}
                      name={conn.mentee.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold tracking-[0.05em] text-[#131b2e] group-hover:text-[#004ac6] transition-colors">
                        {conn.mentee.name}
                      </h4>
                      {conn.mentee.skills.length > 0 && (
                        <p className="text-xs font-medium text-[#434655]">
                          {conn.mentee.skills.map((s) => s.skill.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                      Ativo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pending & Shortcuts */}
        <div className="flex flex-col gap-8">
          {/* Pending Requests Highlight */}
          {pendingConnections.length > 0 && (
            <div className="bg-[#bc4800] text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl leading-7 font-semibold">Novas Solicitacoes</h3>
                </div>
                <p className="text-base">
                  Existem <strong>{pendingConnections.length} nova{pendingConnections.length > 1 ? "s" : ""} pessoa{pendingConnections.length > 1 ? "s" : ""}</strong> interessada{pendingConnections.length > 1 ? "s" : ""} em sua mentoria.
                </p>
                <button
                  onClick={() => router.push(`/t/${slug}/requests`)}
                  className="w-full py-3 px-4 bg-white text-[#943700] font-bold rounded-lg hover:bg-[#faf8ff] transition-all active:scale-95 shadow-md"
                >
                  Analisar Solicitacoes
                </button>
              </div>
              <UserPlus className="absolute -right-4 -bottom-4 h-20 w-20 text-white/10 rotate-12" />
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl leading-7 font-semibold text-[#131b2e] border-b border-[#E2E8F0] pb-2">
              Acesso Rapido
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => router.push(`/t/${slug}/library`)}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-[#eaedff] rounded-xl border border-transparent hover:border-[#004ac6]/30 hover:bg-white transition-all group shadow-sm"
              >
                <div className="p-3 bg-[#004ac6]/10 text-[#004ac6] rounded-full group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold tracking-[0.05em] text-[#131b2e]">
                  Biblioteca
                </span>
              </button>
              <button
                onClick={() => router.push(`/t/${slug}/notifications`)}
                className="flex flex-col items-center justify-center gap-3 p-6 bg-[#eaedff] rounded-xl border border-transparent hover:border-[#004ac6]/30 hover:bg-white transition-all group shadow-sm"
              >
                <div className="p-3 bg-[#004ac6]/10 text-[#004ac6] rounded-full group-hover:bg-[#004ac6] group-hover:text-white transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold tracking-[0.05em] text-[#131b2e]">
                  Agenda
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
