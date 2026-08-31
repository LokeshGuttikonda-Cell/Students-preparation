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
    <div className="w-full bg-surface border-b border-border sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
            {subjectName} · Practice Mode
          </span>
          <h2 className="text-lg font-bold text-primary-900 leading-tight">
            {topicName}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-text-muted block">Question</span>
            <span className="text-sm font-semibold tabular text-primary-900">
              {currentIndex + 1}{' '}
              <span className="text-text-muted font-normal">/ {totalQuestions}</span>
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="text-text-muted hover:text-error-700 hover:bg-error-50 text-xs"
          >
            Exit
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-neutral-100">
        <div
          className="h-full bg-primary-700 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
