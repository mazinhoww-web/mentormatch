"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import {
  Settings,
  Palette,
  CreditCard,
  Sliders,
  Check,
  Upload,
  Info,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loading } from "@/components/ui/loading"

interface TenantSettings {
  id: string
  name: string
  slug: string
  logo: string | null
  brandColor: string | null
  maxMenteesPerMentor: number
  subscription: {
    plan: {
      name: string
      maxUsers: number
      maxMentors: number
    }
  } | null
}

export default function AdminSettingsPage() {
  const params = useParams<{ slug: string }>()
  const [settings, setSettings] = useState<TenantSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Form fields
  const [tenantName, setTenantName] = useState("")
  const [brandColor, setBrandColor] = useState("#6366f1")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [maxMentees, setMaxMentees] = useState(4)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/settings?slug=${params.slug}`)
      if (res.ok) {
        const data: TenantSettings = await res.json()
        setSettings(data)
        setTenantName(data.name)
        setBrandColor(data.brandColor || "#6366f1")
        setLogoPreview(data.logo)
        setMaxMentees(data.maxMenteesPerMentor || 4)
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err)
    } finally {
      setLoading(false)
    }
  }, [params.slug])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    try {
      let logoUrl = settings?.logo || null

      // Upload new logo if provided
      if (logoFile) {
        const formData = new FormData()
        formData.append("file", logoFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          logoUrl = uploadData.url
        }
      }

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tenantName.trim(),
          brandColor,
          logo: logoUrl,
          maxMenteesPerMentor: maxMentees,
        }),
      })

      if (res.ok) {
        const updated = await res.json()
        setSettings((prev) => (prev ? { ...prev, ...updated } : prev))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error("Erro ao salvar configurações:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading text="Carregando configurações..." />
  }

  const planName = settings?.subscription?.plan?.name || "Free"
  const planFeatures = [
    "Até 50 usuários",
    "Até 10 mentores",
    "Biblioteca de materiais",
    "Relatórios básicos",
    "Suporte por email",
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua organização
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branding section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Identidade Visual</CardTitle>
            </div>
            <CardDescription>
              Personalize a aparência da sua organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Nome da organização</Label>
                <Input
                  id="tenant-name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="Nome da sua organização"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="h-16 w-16 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recomendado: PNG ou SVG, 200x200px
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-color">Cor da marca</Label>
                <div className="flex items-center gap-3">
                  <input
                    id="brand-color-picker"
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-10 rounded-md border border-input cursor-pointer"
                  />
                  <Input
                    id="brand-color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#6366f1"
                    className="max-w-[140px]"
                  />
                  <div
                    className="h-10 flex-1 rounded-md border"
                    style={{ backgroundColor: brandColor }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Plano Atual</CardTitle>
            </div>
            <CardDescription>
              Informações sobre seu plano e limites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {planName}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Recursos inclusos:</p>
                <ul className="space-y-2">
                  {planFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <Button
                className="w-full"
                variant="outline"
                disabled
                title="Em breve"
              >
                <CreditCard className="h-4 w-4" />
                Fazer Upgrade
              </Button>
              <div className="flex items-center gap-1.5 mt-2 justify-center">
                <Info className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Em breve</p>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* General settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Configurações Gerais</CardTitle>
            </div>
            <CardDescription>
              Ajuste os parâmetros da sua organização de mentoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max-mentees">Máximo de mentorados por mentor</Label>
                <Input
                  id="max-mentees"
                  type="number"
                  min={1}
                  max={20}
                  value={maxMentees}
                  onChange={(e) => setMaxMentees(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  Define quantos mentorados cada mentor pode acompanhar simultaneamente
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Salvando..." : "Salvar Configurações"}
              </Button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Salvo com sucesso!
                </span>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
