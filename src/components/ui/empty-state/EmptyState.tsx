"use client"

import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

type Cta = {
  label: string
  onClick: () => void
  icon?: ReactNode
}

export type EmptyStateProps = {
  icon: ReactNode | LucideIcon
  title: string
  description: string
  steps?: string[]
  primaryCta?: Cta
  secondaryCta?: Cta
  compact?: boolean
  /** Legacy alias for primaryCta - kept for backward compatibility */
  action?: ReactNode
  className?: string
}

function renderIcon(icon: ReactNode | LucideIcon, size = 28): ReactNode {
  if (typeof icon === "function") {
    const Icon = icon as LucideIcon
    return <Icon size={size} />
  }
  return icon
}

export function EmptyState({
  icon,
  title,
  description,
  steps,
  primaryCta,
  secondaryCta,
  compact = false,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--glass)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: compact ? "32px 24px" : "56px 40px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: compact ? 12 : 18,
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: compact ? 56 : 72,
          height: compact ? 56 : 72,
          borderRadius: "50%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        {renderIcon(icon, compact ? 24 : 28)}
      </div>
      <div>
        <h3
          style={{
            margin: 0,
            fontSize: compact ? 16 : 18,
            fontWeight: 700,
            color: "var(--text)",
            fontFamily: "var(--font-display)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            marginTop: 6,
            marginBottom: 0,
            fontSize: 14,
            lineHeight: 1.55,
            color: "var(--text-muted)",
            maxWidth: 420,
          }}
        >
          {description}
        </p>
      </div>
      {steps && steps.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            textAlign: "left",
            fontSize: 13,
            color: "var(--text-sub)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}
      {action}
      {(primaryCta || secondaryCta) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {primaryCta && (
            <button
              type="button"
              onClick={primaryCta.onClick}
              style={{
                background: "var(--accent)",
                border: "none",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "var(--radius-btn)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-body)",
              }}
            >
              {primaryCta.icon}
              {primaryCta.label}
            </button>
          )}
          {secondaryCta && (
            <button
              type="button"
              onClick={secondaryCta.onClick}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "10px 20px",
                borderRadius: "var(--radius-btn)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {secondaryCta.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
