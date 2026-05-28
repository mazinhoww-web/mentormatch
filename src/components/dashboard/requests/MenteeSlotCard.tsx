"use client"

import { Avatar } from "@/components/ui/avatar"

type Props = {
  name: string
  image?: string | null
  role?: string | null
  sessionsDone: number
  sessionsTotal: number
  nextSession?: string | null
}

export function MenteeSlotCard({
  name,
  image,
  role,
  sessionsDone,
  sessionsTotal,
  nextSession,
}: Props) {
  const pct = sessionsTotal > 0 ? Math.min(100, (sessionsDone / sessionsTotal) * 100) : 0

  return (
    <div
      style={{
        background: "var(--glass)",
        border: "1px solid var(--border)",
        borderLeft: "3px solid var(--green)",
        borderRadius: "var(--radius-card)",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Avatar src={image} name={name} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{name}</div>
          {role && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{role}</div>}
        </div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)", marginBottom: 4 }}>
          <span>Sessoes</span>
          <span>
            {sessionsDone}/{sessionsTotal}
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: "var(--surface)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "var(--green)",
              transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </div>
      </div>
      {nextSession && (
        <div style={{ fontSize: 11, color: "var(--text-sub)" }}>
          Proxima: <strong style={{ color: "var(--text)" }}>{nextSession}</strong>
        </div>
      )}
    </div>
  )
}
