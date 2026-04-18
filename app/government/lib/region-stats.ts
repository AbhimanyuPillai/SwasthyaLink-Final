import type { MapPoint, MapSeverity } from "@/app/government/lib/map-types"
import { isPointInRegion, type PuneRegion } from "@/app/government/lib/pune-regions"

const severityRank: Record<MapSeverity, number> = {
  critical: 0,
  warning: 1,
  monitoring: 2,
  stable: 3,
}

function summarizePointsSubset(inRegion: MapPoint[]) {
  const cases = inRegion.length
  if (!cases) {
    return {
      cases: 0,
      primaryDisease: "No matching cases",
      primaryDiseaseId: "",
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
  let primaryDiseaseId = "unknown"
  let max = 0
  for (const [diseaseId, { label, count }] of byDisease.entries()) {
    if (count > max) {
      max = count
      primaryDisease = label
      primaryDiseaseId = diseaseId
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

  return { cases, primaryDisease, primaryDiseaseId, dominantSeverity }
}

/** Summary for an arbitrary subset of points (e.g. one dynamic region). */
export function summarizeMapPoints(points: MapPoint[]) {
  return summarizePointsSubset(points)
}

export function summarizeRegion(region: PuneRegion, points: MapPoint[]) {
  const inRegion = points.filter((p) => isPointInRegion(p.lat, p.lng, region))
  return summarizePointsSubset(inRegion)
}

export function summarizeByRegionName(regionName: string, points: MapPoint[]) {
  const inRegion = points.filter((p) => (p.regionName ?? "Unknown") === regionName)
  return summarizePointsSubset(inRegion)
}

export function countPointsInRegion(region: PuneRegion, points: MapPoint[]): number {
  return points.filter((p) => isPointInRegion(p.lat, p.lng, region)).length
}
