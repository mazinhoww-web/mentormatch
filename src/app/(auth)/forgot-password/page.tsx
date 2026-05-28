"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail, Lock, Send } from "lucide-react"

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { useTenantRouter } from "@/hooks/use-tenant-router"
import { TenantBrandMark } from "@/components/brand/TenantBrandMark"

export default function ForgotPasswordPage() {
  const { hrefTenant } = useTenantRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setError(null)
    try {
      const response = await fetch("/mentormatch/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      })

      if (!response.ok) {
        const body = await response.json()
        setError(body.message || "Erro ao enviar e-mail. Tente novamente.")
        return
      }

      setSuccess(true)
    } catch {
      setError("Erro de conexao. Tente novamente.")
    }
  }

  const pageStyle: React.CSSProperties = {
    background: "var(--background)",
    color: "var(--foreground)",
    fontFamily: "var(--font-body, var(--font-sans))",
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-card, 0 2px 4px 0 rgba(0,0,0,0.05))",
    color: "var(--card-foreground)",
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 md:p-10"
        style={pageStyle}
      >
        <main className="w-full max-w-[420px] relative z-10">
          <div className="flex justify-center mb-8">
            <TenantBrandMark size="md" />
          </div>

          <div className="rounded-xl p-8" style={cardStyle}>
            <div className="flex flex-col items-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={{
                  background:
                    "color-mix(in srgb, var(--primary) 12%, transparent)",
                  border: "1px solid var(--border)",
                }}
              >
                <Mail className="h-5 w-5" style={{ color: "var(--primary)" }} />
              </div>

              <h1
                className="text-[28px] leading-[36px] mb-3 text-center md:text-[32px] md:leading-[40px]"
                style={{
                  fontFamily: "var(--font-display, var(--font-heading))",
                  fontWeight: 300,
                }}
              >
                E-mail enviado
              </h1>
              <p
                className="text-[14px] leading-[20px] text-center mb-2 max-w-xs mx-auto"
                style={{ color: "var(--muted-foreground)" }}
              >
                Se uma conta com esse e-mail existir, voce recebera um link para
                redefinir sua senha. Verifique caixa de entrada e spam.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href={hrefTenant("/login")}
              className="inline-flex items-center gap-2 text-[12px] leading-[16px] tracking-[0.05em] font-medium transition-colors group"
              style={{ color: "var(--muted-foreground)" }}
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar ao login</span>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-10"
      style={pageStyle}
    >
      <main className="w-full max-w-[420px] relative z-10">
        <div className="flex justify-center mb-8">
          <TenantBrandMark size="md" />
        </div>

        <div className="rounded-xl p-8" style={cardStyle}>
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
              style={{
                background:
                  "color-mix(in srgb, var(--primary) 12%, transparent)",
                border: "1px solid var(--border)",
              }}
            >
              <Lock className="h-5 w-5" style={{ color: "var(--primary)" }} />
            </div>

            <h1
              className="text-[28px] leading-[36px] mb-3 text-center md:text-[32px] md:leading-[40px]"
              style={{
                fontFamily: "var(--font-display, var(--font-heading))",
                fontWeight: 300,
              }}
            >
              Recuperar acesso
            </h1>
            <p
              className="text-[14px] leading-[20px] text-center mb-8 max-w-xs mx-auto"
              style={{ color: "var(--muted-foreground)" }}
            >
              Enviaremos um link para voce redefinir sua senha.
            </p>

            {error && (
              <div
                className="w-full mb-4 rounded-lg p-3 text-sm"
                style={{
                  background:
                    "color-mix(in srgb, var(--destructive) 10%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--destructive) 30%, transparent)",
                  color: "var(--destructive)",
                }}
              >
                {error}
              </div>
            )}

            <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label
                  className="text-[12px] leading-[16px] tracking-[0.05em] font-medium block uppercase"
                  htmlFor="email"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                    className="w-full rounded-lg py-3 pl-10 pr-4 text-[14px] leading-[20px] outline-none transition-all duration-200 focus:ring-2 focus:ring-[color:var(--ring)] focus:border-[color:var(--ring)]"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--input)",
                      color: "var(--foreground)",
                    }}
                    
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm" style={{ color: "var(--destructive)" }}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-[14px] leading-[16px] tracking-[0.05em] font-semibold py-3 px-4 flex items-center justify-center gap-2 h-auto"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderRadius: "var(--radius-btn, 0.5rem)",
                }}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Enviar instrucoes</span>
                    <Send className="h-[18px] w-[18px]" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href={hrefTenant("/login")}
            className="inline-flex items-center gap-2 text-[12px] leading-[16px] tracking-[0.05em] font-medium transition-colors group"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar ao login</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
