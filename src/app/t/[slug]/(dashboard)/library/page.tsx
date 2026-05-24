"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  BookOpen,
  Search,
  Upload,
  FileText,
  Video,
  Globe,
  File,
  Plus,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Loading } from "@/components/ui/loading"

interface UploadedBy {
  id: string
  name: string
  image?: string | null
}

interface LibraryItem {
  id: string
  title: string
  description?: string | null
  fileUrl: string
  fileType: "PDF" | "VIDEO" | "ARTICLE" | "OTHER"
  fileSize?: number | null
  createdAt: string
  uploadedBy: UploadedBy
}

const fileTypeConfig: Record<
  string,
  { label: string; icon: typeof FileText; color: string; badgeColor: string }
> = {
  PDF: { label: "PDF", icon: FileText, color: "text-red-500", badgeColor: "bg-red-100 text-red-700" },
  VIDEO: { label: "Video", icon: Video, color: "text-purple-500", badgeColor: "bg-purple-100 text-purple-700" },
  ARTICLE: { label: "Artigo", icon: Globe, color: "text-blue-500", badgeColor: "bg-blue-100 text-blue-700" },
  OTHER: { label: "Outro", icon: File, color: "text-gray-500", badgeColor: "bg-gray-100 text-gray-700" },
}

const CATEGORIES = ["Todos", "Carreira", "Tecnico", "Soft Skills"]

const uploadFileTypeOptions = [
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "Video" },
  { value: "ARTICLE", label: "Artigo" },
  { value: "OTHER", label: "Outro" },
]

function getCategory(item: LibraryItem): string {
  const title = (item.title + " " + (item.description || "")).toLowerCase()
  if (title.includes("carreira") || title.includes("cv") || title.includes("curriculo") || title.includes("entrevista")) return "Carreira"
  if (title.includes("tecnic") || title.includes("codigo") || title.includes("programacao") || title.includes("tech")) return "Tecnico"
  if (title.includes("soft") || title.includes("comunicacao") || title.includes("lideranca") || title.includes("gestao")) return "Soft Skills"
  return "Carreira"
}

function formatSize(bytes?: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function LibraryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<LibraryItem[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [userRole, setUserRole] = useState("")

  // Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadTitle, setUploadTitle] = useState("")
  const [uploadDescription, setUploadDescription] = useState("")
  const [uploadFileType, setUploadFileType] = useState("PDF")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  useEffect(() => {
    fetchData()
  }, [slug])

  async function fetchData() {
    try {
      const [libraryRes, sessionRes] = await Promise.all([
        fetch(`/api/library?tenantId=${encodeURIComponent(slug)}`),
        fetch("/api/auth/session"),
      ])

      const data = await libraryRes.json()
      const session = await sessionRes.json()

      setItems(Array.isArray(data) ? data : [])
      setUserRole(session?.user?.role || "")
    } catch (error) {
      console.error("Erro ao carregar biblioteca:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload() {
    if (!uploadTitle.trim() || !uploadFile) {
      setUploadError("Preencha o titulo e selecione um arquivo.")
      return
    }

    setUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("file", uploadFile)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        setUploadError("Erro ao fazer upload do arquivo.")
        return
      }

      const { url } = await uploadRes.json()

      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle.trim(),
          description: uploadDescription.trim() || undefined,
          fileUrl: url,
          fileType: uploadFileType,
          fileSize: uploadFile.size,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setUploadError(data.error || "Erro ao criar item.")
        return
      }

      setUploadOpen(false)
      setUploadTitle("")
      setUploadDescription("")
      setUploadFileType("PDF")
      setUploadFile(null)
      fetchData()
    } catch (error) {
      console.error("Erro ao enviar material:", error)
      setUploadError("Erro ao enviar material. Tente novamente.")
    } finally {
      setUploading(false)
    }
  }

  const canUpload = userRole === "MENTOR" || userRole === "ADMIN"

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search.trim() ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      selectedCategory === "Todos" || getCategory(item) === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <Loading text="Carregando biblioteca..." />
  }

  return (
    <div className="min-h-screen bg-white -mx-4 -mt-6 sm:-mx-6 lg:-mx-8 lg:-mt-6">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Materiais</h1>
            <p className="text-gray-500 mt-1">
              Explore recursos selecionados para impulsionar seu desenvolvimento.
            </p>
          </div>
          {canUpload && (
            <Button
              onClick={() => setUploadOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              <Upload className="h-4 w-4" />
              Enviar
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por titulo, assunto ou formato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items - full width stacked cards */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Nenhum material encontrado"
            description={
              search || selectedCategory !== "Todos"
                ? "Tente alterar os filtros ou termos de busca."
                : "A biblioteca ainda nao possui materiais."
            }
            action={
              canUpload && !search && selectedCategory === "Todos" ? (
                <Button onClick={() => setUploadOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" />
                  Enviar primeiro material
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const typeConfig = fileTypeConfig[item.fileType] || fileTypeConfig.OTHER
              const TypeIcon = typeConfig.icon
              const category = getCategory(item)

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
                  onClick={() => router.push(`/t/${slug}/library/${item.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <TypeIcon className={`h-6 w-6 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeConfig.badgeColor} mb-1.5`}>
                            {category.toUpperCase()}
                          </span>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-300 shrink-0 mt-5" />
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <span>{typeConfig.label}</span>
                        {item.fileSize && (
                          <>
                            <span>-</span>
                            <span>{formatSize(item.fileSize)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogHeader>
          <DialogTitle>Enviar Material</DialogTitle>
          <DialogDescription>
            Compartilhe materiais de apoio com os participantes da mentoria.
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-title">Titulo</Label>
              <Input
                id="upload-title"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Titulo do material"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-description">Descricao (opcional)</Label>
              <Textarea
                id="upload-description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Breve descricao do material..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-type">Tipo do Arquivo</Label>
              <Select
                id="upload-type"
                options={uploadFileTypeOptions}
                value={uploadFileType}
                onChange={(e) => setUploadFileType(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="upload-file">Arquivo</Label>
              <Input
                id="upload-file"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>

            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setUploadOpen(false)
              setUploadError("")
            }}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={uploading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
