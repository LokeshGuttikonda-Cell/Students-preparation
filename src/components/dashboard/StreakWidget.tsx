import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { StreakData } from '../../lib/gamification-client';

interface StreakWidgetProps {
  streak: StreakData | null;
  loading?: boolean;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({
  streak,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card className="border border-border bg-surface">
        <CardContent className="p-6 flex items-center justify-center min-h-[140px]">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-700 border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const current = streak?.currentStreakDays ?? 0;
  const longest = streak?.longestStreakDays ?? 0;
  const activeToday = streak?.streakActiveToday ?? false;

  return (
    <Card
      className={`border transition-all ${
        activeToday
          ? 'border-amber-400/80 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-surface shadow-xs'
          : current > 0
          ? 'border-amber-300 bg-amber-50/20'
          : 'border-border bg-surface'
      }`}
    >
      <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Flame Icon Avatar */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform ${
              activeToday
                ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-md shadow-orange-500/20 scale-105'
                : current > 0
                ? 'bg-amber-100 border border-amber-300'
                : 'bg-surface-muted border border-border text-text-muted'
            }`}
          >
            <span>{current > 0 ? '🔥' : '⚡'}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-2xl font-black tracking-tight text-text">
                {current} {current === 1 ? 'Day' : 'Days'} Streak
              </h3>
              {activeToday ? (
                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <span>✓</span> Active Today
                </span>
              ) : current > 0 ? (
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                  Protect Streak Today!
                </span>
              ) : (
                <span className="text-[11px] font-medium text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
                  Ready to Start
                </span>
              )}
            </div>

            <p className="text-xs text-text-muted">
              {activeToday
                ? 'Great discipline! You have completed questions today. Keep the momentum going.'
                : current > 0
                ? 'Solve at least one practice topic or simulation today to keep your streak alive!'
                : 'Solve daily practice questions or take mock simulations to build your study habit.'}
            </p>

            {longest > 0 && (
              <p className="text-[11px] font-semibold text-text-subtle pt-1">
                Personal Longest Record:{' '}
                <span className="text-text font-bold">{longest} Days</span>
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Link href="/practice">
            <Button
              variant={activeToday ? 'secondary' : 'primary'}
              size="sm"
              className="min-h-[40px] px-5"
            >
              {activeToday ? 'Continue Practice &rarr;' : 'Practice to Extend Streak 🔥'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
