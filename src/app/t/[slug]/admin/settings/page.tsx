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
      console.error("Erro ao carregar configuracoes:", err)
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

        const uploadRes = await fetch("/mentormatch/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          logoUrl = uploadData.url
        }
      }

      const res = await fetch("/mentormatch/api/admin/settings", {
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
      console.error("Erro ao salvar configuracoes:", err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loading text="Carregando configuracoes..." />
  }

  const planName = settings?.subscription?.plan?.name || "Free"
  const planFeatures = [
    "Ate 50 usuarios",
    "Ate 10 mentores",
    "Biblioteca de materiais",
    "Relatorios basicos",
    "Suporte por email",
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Configuracoes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gerencie as configuracoes da sua organizacao
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branding section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Palette className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Identidade Visual</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Personalize a aparencia da sua organizacao
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-name" className="text-gray-700">Nome da organizacao</Label>
              <Input
                id="tenant-name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Nome da sua organizacao"
                className="border-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-upload" className="text-gray-700">Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="h-16 w-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="border-gray-200"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Recomendado: PNG ou SVG, 200x200px
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-color" className="text-gray-700">Cor da marca</Label>
              <div className="flex items-center gap-3">
                <input
                  id="brand-color-picker"
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-10 w-10 rounded-md border border-gray-200 cursor-pointer"
                />
                <Input
                  id="brand-color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#6366f1"
                  className="max-w-[140px] border-gray-200"
                />
                <div
                  className="h-10 flex-1 rounded-md border border-gray-200"
                  style={{ backgroundColor: brandColor }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Plan info */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Plano Atual</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Informacoes sobre seu plano e limites
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {planName}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Recursos inclusos:</p>
              <ul className="space-y-2">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <Button
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                variant="outline"
                disabled
                title="Em breve"
              >
                <CreditCard className="h-4 w-4" />
                Fazer Upgrade
              </Button>
              <div className="flex items-center gap-1.5 mt-2 justify-center">
                <Info className="h-3 w-3 text-gray-400" />
                <p className="text-xs text-gray-400">Em breve</p>
              </div>
            </div>
          </div>
        </div>

        {/* General settings */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Configuracoes Gerais</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            Ajuste os parametros da sua organizacao de mentoria
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max-mentees" className="text-gray-700">Maximo de mentorados por mentor</Label>
              <Input
                id="max-mentees"
                type="number"
                min={1}
                max={20}
                value={maxMentees}
                onChange={(e) => setMaxMentees(parseInt(e.target.value) || 1)}
                className="border-gray-200"
              />
              <p className="text-xs text-gray-400">
                Define quantos mentorados cada mentor pode acompanhar simultaneamente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? "Salvando..." : "Salvar Configuracoes"}
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Salvo com sucesso!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
