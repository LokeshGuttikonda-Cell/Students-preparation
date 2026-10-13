export interface StreakData {
  currentStreakDays: number;
  longestStreakDays: number;
  lastActiveDate: string | null;
  streakActiveToday: boolean;
}

export interface BadgeItem {
  code: string;
  name: string;
  description: string;
  category: 'STREAK' | 'COMPETENCY' | 'ASSESSMENT' | 'PATHWAY';
  icon: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

import { apiUrl } from './env';

export const DEFAULT_STREAK_DATA: StreakData = {
  currentStreakDays: 0,
  longestStreakDays: 0,
  lastActiveDate: null,
  streakActiveToday: false,
};

export async function fetchUserStreak(): Promise<StreakData> {
  try {
    const res = await fetch(apiUrl('gamification/streak'), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as StreakData;
    }
  } catch {
    // Graceful offline fallback
  }

  return DEFAULT_STREAK_DATA;
}

export async function fetchUserBadges(): Promise<BadgeItem[]> {
  try {
    const res = await fetch(apiUrl('gamification/badges'), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as BadgeItem[];
    }
  } catch {
    // Graceful offline fallback
  }

  return [];
}

