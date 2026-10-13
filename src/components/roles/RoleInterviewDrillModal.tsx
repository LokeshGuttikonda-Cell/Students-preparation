'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { RoleHandbook } from '../../lib/role-handbooks-data';
import { Button } from '../ui/Button';
import { Timer } from 'lucide-react';

export type DrillMasteryStatus = 'MASTERED' | 'NEEDS_REVIEW' | 'UNPREPARED';

export interface RoleInterviewDrillModalProps {
  role: RoleHandbook;
  isOpen: boolean;
  onClose: () => void;
  initialQuestionIndex?: number;
}

export function RoleInterviewDrillModal({
  role,
  isOpen,
  onClose,
  initialQuestionIndex = 0,
}: RoleInterviewDrillModalProps) {
  const questions = role.questions;
  const [currentIndex, setCurrentIndex] = useState<number>(initialQuestionIndex);

  // Scratchpad answers per question
  const [candidateNotes, setCandidateNotes] = useState<Record<number, string>>({});

  // Whether solution is revealed per question
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});

  // Counter probe checklist per question
  const [defendedProbes, setDefendedProbes] = useState<Record<string, boolean>>({});

  // Mastery status per question
  const [masteryState, setMasteryState] = useState<Record<number, DrillMasteryStatus>>({});

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);

  const storageKey = `studentsprep_role_drill_${role.slug}`;

  // Sync initial question index when opened
  useEffect(() => {
    if (isOpen) {
      if (initialQuestionIndex >= 0 && initialQuestionIndex < questions.length) {
        setCurrentIndex(initialQuestionIndex);
      }
      setIsTimerActive(true);
      setSecondsElapsed(0);
    }
  }, [isOpen, initialQuestionIndex, questions.length]);

  // Load saved mastery state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<number, DrillMasteryStatus>;
        setMasteryState(parsed);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Timer interval
  useEffect(() => {
    if (!isOpen || !isTimerActive) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isTimerActive]);

  // Keyboard shortcut listener (Escape to close)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const currentQ = questions[currentIndex] || questions[0];
  const isRevealed = !!revealedQuestions[currentIndex];
  const currentStatus = masteryState[currentIndex];

  const handleSetMastery = (status: DrillMasteryStatus) => {
    const updated = { ...masteryState, [currentIndex]: status };
    setMasteryState(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleToggleProbe = (probeKey: string) => {
    setDefendedProbes((prev) => ({
      ...prev,
      [probeKey]: !prev[probeKey],
    }));
  };

  const handleResetDrill = () => {
    setMasteryState({});
    setCandidateNotes({});
    setRevealedQuestions({});
    setDefendedProbes({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  // Metrics
  const stats = useMemo(() => {
    let masteredCount = 0;
    let reviewCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (masteryState[i] === 'MASTERED') masteredCount++;
      else if (masteryState[i] === 'NEEDS_REVIEW') reviewCount++;
    }
    const scorePct = questions.length > 0 ? Math.round((masteredCount / questions.length) * 100) : 0;
    return { masteredCount, reviewCount, scorePct };
  }, [masteryState, questions.length]);

  if (!isOpen || !currentQ) return null;

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Role Technical Interview Defense Drill"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-surface border border-border rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 border-b border-border bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 text-white flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-primary-800 text-white px-2 py-0.5 rounded border border-primary-700">
                🎯 Defense Simulator
              </span>
              <span className="text-xs text-primary-200 font-medium hidden sm:inline">
                {role.name}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Scenario {currentIndex + 1} of {questions.length}: {currentQ.title}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live Drill Timer */}
            <div className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded border border-white/20 text-white flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5 text-primary-200" />
              <span>{formatTimer(secondsElapsed)}</span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-primary-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close drill modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Stepper Bar */}
        <div className="px-4 py-2.5 bg-surface-muted border-b border-border flex items-center justify-between gap-3 text-xs overflow-x-auto">
          <div className="flex items-center gap-1.5">
            {questions.map((q, idx) => {
              const status = masteryState[idx];
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary-900 text-white shadow-xs'
                      : 'bg-surface border border-border text-text-muted hover:text-text'
                  }`}
                  aria-label={`Jump to Scenario ${idx + 1}`}
                >
                  <span>Scenario {idx + 1}</span>
                  {status === 'MASTERED' && <span className="text-emerald-500 font-bold">✓</span>}
                  {status === 'NEEDS_REVIEW' && <span className="text-amber-500 font-bold">!</span>}
                  {status === 'UNPREPARED' && <span className="text-rose-500 font-bold">✗</span>}
                </button>
              );
            })}
          </div>

          {/* Overall Readiness Pill */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-text-muted font-medium">Readiness:</span>
            <span className="font-bold text-primary-800">
              {stats.masteredCount}/{questions.length} Mastered ({stats.scorePct}%)
            </span>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-text">
          {/* Question Prompt Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200">
                Discipline: {currentQ.category}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase ${
                  currentQ.difficulty === 'EXPERT'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {currentQ.difficulty} Senior Level
              </span>
            </div>

            <div className="p-4 bg-surface-muted rounded-xl border border-border text-sm font-medium leading-relaxed">
              <p className="text-text">{currentQ.questionText}</p>
            </div>
          </div>

          {/* Candidate Answer Workspace */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="candidate-notes" className="font-bold text-text uppercase tracking-wider">
                ✍️ Candidate Defense Scratchpad:
              </label>
              <span className="text-text-muted">
                Formulate key invariants, tradeoffs, and failure modes
              </span>
            </div>
            <textarea
              id="candidate-notes"
              rows={3}
              value={candidateNotes[currentIndex] || ''}
              onChange={(e) =>
                setCandidateNotes((prev) => ({
                  ...prev,
                  [currentIndex]: e.target.value,
                }))
              }
              placeholder="e.g. Invariant 1: Idempotency keys prevent duplicate executions. Invariant 2: Distributed consensus requires quorum writes..."
              className="w-full p-3 rounded-lg border border-border bg-canvas text-text text-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden font-mono leading-relaxed"
            />
          </div>

          {/* Reveal Model Solution Action */}
          {!isRevealed ? (
            <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-primary-900 block">
                  Ready to test your architectural defense?
                </span>
                <span className="text-[11px] text-text-muted">
                  Reveal the model solution, interviewer counter-questions, and disqualifying pitfalls.
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="font-bold text-xs shrink-0 gap-1.5"
                onClick={() =>
                  setRevealedQuestions((prev) => ({
                    ...prev,
                    [currentIndex]: true,
                  }))
                }
              >
                <span>💡</span> Reveal Model Solution
              </Button>
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Model Architectural Solution */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏛️</span> Model Architectural Solution:
                </span>
                <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 text-xs text-text leading-relaxed whitespace-pre-line font-normal">
                  {currentQ.modelAnswer}
                </div>
              </div>

              {/* Interviewer Pushback Counter-Probes */}
              {currentQ.counterQuestions && currentQ.counterQuestions.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-primary-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚡</span> Interviewer Counter-Questions &amp; Edge Cases:
                    </span>
                    <span className="text-text-muted text-[11px]">
                      Check off items you successfully defended
                    </span>
                  </div>
                  <div className="space-y-2">
                    {currentQ.counterQuestions.map((cq, cqIdx) => {
                      const probeKey = `${currentQ.id}-probe-${cqIdx}`;
                      const isDefended = !!defendedProbes[probeKey];
                      return (
                        <div
                          key={cqIdx}
                          onClick={() => handleToggleProbe(probeKey)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all flex items-start gap-3 ${
                            isDefended
                              ? 'bg-primary-50/60 border-primary-300 text-primary-950 font-medium'
                              : 'bg-surface border-border/80 text-text-muted hover:border-primary-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isDefended}
                            onChange={() => {}}
                            className="w-4 h-4 mt-0.5 rounded text-primary-700 cursor-pointer"
                            aria-label={`Defended: ${cq}`}
                          />
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold block text-text">
                              Probe #{cqIdx + 1}: {cq}
                            </span>
                            <span className="text-[11px] text-text-muted">
                              {isDefended ? '✓ Defended in design proposal' : 'Click to mark defended'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rejection Red Flags / Pitfalls */}
              {currentQ.criticalPitfalls && currentQ.criticalPitfalls.length > 0 && (
                <div className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 space-y-2">
                  <span className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🚨</span> Candidate Rejection Pitfalls (Red Flags):
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-rose-800">
                    {currentQ.criticalPitfalls.map((pf, pfIdx) => (
                      <li key={pfIdx}>{pf}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Candidate Self-Mastery Rating Bar */}
              <div className="p-4 bg-surface-muted rounded-xl border border-border space-y-2">
                <span className="text-xs font-bold text-text uppercase tracking-wider block">
                  Self-Evaluation: How well did you defend this scenario?
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetMastery('MASTERED')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      currentStatus === 'MASTERED'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                        : 'bg-surface border-border text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    <span>✓</span> Mastered
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetMastery('NEEDS_REVIEW')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      currentStatus === 'NEEDS_REVIEW'
                        ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                        : 'bg-surface border-border text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    <span>!</span> Needs Review
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetMastery('UNPREPARED')}
                    className={`p-2.5 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      currentStatus === 'UNPREPARED'
                        ? 'bg-rose-700 text-white border-rose-800 shadow-sm'
                        : 'bg-surface border-border text-rose-800 hover:bg-rose-50'
                    }`}
                  >
                    <span>✗</span> Unprepared
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDrill}
              className="text-xs text-text-muted hover:text-rose-700 underline"
            >
              Reset Drill Data
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="text-xs font-medium"
            >
              &larr; Previous Scenario
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="text-xs font-bold"
              >
                Next Scenario &rarr;
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={onClose}
                className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
              >
                Finish Drill ✓
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
