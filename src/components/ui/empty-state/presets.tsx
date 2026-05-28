"use client"

import { Bell, BookOpen, Calendar, Inbox, Users } from "lucide-react"
import { EmptyState, type EmptyStateProps } from "./EmptyState"

type Override = Partial<EmptyStateProps>

const ICON_SIZE = 28

export function EmptyStateNoMentors(props: Override) {
  return (
    <EmptyState
      icon={<Users size={ICON_SIZE} />}
      title="Nenhum mentor encontrado"
      description="Ainda nao ha mentores disponiveis nesta organizacao."
      {...props}
    />
  )
}

export function EmptyStateNoPendingRequests(props: Override) {
  return (
    <EmptyState
      icon={<Inbox size={ICON_SIZE} />}
      title="Nenhuma solicitacao pendente"
      description="Quando alguem solicitar mentoria, aparece aqui."
      {...props}
    />
  )
}

export function EmptyStateNoSessions(props: Override) {
  return (
    <EmptyState
      icon={<Calendar size={ICON_SIZE} />}
      title="Nenhuma sessao agendada"
      description="Suas proximas sessoes de mentoria aparecem aqui."
      {...props}
    />
  )
}

export function EmptyStateNoMaterials(props: Override) {
  return (
    <EmptyState
      icon={<BookOpen size={ICON_SIZE} />}
      title="Biblioteca vazia"
      description="Nenhum material disponivel ainda. Volte mais tarde."
      {...props}
    />
  )
}

export function EmptyStateNoNotifications(props: Override) {
  return (
    <EmptyState
      icon={<Bell size={ICON_SIZE} />}
      title="Sem notificacoes"
      description="Voce esta em dia. Avisamos quando algo novo acontecer."
      {...props}
    />
  )
}

export function EmptyStateNoConnections(props: Override) {
  return (
    <EmptyState
      icon={<Users size={ICON_SIZE} />}
      title="Nenhuma conexao ativa"
      description="Conecte-se com mentores ou mentorados para comecar."
      {...props}
    />
  )
}
