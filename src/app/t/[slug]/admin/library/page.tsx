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
  Bell,
  Plus,
  FolderOpen,
  Eye,
  TrendingUp,
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
  category?: string
  createdAt: string
  uploadedBy: {
    id: string
    name: string
    image: string | null
  }
}

const fileTypeConfig: Record<
  string,
  { label: string; icon: typeof FileText; color: string; bgColor: string }
> = {
  PDF: { label: "PDF", icon: FileText, color: "text-red-600", bgColor: "bg-red-100" },
  VIDEO: { label: "Video", icon: Video, color: "text-purple-600", bgColor: "bg-purple-100" },
  ARTICLE: { label: "Artigo", icon: BookOpen, color: "text-blue-600", bgColor: "bg-blue-100" },
  OTHER: { label: "Outro", icon: File, color: "text-gray-600", bgColor: "bg-gray-100" },
}

const fileTypeOptions = [
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "Video" },
  { value: "ARTICLE", label: "Artigo" },
  { value: "OTHER", label: "Outro" },
]

const categoryFilters = ["Todos", "Carreira", "Lideranca", "Soft Skills"]

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
  const [activeCategory, setActiveCategory] = useState("Todos")

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
    let result = items

    if (activeCategory !== "Todos") {
      result = result.filter((item) => item.category === activeCategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.uploadedBy.name.toLowerCase().includes(q) ||
          item.fileType.toLowerCase().includes(q)
      )
    }

    return result
  }, [items, search, activeCategory])

  // Stat values
  const totalFiles = items.length
  const accessesThisMonth = items.length > 0 ? `${(items.length * 0.8).toFixed(1)}k` : "0"
  const mainCategory = "Carreira"

  async function handleUpload() {
    if (!uploadTitle.trim()) {
      setUploadError("Titulo e obrigatorio")
      return
    }

    setUploading(true)
    setUploadError("")

    try {
      let fileUrl = ""
      let fileSize: number | undefined

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Biblioteca de Materiais</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie os recursos disponiveis para mentores e mentorados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <Button onClick={() => setShowUploadDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Adicionar Novo Material
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total de Arquivos</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalFiles}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Acessos Este Mes</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{accessesThisMonth}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Categoria Principal</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{mainCategory}</p>
        </div>
      </div>

      {/* Search and category filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Buscar materiais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Material cards */}
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
              <Button onClick={() => setShowUploadDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Adicionar Novo Material
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const typeConfig = fileTypeConfig[item.fileType]
            const TypeIcon = typeConfig?.icon ?? File

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`rounded-xl p-3 ${typeConfig?.bgColor ?? "bg-gray-100"}`}>
                    <TypeIcon className={`h-5 w-5 ${typeConfig?.color ?? "text-gray-600"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {item.category && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 mb-1">
                        {item.category}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{item.title}</h3>
                  </div>
                  <button
                    className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => openDeleteDialog(item)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {item.description && (
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      {typeConfig?.label ?? item.fileType}
                    </span>
                    <span>{formatFileSize(item.fileSize)}</span>
                  </div>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={showUploadDialog} onOpenChange={() => resetUploadDialog()}>
        <DialogHeader>
          <DialogTitle>Enviar Material</DialogTitle>
          <DialogDescription>
            Adicione um novo material a biblioteca da organizacao
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-title">Titulo</Label>
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
              <Label htmlFor="upload-description">Descricao (opcional)</Label>
              <Textarea
                id="upload-description"
                placeholder="Descreva brevemente o conteudo..."
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
          <Button onClick={handleUpload} disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogHeader>
          <DialogTitle>Excluir Material</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir este material? Esta acao nao pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          {selectedItem && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
              <p className="text-sm">
                O material <strong>{selectedItem.title}</strong> sera removido permanentemente.
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
