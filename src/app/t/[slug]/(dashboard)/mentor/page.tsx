"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  Users,
  ClipboardList,
  CalendarCheck,
  UserCheck,
  MessageCircle,
  Check,
  X,
  Bell,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { EmptyState } from "@/components/ui/empty-state"
import { Loading } from "@/components/ui/loading"
import { formatDate } from "@/lib/utils"

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

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

interface Stats {
  activeMentees: number
  pendingRequests: number
  availableSlots: number
  totalSessions: number
}

export default function MentorDashboardPage() {
  const params = useParams()
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
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [connectionsRes, pendingRes, notificationsRes] = await Promise.all([
        fetch("/api/connections?status=ACCEPTED"),
        fetch("/api/connections?status=PENDING"),
        fetch("/api/notifications"),
      ])

      const active: Connection[] = await connectionsRes.json()
      const pending: Connection[] = await pendingRes.json()
      const notifs: Notification[] = await notificationsRes.json()

      setActiveConnections(active)
      setPendingConnections(pending)
      setNotifications(notifs.slice(0, 5))

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
      console.error("Erro ao atualizar solicitação:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  function openWhatsApp(phone?: string | null) {
    if (!phone) return
    const cleaned = phone.replace(/\D/g, "")
    window.open(`https://wa.me/${cleaned}`, "_blank")
  }

  if (loading) {
    return <Loading text="Carregando dashboard..." />
  }

  const statCards = [
    { label: "Mentorados Ativos", value: stats.activeMentees, icon: Users, color: "text-blue-600 bg-blue-100" },
    { label: "Solicitações Pendentes", value: stats.pendingRequests, icon: ClipboardList, color: "text-yellow-600 bg-yellow-100" },
    { label: "Vagas Disponíveis", value: stats.availableSlots, icon: UserCheck, color: "text-green-600 bg-green-100" },
    { label: "Total de Sessões", value: stats.totalSessions, icon: CalendarCheck, color: "text-purple-600 bg-purple-100" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard do Mentor</h1>
        <p className="text-muted-foreground">
          Acompanhe seus mentorados e solicitações.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Mentees */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mentorados Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              {activeConnections.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Nenhum mentorado ativo"
                  description="Você ainda não possui mentorados. Aguarde solicitações de mentoria."
                />
              ) : (
                <div className="space-y-4">
                  {activeConnections.map((conn) => (
                    <div
                      key={conn.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={conn.mentee.image}
                          name={conn.mentee.name}
                          size="md"
                        />
                        <div>
                          <p className="font-medium">{conn.mentee.name}</p>
                          {conn.mentee.skills.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {conn.mentee.skills
                                .map((s) => s.skill.name)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openWhatsApp(conn.mentee.whatsapp)}
                        disabled={!conn.mentee.whatsapp}
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Pending + Notifications */}
        <div className="space-y-6">
          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Solicitações Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingConnections.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma solicitação pendente.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingConnections.slice(0, 5).map((conn) => (
                    <div
                      key={conn.id}
                      className="rounded-lg border p-3 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={conn.mentee.image}
                          name={conn.mentee.name}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {conn.mentee.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(conn.createdAt)}
                          </p>
                        </div>
                      </div>
                      {conn.message && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {conn.message}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRequest(conn.id, "ACCEPTED")}
                          disabled={updatingId === conn.id}
                        >
                          <Check className="h-3 w-3" />
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleRequest(conn.id, "REJECTED")}
                          disabled={updatingId === conn.id}
                        >
                          <X className="h-3 w-3" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notificações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação.
                </p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Bell className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="font-medium leading-tight">
                          {notif.title}
                          {!notif.read && (
                            <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
