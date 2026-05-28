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
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-400">
          Como funciona
        </div>
        <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-white md:text-[34px]">
          Pronto em 3 passos
        </h2>
        <p className="mt-3 text-base text-[#6B7280]">
          Do cadastro ao primeiro match em minutos
        </p>
      </div>

      <div className="grid gap-7 md:grid-cols-3">
        {steps.map(({ n, title, desc, icon: Icon }) => (
          <div
            key={n}
            className="relative overflow-hidden rounded-2xl border border-white/[0.07] p-7 transition-all duration-200 hover:-translate-y-[3px] hover:border-indigo-500/35"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div
              className="pointer-events-none absolute right-5 top-4 select-none text-[52px] font-black leading-none"
              style={{ color: "rgba(255,255,255,0.025)" }}
            >
              {n}
            </div>
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/25 text-indigo-300"
              style={{ background: "rgba(99,102,241,0.14)" }}
            >
              <Icon size={18} />
            </div>
            <div className="mb-2 text-base font-bold text-white">{title}</div>
            <div className="text-sm leading-[1.65] text-[#6B7280]">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
