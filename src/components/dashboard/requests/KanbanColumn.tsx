"use client"

import type { ReactNode } from "react"

type Props = {
  title: string
  icon: ReactNode
  count: number
  children: ReactNode
  emptyState?: ReactNode
}

export function KanbanColumn({ title, icon, count, children, emptyState }: Props) {
  const isEmpty = count === 0
  return (
    <div
      style={{
        background: "var(--bg-base)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 320,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          paddingBottom: 12,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ color: "var(--accent)", display: "flex" }}>{icon}</div>
        <h3
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text)",
            fontFamily: "var(--font-display)",
          }}
        >
          {title}
        </h3>
        <span
          style={{
            marginLeft: "auto",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-sub)",
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "var(--radius-chip)",
            fontFamily: "var(--font-body)",
          }}
        >
          {count}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {isEmpty ? emptyState : children}
      </div>
    </div>
  )
}
