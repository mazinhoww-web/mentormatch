"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BookOpen, User, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  tenantSlug: string
  role: string
}

export function BottomNav({ tenantSlug, role }: BottomNavProps) {
  const pathname = usePathname()
  const base = `/t/${tenantSlug}`

  const dashboardHref =
    role === "MENTOR" ? `${base}/mentor` : `${base}/mentee`

  const items = [
    { label: "Dashboard", href: dashboardHref, icon: LayoutDashboard },
    { label: "Conexoes", href: `${base}/processo`, icon: ClipboardList },
    { label: "Mentores", href: `${base}/mentors`, icon: Users },
    { label: "Biblioteca", href: `${base}/library`, icon: BookOpen },
    { label: "Perfil", href: `${base}/profile`, icon: User },
  ]

  function isActive(href: string): boolean {
    if (href === dashboardHref) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 py-1"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
