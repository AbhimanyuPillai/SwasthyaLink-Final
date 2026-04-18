/**
 * Deterministic time-window slice for demo controls (points have no real timestamps).
 * Keeps the UI responsive while staying stable across re-renders.
 */
export function passesDemoTimeWindow(pointId: string, window: string): boolean {
  let h = 2166136261
  for (let i = 0; i < pointId.length; i++) {
    h = Math.imul(h ^ pointId.charCodeAt(i), 16777619)
  }
  const b = Math.abs(h) % 100
  switch (window) {
    case "1h":
      return b < 7
    case "24h":
      return b < 34
    case "7d":
      return b < 71
    case "30d":
      return b < 93
    default:
      return true
  }
}
