import { cn } from "@/app/government/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  accentColor?: "saffron" | "emerald"
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend = "neutral",
  accentColor = "saffron",
}: MetricCardProps) {
  return (
    <div className="bg-card rounded-[0.5rem] p-4 border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-semibold text-card-foreground tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "p-2.5 rounded-[0.5rem]",
            accentColor === "saffron" ? "bg-saffron/15 text-saffron" : "bg-emerald/15 text-emerald"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend !== "neutral" && (
        <div className="mt-2 pt-2 border-t border-border">
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" ? "text-emerald" : "text-destructive"
            )}
          >
            {trend === "up" ? "↑" : "↓"} Trending {trend}
          </span>
        </div>
      )}
    </div>
  )
}
