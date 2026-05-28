"use client"

import { Check, Clock, X } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

type Status = "active" | "pending" | "ended"

type PairUser = {
  name: string
  image?: string | null
}

type Props = {
  status: Status
  mentor: PairUser
  mentee: PairUser
  sessionsCount: number
  lastSession?: string | null
  since?: string | null
  onScheduleSession?: () => void
  onShowDetails?: () => void
}

const STATUS = {
  active: { color: "var(--green)", Icon: Check, label: "Ativa" },
  pending: { color: "var(--amber)", Icon: Clock, label: "Pendente" },
  ended: { color: "var(--text-muted)", Icon: X, label: "Encerrada" },
}

export function ConnectionCard({
  status,
  mentor,
  mentee,
  sessionsCount,
  lastSession,
  since,
  onScheduleSession,
  onShowDetails,
}: Props) {
  const { color, Icon, label } = STATUS[status]

  return (
    <div
      style={{
        background: "var(--glass)",
        border: "1px solid var(--border)",
        borderLeft: `4px solid ${color}`,
        borderRadius: "var(--radius-card)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 0, position: "relative" }}>
        <Avatar src={mentor.image} name={mentor.name} size="md" />
        <div style={{ marginLeft: -8, zIndex: 0 }}>
          <Avatar src={mentee.image} name={mentee.name} size="md" />
        </div>
        <div
          style={{
            position: "absolute",
            left: 28,
            top: "50%",
            transform: "translateY(-50%)",
            background: "var(--bg-base)",
            border: `2px solid ${color}`,
            color,
            borderRadius: "50%",
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <Icon size={10} strokeWidth={3} />
        </div>
        <div style={{ marginLeft: 14, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
            {mentor.name} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>&harr;</span> {mentee.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)", flexWrap: "wrap" }}>
        <span>
          <strong style={{ color: "var(--text)" }}>{sessionsCount}</strong> sessoes
        </span>
        {lastSession && (
          <span>
            Ultima: <strong style={{ color: "var(--text)" }}>{lastSession}</strong>
          </span>
        )}
        {since && (
          <span>
            Desde: <strong style={{ color: "var(--text)" }}>{since}</strong>
          </span>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {status === "active" && onScheduleSession && (
          <button
            type="button"
            onClick={onScheduleSession}
            style={{
              flex: 1,
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              padding: "8px",
              borderRadius: "var(--radius-btn)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Agendar sessao
          </button>
        )}
        {onShowDetails && (
          <button
            type="button"
            onClick={onShowDetails}
            style={{
              flex: 1,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "8px",
              borderRadius: "var(--radius-btn)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Detalhes
          </button>
        )}
      </div>
    </div>
  )
}
