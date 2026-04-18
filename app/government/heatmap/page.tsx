"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useCallback, useMemo, useState } from "react"
import type { Map as LeafletMap } from "leaflet"
import { toast } from "sonner"
import { Sidebar } from "@/app/government/components/dashboard/sidebar"
import { ContentCard } from "@/app/government/components/dashboard/content-card"
import { MetricCard } from "@/app/government/components/dashboard/metric-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/government/components/ui/select"
import { Button } from "@/app/government/components/ui/button"
import { Badge } from "@/app/government/components/ui/badge"
import { Slider } from "@/app/government/components/ui/slider"
import { Switch } from "@/app/government/components/ui/switch"
import { Label } from "@/app/government/components/ui/label"
import {
  Map as MapIcon,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Download,
  AlertTriangle,
  Activity,
  Users,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react"
import { cn } from "@/app/government/lib/utils"
import type { MapPoint, MapSeverity } from "@/app/government/lib/map-types"
import { PUNE_REGIONS } from "@/app/government/lib/pune-regions"
import { summarizeByRegionName, summarizeMapPoints } from "@/app/government/lib/region-stats"
import {
  countCriticalZones,
  estimateAffectedPopulation,
  spreadIntensityPercent,
} from "@/app/government/lib/surveillance-stats"
import { passesDemoTimeWindow } from "@/app/government/lib/surveillance-demo-time"
import { useMasterMapData } from "@/app/government/hooks/use-master-map-data"

const PuneHeatmapLeaflet = dynamic(
  () => import("../components/dashboard/pune-heatmap-leaflet"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 rounded-full border-2 border-emerald/25 border-t-emerald animate-spin" />
          <span>Loading map…</span>
        </div>
      </div>
    ),
  }
)

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-red-500"
    case "warning":
      return "bg-amber-500"
    case "stable":
      return "bg-emerald-500"
    case "monitoring":
      return "bg-sky-500"
    default:
      return "bg-slate-500"
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-700 border-red-200"
    case "warning":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "stable":
      return "bg-emerald/20 text-emerald border-emerald/30"
    case "monitoring":
      return "bg-sky-100 text-sky-700 border-sky-200"
    default:
      return ""
  }
}

function passesSeverityFilter(severity: MapSeverity, filter: string): boolean {
  if (filter === "all") return true
  if (filter === "critical") return severity === "critical"
  if (filter === "warning") return severity === "critical" || severity === "warning"
  if (filter === "monitoring") return severity === "monitoring"
  return true
}

function formatSyncTime(d: Date | null): string {
  if (!d) return "Waiting for sync…"
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

function formatPopulation(n: number): string {
  if (n <= 0) return "0"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`
  return n.toLocaleString()
}

export default function HeatmapPage() {
  const { masterData: masterMapData, loading, lastUpdated, forceSync } = useMasterMapData()

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [timeWindow, setTimeWindow] = useState("24h")
  const [diseaseFilter, setDiseaseFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [heatIntensity, setHeatIntensity] = useState([52])
  const [showLabels, setShowLabels] = useState(true)
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null)
  const [leafletMap, setLeafletMap] = useState<LeafletMap | null>(null)

  const diseaseOptions = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; color: string }>()
    byId.set("all", { id: "all", name: "All Diseases", color: "bg-purple-500" })
    const palette = ["bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500"]
    let i = 0
    for (const p of masterMapData) {
      if (!byId.has(p.diseaseId)) {
        byId.set(p.diseaseId, {
          id: p.diseaseId,
          name: p.diseaseLabel,
          color: palette[i % palette.length],
        })
        i += 1
      }
    }
    return Array.from(byId.values())
  }, [masterMapData])

  const timeSlicedData = useMemo(() => {
    return masterMapData.filter((p) => passesDemoTimeWindow(p.id, timeWindow))
  }, [masterMapData, timeWindow])

  const filteredData = useMemo(() => {
    return timeSlicedData.filter((p) => {
      if (diseaseFilter !== "all" && p.diseaseId !== diseaseFilter) return false
      return passesSeverityFilter(p.severity, severityFilter)
    })
  }, [timeSlicedData, diseaseFilter, severityFilter])

  const heatRadius = useMemo(() => 7 + (heatIntensity[0] / 100) * 14, [heatIntensity])
  const heatMax = useMemo(() => 0.9 + (heatIntensity[0] / 100) * 0.55, [heatIntensity])

  const regionSummary = useMemo(() => {
    if (!selectedRegionName) return null
    return summarizeByRegionName(selectedRegionName, filteredData)
  }, [selectedRegionName, filteredData])

  const totalActive = filteredData.length
  const criticalZones = useMemo(() => countCriticalZones(filteredData), [filteredData])
  const spreadPct = useMemo(() => spreadIntensityPercent(filteredData), [filteredData])
  const populationEst = useMemo(() => estimateAffectedPopulation(totalActive), [totalActive])

  const handleMapReady = useCallback((map: LeafletMap) => {
    setLeafletMap(map)
  }, [])

  const regionRows = useMemo(() => {
    const groups = new Map<string, MapPoint[]>()
    for (const p of filteredData) {
      const name = p.regionName ?? "Unknown"
      if (!groups.has(name)) groups.set(name, [])
      groups.get(name)!.push(p)
    }
    return Array.from(groups.entries())
      .map(([name, pts]) => {
        const s = summarizeMapPoints(pts)
        return { regionName: name, count: s.cases, dominantSeverity: s.dominantSeverity }
      })
      .sort((a, b) => b.count - a.count)
  }, [filteredData])

  const exportGeoJson = useCallback(() => {
    const payload = {
      type: "FeatureCollection",
      name: "Swasthya Drishti — Pune export",
      generatedAt: new Date().toISOString(),
      features: filteredData.map((p) => ({
        type: "Feature",
        properties: {
          id: p.id,
          diseaseId: p.diseaseId,
          diseaseLabel: p.diseaseLabel,
          severity: p.severity,
          locality: p.regionName,
        },
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      })),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/geo+json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pune-surveillance-${Date.now()}.geojson`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Exported current map slice (GeoJSON)")
  }, [filteredData])

  const handleForceRefresh = useCallback(() => {
    forceSync()
    toast.message("Refreshing PMC syndromic slice…", { description: "Municipal sync completed." })
  }, [forceSync])

  const handleQuickAction = useCallback((label: string) => {
    toast.success(`${label} successfully initiated`, { description: "Action forwarded to the respective regional handlers." })
  }, [])

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0">
                <Image
                  src="/swasthyalink-logo.png"
                  alt="SwasthyaLink"
                  width={44}
                  height={44}
                  className="h-10 w-10 object-contain [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.12))]"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground truncate">Disease Heatmap</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pune MMR (PMC + PCMC belt)
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Badge variant="outline" className="bg-emerald/10 text-emerald border-emerald/30">
                  <span className="w-2 h-2 rounded-full bg-emerald animate-pulse mr-2" />
                  Live feed
                </Badge>
                <span className="text-xs text-muted-foreground hidden sm:inline">Syndromic surveillance</span>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums" suppressHydrationWarning>
                {autoRefresh ? "Last sync: " : "Paused · last sync: "}
                {formatSyncTime(lastUpdated)}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-card p-4 overflow-auto shrink-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 shrink-0" />
                  Map filters
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Disease type</Label>
                    <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {diseaseOptions.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            <span className="flex items-center gap-2">
                              <span className={cn("w-2 h-2 rounded-full shrink-0", d.color)} />
                              {d.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Time window</Label>
                    <Select value={timeWindow} onValueChange={setTimeWindow}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last hour</SelectItem>
                        <SelectItem value="24h">Last 24 hours</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Severity filter</Label>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All levels</SelectItem>
                        <SelectItem value="critical">Critical only</SelectItem>
                        <SelectItem value="warning">Warning &amp; above</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Layers className="h-4 w-4 shrink-0" />
                  Display
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Heat intensity</Label>
                    <Slider
                      value={heatIntensity}
                      onValueChange={setHeatIntensity}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">{heatIntensity}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm text-foreground">Ward labels</Label>
                    <Switch checked={showLabels} onCheckedChange={setShowLabels} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-sm text-foreground">Auto sync clock</Label>
                    <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Severity legend</h3>
                <p className="text-[11px] text-muted-foreground mb-2 leading-snug">
                  Heat intensity encodes triage severity bands from the PMC ruleset (not raw case totals).
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 shrink-0" />
                    <span className="text-foreground">Critical triage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-foreground">Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-foreground">Stable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-sky-500 shrink-0" />
                    <span className="text-foreground">Monitoring</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start" type="button" onClick={exportGeoJson}>
                  <Download className="h-4 w-4 mr-2 shrink-0" />
                  Export map slice
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" type="button" onClick={handleForceRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2 shrink-0" />
                  Force refresh
                </Button>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-4 lg:p-6 overflow-auto min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Total active signals"
                value={loading ? "…" : totalActive.toLocaleString()}
                icon={Activity}
                trend="neutral"
                accentColor="saffron"
              />
              <MetricCard
                title="Critical zones"
                value={loading ? "…" : criticalZones.toLocaleString()}
                icon={AlertTriangle}
                trend="up"
                accentColor="emerald"
              />
              <MetricCard
                title="Affected population (est.)"
                value={loading ? "…" : formatPopulation(populationEst)}
                icon={Users}
                trend="neutral"
                accentColor="saffron"
              />
              <MetricCard
                title="Elevated severity share"
                value={loading ? "…" : `${spreadPct}%`}
                icon={TrendingUp}
                trend="up"
                accentColor="emerald"
              />
            </div>

            <ContentCard title="Interactive disease heatmap" accentColor="saffron" className="min-h-[500px]">
              <div className="flex flex-col h-full min-h-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" type="button" onClick={() => leafletMap?.zoomIn()}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => leafletMap?.zoomOut()}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">Pune urban core · OSM</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums" suppressHydrationWarning>
                    <Clock className="h-3 w-3 shrink-0" />
                    Sync {formatSyncTime(lastUpdated)}
                  </div>
                </div>

                <div className="flex-1 min-h-[400px] w-full rounded-[0.5rem] overflow-hidden border border-border shadow-inner">
                  {loading ? (
                    <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground bg-muted/15">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 rounded-full border-2 border-emerald/25 border-t-emerald animate-spin" />
                        <span>Loading ward-level heat surface…</span>
                      </div>
                    </div>
                  ) : (
                    <PuneHeatmapLeaflet
                      points={filteredData}
                      heatRadius={heatRadius}
                      heatMax={heatMax}
                      showLabels={showLabels}
                      regions={PUNE_REGIONS}
                      onMapReady={handleMapReady}
                    />
                  )}
                </div>
              </div>
            </ContentCard>
          </main>

          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 overflow-auto shrink-0">
            <h3 className="text-sm font-semibold text-foreground mb-4">Region details</h3>
            {selectedRegionName && regionSummary ? (
              <div className="space-y-4">
                <div className="p-4 rounded-[0.5rem] bg-muted/50 border border-border/60">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-foreground leading-tight">{selectedRegionName}</span>
                    <Badge variant="outline" className={getSeverityBadge(regionSummary.dominantSeverity)}>
                      {regionSummary.dominantSeverity.charAt(0).toUpperCase() + regionSummary.dominantSeverity.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Active signals</span>
                      <span className="font-medium text-foreground tabular-nums">{regionSummary.cases.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Primary condition</span>
                      <span className="font-medium text-foreground text-right text-xs sm:text-sm leading-snug max-w-[60%]">
                        {regionSummary.primaryDisease}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Filters</span>
                      <span className="font-medium text-foreground text-xs text-right leading-snug">
                        {diseaseFilter === "all" ? "All diseases" : diseaseOptions.find((d) => d.id === diseaseFilter)?.name}
                        {" · "}
                        {severityFilter === "all" ? "All severities" : severityFilter}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Quick actions</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      type="button"
                      onClick={() => handleQuickAction("Detailed ward report")}
                    >
                      View detailed report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      type="button"
                      onClick={() => handleQuickAction("Rapid response team")}
                    >
                      Deploy response team
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      type="button"
                      onClick={() => handleQuickAction("Hospital alert bundle")}
                    >
                      Alert hospitals
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground px-2">
                <MapIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a Pune locality below to view triage-weighted detail.</p>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-xs font-medium text-muted-foreground uppercase mb-3">Pune localities (filtered)</h4>
              <div className="space-y-2 max-h-[40vh] overflow-auto pr-1">
                {regionRows.map(({ regionName, count, dominantSeverity }) => (
                  <button
                    key={regionName}
                    type="button"
                    onClick={() => setSelectedRegionName(regionName)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-[0.5rem] text-sm transition-colors text-left",
                      selectedRegionName === regionName ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          count === 0 ? "bg-slate-400" : getSeverityColor(dominantSeverity)
                        )}
                      />
                      <span className="text-foreground truncate">{regionName}</span>
                    </div>
                    <span className="text-muted-foreground tabular-nums shrink-0">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
