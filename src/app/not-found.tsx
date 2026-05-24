"use client"

import { useState } from "react"
import Link from "next/link"
import { SearchX, Search, ArrowRight, ArrowLeft } from "lucide-react"

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: "#f0f4ff" }}>
      <div className="w-full max-w-md text-center">
        {/* Circular icon area with error indicator */}
        <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-lg">
          <SearchX className="h-14 w-14 text-blue-400" />
          {/* Red error dot */}
          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-red-400 border-2 border-white" />
        </div>

        {/* 404 text */}
        <h1 className="text-7xl font-extrabold text-blue-600 mb-3">404</h1>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Ops! Pagina nao encontrada
        </h2>

        {/* Description */}
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Parece que voce se perdeu em nossa biblioteca de mentores. A pagina que voce esta procurando pode ter sido movida ou nao existe mais.
        </p>

        {/* Search input */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar mentores ou habilidades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-12 text-sm text-gray-700 placeholder-gray-400 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            aria-label="Buscar"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Inicio
        </Link>
      </div>
    </div>
  )
}
