import { cn } from "@/app/government/lib/utils"
import type { ReactNode } from "react"

interface ContentCardProps {
  title: string
  children?: ReactNode
  className?: string
  accentColor?: "saffron" | "emerald"
}

export function ContentCard({
  title,
  children,
  className,
  accentColor = "saffron",
}: ContentCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-[0.5rem] border border-border shadow-sm flex flex-col",
        className
      )}
    >
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        <div
          className={cn(
            "h-3 w-1 rounded-full",
            accentColor === "saffron" ? "bg-saffron" : "bg-emerald"
          )}
        />
        <h2 className="text-sm font-semibold text-card-foreground">{title}</h2>
      </div>
      <div className="flex-1 p-3 flex flex-col min-h-0">{children}</div>
    </div>
  )
}
