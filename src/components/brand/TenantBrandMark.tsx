"use client"

import Image from "next/image"
import { GraduationCap } from "lucide-react"
import { useTenant } from "@/components/providers/TenantContext"

type Size = "sm" | "md" | "lg"

const HEIGHT_BY_SIZE: Record<Size, number> = {
  sm: 32,
  md: 44,
  lg: 56,
}

export function TenantBrandMark({
  size = "md",
  className,
  align = "row",
}: {
  size?: Size
  className?: string
  align?: "row" | "stack"
}) {
  const tenant = useTenant()
  const h = HEIGHT_BY_SIZE[size]

  if (tenant.logoUrl) {
    return (
      <Image
        src={tenant.logoUrl}
        alt={tenant.name}
        width={h * 3}
        height={h}
        className={className}
        style={{ height: h, width: "auto", objectFit: "contain" }}
        unoptimized
        priority
      />
    )
  }

  return (
    <div
      className={`inline-flex items-center ${align === "stack" ? "flex-col gap-1" : "gap-2"} ${className ?? ""}`}
      style={{ color: "var(--primary, var(--accent, #004ac6))" }}
    >
      <span
        className="inline-flex items-center justify-center rounded-xl"
        style={{
          width: h * 0.85,
          height: h * 0.85,
          background: "var(--primary, var(--accent, #004ac6))",
          color: "#fff",
        }}
      >
        <GraduationCap style={{ width: h * 0.5, height: h * 0.5 }} />
      </span>
      <span
        className="font-bold"
        style={{
          fontFamily: "var(--font-display, var(--font-hanken-grotesk))",
          fontSize: h * 0.55,
          lineHeight: 1,
          color: "var(--foreground, #131b2e)",
        }}
      >
        {tenant.name || "MentorMatch"}
      </span>
    </div>
  )
}
