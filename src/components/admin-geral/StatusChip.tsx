type Status = "active" | "building" | "inactive"

const styles: Record<Status, { label: string; bg: string; color: string; border: string }> = {
  active: {
    label: "Ativo",
    bg: "rgba(16,185,129,0.12)",
    color: "#10B981",
    border: "rgba(16,185,129,0.3)",
  },
  building: {
    label: "Provisionando",
    bg: "rgba(245,158,11,0.12)",
    color: "#F59E0B",
    border: "rgba(245,158,11,0.3)",
  },
  inactive: {
    label: "Inativo",
    bg: "rgba(107,114,128,0.12)",
    color: "#6B7280",
    border: "rgba(107,114,128,0.3)",
  },
}

export function StatusChip({ status }: { status: Status }) {
  const s = styles[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[10px] font-bold"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      <span
        className="inline-block h-1 w-1 rounded-full"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  )
}
