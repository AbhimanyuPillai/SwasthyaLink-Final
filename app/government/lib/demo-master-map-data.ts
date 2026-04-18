import type { MapPoint, MapSeverity } from "@/app/government/lib/map-types"
import { PUNE_REGIONS, isPointInRegion } from "@/app/government/lib/pune-regions"

/**
 * Strict Pune urban envelope (no PCMC satellite ambiguity, no extra-city scatter).
 * All synthetic points are clamped to this box.
 */
/** Pune Metropolitan Region (PMC + contiguous PCMC / fringe) — single city envelope. */
const PUNE_BBOX = {
  south: 18.45,
  north: 18.63,
  west: 73.695,
  east: 73.985,
}

/** Deterministic PRNG for stable demo points between reloads. */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickWeighted<T>(items: T[], weights: number[], rand: () => number): T {
  const sum = weights.reduce((a, b) => a + b, 0)
  let r = rand() * sum
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

function clampToPune(lat: number, lng: number): { lat: number; lng: number } {
  return {
    lat: Math.min(PUNE_BBOX.north, Math.max(PUNE_BBOX.south, lat)),
    lng: Math.min(PUNE_BBOX.east, Math.max(PUNE_BBOX.west, lng)),
  }
}

const DISEASE_POOL: { diseaseId: string; diseaseLabel: string }[] = [
  { diseaseId: "dengue", diseaseLabel: "Dengue (PMC sentinel)" },
  { diseaseId: "malaria", diseaseLabel: "Malaria (monsoon belt)" },
  { diseaseId: "typhoid", diseaseLabel: "Typhoid / enteric fever" },
  { diseaseId: "respiratory", diseaseLabel: "Respiratory illness (PM10 season)" },
  { diseaseId: "dengue", diseaseLabel: "Dengue serotype-2 (Hadapsar cluster)" },
  { diseaseId: "malaria", diseaseLabel: "Plasmodium vivax (Mula-Mutha fringe)" },
  { diseaseId: "respiratory", diseaseLabel: "Viral bronchitis (Baner–Hinjewadi IT corridor)" },
  { diseaseId: "typhoid", diseaseLabel: "Enteric fever (wada water-line)" },
  { diseaseId: "respiratory", diseaseLabel: "Community pneumonia (Koregaon Park)" },
  { diseaseId: "dengue", diseaseLabel: "Dengue (Aundh–Pashan ward watch)" },
]

const SEVERITIES: MapSeverity[] = ["critical", "warning", "stable", "monitoring"]

function hotspotWeights(regionId: string): number[] {
  if (regionId === "hadapsar" || regionId === "kothrud") return [0.38, 0.32, 0.22, 0.08]
  if (regionId === "shivajinagar" || regionId === "viman-nagar") return [0.28, 0.34, 0.26, 0.12]
  return [0.14, 0.28, 0.38, 0.2]
}

/** Major Pune hospitals / campuses — coordinates approximate public map pins (Pune only). */
const PUNE_HOSPITALS: { id: string; name: string; lat: number; lng: number; weight: number[] }[] = [
  { id: "ruby", name: "Ruby Hall Clinic", lat: 18.5352, lng: 73.8898, weight: [0.22, 0.32, 0.32, 0.14] },
  { id: "jehangir", name: "Jehangir Hospital", lat: 18.5368, lng: 73.8934, weight: [0.2, 0.34, 0.32, 0.14] },
  { id: "sahyadri-karve", name: "Sahyadri Hospital (Karve Rd)", lat: 18.5074, lng: 73.8259, weight: [0.18, 0.3, 0.38, 0.14] },
  { id: "dmh", name: "Deenanath Mangeshkar Hospital", lat: 18.5228, lng: 73.8249, weight: [0.24, 0.3, 0.3, 0.16] },
  { id: "sancheti", name: "Sancheti Institute", lat: 18.5239, lng: 73.8537, weight: [0.16, 0.28, 0.4, 0.16] },
  { id: "sassoon", name: "Sassoon General Hospital", lat: 18.5221, lng: 73.8686, weight: [0.3, 0.32, 0.26, 0.12] },
  { id: "bharati", name: "Bharati Hospital", lat: 18.5005, lng: 73.8588, weight: [0.26, 0.32, 0.3, 0.12] },
  { id: "inamdar", name: "Inamdar Hospital", lat: 18.5048, lng: 73.9232, weight: [0.22, 0.3, 0.34, 0.14] },
  { id: "noble", name: "Noble Hospital", lat: 18.4962, lng: 73.9408, weight: [0.2, 0.3, 0.36, 0.14] },
  { id: "jupiter-baner", name: "Jupiter Hospital (Baner)", lat: 18.5591, lng: 73.7805, weight: [0.18, 0.3, 0.38, 0.14] },
  { id: "columbia-wakad", name: "Columbia Asia (Wakad)", lat: 18.5998, lng: 73.7625, weight: [0.16, 0.28, 0.4, 0.16] },
  { id: "aditya-chinchwad", name: "Aditya Birla Memorial", lat: 18.6185, lng: 73.7621, weight: [0.18, 0.3, 0.38, 0.14] },
  { id: "kem-pune", name: "B.J. Medical / Sassoon campus", lat: 18.5214, lng: 73.8679, weight: [0.28, 0.32, 0.28, 0.12] },
  { id: "om", name: "Om Hospital (Wakad)", lat: 18.6082, lng: 73.7588, weight: [0.14, 0.28, 0.42, 0.16] },
  { id: "sahyadri-nagar", name: "Sahyadri Hospital (Nagar Rd)", lat: 18.5672, lng: 73.9245, weight: [0.2, 0.32, 0.34, 0.14] },
  { id: "katraj", name: "Katraj / Padmavati clinic cluster", lat: 18.4712, lng: 73.8655, weight: [0.2, 0.32, 0.34, 0.14] },
  { id: "chetna", name: "Chetna Hospital (Kothrud)", lat: 18.5102, lng: 73.8078, weight: [0.16, 0.28, 0.4, 0.16] },
  { id: "hardikar", name: "Hardikar Hospital", lat: 18.5088, lng: 73.8312, weight: [0.18, 0.3, 0.38, 0.14] },
  { id: "sanjeevani", name: "Sanjeevani Hospital (Hadapsar)", lat: 18.4925, lng: 73.9325, weight: [0.22, 0.32, 0.32, 0.14] },
  { id: "poona", name: "Poona Hospital & Research", lat: 18.5288, lng: 73.8479, weight: [0.2, 0.32, 0.34, 0.14] },
  { id: "fortis-kalyani", name: "Fortis Hospital (Kalyani Nagar)", lat: 18.5546, lng: 73.9049, weight: [0.18, 0.3, 0.38, 0.14] },
  { id: "iihr", name: "Hinjewadi multispecialty hub", lat: 18.5912, lng: 73.7389, weight: [0.14, 0.28, 0.42, 0.16] },
  { id: "ratna", name: "Ratna Memorial Hospital", lat: 18.5012, lng: 73.8765, weight: [0.2, 0.32, 0.34, 0.14] },
  { id: "dinanath", name: "Dinanath Mangeshkar OPD hub", lat: 18.5245, lng: 73.8268, weight: [0.18, 0.3, 0.38, 0.14] },
  { id: "hv-desai", name: "H.V. Desai Eye Hospital", lat: 18.4942, lng: 73.9112, weight: [0.1, 0.24, 0.5, 0.16] },
]

function regionNameForCoordinates(lat: number, lng: number): string {
  for (const r of PUNE_REGIONS) {
    if (isPointInRegion(lat, lng, r)) return r.name
  }
  return "Pune metropolitan fringe"
}

function buildDemoMasterMapData(): MapPoint[] {
  const rand = mulberry32(0x5ea5_104e)
  const out: MapPoint[] = []
  let seq = 0

  const pushPoint = (
    lat: number,
    lng: number,
    diseaseId: string,
    diseaseLabel: string,
    severity: MapSeverity,
    id: string,
    regionName: string
  ) => {
    const c = clampToPune(lat, lng)
    out.push({
      id,
      lat: c.lat,
      lng: c.lng,
      diseaseId,
      diseaseLabel,
      severity,
      regionName,
    })
  }

  // --- Region polygons: ward-level density (still Pune-only) ---
  for (const region of PUNE_REGIONS) {
    const count = 40 + Math.floor(rand() * 24)
    const w = hotspotWeights(region.id)
    for (let i = 0; i < count; i++) {
      const { south, north, west, east } = region.bounds
      const lat = south + rand() * (north - south)
      const lng = west + rand() * (east - west)
      const d = DISEASE_POOL[Math.floor(rand() * DISEASE_POOL.length)]
      const severity = pickWeighted(SEVERITIES, w, rand)
      seq += 1
      pushPoint(lat, lng, d.diseaseId, d.diseaseLabel, severity, `ward-${region.id}-${seq}`, region.name)
    }
  }

  // --- Micro-clusters: PHCs / mohalla reporting (tight jitter inside each region) ---
  for (const region of PUNE_REGIONS) {
    const hubs = 5 + Math.floor(rand() * 4)
    for (let h = 0; h < hubs; h++) {
      const { south, north, west, east } = region.bounds
      const cx = south + rand() * (north - south)
      const cy = west + rand() * (east - west)
      const clusterPts = 12 + Math.floor(rand() * 12)
      for (let i = 0; i < clusterPts; i++) {
        const lat = cx + (rand() - 0.5) * 0.0065
        const lng = cy + (rand() - 0.5) * 0.0065
        const d = DISEASE_POOL[Math.floor(rand() * DISEASE_POOL.length)]
        const severity = pickWeighted(SEVERITIES, hotspotWeights(region.id), rand)
        seq += 1
        pushPoint(lat, lng, d.diseaseId, d.diseaseLabel, severity, `hub-${region.id}-${h}-${seq}`, region.name)
      }
    }
  }

  // --- Hospital campuses: high-resolution patient-location simulation ---
  for (const h of PUNE_HOSPITALS) {
    const campusPts = 38 + Math.floor(rand() * 28)
    for (let i = 0; i < campusPts; i++) {
      const lat = h.lat + (rand() - 0.5) * 0.0038
      const lng = h.lng + (rand() - 0.5) * 0.0038
      const d = DISEASE_POOL[Math.floor(rand() * DISEASE_POOL.length)]
      const severity = pickWeighted(SEVERITIES, h.weight, rand)
      seq += 1
      const pre = clampToPune(lat, lng)
      pushPoint(
        lat,
        lng,
        d.diseaseId,
        d.diseaseLabel,
        severity,
        `hosp-${h.id}-${seq}`,
        regionNameForCoordinates(pre.lat, pre.lng)
      )
    }
  }

  // --- Intra-city corridor (sparse fill inside Pune bbox only) ---
  for (let i = 0; i < 180; i++) {
    const lat = PUNE_BBOX.south + rand() * (PUNE_BBOX.north - PUNE_BBOX.south)
    const lng = PUNE_BBOX.west + rand() * (PUNE_BBOX.east - PUNE_BBOX.west)
    if (Math.abs(lat - 18.52) + Math.abs(lng - 73.85) > 0.04 && rand() > 0.35) continue
    const d = DISEASE_POOL[Math.floor(rand() * DISEASE_POOL.length)]
    const severity = pickWeighted(SEVERITIES, [0.18, 0.3, 0.38, 0.14], rand)
    seq += 1
    const cc = clampToPune(lat, lng)
    pushPoint(lat, lng, d.diseaseId, d.diseaseLabel, severity, `corridor-${seq}`, regionNameForCoordinates(cc.lat, cc.lng))
  }

  return out
}

/** Regional surveillance sample used by the heatmap layers. */
export const DEMO_MASTER_MAP_DATA: MapPoint[] = buildDemoMasterMapData()
