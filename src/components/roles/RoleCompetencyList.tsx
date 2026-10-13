import React from 'react';
import Link from 'next/link';
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
        <h3 className="text-lg font-display font-bold text-white">
          Evaluated Syllabus Competencies
        </h3>
        <span className="text-xs font-mono text-slate-400">
          {competencies.length} Topics Weighted
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competencies.map((c) => (
          <div key={c.id} className="bento-tile p-5 space-y-4 border-white/10">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block">
                  {c.subjectName}
                </span>
                <h4 className="text-base font-display font-bold text-white mt-0.5">
                  {c.topicName}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-lime-400 bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded shrink-0">
                {c.weightPercentage}% Weight
              </span>
            </div>

            <div className="space-y-1.5 font-mono">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Target Benchmark Cutoff</span>
                <span className="font-semibold text-white">{c.benchmarkAccuracy}% Accuracy</span>
              </div>
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-lime-400 rounded-full transition-all duration-300"
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
                  className="w-full text-xs font-mono font-semibold text-lime-400 hover:text-white hover:bg-lime-400/10 min-h-[44px] touch-manipulation border border-lime-400/30"
                >
                  Practice This Topic &rarr;
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
