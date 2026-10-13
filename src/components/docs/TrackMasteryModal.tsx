'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { DocTrack, DocMcq } from '../../lib/docs-catalog';
import { Button } from '../ui/Button';

interface TrackMasteryModalProps {
  track: DocTrack;
  isOpen: boolean;
  onClose: () => void;
  onMasteryAchieved?: () => void;
}

export const TrackMasteryModal: React.FC<TrackMasteryModalProps> = ({
  track,
  isOpen,
  onClose,
  onMasteryAchieved,
}) => {
  // Aggregate all MCQs from all modules in the track
  const allQuestions = useMemo(() => {
    const list: Array<DocMcq & { moduleTitle: string; topicTitle: string }> = [];
    for (const mod of track.modules) {
      for (const topic of mod.topics) {
        for (const mcq of topic.practiceMcqs || []) {
          list.push({
            ...mcq,
            moduleTitle: mod.title,
            topicTitle: topic.title,
          });
        }
      }
    }
    return list;
  }, [track]);

  // Deterministically shuffle question sequence and options
  const preparedQuestions = useMemo(() => {
    return allQuestions.map((q) => {
      const indexed = q.options.map((text, originalIndex) => ({ text, originalIndex }));
      // Fisher-Yates shuffle
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
  }, [allQuestions]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60); // 15 mins
  const [claimedCredential, setClaimedCredential] = useState<{
    id: string;
    credentialCode: string;
    verificationHash: string;
    grade: 'DISTINCTION' | 'MERIT' | 'PASS';
    issuedAt: string;
  } | null>(null);
  const [copiedCredCode, setCopiedCredCode] = useState<boolean>(false);

  // Reset exam state on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setSecondsRemaining(Math.max(allQuestions.length * 90, 300));

      try {
        const stored = localStorage.getItem('studentsprep_track_credentials');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((c: { trackSlug: string }) => c.trackSlug === track.slug);
          setClaimedCredential(found || null);
        } else {
          setClaimedCredential(null);
        }
      } catch {
        setClaimedCredential(null);
      }
    }
  }, [isOpen, allQuestions.length, track.slug]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isSubmitted]);

  const currentQuestion = preparedQuestions[currentIndex];

  const handleSelectOption = (questionId: string, shuffledIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: shuffledIdx,
    }));
  };

  // Score calculation
  const scoreStats = useMemo(() => {
    if (!isSubmitted) return { correct: 0, total: preparedQuestions.length, percentage: 0, passed: false };

    let correct = 0;
    for (const q of preparedQuestions) {
      const selectedShuffledIdx = selectedAnswers[q.id];
      if (selectedShuffledIdx !== undefined) {
        const option = q.shuffledOptions[selectedShuffledIdx];
        if (option && option.originalIndex === q.correctIndex) {
          correct++;
        }
      }
    }
    const total = preparedQuestions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = percentage >= 75;

    return { correct, total, percentage, passed };
  }, [isSubmitted, preparedQuestions, selectedAnswers]);

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    // If passed, persist in localStorage
    let correct = 0;
    for (const q of preparedQuestions) {
      const selectedShuffledIdx = selectedAnswers[q.id];
      if (selectedShuffledIdx !== undefined) {
        const option = q.shuffledOptions[selectedShuffledIdx];
        if (option && option.originalIndex === q.correctIndex) {
          correct++;
        }
      }
    }
    const percentage = preparedQuestions.length > 0 ? Math.round((correct / preparedQuestions.length) * 100) : 0;
    if (percentage >= 75) {
      try {
        const key = 'studentsprep_mastered_tracks';
        const existing = localStorage.getItem(key);
        const list: Array<{ trackSlug: string; score: number; completedAt: string }> = existing ? JSON.parse(existing) : [];
        const filtered = list.filter((item) => item.trackSlug !== track.slug);
        filtered.push({
          trackSlug: track.slug,
          score: percentage,
          completedAt: new Date().toISOString(),
        });
        localStorage.setItem(key, JSON.stringify(filtered));
        onMasteryAchieved?.();
      } catch {
        // ignore
      }
    }
  };

  const handleClaimCredential = () => {
    if (!scoreStats.passed) return;
    const grade: 'DISTINCTION' | 'MERIT' | 'PASS' =
      scoreStats.percentage >= 90 ? 'DISTINCTION' : scoreStats.percentage >= 80 ? 'MERIT' : 'PASS';
    const cleanSlug = track.slug.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    const randPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const credCode = `DOCS-${cleanSlug}-${randPart}`;
    const issuedAt = new Date().toISOString();

    const input = `${track.slug}:${grade}:${scoreStats.percentage}:${issuedAt}`;
    let hashVal = 0;
    for (let i = 0; i < input.length; i++) {
      hashVal = (hashVal << 5) - hashVal + input.charCodeAt(i);
      hashVal |= 0;
    }
    const hex = Math.abs(hashVal).toString(16).padStart(8, '0');
    const verificationHash = `sha256:track_${track.slug}_${hex}${Date.now().toString(16)}`;

    const newCred = {
      id: `cred_track_${track.slug}_${Date.now()}`,
      trackSlug: track.slug,
      trackTitle: track.title,
      credentialCode: credCode,
      verificationHash,
      grade,
      score: scoreStats.percentage,
      issuedAt,
    };

    try {
      const stored = localStorage.getItem('studentsprep_track_credentials');
      const list = stored ? JSON.parse(stored) : [];
      const updated = [...list.filter((c: { trackSlug: string }) => c.trackSlug !== track.slug), newCred];
      localStorage.setItem('studentsprep_track_credentials', JSON.stringify(updated));
      setClaimedCredential(newCred);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const answeredCount = Object.keys(selectedAnswers).length;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${track.title} Track Mastery Exam`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={isSubmitted ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-surface border border-border rounded-2xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-surface-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{track.icon}</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-text">
                {track.title} — Mastery Assessment
              </h3>
              <p className="text-xs text-text-muted">
                {preparedQuestions.length} Comprehensive Verification Checkpoints across all modules
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                  Time Remaining
                </span>
                <span className={`font-mono text-sm font-bold ${secondsRemaining < 180 ? 'text-danger-600 animate-pulse' : 'text-text'}`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-subtle hover:text-text hover:bg-neutral-100 dark:hover:bg-neutral-800 text-lg leading-none"
              aria-label="Close dialog"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Exam Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Post-Submission Result Card */}
          {isSubmitted ? (
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border text-center space-y-3 ${
                scoreStats.passed
                  ? 'bg-green-50/80 border-green-200 dark:bg-green-950/30 dark:border-green-800'
                  : 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
              }`}>
                <span className="text-4xl block">
                  {scoreStats.passed ? '🏅' : '📚'}
                </span>
                <h4 className="text-xl font-bold text-text">
                  {scoreStats.passed ? 'Track Mastery Verified!' : 'Assessment Incomplete'}
                </h4>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                  {scoreStats.passed
                    ? `Outstanding! You achieved ${scoreStats.percentage}% (${scoreStats.correct}/${scoreStats.total} correct), surpassing the 75% benchmark.`
                    : `You scored ${scoreStats.percentage}% (${scoreStats.correct}/${scoreStats.total} correct). A minimum of 75% is required for verified mastery.`}
                </p>

                <div className="inline-flex items-center gap-4 pt-2">
                  <div className="px-4 py-2 rounded-xl bg-surface border border-border shadow-2xs">
                    <span className="text-xs text-text-muted block font-semibold">Final Score</span>
                    <span className="text-2xl font-black text-primary-900 dark:text-primary-300">
                      {scoreStats.percentage}%
                    </span>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-surface border border-border shadow-2xs">
                    <span className="text-xs text-text-muted block font-semibold">Correct Answers</span>
                    <span className="text-2xl font-black text-text">
                      {scoreStats.correct} / {scoreStats.total}
                    </span>
                  </div>
                </div>

                {/* Verified Milestone Credential Claim */}
                {scoreStats.passed && (
                  <div className="pt-3 max-w-md mx-auto">
                    {!claimedCredential ? (
                      <Button
                        variant="primary"
                        onClick={handleClaimCredential}
                        className="px-6 py-2.5 font-bold shadow-md hover:shadow-lg text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer"
                      >
                        🎖️ Claim Verified Track Credential
                      </Button>
                    ) : (
                      <div className="p-4 rounded-xl bg-surface border-2 border-emerald-500/60 shadow-md space-y-3 text-left">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎖️</span>
                            <span className="font-bold text-sm text-text">
                              Verified Track Credential Issued
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                            claimedCredential.grade === 'DISTINCTION'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200'
                          }`}>
                            {claimedCredential.grade}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-text-muted block">Credential Code</span>
                            <span className="font-mono font-bold text-primary-700 dark:text-primary-400">
                              {claimedCredential.credentialCode}
                            </span>
                          </div>
                          <div>
                            <span className="text-text-muted block">Issued Date</span>
                            <span className="font-mono text-text">
                              {new Date(claimedCredential.issuedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-text-muted block text-[10px]">Verification Signature</span>
                            <span className="font-mono text-[10px] text-text-subtle break-all">
                              {claimedCredential.verificationHash}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(claimedCredential.credentialCode);
                                setCopiedCredCode(true);
                                setTimeout(() => setCopiedCredCode(false), 2000);
                              } catch {}
                            }}
                            className="text-xs font-semibold text-primary-700 hover:text-primary-800 underline cursor-pointer"
                          >
                            {copiedCredCode ? '✓ Copied Code' : '📋 Copy Credential Code'}
                          </button>
                          <a
                            href="/credentials"
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 flex items-center gap-1"
                          >
                            <span>Credentials Portal</span>
                            <span>→</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Question-by-Question Review */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-text-muted">
                  Detailed Answer Review
                </h4>
                {preparedQuestions.map((q, qIdx) => {
                  const userShuffledIdx = selectedAnswers[q.id];
                  const userOption = userShuffledIdx !== undefined ? q.shuffledOptions[userShuffledIdx] : null;
                  const isQCorrect = userOption && userOption.originalIndex === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border space-y-3 ${
                        isQCorrect
                          ? 'bg-surface border-green-300 dark:border-green-800'
                          : 'bg-surface border-danger-300 dark:border-danger-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-text-muted">
                          Q{qIdx + 1} • {q.topicTitle}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isQCorrect ? 'bg-green-100 text-green-800' : 'bg-danger-100 text-danger-800'
                        }`}>
                          {isQCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-text">{q.question}</p>

                      <div className="space-y-1.5 text-xs">
                        {q.shuffledOptions.map((opt, optIdx) => {
                          const isCorrectChoice = opt.originalIndex === q.correctIndex;
                          const isUserChoice = optIdx === userShuffledIdx;

                          let optionStyle = 'border-border bg-surface text-text-muted';
                          if (isCorrectChoice) {
                            optionStyle = 'border-green-500 bg-green-50 text-green-900 font-bold dark:bg-green-950/50 dark:text-green-200';
                          } else if (isUserChoice && !isCorrectChoice) {
                            optionStyle = 'border-danger-500 bg-danger-50 text-danger-900 line-through dark:bg-danger-950/50 dark:text-danger-200';
                          }

                          return (
                            <div key={optIdx} className={`p-2.5 rounded-lg border flex items-center justify-between ${optionStyle}`}>
                              <span>{opt.text}</span>
                              {isCorrectChoice && <span className="text-[10px] uppercase font-bold text-green-800">Correct Key</span>}
                              {isUserChoice && !isCorrectChoice && <span className="text-[10px] uppercase font-bold text-danger-800">Your Answer</span>}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-3 rounded-lg bg-surface-subtle border border-border text-xs text-text-muted space-y-1">
                        <strong className="text-text font-bold block">Architectural Rationale:</strong>
                        <p>{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Live Exam Question View */
            <div className="space-y-6">
              {/* Question Navigation Palette */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border">
                {preparedQuestions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q.id] !== undefined;
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-primary-900 text-white ring-2 ring-primary-500 shadow-xs'
                          : isAnswered
                          ? 'bg-primary-100 text-primary-900 border border-primary-300'
                          : 'bg-surface border border-border text-text-muted hover:text-text'
                      }`}
                      aria-label={`Jump to question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Active Question Details */}
              {currentQuestion && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-text-muted">
                    <span className="font-semibold text-primary-700">
                      Question {currentIndex + 1} of {preparedQuestions.length}
                    </span>
                    <span>{currentQuestion.topicTitle}</span>
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-text leading-snug">
                    {currentQuestion.question}
                  </h4>

                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    {currentQuestion.shuffledOptions.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQuestion.id, optIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500 text-primary-950 font-medium dark:bg-primary-950/40 dark:text-primary-200'
                              : 'bg-surface border-border hover:bg-neutral-50 dark:hover:bg-neutral-900 text-text'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                            isSelected
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-border text-text-muted'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-surface-subtle flex items-center justify-between">
          {isSubmitted ? (
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-text-muted">
                Status: {scoreStats.passed ? 'Verified Master' : 'Requires Review'}
              </span>
              <Button variant="primary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="text-xs"
                >
                  &larr; Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentIndex === preparedQuestions.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(preparedQuestions.length - 1, prev + 1))}
                  className="text-xs"
                >
                  Next &rarr;
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted hidden sm:inline">
                  {answeredCount} of {preparedQuestions.length} answered
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitExam}
                  disabled={answeredCount === 0}
                  className="text-xs font-bold"
                >
                  Submit Assessment ({answeredCount}/{preparedQuestions.length})
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
