import type { Metadata, Viewport } from "next"
import { Hanken_Grotesk, Inter } from "next/font/google"
import { Providers } from "@/components/providers"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${hankenGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
