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
    if (!isLoading) {
      if (!user) {
        router.push("/login")
      } else if (!user.role) {
        router.push("/select-profile")
      }
    }
  }, [isLoading, user, router])

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center p-4 md:p-10 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#004ac6]/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-md flex flex-col items-center text-center animate-[pop-in_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        <div className="relative mb-10">
          <div className="relative w-28 h-28 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center shadow-md">
            <CheckCircle className="h-16 w-16 text-[#004ac6]" fill="currentColor" strokeWidth={0} />
          </div>
        </div>

        <h1 className="font-heading text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-[#131b2e] mb-4">
          Tudo pronto!
        </h1>
        <p className="text-[16px] leading-[24px] text-[#434655] mb-12 max-w-[85%] mx-auto">
          {user?.role === "MENTOR"
            ? "Seu perfil de mentor foi criado. Comece a receber mentorados e compartilhe sua experiencia!"
            : "Seu perfil foi criado com sucesso. Explore mentores e agende sua primeira sessao!"}
        </p>

        {isLoading ? (
          <Button disabled className="w-full h-14 bg-[#004ac6] text-white rounded-lg text-[18px]">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Carregando...
          </Button>
        ) : (
          <Button
            onClick={() => router.push(dashboardHref)}
            className="w-full flex items-center justify-center gap-3 h-14 bg-[#004ac6] text-white rounded-lg text-[18px] leading-[24px] font-semibold transition-all hover:bg-[#0053db] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/30 focus:ring-offset-2 group shadow-md"
          >
            <span>Ir para o Dashboard</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </main>
    </div>
  )
}
