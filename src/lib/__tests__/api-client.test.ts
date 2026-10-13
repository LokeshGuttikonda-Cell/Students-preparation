import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '../api-client';

describe('api-client apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('performs GET request and parses JSON body', async () => {
    const mockData = { id: 'test-1', status: 'OK' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as Response);

    const result = await apiFetch<typeof mockData>('health');
    expect(result).toEqual(mockData);
  });

  it('sets Content-Type for POST requests unless skipContentType is true', async () => {
    let capturedHeaders: Record<string, string> | undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(async (_url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return {
        ok: true,
        status: 201,
        json: async () => ({ success: true }),
      } as Response;
    });

    await apiFetch('test-post', {
      method: 'POST',
      body: JSON.stringify({ payload: 123 }),
    });

    expect(capturedHeaders?.['Content-Type']).toBe('application/json');
  });

  it('omits Content-Type when skipContentType is true', async () => {
    let capturedHeaders: Record<string, string> | undefined;
    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(async (_url, init) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response;
    });

    await apiFetch('upload', {
      method: 'POST',
      skipContentType: true,
    });

    expect(capturedHeaders?.['Content-Type']).toBeUndefined();
  });

  it('handles 204 No Content response gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as Response);

    const result = await apiFetch<object>('delete-resource', { method: 'DELETE' });
    expect(result).toEqual({});
  });

  it('extracts error message from structured JSON error responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({
        error: { message: 'Invalid roleTrackId parameter' },
      }),
    } as Response);

    await expect(apiFetch('broken')).rejects.toThrow('Invalid roleTrackId parameter');
  });

  it('extracts fallback status error when response is not JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      headers: new Headers({ 'content-type': 'text/html' }),
      text: async () => '<html>502 Bad Gateway</html>',
    } as Response);

    await expect(apiFetch('gateway-error')).rejects.toThrow('Request failed with status 502 (Bad Gateway)');
  });
});
