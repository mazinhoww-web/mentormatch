"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Clock,
  Send,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
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
  education?: string | null
  experience?: string | null
  linkedin?: string | null
  whatsapp?: string | null
  maxMentees: number
  activeConnections: number
  skills: Skill[]
}

export default function MentorProfilePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const mentorId = params.id as string

  const [loading, setLoading] = useState(true)
  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
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

  async function handleRequestMentorship() {
    if (message.trim().length < 10) {
      setError("A mensagem deve ter pelo menos 10 caracteres.")
      return
    }

    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, message: message.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erro ao enviar solicitação.")
        return
      }

      setSubmitted(true)
      setDialogOpen(false)
      setMessage("")
    } catch (err) {
      console.error("Erro ao enviar solicitação:", err)
      setError("Erro ao enviar solicitação. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  function openWhatsApp(phone?: string | null) {
    if (!phone) return
    const cleaned = phone.replace(/\D/g, "")
    window.open(`https://wa.me/${cleaned}`, "_blank")
  }

  if (loading) {
    return <Loading text="Carregando perfil..." />
  }

  if (!mentor) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="text-center py-16">
          <p className="text-lg font-medium">Mentor não encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            O perfil que você procura não existe ou não está mais disponível.
          </p>
        </div>
      </div>
    )
  }

  const availableSlots = Math.max(0, mentor.maxMentees - mentor.activeConnections)
  const isAtCapacity = availableSlots === 0

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/t/${slug}/mentors`)}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para mentores
      </Button>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            {/* Avatar */}
            <Avatar
              src={mentor.image}
              name={mentor.name}
              size="xl"
              className="shrink-0"
            />

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold">{mentor.name}</h1>
              {mentor.headline && (
                <p className="mt-1 text-lg text-muted-foreground">
                  {mentor.headline}
                </p>
              )}

              {/* Availability */}
              <div className="mt-3">
                <Badge variant={isAtCapacity ? "warning" : "success"}>
                  {isAtCapacity
                    ? "Sem vagas disponíveis"
                    : `${availableSlots}/${mentor.maxMentees} vagas disponíveis`}
                </Badge>
              </div>

              {/* Skills */}
              {mentor.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {mentor.skills.map((s) => (
                    <Badge key={s.id} variant="secondary">
                      {s.skill.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                {submitted ? (
                  <Button disabled>
                    <Send className="h-4 w-4" />
                    Solicitação Enviada
                  </Button>
                ) : isAtCapacity ? (
                  <Button
                    onClick={() => setDialogOpen(true)}
                    variant="secondary"
                  >
                    <Clock className="h-4 w-4" />
                    Entrar na fila de espera
                  </Button>
                ) : (
                  <Button onClick={() => setDialogOpen(true)}>
                    <Send className="h-4 w-4" />
                    Solicitar Mentoria
                  </Button>
                )}

                {mentor.whatsapp && (
                  <Button
                    variant="outline"
                    onClick={() => openWhatsApp(mentor.whatsapp)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                )}

                {mentor.linkedin && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(mentor.linkedin!, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                    LinkedIn
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Bio */}
        {mentor.bio && (
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">Sobre</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {mentor.bio}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {mentor.education && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Formação</h2>
              </div>
              <p className="text-muted-foreground whitespace-pre-line">
                {mentor.education}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Experience */}
        {mentor.experience && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Experiência</h2>
              </div>
              <p className="text-muted-foreground whitespace-pre-line">
                {mentor.experience}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Request Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>
            {isAtCapacity
              ? "Entrar na fila de espera"
              : "Solicitar Mentoria"}
          </DialogTitle>
          <DialogDescription>
            {isAtCapacity
              ? `${mentor.name} está sem vagas no momento. Envie uma mensagem para entrar na fila de espera.`
              : `Envie uma mensagem para ${mentor.name} explicando por que gostaria de ser mentorado(a).`}
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="request-message">Mensagem</Label>
              <Textarea
                id="request-message"
                placeholder="Olá! Gostaria de ser mentorado(a) por você porque..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value)
                  setError("")
                }}
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo de 10 caracteres. {message.length}/500
              </p>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setError("")
            }}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRequestMentorship}
            disabled={submitting || message.trim().length < 10}
          >
            {submitting ? "Enviando..." : "Enviar Solicitação"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
