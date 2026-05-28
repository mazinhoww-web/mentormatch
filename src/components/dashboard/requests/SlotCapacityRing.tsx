"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  used: number
  total: number
  size?: number
}

export function SlotCapacityRing({ used, total, size = 96 }: Props) {
  const r = 36
  const circumference = 2 * Math.PI * r
  const target = circumference * (1 - Math.max(0, Math.min(1, used / total)))
  const [offset, setOffset] = useState(circumference)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setOffset(target)
      return
    }
    const start = performance.now()
    const duration = 900
    const from = circumference
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setOffset(from + (target - from) * ease)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, circumference])

  const free = total - used
  const color =
    free === 0 ? "var(--red)" : free === 1 ? "var(--amber)" : "var(--accent)"

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontFamily: "var(--font-display)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>
          {used}/{total}
        </div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          slots
        </div>
      </div>
    </div>
  )
}
