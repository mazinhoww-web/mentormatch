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
  global: boolean
  tenantId: string | null
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
      const res = await fetch("/api/skills", {
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
    // Approve pending skill - change status to approved
    setSkills((prev) =>
      prev.map((s) => (s.id === skill.id ? { ...s, status: "approved" } : s))
    )
  }

  function handleRejectSkill(skill: Skill) {
    // Remove rejected skill
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
    <div className="not-dark space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gestao de Habilidades</h1>
          <p className="text-gray-500 text-sm mt-1">
            Analise sugestoes e mantenha o dicionario de skills organizado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Exportar Lista
          </Button>
          <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Nova Habilidade
          </Button>
        </div>
      </div>

      {/* Pending skills section */}
      {pendingSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Aguardando Aprovacao</h2>
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
              {pendingSkills.length} Pendente{pendingSkills.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {pendingSkills.map((skill) => {
              const type = getSkillType(skill)
              const borderColor = type === "soft" ? "border-l-purple-500" : "border-l-blue-500"

              return (
                <div
                  key={skill.id}
                  className={`rounded-xl border border-gray-200 bg-white p-4 border-l-4 ${borderColor} shadow-sm`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{skill.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {skill.suggestedBy && (
                          <p className="text-sm text-gray-500">
                            Sugerido por: {skill.suggestedBy} ({skill.suggestedByRole || "Mentor"})
                          </p>
                        )}
                        <Badge
                          className={
                            type === "soft"
                              ? "bg-purple-100 text-purple-700 border-purple-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                          }
                        >
                          Sugerido como: {type === "soft" ? "Soft Skill" : "Hard Skill"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveSkill(skill)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        onClick={() => openEditDialog(skill)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleRejectSkill(skill)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Active skills dictionary */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Dicionario Ativo</h2>

        {/* Search and filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              placeholder="Buscar habilidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            {([
              { key: "all" as FilterTab, label: "Todas" },
              { key: "soft" as FilterTab, label: "Soft" },
              { key: "hard" as FilterTab, label: "Hard" },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filterTab === tab.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skills list */}
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
          <div className="space-y-1">
            {displayedSkills.map((skill) => {
              const type = getSkillType(skill)
              const SkillIcon = getSkillIcon(skill)
              const iconBg = type === "soft" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"

              return (
                <div
                  key={skill.id}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors group"
                >
                  <div className={`rounded-lg p-2 ${iconBg}`}>
                    <SkillIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      type === "soft"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {type === "soft" ? "Soft Skill" : "Hard Skill"}
                  </span>
                  <span className="text-xs text-gray-400 w-28 text-right">
                    Usada por {skill._count?.users ?? 0} usuario{(skill._count?.users ?? 0) !== 1 ? "s" : ""}
                  </span>
                  {/* Edit/Delete on hover */}
                  {!skill.global && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                        onClick={() => openEditDialog(skill)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                        onClick={() => openDeleteDialog(skill)}
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Load more button */}
            {activeSkills.length > INITIAL_SHOW && !showMore && (
              <button
                onClick={() => setShowMore(true)}
                className="w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                Carregar mais
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
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
