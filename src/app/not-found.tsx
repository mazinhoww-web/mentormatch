"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react"

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-10 relative overflow-hidden bg-slate-50 selection:bg-blue-600 selection:text-white">
      {/* Subtle decorative background elements */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-30">
        <div className="w-96 h-96 bg-blue-100 rounded-full blur-[100px] mix-blend-multiply translate-x-1/2 translate-y-1/4" />
        <div className="w-80 h-80 bg-blue-200 rounded-full blur-[80px] mix-blend-multiply -translate-x-1/2 -translate-y-1/4" />
      </div>

      <div className="w-full max-w-lg z-10 text-center flex flex-col items-center">
        {/* Illustration / Large Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-200 relative z-10">
            <Search className="h-16 w-16 md:h-20 md:w-20 text-blue-700" strokeWidth={1.5} />
          </div>
          {/* Error indicator dot */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center translate-x-2 -translate-y-2 border-2 border-slate-50 shadow-sm z-20">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
        </div>

        {/* Error Copy */}
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-blue-700 hidden md:block">404</h1>
          <h1 className="text-[28px] font-bold tracking-tight text-blue-700 md:hidden">404</h1>
          <h2 className="text-xl font-semibold text-slate-900">Ops! Pagina nao encontrada</h2>
          <p className="text-base text-slate-500 max-w-md mx-auto">
            Parece que voce se perdeu em nossa biblioteca de mentores. A pagina que voce esta procurando pode ter sido movida ou nao existe mais.
          </p>
        </div>

        {/* Search Bar Recovery */}
        <div className="w-full max-w-sm mb-8">
          <form className="relative group" method="GET">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-700 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Buscar mentores ou habilidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all shadow-sm"
              required
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <ArrowRight className="h-5 w-5 text-slate-400 hover:text-blue-700 transition-colors cursor-pointer" />
            </button>
          </form>
        </div>

        {/* Primary Action */}
        <Link
          href="/"
          className="inline-flex items-center justify-center h-12 px-6 bg-blue-700 text-white text-sm font-semibold tracking-wide rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md active:scale-95 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Voltar para o Inicio
        </Link>
      </div>
    </div>
  )
}
