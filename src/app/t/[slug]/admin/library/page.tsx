"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Search,
  Upload,
  Trash2,
  FileText,
  Video,
  BookOpen,
  File,
  Calendar,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"
import { EmptyState } from "@/components/ui/empty-state"
import { Select } from "@/components/ui/select"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"

interface LibraryItem {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileType: "PDF" | "VIDEO" | "ARTICLE" | "OTHER"
  fileSize: number | null
  createdAt: string
  uploadedBy: {
    id: string
    name: string
    image: string | null
  }
}

const fileTypeConfig: Record<
  string,
  { label: string; icon: typeof FileText; variant: "default" | "secondary" | "outline" | "warning" }
> = {
  PDF: { label: "PDF", icon: FileText, variant: "default" },
  VIDEO: { label: "Vídeo", icon: Video, variant: "secondary" },
  ARTICLE: { label: "Artigo", icon: BookOpen, variant: "outline" },
  OTHER: { label: "Outro", icon: File, variant: "warning" },
}

const fileTypeOptions = [
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "Vídeo" },
  { value: "ARTICLE", label: "Artigo" },
  { value: "OTHER", label: "Outro" },
]

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AdminLibraryPage() {
  const params = useParams<{ slug: string }>()
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Upload dialog state
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadDescription, setUploadDescription] = useState("")
  const [uploadFileType, setUploadFileType] = useState("PDF")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/library?tenantId=${params.slug}`)
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (err) {
      console.error("Erro ao buscar materiais:", err)
    } finally {
      setLoading(false)
    }
  }, [params.slug])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.uploadedBy.name.toLowerCase().includes(q) ||
        item.fileType.toLowerCase().includes(q)
    )
  }, [items, search])

  async function handleUpload() {
    if (!uploadTitle.trim()) {
      setUploadError("Título é obrigatório")
      return
    }

    setUploading(true)
    setUploadError("")

    try {
      let fileUrl = ""
      let fileSize: number | undefined

      // Upload file if provided
      if (uploadFile) {
        const formData = new FormData()
        formData.append("file", uploadFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          setUploadError("Erro ao enviar arquivo")
          return
        }

        const uploadData = await uploadRes.json()
        fileUrl = uploadData.url
        fileSize = uploadFile.size
      }

      // Create library item
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle.trim(),
          description: uploadDescription.trim() || undefined,
          fileUrl: fileUrl || `https://placeholder.mentormatch.com/${Date.now()}`,
          fileType: uploadFileType,
          fileSize,
        }),
      })

      if (res.ok) {
        const newItem = await res.json()
        setItems((prev) => [newItem, ...prev])
        resetUploadDialog()
      } else {
        const data = await res.json()
        setUploadError(data.error || "Erro ao criar material")
      }
    } catch (err) {
      setUploadError("Erro ao enviar material")
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete() {
    if (!selectedItem) return

    setDeleting(true)

    try {
      const res = await fetch(`/api/library?id=${selectedItem.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== selectedItem.id))
        setShowDeleteDialog(false)
        setSelectedItem(null)
      }
    } catch (err) {
      console.error("Erro ao excluir material:", err)
    } finally {
      setDeleting(false)
    }
  }

  function resetUploadDialog() {
    setShowUploadDialog(false)
    setUploadTitle("")
    setUploadDescription("")
    setUploadFileType("PDF")
    setUploadFile(null)
    setUploadError("")
  }

  function openDeleteDialog(item: LibraryItem) {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  if (loading) {
    return <Loading text="Carregando biblioteca..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Materiais</h1>
          <p className="text-muted-foreground">
            Gerencie os materiais e recursos compartilhados
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="h-4 w-4" />
          Enviar Material
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar materiais..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum material encontrado"
          description={
            search
              ? "Tente ajustar sua busca"
              : "Envie o primeiro material para a biblioteca"
          }
          action={
            !search ? (
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4" />
                Enviar Material
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border">
          {/* Table header */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div>Material</div>
            <div className="w-20 text-center">Tipo</div>
            <div className="w-20 text-center">Tamanho</div>
            <div className="w-36 text-center">Enviado por</div>
            <div className="w-36 text-right">Ações</div>
          </div>

          {/* Item rows */}
          <div className="divide-y">
            {filteredItems.map((item) => {
              const typeConfig = fileTypeConfig[item.fileType]
              const TypeIcon = typeConfig?.icon ?? File

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 px-4 py-4 hover:bg-muted/30 transition-colors sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4"
                >
                  {/* Title and description */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                      <TypeIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* File type */}
                  <div className="w-20 text-center">
                    <Badge variant={typeConfig?.variant ?? "outline"}>
                      {typeConfig?.label ?? item.fileType}
                    </Badge>
                  </div>

                  {/* File size */}
                  <div className="w-20 text-center text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </div>

                  {/* Uploaded by + date */}
                  <div className="w-36 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.uploadedBy.name}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 w-36">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.fileUrl, "_blank")}
                    >
                      Abrir
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(item)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={showUploadDialog} onOpenChange={() => resetUploadDialog()}>
        <DialogHeader>
          <DialogTitle>Enviar Material</DialogTitle>
          <DialogDescription>
            Adicione um novo material à biblioteca da organização
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-title">Título</Label>
              <Input
                id="upload-title"
                placeholder="Nome do material"
                value={uploadTitle}
                onChange={(e) => {
                  setUploadTitle(e.target.value)
                  setUploadError("")
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Descrição (opcional)</Label>
              <Textarea
                id="upload-description"
                placeholder="Descreva brevemente o conteúdo..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-type">Tipo do arquivo</Label>
              <Select
                id="upload-type"
                options={fileTypeOptions}
                value={uploadFileType}
                onChange={(e) => setUploadFileType(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-file">Arquivo</Label>
              <Input
                id="upload-file"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                accept=".pdf,.mp4,.doc,.docx,.txt,.md"
              />
              <p className="text-xs text-muted-foreground">
                Formatos aceitos: PDF, MP4, DOC, DOCX, TXT, MD
              </p>
            </div>

            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={resetUploadDialog}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogHeader>
          <DialogTitle>Excluir Material</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este material? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          {selectedItem && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm">
                O material <strong>{selectedItem.title}</strong> será removido permanentemente.
              </p>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
