'use client';
import dynamic from "next/dynamic"
import { useMemo } from "react"
import { Sidebar } from "@/app/government/components/dashboard/sidebar"
import { MetricCard } from "@/app/government/components/dashboard/metric-card"
import { ContentCard } from "@/app/government/components/dashboard/content-card"
import { AIAnalysisPanel } from "@/app/government/components/dashboard/ai-analysis-panel"
import { EpidemiologicalDataGrid } from "@/app/government/components/dashboard/epidemiological-data-grid"
import { AlertTriangle, MapPin, Activity, Users } from "lucide-react"
import { useMasterMapData } from "@/app/government/hooks/use-master-map-data"
import {
  countCriticalZones,
  estimateAffectedPopulation,
  spreadIntensityPercent,
} from "@/app/government/lib/surveillance-stats"
import type { MapPoint, MapSeverity } from "@/app/government/lib/map-types"
import { summarizeMapPoints } from "@/app/government/lib/region-stats"
import type { EpidemiologicalRecord } from "@/app/government/components/dashboard/epidemiological-data-grid"
import { PUNE_WARD_PRIMARY_FACILITY } from "@/app/government/lib/pune-facilities"

function severityToGridStatus(s: MapSeverity): EpidemiologicalRecord["status"] {
  switch (s) {
    case "critical":
      return "Critical"
    case "warning":
      return "Warning"
    case "monitoring":
      return "Monitoring"
    default:
      return "Stable"
  }
}

function formatPopulation(n: number): string {
  if (n <= 0) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return n.toLocaleString()
}

const RegionalHeatmap = dynamic(
  () => import("./components/dashboard/regional-heatmap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground bg-muted/10 rounded-lg min-h-[280px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-emerald/30 border-t-emerald animate-spin" />
          <span>Loading PMC surveillance layers…</span>
        </div>
      </div>
    ),
  }
)

export default function DashboardPage() {
  const { masterData, loading, lastUpdated } = useMasterMapData()

  const totalActive = masterData.length
  const criticalZones = useMemo(() => countCriticalZones(masterData), [masterData])
  const populationEst = useMemo(() => estimateAffectedPopulation(totalActive), [totalActive])
  const spreadPct = useMemo(() => spreadIntensityPercent(masterData), [masterData])

  const epidemiologicalRows = useMemo(() => {
    const groups = new Map<string, MapPoint[]>()
    for (const p of masterData) {
      const area = p.regionName ?? "Unknown"
      if (!groups.has(area)) groups.set(area, [])
      groups.get(area)!.push(p)
    }
    return Array.from(groups.entries())
      .map(([area, pts]) => {
        const s = summarizeMapPoints(pts)
        const facility = PUNE_WARD_PRIMARY_FACILITY[area] ?? PUNE_WARD_PRIMARY_FACILITY["Pune metropolitan fringe"]
        return {
          id: area,
          area,
          disease: s.primaryDisease,
          diseaseId: s.primaryDiseaseId,
          cases: s.cases,
          status: severityToGridStatus(s.dominantSeverity),
          reportingFacilityId: facility.id,
          reportingFacility: facility.name,
        }
      })
      .sort((a, b) => b.cases - a.cases)
  }, [masterData])

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:flex-row min-w-0 transition-all">
        <main className="flex-1 p-3 sm:p-4 space-y-4 overflow-auto min-w-0 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">PMC–PCMC syndromic view</p>
              <p className="text-sm text-muted-foreground mt-1">
                Dataset: Pune Metropolitan Region only · coordinates clamped to urban envelope
              </p>
            </div>
            <p className="text-xs tabular-nums text-muted-foreground" suppressHydrationWarning>
              Feed sync: {lastUpdated.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard
              title="Total Active Cases"
              value={loading ? "…" : totalActive.toLocaleString()}
              icon={Activity}
              trend="neutral"
              accentColor="saffron"
            />
            <MetricCard
              title="Critical Zones"
              value={loading ? "…" : criticalZones.toLocaleString()}
              icon={MapPin}
              trend="up"
              accentColor="emerald"
            />
            <MetricCard
              title="Affected Population (est.)"
              value={loading ? "…" : formatPopulation(populationEst)}
              icon={Users}
              trend="neutral"
              accentColor="saffron"
            />
            <MetricCard
              title="Elevated severity share"
              value={loading ? "…" : `${spreadPct}%`}
              icon={AlertTriangle}
              trend="up"
              accentColor="emerald"
            />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 flex-1 min-h-0">
            <ContentCard
              title="Regional Disease Heatmap"
              className="flex-1 min-h-[300px] flex flex-col"
              accentColor="saffron"
            >
              <RegionalHeatmap points={masterData} loading={loading} />
            </ContentCard>

            <ContentCard
              title="Epidemiological Data Grid"
              className="flex-1 min-h-[300px] flex flex-col"
              accentColor="emerald"
            >
              <EpidemiologicalDataGrid rows={epidemiologicalRows} loading={loading} />
            </ContentCard>
          </section>
        </main>

        <aside className="w-full lg:w-80 xl:w-96 p-3 sm:p-4 lg:pl-0 shrink-0 border-t lg:border-t-0 lg:border-l border-border/80 bg-muted/5 flex flex-col h-full">
          <AIAnalysisPanel lastUpdated={lastUpdated} />
        </aside>
      </div>
    </div>
  )
}
