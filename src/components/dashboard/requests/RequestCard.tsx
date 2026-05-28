"use client"

import { useState, useTransition } from "react"
import { Check, X } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { ConfirmModal } from "@/components/ui/modal"
import { useToast } from "@/components/ui/toast"
import { acceptRequest, rejectRequest } from "@/app/actions/requests"

type Props = {
  id: string
  name: string
  role?: string | null
  company?: string | null
  image?: string | null
  date: string
  skills: string[]
}

export function RequestCard({ id, name, role, company, image, date, skills }: Props) {
  const { toast } = useToast()
  const [confirm, setConfirm] = useState<"accept" | "reject" | null>(null)
  const [pending, startTransition] = useTransition()

  function handleAccept() {
    setConfirm(null)
    startTransition(async () => {
      try {
        await acceptRequest(id)
        toast(`Solicitacao de ${name} aceita`, "success")
      } catch {
        toast("Erro ao aceitar solicitacao", "error")
      }
    })
  }

  function handleReject() {
    setConfirm(null)
    startTransition(async () => {
      try {
        await rejectRequest(id)
        toast(`Solicitacao de ${name} recusada`, "info")
      } catch {
        toast("Erro ao recusar solicitacao", "error")
      }
    })
  }

  return (
    <div
      style={{
        background: "var(--glass)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.2s ease, transform 0.2s ease",
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <Avatar src={image} name={name} size="md" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-display)" }}>
            {name}
          </div>
          {(role || company) && (
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {[role, company].filter(Boolean).join(" - ")}
            </div>
          )}
        </div>
        <span style={{ fontSize: 11, color: "var(--text-sub)" }}>{date}</span>
      </div>
      {skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {skills.slice(0, 4).map((s) => (
            <span
              key={s}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-sub)",
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-chip)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          type="button"
          onClick={() => setConfirm("accept")}
          disabled={pending}
          style={{
            flex: 1,
            background: "var(--green)",
            border: "none",
            color: "#fff",
            padding: "8px",
            borderRadius: "var(--radius-btn)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            opacity: pending ? 0.6 : 1,
          }}
        >
          <Check size={13} /> Aceitar
        </button>
        <button
          type="button"
          onClick={() => setConfirm("reject")}
          disabled={pending}
          style={{
            flex: 1,
            background: "transparent",
            border: "1px solid var(--red)",
            color: "var(--red)",
            padding: "8px",
            borderRadius: "var(--radius-btn)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            opacity: pending ? 0.6 : 1,
          }}
        >
          <X size={13} /> Recusar
        </button>
      </div>
      <ConfirmModal
        open={confirm === "accept"}
        onClose={() => setConfirm(null)}
        onConfirm={handleAccept}
        variant="success"
        title={`Aceitar ${name}?`}
        description="O mentorado sera adicionado a sua lista ativa."
        confirmLabel="Aceitar"
        loading={pending}
      />
      <ConfirmModal
        open={confirm === "reject"}
        onClose={() => setConfirm(null)}
        onConfirm={handleReject}
        variant="danger"
        title={`Recusar ${name}?`}
        description="A solicitacao sera removida. O mentorado pode tentar novamente depois."
        confirmLabel="Recusar"
        loading={pending}
      />
    </div>
  )
}
