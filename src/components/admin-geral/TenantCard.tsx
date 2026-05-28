"use client"

import { useState, useTransition } from "react"
import {
  BarChart2,
  BookOpen,
  ChevronRight,
  Eye,
  FileText,
  Globe,
  MoreVertical,
  Settings,
  Trash2,
  Users,
} from "lucide-react"
import { StatusChip } from "./StatusChip"
import { deleteTenant } from "@/app/admin/actions"
import type { TenantWithStats } from "@/app/admin/page"

type Props = {
  tenant: TenantWithStats
}

export function TenantCard({ tenant }: Props) {
  const [menu, setMenu] = useState(false)
  const [pending, startTransition] = useTransition()

  const status = tenant.active ? "active" : "inactive"
  const url = `aurimarnogueira.com.br/mentormatch/t/${tenant.slug}`

  const stats = [
    { Icon: Users, val: tenant.users, lbl: "usuarios" },
    { Icon: BarChart2, val: tenant.sessions, lbl: "sessoes" },
    { Icon: BookOpen, val: tenant.mentors, lbl: "mentores" },
  ]

  const created = new Date(tenant.createdAt).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  })

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/35"
      style={{ background: "rgba(255,255,255,0.07)" }}
    >
      <div
        className="h-1"
        style={{
          background: `linear-gradient(90deg, ${tenant.brandColor}, ${tenant.brandColor}aa)`,
        }}
      />
      <div className="p-[22px]">
        <div className="mb-3.5 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ background: tenant.brandColor }}
              >
                <BookOpen size={13} color="#fff" />
              </div>
              <span className="text-[15px] font-bold text-[#EDEDEF]">
                {tenant.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe size={11} className="text-[#6B7280]" />
              <span className="text-[11px] text-[#6B7280]">{url}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip status={status} />
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenu((v) => !v)}
                aria-label="Menu do tenant"
                className="flex rounded-md p-1 text-[#6B7280] hover:bg-white/5"
              >
                <MoreVertical size={15} />
              </button>
              {menu && (
                <div
                  className="absolute right-0 top-full z-50 min-w-[140px] rounded-lg border border-white/[0.07] py-1 shadow-2xl"
                  style={{ background: "#13131e" }}
                >
                  <a
                    href={`/mentormatch/t/${tenant.slug}/mentor`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenu(false)}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12px] text-[#9CA3AF] hover:bg-white/5"
                  >
                    <Eye size={13} /> Ver dashboard
                  </a>
                  <a
                    href={`/mentormatch/t/${tenant.slug}/admin/settings`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenu(false)}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12px] text-[#9CA3AF] hover:bg-white/5"
                  >
                    <Settings size={13} /> Configuracoes
                  </a>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setMenu(false)
                      if (
                        !confirm(
                          `Desativar o tenant "${tenant.name}"? Os dados serao mantidos.`
                        )
                      )
                        return
                      startTransition(async () => {
                        await deleteTenant(tenant.id)
                      })
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[12px] text-[#EF4444] hover:bg-red-500/10 disabled:opacity-60"
                  >
                    <Trash2 size={13} /> Desativar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span
            className="rounded-full border border-white/[0.07] px-2 py-0.5 text-[9px] font-semibold tracking-[0.05em] text-[#6B7280]"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            TEMA {tenant.brandColor.toUpperCase()}
          </span>
          {tenant.hasDesignMd && (
            <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold text-[#10B981]"
              style={{
                background: "rgba(16,185,129,0.1)",
                borderColor: "rgba(16,185,129,0.25)",
              }}
            >
              <FileText size={9} /> design.md
            </span>
          )}
        </div>

        <div className="mb-[18px] grid grid-cols-3 gap-2">
          {stats.map(({ Icon, val, lbl }) => (
            <div
              key={lbl}
              className="rounded-lg border border-white/[0.07] px-2.5 py-2.5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="mb-1 text-[#6B7280]">
                <Icon size={13} />
              </div>
              <div className="text-[18px] font-extrabold leading-none tracking-[-0.02em] text-[#EDEDEF]">
                {val}
              </div>
              <div className="mt-0.5 text-[10px] text-[#6B7280]">{lbl}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#6B7280]">
            Criado em {created}
          </span>
          <a
            href={`/mentormatch/t/${tenant.slug}/admin/users`}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-[12px] font-semibold text-indigo-300 transition-colors hover:bg-indigo-500 hover:text-white"
            style={{
              background: "rgba(79,70,229,0.094)",
              borderColor: "rgba(99,102,241,0.35)",
            }}
          >
            Gerenciar <ChevronRight size={12} />
          </a>
        </div>
      </div>
    </div>
  )
}
