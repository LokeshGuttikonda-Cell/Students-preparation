import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUserStreak, fetchUserBadges, DEFAULT_STREAK_DATA } from '../gamification-client';

describe('gamification-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchUserStreak', () => {
    it('returns streak data on successful response', async () => {
      const mockData = {
        currentStreakDays: 5,
        longestStreakDays: 12,
        lastActiveDate: '2026-09-16T12:00:00Z',
        streakActiveToday: true,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const result = await fetchUserStreak();
      expect(result).toEqual(mockData);
    });

    it('returns default streak data when fetch response is not ok', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await fetchUserStreak();
      expect(result).toEqual(DEFAULT_STREAK_DATA);
      expect(result.currentStreakDays).toBe(0);
    });

    it('returns default streak data when network error throws', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network connection failed'));

      const result = await fetchUserStreak();
      expect(result).toEqual(DEFAULT_STREAK_DATA);
    });
  });

  describe('fetchUserBadges', () => {
    it('returns badge list on successful response', async () => {
      const mockBadges = [
        {
          code: 'streak-7',
          name: '7-Day Scholar',
          description: 'Maintained a 7-day practice streak',
          category: 'STREAK' as const,
          icon: '🔥',
          isUnlocked: true,
          unlockedAt: '2026-09-15T10:00:00Z',
        },
      ];

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockBadges,
      } as Response);

      const result = await fetchUserBadges();
      expect(result).toEqual(mockBadges);
      expect(result).toHaveLength(1);
    });

    it('returns empty array on non-ok response', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const result = await fetchUserBadges();
      expect(result).toEqual([]);
    });

    it('returns empty array on network rejection', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Offline'));

      const result = await fetchUserBadges();
      expect(result).toEqual([]);
    });
  });
});
