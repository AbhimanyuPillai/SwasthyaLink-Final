"use client"

import dynamic from "next/dynamic"
import { useMemo, useState } from "react"
import { useMasterMapData } from "@/app/government/hooks/use-master-map-data"
import { PUNE_REGIONS } from "@/app/government/lib/pune-regions"

const PuneHeatmapLeaflet = dynamic(
  () => import("./pune-heatmap-leaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] items-center justify-center text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  }
)

export function RegionalHeatmap() {
  const { masterMapData } = useMasterMapData(true)
  const [heatIntensity] = useState([52])

  const heatRadius = useMemo(() => 7 + (heatIntensity[0] / 100) * 14, [heatIntensity])
  const heatMax = useMemo(() => 0.9 + (heatIntensity[0] / 100) * 0.55, [heatIntensity])

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative min-h-[280px] rounded-[0.5rem] overflow-hidden border border-border">
        <PuneHeatmapLeaflet
          points={masterMapData}
          heatRadius={heatRadius}
          heatMax={heatMax}
          showLabels
          regions={PUNE_REGIONS}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium">Threat Level:</span>
        </div>
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
      </div>
    </div>
  )
}
export default RegionalHeatmap
