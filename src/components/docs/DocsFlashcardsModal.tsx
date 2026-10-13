'use client';

import React, { useState, useEffect, useMemo, useId, useCallback } from 'react';
import { DOC_TRACKS } from '../../lib/docs-catalog';
import { Button } from '../ui/Button';

interface FlashcardItem {
  id: string;
  topicId: string;
  topicTitle: string;
  trackTitle: string;
  trackIcon: string;
  category: 'PROGRAMMING_LANGUAGE' | 'CS_SPECIALIZATION';
  cardType: 'INVARIANT' | 'GOTCHA';
  prompt: string;
  solution: string;
  counterMeasure?: string;
  misconception?: string;
}

interface DocsFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopicId?: string;
}

export const DocsFlashcardsModal: React.FC<DocsFlashcardsModalProps> = ({
  isOpen,
  onClose,
  initialTopicId,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PROGRAMMING_LANGUAGE' | 'CS_SPECIALIZATION'>('ALL');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [reviewStats, setReviewStats] = useState<Record<string, number>>({});
  const titleId = useId();

  // Load reviews from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('studentsprep_flashcard_reviews');
      if (stored) {
        setReviewStats(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Aggregate flashcards across all tracks and topics
  const allCards = useMemo<FlashcardItem[]>(() => {
    const list: FlashcardItem[] = [];

    for (const track of DOC_TRACKS) {
      for (const mod of track.modules) {
        for (const topic of mod.topics) {
          // Card 1: Core Architectural Invariant
          if (topic.invariants && topic.invariants.length > 0) {
            list.push({
              id: `card-inv-${topic.id}`,
              topicId: topic.id,
              topicTitle: topic.title,
              trackTitle: track.title,
              trackIcon: track.icon,
              category: track.category,
              cardType: 'INVARIANT',
              prompt: `What are the fundamental architectural correctness invariants and system guarantees for ${topic.title}?`,
              solution: topic.invariants.map((inv, i) => `${i + 1}. ${inv}`).join('\n\n'),
            });
          }

          // Card 2+: Interviewer Gotchas
          if (topic.interviewerGotchas && topic.interviewerGotchas.length > 0) {
            topic.interviewerGotchas.forEach((g, gIdx) => {
              list.push({
                id: `card-gotcha-${topic.id}-${gIdx}`,
                topicId: topic.id,
                topicTitle: topic.title,
                trackTitle: track.title,
                trackIcon: track.icon,
                category: track.category,
                cardType: 'GOTCHA',
                prompt: `Interviewer Trap: "${g.trap}"`,
                solution: g.counterMeasure,
                misconception: g.misconception,
                counterMeasure: g.counterMeasure,
              });
            });
          }
        }
      }
    }
    return list;
  }, []);

  // Filter cards
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      if (selectedFilter === 'ALL') return true;
      return card.category === selectedFilter;
    });
  }, [allCards, selectedFilter]);

  // Jump to initial topic if requested
  useEffect(() => {
    if (initialTopicId) {
      const foundIdx = filteredCards.findIndex((c) => c.topicId === initialTopicId);
      if (foundIdx >= 0) {
        setCurrentIndex(foundIdx);
        setIsFlipped(false);
      }
    }
  }, [initialTopicId, filteredCards]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, filteredCards.length));
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % Math.max(1, filteredCards.length));
  }, [filteredCards.length]);

  // Handle ESC and Arrow Keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  const handleRate = (rating: 1 | 2 | 3 | 4) => {
    const card = filteredCards[currentIndex];
    if (!card) return;

    const updated = {
      ...reviewStats,
      [card.id]: rating,
    };
    setReviewStats(updated);
    try {
      localStorage.setItem('studentsprep_flashcard_reviews', JSON.stringify(updated));
    } catch {
      // ignore
    }
    handleNext();
  };

  if (!isOpen) return null;

  const currentCard = filteredCards[currentIndex];
  const masteredCount = Object.values(reviewStats).filter((score) => score >= 3).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" aria-hidden="true">🎴</span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-white tracking-tight">
                Architectural Invariants &amp; Gotchas Flashcards
              </h2>
              <p className="text-xs text-slate-400">
                Spaced-repetition active recall for senior systems engineering interview prep
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close flashcards modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar & Progress */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-950/50 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                setSelectedFilter('ALL');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-cyan-900/60 border border-cyan-400 text-cyan-200 font-bold'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Cards ({allCards.length})
            </button>
            <button
              onClick={() => {
                setSelectedFilter('PROGRAMMING_LANGUAGE');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'PROGRAMMING_LANGUAGE'
                  ? 'bg-cyan-900/60 border border-cyan-400 text-cyan-200 font-bold'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Languages
            </button>
            <button
              onClick={() => {
                setSelectedFilter('CS_SPECIALIZATION');
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedFilter === 'CS_SPECIALIZATION'
                  ? 'bg-cyan-900/60 border border-cyan-400 text-cyan-200 font-bold'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              CS Specializations
            </button>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <span>
              Mastered: <strong className="text-emerald-400 font-mono">{masteredCount}</strong>
            </span>
            <span>
              Card <strong className="text-cyan-400 font-mono">{currentIndex + 1}</strong> of{' '}
              <strong className="font-mono">{filteredCards.length}</strong>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 flex-1 flex flex-col justify-center items-center">
          {currentCard ? (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-xl min-h-[300px] p-8 rounded-2xl border bg-slate-950/80 border-slate-700/80 hover:border-cyan-500/80 transition-all shadow-xl flex flex-col justify-between cursor-pointer group"
            >
              {/* Card Meta Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{currentCard.trackIcon}</span>
                  <span className="text-xs font-semibold text-slate-400">{currentCard.trackTitle}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    currentCard.cardType === 'INVARIANT'
                      ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                      : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                  }`}
                >
                  {currentCard.cardType === 'INVARIANT' ? 'CORE INVARIANT' : 'INTERVIEWER GOTCHA'}
                </span>
              </div>

              {/* Card Content (Flip state) */}
              <div className="my-6">
                {!isFlipped ? (
                  <div className="space-y-4 text-center">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      {currentCard.topicTitle}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                      {currentCard.prompt}
                    </h3>
                    <p className="text-xs text-slate-400 italic">
                      (Click or press Space to reveal architectural answer)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                      Architectural Invariant / Solution
                    </div>
                    {currentCard.misconception && (
                      <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-200 text-xs">
                        <strong>Common Misconception:</strong> {currentCard.misconception}
                      </div>
                    )}
                    <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                      {currentCard.solution}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Meta Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                <span>{isFlipped ? 'Click to flip back' : 'Press Space to flip'}</span>
                <span className="font-mono text-cyan-400">
                  {reviewStats[currentCard.id] ? `Rating: ${reviewStats[currentCard.id]}/4` : 'Unrated'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">No flashcards found for this category.</div>
          )}

          {/* Rating Buttons (Visible when flipped) */}
          {isFlipped && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <button
                onClick={() => handleRate(1)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-950/80 border border-rose-700 text-rose-200 hover:bg-rose-900 text-xs font-bold transition-colors cursor-pointer"
              >
                🔄 Again (1)
              </button>
              <button
                onClick={() => handleRate(2)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-950/80 border border-amber-700 text-amber-200 hover:bg-amber-900 text-xs font-bold transition-colors cursor-pointer"
              >
                ⚠️ Hard (2)
              </button>
              <button
                onClick={() => handleRate(3)}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700 text-cyan-200 hover:bg-cyan-900 text-xs font-bold transition-colors cursor-pointer"
              >
                👍 Good (3)
              </button>
              <button
                onClick={() => handleRate(4)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-200 hover:bg-emerald-900 text-xs font-bold transition-colors cursor-pointer"
              >
                ⚡ Easy (4)
              </button>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" onClick={handlePrev} className="text-xs cursor-pointer">
              ← Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={handleNext} className="text-xs cursor-pointer">
              Next →
            </Button>
          </div>
          <Button variant="primary" size="sm" onClick={onClose} className="text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
