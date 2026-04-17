"use client"

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

type Status = "Critical" | "Warning" | "Stable" | "Monitoring"

interface EpidemiologicalRecord {
  id: string
  area: string
  disease: string
  cases: number
  status: Status
}

const dummyData: EpidemiologicalRecord[] = [
  {
    id: "1",
    area: "North Delhi",
    disease: "Dengue",
    cases: 847,
    status: "Critical",
  },
  {
    id: "2",
    area: "Mumbai Central",
    disease: "Malaria",
    cases: 423,
    status: "Warning",
  },
  {
    id: "3",
    area: "Bangalore South",
    disease: "Typhoid",
    cases: 156,
    status: "Stable",
  },
  {
    id: "4",
    area: "Chennai East",
    disease: "Cholera",
    cases: 289,
    status: "Monitoring",
  },
  {
    id: "5",
    area: "Kolkata North",
    disease: "Dengue",
    cases: 612,
    status: "Critical",
  },
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

export function EpidemiologicalDataGrid() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-background" size="sm">
            <SelectValue placeholder="Disease Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Diseases</SelectItem>
            <SelectItem value="dengue">Dengue</SelectItem>
            <SelectItem value="malaria">Malaria</SelectItem>
            <SelectItem value="typhoid">Typhoid</SelectItem>
            <SelectItem value="cholera">Cholera</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-background" size="sm">
            <SelectValue placeholder="Hospital" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hospitals</SelectItem>
            <SelectItem value="aiims">AIIMS Delhi</SelectItem>
            <SelectItem value="kem">KEM Mumbai</SelectItem>
            <SelectItem value="nimhans">NIMHANS</SelectItem>
            <SelectItem value="cmc">CMC Vellore</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="7d">
          <SelectTrigger className="w-[130px] bg-background" size="sm">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto rounded-[0.5rem] border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Area</TableHead>
              <TableHead className="font-semibold">Disease</TableHead>
              <TableHead className="font-semibold text-right">Cases</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyData.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.area}</TableCell>
                <TableCell>{record.disease}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {record.cases.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium",
                      getStatusStyles(record.status)
                    )}
                  >
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
