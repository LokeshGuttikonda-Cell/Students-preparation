import React from 'react';
import { Button } from '../ui/Button';

export interface PracticeHeaderProps {
  topicName: string;
  subjectName: string;
  currentIndex: number;
  totalQuestions: number;
  onExit: () => void;
}

export const PracticeHeader: React.FC<PracticeHeaderProps> = ({
  topicName,
  subjectName,
  currentIndex,
  totalQuestions,
  onExit,
}) => {
  const progressPercent =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="w-full bg-[#040711]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-md">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-lime-400 font-mono font-bold uppercase tracking-wider block">
            {subjectName} · Socratic Practice Mode
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white font-display leading-tight">
            {topicName}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block uppercase">Question</span>
            <span className="text-sm font-bold tabular text-white">
              {currentIndex + 1}{' '}
              <span className="text-slate-500 font-normal">/ {totalQuestions}</span>
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 text-xs font-mono"
          >
            Exit
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-900">
        <div
          className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(163,230,53,0.5)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
