"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Zap } from "lucide-react"

type Phase = 0 | 1 | 2

type CardProps = {
  side: "left" | "right"
  initials: string
  name: string
  role: string
  dept: string
  tags: string[]
  color: string
  offset: number
  matched: boolean
}

function ProfileCard({
  side,
  initials,
  name,
  role,
  dept,
  tags,
  color,
  offset,
  matched,
}: CardProps) {
  return (
    <div
      className="absolute w-[158px] rounded-lg border px-[18px] py-4"
      style={{
        [side]: 0,
        background: "#FFFFFF",
        borderColor: matched ? "#33820D" : "#CDD3CD",
        boxShadow: matched
          ? "0 4px 16px rgba(51,130,13,0.15)"
          : "0 2px 4px 0 #CDD3CD",
        transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        transform:
          side === "left"
            ? `translateX(${offset}px)`
            : `translateX(-${offset}px)`,
      }}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-nunito text-[13px] font-bold text-white"
          style={{ background: color }}
        >
          {initials}
        </div>
        <div>
          <div className="font-nunito text-[12px] font-bold leading-4 text-[#323C32]">
            {name}
          </div>
          <div className="font-nunito text-[10px] leading-[14px] text-[#5A645A]">
            {role}
          </div>
        </div>
      </div>
      <div className="mb-2 font-nunito text-[9px] font-bold uppercase tracking-[0.04em] text-[#33820D]">
        {dept}
      </div>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full px-1.5 py-0.5 font-nunito text-[9px] font-semibold text-[#323C32]"
            style={{ background: "#E1E6E1" }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export function SicrediMatchPreview() {
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
      timeoutsRef.current.push(setTimeout(() => setPhase(1), 1400))
      timeoutsRef.current.push(setTimeout(() => setPhase(2), 3000))
      timeoutsRef.current.push(setTimeout(() => cycle(), 5800))
    }
    timeoutsRef.current.push(setTimeout(() => cycle(), 800))
    return clearAll
  }, [])

  const offset = phase === 2 ? 56 : phase === 1 ? 28 : 0
  const lineW = phase >= 1 ? 20 : 0
  const matched = phase === 2

  return (
    <div className="relative mx-auto flex h-[190px] w-full max-w-[400px] items-center justify-center">
      <ProfileCard
        side="left"
        initials="AC"
        name="Ana Costa"
        role="Gerente de Marketing"
        dept="Marketing & Crescimento"
        tags={["Brand", "Estrategia", "GTM"]}
        color="#33820D"
        offset={offset}
        matched={matched}
      />
      <ProfileCard
        side="right"
        initials="PL"
        name="Pedro Lima"
        role="Analista de Dados"
        dept="Analytics & BI"
        tags={["SQL", "BI", "Python"]}
        color="#26610A"
        offset={offset}
        matched={matched}
      />

      <div className="relative z-10 flex items-center">
        <div
          className="h-0.5 rounded-sm transition-all duration-[400ms]"
          style={{
            width: lineW,
            background: matched ? "#33820D" : "#CDD3CD",
          }}
        />
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-[350ms]"
          style={{
            background: matched ? "#D7E6C8" : "#FAFAFA",
            border: `2px solid ${matched ? "#33820D" : "#CDD3CD"}`,
            transform: matched ? "scale(1.15)" : "scale(1)",
            boxShadow: matched ? "0 4px 12px rgba(51,130,13,0.25)" : "none",
          }}
        >
          {matched ? (
            <Check size={13} color="#33820D" strokeWidth={2.5} />
          ) : (
            <Zap size={13} color={phase === 1 ? "#33820D" : "#828A82"} />
          )}
        </div>
        <div
          className="h-0.5 rounded-sm transition-all duration-[400ms]"
          style={{
            width: lineW,
            background: matched ? "#33820D" : "#CDD3CD",
          }}
        />
      </div>

      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full border px-3 py-0.5 font-nunito text-[10px] font-bold transition-opacity duration-300"
        style={{
          bottom: -4,
          background: "#D7E6C8",
          borderColor: "#33820D",
          color: "#0A4B1E",
          opacity: matched ? 1 : 0,
          whiteSpace: "nowrap",
        }}
      >
        Match realizado
      </div>
    </div>
  )
}
