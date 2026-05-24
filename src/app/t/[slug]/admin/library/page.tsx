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
  Pencil,
  Link2,
  X,
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
  VIDEO: { label: "Video", icon: Video, color: "text-blue-600", bgColor: "bg-blue-600" },
  ARTICLE: { label: "Artigo", icon: Link2, color: "text-orange-700", bgColor: "bg-orange-700" },
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
  const mainCategory = "Lideranca"

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[28px] md:text-4xl font-bold tracking-tight text-slate-900 mb-2">Biblioteca de Materiais</h2>
          <p className="text-base text-slate-500">Gerencie os recursos disponiveis para mentores e mentorados.</p>
        </div>
        <button
          onClick={() => setShowUploadDialog(true)}
          className="flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold tracking-wide hover:bg-blue-600 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          Adicionar Novo Material
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <FileText className="h-5 w-5 text-blue-700" />
            <span className="text-xs font-medium uppercase tracking-wider">Total de Arquivos</span>
          </div>
          <div className="text-[28px] leading-9 font-semibold tracking-tight text-slate-900">{totalFiles}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Eye className="h-5 w-5 text-blue-700" />
            <span className="text-xs font-medium uppercase tracking-wider">Acessos este mes</span>
          </div>
          <div className="text-[28px] leading-9 font-semibold tracking-tight text-slate-900">{accessesThisMonth}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <BookOpen className="h-5 w-5 text-blue-700" />
            <span className="text-xs font-medium uppercase tracking-wider">Categoria Principal</span>
          </div>
          <div className="text-[28px] leading-9 font-semibold tracking-tight text-slate-900 truncate">{mainCategory}</div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
          <input
            className="w-full bg-white border border-slate-200 rounded-lg pl-12 pr-4 py-3 text-base focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors text-slate-900"
            placeholder="Buscar materiais..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-blue-700 text-white"
                  : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
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
                className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] hover:border-slate-300 transition-all group flex flex-col h-full relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    item.fileType === "PDF" ? "bg-red-100 text-red-600" :
                    item.fileType === "VIDEO" ? "bg-blue-600 text-white" :
                    item.fileType === "ARTICLE" ? "bg-orange-700 text-white" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors" title="Editar">
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      onClick={() => openDeleteDialog(item)}
                      title="Remover"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {item.category && (
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-slate-500 text-xs font-medium w-max mb-2">
                    {item.category}
                  </span>
                )}
                <h4 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-2">{item.title}</h4>
                {item.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{item.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
                  <span className="text-xs font-medium text-slate-400">
                    {formatFileSize(item.fileSize)} - {typeConfig?.label ?? item.fileType}
                  </span>
                  <span className="text-xs font-medium text-slate-400">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={showUploadDialog} onOpenChange={() => resetUploadDialog()}>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Material</DialogTitle>
          <DialogDescription>
            Adicione um novo material a biblioteca da organizacao
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-title">Titulo do Material</Label>
              <Input
                id="upload-title"
                placeholder="Ex: Guia Pratico de Feedback"
                value={uploadTitle}
                onChange={(e) => {
                  setUploadTitle(e.target.value)
                  setUploadError("")
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Descricao Curta</Label>
              <Textarea
                id="upload-description"
                placeholder="Breve resumo sobre o conteudo..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-type">Tipo de Arquivo</Label>
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
                Max 50MB - PDF, MP4, DOC, DOCX, TXT, MD
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
            {uploading ? "Enviando..." : "Salvar Material"}
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
