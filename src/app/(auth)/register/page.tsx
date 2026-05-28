"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react"

import { registerSchema, type RegisterInput } from "@/lib/validations"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTenantRouter } from "@/hooks/use-tenant-router"
import { Button } from "@/components/ui/button"
import { featureFlags } from "@/lib/feature-flags"
import { TenantBrandMark } from "@/components/brand/TenantBrandMark"

interface InvitationData {
  valid: boolean
  email?: string
  role?: string
  tenantId?: string
  reason?: string
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--background)" }}
        >
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: "var(--primary)" }}
          />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}

function inputBaseStyle(): React.CSSProperties {
  return {
    background: "var(--background)",
    border: "1px solid var(--input)",
    color: "var(--foreground)",
  }
}

function RegisterForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { isAuthenticated } = useCurrentUser()
  const { pushTenant, hrefTenant } = useTenantRouter()

  useEffect(() => {
    if (isAuthenticated && !token) {
      pushTenant("/dashboard")
    }
  }, [isAuthenticated, token, pushTenant])

  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [invitationLoading, setInvitationLoading] = useState(!!token)

  const {
    register: registerField,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  useEffect(() => {
    if (token) {
      setInvitationLoading(true)
      fetch(`/mentormatch/api/invitations/${token}`)
        .then((res) => res.json())
        .then((data: InvitationData) => {
          setInvitation(data)
          if (data.valid && data.email) {
            setValue("email", data.email)
          }
          if (!data.valid) {
            setError(data.reason || "Convite invalido ou expirado.")
          }
        })
        .catch(() => {
          setError("Erro ao validar convite.")
          setInvitation({ valid: false })
        })
        .finally(() => setInvitationLoading(false))
    }
  }, [token, setValue])

  if (!featureFlags.publicRegistration && !token) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-10"
        style={{
          background: "var(--background)",
          fontFamily: "var(--font-body, var(--font-sans))",
        }}
      >
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="mb-8">
            <TenantBrandMark size="lg" />
          </div>
          <div
            className="w-full rounded-2xl p-8 text-center"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-card, 0 2px 4px 0 rgba(0,0,0,0.05))",
              color: "var(--card-foreground)",
            }}
          >
            <h1
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: "var(--font-display, var(--font-heading))" }}
            >
              Registro fechado
            </h1>
            <p
              className="text-sm mb-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              Registro fechado. Solicite um convite ao administrador.
            </p>
            <Link
              href={hrefTenant("/login")}
              className="font-medium hover:underline text-sm"
              style={{ color: "var(--primary)" }}
            >
              Voltar para login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  async function onSubmit(data: RegisterInput) {
    setError(null)

    try {
      const response = await fetch("/mentormatch/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          ...(token ? { invitationToken: token } : {}),
        }),
      })

      if (!response.ok) {
        const body = await response.json()
        setError(body.error || body.message || "Erro ao criar conta. Tente novamente.")
        return
      }

      if (token && invitation?.valid) {
        await fetch(`/mentormatch/api/invitations/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ used: true }),
        })
      }

      const loginResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (loginResult?.error) {
        pushTenant("/login")
        return
      }

      pushTenant("/select-profile")
    } catch {
      setError("Erro de conexao. Tente novamente.")
    }
  }

  if (invitationLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-10"
        style={{ background: "var(--background)" }}
      >
        <div
          className="flex items-center gap-2"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Validando convite...</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body, var(--font-sans))",
      }}
    >
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8">
          <TenantBrandMark size="lg" />
        </div>

        <div
          className="w-full rounded-2xl p-8"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card, 0 2px 4px 0 rgba(0,0,0,0.05))",
            color: "var(--card-foreground)",
          }}
        >
          <div className="mb-6 text-center">
            <h1
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-display, var(--font-heading))" }}
            >
              Criar conta
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              {invitation?.valid
                ? "Voce foi convidado. Preencha seus dados para criar sua conta."
                : "Preencha seus dados para comecar na plataforma."}
            </p>
          </div>

          {error && (
            <div
              className="mb-4 rounded-lg p-3 text-sm"
              style={{
                background:
                  "color-mix(in srgb, var(--destructive) 10%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--destructive) 30%, transparent)",
                color: "var(--destructive)",
              }}
            >
              {error}
              {error.includes("email") && (
                <>
                  {" "}
                  <Link
                    href={hrefTenant("/login")}
                    className="font-semibold hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    Fazer login
                  </Link>
                </>
              )}
            </div>
          )}

          {(!token || invitation?.valid) && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Nome completo
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                  <input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    className="h-11 w-full rounded-lg pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)] focus:border-[color:var(--ring)]"
                    style={inputBaseStyle()}
                    {...registerField("name")}
                  />
                </div>
                {errors.name && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--destructive)" }}
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                  <input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    readOnly={!!invitation?.valid}
                    className="h-11 w-full rounded-lg pl-10 pr-3 text-sm outline-none disabled:cursor-not-allowed focus:ring-2 focus:ring-[color:var(--ring)] focus:border-[color:var(--ring)]"
                    style={inputBaseStyle()}
                    {...registerField("email")}
                  />
                </div>
                {errors.email && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--destructive)" }}
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    className="h-11 w-full rounded-lg pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)] focus:border-[color:var(--ring)]"
                    style={inputBaseStyle()}
                    {...registerField("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--destructive)" }}
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Confirmar senha
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                    className="h-11 w-full rounded-lg pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-[color:var(--ring)] focus:border-[color:var(--ring)]"
                    style={inputBaseStyle()}
                    {...registerField("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--destructive)" }}
                  >
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full text-sm font-semibold"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderRadius: "var(--radius-btn, 0.5rem)",
                }}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Criar conta
              </Button>

              <p
                className="text-center text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                Ja tem uma conta?{" "}
                <Link
                  href={hrefTenant("/login")}
                  className="font-medium hover:underline"
                  style={{ color: "var(--primary)" }}
                >
                  Entrar
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
