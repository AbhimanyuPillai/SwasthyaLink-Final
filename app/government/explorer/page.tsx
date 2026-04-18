"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/government/components/ui/table"
import { Badge } from "@/app/government/components/ui/badge"
import { Button } from "@/app/government/components/ui/button"
import { Input } from "@/app/government/components/ui/input"
import { Label } from "@/app/government/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/government/components/ui/tabs"
import { Checkbox } from "@/app/government/components/ui/checkbox"
import {
  Database,
  Search,
  Download,
  Upload,
  Filter,
  SortAsc,
  RefreshCw,
  FileSpreadsheet,
  BarChart3,
  Table2,
  Calendar,
  Building2,
  MapPin,
  Activity,
  TrendingDown,
  Clock,
} from "lucide-react"
import { cn } from "@/app/government/lib/utils"

type Status = "Critical" | "Warning" | "Stable" | "Monitoring"

interface DataRecord {
  id: string
  date: string
  region: string
  district: string
  wardKey: string
  hospital: string
  hospitalKey: string
  disease: string
  diseaseKey: string
  cases: number
  deaths: number
  recovered: number
  status: Status
  reportedBy: string
}

/** Pune Municipal Corporation + PCMC belt records. */
const detailedData: DataRecord[] = [
  { id: "PNQ-2026-0411-01", date: "2026-04-11", region: "Pune", district: "Kothrud", wardKey: "kothrud", hospital: "Sahyadri Hospital (Karve Rd)", hospitalKey: "sahyadri-karve", disease: "Dengue (ward sentinel)", diseaseKey: "dengue", cases: 247, deaths: 0, recovered: 198, status: "Critical", reportedBy: "PMC IDSP — Kothrud" },
  { id: "PNQ-2026-0411-02", date: "2026-04-11", region: "Pune", district: "Shivajinagar", wardKey: "shivajinagar", hospital: "Sassoon General Hospital", hospitalKey: "sassoon", disease: "Malaria (vivax)", diseaseKey: "malaria", cases: 156, deaths: 1, recovered: 112, status: "Warning", reportedBy: "Dr. A. Patil, Sassoon" },
  { id: "PNQ-2026-0410-03", date: "2026-04-10", region: "Pune", district: "Hadapsar", wardKey: "hadapsar", hospital: "Jehangir Hospital", hospitalKey: "jehangir", disease: "Typhoid / enteric fever", diseaseKey: "typhoid", cases: 89, deaths: 0, recovered: 72, status: "Stable", reportedBy: "Hadapsar UPHC" },
  { id: "PNQ-2026-0410-04", date: "2026-04-10", region: "Pune", district: "Viman Nagar", wardKey: "viman-nagar", hospital: "Columbia Asia (Nagar Rd)", hospitalKey: "columbia-nagar", disease: "Dengue (serotype-2 cluster)", diseaseKey: "dengue", cases: 198, deaths: 0, recovered: 150, status: "Warning", reportedBy: "LO Ward 16 — Viman" },
  { id: "PNQ-2026-0409-05", date: "2026-04-09", region: "Pune", district: "Koregaon Park", wardKey: "koregaon", hospital: "Ruby Hall Clinic", hospitalKey: "ruby", disease: "Respiratory (PM10 season)", diseaseKey: "respiratory", cases: 134, deaths: 0, recovered: 101, status: "Monitoring", reportedBy: "Ruby IDSP desk" },
  { id: "PNQ-2026-0409-06", date: "2026-04-09", region: "Pune", district: "Aundh", wardKey: "aundh", hospital: "Jupiter Hospital (Baner belt)", hospitalKey: "jupiter", disease: "Viral bronchitis", diseaseKey: "respiratory", cases: 76, deaths: 0, recovered: 64, status: "Stable", reportedBy: "Aundh mohalla clinic" },
  { id: "PNQ-2026-0408-07", date: "2026-04-08", region: "Pune", district: "Wakad", wardKey: "wakad", hospital: "Columbia Asia (Wakad)", hospitalKey: "columbia-wakad", disease: "Dengue (construction sump focus)", diseaseKey: "dengue", cases: 211, deaths: 0, recovered: 176, status: "Critical", reportedBy: "PCMC Wakad UPHC" },
  { id: "PNQ-2026-0408-08", date: "2026-04-08", region: "Pune", district: "Baner", wardKey: "baner", hospital: "Apollo Clinic (Baner Rd)", hospitalKey: "apollo-baner", disease: "Enteric fever", diseaseKey: "typhoid", cases: 54, deaths: 0, recovered: 48, status: "Monitoring", reportedBy: "Baner gram panchayat tie-up" },
  { id: "PNQ-2026-0407-09", date: "2026-04-07", region: "Pune", district: "Deccan", wardKey: "deccan", hospital: "Deccan Gymkhana PHC hub", hospitalKey: "deccan-phc", disease: "Community pneumonia", diseaseKey: "respiratory", cases: 92, deaths: 1, recovered: 71, status: "Warning", reportedBy: "PMC ward 14" },
  { id: "PNQ-2026-0407-10", date: "2026-04-07", region: "Pune", district: "Katraj", wardKey: "katraj", hospital: "Bharati Hospital", hospitalKey: "bharati", disease: "Malaria (fringe transmission)", diseaseKey: "malaria", cases: 63, deaths: 0, recovered: 55, status: "Stable", reportedBy: "Katraj rural interface cell" },
  { id: "PNQ-2026-0406-11", date: "2026-04-06", region: "Pune", district: "Hinjewadi", wardKey: "hinjewadi", hospital: "Multispecialty hub (Phase 2)", hospitalKey: "hinjewadi-hub", disease: "Dengue + ILI mixed", diseaseKey: "dengue", cases: 178, deaths: 0, recovered: 142, status: "Warning", reportedBy: "MIDC occupational health" },
  { id: "PNQ-2026-0406-12", date: "2026-04-06", region: "Pune", district: "Chinchwad", wardKey: "chinchwad", hospital: "Aditya Birla Memorial", hospitalKey: "aditya-birla", disease: "Respiratory exacerbation", diseaseKey: "respiratory", cases: 141, deaths: 0, recovered: 120, status: "Stable", reportedBy: "PCMC Chinchwad circle" },
]

const columns = [
  { id: "id", label: "Record ID", checked: true },
  { id: "date", label: "Date", checked: true },
  { id: "region", label: "Region", checked: true },
  { id: "district", label: "Ward / locality", checked: true },
  { id: "hospital", label: "Reporting site", checked: true },
  { id: "disease", label: "Condition", checked: true },
  { id: "cases", label: "Cases", checked: true },
  { id: "deaths", label: "Deaths", checked: true },
  { id: "recovered", label: "Recovered", checked: true },
  { id: "status", label: "Status", checked: true },
]

function getStatusStyles(status: Status) {
  switch (status) {
    case "Critical":
      return "bg-red-100 text-red-700 border-red-200"
    case "Warning":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "Stable":
      return "bg-emerald/20 text-emerald border-emerald/30"
    case "Monitoring":
      return "bg-sky-100 text-sky-700 border-sky-200"
    default:
      return ""
  }
}

const PAGE_SIZE = 6

export default function DataExplorerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [visibleColumns, setVisibleColumns] = useState(columns)
  const [wardFilter, setWardFilter] = useState("all")
  const [diseaseFilter, setDiseaseFilter] = useState("all")
  const [hospitalFilter, setHospitalFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(0)

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    let rows = detailedData.filter((record) => {
      if (wardFilter !== "all" && record.wardKey !== wardFilter) return false
      if (diseaseFilter !== "all" && record.diseaseKey !== diseaseFilter) return false
      if (hospitalFilter !== "all" && record.hospitalKey !== hospitalFilter) return false
      if (statusFilter !== "all" && record.status.toLowerCase() !== statusFilter) return false
      if (!q) return true
      return (
        record.district.toLowerCase().includes(q) ||
        record.disease.toLowerCase().includes(q) ||
        record.hospital.toLowerCase().includes(q) ||
        record.id.toLowerCase().includes(q)
      )
    })
    rows = [...rows].sort((a, b) => (sortAsc ? a.cases - b.cases : b.cases - a.cases))
    return rows
  }, [searchTerm, wardFilter, diseaseFilter, hospitalFilter, statusFilter, sortAsc])

  const summary = useMemo(() => {
    const totalCases = filteredData.reduce((s, r) => s + r.cases, 0)
    const recovered = filteredData.reduce((s, r) => s + r.recovered, 0)
    const rr = totalCases > 0 ? Math.round((recovered / totalCases) * 100) : 0
    const avg = filteredData.length ? Math.round(totalCases / filteredData.length) : 0
    return {
      totalCases,
      recordCount: filteredData.length,
      wards: new Set(filteredData.map((r) => r.district)).size,
      diseases: new Set(filteredData.map((r) => r.diseaseKey)).size,
      recoveryRate: rr,
      avgCases: avg,
    }
  }, [filteredData])

  const chartData = useMemo(() => {
    const byWard = new Map<string, number>()
    for (const row of filteredData) {
      byWard.set(row.district, (byWard.get(row.district) || 0) + row.cases)
    }
    return Array.from(byWard.entries())
      .map(([name, count]) => ({ name, cases: count }))
      .sort((a, b) => b.cases - a.cases)
  }, [filteredData])

  const pageCount = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))
  const pageSafe = Math.min(page, pageCount - 1)
  const pageRows = useMemo(() => {
    const start = pageSafe * PAGE_SIZE
    return filteredData.slice(start, start + PAGE_SIZE)
  }, [filteredData, pageSafe])

  useEffect(() => {
    setPage(0)
  }, [wardFilter, diseaseFilter, hospitalFilter, statusFilter])

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const toggleAllRows = () => {
    setSelectedRows((prev) =>
      prev.length === pageRows.length ? [] : pageRows.map((r) => r.id)
    )
  }

  const resetFilters = () => {
    setWardFilter("all")
    setDiseaseFilter("all")
    setHospitalFilter("all")
    setStatusFilter("all")
    setSearchTerm("")
    setPage(0)
    toast.message("Filters reset", { description: "Pune municipal dataset — all localities visible." })
  }

  const exportRows = (rows: DataRecord[], label: string) => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pune-explorer-${label}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${rows.length} record(s)`)
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-card border-b border-border px-4 sm:px-6 py-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-[0.5rem] bg-emerald/15 shrink-0">
                <Database className="h-5 w-5 text-emerald" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">Epidemiological Data Explorer</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Pune MMR extract · ward / facility level
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => toast.success("Data ingest initiated")}
              >
                <Upload className="h-4 w-4 mr-2 shrink-0" />
                Import
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => exportRows(filteredData, "filtered")}>
                <Download className="h-4 w-4 mr-2 shrink-0" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-card p-4 overflow-auto shrink-0">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  Dataset summary
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-[0.5rem] bg-muted/50">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{summary.totalCases.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Cases (filtered)</p>
                  </div>
                  <div className="p-3 rounded-[0.5rem] bg-muted/50">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{summary.recordCount}</p>
                    <p className="text-xs text-muted-foreground">Records</p>
                  </div>
                  <div className="p-3 rounded-[0.5rem] bg-muted/50">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{summary.wards}</p>
                    <p className="text-xs text-muted-foreground">Localities</p>
                  </div>
                  <div className="p-3 rounded-[0.5rem] bg-muted/50">
                    <p className="text-2xl font-bold text-foreground tabular-nums">{summary.diseases}</p>
                    <p className="text-xs text-muted-foreground">Condition groups</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 shrink-0" />
                  Filters
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Date window
                    </Label>
                    <Select defaultValue="7d" onValueChange={() => setPage(0)}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last quarter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      Ward / locality
                    </Label>
                    <Select value={wardFilter} onValueChange={setWardFilter}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Pune localities</SelectItem>
                        <SelectItem value="kothrud">Kothrud</SelectItem>
                        <SelectItem value="shivajinagar">Shivajinagar</SelectItem>
                        <SelectItem value="hadapsar">Hadapsar</SelectItem>
                        <SelectItem value="viman-nagar">Viman Nagar</SelectItem>
                        <SelectItem value="koregaon">Koregaon Park</SelectItem>
                        <SelectItem value="aundh">Aundh</SelectItem>
                        <SelectItem value="wakad">Wakad</SelectItem>
                        <SelectItem value="baner">Baner</SelectItem>
                        <SelectItem value="deccan">Deccan</SelectItem>
                        <SelectItem value="katraj">Katraj</SelectItem>
                        <SelectItem value="hinjewadi">Hinjewadi</SelectItem>
                        <SelectItem value="chinchwad">Chinchwad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      <Activity className="h-3 w-3 inline mr-1" />
                      Condition
                    </Label>
                    <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All conditions</SelectItem>
                        <SelectItem value="dengue">Dengue</SelectItem>
                        <SelectItem value="malaria">Malaria</SelectItem>
                        <SelectItem value="typhoid">Typhoid / enteric</SelectItem>
                        <SelectItem value="respiratory">Respiratory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      <Building2 className="h-3 w-3 inline mr-1" />
                      Reporting site
                    </Label>
                    <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All sites</SelectItem>
                        <SelectItem value="sahyadri-karve">Sahyadri (Karve Rd)</SelectItem>
                        <SelectItem value="sassoon">Sassoon</SelectItem>
                        <SelectItem value="jehangir">Jehangir</SelectItem>
                        <SelectItem value="columbia-nagar">Columbia (Nagar Rd)</SelectItem>
                        <SelectItem value="ruby">Ruby Hall</SelectItem>
                        <SelectItem value="jupiter">Jupiter</SelectItem>
                        <SelectItem value="columbia-wakad">Columbia (Wakad)</SelectItem>
                        <SelectItem value="apollo-baner">Apollo (Baner)</SelectItem>
                        <SelectItem value="deccan-phc">Deccan PHC</SelectItem>
                        <SelectItem value="bharati">Bharati</SelectItem>
                        <SelectItem value="hinjewadi-hub">Hinjewadi hub</SelectItem>
                        <SelectItem value="aditya-birla">Aditya Birla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All status</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Table2 className="h-4 w-4 shrink-0" />
                  Visible columns
                </h3>
                <div className="space-y-2">
                  {visibleColumns.map((col) => (
                    <div key={col.id} className="flex items-center gap-2">
                      <Checkbox
                        id={col.id}
                        checked={col.checked}
                        onCheckedChange={(checked) => {
                          setVisibleColumns((prev) =>
                            prev.map((c) => (c.id === col.id ? { ...c, checked: !!checked } : c))
                          )
                        }}
                      />
                      <Label htmlFor={col.id} className="text-sm text-foreground cursor-pointer">
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" type="button" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset filters
              </Button>
            </div>
          </aside>

          <main className="flex-1 p-4 lg:p-6 overflow-auto min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <MetricCard
                title="Records (filtered)"
                value={summary.recordCount.toLocaleString()}
                icon={FileSpreadsheet}
                trend="neutral"
                accentColor="emerald"
              />
              <MetricCard
                title="Avg cases / record"
                value={summary.avgCases.toLocaleString()}
                icon={Activity}
                trend="up"
                accentColor="saffron"
              />
              <MetricCard
                title="Recovery rate"
                value={`${summary.recoveryRate}%`}
                icon={TrendingDown}
                trend="up"
                accentColor="emerald"
              />
              <MetricCard title="Dataset" value="Pune only" icon={Clock} trend="neutral" accentColor="saffron" />
            </div>

            <Tabs defaultValue="table" className="w-full">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <TabsList className="flex-wrap">
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <Table2 className="h-4 w-4" />
                    Table
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Charts
                  </TabsTrigger>
                </TabsList>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search ward, site, ID…"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setPage(0)
                      }}
                      className="pl-9 w-full sm:max-w-xs"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="shrink-0"
                    onClick={() => {
                      setSortAsc((v) => !v)
                      toast.message(sortAsc ? "Sorted: cases descending" : "Sorted: cases ascending")
                    }}
                  >
                    <SortAsc className={cn("h-4 w-4 transition-transform", !sortAsc && "rotate-180")} />
                  </Button>
                </div>
              </div>

              <TabsContent value="table">
                <ContentCard title="PMC / PCMC reporting lines" accentColor="emerald">
                  {selectedRows.length > 0 && (
                    <div className="mb-4 p-3 rounded-[0.5rem] bg-primary/5 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-sm text-foreground">{selectedRows.length} row(s) selected</span>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          type="button"
                          onClick={() =>
                            exportRows(
                              detailedData.filter((r) => selectedRows.includes(r.id)),
                              "selected"
                            )
                          }
                        >
                          Export selected
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive border-destructive/30"
                          type="button"
                          onClick={() => toast.error("Delete disabled", { description: "You lack delete permissions for this institutional dataset." })}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="overflow-auto rounded-[0.5rem] border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={pageRows.length > 0 && pageRows.every((r) => selectedRows.includes(r.id))}
                              onCheckedChange={toggleAllRows}
                            />
                          </TableHead>
                          {visibleColumns.filter((c) => c.checked).map((col) => (
                            <TableHead key={col.id} className="font-semibold whitespace-nowrap">
                              {col.label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageRows.map((record) => (
                          <TableRow key={record.id} className={cn(selectedRows.includes(record.id) && "bg-primary/5")}>
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.includes(record.id)}
                                onCheckedChange={() => toggleRow(record.id)}
                              />
                            </TableCell>
                            {visibleColumns.find((c) => c.id === "id")?.checked && (
                              <TableCell className="font-mono text-xs whitespace-nowrap">{record.id}</TableCell>
                            )}
                            {visibleColumns.find((c) => c.id === "date")?.checked && (
                              <TableCell className="whitespace-nowrap">{record.date}</TableCell>
                            )}
                            {visibleColumns.find((c) => c.id === "region")?.checked && <TableCell>{record.region}</TableCell>}
                            {visibleColumns.find((c) => c.id === "district")?.checked && (
                              <TableCell className="font-medium">{record.district}</TableCell>
                            )}
                            {visibleColumns.find((c) => c.id === "hospital")?.checked && (
                              <TableCell className="max-w-[180px] text-sm leading-snug">{record.hospital}</TableCell>
                            )}
                            {visibleColumns.find((c) => c.id === "disease")?.checked && (
                              <TableCell className="max-w-[200px] text-sm leading-snug">{record.disease}</TableCell>
                            )}
                            {visibleColumns.find((c) => c.id === "cases")?.checked && (
                              <TableCell className="text-right tabular-nums font-medium">{record.cases.toLocaleString()}</TableCell>
                            )}
                            {visibleColumns.find((c) => c.id === "deaths")?.checked && (
                              <TableCell className="text-right tabular-nums text-red-600">{record.deaths}</TableCell>
                            )}
                            {visibleColumns.find((c) => c.id === "recovered")?.checked && (
                              <TableCell className="text-right tabular-nums text-emerald">{record.recovered}</TableCell>
                            )}
                            {visibleColumns.find((c) => c.id === "status")?.checked && (
                              <TableCell>
                                <Badge variant="outline" className={cn("text-xs whitespace-nowrap", getStatusStyles(record.status))}>
                                  {record.status}
                                </Badge>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>
                      Page {pageSafe + 1} / {pageCount} · Showing {pageRows.length} of {filteredData.length} filtered (
                      {detailedData.length} total)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        disabled={pageSafe <= 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        disabled={pageSafe >= pageCount - 1}
                        onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </ContentCard>
              </TabsContent>

              <TabsContent value="charts">
                <ContentCard title="Ward-level cases distribution" accentColor="emerald" className="min-h-[400px]">
                  <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                        />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Bar dataKey="cases" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ContentCard>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}
