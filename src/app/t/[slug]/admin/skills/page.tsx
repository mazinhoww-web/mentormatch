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
  _count?: {
    users: number
  }
}

export default function AdminSkillsPage() {
  const params = useParams<{ slug: string }>()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

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

  const filteredSkills = useMemo(() => {
    if (!search.trim()) return skills
    const q = search.toLowerCase()
    return skills.filter((s) => s.name.toLowerCase().includes(q))
  }, [skills, search])

  async function handleCreate() {
    if (!skillName.trim()) {
      setError("Nome da habilidade é obrigatório")
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
      setError("Nome da habilidade é obrigatório")
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciar Habilidades</h1>
          <p className="text-muted-foreground">
            Gerencie as habilidades disponíveis para mentores e mentorados
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          Adicionar Habilidade
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar habilidades..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Skills summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{skills.length} habilidade{skills.length !== 1 ? "s" : ""} no total</span>
        <span>{skills.filter((s) => s.global).length} global(is)</span>
        <span>{skills.filter((s) => !s.global).length} da organização</span>
      </div>

      {/* Skills list */}
      {filteredSkills.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Nenhuma habilidade encontrada"
          description={
            search
              ? "Tente ajustar sua busca"
              : "Adicione a primeira habilidade para começar"
          }
          action={
            !search ? (
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Adicionar Habilidade
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div>Habilidade</div>
            <div className="w-24 text-center">Usuários</div>
            <div className="w-28 text-center">Tipo</div>
            <div className="w-32 text-right">Ações</div>
          </div>

          {/* Skill rows */}
          <div className="divide-y">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex flex-col gap-3 px-4 py-4 hover:bg-muted/30 transition-colors sm:grid sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-4"
              >
                {/* Name */}
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{skill.name}</span>
                </div>

                {/* User count */}
                <div className="w-24 text-center">
                  <span className="text-sm text-muted-foreground">
                    {skill._count?.users ?? 0} usuário{(skill._count?.users ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Type badge */}
                <div className="w-28 text-center">
                  {skill.global ? (
                    <Badge variant="secondary">
                      <Globe className="mr-1 h-3 w-3" />
                      Global
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Building2 className="mr-1 h-3 w-3" />
                      Organização
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 w-32">
                  {!skill.global && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(skill)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(skill)}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {skill.global && (
                    <span className="text-xs text-muted-foreground">Somente leitura</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogHeader>
          <DialogTitle>Adicionar Habilidade</DialogTitle>
          <DialogDescription>
            Crie uma nova habilidade para sua organização
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Nome da habilidade</Label>
              <Input
                id="skill-name"
                placeholder="Ex: React, Liderança, Marketing Digital..."
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
          <Button onClick={handleCreate} disabled={saving}>
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
          <Button onClick={handleEdit} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogHeader>
          <DialogTitle>Excluir Habilidade</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta habilidade? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          {selectedSkill && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm">
                A habilidade <strong>{selectedSkill.name}</strong> será removida permanentemente.
                {(selectedSkill._count?.users ?? 0) > 0 && (
                  <span className="block mt-1 text-destructive">
                    Atenção: {selectedSkill._count?.users} usuário(s) possuem esta habilidade.
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
