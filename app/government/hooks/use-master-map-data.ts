"use client"

import { useEffect, useState } from "react"
import { DEMO_MASTER_MAP_DATA } from "@/app/government/lib/demo-master-map-data"

/** Map point dataset for the regional heatmap view. */
export function useMasterMapData(_streamLive = true) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    setLastUpdated(new Date())
  }, [])

  return {
    masterMapData: DEMO_MASTER_MAP_DATA,
    lastUpdated,
  }
}
