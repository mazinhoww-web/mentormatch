"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loading } from "@/components/ui/loading"

interface Skill {
  id: string
  skill: { id: string; name: string }
}

interface MentorProfile {
  id: string
  name: string
  email: string
  image?: string | null
  headline?: string | null
  bio?: string | null
  skills: Skill[]
}

export default function ConfirmMentorshipPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const mentorId = params.id as string

  const [loading, setLoading] = useState(true)
  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchMentor() {
      try {
        const res = await fetch(
          `/api/mentors?tenantId=${encodeURIComponent(slug)}`
        )
        const mentors: MentorProfile[] = await res.json()
        const found = mentors.find((m) => m.id === mentorId) || null
        setMentor(found)
      } catch (err) {
        console.error("Erro ao carregar mentor:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMentor()
  }, [slug, mentorId])

  async function handleSubmit() {
    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("/mentormatch/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          message: message.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao enviar solicitacao.")
        return
      }

      router.push(`/t/${slug}/mentors`)
    } catch (err) {
      console.error("Erro ao enviar solicitacao:", err)
      setError("Erro ao enviar solicitacao. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loading text="Carregando..." />
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#434655] hover:text-[#004ac6] transition-colors text-sm group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para Mentores</span>
        </button>
        <div className="text-center py-16">
          <p className="text-lg font-medium text-[#131b2e]">Mentor nao encontrado</p>
          <p className="text-sm text-[#434655] mt-1">
            O mentor selecionado nao esta mais disponivel.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Back Action */}
      <div className="w-full max-w-2xl mb-8 flex justify-start pt-8">
        <button
          onClick={() => router.push(`/t/${slug}/mentors`)}
          className="flex items-center gap-2 text-[#434655] hover:text-[#004ac6] transition-colors text-sm group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para Mentores</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-2xl bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 md:p-8 relative overflow-hidden">
        {/* Subtle atmospheric gradient */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[60px] rounded-full pointer-events-none" />

        <header className="mb-8 relative z-10">
          <h1 className="text-[28px] md:text-[32px] leading-[36px] md:leading-[40px] font-semibold tracking-[-0.01em] text-[#131b2e] mb-2">
            Confirmar Mentoria
          </h1>
          <p className="text-sm text-[#434655]">
            Revise os detalhes abaixo antes de enviar sua solicitacao.
          </p>
        </header>

        {/* Mentor Profile Summary */}
        <section className="bg-white border border-[#E2E8F0] rounded-lg p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          <Avatar
            src={mentor.image}
            name={mentor.name}
            size="lg"
            className="w-20 h-20 rounded-full border-2 border-[#E2E8F0]"
          />
          <div className="flex-1">
            <h2 className="text-lg leading-6 font-semibold text-[#131b2e] mb-1">
              {mentor.name}
            </h2>
            {mentor.headline && (
              <p className="text-sm text-[#004ac6] mb-2">{mentor.headline}</p>
            )}
            {mentor.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mentor.skills.slice(0, 5).map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-1 bg-[#E2E8F0] text-[#434655] text-xs font-medium rounded-full"
                  >
                    {s.skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Introduction Message */}
        <form
          className="relative z-10 flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-medium tracking-[0.05em] text-[#434655] flex justify-between items-end"
              htmlFor="intro-message"
            >
              <span>Mensagem de Introducao</span>
              <span className="text-[#737686] text-xs opacity-70">Opcional</span>
            </label>
            <div className="relative rounded-lg transition-shadow focus-within:shadow-[0_0_0_2px_rgba(37,99,235,0.15)]">
              <textarea
                id="intro-message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setError("")
                }}
                placeholder="Conte um pouco sobre seus objetivos e por que escolheu este mentor..."
                rows={4}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] focus:border-blue-600 text-[#131b2e] text-sm rounded-lg p-4 resize-y focus:ring-0 transition-colors placeholder:text-[#434655]/40"
              />
            </div>
            <p className="text-sm text-[#737686] mt-1">
              Uma breve introducao ajuda o mentor a se preparar para a primeira sessao.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="px-6 py-3 border border-[#E2E8F0] text-[#131b2e] hover:bg-[#dae2fd] text-xs font-medium tracking-[0.05em] rounded-lg transition-colors active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white text-xs font-medium tracking-[0.05em] rounded-lg hover:bg-blue-600/90 transition-colors active:scale-95 shadow-sm flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Enviando..." : "Enviar Solicitacao"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
