import { Skeleton } from "./Skeleton"

export function SkeletonMentorCard() {
  return (
    <div
      style={{
        background: "var(--glass)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: 20,
      }}
    >
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <Skeleton width={40} height={40} radius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton width="60%" height={13} style={{ marginBottom: 6 }} />
          <Skeleton width="40%" height={11} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        <Skeleton width={50} height={20} />
        <Skeleton width={40} height={20} />
        <Skeleton width={55} height={20} />
      </div>
      <Skeleton height={32} radius="var(--radius-btn)" />
    </div>
  )
}
