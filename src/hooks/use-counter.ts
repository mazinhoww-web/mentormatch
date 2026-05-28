"use client"

import { useEffect, useRef, useState } from "react"

export function useCounter(target: number, duration: number, trigger: boolean): number {
  const [val, setVal] = useState(0)
  const hasFiredRef = useRef(false)
  const targetRef = useRef(target)

  useEffect(() => {
    targetRef.current = target
  }, [target])

  useEffect(() => {
    if (!trigger) return
    if (hasFiredRef.current) {
      // Already animated this session - jump to final value
      setVal(targetRef.current)
      return
    }
    hasFiredRef.current = true

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setVal(targetRef.current)
      return
    }

    let start: number | null = null
    let frameId = 0

    const step = (ts: number) => {
      if (start === null) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(ease * targetRef.current))
      if (p < 1) frameId = requestAnimationFrame(step)
      else setVal(targetRef.current)
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [duration, trigger])

  return val
}
