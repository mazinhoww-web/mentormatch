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
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-blue-700">
          Recursos
        </div>
        <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.025em] text-slate-900 md:text-[34px]">
          Tudo que seu programa precisa
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_4px_12px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_16px_40px_rgba(0,74,198,0.12)]"
          >
            <div
              className="mb-5 flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700"
            >
              <Icon size={22} />
            </div>
            <div className="mb-2.5 text-[17px] font-bold text-slate-900">
              {title}
            </div>
            <div className="text-sm leading-[1.7] text-slate-500">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
