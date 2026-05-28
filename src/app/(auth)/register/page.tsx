"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Lock, Eye, EyeOff, User, GraduationCap } from "lucide-react"

import { registerSchema, type RegisterInput } from "@/lib/validations"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTenantRouter } from "@/hooks/use-tenant-router"
import { Button } from "@/components/ui/button"
import { featureFlags } from "@/lib/feature-flags"

interface InvitationData {
  valid: boolean
  email?: string
  role?: string
  tenantId?: string
  reason?: string
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#faf8ff]"><Loader2 className="h-6 w-6 animate-spin text-[#004ac6]" /></div>}>
      <RegisterForm />
    </Suspense>
  )
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

  // If public registration is disabled and no token, show closed message
  if (!featureFlags.publicRegistration && !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb]">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">MentorMatch</span>
          </div>
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Registro fechado</h1>
            <p className="text-sm text-gray-500 mb-6">
              Registro fechado. Solicite um convite ao administrador.
            </p>
            <Link href={hrefTenant("/login")} className="font-medium text-[#2563eb] hover:underline text-sm">
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

      // Mark invitation as used if we have a token
      if (token && invitation?.valid) {
        await fetch(`/mentormatch/api/invitations/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ used: true }),
        })
      }

      // Auto-login after registration
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Validando convite...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
    <div className="w-full max-w-md flex flex-col items-center">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb]">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-900">MentorMatch</span>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Criar conta</h1>
          <p className="mt-2 text-sm text-gray-500">
            {invitation?.valid
              ? "Voce foi convidado! Preencha seus dados para criar sua conta."
              : "Preencha seus dados para comecar na plataforma."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
            {error.includes("email") && (
              <> <Link href={hrefTenant("/login")} className="font-semibold text-[#2563eb] hover:underline">Fazer login</Link></>
            )}
          </div>
        )}

        {/* Show form only if no invalid invitation */}
        {(!token || invitation?.valid) && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  {...registerField("name")}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  readOnly={!!invitation?.valid}
                  {...registerField("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  {...registerField("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="********"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  {...registerField("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8]"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar conta
            </Button>

            <p className="text-center text-sm text-gray-500">
              Ja tem uma conta?{" "}
              <Link href={hrefTenant("/login")} className="font-medium text-[#2563eb] hover:underline">
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
