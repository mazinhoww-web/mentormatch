"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  BellOff,
  CheckCheck,
  UserPlus,
  UserCheck,
  UserX,
  BookOpen,
  Clock,
  Info,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Loading } from "@/components/ui/loading"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  metadata?: Record<string, unknown> | null
}

interface GroupedNotifications {
  label: string
  notifications: Notification[]
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "CONNECTION_REQUEST":
      return UserPlus
    case "CONNECTION_ACCEPTED":
      return UserCheck
    case "CONNECTION_REJECTED":
      return UserX
    case "WAITLIST_PROMOTED":
      return Clock
    case "LIBRARY_NEW":
    case "NEW_MATERIAL":
      return BookOpen
    default:
      return Info
  }
}

function getNotificationStyle(type: string) {
  switch (type) {
    case "CONNECTION_REQUEST":
      return { iconBg: "bg-blue-500/20", iconText: "text-blue-400", border: "border-l-blue-500" }
    case "CONNECTION_ACCEPTED":
      return { iconBg: "bg-green-500/20", iconText: "text-green-400", border: "border-l-green-500" }
    case "CONNECTION_REJECTED":
      return { iconBg: "bg-red-500/20", iconText: "text-red-400", border: "border-l-red-500" }
    case "WAITLIST_PROMOTED":
      return { iconBg: "bg-yellow-500/20", iconText: "text-yellow-400", border: "border-l-yellow-500" }
    case "LIBRARY_NEW":
    case "NEW_MATERIAL":
      return { iconBg: "bg-orange-500/20", iconText: "text-orange-400", border: "border-l-orange-500" }
    default:
      return { iconBg: "bg-slate-500/20", iconText: "text-slate-400", border: "border-l-slate-500" }
  }
}

function getActionButton(type: string): { label: string; action: string } | null {
  switch (type) {
    case "CONNECTION_ACCEPTED":
      return { label: "Abrir Chat", action: "chat" }
    case "LIBRARY_NEW":
    case "NEW_MATERIAL":
      return { label: "Ver Material", action: "library" }
    default:
      return null
  }
}

function groupNotificationsByDate(
  notifications: Notification[]
): GroupedNotifications[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const groups: Record<string, Notification[]> = {
    HOJE: [],
    ANTERIORES: [],
  }

  for (const notif of notifications) {
    const date = new Date(notif.createdAt)
    date.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      groups["HOJE"].push(notif)
    } else {
      groups["ANTERIORES"].push(notif)
    }
  }

  return Object.entries(groups)
    .filter(([, notifs]) => notifs.length > 0)
    .map(([label, notifications]) => ({ label, notifications }))
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}min`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export default function NotificationsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications")
      const data: Notification[] = await res.json()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erro ao carregar notificacoes:", error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    } catch (error) {
      console.error("Erro ao marcar como lida:", error)
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true)
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      })

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error)
    } finally {
      setMarkingAll(false)
    }
  }

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const grouped = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications]
  )

  if (loading) {
    return <Loading text="Carregando notificacoes..." />
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Notificacoes</h1>
        <p className="text-slate-400 mt-1">
          {unreadCount > 0
            ? `Voce tem ${unreadCount} notificacao${unreadCount > 1 ? "es" : ""} nao lida${unreadCount > 1 ? "s" : ""}.`
            : "Todas as notificacoes foram lidas."}
        </p>
      </div>

      {/* Mark all as read */}
      {unreadCount > 0 && (
        <Button
          variant="outline"
          onClick={markAllAsRead}
          disabled={markingAll}
          className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <CheckCheck className="h-4 w-4" />
          {markingAll ? "Marcando..." : "Marcar todas como lidas"}
        </Button>
      )}

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Nenhuma notificacao"
          description="Voce nao possui notificacoes no momento. Elas aparecerao aqui quando houver atualizacoes."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.label}>
              <h2 className="mb-3 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.notifications.map((notif) => {
                  const Icon = getNotificationIcon(notif.type)
                  const style = getNotificationStyle(notif.type)
                  const actionBtn = getActionButton(notif.type)

                  return (
                    <div
                      key={notif.id}
                      className={`rounded-xl bg-slate-900 border border-slate-800 border-l-4 ${style.border} p-4 cursor-pointer transition-colors hover:bg-slate-800/70 ${
                        !notif.read ? "bg-slate-900" : "opacity-70"
                      }`}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif.id)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}>
                          <Icon className={`h-5 w-5 ${style.iconText}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className={`text-sm leading-tight ${!notif.read ? "font-semibold text-white" : "text-slate-300"}`}>
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                )}
                              </div>
                              <p className="mt-1 text-sm text-slate-400">
                                {notif.message}
                              </p>
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap shrink-0 mt-0.5">
                              {formatRelativeTime(notif.createdAt)}
                            </span>
                          </div>

                          {actionBtn && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (actionBtn.action === "library") {
                                  router.push(`/t/${slug}/library`)
                                }
                              }}
                              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-slate-700 transition-colors"
                            >
                              <MessageCircle className="h-3 w-3" />
                              {actionBtn.label}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
