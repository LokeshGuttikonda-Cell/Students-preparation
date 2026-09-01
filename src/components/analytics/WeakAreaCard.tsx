'use client';

import React from 'react';
import Link from 'next/link';
import type { WeakAreaItem } from '../../lib/analytics-client';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface WeakAreaCardProps {
  item: WeakAreaItem;
}

export const WeakAreaCard: React.FC<WeakAreaCardProps> = ({ item }) => {
  const isUrgent = item.accuracy < 40;
  const isWarning = item.accuracy >= 40 && item.accuracy < 60;

  const barColor = isUrgent
    ? 'bg-error-600'
    : isWarning
    ? 'bg-warning-500'
    : 'bg-success-600';

  const badgeColor = isUrgent
    ? 'bg-error-50 text-error-700 border-error-500/30'
    : isWarning
    ? 'bg-warning-50 text-warning-800 border-warning-300'
    : 'bg-success-50 text-success-700 border-success-500/30';

  return (
    <Card className="hover:border-primary-700/50 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted bg-canvas px-2 py-0.5 rounded border border-border">
            {item.subjectName}
          </span>
          <span
            className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${badgeColor}`}
          >
            {item.needsRevision ? 'Needs Revision' : 'Proficient'}
          </span>
        </div>

        <div>
          <h4 className="text-base font-bold text-text truncate">
            {item.topicName}
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            {item.correctCount} of {item.totalAttempted} correct ({item.incorrectCount} incorrect)
          </p>
        </div>

        {/* Accuracy Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted font-medium">Topic Accuracy</span>
            <span className="font-bold tabular text-text">{item.accuracy}%</span>
          </div>
          <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-border">
            <div
              className={`h-full ${barColor} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.max(4, Math.min(100, item.accuracy))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Link href={`/practice/${item.topicId}`}>
          <Button variant="secondary" size="sm" className="w-full">
            Practice Topic →
          </Button>
        </Link>
      </div>
    </Card>
  );
};
