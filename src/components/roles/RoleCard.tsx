import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    <div className="bento-tile h-full flex flex-col justify-between hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-400/5 transition-all p-6 border-white/10 group">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-lime-400/10 text-lime-400 px-2.5 py-0.5 rounded border border-lime-400/20 inline-block mb-1.5">
              {formatLevel(role.targetLevel)}
            </span>
            <h3 className="text-xl font-display font-bold text-white leading-snug group-hover:text-lime-300 transition-colors">
              {role.name}
            </h3>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 bg-white/5 px-2 py-1 rounded border border-white/10 shrink-0">
            {role.mockTestsCount} {role.mockTestsCount === 1 ? 'Mock Test' : 'Mock Tests'}
          </span>
        </div>

        {role.description && (
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed font-sans">
            {role.description}
          </p>
        )}

        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider">
            Key Competencies &amp; Weightage
          </p>
          <div className="flex flex-wrap gap-1.5">
            {role.competencies.map((comp) => (
              <span
                key={comp.id}
                className="text-xs font-mono bg-white/5 text-slate-300 px-2 py-1 rounded border border-white/10 flex items-center gap-1"
              >
                <span>{comp.topicName}</span>
                <span className="text-lime-400 font-bold">
                  {comp.weightPercentage}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Link href={`/roles/${role.slug}`} className="block w-full">
          <button
            type="button"
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl font-bold font-mono text-xs sm:text-sm text-slate-950 bg-lime-400 hover:bg-lime-300 active:scale-[0.99] shadow-md shadow-lime-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Role Track</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
          </button>
        </Link>
      </div>
    </div>
  );
};
