'use client';

import React from 'react';

export interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  questions: Array<{ id: string; sectionId?: string | null }>;
  sections?: Array<{ id: string; title: string }>;
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
  sections,
  answers,
  onSelectQuestion,
  className = '',
}) => {
  const hasMultipleSections = sections && sections.length > 1;

  const renderQuestionButton = (q: { id: string }, idx: number) => {
    const ans = answers.get(q.id);
    const isAnswered = Boolean(ans && ans.selectedOptionId);
    const isMarked = Boolean(ans && ans.isMarkedForReview);
    const isCurrent = idx === currentIndex;

    let stateClasses = 'bg-slate-900/80 border-white/10 text-slate-400 hover:border-lime-400/40 hover:text-white';

    if (isAnswered && isMarked) {
      stateClasses =
        'bg-lime-400 text-slate-950 font-black ring-2 ring-review border-lime-400 shadow-sm shadow-lime-400/30';
    } else if (isAnswered) {
      stateClasses =
        'bg-lime-400 text-slate-950 font-black border-lime-400 shadow-sm shadow-lime-400/30';
    } else if (isMarked) {
      stateClasses =
        'bg-purple-950/60 text-purple-300 ring-2 ring-review border-purple-500/50 font-bold';
    }

    const currentRing = isCurrent ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#040711]' : '';

    return (
      <button
        key={q.id}
        type="button"
        onClick={() => onSelectQuestion(idx)}
        className={`min-h-[44px] sm:min-h-[38px] w-full rounded-xl border flex items-center justify-center text-xs font-mono font-bold tabular touch-manipulation transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ${stateClasses} ${currentRing}`}
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
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
          Question Palette
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          {totalQuestions} Total
        </span>
      </div>

      {hasMultipleSections ? (
        <div className="space-y-4 max-h-72 overflow-y-auto p-1 font-mono">
          {sections.map((sec) => {
            const secQuestions = questions
              .map((q, idx) => ({ q, idx }))
              .filter(({ q }) => q.sectionId === sec.id);

            if (secQuestions.length === 0) return null;

            return (
              <div key={sec.id} className="space-y-1.5">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider border-b border-white/10 pb-1">
                  {sec.title}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {secQuestions.map(({ q, idx }) => renderQuestionButton(q, idx))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat 5-State Question Grid */
        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1 font-mono">
          {questions.map((q, idx) => renderQuestionButton(q, idx))}
        </div>
      )}

      {/* Palette Legend */}
      <div className="border-t border-white/10 pt-3 space-y-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-lime-400 border border-lime-400" />
          <span className="text-slate-300">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-white/10" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-purple-950/60 border border-purple-500/50 ring-2 ring-review" />
          <span className="text-purple-300">Marked for review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded bg-lime-400 ring-2 ring-review" />
          <span className="text-lime-300">Answered &amp; marked</span>
        </div>
      </div>
    </div>
  );
};
