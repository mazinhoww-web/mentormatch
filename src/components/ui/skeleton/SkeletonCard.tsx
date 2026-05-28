import { Skeleton } from "./Skeleton"

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--glass)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: 22,
      }}
    >
      <Skeleton width={36} height={36} radius="10px" style={{ marginBottom: 14 }} />
      <Skeleton width="40%" height={28} style={{ marginBottom: 8 }} />
      <Skeleton width="70%" height={12} />
    </div>
  )
}
