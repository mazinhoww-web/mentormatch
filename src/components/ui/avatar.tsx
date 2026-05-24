import * as React from "react"
import { cn, getInitials } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  name?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl",
}

export function Avatar({ src, name, size = "md", className, ...props }: AvatarProps) {
  if (src) {
    return (
      <div className={cn("relative rounded-full overflow-hidden", sizeClasses[size], className)} {...props}>
        <img src={src} alt={name || ""} className="h-full w-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {name ? getInitials(name) : "?"}
    </div>
  )
}
