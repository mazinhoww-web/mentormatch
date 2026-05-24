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
  _count: {
    mentorConns: number
    menteeConns: number
  }
}

type TabValue = "all" | "pending" | "approved" | "suspended"

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

export default function AdminUsersPage() {
  const params = useParams<{ slug: string }>()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<TabValue>("all")
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
      console.error("Erro ao buscar usuários:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    let result = users

    // Filter by tab status
    if (activeTab === "pending") {
      result = result.filter((u) => u.status === "PENDING")
    } else if (activeTab === "approved") {
      result = result.filter((u) => u.status === "APPROVED")
    } else if (activeTab === "suspended") {
      result = result.filter((u) => u.status === "SUSPENDED")
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

  const counts = useMemo(() => {
    return {
      all: users.length,
      pending: users.filter((u) => u.status === "PENDING").length,
      approved: users.filter((u) => u.status === "APPROVED").length,
      suspended: users.filter((u) => u.status === "SUSPENDED").length,
    }
  }, [users])

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
      console.error("Erro ao atualizar usuário:", error)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <Loading text="Carregando usuários..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie os usuários da sua organização
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">
            Todos ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pendentes ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovados ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="suspended">
            Suspensos ({counts.suspended})
          </TabsTrigger>
        </TabsList>

        {/* All tabs share the same content layout */}
        {(["all", "pending", "approved", "suspended"] as TabValue[]).map((tab) => (
          <TabsContent key={tab} value={tab}>
            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum usuário encontrado"
                description={
                  search
                    ? "Tente ajustar sua busca"
                    : "Ainda não há usuários nesta categoria"
                }
              />
            ) : (
              <div className="rounded-lg border">
                {/* Table header */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <div>Usuário</div>
                  <div className="w-24 text-center">Função</div>
                  <div className="w-24 text-center">Status</div>
                  <div className="w-28 text-center">Membro desde</div>
                  <div className="w-48 text-right">Ações</div>
                </div>

                {/* User rows */}
                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-3 px-4 py-4 hover:bg-muted/30 transition-colors cursor-pointer sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4"
                      onClick={() => setSelectedUser(user)}
                    >
                      {/* User info */}
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.image}
                          name={user.name}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="w-24 text-center">
                        <Badge variant="outline">{roleLabels[user.role]}</Badge>
                      </div>

                      {/* Status */}
                      <div className="w-24 text-center">
                        <Badge variant={statusBadgeVariant[user.status]}>
                          {statusLabels[user.status]}
                        </Badge>
                      </div>

                      {/* Date */}
                      <div className="w-28 text-center text-xs text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </div>

                      {/* Actions */}
                      <div
                        className="flex items-center justify-end gap-2 w-48"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              disabled={actionLoading === user.id}
                              onClick={() => handleUpdateStatus(user.id, "APPROVED")}
                            >
                              <UserCheck className="h-4 w-4" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={actionLoading === user.id}
                              onClick={() => handleUpdateStatus(user.id, "REJECTED")}
                            >
                              <UserX className="h-4 w-4" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {user.status === "APPROVED" && user.role !== "ADMIN" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading === user.id}
                            onClick={() => handleUpdateStatus(user.id, "SUSPENDED")}
                          >
                            <ShieldAlert className="h-4 w-4" />
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
                            <UserCheck className="h-4 w-4" />
                            Reativar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
              <DialogTitle>Detalhes do Usuário</DialogTitle>
              <DialogDescription>
                Informações completas do usuário selecionado
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
                  <Badge variant="outline">{roleLabels[selectedUser.role]}</Badge>
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
                    className="bg-green-600 hover:bg-green-700 text-white"
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
                    Rejeitar
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
