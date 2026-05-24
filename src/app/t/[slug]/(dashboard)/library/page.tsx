"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  BookOpen,
  Search,
  Upload,
  Download,
  FileText,
  Video,
  Globe,
  File,
  Plus,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
import { formatDate } from "@/lib/utils"

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
  { label: string; icon: typeof FileText; color: string }
> = {
  PDF: { label: "PDF", icon: FileText, color: "text-red-600 bg-red-100" },
  VIDEO: { label: "Video", icon: Video, color: "text-purple-600 bg-purple-100" },
  ARTICLE: { label: "Artigo", icon: Globe, color: "text-blue-600 bg-blue-100" },
  OTHER: { label: "Outro", icon: File, color: "text-gray-600 bg-gray-100" },
}

const fileTypeFilterOptions = [
  { value: "", label: "Todos os tipos" },
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "Video" },
  { value: "ARTICLE", label: "Artigo" },
  { value: "OTHER", label: "Outro" },
]

const uploadFileTypeOptions = [
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "Video" },
  { value: "ARTICLE", label: "Artigo" },
  { value: "OTHER", label: "Outro" },
]

export default function LibraryPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<LibraryItem[]>([])
  const [search, setSearch] = useState("")
  const [fileTypeFilter, setFileTypeFilter] = useState("")
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
      // First upload the file
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

      // Then create the library item
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

      // Reset form and refresh
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
    const matchesType = !fileTypeFilter || item.fileType === fileTypeFilter
    return matchesSearch && matchesType
  })

  if (loading) {
    return <Loading text="Carregando biblioteca..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biblioteca</h1>
          <p className="text-muted-foreground">
            Materiais de apoio para sua jornada de mentoria.
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4" />
            Enviar Material
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por titulo ou descricao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={fileTypeFilterOptions}
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhum material encontrado"
          description={
            search || fileTypeFilter
              ? "Tente alterar os filtros ou termos de busca."
              : "A biblioteca ainda não possui materiais."
          }
          action={
            canUpload && !search && !fileTypeFilter ? (
              <Button onClick={() => setUploadOpen(true)}>
                <Plus className="h-4 w-4" />
                Enviar primeiro material
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const typeConfig = fileTypeConfig[item.fileType] || fileTypeConfig.OTHER
            const TypeIcon = typeConfig.icon

            return (
              <Card
                key={item.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/t/${slug}/library/${item.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-lg p-2 shrink-0 ${typeConfig.color}`}
                    >
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold line-clamp-2">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {typeConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Por {item.uploadedBy.name}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(item.fileUrl, "_blank")
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

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
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
