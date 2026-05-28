"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { changePassword } from "@/app/actions/profile"

export function PasswordChangeForm() {
  const { toast } = useToast()
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (next.length < 8) return toast("Nova senha precisa ter 8+ caracteres", "warning")
    if (next === current) return toast("Nova senha deve ser diferente da atual", "warning")
    if (confirm !== next) return toast("Confirmacao nao confere", "warning")
    startTransition(async () => {
      const result = await changePassword(current, next)
      if (result.ok) {
        toast("Senha atualizada", "success")
        setCurrent("")
        setNext("")
        setConfirm("")
      } else {
        toast(result.error ?? "Erro ao trocar senha", "error")
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-btn)",
    color: "var(--text)",
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: "var(--font-body)",
    outline: "none",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-sub)",
    marginBottom: 4,
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 380 }}>
      <div>
        <label style={labelStyle}>Senha atual</label>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Nova senha</label>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          minLength={8}
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle}>Confirmar nova senha</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={inputStyle}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        style={{
          background: "var(--accent)",
          border: "none",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "var(--radius-btn)",
          fontSize: 13,
          fontWeight: 700,
          cursor: pending ? "not-allowed" : "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "var(--font-body)",
          alignSelf: "flex-start",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending && <Loader2 size={14} className="animate-spin" />}
        Atualizar senha
      </button>
    </form>
  )
}
