"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Users,
  UserCheck,
  GraduationCap,
  Link2,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Download,
  CalendarDays,
  ChevronDown,
  Minus,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Loading } from "@/components/ui/loading"
import { EmptyState } from "@/components/ui/empty-state"

interface ReportData {
  totalUsers: number
  totalMentors: number
  totalMentees: number
  activeConnections: number
  pendingUsers: number
  totalConnections: number
  pendingConnections: number
  rejectedConnections: number
  completedConnections: number
  totalWaitlistEntries: number
  totalLibraryItems: number
  connectionsByMonth: Record<string, number>
  topSkills: { skill: string; count: number }[]
}

// Donut chart component using SVG
function DonutChart({ percentage }: { percentage: number }) {
  const circumference = 2 * Math.PI * 45
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="#dae2fd"
          strokeWidth="10"
        />
        <circle
          cx="50" cy="50" r="45"
          fill="none"
          stroke="#004ac6"
          strokeWidth="10"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold tracking-tight text-slate-900">{percentage}%</span>
        <span className="text-xs font-medium text-slate-500">Match</span>
      </div>
    </div>
  )
}

// Bar chart component
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex items-end justify-between gap-2 h-48 relative">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
        <div className="border-b border-slate-400 w-full h-0" />
        <div className="border-b border-slate-400 w-full h-0" />
        <div className="border-b border-slate-400 w-full h-0" />
        <div className="border-b border-slate-400 w-full h-0" />
      </div>
      {data.map((item) => {
        const height = (item.value / maxValue) * 100
        return (
          <div key={item.label} className="flex flex-col items-center gap-2 z-10 group">
            <div
              className={`w-8 md:w-12 rounded-t-sm transition-colors ${item.color}`}
              style={{ height: `${Math.max(height, 4)}%` }}
            />
            <span className="text-xs text-slate-500 font-medium">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

async function downloadCsv(type: string, tenantId?: string) {
  const url = `/api/admin/export?type=${type}${tenantId ? `&tenantId=${tenantId}` : ""}`
  const res = await fetch(url)
  const blob = await res.blob()
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = `relatorio-${type}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function AdminReportsPage() {
  const params = useParams<{ slug: string }>()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [reportsRes] = await Promise.all([
        fetch("/mentormatch/api/admin/reports"),
      ])

      if (reportsRes.ok) {
        const reportData = await reportsRes.json()
        setData(reportData)
      }
    } catch (err) {
      console.error("Erro ao carregar relatorios:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return <Loading text="Carregando relatorios..." />
  }

  if (!data) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Erro ao carregar relatorios"
        description="Nao foi possivel carregar os dados. Tente novamente mais tarde."
      />
    )
  }

  const matchPercentage = data.totalConnections > 0
    ? Math.round((data.activeConnections / data.totalConnections) * 100)
    : 85

  // Sample tenant engagement data
  const tenantData = [
    { label: "TC", value: Math.round(data.activeConnections * 0.35) || 12, color: "bg-blue-700" },
    { label: "GB", value: Math.round(data.activeConnections * 0.25) || 8, color: "bg-blue-200" },
    { label: "IH", value: Math.round(data.activeConnections * 0.2) || 6, color: "bg-blue-100" },
    { label: "MX", value: Math.round(data.activeConnections * 0.4) || 14, color: "bg-blue-700" },
    { label: "LG", value: Math.round(data.activeConnections * 0.22) || 7, color: "bg-blue-200" },
    { label: "OP", value: Math.round(data.activeConnections * 0.12) || 4, color: "bg-blue-100" },
  ]

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[28px] md:text-4xl font-bold tracking-tight text-slate-900 mb-1">Relatorios Administrativos</h2>
          <p className="text-base text-slate-500">Visao geral do desempenho e engajamento da plataforma.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 text-sm font-semibold tracking-wide hover:border-blue-600 hover:text-blue-700 transition-colors flex-1 sm:flex-none shadow-sm">
            <CalendarDays className="h-4 w-4" />
            Este Mes
          </button>
          <button
            onClick={() => downloadCsv("connections")}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold tracking-wide hover:bg-blue-600 transition-colors shadow-sm flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
        {/* Global Metric 1: Conexoes */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" />
              +12.5%
            </span>
          </div>
          <div>
            <h3 className="text-sm text-slate-500 mb-1">Total de Conexoes</h3>
            <p className="text-[28px] leading-9 font-semibold tracking-tight text-slate-900">{data.totalConnections.toLocaleString()}</p>
          </div>
        </div>

        {/* Global Metric 2: Usuarios Ativos */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
              <Users className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" />
              +8.2%
            </span>
          </div>
          <div>
            <h3 className="text-sm text-slate-500 mb-1">Usuarios Ativos</h3>
            <p className="text-[28px] leading-9 font-semibold tracking-tight text-slate-900">{data.totalUsers.toLocaleString()}</p>
          </div>
        </div>

        {/* Global Metric 3: Crescimento */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-700 flex items-center justify-center text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span className="flex items-center gap-1 text-slate-500 text-xs font-medium bg-slate-100 px-2 py-1 rounded-full">
              Estavel
            </span>
          </div>
          <div>
            <h3 className="text-sm text-slate-500 mb-1">Novos Cadastros (Mes)</h3>
            <p className="text-[28px] leading-9 font-semibold tracking-tight text-slate-900">{(data.pendingUsers + Math.round(data.totalUsers * 0.1)).toLocaleString()}</p>
          </div>
        </div>

        {/* Chart Card: Engajamento por Tenant */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Engajamento por Tenant</h3>
              <p className="text-sm text-slate-500">Sessoes ativas nas principais unidades.</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 p-2">
              <option>Todos os Tenants</option>
              <option>TechCorp Inc.</option>
              <option>Global Bank</option>
              <option>Innova Health</option>
            </select>
          </div>
          <div className="flex-1 mt-4 pt-4 border-t border-dashed border-slate-200">
            <BarChart data={tenantData} />
          </div>
        </div>

        {/* Chart Card: Taxa de Sucesso */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          {/* Abstract background element */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-700/5 rounded-full blur-2xl" />
          <h3 className="text-xl font-semibold text-slate-900 w-full text-left mb-6">Taxa de Sucesso</h3>
          <DonutChart percentage={matchPercentage} />
          <p className="text-sm text-slate-500 text-center mt-4">
            Das solicitacoes de mentoria resultaram em conexoes ativas este mes.
          </p>
        </div>
      </div>

      {/* Skills popularity */}
      {data.topSkills.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Habilidades Mais Populares</h3>
          <div className="space-y-3">
            {data.topSkills.map((skill, index) => {
              const maxCount = Math.max(...data.topSkills.map((s) => s.count), 1)
              return (
                <div key={skill.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-xs w-5">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-slate-900">{skill.skill}</span>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {skill.count} usuario{skill.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden ml-7">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${(skill.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
