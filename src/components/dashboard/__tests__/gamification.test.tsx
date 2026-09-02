import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StreakWidget } from '../StreakWidget';
import { BadgeShowcase } from '../BadgeShowcase';
import type { StreakData, BadgeItem } from '../../../lib/gamification-client';

describe('Gamification Components', () => {
  describe('StreakWidget', () => {
    it('renders active streak and "Active Today" when student practiced today', () => {
      const activeStreak: StreakData = {
        currentStreakDays: 5,
        longestStreakDays: 8,
        lastActiveDate: '2026-09-02T10:00:00Z',
        streakActiveToday: true,
      };

      render(<StreakWidget streak={activeStreak} />);

      expect(screen.getByText('5 Days Streak')).toBeDefined();
      expect(screen.getByText('Active Today')).toBeDefined();
      expect(screen.getByText('8 Days')).toBeDefined();
      expect(
        screen.getByRole('button', { name: /Continue Practice/i }),
      ).toBeDefined();
    });

    it('displays prompt to protect streak when not yet practiced today', () => {
      const pendingStreak: StreakData = {
        currentStreakDays: 3,
        longestStreakDays: 5,
        lastActiveDate: '2026-09-01T15:00:00Z',
        streakActiveToday: false,
      };

      render(<StreakWidget streak={pendingStreak} />);

      expect(screen.getByText('3 Days Streak')).toBeDefined();
      expect(screen.getByText('Protect Streak Today!')).toBeDefined();
      expect(
        screen.getByRole('button', { name: /Practice to Extend Streak/i }),
      ).toBeDefined();
    });
  });

  describe('BadgeShowcase', () => {
    const mockBadges: BadgeItem[] = [
      {
        code: 'STREAK_3_DAYS',
        name: '3-Day Consistency',
        description: 'Practiced consecutively for 3 days.',
        category: 'STREAK',
        icon: '🔥',
        isUnlocked: true,
        unlockedAt: '2026-09-01T12:00:00Z',
      },
      {
        code: 'SQL_OPTIMIZER',
        name: 'SQL Query Optimizer',
        description: 'Achieved 75%+ accuracy in Database Systems & SQL.',
        category: 'COMPETENCY',
        icon: '💾',
        isUnlocked: false,
        unlockedAt: null,
      },
    ];

    it('renders badge count, unlocked status and earned date', () => {
      render(<BadgeShowcase badges={mockBadges} />);

      expect(screen.getByText('Placement Readiness Badges')).toBeDefined();
      expect(screen.getByText('1/2 Unlocked (50%)')).toBeDefined();
      expect(screen.getByText('3-Day Consistency')).toBeDefined();
      expect(screen.getByText(/Earned Sep 1, 2026/)).toBeDefined();
      expect(screen.getByText('SQL Query Optimizer')).toBeDefined();
      expect(screen.getByText('Requirement pending')).toBeDefined();
    });

    it('filters badges when clicking category chips', async () => {
      const user = userEvent.setup();
      render(<BadgeShowcase badges={mockBadges} />);

      const habitsBtn = screen.getByRole('button', { name: 'Study Habits' });
      await user.click(habitsBtn);

      expect(screen.getByText('3-Day Consistency')).toBeDefined();
      expect(screen.queryByText('SQL Query Optimizer')).toBeNull();
    });
  });
});
