/**
 * SwasthyaLink FastAPI backend. Defaults to the live Render deployment;
 * set NEXT_PUBLIC_BACKEND_URL for local development.
 */
export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://swasthyalink-pythonapi.onrender.com"
).replace(/\/$/, "");

/** Backend-relative paths (e.g. /uploads/...) vs absolute URLs (Firestore, etc.). */
export function resolveAssetUrl(pathOrUrl: string | null | undefined): string | null {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${BACKEND_URL}${path}`;
}
