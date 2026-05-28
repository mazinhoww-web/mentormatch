"use client"

import { useState, useTransition } from "react"
import { BookOpen, FileText, Heart, Link as LinkIcon, Video } from "lucide-react"

export type MaterialFormat = "PDF" | "VIDEO" | "ARTICLE" | "OTHER"

type Props = {
  id: string
  title: string
  format: MaterialFormat
  author?: string | null
  date: string
  thumbnailUrl?: string | null
  url?: string | null
  saved?: boolean
  onToggleSave?: (id: string) => Promise<void> | void
}

const FORMAT_STYLES: Record<MaterialFormat, { color: string; bg: string; label: string; Icon: typeof FileText }> = {
  PDF: { color: "var(--red)", bg: "rgba(239,68,68,0.12)", label: "PDF", Icon: FileText },
  VIDEO: { color: "var(--accent)", bg: "rgba(99,102,241,0.12)", label: "Video", Icon: Video },
  ARTICLE: { color: "var(--green)", bg: "rgba(16,185,129,0.12)", label: "Artigo", Icon: BookOpen },
  OTHER: { color: "var(--text-muted)", bg: "var(--surface)", label: "Link", Icon: LinkIcon },
}

export function MaterialCard({
  id,
  title,
  format,
  author,
  date,
  thumbnailUrl,
  url,
  saved = false,
  onToggleSave,
}: Props) {
  const meta = FORMAT_STYLES[format]
  const { Icon } = meta
  const [isSaved, setSaved] = useState(saved)
  const [pending, startTransition] = useTransition()

  function handleSave(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setSaved((v) => !v)
    if (onToggleSave) {
      startTransition(async () => {
        await onToggleSave(id)
      })
    }
  }

  return (
    <a
      href={url ?? "#"}
      target={url ? "_blank" : undefined}
      rel="noreferrer"
      style={{
        background: "var(--glass)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          aspectRatio: "16 / 9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Icon size={40} style={{ color: meta.color, opacity: 0.6 }} />
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={pending}
          aria-label={isSaved ? "Remover dos salvos" : "Salvar"}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: isSaved ? "var(--red)" : "var(--text-muted)",
            width: 30,
            height: 30,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Heart size={14} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{
            alignSelf: "flex-start",
            background: meta.bg,
            color: meta.color,
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "var(--radius-chip)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {meta.label}
        </span>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text)",
            fontFamily: "var(--font-display)",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: "auto" }}>
          {author && <>{author} &middot; </>}
          {date}
        </div>
      </div>
    </a>
  )
}
