'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  startMockTestSession,
  saveMockTestAnswer,
  submitMockTestSession,
  type MockTestAttemptData,
} from '../../../../lib/mock-test-client';
import { TimerCountdown } from '../../../../components/mock-test/TimerCountdown';
import { QuestionPalette } from '../../../../components/mock-test/QuestionPalette';
import { SubmitConfirmModal } from '../../../../components/mock-test/SubmitConfirmModal';
import { OptionRow } from '../../../../components/practice/OptionRow';
import { Button } from '../../../../components/ui/Button';

export default function MockTestRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [data, setData] = useState<MockTestAttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<
    Map<string, { selectedOptionId: string | null; isMarkedForReview: boolean }>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  const questionStartTimeRef = useRef(Date.now());

  const initSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await startMockTestSession(testId);

      // If attempt was already submitted/expired on resume, redirect directly to results
      if (res.attempt.status === 'SUBMITTED' || res.attempt.status === 'EXPIRED') {
        router.replace(`/mock-tests/${testId}/results/${res.attempt.id}`);
        return;
      }

      setData(res);

      const map = new Map<
        string,
        { selectedOptionId: string | null; isMarkedForReview: boolean }
      >();
      res.answers.forEach((ans) => {
        map.set(ans.questionId, {
          selectedOptionId: ans.selectedOptionId,
          isMarkedForReview: ans.isMarkedForReview,
        });
      });
      setAnswersMap(map);
      setIsLoading(false);
      questionStartTimeRef.current = Date.now();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to initialize test session');
      setIsLoading(false);
    }
  }, [testId, router]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const currentQuestion = data?.questions[currentIndex];
  const currentAnswer = currentQuestion ? answersMap.get(currentQuestion.id) : undefined;

  const handleSelectOption = useCallback(
    async (optionId: string) => {
      if (!data || !currentQuestion || isSubmitting) return;

      const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
      const newSelected = currentAnswer?.selectedOptionId === optionId ? null : optionId;
      const isMarked = currentAnswer?.isMarkedForReview ?? false;

      // Optimistic update
      const updatedMap = new Map(answersMap);
      updatedMap.set(currentQuestion.id, {
        selectedOptionId: newSelected,
        isMarkedForReview: isMarked,
      });
      setAnswersMap(updatedMap);

      try {
        await saveMockTestAnswer(data.attempt.id, currentQuestion.id, {
          selectedOptionId: newSelected,
          isMarkedForReview: isMarked,
          timeSpentSeconds: timeSpent,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not save answer');
      }
    },
    [data, currentQuestion, isSubmitting, currentAnswer, answersMap],
  );

  const handleToggleMarkForReview = useCallback(async () => {
    if (!data || !currentQuestion || isSubmitting) return;

    const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    const newMarked = !(currentAnswer?.isMarkedForReview ?? false);
    const selected = currentAnswer?.selectedOptionId ?? null;

    const updatedMap = new Map(answersMap);
    updatedMap.set(currentQuestion.id, {
      selectedOptionId: selected,
      isMarkedForReview: newMarked,
    });
    setAnswersMap(updatedMap);

    try {
      await saveMockTestAnswer(data.attempt.id, currentQuestion.id, {
        selectedOptionId: selected,
        isMarkedForReview: newMarked,
        timeSpentSeconds: timeSpent,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update review status');
    }
  }, [data, currentQuestion, isSubmitting, currentAnswer, answersMap]);

  const handleClearResponse = useCallback(async () => {
    if (!data || !currentQuestion || isSubmitting) return;

    const isMarked = currentAnswer?.isMarkedForReview ?? false;
    const updatedMap = new Map(answersMap);
    updatedMap.set(currentQuestion.id, {
      selectedOptionId: null,
      isMarkedForReview: isMarked,
    });
    setAnswersMap(updatedMap);

    try {
      await saveMockTestAnswer(data.attempt.id, currentQuestion.id, {
        selectedOptionId: null,
        isMarkedForReview: isMarked,
        timeSpentSeconds: 0,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not clear selection');
    }
  }, [data, currentQuestion, isSubmitting, currentAnswer, answersMap]);

  const handleNext = useCallback(() => {
    if (!data) return;
    if (currentIndex < data.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      questionStartTimeRef.current = Date.now();
    }
  }, [data, currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      questionStartTimeRef.current = Date.now();
    }
  }, [currentIndex]);

  const handleSelectQuestion = (idx: number) => {
    setCurrentIndex(idx);
    questionStartTimeRef.current = Date.now();
  };

  const handleSubmit = useCallback(async () => {
    if (!data || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const scorecard = await submitMockTestSession(data.attempt.id);
      router.push(`/mock-tests/${testId}/results/${scorecard.attemptId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Submission failed');
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  }, [data, isSubmitting, router, testId]);

  // Keyboard navigation for timed tests (D-017, SCOPE.md, DESIGN_SYSTEM.md)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (isModalOpen) {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
        }
        return;
      }

      if (!data || isSubmitting || !currentQuestion) return;

      const key = e.key.toLowerCase();

      // Number keys 1-4
      if (['1', '2', '3', '4'].includes(key)) {
        const optIdx = parseInt(key, 10) - 1;
        if (currentQuestion.options[optIdx]) {
          e.preventDefault();
          handleSelectOption(currentQuestion.options[optIdx].id);
        }
      }
      // Letter keys A-D
      else if (['a', 'b', 'c', 'd'].includes(key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const optIdx = key.charCodeAt(0) - 'a'.charCodeAt(0);
        if (currentQuestion.options[optIdx]) {
          e.preventDefault();
          handleSelectOption(currentQuestion.options[optIdx].id);
        }
      }
      // Mark for Review: M
      else if (key === 'm' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToggleMarkForReview();
      }
      // Clear Response: Delete or Backspace
      else if ((key === 'backspace' || key === 'delete') && !e.ctrlKey && !e.metaKey) {
        if (currentAnswer?.selectedOptionId) {
          e.preventDefault();
          handleClearResponse();
        }
      }
      // Navigation: Next (ArrowRight or N)
      else if (e.key === 'ArrowRight' || key === 'n') {
        e.preventDefault();
        handleNext();
      }
      // Navigation: Previous (ArrowLeft or P)
      else if (e.key === 'ArrowLeft' || key === 'p') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    data,
    isModalOpen,
    isSubmitting,
    currentQuestion,
    currentAnswer,
    handleSelectOption,
    handleToggleMarkForReview,
    handleClearResponse,
    handleNext,
    handlePrev,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-text-muted">Loading test session...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas p-6">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-error-50 text-error-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-text">Error Loading Test</h2>
          <p className="text-sm text-text-muted">{error}</p>
          <Button variant="primary" onClick={() => router.push('/mock-tests')}>
            Return to Mock Tests
          </Button>
        </div>
      </div>
    );
  }

  if (!data || !currentQuestion) return null;

  // Compute counts for modal
  let answeredCount = 0;
  let markedCount = 0;
  answersMap.forEach((val) => {
    if (val.selectedOptionId) answeredCount++;
    if (val.isMarkedForReview) markedCount++;
  });
  const unansweredCount = data.questions.length - answeredCount;

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
      {/* Top Header with Timer and Test Title */}
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-base sm:text-lg font-bold text-primary-900 truncate max-w-xs sm:max-w-md">
              {data.attempt.title}
            </h1>
            <span className="hidden sm:inline-block text-xs font-semibold text-text-muted bg-canvas px-2.5 py-1 rounded border border-border">
              Q {currentIndex + 1} of {data.questions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Server-synced Countdown Timer */}
            <TimerCountdown
              expiresAt={data.attempt.expiresAt}
              serverNow={data.serverNow}
              onExpire={handleSubmit}
            />

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
            >
              Submit Test
            </Button>
          </div>
        </div>
      </header>

      {/* Main Testing Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Canvas (Left / 3 cols) */}
        <main className="lg:col-span-3 space-y-6 flex flex-col justify-between">
          {/* Mobile Palette Toggle */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobilePaletteOpen(!isMobilePaletteOpen)}
              className="w-full flex items-center justify-between p-3.5 bg-surface rounded-lg border border-border text-xs font-semibold text-text shadow-xs min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-700" />
                Question Palette ({answeredCount}/{data.questions.length} answered)
              </span>
              <span className="text-primary-700">{isMobilePaletteOpen ? 'Hide ▲' : 'Show ▼'}</span>
            </button>
            {isMobilePaletteOpen && (
              <div className="mt-3 bg-surface p-4 rounded-xl border border-border shadow-xs">
                <QuestionPalette
                  totalQuestions={data.questions.length}
                  currentIndex={currentIndex}
                  questions={data.questions}
                  answers={answersMap}
                  onSelectQuestion={(idx) => {
                    handleSelectQuestion(idx);
                    setIsMobilePaletteOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Meta Tags */}
            <div className="flex items-center justify-between text-xs text-text-muted border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-primary-700">
                  {currentQuestion.subjectName}
                </span>
                <span>•</span>
                <span>{currentQuestion.topicName}</span>
              </div>
              <span className="uppercase font-bold tracking-wider text-[11px] bg-canvas px-2 py-0.5 rounded border border-border">
                {currentQuestion.difficulty}
              </span>
            </div>

            {/* Question Statement */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700 tabular">
                Question {currentIndex + 1}
              </span>
              <p className="text-lg sm:text-xl font-medium text-text leading-relaxed">
                {currentQuestion.body}
              </p>
            </div>

            {/* 4 Choices (Mid-test secrecy maintained) */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt, optIndex) => {
                const isSelected = currentAnswer?.selectedOptionId === opt.id;
                return (
                  <OptionRow
                    key={opt.id}
                    label={String.fromCharCode(65 + optIndex)}
                    body={opt.body}
                    state={isSelected ? 'selected' : 'default'}
                    onClick={() => handleSelectOption(opt.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleMarkForReview}
                className={currentAnswer?.isMarkedForReview ? 'border-review text-review ring-1 ring-review' : ''}
              >
                <span>
                  {currentAnswer?.isMarkedForReview
                    ? '★ Marked for Review'
                    : '☆ Mark for Review'}
                </span>
                <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-canvas border border-border rounded text-text-muted">
                  M
                </kbd>
              </Button>
              {currentAnswer?.selectedOptionId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearResponse}
                  className="text-text-muted hover:text-error-600"
                >
                  <span>Clear Response</span>
                  <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-canvas border border-border rounded text-text-muted">
                    Del
                  </kbd>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                disabled={currentIndex === 0}
                onClick={handlePrev}
              >
                <span>← Previous</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-canvas border border-border rounded text-text-muted">
                  P
                </kbd>
              </Button>
              <Button
                variant="secondary"
                disabled={currentIndex === data.questions.length - 1}
                onClick={handleNext}
              >
                <span>Next →</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-canvas border border-border rounded text-text-muted">
                  N
                </kbd>
              </Button>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Question Palette (1 col, desktop only) */}
        <aside className="hidden lg:block bg-surface rounded-xl border border-border p-5 h-fit shadow-xs">
          <QuestionPalette
            totalQuestions={data.questions.length}
            currentIndex={currentIndex}
            questions={data.questions}
            answers={answersMap}
            onSelectQuestion={handleSelectQuestion}
          />
          <div className="hidden lg:block border-t border-border pt-3 mt-4 text-[11px] text-text-muted leading-relaxed">
            <span className="font-semibold text-text">Keyboard shortcuts:</span>
            <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
              <span className="bg-canvas px-1.5 py-0.5 rounded border border-border">1–4 / A–D: Select</span>
              <span className="bg-canvas px-1.5 py-0.5 rounded border border-border">M: Review</span>
              <span className="bg-canvas px-1.5 py-0.5 rounded border border-border">N / P: Nav</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={isModalOpen}
        totalQuestions={data.questions.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        markedCount={markedCount}
        isSubmitting={isSubmitting}
        onConfirm={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
