'use client';

/**
 * Drop-in replacement for react-leaflet MapContainer that survives React 18+
 * Strict Mode. The stock MapContainer initializes the map in a useEffect with no
 * guard; Strict Mode runs that effect twice before `map` state updates, so the
 * second run calls `new L.Map()` on the same div → "Map container is already initialized".
 *
 * This version uses useLayoutEffect + synchronous cleanup so the Leaflet map is
 * always torn down before a second init can run.
 */

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { CONTEXT_VERSION, LeafletContext as LeafletProvider } from "@react-leaflet/core"
import type { LeafletContextInterface } from "@react-leaflet/core"
import L, { type LatLngExpression, type Map as LeafletMap, type MapOptions } from "leaflet"

export type SafeLeafletMapContainerProps = {
  center: LatLngExpression
  zoom: number
  className?: string
  style?: CSSProperties
  scrollWheelZoom?: boolean
  whenCreated?: (map: LeafletMap) => void
  children?: ReactNode
} & Omit<MapOptions, "center" | "zoom">

export function SafeLeafletMapContainer({
  center,
  zoom,
  className,
  style,
  scrollWheelZoom = true,
  whenCreated,
  children,
  ...mapOptions
}: SafeLeafletMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [leafletContext, setLeafletContext] = useState<LeafletContextInterface | null>(null)
  const whenCreatedRef = useRef(whenCreated)
  whenCreatedRef.current = whenCreated

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const map = L.map(el, {
      ...mapOptions,
      center,
      zoom,
      scrollWheelZoom,
    })

    const ctx: LeafletContextInterface = { __version: CONTEXT_VERSION as 1, map }
    setLeafletContext(ctx)
    whenCreatedRef.current?.(map)

    return () => {
      map.remove()
      setLeafletContext(null)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- fixed Pune map; avoids Strict Mode double-init races

  return (
    <div ref={containerRef} className={className} style={style}>
      {leafletContext ? (
        <LeafletProvider value={leafletContext}>{children}</LeafletProvider>
      ) : null}
    </div>
  )
}
