"use client"

import { Check } from "lucide-react"

export type DayConfig = {
  enabled: boolean
  start: string
  end: string
}

export type WeeklyAvailability = Record<string, DayConfig>

const DAYS = [
  { key: "Dom", label: "Dom" },
  { key: "Seg", label: "Seg" },
  { key: "Ter", label: "Ter" },
  { key: "Qua", label: "Qua" },
  { key: "Qui", label: "Qui" },
  { key: "Sex", label: "Sex" },
  { key: "Sab", label: "Sab" },
]

type Props = {
  value: WeeklyAvailability
  onChange: (next: WeeklyAvailability) => void
}

export function WeeklyAvailabilityPicker({ value, onChange }: Props) {
  function toggle(day: string) {
    const existing = value[day] ?? { enabled: false, start: "09:00", end: "18:00" }
    onChange({ ...value, [day]: { ...existing, enabled: !existing.enabled } })
  }
  function updateTime(day: string, field: "start" | "end", val: string) {
    const existing = value[day] ?? { enabled: true, start: "09:00", end: "18:00" }
    onChange({ ...value, [day]: { ...existing, [field]: val } })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
        {DAYS.map((d) => {
          const config = value[d.key] ?? { enabled: false, start: "09:00", end: "18:00" }
          const isActive = config.enabled
          return (
            <button
              key={d.key}
              type="button"
              onClick={() => toggle(d.key)}
              style={{
                flex: "0 0 auto",
                background: isActive ? "var(--accent)" : "var(--surface)",
                color: isActive ? "#fff" : "var(--text-sub)",
                border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "var(--radius-chip)",
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontFamily: "var(--font-body)",
              }}
            >
              {isActive && <Check size={12} />}
              {d.label}
            </button>
          )
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {DAYS.filter((d) => value[d.key]?.enabled).map((d) => {
          const config = value[d.key]
          return (
            <div
              key={d.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-btn)",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", minWidth: 36 }}>
                {d.label}
              </span>
              <input
                type="time"
                value={config.start}
                onChange={(e) => updateTime(d.key, "start", e.target.value)}
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-btn)",
                  color: "var(--text)",
                  padding: "6px 8px",
                  fontSize: 12,
                  fontFamily: "var(--font-body)",
                }}
              />
              <span style={{ color: "var(--text-muted)" }}>-</span>
              <input
                type="time"
                value={config.end}
                onChange={(e) => updateTime(d.key, "end", e.target.value)}
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-btn)",
                  color: "var(--text)",
                  padding: "6px 8px",
                  fontSize: 12,
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
