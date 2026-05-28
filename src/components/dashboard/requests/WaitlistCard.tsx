"use client"

import { Avatar } from "@/components/ui/avatar"

type Props = {
  name: string
  image?: string | null
  position: number
  joinedAt: string
  priority?: "novo" | "aguardando"
}

export function WaitlistCard({ name, image, position, joinedAt, priority = "aguardando" }: Props) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <Avatar src={image} name={name} size="sm" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{name}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
          #{position} na fila &middot; {joinedAt}
        </div>
      </div>
      <span
        style={{
          background:
            priority === "novo" ? "var(--accent-glow)" : "rgba(245,158,11,0.15)",
          color: priority === "novo" ? "var(--accent)" : "var(--amber)",
          fontSize: 9,
          fontWeight: 700,
          padding: "2px 7px",
          borderRadius: "var(--radius-chip)",
          textTransform: "uppercase",
        }}
      >
        {priority === "novo" ? "Novo" : "Aguardando"}
      </span>
    </div>
  )
}
