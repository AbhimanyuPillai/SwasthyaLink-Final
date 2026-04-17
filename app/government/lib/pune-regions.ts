export type PuneRegionBounds = {
  south: number
  north: number
  west: number
  east: number
}

export type PuneRegion = {
  id: string
  name: string
  bounds: PuneRegionBounds
  /** Map label anchor */
  labelPosition: [number, number]
}

/** Approximate Pune localities for analytics (not administrative boundaries). */
export const PUNE_REGIONS: PuneRegion[] = [
  {
    id: "kothrud",
    name: "Kothrud",
    bounds: { south: 18.48, north: 18.53, west: 73.78, east: 73.84 },
    labelPosition: [18.505, 73.81],
  },
  {
    id: "shivajinagar",
    name: "Shivajinagar",
    bounds: { south: 18.505, north: 18.535, west: 73.845, east: 73.875 },
    labelPosition: [18.52, 73.86],
  },
  {
    id: "hadapsar",
    name: "Hadapsar",
    bounds: { south: 18.475, north: 18.52, west: 73.915, east: 73.98 },
    labelPosition: [18.496, 73.948],
  },
  {
    id: "deccan",
    name: "Deccan",
    bounds: { south: 18.505, north: 18.53, west: 73.825, east: 73.855 },
    labelPosition: [18.518, 73.838],
  },
  {
    id: "viman-nagar",
    name: "Viman Nagar",
    bounds: { south: 18.555, north: 18.595, west: 73.905, east: 73.96 },
    labelPosition: [18.575, 73.932],
  },
  {
    id: "koregaon",
    name: "Koregaon Park",
    bounds: { south: 18.52, north: 18.545, west: 73.885, east: 73.92 },
    labelPosition: [18.5325, 73.9025],
  },
  {
    id: "aundh",
    name: "Aundh",
    bounds: { south: 18.545, north: 18.575, west: 73.785, east: 73.83 },
    labelPosition: [18.56, 73.8075],
  },
  {
    id: "wakad",
    name: "Wakad",
    bounds: { south: 18.59, north: 18.625, west: 73.74, east: 73.78 },
    labelPosition: [18.6075, 73.76],
  },
]

export function isPointInRegion(lat: number, lng: number, region: PuneRegion): boolean {
  const { south, north, west, east } = region.bounds
  return lat >= south && lat <= north && lng >= west && lng <= east
}
