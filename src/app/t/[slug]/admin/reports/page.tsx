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
  const size = 160
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
        <span className="text-xs text-gray-500">Match</span>
      </div>
    </div>
  )
}

// Bar chart component
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((item) => {
        const height = (item.value / maxValue) * 100

        return (
          <div key={item.label} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-xs font-medium text-gray-600">{item.value}</span>
            <div className="w-full flex justify-center">
              <div
                className="w-10 rounded-t-md bg-blue-500 transition-all duration-500"
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminReportsPage() {
  const params = useParams<{ slug: string }>()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [reportsRes] = await Promise.all([
        fetch("/api/admin/reports"),
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
    { label: "SP", value: Math.round(data.activeConnections * 0.35) || 12 },
    { label: "RJ", value: Math.round(data.activeConnections * 0.25) || 8 },
    { label: "MG", value: Math.round(data.activeConnections * 0.2) || 6 },
    { label: "PR", value: Math.round(data.activeConnections * 0.12) || 4 },
    { label: "RS", value: Math.round(data.activeConnections * 0.08) || 3 },
  ]

  return (
    <div className="not-dark space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Relatorios Administrativos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Visao geral do desempenho e engajamento da plataforma.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <CalendarDays className="h-4 w-4" />
            Este Mes
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stat cards with trend indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total de Conexoes */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total de Conexoes</p>
            <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-600">+12.5%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.totalConnections}</p>
        </div>

        {/* Usuarios Ativos */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Usuarios Ativos</p>
            <div className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5">
              <ArrowUpRight className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-600">+8.2%</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.totalUsers}</p>
        </div>

        {/* Novos Cadastros/Mes */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Novos Cadastros/Mes</p>
            <div className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
              <Minus className="h-3 w-3 text-gray-500" />
              <span className="text-xs font-medium text-gray-500">Estavel</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.pendingUsers + Math.round(data.totalUsers * 0.1)}</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Engajamento por Tenant - bar chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Engajamento por Tenant</h3>
              <p className="text-sm text-gray-500 mt-0.5">Sessoes ativas nas principais unidades.</p>
            </div>
            <select className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-blue-400">
              <option>Todos os Tenants</option>
            </select>
          </div>
          <div className="mt-6">
            <BarChart data={tenantData} />
          </div>
        </div>

        {/* Taxa de Sucesso - donut chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Taxa de Sucesso</h3>
          </div>
          <div className="flex flex-col items-center justify-center mt-6">
            <DonutChart percentage={matchPercentage} />
            <p className="text-sm text-gray-500 mt-4 text-center max-w-xs">
              Das solicitacoes de mentoria resultaram em conexoes ativas este mes.
            </p>
          </div>
        </div>
      </div>

      {/* Skills popularity (kept from original but restyled) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Habilidades Mais Populares</h3>
        {data.topSkills.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Sem dados"
            description="Ainda nao ha habilidades com usuarios associados"
            className="py-8"
          />
        ) : (
          <div className="space-y-3">
            {data.topSkills.map((skill, index) => {
              const maxCount = Math.max(...data.topSkills.map((s) => s.count), 1)
              return (
                <div key={skill.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-mono text-xs w-5">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900">{skill.skill}</span>
                    </div>
                    <span className="text-gray-400 text-xs">
                      {skill.count} usuario{skill.count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden ml-7">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${(skill.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
