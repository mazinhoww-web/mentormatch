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

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [connectionsRes, sessionRes] = await Promise.all([
        fetch("/api/connections"),
        fetch("/api/auth/session"),
      ])

      const connections: Connection[] = await connectionsRes.json()
      const session = await sessionRes.json()
      const role = session?.user?.role || "MENTEE"
      setUserRole(role)

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Solicitacoes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie suas solicitacoes de mentoria.
          </p>
        </div>
        {pendingCount > 0 && isMentor && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-yellow-500 font-medium">
              {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList className="bg-muted/50 border border-border">
          {isMentor && (
            <TabsTrigger value="received">
              <Inbox className="mr-1.5 h-4 w-4" />
              Recebidas
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="sent">
            <Send className="mr-1.5 h-4 w-4" />
            Enviadas
          </TabsTrigger>
        </TabsList>

        {/* Received Tab */}
        {isMentor && (
          <TabsContent value="received">
            {receivedConnections.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="Nenhuma solicitacao recebida"
                description="Voce ainda nao recebeu solicitacoes de mentoria."
              />
            ) : (
              <div className="space-y-3 mt-4">
                {receivedConnections.map((conn) => {
                  const config = statusConfig[conn.status] || statusConfig.PENDING
                  return (
                    <Card key={conn.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar
                              src={conn.mentee.image}
                              name={conn.mentee.name}
                              size="md"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-foreground">
                                  {conn.mentee.name}
                                </p>
                                <Badge variant={config.variant}>
                                  {config.label}
                                </Badge>
                              </div>
                              {conn.mentee.headline && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {conn.mentee.headline}
                                </p>
                              )}
                              {conn.message && (
                                <p className="mt-2 text-sm text-muted-foreground bg-muted/30 border border-border/50 rounded-lg p-3">
                                  &ldquo;{conn.message}&rdquo;
                                </p>
                              )}
                              {conn.mentee.skills && conn.mentee.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {conn.mentee.skills.slice(0, 3).map((s) => (
                                    <span
                                      key={s.id}
                                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                                    >
                                      {s.skill.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="mt-2 text-xs text-muted-foreground">
                                {formatDate(conn.createdAt)}
                              </p>
                            </div>
                          </div>

                          {conn.status === "PENDING" && (
                            <div className="flex gap-2 shrink-0">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleRequest(conn.id, "ACCEPTED")
                                }
                                disabled={updatingId === conn.id}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Check className="h-3 w-3" />
                                Aceitar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                                onClick={() =>
                                  handleRequest(conn.id, "REJECTED")
                                }
                                disabled={updatingId === conn.id}
                              >
                                <X className="h-3 w-3" />
                                Recusar
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        )}

        {/* Sent Tab */}
        <TabsContent value="sent">
          {sentConnections.length === 0 ? (
            <EmptyState
              icon={Send}
              title="Nenhuma solicitacao enviada"
              description="Voce ainda nao enviou solicitacoes de mentoria."
            />
          ) : (
            <div className="space-y-3 mt-4">
              {sentConnections.map((conn) => {
                const config = statusConfig[conn.status] || statusConfig.PENDING
                return (
                  <Card key={conn.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={conn.mentor.image}
                            name={conn.mentor.name}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground">
                                {conn.mentor.name}
                              </p>
                              <Badge variant={config.variant}>
                                {config.label}
                              </Badge>
                            </div>
                            {conn.mentor.headline && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {conn.mentor.headline}
                              </p>
                            )}
                            {conn.message && (
                              <p className="mt-2 text-sm text-muted-foreground bg-muted/30 border border-border/50 rounded-lg p-3">
                                &ldquo;{conn.message}&rdquo;
                              </p>
                            )}
                            <p className="mt-2 text-xs text-muted-foreground">
                              {formatDate(conn.createdAt)}
                            </p>
                          </div>
                        </div>

                        {conn.status === "PENDING" && (
                          <div className="shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-border/50"
                              onClick={() =>
                                handleRequest(conn.id, "CANCELLED")
                              }
                              disabled={updatingId === conn.id}
                            >
                              <Ban className="h-3 w-3" />
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
