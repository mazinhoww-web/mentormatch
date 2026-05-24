import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-8 text-center max-w-[480px] mx-auto bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden group",
      className
    )}>
      {/* Atmospheric glow behind icon */}
      <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full scale-150 pointer-events-none opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
      <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shadow-inner relative z-10">
        <Icon className="h-12 w-12 text-slate-400 opacity-70" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4 relative z-10">{title}</h2>
      <p className="text-base text-slate-500 mb-8 relative z-10">{description}</p>
      {action && (
        <div className="relative z-10 w-full md:w-auto">
          {action}
        </div>
      )}
    </div>
  )
}
