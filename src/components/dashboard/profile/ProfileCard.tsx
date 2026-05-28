"use client"

import { Camera, ExternalLink, Phone } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

type Props = {
  name: string
  role?: string | null
  image?: string | null
  status?: "approved" | "pending" | string
  fieldsFilled: number
  totalFields?: number
  linkedinUrl?: string | null
  whatsapp?: string | null
  onPhotoClick?: () => void
}

export function ProfileCard({
  name,
  role,
  image,
  status = "approved",
  fieldsFilled,
  totalFields = 7,
  linkedinUrl,
  whatsapp,
  onPhotoClick,
}: Props) {
  const pct = Math.min(100, Math.round((fieldsFilled / totalFields) * 100))
  const complete = fieldsFilled >= totalFields
  const statusColor =
    status === "approved" ? "var(--green)" : status === "pending" ? "var(--amber)" : "var(--text-muted)"

  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        textAlign: "center",
      }}
    >
      <div style={{ position: "relative" }}>
        <Avatar src={image} name={name} size="xl" className="w-20 h-20" />
        {onPhotoClick && (
          <button
            type="button"
            onClick={onPhotoClick}
            aria-label="Trocar foto"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              background: "var(--accent)",
              border: "2px solid var(--bg-elevated)",
              color: "#fff",
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Camera size={14} />
          </button>
        )}
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
          {name}
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 2 }}>
          {role && (
            <span
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-sub)",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "var(--radius-chip)",
                textTransform: "uppercase",
              }}
            >
              {role}
            </span>
          )}
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: statusColor,
            }}
          />
        </div>
      </div>
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--text-muted)",
            marginBottom: 4,
          }}
        >
          <span>{complete ? "Perfil completo" : "Completar perfil"}</span>
          <span>
            {fieldsFilled}/{totalFields}
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
              background: complete ? "var(--green)" : "var(--accent)",
              transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <ExternalLink size={14} />
          </a>
        )}
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <Phone size={14} />
          </a>
        )}
      </div>
    </div>
  )
}
