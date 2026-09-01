import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { RoleCompetency } from '../../lib/roles-client';

interface RoleCompetencyListProps {
  competencies: RoleCompetency[];
}

export const RoleCompetencyList: React.FC<RoleCompetencyListProps> = ({
  competencies,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-primary-900">
          Evaluated Syllabus Competencies
        </h3>
        <span className="text-xs text-text-muted">
          {competencies.length} Topics Weighted
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competencies.map((c) => (
          <Card key={c.id} className="border border-border bg-surface">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-medium text-text-subtle uppercase tracking-wider block">
                    {c.subjectName}
                  </span>
                  <h4 className="text-base font-bold text-text mt-0.5">
                    {c.topicName}
                  </h4>
                </div>
                <span className="text-xs font-bold text-primary-800 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded shrink-0">
                  {c.weightPercentage}% Weight
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Target Benchmark Cutoff</span>
                  <span className="font-semibold text-text">{c.benchmarkAccuracy}% Accuracy</span>
                </div>
                <div className="w-full h-2 bg-canvas-subtle rounded-full overflow-hidden border border-border/50">
                  <div
                    className="h-full bg-primary-700 rounded-full transition-all duration-300"
                    style={{ width: `${c.benchmarkAccuracy}%` }}
                    aria-label={`${c.topicName} benchmark cutoff ${c.benchmarkAccuracy}%`}
                  />
                </div>
              </div>

              <div className="pt-1">
                <Link href={`/practice/${c.topicId}`} className="block w-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-semibold text-primary-700 hover:bg-primary-50 min-h-[44px] touch-manipulation border border-primary-200/60"
                  >
                    Practice This Topic &rarr;
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
