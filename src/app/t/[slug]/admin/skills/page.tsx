"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Building2,
  Sparkles,
  Brain,
  Code2,
  MessageCircle,
  Database,
  Download,
  Check,
  X,
  ChevronDown,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"

interface Skill {
  id: string
  name: string
  category?: string | null
  isActive?: boolean
  usageCount?: number
  type?: "soft" | "hard"
  suggestedBy?: string
  suggestedByRole?: string
  status?: "approved" | "pending"
  _count?: {
    users: number
  }
}

type FilterTab = "all" | "soft" | "hard"

function getSkillIcon(skill: Skill) {
  const name = skill.name.toLowerCase()
  if (name.includes("comunicacao") || name.includes("comunicao") || name.includes("negociacao") || name.includes("apresentacao")) {
    return MessageCircle
  }
  if (name.includes("react") || name.includes("javascript") || name.includes("python") || name.includes("typescript") || name.includes("code") || name.includes("programacao")) {
    return Code2
  }
  if (name.includes("dados") || name.includes("banco") || name.includes("sql") || name.includes("data")) {
    return Database
  }
  // Default soft skill icon for everything else
  return Brain
}

function getSkillType(skill: Skill): "soft" | "hard" {
  if (skill.type) return skill.type
  const name = skill.name.toLowerCase()
  const hardKeywords = ["react", "javascript", "python", "typescript", "sql", "programacao", "code", "dados", "data", "banco", "api", "docker", "git", "css", "html", "node", "java", "c#", "ruby", "go", "rust"]
  if (hardKeywords.some((kw) => name.includes(kw))) return "hard"
  return "soft"
}

export default function AdminSkillsPage() {
  const params = useParams<{ slug: string }>()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [showMore, setShowMore] = useState(false)
  const INITIAL_SHOW = 10

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [skillName, setSkillName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch(`/api/skills?tenantId=${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setSkills(data)
      }
    } catch (err) {
      console.error("Erro ao buscar habilidades:", err)
    } finally {
      setLoading(false)
    }
  }, [params.slug])

  useEffect(() => {
    fetchSkills()
  }, [fetchSkills])

  // Separate pending (suggested) skills and approved/active skills
  const pendingSkills = useMemo(() => {
    return skills.filter((s) => s.status === "pending")
  }, [skills])

  const activeSkills = useMemo(() => {
    let result = skills.filter((s) => s.status !== "pending")

    if (filterTab === "soft") {
      result = result.filter((s) => getSkillType(s) === "soft")
    } else if (filterTab === "hard") {
      result = result.filter((s) => getSkillType(s) === "hard")
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((s) => s.name.toLowerCase().includes(q))
    }

    return result
  }, [skills, filterTab, search])

  const displayedSkills = showMore ? activeSkills : activeSkills.slice(0, INITIAL_SHOW)

  async function handleCreate() {
    if (!skillName.trim()) {
      setError("Nome da habilidade e obrigatorio")
      return
    }

    setSaving(true)
    setError("")

    try {
      const res = await fetch("/mentormatch/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: skillName.trim() }),
      })

      if (res.ok) {
        const newSkill = await res.json()
        setSkills((prev) => [...prev, { ...newSkill, _count: { users: 0 } }])
        setShowCreateDialog(false)
        setSkillName("")
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao criar habilidade")
      }
    } catch (err) {
      setError("Erro ao criar habilidade")
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit() {
    if (!selectedSkill || !skillName.trim()) {
      setError("Nome da habilidade e obrigatorio")
      return
    }

    setSaving(true)
    setError("")

    try {
      const res = await fetch(`/api/skills?id=${selectedSkill.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: skillName.trim() }),
      })

      if (res.ok) {
        const updated = await res.json()
        setSkills((prev) =>
          prev.map((s) => (s.id === updated.id ? { ...s, name: updated.name } : s))
        )
        setShowEditDialog(false)
        setSelectedSkill(null)
        setSkillName("")
      } else {
        const data = await res.json()
        setError(data.error || "Erro ao atualizar habilidade")
      }
    } catch (err) {
      setError("Erro ao atualizar habilidade")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!selectedSkill) return

    setSaving(true)

    try {
      const res = await fetch(`/api/skills?id=${selectedSkill.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setSkills((prev) => prev.filter((s) => s.id !== selectedSkill.id))
        setShowDeleteDialog(false)
        setSelectedSkill(null)
      }
    } catch (err) {
      console.error("Erro ao excluir habilidade:", err)
    } finally {
      setSaving(false)
    }
  }

  function handleApproveSkill(skill: Skill) {
    setSkills((prev) =>
      prev.map((s) => (s.id === skill.id ? { ...s, status: "approved" } : s))
    )
  }

  function handleRejectSkill(skill: Skill) {
    setSkills((prev) => prev.filter((s) => s.id !== skill.id))
  }

  function openEditDialog(skill: Skill) {
    setSelectedSkill(skill)
    setSkillName(skill.name)
    setError("")
    setShowEditDialog(true)
  }

  function openDeleteDialog(skill: Skill) {
    setSelectedSkill(skill)
    setShowDeleteDialog(true)
  }

  function openCreateDialog() {
    setSkillName("")
    setError("")
    setShowCreateDialog(true)
  }

  if (loading) {
    return <Loading text="Carregando habilidades..." />
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] md:text-4xl font-bold tracking-tight text-slate-900 mb-2">Gestao de Habilidades</h1>
          <p className="text-base text-slate-500">Analise sugestoes e mantenha o dicionario de skills organizado.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 text-slate-500 px-4 py-2 rounded-lg text-sm font-semibold tracking-wide flex items-center gap-2 hover:border-slate-400 transition-colors shadow-sm">
            <Download className="h-4 w-4" /> Exportar Lista
          </button>
          <button
            onClick={openCreateDialog}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold tracking-wide flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" /> Nova Habilidade
          </button>
        </div>
      </div>

      {/* Layout Grid: Pending vs Existing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SECTION 1: Pending Approvals */}
        {pendingSkills.length > 0 && (
          <section className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Aguardando Aprovacao
              </h2>
              <span className="bg-red-50 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                {pendingSkills.length} Pendente{pendingSkills.length > 1 ? "s" : ""}
              </span>
            </div>

            {pendingSkills.map((skill) => {
              const type = getSkillType(skill)
              return (
                <div
                  key={skill.id}
                  className="bg-white border-l-4 border-l-amber-500 border-y border-r border-slate-200 rounded-r-xl rounded-l-sm p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <h3 className="text-sm font-semibold tracking-wide text-slate-900">{skill.name}</h3>
                    {skill.suggestedBy && (
                      <p className="text-sm text-slate-500 mt-1">
                        Sugerido por: {skill.suggestedBy} ({skill.suggestedByRole || "Mentor"})
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-slate-100 text-slate-500 text-xs font-medium px-2 py-1 rounded-full border border-slate-200">
                      Sugerido como: {type === "soft" ? "Soft Skill" : "Hard Skill"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      className="flex items-center justify-center gap-1 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-transparent hover:border-emerald-200 text-xs font-medium"
                      onClick={() => handleApproveSkill(skill)}
                      title="Aprovar"
                    >
                      <Check className="h-4 w-4" /> Aprovar
                    </button>
                    <button
                      className="flex items-center justify-center gap-1 py-1.5 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 text-xs font-medium"
                      onClick={() => openEditDialog(skill)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" /> Editar
                    </button>
                    <button
                      className="flex items-center justify-center gap-1 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200 text-xs font-medium"
                      onClick={() => handleRejectSkill(skill)}
                      title="Recusar"
                    >
                      <X className="h-4 w-4" /> Recusar
                    </button>
                  </div>
                </div>
              )
            })}
          </section>
        )}

        {/* SECTION 2: Skill Dictionary */}
        <section className={`${pendingSkills.length > 0 ? "lg:col-span-8" : "lg:col-span-12"} bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <h2 className="text-xl font-semibold text-slate-900">Dicionario Ativo</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                  placeholder="Buscar habilidade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                />
              </div>
              <div className="flex bg-slate-50 border border-slate-200 rounded-lg p-1">
                {([
                  { key: "all" as FilterTab, label: "Todas" },
                  { key: "soft" as FilterTab, label: "Soft" },
                  { key: "hard" as FilterTab, label: "Hard" },
                ]).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      filterTab === tab.key
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skills List */}
          {displayedSkills.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Nenhuma habilidade encontrada"
              description={
                search
                  ? "Tente ajustar sua busca"
                  : "Adicione a primeira habilidade para comecar"
              }
              action={
                !search ? (
                  <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4" />
                    Nova Habilidade
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[600px] pr-2">
              {displayedSkills.map((skill) => {
                const type = getSkillType(skill)
                const SkillIcon = getSkillIcon(skill)
                const iconBg =
                  type === "soft"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-blue-100 text-blue-700"

                return (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
                        <SkillIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold tracking-wide text-slate-900">{skill.name}</h4>
                        <p className="text-sm text-slate-500">
                          {type === "soft" ? "Soft Skill" : "Hard Skill"} - Usada por {skill._count?.users ?? 0} usuario{(skill._count?.users ?? 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        className="p-2 text-slate-400 hover:text-blue-700 transition-colors rounded-md hover:bg-slate-100"
                        onClick={() => openEditDialog(skill)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                        onClick={() => openDeleteDialog(skill)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load more */}
          {activeSkills.length > INITIAL_SHOW && !showMore && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-center">
              <button
                onClick={() => setShowMore(true)}
                className="text-blue-700 hover:text-blue-600 text-sm font-semibold tracking-wide flex items-center gap-1 transition-colors"
              >
                Carregar mais <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogHeader>
          <DialogTitle>Adicionar Habilidade</DialogTitle>
          <DialogDescription>
            Crie uma nova habilidade para sua organizacao
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Nome da habilidade</Label>
              <Input
                id="skill-name"
                placeholder="Ex: React, Lideranca, Marketing Digital..."
                value={skillName}
                onChange={(e) => {
                  setSkillName(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate()
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? "Criando..." : "Criar Habilidade"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogHeader>
          <DialogTitle>Editar Habilidade</DialogTitle>
          <DialogDescription>
            Altere o nome da habilidade
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-skill-name">Nome da habilidade</Label>
              <Input
                id="edit-skill-name"
                value={skillName}
                onChange={(e) => {
                  setSkillName(e.target.value)
                  setError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdit()
                }}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowEditDialog(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEdit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogHeader>
          <DialogTitle>Excluir Habilidade</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta habilidade? Esta acao nao pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          {selectedSkill && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm">
                A habilidade <strong>{selectedSkill.name}</strong> sera removida permanentemente.
                {(selectedSkill._count?.users ?? 0) > 0 && (
                  <span className="block mt-1 text-destructive">
                    Atencao: {selectedSkill._count?.users} usuario(s) possuem esta habilidade.
                  </span>
                )}
              </p>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={saving}>
            {saving ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
