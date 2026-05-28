"use client"

import type { ReactNode } from "react"
import { useState } from "react"

type Tab = { key: string; label: string; content: ReactNode }

type Props = { tabs: Tab[] }

export function ProfileTabs({ tabs }: Props) {
  const [active, setActive] = useState(tabs[0]?.key)
  const current = tabs.find((t) => t.key === active) ?? tabs[0]
  return (
    <div>
      <div
        role="tablist"
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid var(--border)",
          marginBottom: 18,
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
                borderBottom: isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
                marginBottom: -1,
                fontFamily: "var(--font-body)",
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel">{current?.content}</div>
    </div>
  )
}
