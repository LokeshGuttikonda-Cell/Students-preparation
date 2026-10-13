'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { RoleHandbook } from '../../lib/role-handbooks-data';
import { Button } from '../ui/Button';

export type FlashcardType = 'ALL' | 'INVARIANT' | 'TRAP' | 'QUESTION';
export type FlashcardConfidence = 'HARD' | 'GOOD' | 'EASY';

export interface FlashcardItem {
  id: string;
  type: 'INVARIANT' | 'TRAP' | 'QUESTION';
  title: string;
  category: string;
  badge: string;
  difficultyOrTier?: string;
  prompt: string;
  answer: {
    heading: string;
    body: string;
    bullets?: string[];
    secondaryBullets?: { title: string; items: string[] };
    note?: string;
  };
}

export interface RoleInterviewFlashcardsModalProps {
  role: RoleHandbook;
  isOpen: boolean;
  onClose: () => void;
  initialFilter?: FlashcardType;
}

export function extractFlashcardsFromRole(role: RoleHandbook): FlashcardItem[] {
  const cards: FlashcardItem[] = [];

  // 1. Competency Invariants from Syllabus Tiers
  (role.syllabus || []).forEach((tier) => {
    (tier.competencies || []).forEach((comp, idx) => {
      cards.push({
        id: `inv-${tier.tier.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
        type: 'INVARIANT',
        title: comp.topic,
        category: `${tier.title} (${tier.tier})`,
        badge: 'Architectural Invariant',
        difficultyOrTier: tier.tier,
        prompt: `What are the core engineering invariants, target passing accuracy, and weighting for "${comp.topic}"?`,
        answer: {
          heading: `Cutoff Accuracy: ${comp.benchmarkAccuracy}% · Curriculum Weight: ${comp.weightPercentage}%`,
          body: `Production implementations require adherence to the following verified invariants:`,
          bullets: comp.coreInvariants,
        },
      });
    });
  });

  // 2. Recruiter Traps & Anti-Patterns
  (role.interviewTraps || []).forEach((trap, idx) => {
    cards.push({
      id: `trap-${idx}`,
      type: 'TRAP',
      title: trap.title,
      category: `${role.name} Anti-Pattern`,
      badge: `Recruiter Trap (${trap.dangerLevel})`,
      difficultyOrTier: trap.dangerLevel,
      prompt: `Identify the disqualifying candidate anti-pattern for "${trap.title}" and explain the senior recovery invariant.`,
      answer: {
        heading: 'Correct Senior Architectural Approach:',
        body: trap.correctApproach,
        secondaryBullets: {
          title: 'Disqualifying Anti-Pattern Pitfall',
          items: [trap.antiPattern],
        },
        note: `Interview Context: ${trap.interviewContext}`,
      },
    });
  });

  // 3. Technical Interview Scenario Questions
  (role.questions || []).forEach((q, idx) => {
    cards.push({
      id: `q-${q.id || idx}`,
      type: 'QUESTION',
      title: q.title,
      category: q.category,
      badge: `Scenario (${q.difficulty})`,
      difficultyOrTier: q.difficulty,
      prompt: q.questionText,
      answer: {
        heading: 'Model Architectural Solution:',
        body: q.modelAnswer,
        bullets:
          q.counterQuestions.length > 0
            ? q.counterQuestions.map((cq) => `Counter-Probe: ${cq}`)
            : undefined,
        secondaryBullets:
          q.criticalPitfalls.length > 0
            ? { title: 'Candidate Rejection Pitfalls', items: q.criticalPitfalls }
            : undefined,
      },
    });
  });

  return cards;
}

export function RoleInterviewFlashcardsModal({
  role,
  isOpen,
  onClose,
  initialFilter = 'ALL',
}: RoleInterviewFlashcardsModalProps) {
  // Raw cards extracted from role
  const allCards = useMemo(() => extractFlashcardsFromRole(role), [role]);

  // Filtering state
  const [filterType, setFilterType] = useState<FlashcardType>(initialFilter);
  const [shuffledDeck, setShuffledDeck] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Confidence ratings stored in localStorage
  const storageKey = `studentsprep_role_flashcards_${role.slug}`;
  const [ratings, setRatings] = useState<Record<string, FlashcardConfidence>>({});

  // Load ratings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setRatings(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Rebuild deck when filterType or role changes
  useEffect(() => {
    const filtered =
      filterType === 'ALL'
        ? allCards
        : allCards.filter((card) => card.type === filterType);
    setShuffledDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [allCards, filterType]);

  // Reset card state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsFlipped(false);
      setCurrentIndex(0);
    }
  }, [isOpen]);

  const currentCard: FlashcardItem | undefined = shuffledDeck[currentIndex];
  const currentRating = currentCard ? ratings[currentCard.id] : undefined;

  // Rate card and advance
  const handleRateCard = useCallback(
    (confidence: FlashcardConfidence) => {
      if (!currentCard) return;

      const updated = { ...ratings, [currentCard.id]: confidence };
      setRatings(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // ignore
      }

      // Auto-advance to next card if not at end
      if (currentIndex < shuffledDeck.length - 1) {
        setIsFlipped(false);
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [currentCard, currentIndex, ratings, shuffledDeck.length, storageKey],
  );

  const handleNext = useCallback(() => {
    if (currentIndex < shuffledDeck.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, shuffledDeck.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleShuffle = () => {
    const copy = [...shuffledDeck];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setShuffledDeck(copy);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleResetRatings = () => {
    setRatings({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

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
        handlePrevious();
      } else if (e.key === '1') {
        e.preventDefault();
        handleRateCard('HARD');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRateCard('GOOD');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRateCard('EASY');
      }
    },
    [handleNext, handlePrevious, handleRateCard, isOpen, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Deck statistics
  const stats = useMemo(() => {
    let easyCount = 0;
    let goodCount = 0;
    let hardCount = 0;

    shuffledDeck.forEach((card) => {
      const r = ratings[card.id];
      if (r === 'EASY') easyCount++;
      else if (r === 'GOOD') goodCount++;
      else if (r === 'HARD') hardCount++;
    });

    const total = shuffledDeck.length;
    const answered = easyCount + goodCount + hardCount;
    const percentMastered = total > 0 ? Math.round((easyCount / total) * 100) : 0;

    return { easyCount, goodCount, hardCount, total, answered, percentMastered };
  }, [ratings, shuffledDeck]);

  if (!isOpen || !currentCard) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Role Technical Interview Flashcards"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-surface border border-border rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 border-b border-border bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 text-white flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-neutral-950 px-2 py-0.5 rounded font-mono shadow-xs">
                ⚡ Rapid-Fire Flashcards
              </span>
              <span className="text-xs text-primary-200 font-medium hidden sm:inline">
                {role.name}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Card {currentIndex + 1} of {shuffledDeck.length}: {currentCard.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Reset Progress Button */}
            <button
              type="button"
              onClick={handleResetRatings}
              className="text-[11px] font-medium text-primary-300 hover:text-white px-2 py-1 rounded bg-white/10 hover:bg-white/15 transition-colors"
              title="Clear flashcard ratings for this role"
            >
              Reset Ratings
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-primary-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close flashcards modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Stats Bar */}
        <div className="px-4 py-3 bg-surface-muted border-b border-border space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { type: 'ALL' as FlashcardType, label: `All (${allCards.length})` },
                {
                  type: 'INVARIANT' as FlashcardType,
                  label: `Invariants (${allCards.filter((c) => c.type === 'INVARIANT').length})`,
                },
                {
                  type: 'TRAP' as FlashcardType,
                  label: `Traps (${allCards.filter((c) => c.type === 'TRAP').length})`,
                },
                {
                  type: 'QUESTION' as FlashcardType,
                  label: `Scenarios (${allCards.filter((c) => c.type === 'QUESTION').length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setFilterType(tab.type)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filterType === tab.type
                      ? 'bg-primary-900 text-white shadow-xs'
                      : 'bg-surface border border-border text-text-muted hover:text-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Deck Action: Shuffle */}
            <button
              type="button"
              onClick={handleShuffle}
              className="text-xs font-medium text-text-muted hover:text-text bg-surface px-2.5 py-1 rounded-lg border border-border hover:bg-surface-muted transition-colors flex items-center gap-1"
              title="Shuffle card order"
            >
              <span>🔀</span> Shuffle Deck
            </button>
          </div>

          {/* Progress Tracker Bar */}
          <div className="flex items-center justify-between gap-3 text-xs pt-1">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${stats.percentMastered}%` }}
                />
              </div>
              <span className="font-bold text-text shrink-0">
                {stats.percentMastered}% Mastered
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] shrink-0 font-medium">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Easy: {stats.easyCount}
              </span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Good: {stats.goodCount}
              </span>
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Hard: {stats.hardCount}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body: Interactive Flashcard */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-text flex flex-col justify-between space-y-4">
          {/* Card Container */}
          <div
            onClick={() => setIsFlipped((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-label={isFlipped ? 'Flip to question side' : 'Flip to answer side'}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIsFlipped((prev) => !prev);
              }
            }}
            className="group relative cursor-pointer select-none rounded-2xl border-2 transition-all p-6 sm:p-8 flex flex-col justify-between min-h-[300px] shadow-xs hover:shadow-md bg-canvas"
            style={{
              borderColor: isFlipped
                ? 'var(--color-primary-600, #0284c7)'
                : 'var(--color-border, #e2e8f0)',
            }}
          >
            {/* Top metadata tags */}
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                    currentCard.type === 'INVARIANT'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : currentCard.type === 'TRAP'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {currentCard.badge}
                </span>
                <span className="text-xs text-text-muted font-medium">
                  {currentCard.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentRating && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      currentRating === 'EASY'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : currentRating === 'GOOD'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    Rating: {currentRating}
                  </span>
                )}
                <span className="text-[11px] font-mono text-text-muted bg-surface px-2 py-0.5 rounded border border-border">
                  {isFlipped ? 'Side: Answer (Back)' : 'Side: Question (Front)'}
                </span>
              </div>
            </div>

            {/* Card Content: Front vs Back */}
            <div className="my-auto py-2 space-y-3">
              {!isFlipped ? (
                /* FRONT OF CARD */
                <div className="space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
                    {currentCard.title}
                  </h3>
                  <div className="p-4 bg-surface rounded-xl border border-border text-sm sm:text-base font-medium leading-relaxed text-text">
                    {currentCard.prompt}
                  </div>
                  <div className="text-center pt-2">
                    <span className="text-xs text-primary-700 font-semibold group-hover:underline inline-flex items-center gap-1">
                      🔄 Click anywhere or press Space to reveal answer &rarr;
                    </span>
                  </div>
                </div>
              ) : (
                /* BACK OF CARD */
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary-800">
                      {currentCard.answer.heading}
                    </h4>
                    <p className="text-sm font-medium text-text mt-1 leading-relaxed">
                      {currentCard.answer.body}
                    </p>
                  </div>

                  {currentCard.answer.bullets && currentCard.answer.bullets.length > 0 && (
                    <div className="p-3 bg-surface rounded-lg border border-border text-xs space-y-1">
                      <strong className="text-text font-bold block">
                        Production Guarantees &amp; Invariants:
                      </strong>
                      <ul className="list-disc pl-4 space-y-1 text-text-muted">
                        {currentCard.answer.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentCard.answer.secondaryBullets && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-950 space-y-1">
                      <strong>{currentCard.answer.secondaryBullets.title}:</strong>
                      <ul className="list-disc pl-4 space-y-0.5 text-rose-900">
                        {currentCard.answer.secondaryBullets.items.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentCard.answer.note && (
                    <div className="text-xs text-text-muted italic border-t border-border/60 pt-2">
                      {currentCard.answer.note}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Flip Trigger Tip */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-text-muted">
              <span>Card #{currentIndex + 1}</span>
              <span className="hidden sm:inline font-mono">
                [Space] Flip · [← / →] Prev / Next · [1, 2, 3] Rate
              </span>
            </div>
          </div>

          {/* Rating & Navigation Control Bar */}
          <div className="space-y-3 pt-2">
            {/* Spaced-Repetition Rating Buttons */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRateCard('HARD');
                }}
                className={`text-xs font-bold border py-2.5 transition-all ${
                  currentRating === 'HARD'
                    ? 'bg-rose-100 text-rose-900 border-rose-400 ring-2 ring-rose-400/20'
                    : 'text-rose-700 border-rose-200 bg-rose-50/60 hover:bg-rose-100'
                }`}
              >
                <span>🔴 1: Hard (Needs Review)</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRateCard('GOOD');
                }}
                className={`text-xs font-bold border py-2.5 transition-all ${
                  currentRating === 'GOOD'
                    ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-400/20'
                    : 'text-amber-700 border-amber-200 bg-amber-50/60 hover:bg-amber-100'
                }`}
              >
                <span>🟡 2: Good (Solid Recall)</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRateCard('EASY');
                }}
                className={`text-xs font-bold border py-2.5 transition-all ${
                  currentRating === 'EASY'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-2 ring-emerald-400/20'
                    : 'text-emerald-700 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100'
                }`}
              >
                <span>🟢 3: Easy (Mastered)</span>
              </Button>
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="text-xs"
              >
                &larr; Previous Card
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFlipped((prev) => !prev)}
                className="text-xs font-semibold text-primary-800"
              >
                {isFlipped ? 'Show Question Side' : 'Reveal Answer (Space)'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex >= shuffledDeck.length - 1}
                className="text-xs"
              >
                Next Card &rarr;
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
