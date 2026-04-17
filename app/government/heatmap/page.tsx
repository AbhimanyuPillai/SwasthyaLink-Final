"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { Map as LeafletMap } from "leaflet"
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
  Map,
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
import type { MapSeverity } from "@/app/government/lib/map-types"
import { DEMO_MASTER_MAP_DATA } from "@/app/government/lib/demo-master-map-data"
import { PUNE_REGIONS, isPointInRegion } from "@/app/government/lib/pune-regions"
import { summarizeRegion } from "@/app/government/lib/region-stats"

const PuneHeatmapLeaflet = dynamic(
  () => import("../components/dashboard/pune-heatmap-leaflet"),
  { ssr: false, loading: () => <div className="flex h-[400px] items-center justify-center text-sm text-muted-foreground">Loading map…</div> }
)

const diseases = [
  { id: "all", name: "All Diseases", color: "bg-purple-500" },
  { id: "dengue", name: "Dengue", color: "bg-red-500" },
  { id: "malaria", name: "Malaria", color: "bg-amber-500" },
  { id: "typhoid", name: "Typhoid", color: "bg-blue-500" },
  { id: "respiratory", name: "Respiratory", color: "bg-emerald-500" },
]

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
  if (!d) return "Waiting for data…"
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export default function HeatmapPage() {
  const masterMapData = DEMO_MASTER_MAP_DATA

  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    setLastUpdated(new Date())
    if (!autoRefresh) return
    const id = window.setInterval(() => setLastUpdated(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [autoRefresh])

  const [diseaseFilter, setDiseaseFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [heatIntensity, setHeatIntensity] = useState([52])
  const [showLabels, setShowLabels] = useState(true)
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [leafletMap, setLeafletMap] = useState<LeafletMap | null>(null)

  const filteredMapData = useMemo(() => {
    return masterMapData.filter((p) => {
      if (diseaseFilter !== "all" && p.diseaseId !== diseaseFilter) return false
      return passesSeverityFilter(p.severity, severityFilter)
    })
  }, [masterMapData, diseaseFilter, severityFilter])

  /** Tighter plumes: lower radius, slightly higher max so hotspots stay visible. */
  const heatRadius = useMemo(() => 7 + (heatIntensity[0] / 100) * 14, [heatIntensity])
  const heatMax = useMemo(() => 0.9 + (heatIntensity[0] / 100) * 0.55, [heatIntensity])

  const selectedRegion = useMemo(
    () => (selectedRegionId ? PUNE_REGIONS.find((r) => r.id === selectedRegionId) ?? null : null),
    [selectedRegionId]
  )

  const regionSummary = useMemo(() => {
    if (!selectedRegion) return null
    return summarizeRegion(selectedRegion, filteredMapData)
  }, [selectedRegion, filteredMapData])

  const totalActive = filteredMapData.length
  const criticalPoints = useMemo(
    () => filteredMapData.filter((p) => p.severity === "critical").length,
    [filteredMapData]
  )

  const criticalZones = useMemo(() => {
    return PUNE_REGIONS.filter((r) =>
      filteredMapData.some((p) => p.severity === "critical" && isPointInRegion(p.lat, p.lng, r))
    ).length
  }, [filteredMapData])

  const spreadRateLabel = useMemo(() => {
    if (!filteredMapData.length) return "0%"
    const pct = Math.round((criticalPoints / filteredMapData.length) * 100)
    return `${pct}%`
  }, [filteredMapData.length, criticalPoints])

  const populationAtRiskLabel = useMemo(() => {
    if (!filteredMapData.length) return "0"
    const est = Math.max(1, Math.round(filteredMapData.length * 320))
    if (est >= 1_000_000) return `${(est / 1_000_000).toFixed(1)}M`
    if (est >= 1_000) return `${Math.round(est / 1_000)}K`
    return est.toLocaleString()
  }, [filteredMapData.length])

  const handleMapReady = useCallback((map: LeafletMap) => {
    setLeafletMap(map)
  }, [])

  const regionRows = useMemo(
    () =>
      PUNE_REGIONS.map((region) => {
        const summary = summarizeRegion(region, filteredMapData)
        return { region, count: summary.cases, dominantSeverity: summary.dominantSeverity }
      }),
    [filteredMapData]
  )

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <Image
                  src="/swasthyalink-logo.png"
                  alt="SwasthyaLink"
                  width={44}
                  height={44}
                  className="h-10 w-10 object-contain [filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.12))]"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Disease Heatmap</h1>
                <p className="text-sm text-muted-foreground">Geographical outbreak visualization</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Badge variant="outline" className="bg-emerald/10 text-emerald border-emerald/30">
                  <span className="w-2 h-2 rounded-full bg-emerald animate-pulse mr-2" />
                  Live
                </Badge>
                <span className="text-xs text-muted-foreground">Surveillance feed</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {autoRefresh ? "Last updated: " : "Paused: "}
                {formatSyncTime(lastUpdated)}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-card p-4 overflow-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4" />
                  Map Filters
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Disease Type</Label>
                    <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {diseases.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            <span className="flex items-center gap-2">
                              <span className={cn("w-2 h-2 rounded-full", d.color)} />
                              {d.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Time Period</Label>
                    <Select defaultValue="24h">
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Last Hour</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Severity Filter</Label>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="critical">Critical Only</SelectItem>
                        <SelectItem value="warning">Warning &amp; Above</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Layers className="h-4 w-4" />
                  Display Options
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Heat Intensity</Label>
                    <Slider
                      value={heatIntensity}
                      onValueChange={setHeatIntensity}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground">{heatIntensity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-foreground">Show Labels</Label>
                    <Switch checked={showLabels} onCheckedChange={setShowLabels} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-foreground">Auto Refresh</Label>
                    <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Threat Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span className="text-foreground">Critical (&gt;500 cases)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-amber-500" />
                    <span className="text-foreground">Warning (200-500 cases)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-emerald-500" />
                    <span className="text-foreground">Stable (50-200 cases)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-sky-500" />
                    <span className="text-foreground">Monitoring (&lt;50 cases)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Map Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" type="button">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Force Refresh
                </Button>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Total Active Cases"
                value={totalActive.toLocaleString()}
                icon={Activity}
                trend="neutral"
                accentColor="saffron"
              />
              <MetricCard
                title="Critical Zones"
                value={criticalZones.toLocaleString()}
                icon={AlertTriangle}
                trend="up"
                accentColor="emerald"
              />
              <MetricCard
                title="Affected Population (est.)"
                value={populationAtRiskLabel}
                icon={Users}
                trend="neutral"
                accentColor="saffron"
              />
              <MetricCard
                title="Critical share"
                value={spreadRateLabel}
                icon={TrendingUp}
                trend="up"
                accentColor="emerald"
              />
            </div>

            <ContentCard title="Interactive Disease Heatmap" accentColor="saffron" className="min-h-[500px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" type="button" onClick={() => leafletMap?.zoomIn()}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => leafletMap?.zoomOut()}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground ml-2">Metropolitan region</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last updated: {formatSyncTime(lastUpdated)}
                  </div>
                </div>

                <div className="flex-1 min-h-[400px] w-full rounded-[0.5rem] overflow-hidden border border-border">
                  <PuneHeatmapLeaflet
                    points={filteredMapData}
                    heatRadius={heatRadius}
                    heatMax={heatMax}
                    showLabels={showLabels}
                    regions={PUNE_REGIONS}
                    onMapReady={handleMapReady}
                  />
                </div>
              </div>
            </ContentCard>
          </main>

          <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card p-4 overflow-auto">
            <h3 className="text-sm font-semibold text-foreground mb-4">Region Details</h3>
            {selectedRegion && regionSummary ? (
              <div className="space-y-4">
                <div className="p-4 rounded-[0.5rem] bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">{selectedRegion.name}</span>
                    <Badge variant="outline" className={getSeverityBadge(regionSummary.dominantSeverity)}>
                      {regionSummary.dominantSeverity.charAt(0).toUpperCase() + regionSummary.dominantSeverity.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Active Cases</span>
                      <span className="font-medium text-foreground">{regionSummary.cases.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Primary disease</span>
                      <span className="font-medium text-foreground text-right">{regionSummary.primaryDisease}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Filters</span>
                      <span className="font-medium text-foreground text-xs text-right">
                        {diseaseFilter === "all" ? "All diseases" : diseases.find((d) => d.id === diseaseFilter)?.name}
                        {" · "}
                        {severityFilter === "all" ? "All severities" : severityFilter}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase mb-2">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      View Detailed Report
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Deploy Response Team
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Alert Hospitals
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a region below to view details</p>
              </div>
            )}

            <div className="mt-6">
              <h4 className="text-xs font-medium text-muted-foreground uppercase mb-3">All regions</h4>
              <div className="space-y-2">
                {regionRows.map(({ region, count, dominantSeverity }) => (
                  <button
                    key={region.id}
                    type="button"
                    onClick={() => setSelectedRegionId(region.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2 rounded-[0.5rem] text-sm transition-colors",
                      selectedRegionId === region.id ? "bg-primary/10" : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          count === 0 ? "bg-slate-400" : getSeverityColor(dominantSeverity)
                        )}
                      />
                      <span className="text-foreground text-left">{region.name}</span>
                    </div>
                    <span className="text-muted-foreground tabular-nums">{count}</span>
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
