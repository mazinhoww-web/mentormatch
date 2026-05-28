"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react"

import { loginSchema, type LoginInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { featureFlags } from "@/lib/feature-flags"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useTenantRouter } from "@/hooks/use-tenant-router"
import { TenantBrandMark } from "@/components/brand/TenantBrandMark"

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
    <div
      className="min-h-screen flex items-center justify-center font-sans relative"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "var(--font-body, var(--font-sans))",
      }}
    >
      <main className="relative z-10 w-full max-w-[480px] px-4 md:px-10">
        <div
          className="rounded-2xl p-[1px]"
          style={{
            background:
              "linear-gradient(to bottom, var(--border), color-mix(in srgb, var(--border) 40%, transparent), transparent)",
            boxShadow: "var(--shadow-md, 0 20px 50px -12px rgba(0,0,0,0.18))",
          }}
        >
          <div
            className="rounded-[15px] p-8 md:p-12"
            style={{ background: "var(--card)" }}
          >
            <div className="flex flex-col items-center mb-8">
              <TenantBrandMark size="lg" align="row" />
            </div>

            <div className="mb-8 text-center">
              <h2
                className="text-[20px] leading-[28px] font-semibold"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-display, var(--font-heading))",
                }}
              >
                Acesse sua conta
              </h2>
              <p
                className="text-[14px] leading-[20px] mt-2"
                style={{ color: "var(--muted-foreground)" }}
              >
                Bem-vindo de volta. Insira seus dados.
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
              </div>
            )}

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-[14px] leading-[16px] tracking-[0.05em] font-semibold"
                  style={{ color: "var(--foreground)" }}
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
                    className="block w-full pl-10 pr-4 py-3 rounded-lg text-[14px] leading-[20px] transition-all duration-200 outline-none"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--input)",
                      color: "var(--foreground)",
                    }}
                    
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

              {featureFlags.magicLink && (
                <>
                  <Button
                    type="button"
                    onClick={handleMagicLink}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 text-[14px] leading-[16px] tracking-[0.05em] font-semibold h-auto"
                    style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                  >
                    <Sparkles className="h-5 w-5" />
                    Entrar com Link Magico
                  </Button>

                  <div className="relative flex items-center py-4">
                    <div
                      className="flex-grow border-t"
                      style={{ borderColor: "var(--border)" }}
                    />
                    <span
                      className="flex-shrink-0 mx-4 text-[12px] leading-[16px] tracking-[0.05em] font-medium uppercase"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      ou
                    </span>
                    <div
                      className="flex-grow border-t"
                      style={{ borderColor: "var(--border)" }}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-[14px] leading-[16px] tracking-[0.05em] font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Senha
                  </label>
                  <Link
                    href={hrefTenant("/forgot-password")}
                    className="text-[12px] leading-[16px] tracking-[0.05em] font-medium hover:underline transition-colors"
                    style={{ color: "var(--primary)" }}
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="block w-full pl-10 pr-12 py-3 rounded-lg text-[14px] leading-[20px] transition-all duration-200 outline-none"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--input)",
                      color: "var(--foreground)",
                    }}
                    
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none transition-colors"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {showPassword ? (
                      <Eye className="h-5 w-5" style={{ color: "var(--primary)" }} />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
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

              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-3 px-4 text-[14px] leading-[16px] tracking-[0.05em] font-semibold transition-all active:scale-[0.98] duration-200 mt-2 h-auto"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  borderRadius: "var(--radius-btn, 0.5rem)",
                }}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Entrar
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p
                className="text-[14px] leading-[20px]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Ainda nao faz parte?
                <Link
                  href={hrefTenant("/register")}
                  className="text-[14px] leading-[16px] tracking-[0.05em] font-semibold hover:underline ml-1 transition-colors"
                  style={{ color: "var(--primary)" }}
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
