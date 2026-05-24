import { GraduationCap } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Branding panel - hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:bg-gradient-to-br lg:from-indigo-600 lg:via-indigo-500 lg:to-violet-500 lg:px-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            MentorMatch
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-indigo-100">
            Conectando mentores e mentorados para impulsionar o desenvolvimento
            profissional dentro da sua organização.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-white/10 px-4 py-5 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">500+</p>
              <p className="mt-1 text-sm text-indigo-200">Mentores</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-5 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">2k+</p>
              <p className="mt-1 text-sm text-indigo-200">Sessões</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-5 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="mt-1 text-sm text-indigo-200">Satisfação</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        {/* Mobile branding header */}
        <div className="flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-500 px-6 py-6 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">MentorMatch</h1>
        </div>

        {/* Auth form area */}
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} MentorMatch. Todos os direitos
          reservados.
        </div>
      </div>
    </div>
  )
}
