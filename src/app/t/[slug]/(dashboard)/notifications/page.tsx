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
  GraduationCap,
  CalendarDays,
  RefreshCw,
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
      return GraduationCap
    case "CONNECTION_REJECTED":
      return UserX
    case "WAITLIST_PROMOTED":
      return Clock
    case "LIBRARY_NEW":
    case "NEW_MATERIAL":
      return BookOpen
    default:
      return RefreshCw
  }
}

function getNotificationStyle(type: string) {
  switch (type) {
    case "CONNECTION_REQUEST":
      return { iconBg: "bg-blue-600/20", iconText: "text-[#b4c5ff]" }
    case "CONNECTION_ACCEPTED":
      return { iconBg: "bg-blue-600/20", iconText: "text-[#b4c5ff]" }
    case "CONNECTION_REJECTED":
      return { iconBg: "bg-red-500/20", iconText: "text-red-400" }
    case "WAITLIST_PROMOTED":
      return { iconBg: "bg-[#3a4a5f]/30", iconText: "text-[#b7c8e1]" }
    case "LIBRARY_NEW":
    case "NEW_MATERIAL":
      return { iconBg: "bg-[#bc4800]/20", iconText: "text-[#ffb596]" }
    default:
      return { iconBg: "bg-[#222a3d]", iconText: "text-[#c3c6d7]" }
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
    Hoje: [],
    Anteriores: [],
  }

  for (const notif of notifications) {
    const date = new Date(notif.createdAt)
    date.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      groups["Hoje"].push(notif)
    } else {
      groups["Anteriores"].push(notif)
    }
  }

  return Object.entries(groups)
    .filter(([, notifs]) => notifs.length > 0)
    .map(([label, notifications]) => ({ label, notifications }))
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Agora mesmo"
  if (diffMins < 60) return `Ha ${diffMins} min`
  if (diffHours < 24) return `Ha ${diffHours} hora${diffHours > 1 ? "s" : ""}`
  if (diffDays === 1) return "Ontem"
  if (diffDays < 7) return `${diffDays} dias atras`
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
    <div className="flex flex-col gap-8 max-w-3xl mx-auto py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] md:text-[32px] leading-[36px] md:leading-[40px] font-semibold tracking-[-0.01em] text-[#dae2fd]">
            Notificacoes
          </h2>
          <p className="text-sm text-[#c3c6d7] mt-1">
            {unreadCount > 0
              ? `Voce tem ${unreadCount} mensage${unreadCount > 1 ? "ns" : "m"} nao lida${unreadCount > 1 ? "s" : ""}.`
              : "Todas as notificacoes foram lidas."}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="self-start md:self-auto px-4 py-2 rounded-lg text-xs font-medium tracking-[0.05em] text-[#b7c8e1] border border-[#3a4a5f] hover:bg-[#2d3449]/50 transition-colors flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? "Marcando..." : "Marcar todas como lidas"}
          </button>
        )}
      </div>

      {/* Notifications Container */}
      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Nenhuma notificacao"
          description="Voce nao possui notificacoes no momento. Elas aparecerao aqui quando houver atualizacoes."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map((group) => (
            <section key={group.label} className="flex flex-col gap-3">
              <h3 className="text-xs font-medium tracking-[0.05em] text-[#c3c6d7] uppercase tracking-wider pl-1">
                {group.label}
              </h3>

              {group.notifications.map((notif) => {
                const Icon = getNotificationIcon(notif.type)
                const style = getNotificationStyle(notif.type)
                const actionBtn = getActionButton(notif.type)

                if (!notif.read) {
                  // Unread - glass card style
                  return (
                    <div
                      key={notif.id}
                      className="bg-[#171f33]/60 backdrop-blur-xl border border-[#434655] rounded-xl p-4 flex gap-4 items-start relative group cursor-pointer hover:bg-[#171f33] transition-colors"
                      onClick={() => markAsRead(notif.id)}
                    >
                      {/* Unread indicator bar */}
                      <div className="absolute top-4 left-0 w-1 h-12 bg-[#b4c5ff] rounded-r-full" />

                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${style.iconBg} ${style.iconText} flex items-center justify-center mt-1`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 flex flex-col gap-1">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-lg leading-6 font-semibold text-[#dae2fd]">
                            {notif.title}
                          </h4>
                          <span className="text-xs font-medium tracking-[0.05em] text-[#c3c6d7] whitespace-nowrap mt-1">
                            {formatRelativeTime(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-[#c3c6d7]">{notif.message}</p>

                        {actionBtn && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (actionBtn.action === "library") {
                                  router.push(`/t/${slug}/library`)
                                }
                              }}
                              className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium tracking-[0.05em] hover:opacity-90 transition-opacity"
                            >
                              {actionBtn.label}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Unread dot */}
                      <div className="w-2 h-2 rounded-full bg-[#b4c5ff] mt-2 flex-shrink-0" />
                    </div>
                  )
                }

                // Read notifications
                return (
                  <div
                    key={notif.id}
                    className="bg-[#060e20] border border-[#434655]/50 rounded-xl p-4 flex gap-4 items-start group cursor-pointer hover:bg-[#131b2e] transition-colors"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${style.iconBg} ${style.iconText} flex items-center justify-center mt-1`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 flex flex-col gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="text-lg leading-6 font-semibold text-[#dae2fd]">
                          {notif.title}
                        </h4>
                        <span className="text-xs font-medium tracking-[0.05em] text-[#c3c6d7] whitespace-nowrap mt-1">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#c3c6d7]">{notif.message}</p>
                    </div>
                  </div>
                )
              })}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
