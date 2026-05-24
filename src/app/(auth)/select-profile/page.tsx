"use client"

import { useRouter } from "next/navigation"
import { BookOpen, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

const profiles = [
  {
    role: "mentor" as const,
    title: "Quero ser Mentor",
    description:
      "Compartilhe sua experiência e ajude outros profissionais a crescerem na carreira.",
    icon: BookOpen,
    href: "/onboarding/mentor",
  },
  {
    role: "mentee" as const,
    title: "Quero ser Mentorado",
    description:
      "Encontre um mentor para orientar seu desenvolvimento profissional e acelerar sua carreira.",
    icon: GraduationCap,
    href: "/onboarding/mentee",
  },
]

export default function SelectProfilePage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Qual é o seu perfil?
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha como deseja participar do programa de mentoria
        </p>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card
            key={profile.role}
            className={cn(
              "cursor-pointer transition-all hover:border-primary hover:shadow-md"
            )}
            onClick={() => router.push(profile.href)}
          >
            <CardContent className="flex items-start gap-4 p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <profile.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{profile.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
