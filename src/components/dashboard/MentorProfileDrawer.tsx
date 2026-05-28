"use client"

import { useEffect, useState, useTransition } from "react"
import { Loader2, Star, X } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/toast"
import { sendConnectionRequest } from "@/app/actions/connections"

type Mentor = {
  id: string
  name: string
  image?: string | null
  headline?: string | null
  bio?: string | null
  rating?: number
  reviewsCount?: number
  skills: string[]
  availability?: string[]
  available?: boolean
  vagas?: number
}

type Props = {
  mentor: Mentor | null
  open: boolean
  onClose: () => void
  menteeId: string
  tenantId: string
}

export function MentorProfileDrawer({ mentor, open, onClose, menteeId, tenantId }: Props) {
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !mentor) return null

  function handleSend() {
    if (!mentor) return
    startTransition(async () => {
      try {
        await sendConnectionRequest(mentor.id, menteeId, message.trim() || undefined, tenantId)
        toast(`Solicitacao enviada para ${mentor.name}`, "success")
        setMessage("")
        onClose()
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao enviar solicitacao"
        toast(msg, "error")
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 250,
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeUp 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-elevated)",
          borderLeft: "1px solid var(--border)",
          color: "var(--text)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          overflowY: "auto",
          animation: "modal-pop-in 0.22s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>
            Conectar com mentor
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Avatar src={mentor.image} name={mentor.name} size="xl" className="w-16 h-16" />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" }}>{mentor.name}</div>
            {mentor.headline && (
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{mentor.headline}</div>
            )}
            {typeof mentor.vagas === "number" && (
              <div
                style={{
                  fontSize: 11,
                  color: mentor.available ? "var(--green)" : "var(--amber)",
                  marginTop: 4,
                  fontWeight: 700,
                }}
              >
                {mentor.available ? `${mentor.vagas} vagas disponiveis` : "Sem vagas no momento"}
              </div>
            )}
          </div>
        </div>
        {mentor.rating !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Star size={14} fill="var(--amber)" color="var(--amber)" />
            <span style={{ fontSize: 13, fontWeight: 700 }}>{mentor.rating.toFixed(1)}</span>
            {mentor.reviewsCount !== undefined && (
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                ({mentor.reviewsCount} avaliacoes)
              </span>
            )}
          </div>
        )}
        {mentor.bio && (
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--text-sub)" }}>{mentor.bio}</p>
        )}
        {mentor.skills.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>
              Habilidades
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {mentor.skills.map((s) => (
                <span
                  key={s}
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--accent)",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "var(--radius-chip)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {mentor.availability && mentor.availability.length > 0 && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase" }}>
              Disponibilidade
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {mentor.availability.map((a) => (
                <span
                  key={a}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-sub)",
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: "var(--radius-chip)",
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
            Mensagem (opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Conte por que voce quer ser mentorado(a)"
            style={{
              width: "100%",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-btn)",
              color: "var(--text)",
              padding: "10px 12px",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              resize: "vertical",
              outline: "none",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: "auto" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            style={{
              flex: 1,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-sub)",
              padding: "10px",
              borderRadius: "var(--radius-btn)",
              fontSize: 13,
              fontWeight: 600,
              cursor: pending ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={pending}
            style={{
              flex: 1,
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              padding: "10px",
              borderRadius: "var(--radius-btn)",
              fontSize: 13,
              fontWeight: 700,
              cursor: pending ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: pending ? 0.7 : 1,
            }}
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            Enviar solicitacao
          </button>
        </div>
      </div>
    </div>
  )
}
