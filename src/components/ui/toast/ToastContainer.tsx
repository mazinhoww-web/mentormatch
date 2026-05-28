"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Check, Info, X } from "lucide-react"

export type ToastVariant = "success" | "error" | "warning" | "info"

export type Toast = {
  id: string
  message: string
  variant: ToastVariant
}

type Props = {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const ICONS = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
}

const COLORS = {
  success: "var(--green)",
  error: "var(--red)",
  warning: "var(--amber)",
  info: "var(--accent)",
}

const TOAST_DURATION = 4200

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) {
  const Icon = ICONS[toast.variant]
  const color = COLORS[toast.variant]
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startedAt = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startedAt
      const next = Math.max(0, 100 - (elapsed / TOAST_DURATION) * 100)
      setProgress(next)
      if (next > 0) raf = requestAnimationFrame(tick)
    }
    let raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "relative",
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${color}`,
        borderRadius: "var(--radius-btn)",
        boxShadow: "var(--shadow-md)",
        padding: "12px 16px",
        minWidth: 280,
        maxWidth: 380,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        overflow: "hidden",
        animation: "toast-slide-in 0.3s ease",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: `${color}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        <Icon size={13} />
      </div>
      <div style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>
        {toast.message}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar notificacao"
        style={{
          flexShrink: 0,
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          padding: 2,
          display: "flex",
        }}
      >
        <X size={14} />
      </button>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 2,
          width: `${progress}%`,
          background: color,
          transition: "width 80ms linear",
        }}
      />
    </div>
  )
}

export function ToastContainer({ toasts, onDismiss }: Props) {
  if (typeof document === "undefined") return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 300,
        display: "flex",
        flexDirection: "column-reverse",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={t} onDismiss={() => onDismiss(t.id)} />
        </div>
      ))}
    </div>
  )
}
