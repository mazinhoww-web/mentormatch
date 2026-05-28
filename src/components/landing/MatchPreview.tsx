"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Zap } from "lucide-react"

type Phase = 0 | 1 | 2

type CardProps = {
  side: "left" | "right"
  initials: string
  name: string
  role: string
  tags: string[]
  gradientFrom: string
  gradientTo: string
  tagBg: string
  tagText: string
  offset: number
  matched: boolean
}

function Card({
  side,
  initials,
  name,
  role,
  tags,
  gradientFrom,
  gradientTo,
  tagBg,
  tagText,
  offset,
  matched,
}: CardProps) {
  const translateX = side === "left" ? offset : -offset
  return (
    <div
      className="absolute w-[158px] rounded-2xl border px-5 py-[18px] backdrop-blur-xl"
      style={{
        [side]: 0,
        transform: `translateX(${translateX}px)`,
        background: "rgba(255,255,255,0.07)",
        borderColor: matched ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)",
        boxShadow: matched ? "0 0 24px rgba(16,185,129,0.2)" : "none",
        transition:
          "transform 0.65s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease, border-color 0.4s ease",
      }}
    >
      <div
        className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        {initials}
      </div>
      <div className="text-[13px] font-semibold text-[#EDEDEF]">{name}</div>
      <div className="mt-0.5 text-[11px] text-[#6B7280]">{role}</div>
      <div className="mt-2.5 flex flex-wrap gap-1">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded px-[7px] py-0.5 text-[9px] font-medium"
            style={{ background: tagBg, color: tagText }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export function MatchPreview() {
  const [phase, setPhase] = useState<Phase>(0)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const clearAll = () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t))
      timeoutsRef.current = []
    }

    const cycle = () => {
      clearAll()
      setPhase(0)
      timeoutsRef.current.push(setTimeout(() => setPhase(1), 1200))
      timeoutsRef.current.push(setTimeout(() => setPhase(2), 2800))
      timeoutsRef.current.push(setTimeout(() => cycle(), 5200))
    }

    timeoutsRef.current.push(setTimeout(() => cycle(), 600))

    return clearAll
  }, [])

  const offset = phase === 2 ? 68 : phase === 1 ? 36 : 0
  const lineW = phase === 2 ? 24 : phase === 1 ? 14 : 0
  const matched = phase === 2

  return (
    <div className="relative mx-auto flex h-[200px] w-full max-w-[420px] items-center justify-center">
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(79,70,229,0.1) 0%, transparent 70%)",
        }}
      />

      <Card
        side="left"
        initials="AM"
        name="Ana Mentor"
        role="Product Manager"
        tags={["PM", "UX", "Estrategia"]}
        gradientFrom="#6366F1"
        gradientTo="#4F46E5"
        tagBg="rgba(99,102,241,0.13)"
        tagText="rgba(99,102,241,0.8)"
        offset={offset}
        matched={matched}
      />
      <Card
        side="right"
        initials="CM"
        name="Carlos Dev"
        role="Dev Junior"
        tags={["React", "Node"]}
        gradientFrom="#8B5CF6"
        gradientTo="#7C3AED"
        tagBg="rgba(139,92,246,0.13)"
        tagText="rgba(139,92,246,0.8)"
        offset={offset}
        matched={matched}
      />

      <div className="relative z-10 flex items-center">
        <div
          className="h-0.5 rounded-sm transition-all duration-[450ms]"
          style={{
            width: lineW,
            background: matched ? "#10B981" : "#6366F1",
          }}
        />
        <div
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all duration-[400ms]"
          style={{
            background: matched
              ? "rgba(16,185,129,0.2)"
              : "rgba(99,102,241,0.15)",
            border: `2px solid ${matched ? "#10B981" : "#6366F1"}`,
            transform: matched ? "scale(1.2)" : "scale(1)",
            opacity: phase === 0 ? 0.3 : 1,
            boxShadow: matched ? "0 0 16px rgba(16,185,129,0.2)" : "none",
          }}
        >
          {matched ? (
            <Check size={14} color="#10B981" />
          ) : (
            <Zap size={14} color="#6366F1" />
          )}
        </div>
        <div
          className="h-0.5 rounded-sm transition-all duration-[450ms]"
          style={{
            width: lineW,
            background: matched ? "#10B981" : "#6366F1",
          }}
        />
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full border px-3.5 py-1 text-[11px] font-semibold transition-opacity duration-300"
        style={{
          bottom: -8,
          background: "rgba(16,185,129,0.12)",
          borderColor: "rgba(16,185,129,0.3)",
          color: "#10B981",
          opacity: matched ? 1 : 0,
          whiteSpace: "nowrap",
        }}
      >
        Match realizado
      </div>
    </div>
  )
}
