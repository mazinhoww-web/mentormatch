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
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600&family=Nunito:wght@400;500;600;700&display=swap"
      />
      {children}
    </>
  )
}
