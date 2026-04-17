"use client"

import { useState } from "react"
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
  Users,
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
  hospital: string
  disease: string
  cases: number
  deaths: number
  recovered: number
  status: Status
  reportedBy: string
}

const detailedData: DataRecord[] = [
  { id: "REC-001", date: "2026-04-11", region: "Pune", district: "Kothrud", hospital: "Sahyadri Hospital", disease: "Dengue", cases: 247, deaths: 3, recovered: 180, status: "Critical", reportedBy: "Dr. Sharma" },
  { id: "REC-002", date: "2026-04-11", region: "Pune", district: "Shivajinagar", hospital: "Ruby Hall Clinic", disease: "Malaria", cases: 156, deaths: 1, recovered: 98, status: "Warning", reportedBy: "Dr. Patel" },
  { id: "REC-003", date: "2026-04-10", region: "Pune", district: "Hadapsar", hospital: "Jehangir Hospital", disease: "Typhoid", cases: 89, deaths: 0, recovered: 72, status: "Stable", reportedBy: "Dr. Kulkarni" },
  { id: "REC-004", date: "2026-04-10", region: "Mumbai", district: "Andheri", hospital: "Kokilaben Hospital", disease: "Cholera", cases: 312, deaths: 5, recovered: 220, status: "Critical", reportedBy: "Dr. Mehta" },
  { id: "REC-005", date: "2026-04-09", region: "Mumbai", district: "Dadar", hospital: "Lilavati Hospital", disease: "Dengue", cases: 178, deaths: 2, recovered: 140, status: "Warning", reportedBy: "Dr. Desai" },
  { id: "REC-006", date: "2026-04-09", region: "Nagpur", district: "Civil Lines", hospital: "AIIMS Nagpur", disease: "Respiratory", cases: 423, deaths: 8, recovered: 310, status: "Critical", reportedBy: "Dr. Gupta" },
  { id: "REC-007", date: "2026-04-08", region: "Nashik", district: "Panchavati", hospital: "Wockhardt Hospital", disease: "Malaria", cases: 67, deaths: 0, recovered: 55, status: "Monitoring", reportedBy: "Dr. Joshi" },
  { id: "REC-008", date: "2026-04-08", region: "Pune", district: "Viman Nagar", hospital: "Columbia Asia", disease: "Dengue", cases: 198, deaths: 2, recovered: 150, status: "Warning", reportedBy: "Dr. Shah" },
]

const columns = [
  { id: "id", label: "Record ID", checked: true },
  { id: "date", label: "Date", checked: true },
  { id: "region", label: "Region", checked: true },
  { id: "district", label: "District", checked: true },
  { id: "hospital", label: "Hospital", checked: true },
  { id: "disease", label: "Disease", checked: true },
  { id: "cases", label: "Cases", checked: true },
  { id: "deaths", label: "Deaths", checked: true },
  { id: "recovered", label: "Recovered", checked: true },
  { id: "status", label: "Status", checked: true },
]

function getStatusStyles(status: Status) {
  switch (status) {
    case "Critical": return "bg-red-100 text-red-700 border-red-200"
    case "Warning": return "bg-amber-100 text-amber-700 border-amber-200"
    case "Stable": return "bg-emerald/20 text-emerald border-emerald/30"
    case "Monitoring": return "bg-sky-100 text-sky-700 border-sky-200"
    default: return ""
  }
}

export default function DataExplorerPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [visibleColumns, setVisibleColumns] = useState(columns)

  const filteredData = detailedData.filter(record =>
    record.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.hospital.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const toggleAllRows = () => {
    setSelectedRows(prev =>
      prev.length === filteredData.length ? [] : filteredData.map(r => r.id)
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[0.5rem] bg-emerald/15">
                <Database className="h-5 w-5 text-emerald" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Epidemiological Data Explorer</h1>
                <p className="text-sm text-muted-foreground">Advanced data querying and analysis tools</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Filter Panel */}
          <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-card p-4 overflow-auto">
            <div className="space-y-6">
              {/* Quick Stats */}
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4" />
                  Dataset Summary
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-[0.5rem] bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">1,670</p>
                    <p className="text-xs text-muted-foreground">Total Cases</p>
                  </div>
                  <div className="p-3 rounded-[0.5rem] bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">8</p>
                    <p className="text-xs text-muted-foreground">Records</p>
                  </div>
                  <div className="p-3 rounded-[0.5rem] bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">4</p>
                    <p className="text-xs text-muted-foreground">Regions</p>
                  </div>
                  <div className="p-3 rounded-[0.5rem] bg-muted/50">
                    <p className="text-2xl font-bold text-foreground">5</p>
                    <p className="text-xs text-muted-foreground">Diseases</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4" />
                  Data Filters
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      Date Range
                    </Label>
                    <Select defaultValue="7d">
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="90d">Last Quarter</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      Region
                    </Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Regions</SelectItem>
                        <SelectItem value="pune">Pune</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                        <SelectItem value="nagpur">Nagpur</SelectItem>
                        <SelectItem value="nashik">Nashik</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      <Activity className="h-3 w-3 inline mr-1" />
                      Disease Type
                    </Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Diseases</SelectItem>
                        <SelectItem value="dengue">Dengue</SelectItem>
                        <SelectItem value="malaria">Malaria</SelectItem>
                        <SelectItem value="typhoid">Typhoid</SelectItem>
                        <SelectItem value="cholera">Cholera</SelectItem>
                        <SelectItem value="respiratory">Respiratory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      <Building2 className="h-3 w-3 inline mr-1" />
                      Hospital
                    </Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Hospitals</SelectItem>
                        <SelectItem value="sahyadri">Sahyadri Hospital</SelectItem>
                        <SelectItem value="ruby">Ruby Hall Clinic</SelectItem>
                        <SelectItem value="jehangir">Jehangir Hospital</SelectItem>
                        <SelectItem value="kokilaben">Kokilaben Hospital</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Status</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full bg-background" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="monitoring">Monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Column Visibility */}
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Table2 className="h-4 w-4" />
                  Visible Columns
                </h3>
                <div className="space-y-2">
                  {visibleColumns.map(col => (
                    <div key={col.id} className="flex items-center gap-2">
                      <Checkbox
                        id={col.id}
                        checked={col.checked}
                        onCheckedChange={(checked) => {
                          setVisibleColumns(prev =>
                            prev.map(c => c.id === col.id ? { ...c, checked: !!checked } : c)
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

              <Button variant="outline" size="sm" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <MetricCard title="Total Records" value="8" icon={FileSpreadsheet} trend="neutral" accentColor="emerald" />
              <MetricCard title="Avg Cases/Record" value="209" icon={Activity} trend="up" accentColor="saffron" />
              <MetricCard title="Recovery Rate" value="76%" icon={TrendingDown} trend="up" accentColor="emerald" />
              <MetricCard title="Last Updated" value="2m ago" icon={Clock} trend="neutral" accentColor="saffron" />
            </div>

            <Tabs defaultValue="table" className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <TabsList>
                  <TabsTrigger value="table" className="flex items-center gap-2">
                    <Table2 className="h-4 w-4" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Charts
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <SortAsc className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value="table">
                <ContentCard title="Data Records" accentColor="emerald">
                  {selectedRows.length > 0 && (
                    <div className="mb-4 p-3 rounded-[0.5rem] bg-primary/5 border border-primary/20 flex items-center justify-between">
                      <span className="text-sm text-foreground">{selectedRows.length} row(s) selected</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Export Selected</Button>
                        <Button size="sm" variant="outline" className="text-destructive">Delete</Button>
                      </div>
                    </div>
                  )}
                  <div className="overflow-auto rounded-[0.5rem] border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedRows.length === filteredData.length}
                              onCheckedChange={toggleAllRows}
                            />
                          </TableHead>
                          {visibleColumns.filter(c => c.checked).map(col => (
                            <TableHead key={col.id} className="font-semibold">{col.label}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.map(record => (
                          <TableRow key={record.id} className={cn(selectedRows.includes(record.id) && "bg-primary/5")}>
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.includes(record.id)}
                                onCheckedChange={() => toggleRow(record.id)}
                              />
                            </TableCell>
                            {visibleColumns.find(c => c.id === "id")?.checked && <TableCell className="font-mono text-xs">{record.id}</TableCell>}
                            {visibleColumns.find(c => c.id === "date")?.checked && <TableCell>{record.date}</TableCell>}
                            {visibleColumns.find(c => c.id === "region")?.checked && <TableCell>{record.region}</TableCell>}
                            {visibleColumns.find(c => c.id === "district")?.checked && <TableCell>{record.district}</TableCell>}
                            {visibleColumns.find(c => c.id === "hospital")?.checked && <TableCell className="max-w-[150px] truncate">{record.hospital}</TableCell>}
                            {visibleColumns.find(c => c.id === "disease")?.checked && <TableCell>{record.disease}</TableCell>}
                            {visibleColumns.find(c => c.id === "cases")?.checked && <TableCell className="text-right tabular-nums font-medium">{record.cases.toLocaleString()}</TableCell>}
                            {visibleColumns.find(c => c.id === "deaths")?.checked && <TableCell className="text-right tabular-nums text-red-600">{record.deaths}</TableCell>}
                            {visibleColumns.find(c => c.id === "recovered")?.checked && <TableCell className="text-right tabular-nums text-emerald">{record.recovered}</TableCell>}
                            {visibleColumns.find(c => c.id === "status")?.checked && (
                              <TableCell>
                                <Badge variant="outline" className={cn("text-xs", getStatusStyles(record.status))}>
                                  {record.status}
                                </Badge>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Showing {filteredData.length} of {detailedData.length} records</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled>Previous</Button>
                      <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                  </div>
                </ContentCard>
              </TabsContent>

              <TabsContent value="charts">
                <ContentCard title="Data Visualization" accentColor="emerald" className="min-h-[400px]">
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-[0.5rem] p-8">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Charts and visualizations will be rendered here</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">Select data fields to generate charts</p>
                    </div>
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
