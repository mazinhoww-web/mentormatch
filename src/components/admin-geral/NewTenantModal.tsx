"use client"

import { useRef, useState, useTransition } from "react"
import { AlertCircle, CheckCircle, Loader2, Upload, X } from "lucide-react"
import { createTenant } from "@/app/admin/actions"

type Props = {
  onClose: () => void
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export function NewTenantModal({ onClose }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [brandColor, setBrandColor] = useState("#4F46E5")
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.name.endsWith(".md")) setDesignFile(f)
  }

  function handleNext() {
    setError(null)
    if (step === 1) {
      if (!name.trim() || !slug.trim()) {
        setError("Nome e slug sao obrigatorios")
        return
      }
      setStep(2)
      return
    }
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append("name", name.trim())
      formData.append("slug", slug.trim())
      formData.append("brandColor", brandColor)
      if (designFile) formData.append("designMd", designFile)

      const result = await createTenant(formData)
      if (!result.ok) {
        setError(result.error)
        return
      }
      onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/[0.07]"
        style={{ background: "#13131e" }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
          <div>
            <div className="text-base font-bold text-[#EDEDEF]">Novo Tenant</div>
            <div className="mt-0.5 text-[12px] text-[#6B7280]">Passo {step} de 2</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex text-[#6B7280] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="h-[3px]"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(step / 2) * 100}%`,
              background: "linear-gradient(90deg, #4F46E5, #6366F1)",
            }}
          />
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[12px] text-red-300">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#9CA3AF]">
                  Nome do tenant *
                </label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setSlug(slugify(e.target.value))
                  }}
                  placeholder="Ex: MentorMatch Sicredi"
                  className="w-full rounded-lg border border-white/[0.07] px-3 py-2.5 text-[14px] text-[#EDEDEF] outline-none focus:border-indigo-500"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#9CA3AF]">
                  Slug da URL *
                </label>
                <div
                  className="flex items-center overflow-hidden rounded-lg border border-white/[0.07]"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <span className="border-r border-white/[0.07] px-3 py-2.5 text-[13px] text-[#6B7280] whitespace-nowrap">
                    /mentormatch/t/
                  </span>
                  <input
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="slug-do-tenant"
                    className="flex-1 border-0 bg-transparent px-3 py-2.5 text-[14px] text-[#EDEDEF] outline-none"
                  />
                </div>
                <div className="mt-1.5 text-[11px] text-[#6B7280]">
                  URL final: aurimarnogueira.com.br/mentormatch/t/{slug || "slug"}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#9CA3AF]">
                  Cor primaria
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded-lg border border-white/[0.07] bg-transparent"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 rounded-lg border border-white/[0.07] px-3 py-2.5 text-[14px] text-[#EDEDEF] outline-none focus:border-indigo-500"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-4 text-[13px] leading-relaxed text-[#9CA3AF]">
                Faca upload do arquivo{" "}
                <strong className="text-[#EDEDEF]">design.md</strong> do tenant.
                O arquivo sera salvo no Vercel Blob para provisionamento futuro
                de tema customizado.
              </div>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all"
                style={{
                  borderColor: dragging
                    ? "#4F46E5"
                    : designFile
                      ? "#10B981"
                      : "rgba(255,255,255,0.07)",
                  background: dragging
                    ? "rgba(79,70,229,0.05)"
                    : designFile
                      ? "rgba(16,185,129,0.05)"
                      : "rgba(255,255,255,0.04)",
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".md"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setDesignFile(f)
                  }}
                />
                {designFile ? (
                  <div>
                    <CheckCircle
                      size={32}
                      color="#10B981"
                      className="mx-auto mb-2.5"
                    />
                    <div className="text-[14px] font-semibold text-[#10B981]">
                      {designFile.name}
                    </div>
                    <div className="mt-1 text-[11px] text-[#6B7280]">
                      Clique para trocar o arquivo
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload
                      size={32}
                      color="#6B7280"
                      className="mx-auto mb-2.5"
                    />
                    <div className="text-[14px] font-semibold text-[#EDEDEF]">
                      Arraste o design.md aqui
                    </div>
                    <div className="mt-1 text-[12px] text-[#6B7280]">
                      ou clique para selecionar &middot; apenas .md
                    </div>
                  </div>
                )}
              </div>
              {!designFile && (
                <div
                  className="mt-3 rounded-lg border border-white/[0.07] px-3.5 py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-start gap-2 text-[11px] text-[#6B7280]">
                    <AlertCircle
                      size={13}
                      color="#F59E0B"
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span>
                      Sem design.md o tenant usa o tema base com a cor primaria
                      escolhida. Voce pode adicionar depois.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-white/[0.07] px-6 py-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              disabled={pending}
              className="rounded-lg border border-white/[0.07] px-5 py-2.5 text-[13px] font-semibold text-[#9CA3AF] disabled:opacity-60"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              Voltar
            </button>
          )}
          <button
            type="button"
            onClick={step === 1 ? handleNext : handleSubmit}
            disabled={pending || (step === 1 && (!name.trim() || !slug.trim()))}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(79,70,229,0.28)] disabled:opacity-60 disabled:shadow-none"
            style={{
              background:
                step === 1 && (!name.trim() || !slug.trim())
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(135deg, #4F46E5, #6366F1)",
            }}
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            {step === 2
              ? designFile
                ? "Criar tenant com design"
                : "Criar com tema base"
              : "Proximo"}
          </button>
        </div>
      </div>
    </div>
  )
}
