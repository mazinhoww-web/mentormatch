import { Building2, Users, Star } from "lucide-react"

const steps = [
  {
    n: "01",
    title: "Configure sua empresa",
    desc: "Subdomain, logo e brand colors prontos em 5 minutos.",
    icon: Building2,
  },
  {
    n: "02",
    title: "Convide as pessoas",
    desc: "Mentores e mentorados entram pelo link da sua empresa.",
    icon: Users,
  },
  {
    n: "03",
    title: "Acompanhe o impacto",
    desc: "Sessoes, progresso e metricas de desenvolvimento em tempo real.",
    icon: Star,
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative z-10 mx-auto max-w-[1160px] px-6 py-16 md:px-10 md:py-[88px]"
    >
      <div className="fade-up mb-12 text-center md:mb-[60px]">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-blue-700">
          Como funciona
        </div>
        <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-slate-900 md:text-[34px]">
          Pronto em 3 passos
        </h2>
        <p className="mt-3 text-base text-slate-500">
          Do cadastro ao primeiro match em minutos
        </p>
      </div>

      <div className="grid gap-7 md:grid-cols-3">
        {steps.map(({ n, title, desc, icon: Icon }) => (
          <div
            key={n}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-[3px] hover:border-blue-200 hover:shadow-[0_16px_40px_rgba(0,74,198,0.12)]"
          >
            <div
              className="pointer-events-none absolute right-5 top-4 select-none text-[52px] font-black leading-none"
              style={{ color: "rgba(0,74,198,0.06)" }}
            >
              {n}
            </div>
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700"
            >
              <Icon size={18} />
            </div>
            <div className="mb-2 text-base font-bold text-slate-900">{title}</div>
            <div className="text-sm leading-[1.65] text-slate-500">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
