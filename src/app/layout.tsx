import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Hanken_Grotesk, Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { TenantProvider, type TenantContextValue } from "@/components/providers/TenantContext"
import { ToastProvider } from "@/components/ui/toast"
import { db } from "@/lib/db"
import "./globals.css"

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "MentorMatch - Plataforma de Mentoria Empresarial",
    template: "%s | MentorMatch",
  },
  description:
    "Plataforma white-label de mentoria empresarial. Conecte mentores e mentorados na sua organização.",
  manifest: "/mentormatch/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MentorMatch",
  },
}

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

const DEFAULT_TENANT: TenantContextValue = {
  slug: null,
  name: "MentorMatch",
  brandColor: "#004ac6",
  themeKey: "light",
  logoUrl: null,
}

async function resolveTenant(): Promise<TenantContextValue> {
  try {
    const store = await cookies()
    const slug = store.get("mm-tenant")?.value
    if (!slug) return DEFAULT_TENANT
    const tenant = await db.tenant.findUnique({
      where: { slug },
      select: {
        slug: true,
        name: true,
        brandColor: true,
        themeKey: true,
        logoUrl: true,
      },
    })
    if (!tenant) return DEFAULT_TENANT
    return {
      slug: tenant.slug,
      name: tenant.name,
      brandColor: tenant.brandColor,
      themeKey: tenant.themeKey ?? "light",
      logoUrl: tenant.logoUrl,
    }
  } catch {
    return DEFAULT_TENANT
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const tenant = await resolveTenant()
  const bodyClass = `min-h-full flex flex-col theme-${tenant.themeKey}`

  return (
    <html
      lang="pt-BR"
      className={`${hankenGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className={bodyClass}>
        <Providers>
          <TenantProvider value={tenant}>
            <ToastProvider>{children}</ToastProvider>
          </TenantProvider>
        </Providers>
      </body>
    </html>
  )
}
