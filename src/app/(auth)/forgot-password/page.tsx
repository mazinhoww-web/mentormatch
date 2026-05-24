"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail, Lock, GraduationCap, ChevronRight } from "lucide-react"

import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordPage() {
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
      const response = await fetch("/api/auth/forgot-password", {
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

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0f1e] px-4">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <GraduationCap className="h-5 w-5 text-blue-400" />
            </div>
            <span className="text-xl font-bold text-white">MentorMatch</span>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700/50">
              <Mail className="h-7 w-7 text-blue-400" />
            </div>
          </div>

          <h1 className="mb-3 text-2xl font-semibold text-white">E-mail enviado!</h1>
          <p className="mb-8 text-sm leading-relaxed text-gray-400">
            Se uma conta com esse e-mail existir, voce recebera um link para
            redefinir sua senha. Verifique sua caixa de entrada e spam.
          </p>

          <Link href="/login">
            <Button
              variant="outline"
              className="h-11 w-full rounded-lg border-gray-700 bg-transparent text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <GraduationCap className="h-5 w-5 text-blue-400" />
          </div>
          <span className="text-xl font-bold text-white">MentorMatch</span>
        </div>

        {/* Lock icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-700/50">
            <Lock className="h-7 w-7 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">Recuperacao de Acesso</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Enviaremos um link para voce redefinir sua senha corporativa.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-5">
            <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              E-mail corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                id="email"
                type="email"
                placeholder="seu@empresa.com"
                className="h-11 w-full rounded-lg border border-gray-700 bg-gray-800/50 pl-10 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8]"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Enviar Instrucoes
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  )
}
