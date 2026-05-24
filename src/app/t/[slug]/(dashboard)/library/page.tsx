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
  Clock,
  Download,
  ExternalLink,
  PlayCircle,
  Link as LinkIcon,
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
  { label: string; icon: typeof FileText; iconLabel: string; bgColor: string; textColor: string }
> = {
  PDF: { label: "PDF", icon: FileText, iconLabel: "description", bgColor: "bg-red-100", textColor: "text-red-700", },
  VIDEO: { label: "Video", icon: PlayCircle, iconLabel: "play_circle", bgColor: "bg-blue-600", textColor: "text-white", },
  ARTICLE: { label: "Artigo", icon: LinkIcon, iconLabel: "link", bgColor: "bg-[#bc4800]", textColor: "text-white", },
  OTHER: { label: "Outro", icon: File, iconLabel: "file", bgColor: "bg-gray-100", textColor: "text-gray-700", },
}

const CATEGORIES = ["Todos", "Carreira", "Tecnico", "Soft Skills", "Lideranca"]

const uploadFileTypeOptions = [
  { value: "PDF", label: "PDF" },
  { value: "VIDEO", label: "Video" },
  { value: "ARTICLE", label: "Artigo" },
  { value: "OTHER", label: "Outro" },
]

function getCategory(item: LibraryItem): string {
  const title = (item.title + " " + (item.description || "")).toLowerCase()
  if (title.includes("lideranc") || title.includes("okr") || title.includes("gestao")) return "Lideranca"
  if (title.includes("carreira") || title.includes("cv") || title.includes("curriculo") || title.includes("entrevista") || title.includes("portfolio") || title.includes("github")) return "Carreira"
  if (title.includes("tecnic") || title.includes("codigo") || title.includes("programacao") || title.includes("tech") || title.includes("arquitetura") || title.includes("clean")) return "Tecnico"
  if (title.includes("soft") || title.includes("comunicacao") || title.includes("cnv") || title.includes("violenta")) return "Soft Skills"
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
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[36px] leading-[44px] tracking-[-0.02em] font-bold text-[#131b2e] mb-2">
              Biblioteca de Materiais
            </h1>
            <p className="text-lg leading-7 text-[#434655]">
              Explore recursos selecionados para impulsionar seu desenvolvimento.
            </p>
          </div>
          {canUpload && (
            <Button
              onClick={() => setUploadOpen(true)}
              className="bg-[#004ac6] hover:bg-[#0053db] text-white shrink-0"
            >
              <Upload className="h-4 w-4" />
              Enviar
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#737686]" />
        </div>
        <input
          type="text"
          placeholder="Buscar por titulo, assunto ou formato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#004ac6] focus:border-[#004ac6] text-base text-[#131b2e] placeholder-[#c3c6d7] shadow-sm transition-shadow"
        />
      </div>

      {/* Categories (Chips) */}
      <div className="flex overflow-x-auto pb-2 mb-8 gap-2" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold tracking-[0.05em] border transition-colors ${
              selectedCategory === cat
                ? "bg-[#004ac6] text-white border-[#004ac6]"
                : "bg-white text-[#434655] border-[#E2E8F0] hover:border-[#004ac6] hover:text-[#004ac6]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Material Cards Grid */}
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
              <Button onClick={() => setUploadOpen(true)} className="bg-[#004ac6] hover:bg-[#0053db] text-white">
                <Plus className="h-4 w-4" />
                Enviar primeiro material
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const typeConfig = fileTypeConfig[item.fileType] || fileTypeConfig.OTHER
            const TypeIcon = typeConfig.icon
            const category = getCategory(item)

            return (
              <div
                key={item.id}
                className="group bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] hover:border-[#c3c6d7] transition-all cursor-pointer"
                onClick={() => router.push(`/t/${slug}/library/${item.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg ${typeConfig.bgColor} ${typeConfig.textColor} flex items-center justify-center`}>
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-[#f2f3ff] text-[#434655] rounded-full border border-[#E2E8F0]">
                    {category}
                  </span>
                </div>
                <h3 className="text-xl leading-7 font-semibold text-[#131b2e] mb-2 line-clamp-2 group-hover:text-[#004ac6] transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-[#434655] mb-4 line-clamp-3 flex-grow">
                    {item.description}
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between text-[#737686]">
                  <span className="text-xs font-medium flex items-center gap-1">
                    {item.fileType === "VIDEO" ? (
                      <>
                        <Clock className="h-4 w-4" />
                        Video
                      </>
                    ) : item.fileType === "ARTICLE" ? (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        Link Externo
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        {typeConfig.label}
                        {item.fileSize ? ` - ${formatSize(item.fileSize)}` : ""}
                      </>
                    )}
                  </span>
                </div>
              </div>
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
              <p className="text-sm text-red-600">{uploadError}</p>
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
          <Button onClick={handleUpload} disabled={uploading} className="bg-[#004ac6] hover:bg-[#0053db] text-white">
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
