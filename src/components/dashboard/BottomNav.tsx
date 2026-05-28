"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Inbox, LayoutDashboard, User, Users } from "lucide-react"

type Props = {
  tenantSlug: string
  role: "ADMIN" | "MENTOR" | "MENTEE" | "SUPER_ADMIN"
  pendingRequests?: number
}

export function BottomNav({ tenantSlug, role, pendingRequests = 0 }: Props) {
  const pathname = usePathname()
  const base = `/t/${tenantSlug}`

  const items =
    role === "MENTOR"
      ? [
          { href: `${base}/mentor`, label: "Dashboard", Icon: LayoutDashboard, badge: 0 },
          { href: `${base}/requests`, label: "Solicit.", Icon: Inbox, badge: pendingRequests },
          { href: `${base}/processo`, label: "Conexoes", Icon: Users, badge: 0 },
          { href: `${base}/library`, label: "Biblio.", Icon: BookOpen, badge: 0 },
          { href: `${base}/profile`, label: "Perfil", Icon: User, badge: 0 },
        ]
      : [
          { href: `${base}/mentee`, label: "Dashboard", Icon: LayoutDashboard, badge: 0 },
          { href: `${base}/mentors`, label: "Mentores", Icon: Users, badge: 0 },
          { href: `${base}/processo`, label: "Conexoes", Icon: Inbox, badge: 0 },
          { href: `${base}/library`, label: "Biblio.", Icon: BookOpen, badge: 0 },
          { href: `${base}/profile`, label: "Perfil", Icon: User, badge: 0 },
        ]

  return (
    <nav
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 64,
        background: "var(--bg-base)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-around",
        padding: "0 4px",
      }}
    >
      {items.map(({ href, label, Icon, badge }) => {
        const isActive = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              color: isActive ? "var(--accent)" : "var(--text-muted)",
              textDecoration: "none",
              position: "relative",
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{label}</span>
            {badge > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: "calc(50% - 22px)",
                  background: "var(--red)",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: "var(--radius-chip)",
                  minWidth: 16,
                  textAlign: "center",
                }}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
