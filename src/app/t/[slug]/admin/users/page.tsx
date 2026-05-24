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
  X,
  Download,
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

async function downloadUsersCsv() {
  const res = await fetch("/api/admin/export?type=users")
  const blob = await res.blob()
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = "usuarios.csv"
  a.click()
  URL.revokeObjectURL(a.href)
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
    <div className="space-y-8">
      {/* Summary Stats Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
          <p className="text-sm text-slate-500 mb-1">Pendentes</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[28px] leading-9 font-semibold tracking-tight text-amber-500">{pendingCount}</h2>
            <span className="text-sm text-slate-500">usuarios</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
          <p className="text-sm text-slate-500 mb-1">Aprovados hoje</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[28px] leading-9 font-semibold tracking-tight text-emerald-500">{approvedToday}</h2>
            <span className="text-sm text-slate-500">usuarios</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-center">
          <p className="text-sm text-slate-500 mb-1">Total de usuarios</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-[28px] leading-9 font-semibold tracking-tight text-slate-900">{totalActive.toLocaleString()}</h2>
            <span className="text-sm text-slate-500">ativos</span>
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 flex-1 md:flex-none">
          <button
            onClick={() => setActiveTab("mentors")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all ${
              activeTab === "mentors"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Mentores
          </button>
          <button
            onClick={() => setActiveTab("mentees")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-semibold tracking-wide transition-all ${
              activeTab === "mentees"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Mentorados
          </button>
        </div>
        <button
          onClick={downloadUsersCsv}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold tracking-wide hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          Exportar
        </button>
        </div>
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
          />
        </div>
      </section>

      {/* Pending Users Card Grid */}
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
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col relative overflow-hidden"
            >
              {/* Left accent bar */}
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />

              {/* Header: avatar + name + time */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={user.image}
                    name={user.name}
                    size="lg"
                  />
                  <div>
                    <h3 className="text-sm font-semibold tracking-wide text-slate-900">{user.name}</h3>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        user.role === "MENTOR"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {roleLabels[user.role]}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500">{timeAgo(user.createdAt)}</span>
              </div>

              {/* Body: headline + skills */}
              <div className="mb-4 flex-1">
                {user.headline && (
                  <p className="text-sm text-slate-900">
                    <span className="font-semibold">Cargo:</span> {user.headline}
                  </p>
                )}
                {user.skills && user.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.skills.slice(0, 4).map((s) => (
                      <span
                        key={s.id}
                        className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium border border-slate-200"
                      >
                        {s.skill.name}
                      </span>
                    ))}
                    {user.skills.length > 4 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium border border-slate-200">
                        +{user.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => setSelectedUser(user)}
                  className="w-full py-2 bg-transparent text-blue-700 border border-blue-700 rounded-lg text-sm font-semibold tracking-wide hover:bg-blue-50 transition-colors"
                >
                  Ver Detalhes
                </button>
                {user.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold tracking-wide flex justify-center items-center gap-1 hover:bg-red-100 transition-colors"
                      disabled={actionLoading === user.id}
                      onClick={() => handleUpdateStatus(user.id, "REJECTED")}
                    >
                      <X className="h-4 w-4" /> Reprovar
                    </button>
                    <button
                      className="flex-[2] py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold tracking-wide hover:bg-blue-700 transition-colors"
                      disabled={actionLoading === user.id}
                      onClick={() => handleUpdateStatus(user.id, "APPROVED")}
                    >
                      Aprovar
                    </button>
                  </div>
                )}
                {user.status === "APPROVED" && user.role !== "ADMIN" && (
                  <button
                    className="w-full py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold tracking-wide hover:bg-slate-50 transition-colors"
                    disabled={actionLoading === user.id}
                    onClick={() => handleUpdateStatus(user.id, "SUSPENDED")}
                  >
                    Suspender
                  </button>
                )}
                {user.status === "SUSPENDED" && (
                  <button
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold tracking-wide hover:bg-emerald-700 transition-colors"
                    disabled={actionLoading === user.id}
                    onClick={() => handleUpdateStatus(user.id, "APPROVED")}
                  >
                    Reativar
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

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
