/**
 * Client-visible configuration.
 *
 * The browser only ever learns about NEXT_PUBLIC_* variables, so the backend
 * base URL has to be one. Anything secret belongs in the backend, never here.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

/** Every backend route is versioned. See docs/API_CONTRACT.md. */
export const API_VERSION = "v1";

/** Build an absolute URL for a versioned backend endpoint. */
export function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const clean = path.startsWith("/") ? path.slice(1) : path;
  const base = API_BASE_URL.replace(/\/$/, "");

  if (base) {
    if (clean.startsWith("api/v1/")) {
      return `${base}/${clean}`;
    }
    if (clean.startsWith("api/")) {
      return `${base}/${clean}`;
    }
    return `${base}/api/${API_VERSION}/${clean}`;
  }

  if (clean.startsWith("api/v1/")) {
    return `/${clean}`;
  }
  if (clean.startsWith("api/")) {
    return `/${clean}`;
  }
  return `/api/${API_VERSION}/${clean}`;
}
