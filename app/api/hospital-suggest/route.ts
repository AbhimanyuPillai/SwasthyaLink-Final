import { NextRequest } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

interface Hospital {
  hospital_id: string
  full_name: string
  hospital_name: string
  specialty: string
  phone: string
  area_zone: string
  google_maps_link: string
  operating_hours: string
  lat: number
  lng: number
}

// ─── Haversine distance (km) between two GPS coords ──────────────────────────

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Specialty keyword extraction ─────────────────────────────────────────────

function extractKeywords(specialist: string, query: string): string[] {
  const specialistMap: Record<string, string[]> = {
    cardiolog: ["cardiology", "cardiac", "heart", "bypass", "angioplasty"],
    neurolog: ["neurology", "neurosurgery", "brain", "stroke"],
    orthoped: ["orthopedics", "orthopaedic", "bone", "joint", "knee", "spine", "ligament", "fracture"],
    gynecolog: ["gynecology", "gynaecology", "maternity", "obstetric", "pregnancy", "ivf", "nicu"],
    oncolog: ["oncology", "cancer", "chemotherapy", "radiation"],
    gastroenter: ["gastroenterology", "gastro", "liver", "stomach", "colonoscopy"],
    dermatolog: ["dermatology", "skin", "hair"],
    ophthalmolog: ["ophthalmology", "eye", "cataract", "retina"],
    urolog: ["urology", "kidney", "prostate", "stone"],
    pediatric: ["pediatrics", "child", "nicu", "neonatology"],
    pulmonolog: ["pulmonology", "lung", "respiratory", "chest", "breathing"],
    psychiatr: ["psychiatry", "mental health", "depression", "anxiety"],
    endocrinolog: ["endocrinology", "diabetes", "thyroid", "hormone"],
    nephrol: ["nephrology", "kidney", "dialysis"],
    dentist: ["dental", "dentistry", "tooth"],
    ent: ["ent", "ear", "nose", "throat", "sinus"],
    physiother: ["physiotherapy", "rehabilitation", "physical therapy"],
    rheumatol: ["rheumatology", "arthritis", "joint pain"],
    general: ["general medicine", "general surgery", "family medicine", "multi-specialty"],
    emergency: ["emergency", "icu", "trauma", "24 hour"],
    diagnostic: ["diagnostics", "mri", "ct", "pathology", "radiology", "x-ray", "lab"],
  }

  const combined = `${specialist} ${query}`.toLowerCase()
  const keywords: string[] = []

  for (const [stem, mapped] of Object.entries(specialistMap)) {
    if (combined.includes(stem)) {
      keywords.push(...mapped)
    }
  }

  if (keywords.length === 0) {
    keywords.push("multi-specialty", "general medicine", "emergency")
  }

  return [...new Set(keywords)]
}

// ─── Specialty relevance score (0-10) ────────────────────────────────────────

function specialtyScore(hospital: Hospital, keywords: string[]): number {
  const specialtyLower = hospital.specialty.toLowerCase()
  const nameLower = hospital.hospital_name.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    const k = kw.toLowerCase()
    if (specialtyLower.includes(k)) score += 3
    if (nameLower.includes(k)) score += 1
  }
  return Math.min(score, 20) // cap at 20
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      specialist = "",
      query = "",
      userLat,
      userLng,
      userLocation = "",
    } = body as {
      specialist: string
      query: string
      userLat?: number
      userLng?: number
      userLocation?: string
    }

    const filePath = path.join(process.cwd(), "app", "doctor", "doc_data.json")
    const raw = await readFile(filePath, "utf-8")
    const hospitals: Hospital[] = JSON.parse(raw)

    const keywords = extractKeywords(specialist, query)
    const hasGPS = typeof userLat === "number" && typeof userLng === "number"

    type ScoredHospital = {
      hospital: Hospital
      distanceKm: number
      specScore: number
      finalScore: number
    }

    const scored: ScoredHospital[] = hospitals
      .filter((h) => {
        // must have at least some specialty relevance
        return specialtyScore(h, keywords) > 0
      })
      .map((h) => {
        const distanceKm = hasGPS ? haversineKm(userLat!, userLng!, h.lat, h.lng) : 999
        const specScore = specialtyScore(h, keywords)

        // Scoring formula when GPS is available:
        //   finalScore = specScore − (distance penalty)
        //   distance penalty: 0 for ≤2 km, gradual decrease after that
        // Without GPS: sort purely by specialty score
        let distancePenalty = 0
        if (hasGPS) {
          distancePenalty = Math.max(0, distanceKm - 2) * 0.8 // lose 0.8 pts per km beyond 2km
        }

        const finalScore = specScore - distancePenalty

        return { hospital: h, distanceKm, specScore, finalScore }
      })
      .sort((a, b) => b.finalScore - a.finalScore)

    // Return top 5 with distance info appended to area_zone
    const suggestions = scored.slice(0, 5).map((s) => ({
      ...s.hospital,
      distance_km: hasGPS ? parseFloat(s.distanceKm.toFixed(1)) : null,
    }))

    // Fallback: no specialty match — return top 3 nearest multi-specialty
    if (suggestions.length === 0) {
      const fallback = hospitals
        .filter((h) => h.specialty.toLowerCase().includes("multi-specialty"))
        .map((h) => ({
          ...h,
          distance_km: hasGPS ? parseFloat(haversineKm(userLat!, userLng!, h.lat, h.lng).toFixed(1)) : null,
        }))
        .sort((a, b) =>
          hasGPS ? (a.distance_km ?? 999) - (b.distance_km ?? 999) : 0
        )
        .slice(0, 3)

      return Response.json({ suggestions: fallback })
    }

    return Response.json({ suggestions })
  } catch (error) {
    console.error("Hospital suggest error:", error)
    return Response.json({ suggestions: [], error: "Failed to load hospital data" }, { status: 500 })
  }
}
