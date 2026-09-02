import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import type { BadgeItem } from '../../lib/gamification-client';

interface BadgeShowcaseProps {
  badges: BadgeItem[];
  loading?: boolean;
}

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({
  badges,
  loading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (loading) {
    return (
      <Card className="border border-border bg-surface">
        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary-700 border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const totalCount = badges.length;
  const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredBadges = badges.filter((b) => {
    if (selectedCategory === 'ALL') return true;
    return b.category === selectedCategory;
  });

  const formatCategory = (cat: string) => {
    switch (cat) {
      case 'STREAK':
        return 'Study Habits';
      case 'COMPETENCY':
        return 'Core Skills';
      case 'ASSESSMENT':
        return 'Assessments';
      case 'PATHWAY':
        return 'Curricula';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold tracking-tight text-primary-900">
              Placement Readiness Badges
            </h3>
            <span className="text-xs font-bold uppercase tracking-wider bg-accent-50 text-accent-800 px-2.5 py-0.5 rounded-full border border-accent-200">
              {unlockedCount}/{totalCount} Unlocked ({pct}%)
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Earn verifiable badges by maintaining preparation streaks and demonstrating competency accuracy.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'STREAK', 'COMPETENCY', 'ASSESSMENT', 'PATHWAY'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-700 text-white font-medium'
                  : 'bg-surface-muted text-text-muted hover:text-text border border-border'
              }`}
            >
              {cat === 'ALL' ? 'All Badges' : formatCategory(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBadges.map((badge) => {
          const formattedDate = badge.unlockedAt
            ? new Date(badge.unlockedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : null;

          return (
            <Card
              key={badge.code}
              className={`h-full border transition-all ${
                badge.isUnlocked
                  ? 'border-amber-300 bg-gradient-to-b from-amber-50/40 to-surface shadow-xs'
                  : 'border-border/80 bg-surface/50 opacity-75'
              }`}
            >
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                        badge.isUnlocked
                          ? 'bg-amber-100 border border-amber-300 shadow-xs'
                          : 'bg-canvas-subtle border border-border grayscale text-text-subtle'
                      }`}
                    >
                      <span>{badge.icon}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        badge.isUnlocked
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-surface-muted text-text-subtle border-border'
                      }`}
                    >
                      {badge.isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>

                  <div>
                    <h4
                      className={`text-sm font-bold leading-snug ${
                        badge.isUnlocked ? 'text-text' : 'text-text-muted'
                      }`}
                    >
                      {badge.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-accent-700 uppercase tracking-wider">
                      {formatCategory(badge.category)}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 text-[11px]">
                  {badge.isUnlocked ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <span>✓</span> Earned {formattedDate}
                    </span>
                  ) : (
                    <span className="text-text-subtle flex items-center gap-1">
                      <span>🔒</span> Requirement pending
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
