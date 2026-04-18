import type { MapPoint } from "@/app/government/lib/map-types"

/** Wards / localities with more than this many active points count as a "critical zone". */
export const CRITICAL_ZONE_CASE_THRESHOLD = 5

export function countCriticalZones(points: MapPoint[]): number {
  const byRegion = new Map<string, number>()
  for (const p of points) {
    const r = p.regionName ?? "Unknown"
    byRegion.set(r, (byRegion.get(r) ?? 0) + 1)
  }
  let n = 0
  for (const c of byRegion.values()) {
    if (c > CRITICAL_ZONE_CASE_THRESHOLD) n += 1
  }
  return n
}

/** Estimated population under surveillance emphasis (PMC + PCMC belt; demo multiplier). */
export function estimateAffectedPopulation(caseCount: number): number {
  if (caseCount <= 0) return 0
  return Math.max(1, Math.round(caseCount * 312))
}

/**
 * Share of elevated-severity signals (critical + warning) in the current slice.
 * Aligns stat cards with the same severity model as the heatmap.
 */
export function spreadIntensityPercent(points: MapPoint[]): number {
  if (!points.length) return 0
  const elevated = points.filter((p) => p.severity === "critical" || p.severity === "warning").length
  return Math.min(100, Math.round((elevated / points.length) * 100))
}
