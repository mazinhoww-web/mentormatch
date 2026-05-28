import { BookOpen } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] px-6 py-6 md:px-10">
      <div className="flex items-center gap-2">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}
        >
          <BookOpen size={11} color="#fff" />
        </div>
        <span className="text-sm font-bold text-white">MentorMatch</span>
      </div>
      <span className="text-xs text-[#6B7280]">
        &copy; {new Date().getFullYear()} MentorMatch. Todos os direitos
        reservados.
      </span>
    </footer>
  )
}
