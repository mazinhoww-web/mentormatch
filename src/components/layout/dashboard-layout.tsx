"use client"

import { Sidebar } from "@/components/layout/sidebar"

type Role = "MENTOR" | "MENTEE" | "ADMIN"

interface DashboardLayoutProps {
  children: React.ReactNode
  tenantSlug: string
  role: Role
  userName: string
}

export function DashboardLayout({
  children,
  tenantSlug,
  role,
  userName,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar tenantSlug={tenantSlug} role={role} userName={userName} />

      {/* Main content area */}
      <div className="lg:pl-72">
        {/* Mobile header spacer */}
        <div className="sticky top-0 z-20 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
          {/* Space reserved for the hamburger button rendered by Sidebar */}
          <div className="pl-14">
            <h1 className="text-lg font-semibold text-foreground">
              MentorMatch
            </h1>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
