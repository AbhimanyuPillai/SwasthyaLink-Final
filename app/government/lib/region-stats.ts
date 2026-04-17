import type { MapPoint, MapSeverity } from "@/app/government/lib/map-types"
import { isPointInRegion, type PuneRegion } from "@/app/government/lib/pune-regions"

const severityRank: Record<MapSeverity, number> = {
  critical: 0,
  warning: 1,
  monitoring: 2,
  stable: 3,
}

export function summarizeRegion(region: PuneRegion, points: MapPoint[]) {
  const inRegion = points.filter((p) => isPointInRegion(p.lat, p.lng, region))
  const cases = inRegion.length
  if (!cases) {
    return {
      cases: 0,
      primaryDisease: "No matching cases",
      dominantSeverity: "stable" as MapSeverity,
    }
  }

  const byDisease = new Map<string, { label: string; count: number }>()
  for (const p of inRegion) {
    const prev = byDisease.get(p.diseaseId)
    if (prev) prev.count += 1
    else byDisease.set(p.diseaseId, { label: p.diseaseLabel, count: 1 })
  }

  let primaryDisease = "Unknown"
  let max = 0
  for (const { label, count } of byDisease.values()) {
    if (count > max) {
      max = count
      primaryDisease = label
    }
  }

  let dominantSeverity: MapSeverity = "stable"
  let bestRank = 4
  for (const p of inRegion) {
    const r = severityRank[p.severity]
    if (r < bestRank) {
      bestRank = r
      dominantSeverity = p.severity
    }
  }

  return { cases, primaryDisease, dominantSeverity }
}

export function countPointsInRegion(region: PuneRegion, points: MapPoint[]): number {
  return points.filter((p) => isPointInRegion(p.lat, p.lng, region)).length
}
