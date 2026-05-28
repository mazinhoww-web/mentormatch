"use client"

import { X } from "lucide-react"

type Props = {
  title: string
  onClose?: () => void
  subtitle?: string
}

export function ModalHeader({ title, onClose, subtitle }: Props) {
  return (
    <div
      style={{
        padding: "20px 24px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text)",
            fontFamily: "var(--font-display)",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 2,
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            display: "flex",
          }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  )
}
