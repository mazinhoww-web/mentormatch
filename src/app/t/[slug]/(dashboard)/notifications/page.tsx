"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Bell,
  BellOff,
  CheckCheck,
  UserPlus,
  UserCheck,
  UserX,
  BookOpen,
  Clock,
  Info,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Loading } from "@/components/ui/loading"
import { cn } from "@/lib/utils"

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

function getNotificationIconColor(type: string) {
  switch (type) {
    case "CONNECTION_REQUEST":
      return "text-blue-600 bg-blue-100"
    case "CONNECTION_ACCEPTED":
      return "text-green-600 bg-green-100"
    case "CONNECTION_REJECTED":
      return "text-red-600 bg-red-100"
    case "WAITLIST_PROMOTED":
      return "text-yellow-600 bg-yellow-100"
    case "LIBRARY_NEW":
    case "NEW_MATERIAL":
      return "text-purple-600 bg-purple-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

function groupNotificationsByDate(
  notifications: Notification[]
): GroupedNotifications[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const groups: Record<string, Notification[]> = {
    Hoje: [],
    Ontem: [],
    Anteriores: [],
  }

  for (const notif of notifications) {
    const date = new Date(notif.createdAt)
    date.setHours(0, 0, 0, 0)

    if (date.getTime() === today.getTime()) {
      groups["Hoje"].push(notif)
    } else if (date.getTime() === yesterday.getTime()) {
      groups["Ontem"].push(notif)
    } else {
      groups["Anteriores"].push(notif)
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

function formatFullDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function NotificationsPage() {
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
      console.error("Erro ao carregar notificações:", error)
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
    return <Loading text="Carregando notificações..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `Você tem ${unreadCount} notificação${unreadCount > 1 ? "ões" : ""} não lida${unreadCount > 1 ? "s" : ""}.`
              : "Todas as notificações foram lidas."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={markingAll}
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? "Marcando..." : "Marcar todas como lidas"}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Nenhuma notificação"
          description="Você não possui notificações no momento. Elas aparecerão aqui quando houver atualizações."
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.label}>
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.notifications.map((notif) => {
                  const Icon = getNotificationIcon(notif.type)
                  const iconColor = getNotificationIconColor(notif.type)

                  return (
                    <Card
                      key={notif.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        !notif.read && "bg-accent/30 border-primary/20",
                        notif.read && "opacity-75 hover:opacity-100"
                      )}
                      onClick={() => {
                        if (!notif.read) markAsRead(notif.id)
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "rounded-lg p-2 shrink-0",
                              iconColor
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p
                                  className={cn(
                                    "text-sm leading-tight",
                                    !notif.read && "font-semibold"
                                  )}
                                >
                                  {notif.title}
                                  {!notif.read && (
                                    <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500" />
                                  )}
                                </p>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                  {notif.message}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                {group.label === "Anteriores"
                                  ? formatFullDate(notif.createdAt)
                                  : formatTime(notif.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
