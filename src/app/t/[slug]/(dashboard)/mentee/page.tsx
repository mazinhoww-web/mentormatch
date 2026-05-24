"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  UserCheck,
  ClipboardList,
  BookOpen,
  MessageCircle,
  Bell,
  Search,
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

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

interface LibraryItem {
  id: string
  title: string
  description?: string | null
  fileType: string
  fileUrl: string
  createdAt: string
}

interface Stats {
  currentMentor: boolean
  sentRequests: number
  availableMaterials: number
}

export default function MenteeDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    currentMentor: false,
    sentRequests: 0,
    availableMaterials: 0,
  })
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null)
  const [pendingConnections, setPendingConnections] = useState<Connection[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [materials, setMaterials] = useState<LibraryItem[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [connectionsRes, pendingRes, notificationsRes, libraryRes] =
        await Promise.all([
          fetch("/api/connections?status=ACCEPTED"),
          fetch("/api/connections?status=PENDING"),
          fetch("/api/notifications"),
          fetch(`/api/library?tenantId=${encodeURIComponent(slug)}`),
        ])

      const active: Connection[] = await connectionsRes.json()
      const pending: Connection[] = await pendingRes.json()
      const notifs: Notification[] = await notificationsRes.json()

      let items: LibraryItem[] = []
      try {
        const libData = await libraryRes.json()
        items = Array.isArray(libData) ? libData : []
      } catch {
        items = []
      }

      const mentorConnection = active.length > 0 ? active[0] : null

      setActiveConnection(mentorConnection)
      setPendingConnections(pending)
      setNotifications(notifs.slice(0, 5))
      setMaterials(items.slice(0, 4))

      setStats({
        currentMentor: !!mentorConnection,
        sentRequests: pending.length,
        availableMaterials: items.length,
      })
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
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
    {
      label: "Mentor Atual",
      value: stats.currentMentor ? "Ativo" : "Nenhum",
      icon: UserCheck,
      color: stats.currentMentor
        ? "text-green-600 bg-green-100"
        : "text-gray-600 bg-gray-100",
    },
    {
      label: "Solicitações Enviadas",
      value: stats.sentRequests,
      icon: ClipboardList,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      label: "Materiais Disponíveis",
      value: stats.availableMaterials,
      icon: BookOpen,
      color: "text-blue-600 bg-blue-100",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard do Mentorado
        </h1>
        <p className="text-muted-foreground">
          Acompanhe sua mentoria e materiais disponíveis.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        {/* Mentor Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seu Mentor</CardTitle>
            </CardHeader>
            <CardContent>
              {activeConnection ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={activeConnection.mentor.image}
                      name={activeConnection.mentor.name}
                      size="lg"
                    />
                    <div>
                      <p className="text-lg font-semibold">
                        {activeConnection.mentor.name}
                      </p>
                      {activeConnection.mentor.headline && (
                        <p className="text-sm text-muted-foreground">
                          {activeConnection.mentor.headline}
                        </p>
                      )}
                      {activeConnection.mentor.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {activeConnection.mentor.skills.map((s) => (
                            <Badge key={s.id} variant="secondary">
                              {s.skill.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      openWhatsApp(activeConnection.mentor.whatsapp)
                    }
                    disabled={!activeConnection.mentor.whatsapp}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </div>
              ) : (
                <EmptyState
                  icon={UserCheck}
                  title="Nenhum mentor ativo"
                  description="Você ainda não possui um mentor. Busque mentores disponíveis e envie uma solicitação."
                  action={
                    <Button
                      onClick={() => router.push(`/t/${slug}/mentors`)}
                    >
                      <Search className="h-4 w-4" />
                      Buscar Mentores
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Recommended Materials */}
          {materials.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Materiais Recomendados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {materials.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() =>
                        router.push(`/t/${slug}/library/${item.id}`)
                      }
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {item.title}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.fileType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/t/${slug}/library`)}
                  >
                    Ver todos os materiais
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Pending Requests + Notifications */}
        <div className="space-y-6">
          {/* Pending Requests */}
          {pendingConnections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Solicitações Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingConnections.slice(0, 5).map((conn) => (
                    <div
                      key={conn.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Avatar
                        src={conn.mentor.image}
                        name={conn.mentor.name}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conn.mentor.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(conn.createdAt)}
                        </p>
                      </div>
                      <Badge variant="warning">Pendente</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
