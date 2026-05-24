import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, Users, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">MentorMatch</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button>Começar agora</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Conecte <span className="text-primary">mentores</span> e{" "}
            <span className="text-primary">mentorados</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Plataforma white-label de mentoria empresarial. Crie programas internos
            de mentoria para sua empresa com facilidade.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Criar conta gratuita <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Matching Inteligente</h3>
              <p className="text-sm text-muted-foreground">
                Encontre o mentor ideal por habilidades e interesses.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Biblioteca de Materiais</h3>
              <p className="text-sm text-muted-foreground">
                Compartilhe conhecimento através de materiais e recursos.
              </p>
            </div>
            <div className="rounded-lg border bg-card p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Multitenant</h3>
              <p className="text-sm text-muted-foreground">
                Cada empresa tem seu programa personalizado e independente.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">Plano Free inclui</h2>
            <div className="mx-auto max-w-md space-y-3">
              {[
                "Até 50 usuários",
                "Até 10 mentores",
                "500 MB de biblioteca",
                "Notificações por e-mail",
                "Dashboard completo",
                "Gestão de habilidades",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MentorMatch. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
