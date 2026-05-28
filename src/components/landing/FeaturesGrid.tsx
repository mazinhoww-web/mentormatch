import { BookOpen, Building2, Users } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Matching Inteligente",
    desc: "Algoritmo que conecta por habilidades, objetivos e disponibilidade real -- sem matching manual.",
  },
  {
    icon: BookOpen,
    title: "Biblioteca de Materiais",
    desc: "Compartilhe artigos, PDFs e recursos diretamente na plataforma, organizados por tema.",
  },
  {
    icon: Building2,
    title: "White-Label Multitenant",
    desc: "Cada empresa tem seu programa proprio com subdomain, cores e logo 100% personalizados.",
  },
]

export function FeaturesGrid() {
  return (
    <section className="relative z-10 mx-auto max-w-[1160px] px-6 pb-16 md:px-10 md:pb-[88px]">
      <div className="mb-12 text-center md:mb-[60px]">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-indigo-400">
          Recursos
        </div>
        <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-white md:text-[34px]">
          Tudo que seu programa precisa
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-white/[0.07] p-7 backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500/35 hover:shadow-[0_16px_40px_rgba(79,70,229,0.12)]"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <div
              className="mb-5 flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-indigo-400/20 text-indigo-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(79,70,229,0.18), rgba(99,102,241,0.1))",
              }}
            >
              <Icon size={22} />
            </div>
            <div className="mb-2.5 text-[17px] font-bold text-white">
              {title}
            </div>
            <div className="text-sm leading-[1.7] text-[#6B7280]">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
