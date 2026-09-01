'use client';

import React from 'react';

export interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  questions: Array<{ id: string }>;
  answers: Map<
    string,
    { selectedOptionId: string | null; isMarkedForReview: boolean }
  >;
  onSelectQuestion: (index: number) => void;
  className?: string;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  questions,
  answers,
  onSelectQuestion,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text uppercase tracking-wider">
          Question Palette
        </h3>
        <span className="text-xs text-text-muted">
          {totalQuestions} Total
        </span>
      </div>

      {/* 5-State Question Grid */}
      <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
        {questions.map((q, idx) => {
          const ans = answers.get(q.id);
          const isAnswered = Boolean(ans && ans.selectedOptionId);
          const isMarked = Boolean(ans && ans.isMarkedForReview);
          const isCurrent = idx === currentIndex;

          let stateClasses = 'bg-surface border-border text-text hover:border-primary-700';

          if (isAnswered && isMarked) {
            stateClasses = 'bg-primary-700 text-white font-semibold ring-2 ring-review border-primary-700';
          } else if (isAnswered) {
            stateClasses = 'bg-primary-700 text-white font-semibold border-primary-700';
          } else if (isMarked) {
            stateClasses = 'bg-surface text-text ring-2 ring-review border-border font-medium';
          }

          const currentRing = isCurrent ? 'ring-2 ring-focus ring-offset-2' : '';

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={`min-h-[44px] sm:min-h-[38px] w-full rounded border flex items-center justify-center text-xs font-semibold tabular touch-manipulation transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 ${stateClasses} ${currentRing}`}
              aria-label={`Question ${idx + 1}: ${
                isAnswered && isMarked
                  ? 'Answered and Marked for Review'
                  : isAnswered
                  ? 'Answered'
                  : isMarked
                  ? 'Marked for Review'
                  : 'Unanswered'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Palette Legend */}
      <div className="border-t border-border pt-3 space-y-2 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-primary-700" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-surface border border-border" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-surface border border-border ring-2 ring-review" />
          <span>Marked for review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-primary-700 ring-2 ring-review" />
          <span>Answered & marked</span>
        </div>
      </div>
    </div>
  );
};
