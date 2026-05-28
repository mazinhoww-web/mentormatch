"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail, Lock, GraduationCap, Send } from "lucide-react"

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

  if (success) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex flex-col items-center justify-center p-4 md:p-10 antialiased selection:bg-blue-600 selection:text-[#eeefff]">
        <main className="w-full max-w-[420px] relative z-10">
          {/* Brand Anchor */}
          <div className="flex justify-center items-center gap-2 mb-8">
            <GraduationCap className="h-5 w-5 text-[#004ac6]" />
            <span className="text-[18px] leading-[24px] font-semibold text-[#004ac6] tracking-wide">MentorMatch</span>
          </div>

          {/* Success Card */}
          <div className="bg-[#171f33] border border-[#E2E8F0] rounded-xl p-8 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600 opacity-20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#dae2fd] border border-[#E2E8F0] flex items-center justify-center mb-6">
                <Mail className="h-5 w-5 text-[#004ac6]" />
              </div>

              <h1 className="text-[28px] leading-[36px] font-semibold text-[#131b2e] mb-3 text-center font-heading md:text-[32px] md:leading-[40px]">
                E-mail enviado!
              </h1>
              <p className="text-[14px] leading-[20px] text-[#434655] text-center mb-8 max-w-xs mx-auto">
                Se uma conta com esse e-mail existir, voce recebera um link para
                redefinir sua senha. Verifique sua caixa de entrada e spam.
              </p>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#434655] hover:text-[#004ac6] transition-colors group"
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
    <div className="bg-[#F8FAFC] min-h-screen flex flex-col items-center justify-center p-4 md:p-10 antialiased selection:bg-blue-600 selection:text-[#eeefff]">
      <main className="w-full max-w-[420px] relative z-10">
        {/* Brand Anchor */}
        <div className="flex justify-center items-center gap-2 mb-8">
          <GraduationCap className="h-5 w-5 text-[#004ac6]" />
          <span className="text-[18px] leading-[24px] font-semibold text-[#004ac6] tracking-wide">MentorMatch</span>
        </div>

        {/* Recovery Card */}
        <div className="bg-[#171f33] border border-[#E2E8F0] rounded-xl p-8 relative overflow-hidden">
          {/* Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600 opacity-20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-[#dae2fd] border border-[#E2E8F0] flex items-center justify-center mb-6">
              <Lock className="h-5 w-5 text-[#131b2e]" />
            </div>

            <h1 className="text-[28px] leading-[36px] font-semibold text-[#131b2e] mb-3 text-center font-heading md:text-[32px] md:leading-[40px]">
              Recuperacao de Acesso
            </h1>
            <p className="text-[14px] leading-[20px] text-[#434655] text-center mb-8 max-w-xs mx-auto">
              Enviaremos um link para voce redefinir sua sua senha.
            </p>

            {error && (
              <div className="w-full mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <label
                  className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#434655] block uppercase"
                  htmlFor="email"
                >
                  E-mail
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737686] group-focus-within:text-[#004ac6] transition-colors" />
                  <input
                    className="w-full bg-[#060e20] border border-[#E2E8F0] rounded-lg py-3 pl-10 pr-4 text-[14px] leading-[20px] text-[#131b2e] placeholder:text-[#737686]/50 focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#b4c5ff] transition-all duration-200"
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 text-[#eeefff] text-[12px] leading-[16px] tracking-[0.05em] font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#dbe1ff] hover:text-[#002a78] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#b4c5ff] focus:ring-offset-2 focus:ring-offset-[#171f33] h-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Enviar Instrucoes</span>
                    <Send className="h-[18px] w-[18px]" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Back to Login */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#434655] hover:text-[#004ac6] transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar ao login</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
