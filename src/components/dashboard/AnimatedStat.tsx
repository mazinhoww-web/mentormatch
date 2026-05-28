"use client"

import { useEffect, useRef, useState } from "react"
import { useCounter } from "@/hooks/use-counter"

type Props = {
  value: number
  duration?: number
  suffix?: string
  className?: string
}

export function AnimatedStat({ value, duration = 900, suffix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [trigger, setTrigger] = useState(false)
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  useEffect(() => {
    if (reduced) {
      setTrigger(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setTrigger(true)
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  const display = useCounter(value, duration, trigger)
  const final = reduced ? value : display

  return (
    <span ref={ref} className={className}>
      {final}
      {suffix}
    </span>
  )
}
