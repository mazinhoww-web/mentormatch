import { Resend } from "resend"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || "re_placeholder")
}

function getFromEmail() {
  return process.env.EMAIL_FROM || "MentorMatch <noreply@mentormatch.com>"
}

export async function sendMagicLinkEmail(email: string, url: string) {
  await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Seu link de acesso - MentorMatch",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Acesse sua conta</h2>
        <p>Clique no botão abaixo para acessar o MentorMatch:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Acessar MentorMatch
        </a>
        <p style="color: #666; font-size: 14px;">Este link expira em 24 horas.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, url: string) {
  await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Redefinir senha - MentorMatch",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Redefinir sua senha</h2>
        <p>Você solicitou a redefinição da sua senha. Clique no botão abaixo:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Redefinir Senha
        </a>
        <p style="color: #666; font-size: 14px;">Se você não solicitou esta alteração, ignore este e-mail.</p>
      </div>
    `,
  })
}

export async function sendConnectionRequestEmail(
  mentorEmail: string,
  menteeName: string,
  tenantName: string
) {
  await getResend().emails.send({
    from: getFromEmail(),
    to: mentorEmail,
    subject: `Nova solicitação de mentoria - ${tenantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nova solicitação de mentoria</h2>
        <p><strong>${menteeName}</strong> gostaria de ser mentorado por você no programa ${tenantName}.</p>
        <p>Acesse a plataforma para aceitar ou recusar a solicitação.</p>
      </div>
    `,
  })
}

export async function sendInvitationEmail(email: string, inviterName: string, tenantName: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/register?token=${token}`

  await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: `Convite para ${tenantName} - MentorMatch`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Voce foi convidado!</h2>
        <p><strong>${inviterName}</strong> convidou voce para participar do programa <strong>${tenantName}</strong> no MentorMatch.</p>
        <p>Clique no botao abaixo para criar sua conta:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Aceitar Convite
        </a>
        <p style="color: #666; font-size: 14px;">Este convite expira em 7 dias.</p>
      </div>
    `,
  })
}

export async function sendAccountApprovedEmail(email: string, tenantName: string) {
  await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: `Conta aprovada - ${tenantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Sua conta foi aprovada!</h2>
        <p>Parabéns! Sua conta no programa ${tenantName} foi aprovada.</p>
        <p>Acesse a plataforma para começar sua jornada de mentoria.</p>
      </div>
    `,
  })
}
