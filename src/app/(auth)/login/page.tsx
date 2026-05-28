"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, GraduationCap } from "lucide-react"

import { loginSchema, type LoginInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { featureFlags } from "@/lib/feature-flags"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTenantRouter } from "@/hooks/use-tenant-router"

export default function LoginPage() {
  const { isAuthenticated } = useCurrentUser()
  const { pushTenant, hrefTenant } = useTenantRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      pushTenant("/dashboard")
    }
  }, [isAuthenticated, pushTenant])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setError(null)

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email ou senha incorretos. Tente novamente.")
      return
    }

    pushTenant("/dashboard")
  }

  async function handleMagicLink() {
    // Magic link placeholder
  }

  return (
    <div className="bg-[#F8FAFC] text-[#131b2e] min-h-screen flex items-center justify-center font-sans selection:bg-blue-600 selection:text-[#eeefff] overflow-hidden relative">
      {/* Floating background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#dae2fd]/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#dae2fd]/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "4s", animationDelay: "2s" }} />
        <div className="absolute top-20 right-[15%] w-12 h-12 border-2 border-[#8d90a0]/20 rounded-xl rotate-12 animate-[float-shape_10s_ease-in-out_infinite]" />
        <div className="absolute bottom-40 left-[10%] w-8 h-8 bg-[#dae2fd] rounded-full animate-[float-shape_10s_ease-in-out_infinite]" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 left-[5%] w-16 h-16 border border-[#dae2fd] rounded-full animate-[float-shape_10s_ease-in-out_infinite]" style={{ animationDelay: "3s" }} />
      </div>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[480px] px-4 md:px-10">
        <div className="animate-[reveal-card_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards] rounded-[1.25rem] p-[1px] bg-gradient-to-b from-[#dae2fd] via-[#E2E8F0]/30 to-transparent shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="bg-white/80 backdrop-blur-xl rounded-[calc(1.25rem-1px)] p-8 md:p-12 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden">
            {/* Inner gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#dae2fd]/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10">
              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#b4c5ff] flex items-center justify-center text-[#002a78] shadow-sm mb-4 animate-[pulse-glow_3s_infinite]">
                  <GraduationCap className="h-9 w-9" />
                </div>
                <span className="font-heading text-[28px] leading-[34px] font-bold text-[#131b2e]">MentorMatch</span>
              </div>

              {/* Heading */}
              <div className="mb-8 text-center">
                <h2 className="font-heading text-[20px] leading-[28px] font-semibold text-[#131b2e]">Acesse sua conta</h2>
                <p className="text-[14px] leading-[20px] text-[#434655] mt-2">Bem-vindo de volta! Por favor, insira seus dados.</p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {/* Email field */}
                <div className="space-y-2">
                  <label className="block text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]" htmlFor="email">
                    E-mail
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#004ac6] text-[#737686]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      className="block w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#131b2e] text-[14px] leading-[20px] placeholder:text-[#737686]/60 focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all duration-200"
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

                {/* Magic Link Button */}
                {featureFlags.magicLink && (
                  <>
                    <Button
                      type="button"
                      onClick={handleMagicLink}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-[#eeefff] py-3.5 px-4 rounded-lg text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:bg-[#b4c5ff] hover:text-[#002a78] hover:shadow-md transition-all active:scale-[0.98] duration-200 mt-2 h-auto"
                    >
                      <Sparkles className="h-5 w-5" />
                      Entrar com Link Magico
                    </Button>

                    {/* Divider */}
                    <div className="relative flex items-center py-4">
                      <div className="flex-grow border-t border-[#E2E8F0]/30" />
                      <span className="flex-shrink-0 mx-4 text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#737686] uppercase">ou</span>
                      <div className="flex-grow border-t border-[#E2E8F0]/30" />
                    </div>
                  </>
                )}

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#131b2e]" htmlFor="password">
                      Senha
                    </label>
                    <Link
                      href={hrefTenant("/forgot-password")}
                      className="text-[12px] leading-[16px] tracking-[0.05em] font-medium text-[#004ac6] hover:text-[#004ac6] hover:underline transition-colors"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#004ac6] text-[#737686]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      className="block w-full pl-10 pr-12 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[#131b2e] text-[14px] leading-[20px] placeholder:text-[#737686]/60 focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all duration-200"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737686] hover:text-[#131b2e] focus:outline-none transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5 text-[#004ac6]" />
                      ) : (
                        <EyeOff className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                {/* Login with Password Button */}
                <Button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  className="w-full flex items-center justify-center bg-transparent border border-[#E2E8F0]/50 text-[#131b2e] py-3 px-4 rounded-lg text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:border-[#004ac6] hover:text-[#004ac6] hover:bg-[#004ac6]/5 transition-all active:scale-[0.98] duration-200 mt-2 h-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Entrar com Senha
                </Button>
              </form>

              {/* Bottom link */}
              <div className="mt-8 text-center">
                <p className="text-[14px] leading-[20px] text-[#434655]">
                  Ainda nao faz parte?
                  <Link href={hrefTenant("/register")} className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold text-[#004ac6] hover:underline hover:text-[#004ac6] ml-1 transition-colors">
                    Solicitar acesso
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
