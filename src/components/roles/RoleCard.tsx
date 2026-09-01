import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { RoleTrackItem } from '../../lib/roles-client';

interface RoleCardProps {
  role: RoleTrackItem;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role }) => {
  const formatLevel = (level: string) => {
    switch (level) {
      case 'ENTRY_LEVEL':
        return 'Entry Level / Campus';
      case 'MID_LEVEL':
        return 'Mid Level (1-3 Yrs)';
      case 'SPECIALIST':
        return 'Specialist';
      default:
        return level;
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between hover:border-primary-700/50 hover:shadow-md transition-all">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider bg-primary-50 text-primary-800 px-2.5 py-0.5 rounded border border-primary-200 inline-block mb-1.5">
              {formatLevel(role.targetLevel)}
            </span>
            <h3 className="text-xl font-bold text-primary-900 leading-snug">
              {role.name}
            </h3>
          </div>
          <span className="text-xs font-medium text-text-muted bg-surface-muted px-2 py-1 rounded border border-border shrink-0">
            {role.mockTestsCount} {role.mockTestsCount === 1 ? 'Mock Test' : 'Mock Tests'}
          </span>
        </div>

        {role.description && (
          <p className="text-sm text-text-muted line-clamp-3 leading-relaxed">
            {role.description}
          </p>
        )}

        <div className="space-y-2 pt-2 border-t border-border/60">
          <p className="text-xs font-semibold text-text-subtle uppercase tracking-wider">
            Key Competencies & Weightage
          </p>
          <div className="flex flex-wrap gap-1.5">
            {role.competencies.map((comp) => (
              <span
                key={comp.id}
                className="text-xs bg-canvas-subtle text-text px-2 py-1 rounded border border-border/80 flex items-center gap-1"
              >
                <span>{comp.topicName}</span>
                <span className="text-text-muted font-semibold">
                  {comp.weightPercentage}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </CardContent>

      <div className="p-6 pt-0">
        <Link href={`/roles/${role.slug}`} className="block w-full">
          <Button variant="secondary" className="w-full min-h-[44px] touch-manipulation">
            Explore Role Track &rarr;
          </Button>
        </Link>
      </div>
    </Card>
  );
};
