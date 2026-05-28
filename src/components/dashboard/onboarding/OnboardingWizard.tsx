"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Camera, Check, Loader2 } from "lucide-react"
import { WeeklyAvailabilityPicker, type WeeklyAvailability } from "@/components/dashboard/profile/WeeklyAvailabilityPicker"
import { useToast } from "@/components/ui/toast"
import { useCurrentUser } from "@/hooks/use-current-user"
import { completeOnboarding } from "@/app/actions/onboarding"

const STEPS = [
  { key: "role", label: "Tipo" },
  { key: "profile", label: "Perfil" },
  { key: "availability", label: "Disponibilidade" },
  { key: "done", label: "Pronto" },
]

const TIMEZONES = ["America/Sao_Paulo", "America/Manaus", "America/Recife", "America/Cuiaba"]

export function OnboardingWizard() {
  const { user } = useCurrentUser()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [name, setName] = useState(user?.name ?? "")
  const [bio, setBio] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [availability, setAvailability] = useState<WeeklyAvailability>({})
  const [timezone, setTimezone] = useState("America/Sao_Paulo")
  const [maxMentees, setMaxMentees] = useState(4)
  const [pending, startTransition] = useTransition()

  function next() {
    if (step < 2) setStep(step + 1)
    else finish(false)
  }

  function skip() {
    finish(true)
  }

  function finish(skipped: boolean) {
    startTransition(async () => {
      const result = await completeOnboarding({
        name: name.trim() || user?.name || "",
        bio: bio.trim() || null,
        linkedin: linkedin.trim() || null,
        availability,
        timezone,
        maxMentees,
        skipped,
      })
      if (result.ok) {
        toast("Perfil configurado!", "success")
        router.push("/")
        router.refresh()
      } else {
        toast(result.error ?? "Erro ao concluir onboarding", "error")
      }
    })
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 16px",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {STEPS.map((s, i) => {
            const done = i + 1 < step + 1
            const isActive = i + 1 === step + 1
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "0 0 auto" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: done ? "var(--accent)" : "var(--surface)",
                    border: `1px solid ${done ? "var(--accent)" : "var(--border)"}`,
                    color: done ? "#fff" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {done && i + 1 < step + 1 && !isActive ? <Check size={12} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: i < step ? "var(--accent)" : "var(--border)",
                      margin: "0 6px",
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-card)",
            padding: 28,
          }}
        >
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)" }}>
                Conte um pouco sobre voce
              </h2>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
                  Nome completo
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle()}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
                  Bio ({bio.length}/280)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 280))}
                  rows={3}
                  style={{ ...inputStyle(), resize: "vertical" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
                  LinkedIn (opcional)
                </label>
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/seuusuario"
                  style={inputStyle()}
                />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
                  Foto (opcional)
                </label>
                <button
                  type="button"
                  onClick={() => setPhotoUrl(photoUrl ? null : "/mentormatch/sicredi-logo.png")}
                  style={{
                    background: "var(--surface)",
                    border: "1px dashed var(--border)",
                    borderRadius: "var(--radius-btn)",
                    padding: "12px 16px",
                    color: "var(--text-sub)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <Camera size={14} />
                  {photoUrl ? "Foto adicionada" : "Adicionar foto"}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-display)" }}>
                Quando voce esta disponivel?
              </h2>
              <WeeklyAvailabilityPicker value={availability} onChange={setAvailability} />
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
                  Fuso horario
                </label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={inputStyle()}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>
              {user?.role === "MENTOR" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-sub)", display: "block", marginBottom: 4 }}>
                    Vagas para mentorados: {maxMentees}
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={maxMentees}
                    onChange={(e) => setMaxMentees(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <button
            type="button"
            onClick={skip}
            disabled={pending}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-sub)",
              fontSize: 13,
              cursor: pending ? "not-allowed" : "pointer",
              padding: "10px 14px",
            }}
          >
            Pular por agora
          </button>
          <button
            type="button"
            onClick={next}
            disabled={pending}
            style={{
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              padding: "12px 22px",
              borderRadius: "var(--radius-btn)",
              fontSize: 13,
              fontWeight: 700,
              cursor: pending ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              opacity: pending ? 0.6 : 1,
            }}
          >
            {pending && <Loader2 size={14} className="animate-spin" />}
            {step === 2 ? "Ir para o Dashboard" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  )
}

function inputStyle(): React.CSSProperties {
  return {
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
}
