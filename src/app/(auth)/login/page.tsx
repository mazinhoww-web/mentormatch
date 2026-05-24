"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, GraduationCap } from "lucide-react"

import { loginSchema, type LoginInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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

    router.push("/")
    router.refresh()
  }

  async function handleMagicLink() {
    // Magic link placeholder
  }

  return (
    <div className="flex flex-col items-center">
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
          <h1 className="text-2xl font-semibold text-gray-900">Acesse sua conta</h1>
          <p className="mt-2 text-sm text-gray-500">
            Bem-vindo de volta! Por favor, insira seus dados.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Email field */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            E-mail corporativo
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              placeholder="seu@empresa.com"
              className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Magic Link Button */}
        <Button
          type="button"
          onClick={handleMagicLink}
          className="mb-4 h-11 w-full rounded-lg bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8]"
        >
          <Sparkles className="h-4 w-4" />
          Entrar com Link Magico
        </Button>

        {/* Divider */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium text-gray-400">OU</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Password form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-[#2563eb] hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="outline"
            className="h-11 w-full rounded-lg border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar com Senha
          </Button>
        </form>

        {/* Bottom link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Ainda nao faz parte?{" "}
          <Link href="/register" className="font-medium text-[#2563eb] hover:underline">
            Solicitar acesso
          </Link>
        </p>
      </div>
    </div>
  )
}
