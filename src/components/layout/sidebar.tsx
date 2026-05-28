"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  BookOpen,
  Bell,
  User,
  Users,
  Settings,
  BarChart3,
  ClipboardList,
  Sparkles,
  LogOut,
  X,
  GraduationCap,
  Repeat,
  Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

type Role = "MENTOR" | "MENTEE" | "ADMIN"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

interface SidebarProps {
  tenantSlug: string
  role: Role
  userName: string
}

function getNavItems(tenantSlug: string, role: Role): NavItem[] {
  const base = `/t/${tenantSlug}`

  if (role === "ADMIN") {
    return [
      { label: "Dashboard", href: `${base}/admin`, icon: LayoutDashboard },
      { label: "Usuarios", href: `${base}/admin/users`, icon: Users },
      { label: "Habilidades", href: `${base}/admin/skills`, icon: Sparkles },
      { label: "Biblioteca", href: `${base}/admin/library`, icon: BookOpen },
      { label: "Relatorios", href: `${base}/admin/reports`, icon: BarChart3 },
      { label: "Configuracoes", href: `${base}/admin/settings`, icon: Settings },
    ]
  }

  if (role === "MENTOR") {
    return [
      { label: "Dashboard", href: `${base}/mentor`, icon: LayoutDashboard },
      { label: "Solicitacoes", href: `${base}/requests`, icon: ClipboardList },
      { label: "Minhas Conexoes", href: `${base}/processo`, icon: ClipboardList },
      { label: "Biblioteca", href: `${base}/library`, icon: BookOpen },
      { label: "Notificacoes", href: `${base}/notifications`, icon: Bell },
      { label: "Perfil", href: `${base}/profile`, icon: User },
    ]
  }

  // MENTEE
  return [
    { label: "Dashboard", href: `${base}/mentee`, icon: LayoutDashboard },
    { label: "Minhas Conexoes", href: `${base}/processo`, icon: ClipboardList },
    { label: "Buscar Mentores", href: `${base}/mentors`, icon: Search },
    { label: "Biblioteca", href: `${base}/library`, icon: BookOpen },
    { label: "Notificacoes", href: `${base}/notifications`, icon: Bell },
    { label: "Perfil", href: `${base}/profile`, icon: User },
  ]
}

export function Sidebar({ tenantSlug, role, userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { update } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)
  const navItems = getNavItems(tenantSlug, role)

  const canSwitchRole = role === "MENTOR" || role === "MENTEE"
  const otherRole: "MENTOR" | "MENTEE" = role === "MENTOR" ? "MENTEE" : "MENTOR"
  const otherRoleLabel = otherRole === "MENTOR" ? "Mentor" : "Mentorado"

  async function handleSwitchRole() {
    if (switchingRole) return
    setSwitchingRole(true)
    try {
      const res = await fetch("/mentormatch/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: otherRole }),
      })
      if (!res.ok) {
        setSwitchingRole(false)
        return
      }
      await update()
      router.push(`/t/${tenantSlug}/${otherRole === "MENTOR" ? "mentor" : "mentee"}`)
      router.refresh()
    } catch {
      setSwitchingRole(false)
    }
  }

  function isActive(href: string): boolean {
    if (href === `/t/${tenantSlug}/admin`) {
      return pathname === href
    }
    if (href === `/t/${tenantSlug}/mentor`) {
      return pathname === href
    }
    if (href === `/t/${tenantSlug}/mentee`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-sidebar-foreground">
          MentorMatch
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", active && "text-sidebar-primary")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User section & Logout */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Avatar name={userName} size="sm" />
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {userName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {role === "ADMIN" ? "Administrador" : role === "MENTOR" ? "Mentor" : "Mentorado"}
            </p>
          </div>
        </div>
        {canSwitchRole && (
          <button
            onClick={handleSwitchRole}
            disabled={switchingRole}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-60"
          >
            {switchingRole ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
            ) : (
              <Repeat className="h-5 w-5 shrink-0" />
            )}
            Mudar para {otherRoleLabel}
          </button>
        )}
        <button
          onClick={async () => {
            try {
              await fetch("/mentormatch/api/tenant/clear", { method: "POST" })
            } catch {}
            signOut({ callbackUrl: "/mentormatch/login" })
          }}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar (slide-over drawer) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar - only visible on lg+ */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar">
        {sidebarContent}
      </aside>
    </>
  )
}
