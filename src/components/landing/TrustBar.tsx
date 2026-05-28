"use client"

import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"
import { useCounter } from "@/hooks/use-counter"

export function TrustBar() {
  const ref = useRef<HTMLDivElement>(null)
  const [countersOn, setCountersOn] = useState(false)

  const mentorias = useCounter(2400, 1800, countersOn)
  const satisfacao = useCounter(98, 1400, countersOn)
  const empresas = useCounter(50, 1600, countersOn)

  useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCountersOn(true)
      },
      { threshold: 0.4 }
    )
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  const items = [
    { val: mentorias, suf: "+", lbl: "Mentorias realizadas" },
    { val: satisfacao, suf: "%", lbl: "Satisfacao dos usuarios" },
    { val: empresas, suf: "+", lbl: "Empresas ativas" },
  ]

  return (
    <div
      ref={ref}
      className="relative z-10 border-y border-slate-200 bg-slate-50 px-6 py-9 md:px-10"
    >
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-around gap-7">
        {items.map(({ val, suf, lbl }) => (
          <div key={lbl} className="text-center">
            <div
              className="bg-clip-text text-[40px] font-black leading-none tracking-[-0.03em] text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #004ac6, #2563eb)",
              }}
            >
              {val}
              {suf}
            </div>
            <div className="mt-1.5 text-xs text-slate-500">{lbl}</div>
          </div>
        ))}
        <div className="text-center">
          <div className="mb-1.5 text-[11px] text-slate-500">Avaliacao media</div>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={15}
                fill="#F59E0B"
                color="#F59E0B"
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="mt-1 text-[13px] font-bold text-slate-700">4.9 / 5.0</div>
        </div>
      </div>
    </div>
  )
}
