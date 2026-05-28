"use client"

import type { ReactNode } from "react"
import { useState } from "react"

type Tab = {
  key: string
  label: string
  count: number
  content: ReactNode
}

type Props = {
  tabs: Tab[]
  initialTab?: string
}

export function ConnectionTabs({ tabs, initialTab }: Props) {
  const [active, setActive] = useState(initialTab ?? tabs[0]?.key)
  const current = tabs.find((t) => t.key === active) ?? tabs[0]

  return (
    <div>
      <div
        role="tablist"
        aria-label="Conexoes"
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--border)",
          marginBottom: 16,
        }}
      >
        {tabs.map((t) => {
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.key)}
              style={{
                background: "transparent",
                border: "none",
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                position: "relative",
                fontFamily: "var(--font-body)",
                borderBottom: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    background: isActive ? "var(--accent)" : "var(--surface)",
                    color: isActive ? "#fff" : "var(--text-sub)",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: "var(--radius-chip)",
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <div role="tabpanel">{current?.content}</div>
    </div>
  )
}
