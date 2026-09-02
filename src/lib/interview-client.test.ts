import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  startInterviewSession,
  sendInterviewMessage,
  completeInterviewSession,
  getInterviewSession,
  getUserInterviews,
} from './interview-client';

describe('interview-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('startInterviewSession sends POST to /api/v1/interviews', async () => {
    const mockResponse = { id: 'sess_1', status: 'IN_PROGRESS' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await startInterviewSession('r_devops', 25);
    expect(fetch).toHaveBeenCalledWith('/api/v1/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleTrackId: 'r_devops', targetDurationMinutes: 25 }),
    });
    expect(result.id).toBe('sess_1');
  });

  it('sendInterviewMessage sends POST to /api/v1/interviews/:id/message', async () => {
    const mockResponse = {
      candidateMessage: { id: 'msg_1' },
      aiMessage: { id: 'msg_2' },
      currentStage: 'TECHNICAL_DRILL',
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await sendInterviewMessage('sess_1', 'My technical answer');
    expect(fetch).toHaveBeenCalledWith('/api/v1/interviews/sess_1/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'My technical answer' }),
    });
    expect(result.currentStage).toBe('TECHNICAL_DRILL');
  });

  it('completeInterviewSession sends POST to /api/v1/interviews/:id/complete', async () => {
    const mockResponse = { id: 'sess_1', status: 'COMPLETED', overallScore: 92 };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await completeInterviewSession('sess_1');
    expect(fetch).toHaveBeenCalledWith('/api/v1/interviews/sess_1/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(result.overallScore).toBe(92);
  });

  it('getInterviewSession sends GET to /api/v1/interviews/:id', async () => {
    const mockResponse = { id: 'sess_1' };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await getInterviewSession('sess_1');
    expect(fetch).toHaveBeenCalledWith('/api/v1/interviews/sess_1', {
      cache: 'no-store',
    });
    expect(result.id).toBe('sess_1');
  });

  it('getUserInterviews sends GET with pagination parameters', async () => {
    const mockResponse = { items: [], totalItems: 0, page: 2, pageSize: 5, totalPages: 0 };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await getUserInterviews(2, 5);
    expect(fetch).toHaveBeenCalledWith('/api/v1/interviews?page=2&pageSize=5', {
      cache: 'no-store',
    });
    expect(result.page).toBe(2);
  });
});
