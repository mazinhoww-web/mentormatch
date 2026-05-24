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
      const res = await fetch("/api/connections", {
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
      <div className="min-h-screen space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Mentores
        </button>
        <div className="text-center py-16">
          <p className="text-lg font-medium text-white">Mentor nao encontrado</p>
          <p className="text-sm text-slate-400 mt-1">
            O mentor selecionado nao esta mais disponivel.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push(`/t/${slug}/mentors`)}
        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Mentores
      </button>

      {/* Main Card */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <h1 className="text-xl font-bold text-white mb-1">Confirmar Mentoria</h1>
        <p className="text-sm text-slate-400 mb-6">
          Revise os detalhes abaixo antes de enviar sua solicitacao.
        </p>

        {/* Mentor Card */}
        <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-4 mb-6">
          <div className="flex items-center gap-3">
            <Avatar
              src={mentor.image}
              name={mentor.name}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">{mentor.name}</h3>
              {mentor.headline && (
                <p className="text-sm text-slate-400 truncate">{mentor.headline}</p>
              )}
            </div>
          </div>

          {mentor.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {mentor.skills.slice(0, 5).map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs text-slate-300"
                >
                  {s.skill.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium text-white">
              Mensagem de Introducao
            </label>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 uppercase tracking-wide">
              Opcional
            </span>
          </div>
          <Textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              setError("")
            }}
            placeholder="Conte um pouco sobre seus objetivos e por que escolheu este mentor..."
            rows={4}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-600"
          />
          <p className="mt-2 text-xs text-slate-500">
            Uma breve introducao ajuda o mentor a se preparar para a primeira sessao.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mb-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-slate-800 my-6" />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            onClick={() => router.back()}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              "Enviando..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Enviar Solicitacao
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
