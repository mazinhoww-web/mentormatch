"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  FileText,
  Globe,
  Plus,
  Users,
} from "lucide-react"
import { TenantCard } from "./TenantCard"
import { NewTenantModal } from "./NewTenantModal"
import type { TenantWithStats } from "@/app/admin/page"

type Props = {
  tenants: TenantWithStats[]
}

export function AdminGeralClient({ tenants }: Props) {
  const [showNewModal, setShowNewModal] = useState(false)

  const activeCount = tenants.filter((t) => t.active).length
  const totalUsers = tenants.reduce((acc, t) => acc + t.users, 0)
  const totalSessions = tenants.reduce((acc, t) => acc + t.sessions, 0)
  const withDesignMd = tenants.filter((t) => t.hasDesignMd).length

  const globalStats = [
    {
      Icon: Globe,
      label: "Tenants ativos",
      val: activeCount,
      accent: "#6366F1",
    },
    {
      Icon: Users,
      label: "Usuarios totais",
      val: totalUsers,
      accent: "#06B6D4",
    },
    {
      Icon: BarChart2,
      label: "Sessoes realizadas",
      val: totalSessions,
      accent: "#10B981",
    },
    {
      Icon: FileText,
      label: "Com design.md",
      val: withDesignMd,
      accent: "#F59E0B",
    },
  ]

  return (
    <div
      className="min-h-screen text-[#EDEDEF]"
      style={{
        background: "#08080d",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      {/* Topbar */}
      <header
        className="flex h-[60px] items-center justify-between border-b border-white/[0.07] px-6 md:px-10"
        style={{ background: "#0d0d14" }}
      >
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
          >
            <BookOpen size={13} color="#fff" />
          </Link>
          <span className="text-base font-extrabold tracking-tight">
            MentorMatch
          </span>
          <span
            className="rounded-full border border-white/[0.07] px-2 py-0.5 text-[9px] font-bold tracking-[0.06em] text-[#6B7280]"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            ADMIN GERAL
          </span>
        </div>
        <div className="hidden text-[12px] text-[#6B7280] md:block">
          aurimarnogueira.com.br &middot; admin
        </div>
      </header>

      <div className="mx-auto max-w-[1160px] px-6 py-10 md:px-10">
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-[22px] font-extrabold tracking-[-0.02em] md:text-[26px]">
              Gestao de Tenants
            </h1>
            <p className="text-[13px] text-[#6B7280]">
              Administre todos os ambientes MentorMatch em uma so tela.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(79,70,229,0.28)]"
            style={{
              background: "linear-gradient(135deg, #4F46E5, #6366F1)",
            }}
          >
            <Plus size={15} /> Novo Tenant
          </button>
        </div>

        {/* Global stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {globalStats.map(({ Icon, label, val, accent }) => (
            <div
              key={label}
              className="rounded-2xl border border-white/[0.07] p-5 backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div className="mb-2.5 flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${accent}26`, color: accent }}
                >
                  <Icon size={17} />
                </div>
              </div>
              <div className="text-[28px] font-extrabold leading-none tracking-[-0.02em] text-[#EDEDEF]">
                {val}
              </div>
              <div className="mt-1 text-[12px] text-[#6B7280]">{label}</div>
            </div>
          ))}
        </div>

        {/* Tenant grid header */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#EDEDEF]">
            Todos os Tenants
          </h2>
          <span className="text-[12px] text-[#6B7280]">
            {tenants.length} {tenants.length === 1 ? "ambiente" : "ambientes"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {tenants.map((t) => (
            <TenantCard key={t.id} tenant={t} />
          ))}

          {/* Add new card */}
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/[0.07] px-6 py-8 text-[#6B7280] transition-all hover:border-indigo-500 hover:text-indigo-300"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-current">
              <Plus size={20} />
            </div>
            <div>
              <div className="mb-1 text-[14px] font-semibold">
                Adicionar Tenant
              </div>
              <div className="text-[12px] text-[#6B7280]">
                Faca upload do design.md para gerar
              </div>
            </div>
          </button>
        </div>

        {/* Instructions */}
        <div
          className="mt-8 rounded-2xl border border-white/[0.07] p-6 backdrop-blur-md"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              size={16}
              color="#4F46E5"
              className="mt-0.5 flex-shrink-0"
            />
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[#EDEDEF]">
                Como criar um novo tenant
              </div>
              <ol className="list-decimal pl-5 text-[12px] leading-relaxed text-[#6B7280]">
                <li>
                  Clique em &quot;Novo Tenant&quot; e defina o nome, slug e cor
                  primaria
                </li>
                <li>
                  (Opcional) Faca upload do arquivo{" "}
                  <code
                    className="rounded px-1.5 py-0.5 text-indigo-300"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    design.md
                  </code>{" "}
                  do cliente com tokens de cor, tipografia e identidade
                </li>
                <li>
                  O tenant fica disponivel em{" "}
                  <code
                    className="rounded px-1.5 py-0.5 text-indigo-300"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    /mentormatch/t/[slug]
                  </code>
                </li>
                <li>
                  Usuarios admin do tenant podem acessar{" "}
                  <code
                    className="rounded px-1.5 py-0.5 text-indigo-300"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    /mentormatch/t/[slug]/admin
                  </code>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {showNewModal && <NewTenantModal onClose={() => setShowNewModal(false)} />}
    </div>
  )
}
