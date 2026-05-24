"use client"

import Link from "next/link"
import { CheckCircle, ArrowRight, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0f1e] px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-12 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <GraduationCap className="h-5 w-5 text-blue-400" />
          </div>
          <span className="text-xl font-bold text-white">MentorMatch</span>
        </div>

        {/* Check icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-blue-400/30">
            <CheckCircle className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-semibold text-white">
          Tudo pronto!
        </h1>

        {/* Description */}
        <p className="mb-10 text-sm leading-relaxed text-gray-400">
          Seu perfil foi criado com sucesso. Agora voce pode comecar a explorar mentores e construir conexoes significativas.
        </p>

        {/* CTA */}
        <Link href="/t/default/mentor" className="block">
          <Button className="h-12 w-full rounded-lg bg-[#2563eb] text-sm font-medium text-white hover:bg-[#1d4ed8]">
            Ir para o Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
