"use client"

import { useState, useEffect } from "react"

export function useCounter(target: number, duration: number, trigger: boolean): number {
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!trigger) return

    let start: number | null = null
    let frameId = 0

    const step = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(ease * target))
      if (p < 1) frameId = requestAnimationFrame(step)
    }

    frameId = requestAnimationFrame(step)

    return () => cancelAnimationFrame(frameId)
  }, [target, duration, trigger])

  return val
}
