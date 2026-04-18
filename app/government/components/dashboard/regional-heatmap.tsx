"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import type { MapPoint } from "@/app/government/lib/map-types"
import { PUNE_REGIONS } from "@/app/government/lib/pune-regions"

const PuneHeatmapLeaflet = dynamic(
  () => import("./pune-heatmap-leaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-2 border-emerald/25 border-t-emerald animate-spin" />
          <span>Preparing map layers…</span>
        </div>
      </div>
    ),
  }
)

export type RegionalHeatmapProps = {
  points: MapPoint[]
  loading?: boolean
}

export function RegionalHeatmap({ points, loading }: RegionalHeatmapProps) {
  const [heatIntensity] = useState([52])

  const heatRadius = useMemo(() => 7 + (heatIntensity[0] / 100) * 14, [heatIntensity])
  const heatMax = useMemo(() => 0.9 + (heatIntensity[0] / 100) * 0.55, [heatIntensity])

  if (loading) {
    return (
      <div className="flex flex-col h-full min-h-[280px] gap-3">
        <div className="flex-1 rounded-[0.5rem] border border-border overflow-hidden bg-muted/20 animate-pulse">
          <div className="h-full min-h-[260px] w-full bg-gradient-to-br from-muted/40 via-muted/20 to-muted/50" />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-16 rounded-full bg-muted/60 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 relative min-h-[280px] rounded-[0.5rem] overflow-hidden border border-border shadow-sm">
        <PuneHeatmapLeaflet
          points={points}
          heatRadius={heatRadius}
          heatMax={heatMax}
          showLabels
          regions={PUNE_REGIONS}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-muted-foreground">
        <span className="font-medium text-foreground/90">Severity (heat intensity)</span>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm" />
          <span className="text-foreground">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
          <span className="text-foreground">Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
          <span className="text-foreground">Stable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-sky-500 shadow-sm" />
          <span className="text-foreground">Monitoring</span>
        </div>
      </div>
    </div>
  )
}
export default RegionalHeatmap
