import { Skeleton } from "./Skeleton"

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            background: "var(--glass)",
            borderRadius: "var(--radius-card)",
            border: "1px solid var(--border)",
          }}
        >
          <Skeleton width={36} height={36} radius="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton width="50%" height={13} style={{ marginBottom: 6 }} />
            <Skeleton width="30%" height={10} />
          </div>
          <Skeleton width={60} height={24} radius="var(--radius-btn)" />
        </div>
      ))}
    </div>
  )
}
