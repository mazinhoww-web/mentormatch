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
  COMPLETED: { label: "Concluída", variant: "secondary" },
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
      console.error("Erro ao carregar solicitações:", error)
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
      console.error("Erro ao atualizar solicitação:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return <Loading text="Carregando solicitações..." />
  }

  const isMentor = userRole === "MENTOR"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Solicitações</h1>
        <p className="text-muted-foreground">
          Gerencie suas solicitações de mentoria.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList>
          {isMentor && (
            <TabsTrigger value="received">
              <Inbox className="mr-1.5 h-4 w-4" />
              Recebidas
              {receivedConnections.filter((c) => c.status === "PENDING").length >
                0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium text-primary-foreground">
                  {
                    receivedConnections.filter((c) => c.status === "PENDING")
                      .length
                  }
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
                title="Nenhuma solicitação recebida"
                description="Você ainda não recebeu solicitações de mentoria."
              />
            ) : (
              <div className="space-y-4 mt-4">
                {receivedConnections.map((conn) => {
                  const config = statusConfig[conn.status] || statusConfig.PENDING
                  return (
                    <Card key={conn.id}>
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar
                              src={conn.mentee.image}
                              name={conn.mentee.name}
                              size="md"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium">
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
                                <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                                  &ldquo;{conn.message}&rdquo;
                                </p>
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
                              >
                                <Check className="h-3 w-3" />
                                Aceitar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
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
              title="Nenhuma solicitação enviada"
              description="Você ainda não enviou solicitações de mentoria."
            />
          ) : (
            <div className="space-y-4 mt-4">
              {sentConnections.map((conn) => {
                const config = statusConfig[conn.status] || statusConfig.PENDING
                return (
                  <Card key={conn.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={conn.mentor.image}
                            name={conn.mentor.name}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">
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
                              <p className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
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
