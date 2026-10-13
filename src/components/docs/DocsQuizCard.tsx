'use client';

import React, { useState, useMemo } from 'react';
import type { DocMcq } from '../../lib/docs-catalog';

interface DocsQuizCardProps {
  questions: DocMcq[];
}

export const DocsQuizCard: React.FC<DocsQuizCardProps> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  // Deterministic Fisher-Yates shuffle map per question
  const shuffledQuestions = useMemo(() => {
    return questions.map((q) => {
      // Create options with original indices
      const indexed = q.options.map((text, originalIndex) => ({ text, originalIndex }));
      // Fisher-Yates shuffle using deterministic seed from q.id
      let seed = q.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      for (let i = indexed.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor((seed / 233280) * (i + 1));
        [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
      }
      return {
        ...q,
        shuffledOptions: indexed,
      };
    });
  }, [questions]);

  const handleSelect = (questionId: string, shuffledIdx: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // Answer locked
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: shuffledIdx }));
  };

  if (!questions || questions.length === 0) return null;

  return (
    <section id="sec-quiz" className="my-10 space-y-6">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="text-2xl">🧠</span>
        <div>
          <h3 className="text-lg font-bold text-text tracking-tight">
            Verification MCQ Checkpoint
          </h3>
          <p className="text-xs text-text-muted">
            Calibrated questions testing rigorous understanding of the architectural invariants covered in this guide.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {shuffledQuestions.map((q, qIndex) => {
          const selectedShuffledIdx = selectedAnswers[q.id];
          const isAnswered = selectedShuffledIdx !== undefined;
          const selectedOption = isAnswered ? q.shuffledOptions[selectedShuffledIdx] : null;
          const isCorrect = selectedOption?.originalIndex === q.correctIndex;

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  Q{qIndex + 1}
                </span>
                <h4 className="text-sm font-semibold text-text leading-snug">
                  {q.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2 pl-9">
                {q.shuffledOptions.map((opt, optIdx) => {
                  const letter = String.fromCharCode(65 + optIdx);
                  const isThisSelected = selectedShuffledIdx === optIdx;
                  const isThisCorrect = opt.originalIndex === q.correctIndex;

                  let buttonStyles = 'border-border bg-surface hover:bg-neutral-50 text-text';
                  if (isAnswered) {
                    if (isThisCorrect) {
                      buttonStyles = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                    } else if (isThisSelected && !isThisCorrect) {
                      buttonStyles = 'border-red-500 bg-red-50 text-red-950 line-through';
                    } else {
                      buttonStyles = 'border-border/60 bg-surface-muted text-text-subtle opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      disabled={isAnswered}
                      onClick={() => handleSelect(q.id, optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${buttonStyles} ${
                        !isAnswered ? 'cursor-pointer hover:border-primary-400' : 'cursor-default'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-neutral-200/80 text-neutral-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                        {letter}
                      </span>
                      <span className="leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Socratic Explanation */}
              {isAnswered && (
                <div
                  className={`mt-3 p-4 rounded-xl text-xs space-y-1.5 border ${
                    isCorrect
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <span>{isCorrect ? '✓ Correct Assessment' : '✗ Misconception Detected'}</span>
                  </div>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
