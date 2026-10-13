import { apiUrl } from './env';

export interface ApiFetchOptions extends RequestInit {
  skipContentType?: boolean;
}

/**
 * Universal type-safe fetch wrapper for backend API communication.
 * - Resolves URLs via apiUrl() ensuring correct backend base address.
 * - Injects credentials: 'include' by default for session cookie propagation.
 * - Auto-parses JSON errors and provides meaningful error messages even on HTML responses.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const url = apiUrl(path);
  const { skipContentType, headers, ...rest } = options;

  const resolvedHeaders: Record<string, string> = {};

  if (!skipContentType && (options.method === 'POST' || options.method === 'PATCH' || options.method === 'PUT')) {
    resolvedHeaders['Content-Type'] = 'application/json';
  }

  if (headers) {
    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        resolvedHeaders[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        resolvedHeaders[key] = value;
      });
    } else {
      Object.assign(resolvedHeaders, headers);
    }
  }

  const response = await fetch(url, {
    credentials: 'include',
    headers: resolvedHeaders,
    ...rest,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status} (${response.statusText})`;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await response.json();
        errorMessage =
          errorJson?.error?.message ||
          errorJson?.message ||
          errorJson?.error ||
          errorMessage;
      } else {
        const text = await response.text();
        if (text && text.length < 150 && !text.toLowerCase().includes('<!doctype') && !text.toLowerCase().includes('<html')) {
          errorMessage = text;
        }
      }
    } catch {
      // Keep default message
    }

    const err = new Error(errorMessage);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
