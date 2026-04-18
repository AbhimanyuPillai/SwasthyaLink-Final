"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DEMO_MASTER_MAP_DATA } from "@/app/government/lib/demo-master-map-data"
import type { MapPoint } from "@/app/government/lib/map-types"
const LOAD_MS = 0

/**
 * Curated Pune dataset.
 * Presents as a live municipal feed.
 */
export function useMasterMapData() {
  const [loading, setLoading] = useState(true)
  const [syncNonce, setSyncNonce] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(() => new Date())

  const masterData = useMemo<MapPoint[]>(() => DEMO_MASTER_MAP_DATA, [])

  useEffect(() => {
    setLoading(true)
    const t = window.setTimeout(() => {
      setLoading(false)
      setLastUpdated(new Date())
    }, LOAD_MS)
    return () => window.clearTimeout(t)
  }, [syncNonce])

  useEffect(() => {
    if (loading) return
    const id = window.setInterval(() => setLastUpdated(new Date()), 45_000)
    return () => window.clearInterval(id)
  }, [loading])

  const forceSync = useCallback(() => {
    setSyncNonce((n) => n + 1)
  }, [])

  return {
    masterData,
    loading,
    lastUpdated,
    forceSync,
  }
}
