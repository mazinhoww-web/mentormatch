"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  Mail,
  Calendar,
  Clock,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Loading } from "@/components/ui/loading"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  image: string | null
  role: "MENTOR" | "MENTEE" | "ADMIN"
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
  headline: string | null
  createdAt: string
  skills?: { id: string; skill: { id: string; name: string } }[]
  _count: {
    mentorConns: number
    menteeConns: number
  }
}

type TabValue = "mentors" | "mentees"

const statusBadgeVariant: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  SUSPENDED: "secondary",
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  SUSPENDED: "Suspenso",
}

const roleLabels: Record<string, string> = {
  MENTOR: "Mentor",
  MENTEE: "Mentorado",
  ADMIN: "Admin",
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `Ha ${diffMins} minuto${diffMins !== 1 ? "s" : ""}`
  if (diffHours < 24) return `Ha ${diffHours} hora${diffHours !== 1 ? "s" : ""}`
  if (diffDays < 30) return `Ha ${diffDays} dia${diffDays !== 1 ? "s" : ""}`
  return formatDate(dateStr)
}

export default function AdminUsersPage() {
  const params = useParams<{ slug: string }>()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<TabValue>("mentors")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Erro ao buscar usuarios:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const pendingCount = useMemo(() => users.filter((u) => u.status === "PENDING").length, [users])
  const approvedToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return users.filter((u) => u.status === "APPROVED" && u.createdAt.slice(0, 10) === today).length
  }, [users])
  const totalActive = useMemo(() => users.filter((u) => u.status === "APPROVED").length, [users])

  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => u.status === "PENDING")

    // Filter by tab role
    if (activeTab === "mentors") {
      result = result.filter((u) => u.role === "MENTOR")
    } else {
      result = result.filter((u) => u.role === "MENTEE")
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    }

    return result
  }, [users, activeTab, search])

  async function handleUpdateStatus(userId: string, status: "APPROVED" | "REJECTED" | "SUSPENDED") {
    setActionLoading(userId)
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      })

      if (res.ok) {
        const updated = await res.json()
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? { ...u, status: updated.status } : u))
        )
        if (selectedUser?.id === updated.id) {
          setSelectedUser((prev) => (prev ? { ...prev, status: updated.status } : null))
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar usuario:", error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <Loading text="Carregando usuarios..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Aprovacao de Usuarios</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie as solicitacoes de acesso a plataforma.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2.5">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-xs text-muted-foreground">usuarios</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2.5">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{approvedToday}</p>
              <p className="text-xs text-muted-foreground">Aprovados hoje</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2.5">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{totalActive}</p>
              <p className="text-xs text-muted-foreground">Total de usuarios</p>
              <p className="text-xs text-muted-foreground">ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Mentores / Mentorados */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="bg-muted/50 border border-border">
          <TabsTrigger value="mentors">Mentores</TabsTrigger>
          <TabsTrigger value="mentees">Mentorados</TabsTrigger>
        </TabsList>

        {/* Search */}
        <div className="relative max-w-md mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/50 border-border/50"
          />
        </div>

        {/* User cards - shared for both tabs */}
        {(["mentors", "mentees"] as TabValue[]).map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum usuario encontrado"
                description={
                  search
                    ? "Tente ajustar sua busca"
                    : "Nao ha usuarios pendentes nesta categoria"
                }
              />
            ) : (
              <div className="space-y-3 mt-4">
                {filteredUsers.map((user) => {
                  const borderColor =
                    user.role === "MENTOR"
                      ? "border-l-blue-500"
                      : "border-l-purple-500"

                  return (
                    <div
                      key={user.id}
                      className={`rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 sm:p-5 border-l-4 ${borderColor} hover:bg-card/80 transition-colors`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        {/* User info */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar
                            src={user.image}
                            name={user.name}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground">
                                {user.name}
                              </p>
                              <Badge
                                className={
                                  user.role === "MENTOR"
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                }
                              >
                                {roleLabels[user.role]}
                              </Badge>
                            </div>
                            {user.headline && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                Cargo: {user.headline}
                              </p>
                            )}
                            {/* Skill badges */}
                            {user.skills && user.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {user.skills.slice(0, 4).map((s) => (
                                  <span
                                    key={s.id}
                                    className="inline-flex items-center rounded-md bg-muted/50 border border-border/50 px-2 py-0.5 text-xs text-muted-foreground"
                                  >
                                    {s.skill.name}
                                  </span>
                                ))}
                                {user.skills.length > 4 && (
                                  <span className="inline-flex items-center rounded-md bg-muted/50 border border-border/50 px-2 py-0.5 text-xs text-muted-foreground">
                                    +{user.skills.length - 4}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="mt-2 text-xs text-muted-foreground">
                              {timeAgo(user.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-border/50"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Ver Detalhes
                          </Button>
                          {user.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                                disabled={actionLoading === user.id}
                                onClick={() => handleUpdateStatus(user.id, "REJECTED")}
                              >
                                <UserX className="h-3.5 w-3.5" />
                                Reprovar
                              </Button>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={actionLoading === user.id}
                                onClick={() => handleUpdateStatus(user.id, "APPROVED")}
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Aprovar
                              </Button>
                            </>
                          )}
                          {user.status === "APPROVED" && user.role !== "ADMIN" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-border/50"
                              disabled={actionLoading === user.id}
                              onClick={() => handleUpdateStatus(user.id, "SUSPENDED")}
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                              Suspender
                            </Button>
                          )}
                          {user.status === "SUSPENDED" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={actionLoading === user.id}
                              onClick={() => handleUpdateStatus(user.id, "APPROVED")}
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                              Reativar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        {selectedUser && (
          <>
            <DialogHeader>
              <DialogTitle>Detalhes do Usuario</DialogTitle>
              <DialogDescription>
                Informacoes completas do usuario selecionado
              </DialogDescription>
            </DialogHeader>
            <DialogContent>
              <div className="flex flex-col items-center gap-4">
                <Avatar
                  src={selectedUser.image}
                  name={selectedUser.name}
                  size="xl"
                />
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                  {selectedUser.headline && (
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.headline}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Membro desde {formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={
                      selectedUser.role === "MENTOR"
                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    }
                  >
                    {roleLabels[selectedUser.role]}
                  </Badge>
                  <Badge variant={statusBadgeVariant[selectedUser.status]}>
                    {statusLabels[selectedUser.status]}
                  </Badge>
                </div>

                {selectedUser.role === "MENTOR" && (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p>
                      <span className="font-medium">Mentorados ativos:</span>{" "}
                      {selectedUser._count.mentorConns}
                    </p>
                  </div>
                )}
                {selectedUser.role === "MENTEE" && (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p>
                      <span className="font-medium">Mentores conectados:</span>{" "}
                      {selectedUser._count.menteeConns}
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogFooter>
              {selectedUser.status === "PENDING" && (
                <>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={actionLoading === selectedUser.id}
                    onClick={() => handleUpdateStatus(selectedUser.id, "APPROVED")}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={actionLoading === selectedUser.id}
                    onClick={() => handleUpdateStatus(selectedUser.id, "REJECTED")}
                  >
                    Reprovar
                  </Button>
                </>
              )}
              {selectedUser.status === "APPROVED" && selectedUser.role !== "ADMIN" && (
                <Button
                  variant="outline"
                  disabled={actionLoading === selectedUser.id}
                  onClick={() => handleUpdateStatus(selectedUser.id, "SUSPENDED")}
                >
                  Suspender
                </Button>
              )}
              {selectedUser.status === "SUSPENDED" && (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={actionLoading === selectedUser.id}
                  onClick={() => handleUpdateStatus(selectedUser.id, "APPROVED")}
                >
                  Reativar
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  )
}
