"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTenantRouter } from "@/hooks/use-tenant-router"

type Me = {
  id: string
  role: string | null
  tenant: { slug: string } | null
}

export default function WelcomePage() {
  const { update } = useSession()
  const { pushTenant } = useTenantRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        await update()
        const res = await fetch("/mentormatch/api/users/me")
        if (!res.ok) {
          pushTenant("/login")
          return
        }
        const data = await res.json()
        if (!data?.role) {
          pushTenant("/select-profile")
          return
        }
        setMe(data)
      } catch {
        pushTenant("/login")
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const role = me?.role
  const message =
    role === "MENTOR"
      ? "Seu perfil de mentor foi criado. Comece a receber mentorados e compartilhe sua experiencia."
      : role === "MENTEE"
        ? "Seu perfil foi criado com sucesso. Explore mentores e agende sua primeira sessao."
        : "Seu perfil foi criado com sucesso."

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-10 overflow-hidden relative"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body, var(--font-sans))",
      }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none z-0"
        style={{
          background: "color-mix(in srgb, var(--primary) 5%, transparent)",
        }}
      />

      <main className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <div className="relative mb-10">
          <div
            className="relative w-28 h-28 rounded-full flex items-center justify-center"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-md, 0 8px 24px rgba(0,0,0,0.08))",
            }}
          >
            <CheckCircle
              className="h-16 w-16"
              fill="currentColor"
              strokeWidth={0}
              style={{ color: "var(--primary)" }}
            />
          </div>
        </div>

        <h1
          className="text-[48px] leading-[56px] tracking-[-0.02em] font-light mb-4"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-display, var(--font-heading))",
          }}
        >
          Tudo pronto!
        </h1>
        <p
          className="text-[16px] leading-[24px] mb-12 max-w-[85%] mx-auto"
          style={{ color: "var(--muted-foreground)" }}
        >
          {message}
        </p>

        {loading ? (
          <Button
            disabled
            className="w-full h-14 text-[18px]"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              borderRadius: "var(--radius-btn, 0.5rem)",
            }}
          >
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando...
          </Button>
        ) : (
          <Button
            onClick={async () => {
              await update()
              pushTenant("/dashboard")
            }}
            className="w-full flex items-center justify-center gap-3 h-14 text-[18px] leading-[24px] font-semibold transition-all active:scale-[0.98] group"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              borderRadius: "var(--radius-btn, 0.5rem)",
              boxShadow: "var(--shadow-md, 0 8px 24px rgba(0,0,0,0.08))",
            }}
          >
            <span>Ir para o Dashboard</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </main>
    </div>
  )
}
