/**
 * Client-visible configuration.
 *
 * The browser only ever learns about NEXT_PUBLIC_* variables, so the backend
 * base URL has to be one. Anything secret belongs in the backend, never here.
 */

/**
 * Dynamically resolves the API base URL.
 * - If NEXT_PUBLIC_API_URL or NEXT_PUBLIC_API_BASE_URL is set, uses it.
 * - In browser on remote IP or custom domain, returns "" so requests go to
 *   same-origin /api/v1/... which Next.js rewrites transparently to the backend.
 * - On localhost or in SSR/Node, falls back to http://localhost:4000.
 */
export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "";
    }
  }
  return "http://localhost:4000";
}

export const API_BASE_URL = getApiBaseUrl();

/**
 * Dynamically resolves the Admin Panel URL.
 * - If NEXT_PUBLIC_ADMIN_URL is set, uses it.
 * - In browser on remote IP or custom domain, uses current protocol & host on port 3002.
 * - On localhost or in SSR/Node, falls back to http://localhost:3002.
 */
export function getAdminUrl(): string {
  if (process.env.NEXT_PUBLIC_ADMIN_URL) {
    return process.env.NEXT_PUBLIC_ADMIN_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return `${window.location.protocol}//${host}:3002`;
    }
  }
  return "http://localhost:3002";
}

/** Every backend route is versioned. See docs/API_CONTRACT.md. */
export const API_VERSION = "v1";

/** Build an absolute or rewrite-proxy URL for a versioned backend endpoint. */
export function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const clean = path.startsWith("/") ? path.slice(1) : path;
  const base = getApiBaseUrl();

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
