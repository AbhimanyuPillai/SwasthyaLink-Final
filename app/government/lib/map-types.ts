export type MapSeverity = "critical" | "warning" | "stable" | "monitoring"

export type MapPoint = {
  id: string
  lat: number
  lng: number
  diseaseId: string
  diseaseLabel: string
  severity: MapSeverity
}

export function normalizeSeverity(raw: string): MapSeverity {
  const x = raw.toLowerCase().trim()
  if (["critical", "severe", "high", "urgent"].includes(x)) return "critical"
  if (["warning", "moderate", "medium"].includes(x)) return "warning"
  if (["monitoring", "watch"].includes(x)) return "monitoring"
  if (["stable", "low", "resolved"].includes(x)) return "stable"
  return "stable"
}

export function canonicalDiseaseId(label: string): string {
  const l = label.toLowerCase()
  if (l.includes("dengue")) return "dengue"
  if (l.includes("malaria")) return "malaria"
  if (l.includes("typhoid")) return "typhoid"
  if (l.includes("respiratory") || l.includes("asthma") || l.includes("lung")) return "respiratory"
  return l.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "unknown"
}

export function severityToHeatIntensity(severity: MapSeverity): number {
  switch (severity) {
    case "critical":
      return 1
    case "warning":
      return 0.65
    case "stable":
      return 0.35
    case "monitoring":
      return 0.2
    default:
      return 0.35
  }
}
