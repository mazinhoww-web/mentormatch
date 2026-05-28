type SkeletonProps = {
  width?: string | number
  height?: string | number
  radius?: string
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({
  width = "100%",
  height = 16,
  radius,
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: radius ?? "var(--radius-chip)",
        background: "var(--border)",
        animation: "skeleton-pulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  )
}
