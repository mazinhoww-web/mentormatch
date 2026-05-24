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
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
          <p className="text-lg font-medium">Material não encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            O material que você procura não existe ou foi removido.
          </p>
        </div>
      </div>
    )
  }

  const typeConfig = fileTypeConfig[item.fileType] || fileTypeConfig.OTHER
  const TypeIcon = typeConfig.icon
  const isPdf = item.fileType === "PDF"

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push(`/t/${slug}/library`)}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para biblioteca
      </Button>

      {/* Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`rounded-lg p-3 shrink-0 ${typeConfig.color}`}
              >
                <TypeIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{item.title}</h1>
                {item.description && (
                  <p className="mt-2 text-muted-foreground whitespace-pre-line">
                    {item.description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {item.uploadedBy.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(item.createdAt)}
                  </div>
                  <Badge variant="outline">{typeConfig.label}</Badge>
                  {item.fileSize && (
                    <span>{formatFileSize(item.fileSize)}</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={() => window.open(item.fileUrl, "_blank")}
              className="shrink-0"
            >
              <Download className="h-4 w-4" />
              Baixar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer or Content Preview */}
      {isPdf ? (
        <Card>
          <CardContent className="p-0">
            <div className="w-full" style={{ height: "calc(100vh - 320px)", minHeight: "500px" }}>
              <iframe
                src={`${item.fileUrl}#toolbar=1&navpanes=1`}
                className="h-full w-full rounded-b-lg border-0"
                title={item.title}
              />
            </div>
          </CardContent>
        </Card>
      ) : item.fileType === "VIDEO" ? (
        <Card>
          <CardContent className="p-6">
            <div className="aspect-video w-full">
              <video
                src={item.fileUrl}
                controls
                className="h-full w-full rounded-lg"
              >
                Seu navegador não suporta a reprodução de videos.
              </video>
            </div>
          </CardContent>
        </Card>
      ) : item.fileType === "ARTICLE" ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Globe className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Artigo Externo</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Este material é um link para um artigo externo.
                </p>
              </div>
              <Button onClick={() => window.open(item.fileUrl, "_blank")}>
                <Globe className="h-4 w-4" />
                Abrir Artigo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <File className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Visualização não disponível</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Este tipo de arquivo não pode ser visualizado diretamente. Utilize o botão abaixo para fazer o download.
                </p>
              </div>
              <Button onClick={() => window.open(item.fileUrl, "_blank")}>
                <Download className="h-4 w-4" />
                Baixar Arquivo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
