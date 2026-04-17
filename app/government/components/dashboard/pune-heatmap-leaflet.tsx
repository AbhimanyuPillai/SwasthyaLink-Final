"use client"

import { useMemo } from "react"
import { TileLayer, Marker, Tooltip, ZoomControl } from "react-leaflet"
import { HeatmapLayer } from "react-leaflet-heatmap-layer-v3"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { MapPoint } from "@/app/government/lib/map-types"
import { severityToHeatIntensity } from "@/app/government/lib/map-types"
import type { PuneRegion } from "@/app/government/lib/pune-regions"
import { SafeLeafletMapContainer } from "@/app/government/components/dashboard/safe-leaflet-map-container"

export type PuneHeatmapLeafletProps = {
  points: MapPoint[]
  heatRadius: number
  heatMax: number
  showLabels: boolean
  regions: PuneRegion[]
  onMapReady?: (map: L.Map) => void
}

const PUNE_CENTER: [number, number] = [18.5204, 73.8567]
const PUNE_ZOOM = 12

function createRegionLabelIcon() {
  return L.divIcon({
    className: "swasthya-map-region-dot",
    html: '<span class="block w-2 h-2 rounded-full bg-slate-700 ring-2 ring-white shadow"></span>',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  })
}

export function PuneHeatmapLeaflet({
  points,
  heatRadius,
  heatMax,
  showLabels,
  regions,
  onMapReady,
}: PuneHeatmapLeafletProps) {
  const heatmapPoints = useMemo(() => points, [points])
  const labelMarkerIcon = useMemo(() => createRegionLabelIcon(), [])

  return (
    <SafeLeafletMapContainer
      center={PUNE_CENTER}
      zoom={PUNE_ZOOM}
      className="h-full w-full min-h-[400px] rounded-[0.5rem] z-0"
      scrollWheelZoom
      whenCreated={onMapReady}
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HeatmapLayer
        fitBoundsOnUpdate={false}
        points={heatmapPoints}
        latitudeExtractor={(m: MapPoint) => m.lat}
        longitudeExtractor={(m: MapPoint) => m.lng}
        intensityExtractor={(m: MapPoint) => severityToHeatIntensity(m.severity)}
        radius={heatRadius}
        max={heatMax}
        blur={Math.round(heatRadius * 0.28)}
        minOpacity={0.16}
      />
      {showLabels &&
        regions.map((r) => (
          <Marker key={r.id} position={r.labelPosition} icon={labelMarkerIcon}>
            <Tooltip permanent direction="top" offset={[0, -6]} opacity={0.95}>
              {r.name}
            </Tooltip>
          </Marker>
        ))}
    </SafeLeafletMapContainer>
  )
}
export default PuneHeatmapLeaflet
