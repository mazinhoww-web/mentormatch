"use client"

import { useTransition } from "react"
import Link from "next/link"
import { markAsRead } from "@/app/actions/notifications"

type Category = "solicitacao" | "sessao" | "sistema"

type Props = {
  id: string
  text: string
  timestamp: string
  read: boolean
  category: Category
  href?: string
}

const CATEGORY_STYLE: Record<Category, { color: string; bg: string; label: string }> = {
  solicitacao: { color: "var(--green)", bg: "rgba(16,185,129,0.12)", label: "Solicitacao" },
  sessao: { color: "var(--accent)", bg: "var(--accent-glow)", label: "Sessao" },
  sistema: { color: "var(--text-muted)", bg: "var(--surface)", label: "Sistema" },
}

export function NotificationItem({ id, text, timestamp, read, category, href }: Props) {
  const meta = CATEGORY_STYLE[category]
  const [, startTransition] = useTransition()

  function handleClick() {
    if (!read) {
      startTransition(async () => {
        await markAsRead(id)
      })
    }
  }

  const content = (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        background: read ? "transparent" : "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          marginTop: 5,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: read ? "var(--text-muted)" : "var(--accent)",
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span
            style={{
              background: meta.bg,
              color: meta.color,
              fontSize: 9,
              fontWeight: 700,
              padding: "1px 7px",
              borderRadius: "var(--radius-chip)",
              textTransform: "uppercase",
            }}
          >
            {meta.label}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timestamp}</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--font-body)" }}>{text}</div>
      </div>
    </div>
  )

  return href ? (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      {content}
    </Link>
  ) : (
    content
  )
}
