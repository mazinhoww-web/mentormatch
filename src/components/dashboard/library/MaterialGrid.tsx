"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { MaterialCard, type MaterialFormat } from "./MaterialCard"
import { EmptyStateNoMaterials } from "@/components/ui/empty-state"
import { SkeletonMentorCard } from "@/components/ui/skeleton"

type MaterialItem = {
  id: string
  title: string
  format: MaterialFormat
  category?: string | null
  author?: string | null
  date: string
  thumbnailUrl?: string | null
  url?: string | null
  saved?: boolean
}

type Props = {
  items: MaterialItem[]
  loading?: boolean
  onToggleSave?: (id: string) => Promise<void> | void
  onUploadClick?: () => void
  categories?: string[]
}

export function MaterialGrid({
  items,
  loading = false,
  onToggleSave,
  onUploadClick,
  categories = ["Todos", "Carreira", "Tecnico", "Soft Skills", "Lideranca"],
}: Props) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Todos")

  const filtered = useMemo(() => {
    return items.filter((m) => {
      const matchQ = query
        ? m.title.toLowerCase().includes(query.toLowerCase())
        : true
      const matchC = category === "Todos" ? true : m.category === category
      return matchQ && matchC
    })
  }, [items, query, category])

  if (loading) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonMentorCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: "1 1 220px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-btn)",
            padding: "0 12px",
          }}
        >
          <Search size={14} color="var(--text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar material..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              padding: "10px 0",
              fontSize: 13,
              color: "var(--text)",
              fontFamily: "var(--font-body)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {categories.map((c) => {
            const isActive = category === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-chip)",
                  border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                  background: isActive ? "var(--accent)" : "transparent",
                  color: isActive ? "#fff" : "var(--text-sub)",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyStateNoMaterials
          primaryCta={
            onUploadClick
              ? { label: "Enviar primeiro material", onClick: onUploadClick }
              : undefined
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((m, i) => (
            <div
              key={m.id}
              style={{ animation: `fadeUp 0.4s ease ${i * 0.04}s both` }}
            >
              <MaterialCard {...m} onToggleSave={onToggleSave} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
