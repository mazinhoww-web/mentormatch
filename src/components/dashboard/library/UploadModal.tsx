"use client"

import { useRef, useState, useTransition } from "react"
import { CheckCircle, Loader2, Upload } from "lucide-react"
import { Modal, ModalFooter, ModalHeader } from "@/components/ui/modal"
import { useToast } from "@/components/ui/toast"
import { uploadMaterial } from "@/app/actions/library"

type Props = {
  open: boolean
  onClose: () => void
  tenantId: string
}

type DropState = "idle" | "dragging" | "uploading" | "success" | "error"

export function UploadModal({ open, onClose, tenantId }: Props) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<DropState>("idle")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Carreira")
  const [description, setDescription] = useState("")
  const [pending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setFile(null)
    setState("idle")
    setTitle("")
    setCategory("Carreira")
    setDescription("")
  }

  function handleClose() {
    if (pending) return
    reset()
    onClose()
  }

  function setSelectedFile(f: File | null) {
    setFile(f)
    if (f && !title) setTitle(f.name.replace(/\.[^.]+$/, ""))
  }

  function handleSubmit() {
    if (!file || !title.trim()) return
    setState("uploading")
    startTransition(async () => {
      try {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("title", title.trim())
        fd.append("category", category)
        fd.append("description", description.trim())
        fd.append("tenantId", tenantId)
        const result = await uploadMaterial(fd)
        if (result?.ok) {
          setState("success")
          toast("Material enviado", "success")
          setTimeout(handleClose, 800)
        } else {
          setState("error")
          toast(result?.error ?? "Erro ao enviar material", "error")
        }
      } catch {
        setState("error")
        toast("Erro ao enviar material", "error")
      }
    })
  }

  const dropBorderColor =
    state === "dragging"
      ? "var(--accent)"
      : state === "success"
        ? "var(--green)"
        : state === "error"
          ? "var(--red)"
          : "var(--border)"

  return (
    <Modal open={open} onClose={handleClose} size="md" ariaLabel="Enviar material">
      <ModalHeader title="Enviar material" onClose={handleClose} subtitle="PDF, video ou link" />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setState("dragging")
          }}
          onDragLeave={() => setState(file ? "success" : "idle")}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer.files[0]
            if (f) {
              setSelectedFile(f)
              setState("success")
            }
          }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dropBorderColor}`,
            borderRadius: "var(--radius-btn)",
            padding: "24px 16px",
            textAlign: "center",
            background:
              state === "dragging"
                ? "var(--accent-glow)"
                : state === "success"
                  ? "rgba(16,185,129,0.08)"
                  : "var(--surface)",
            cursor: pending ? "not-allowed" : "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <input
            ref={fileRef}
            type="file"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                setSelectedFile(f)
                setState("success")
              }
            }}
          />
          {state === "uploading" ? (
            <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 8px", color: "var(--accent)" }} />
          ) : file ? (
            <CheckCircle size={28} style={{ margin: "0 auto 8px", color: "var(--green)" }} />
          ) : (
            <Upload size={28} style={{ margin: "0 auto 8px", color: "var(--text-muted)" }} />
          )}
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
            {file ? file.name : "Arraste um arquivo ou clique para selecionar"}
          </div>
          {file && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              {(file.size / 1024).toFixed(1)} KB
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
            Titulo *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Frameworks de feedback 1:1"
            disabled={pending}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-btn)",
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={pending}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-btn)",
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              outline: "none",
            }}
          >
            {["Carreira", "Tecnico", "Soft Skills", "Lideranca"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
            Descricao (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Resumo curto para outros mentorados"
            rows={3}
            disabled={pending}
            style={{
              width: "100%",
              padding: "10px 12px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-btn)",
              color: "var(--text)",
              fontSize: 13,
              fontFamily: "var(--font-body)",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>
      </div>
      <ModalFooter>
        <button
          type="button"
          onClick={handleClose}
          disabled={pending}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-sub)",
            padding: "10px 18px",
            borderRadius: "var(--radius-btn)",
            fontSize: 13,
            fontWeight: 600,
            cursor: pending ? "not-allowed" : "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending || !file || !title.trim()}
          style={{
            background: "var(--accent)",
            border: "none",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: "var(--radius-btn)",
            fontSize: 13,
            fontWeight: 700,
            cursor: pending ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-body)",
            opacity: !file || !title.trim() ? 0.6 : 1,
          }}
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Enviar material
        </button>
      </ModalFooter>
    </Modal>
  )
}
