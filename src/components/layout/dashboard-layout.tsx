"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Avatar } from "@/components/ui/avatar"
import { Menu } from "lucide-react"

type Role = "MENTOR" | "MENTEE" | "ADMIN"

interface DashboardLayoutProps {
  children: React.ReactNode
  tenantSlug: string
  role: Role
  userName: string
  userAvatarSrc?: string | null
  onMobileMenuOpen?: () => void
  brandColor?: string | null
  secondaryColor?: string | null
}

export function DashboardLayout({
  children,
  tenantSlug,
  role,
  userName,
  userAvatarSrc,
  onMobileMenuOpen,
  brandColor,
  secondaryColor,
}: DashboardLayoutProps) {
  return (
    <div
      className="min-h-screen bg-background"
      data-tenant={tenantSlug}
      style={{
        '--tenant-primary': brandColor || undefined,
        '--tenant-secondary': secondaryColor || undefined,
      } as React.CSSProperties}
    >
      <Sidebar tenantSlug={tenantSlug} role={role} userName={userName} />

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          <div className="flex items-center gap-3">
            {/* Hamburger button triggers sidebar on mobile */}
            <button
              type="button"
              onClick={onMobileMenuOpen}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-lg font-bold text-primary">
              MentorMatch
            </span>
          </div>
          <Avatar src={userAvatarSrc} name={userName} size="sm" />
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav tenantSlug={tenantSlug} role={role} />
    </div>
  )
}
