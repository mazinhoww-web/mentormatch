"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/use-current-user"

export default function WelcomePage() {
  const router = useRouter()
  const { user, isLoading } = useCurrentUser()

  const dashboardHref = user?.tenantSlug && user?.role
    ? `/t/${user.tenantSlug}/${user.role === "MENTOR" ? "mentor" : "mentee"}`
    : "/t/default/mentee"

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [isLoading, user, router])

  return (
    <div className="bg-[#0b1326] min-h-screen flex items-center justify-center p-4 md:p-10 overflow-hidden relative selection:bg-blue-600 selection:text-[#eeefff]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b4c5ff]/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-md flex flex-col items-center text-center animate-[pop-in_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="relative mb-10">
          <div className="absolute inset-0 bg-[#2d3449] rounded-full blur-md opacity-50 translate-y-2" />
          <div className="relative w-28 h-28 bg-[#131b2e] border border-[#434655] rounded-full flex items-center justify-center animate-[pulse-glow_2s_infinite] shadow-lg">
            <CheckCircle className="h-16 w-16 text-[#b4c5ff]" fill="currentColor" strokeWidth={0} />
          </div>
        </div>

        <h1 className="font-heading text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-[#dae2fd] mb-4">
          Tudo pronto!
        </h1>
        <p className="text-[16px] leading-[24px] text-[#c3c6d7] mb-12 max-w-[85%] mx-auto">
          {user?.role === "MENTOR"
            ? "Seu perfil de mentor foi criado. Comece a receber mentorados e compartilhe sua experiencia!"
            : "Seu perfil foi criado com sucesso. Explore mentores e agende sua primeira sessao!"}
        </p>

        {isLoading ? (
          <Button disabled className="w-full h-14 bg-blue-600 text-[#eeefff] rounded-lg text-[18px]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando...
          </Button>
        ) : (
          <Button
            onClick={() => router.push(dashboardHref)}
            className="w-full flex items-center justify-center gap-3 h-14 bg-blue-600 text-[#eeefff] rounded-lg text-[18px] leading-[24px] font-semibold transition-all hover:bg-[#0053db] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#b4c5ff] focus:ring-offset-2 focus:ring-offset-[#0b1326] group shadow-md shadow-blue-600/20"
          >
            <span>Ir para o Dashboard</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </main>
    </div>
  )
}
