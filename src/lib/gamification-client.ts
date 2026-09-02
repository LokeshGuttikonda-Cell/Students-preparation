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

export async function fetchUserStreak(): Promise<StreakData> {
  const res = await fetch('/api/v1/gamification/streak', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user streak');
  }

  return (await res.json()) as StreakData;
}

export async function fetchUserBadges(): Promise<BadgeItem[]> {
  const res = await fetch('/api/v1/gamification/badges', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user badges');
  }

  return (await res.json()) as BadgeItem[];
}
