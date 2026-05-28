import type { Metadata } from "next"
import { db } from "@/lib/db"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { resolveThemeClass } from "@/lib/theme-engine"

export const metadata: Metadata = {
  title: "MentorMatch Sicredi - Mentoria empresarial para cooperativas",
  description:
    "Plataforma white-label de mentoria para cooperativas Sicredi. Conecte gestores experientes a analistas em desenvolvimento.",
}

const SICREDI_FONTS =
  "https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600&family=Nunito:wght@400;500;600;700&display=swap"

export default async function SicrediLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenant = await db.tenant.findUnique({
    where: { slug: "sicredi" },
    select: { themeKey: true, themeCssUrl: true },
  })

  const themeClass = resolveThemeClass(tenant)

  return (
    <ThemeProvider
      themeClass={themeClass}
      fontFaces={SICREDI_FONTS}
      themeCssUrl={tenant?.themeCssUrl ?? null}
    >
      {children}
    </ThemeProvider>
  )
}
