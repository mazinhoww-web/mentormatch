"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Download,
  FileText,
  Video,
  Globe,
  File,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function LibraryItemPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const itemId = params.id as string

  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState<LibraryItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages] = useState(15)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch(
          `/api/library?tenantId=${encodeURIComponent(slug)}`
        )
        const items: LibraryItem[] = await res.json()
        const found = items.find((i) => i.id === itemId) || null
        setItem(found)
      } catch (error) {
        console.error("Erro ao carregar material:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [slug, itemId])

  if (loading) {
    return <Loading text="Carregando material..." />
  }

  if (!item) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/t/${slug}/library`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para biblioteca
        </Button>
        <div className="text-center py-16">
          <p className="text-lg font-medium">Material nao encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            O material que voce procura nao existe ou foi removido.
          </p>
        </div>
      </div>
    )
  }

  const typeConfig = fileTypeConfig[item.fileType] || fileTypeConfig.OTHER
  const isPdf = item.fileType === "PDF"

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-slate-100">
      {/* Header / Task App Bar */}
      <header className="bg-white border-b border-slate-200 flex justify-between items-center px-6 h-16 w-full shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/t/${slug}/library`)}
            className="p-2 -ml-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors active:scale-95 flex items-center justify-center"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-slate-900 truncate max-w-[50vw] md:max-w-xl">
            {item.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(item.fileUrl, "_blank")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-700 text-white hover:bg-blue-600 transition-colors active:scale-95 text-sm font-semibold tracking-wide"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Baixar PDF</span>
          </button>
        </div>
      </header>

      {/* Main Viewer Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="min-h-full py-8 px-4 flex justify-center items-start">
          {isPdf ? (
            <div
              className="bg-white w-full max-w-4xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200 rounded mx-auto origin-top transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})`, minHeight: "1056px" }}
            >
              <iframe
                src={`${item.fileUrl}#toolbar=0&navpanes=0`}
                className="h-full w-full rounded border-0"
                style={{ minHeight: "1056px" }}
                title={item.title}
              />
            </div>
          ) : item.fileType === "VIDEO" ? (
            <div className="bg-white w-full max-w-4xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200 rounded-lg p-8 mx-auto">
              <div className="aspect-video w-full">
                <video
                  src={item.fileUrl}
                  controls
                  className="h-full w-full rounded-lg"
                >
                  Seu navegador nao suporta a reproducao de videos.
                </video>
              </div>
            </div>
          ) : item.fileType === "ARTICLE" ? (
            <div className="bg-white w-full max-w-4xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200 rounded-lg p-12 md:p-16 mx-auto flex flex-col items-center gap-6 text-center">
              <Globe className="h-16 w-16 text-slate-400" />
              <div>
                <p className="text-xl font-semibold text-slate-900">Artigo Externo</p>
                <p className="text-sm text-slate-500 mt-2">
                  Este material e um link para um artigo externo.
                </p>
              </div>
              <button
                onClick={() => window.open(item.fileUrl, "_blank")}
                className="px-6 py-3 bg-blue-700 text-white rounded-lg text-sm font-semibold tracking-wide hover:bg-blue-600 transition-colors"
              >
                Abrir Artigo
              </button>
            </div>
          ) : (
            <div className="bg-white w-full max-w-4xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-200 rounded-lg p-12 md:p-16 mx-auto flex flex-col items-center gap-6 text-center">
              <File className="h-16 w-16 text-slate-400" />
              <div>
                <p className="text-xl font-semibold text-slate-900">Visualizacao nao disponivel</p>
                <p className="text-sm text-slate-500 mt-2">
                  Este tipo de arquivo nao pode ser visualizado diretamente.
                </p>
              </div>
              <button
                onClick={() => window.open(item.fileUrl, "_blank")}
                className="px-6 py-3 bg-blue-700 text-white rounded-lg text-sm font-semibold tracking-wide hover:bg-blue-600 transition-colors"
              >
                Baixar Arquivo
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Controls (Floating Pill) */}
      {isPdf && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-lg border border-slate-200 rounded-full px-6 py-3 flex items-center gap-6 z-20">
          {/* Pagination */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Pagina Anterior"
              className="p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold tracking-wide text-slate-900 min-w-[3rem] text-center">
              {currentPage} / {totalPages}
            </span>
            <button
              aria-label="Proxima Pagina"
              className="p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Diminuir Zoom"
              className="p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold tracking-wide text-slate-900 min-w-[3rem] text-center">{zoom}%</span>
            <button
              aria-label="Aumentar Zoom"
              className="p-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              onClick={() => setZoom((z) => Math.min(200, z + 10))}
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              aria-label="Ajustar a largura"
              className="p-1 ml-1 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors hidden sm:block"
              onClick={() => setZoom(100)}
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
