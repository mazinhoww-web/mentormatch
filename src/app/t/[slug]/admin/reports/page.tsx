"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Users,
  UserCheck,
  GraduationCap,
  Link2,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { EmptyState } from "@/components/ui/empty-state"
import { formatDate } from "@/lib/utils"

interface ReportData {
  totalUsers: number
  totalMentors: number
  totalMentees: number
  activeConnections: number
  pendingUsers: number
  totalConnections: number
  pendingConnections: number
  rejectedConnections: number
  completedConnections: number
  totalWaitlistEntries: number
  totalLibraryItems: number
  connectionsByMonth: Record<string, number>
  topSkills: { skill: string; count: number }[]
}

interface RecentConnection {
  id: string
  status: string
  createdAt: string
  mentor: { name: string }
  mentee: { name: string }
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceita",
  REJECTED: "Rejeitada",
  COMPLETED: "Concluída",
}

const statusVariant: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
  COMPLETED: "secondary",
}

export default function AdminReportsPage() {
  const params = useParams<{ slug: string }>()
  const [data, setData] = useState<ReportData | null>(null)
  const [recentConnections, setRecentConnections] = useState<RecentConnection[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [reportsRes, connectionsRes] = await Promise.all([
        fetch("/api/admin/reports"),
        fetch("/api/connections?limit=10"),
      ])

      if (reportsRes.ok) {
        const reportData = await reportsRes.json()
        setData(reportData)
      }

      if (connectionsRes.ok) {
        const conns = await connectionsRes.json()
        setRecentConnections(Array.isArray(conns) ? conns.slice(0, 10) : [])
      }
    } catch (err) {
      console.error("Erro ao carregar relatórios:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return <Loading text="Carregando relatórios..." />
  }

  if (!data) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Erro ao carregar relatórios"
        description="Não foi possível carregar os dados. Tente novamente mais tarde."
      />
    )
  }

  const statCards = [
    {
      label: "Total Usuários",
      value: data.totalUsers,
      icon: Users,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Mentores",
      value: data.totalMentors,
      icon: UserCheck,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Mentorados",
      value: data.totalMentees,
      icon: GraduationCap,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Conexões Ativas",
      value: data.activeConnections,
      icon: Link2,
      color: "text-indigo-600 bg-indigo-100",
    },
    {
      label: "Pendentes de Aprovação",
      value: data.pendingUsers,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-100",
    },
  ]

  // Calculate mentor capacity utilization
  const maxCapacity = data.totalMentors * 4 // assuming avg 4 slots per mentor
  const utilizationPercent =
    maxCapacity > 0 ? Math.min(100, Math.round((data.activeConnections / maxCapacity) * 100)) : 0

  // Max user count for skills bar scaling
  const maxSkillCount =
    data.topSkills.length > 0 ? Math.max(...data.topSkills.map((s) => s.count)) : 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios e Análises</h1>
        <p className="text-muted-foreground">
          Visão geral da sua organização de mentoria
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Mentor Capacity Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capacidade dos Mentores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Utilização geral</span>
                  <span className="font-medium">{utilizationPercent}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      utilizationPercent > 80
                        ? "bg-red-500"
                        : utilizationPercent > 50
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${utilizationPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Conexões ativas</p>
                  <p className="text-lg font-bold">{data.activeConnections}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Capacidade total</p>
                  <p className="text-lg font-bold">{maxCapacity}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Conexões pendentes</p>
                  <p className="text-lg font-bold">{data.pendingConnections}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Conexões concluídas</p>
                  <p className="text-lg font-bold">{data.completedConnections}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills popularity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Habilidades Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topSkills.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Sem dados"
                description="Ainda não há habilidades com usuários associados"
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {data.topSkills.map((skill, index) => (
                  <div key={skill.skill} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-mono text-xs w-5">
                          {index + 1}.
                        </span>
                        <span className="font-medium">{skill.skill}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {skill.count} usuário{skill.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden ml-7">
                      <div
                        className="h-full rounded-full bg-primary/70 transition-all"
                        style={{
                          width: `${(skill.count / maxSkillCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent connections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conexões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentConnections.length === 0 ? (
            <EmptyState
              icon={Link2}
              title="Nenhuma conexão"
              description="Ainda não há conexões registradas na organização"
              className="py-8"
            />
          ) : (
            <div className="rounded-lg border">
              {/* Table header */}
              <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div>Mentor</div>
                <div>Mentorado</div>
                <div className="w-24 text-center">Status</div>
                <div className="w-28 text-right">Data</div>
              </div>

              <div className="divide-y">
                {recentConnections.map((conn) => (
                  <div
                    key={conn.id}
                    className="flex flex-col gap-2 px-4 py-3 sm:grid sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center sm:gap-4"
                  >
                    <div className="text-sm font-medium">
                      {conn.mentor?.name ?? "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {conn.mentee?.name ?? "N/A"}
                    </div>
                    <div className="w-24 text-center">
                      <Badge variant={statusVariant[conn.status] ?? "outline"}>
                        {statusLabels[conn.status] ?? conn.status}
                      </Badge>
                    </div>
                    <div className="w-28 text-right text-xs text-muted-foreground">
                      {formatDate(conn.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
