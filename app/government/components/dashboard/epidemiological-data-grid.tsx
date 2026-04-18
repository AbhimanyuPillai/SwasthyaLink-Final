"use client"

import { useMemo, useState } from "react"
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
import { cn } from "@/app/government/lib/utils"
import { PUNE_REPORTING_SITES } from "@/app/government/lib/pune-facilities"

type Status = "Critical" | "Warning" | "Stable" | "Monitoring"

export interface EpidemiologicalRecord {
  id: string
  area: string
  disease: string
  diseaseId: string
  cases: number
  status: Status
  reportingFacilityId: string
  reportingFacility: string
}

const DISEASE_FILTER_OPTIONS = [
  { id: "all", name: "All diseases" },
  { id: "dengue", name: "Dengue" },
  { id: "malaria", name: "Malaria" },
  { id: "typhoid", name: "Typhoid / enteric" },
  { id: "respiratory", name: "Respiratory" },
] as const

const RANGE_OPTIONS = [
  { id: "24h", name: "Last 24 hours" },
  { id: "7d", name: "Last 7 days" },
  { id: "30d", name: "Last 30 days" },
] as const

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

type EpidemiologicalDataGridProps = {
  rows?: EpidemiologicalRecord[]
  loading?: boolean
}

export function EpidemiologicalDataGrid({ rows = [], loading = false }: EpidemiologicalDataGridProps) {
  const [diseaseFilter, setDiseaseFilter] = useState<string>("all")
  const [facilityFilter, setFacilityFilter] = useState<string>("all")
  const [rangeFilter, setRangeFilter] = useState<string>("7d")

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (diseaseFilter !== "all" && r.diseaseId !== diseaseFilter) return false
      if (facilityFilter !== "all" && r.reportingFacilityId !== facilityFilter) return false
      return true
    })
  }, [rows, diseaseFilter, facilityFilter])

  return (
    <div className="flex flex-col gap-4 h-full min-h-0">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Select value={diseaseFilter} onValueChange={setDiseaseFilter}>
          <SelectTrigger className="w-[min(100%,11rem)] bg-background" size="sm">
            <SelectValue placeholder="Disease" />
          </SelectTrigger>
          <SelectContent>
            {DISEASE_FILTER_OPTIONS.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={facilityFilter} onValueChange={setFacilityFilter}>
          <SelectTrigger className="w-[min(100%,13rem)] bg-background" size="sm">
            <SelectValue placeholder="Reporting site" />
          </SelectTrigger>
          <SelectContent>
            {PUNE_REPORTING_SITES.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={rangeFilter} onValueChange={setRangeFilter}>
          <SelectTrigger className="w-[min(100%,10rem)] bg-background" size="sm">
            <SelectValue placeholder="Window" />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Window selector filters the table view.
      </p>

      <div className="flex-1 min-h-[200px] overflow-auto rounded-[0.5rem] border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold min-w-[7rem]">Area</TableHead>
              <TableHead className="font-semibold min-w-[7rem]">Primary condition</TableHead>
              <TableHead className="font-semibold text-right">Signals</TableHead>
              <TableHead className="font-semibold min-w-[6rem] hidden sm:table-cell">Reporting site</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  Aggregating ward-level rollups…
                </TableCell>
              </TableRow>
            ) : filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                  No rows match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium align-top">{record.area}</TableCell>
                  <TableCell className="text-sm align-top max-w-[10rem] sm:max-w-none">{record.disease}</TableCell>
                  <TableCell className="text-right tabular-nums align-top">
                    {record.cases.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground align-top hidden sm:table-cell max-w-[11rem]">
                    {record.reportingFacility}
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium whitespace-nowrap",
                        getStatusStyles(record.status)
                      )}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
