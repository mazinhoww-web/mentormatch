"use client"

import { AlertCircle, AlertTriangle, Check, Loader2 } from "lucide-react"
import { Modal } from "./Modal"
import { ModalFooter } from "./ModalFooter"

type Variant = "danger" | "success" | "warning"

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  variant: Variant
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
}

const ICONS = {
  danger: AlertTriangle,
  success: Check,
  warning: AlertCircle,
}

const COLORS = {
  danger: "var(--red)",
  success: "var(--green)",
  warning: "var(--amber)",
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  variant,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading,
}: Props) {
  const Icon = ICONS[variant]
  const color = COLORS[variant]

  return (
    <Modal open={open} onClose={onClose} size="sm" ariaLabel={title}>
      <div style={{ padding: "28px 24px", textAlign: "center" }}>
        <div
          aria-hidden="true"
          style={{
            margin: "0 auto 16px",
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: `${color}1f`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color,
          }}
        >
          <Icon size={24} />
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text)",
            fontFamily: "var(--font-display)",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          {description}
        </div>
      </div>
      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-sub)",
            padding: "10px 18px",
            borderRadius: "var(--radius-btn)",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          style={{
            background: color,
            border: "none",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "var(--radius-btn)",
            fontSize: 13,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {confirmLabel}
        </button>
      </ModalFooter>
    </Modal>
  )
}
