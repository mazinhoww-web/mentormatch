"use client"

import { useEffect, useRef } from "react"

type ModalSize = "sm" | "md" | "lg"

type ModalProps = {
  open: boolean
  onClose: () => void
  size?: ModalSize
  ariaLabel?: string
  children: React.ReactNode
}

const SIZE_MAP: Record<ModalSize, number> = {
  sm: 400,
  md: 520,
  lg: 720,
}

export function Modal({
  open,
  onClose,
  size = "md",
  ariaLabel,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: SIZE_MAP[size],
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-md)",
          overflow: "hidden",
          animation: "modal-pop-in 0.22s ease",
          outline: "none",
        }}
      >
        {children}
      </div>
    </div>
  )
}
