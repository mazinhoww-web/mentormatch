import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "MentorMatch Sicredi - Mentoria empresarial para cooperativas",
  description:
    "Plataforma white-label de mentoria para cooperativas Sicredi. Conecte gestores experientes a analistas em desenvolvimento.",
  alternates: {
    canonical: "https://aurimarnogueira.com.br/sicredi/mentormatch",
  },
}

export default function SicrediLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
