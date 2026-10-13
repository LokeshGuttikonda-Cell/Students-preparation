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
import { SectionTabs } from '../../../../components/mock-test/SectionTabs';
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

      // Check for locally cached answers in case of offline drop or accidental page refresh
      let cachedBackup: Record<string, { selectedOptionId: string | null; isMarkedForReview: boolean }> = {};
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(`studentsprep_mocktest_backup_${testId}`);
          if (raw) cachedBackup = JSON.parse(raw);
        } catch {}
      }

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

      // Merge cached backup if candidate selected choices prior to network loss/refresh
      Object.entries(cachedBackup).forEach(([qId, val]) => {
        const existing = map.get(qId);
        if (!existing || (!existing.selectedOptionId && val.selectedOptionId)) {
          map.set(qId, val);
        }
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

  const persistBackup = useCallback(
    (map: Map<string, { selectedOptionId: string | null; isMarkedForReview: boolean }>) => {
      if (typeof window === 'undefined') return;
      try {
        const obj: Record<string, { selectedOptionId: string | null; isMarkedForReview: boolean }> = {};
        map.forEach((v, k) => {
          obj[k] = v;
        });
        localStorage.setItem(`studentsprep_mocktest_backup_${testId}`, JSON.stringify(obj));
      } catch {}
    },
    [testId],
  );

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
      persistBackup(updatedMap);

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
    [data, currentQuestion, isSubmitting, currentAnswer, answersMap, persistBackup],
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
    persistBackup(updatedMap);

    try {
      await saveMockTestAnswer(data.attempt.id, currentQuestion.id, {
        selectedOptionId: selected,
        isMarkedForReview: newMarked,
        timeSpentSeconds: timeSpent,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update review status');
    }
  }, [data, currentQuestion, isSubmitting, currentAnswer, answersMap, persistBackup]);

  const handleClearResponse = useCallback(async () => {
    if (!data || !currentQuestion || isSubmitting) return;

    const isMarked = currentAnswer?.isMarkedForReview ?? false;
    const updatedMap = new Map(answersMap);
    updatedMap.set(currentQuestion.id, {
      selectedOptionId: null,
      isMarkedForReview: isMarked,
    });
    setAnswersMap(updatedMap);
    persistBackup(updatedMap);

    try {
      await saveMockTestAnswer(data.attempt.id, currentQuestion.id, {
        selectedOptionId: null,
        isMarkedForReview: isMarked,
        timeSpentSeconds: 0,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not clear selection');
    }
  }, [data, currentQuestion, isSubmitting, currentAnswer, answersMap, persistBackup]);

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

  const handleSelectSection = useCallback(
    (sectionId: string) => {
      if (!data) return;
      const targetIdx = data.questions.findIndex(
        (q) => q.sectionId === sectionId,
      );
      if (targetIdx !== -1) {
        setCurrentIndex(targetIdx);
        questionStartTimeRef.current = Date.now();
      }
    },
    [data],
  );

  const handleSubmit = useCallback(async () => {
    if (!data || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const scorecard = await submitMockTestSession(data.attempt.id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`studentsprep_mocktest_backup_${testId}`);
        } catch {}
      }
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

  // Multi-section progress calculation
  const activeSectionId =
    currentQuestion.sectionId ?? (data.sections?.[0]?.id ?? null);

  const sectionProgress: Record<
    string,
    { answered: number; total: number; reviewed: number }
  > = {};
  const sectionsSummary: Array<{
    title: string;
    answered: number;
    total: number;
  }> = [];

  if (data.sections && data.sections.length > 0) {
    for (const sec of data.sections) {
      sectionProgress[sec.id] = { answered: 0, total: 0, reviewed: 0 };
    }
    for (const q of data.questions) {
      if (q.sectionId && sectionProgress[q.sectionId]) {
        sectionProgress[q.sectionId].total++;
        const ans = answersMap.get(q.id);
        if (ans?.selectedOptionId) {
          sectionProgress[q.sectionId].answered++;
        }
        if (ans?.isMarkedForReview) {
          sectionProgress[q.sectionId].reviewed++;
        }
      }
    }
    for (const sec of data.sections) {
      const prog = sectionProgress[sec.id];
      if (prog) {
        sectionsSummary.push({
          title: sec.title,
          answered: prog.answered,
          total: prog.total,
        });
      }
    }
  }

  const currentSection = data.sections?.find((s) => s.id === activeSectionId);
  const currentSectionQuestions = data.questions.filter(
    (q) => (q.sectionId ?? null) === activeSectionId,
  );
  const isLastQuestionOfSection = Boolean(
    data.sections &&
      data.sections.length > 1 &&
      currentSectionQuestions.length > 0 &&
      currentSectionQuestions[currentSectionQuestions.length - 1]?.id === currentQuestion.id,
  );

  const nextSectionIndex = data.sections
    ? data.sections.findIndex((s) => s.id === activeSectionId) + 1
    : -1;
  const nextSection =
    data.sections && nextSectionIndex >= 0 && nextSectionIndex < data.sections.length
      ? data.sections[nextSectionIndex]
      : null;

  const handleNextSection = () => {
    if (!nextSection) return;
    handleSelectSection(nextSection.id);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
      {/* Top Header with Timer and Test Title */}
      <header className="border-b border-white/10 bg-[#040711]/90 backdrop-blur-xl sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-base sm:text-lg font-bold text-white font-display truncate max-w-xs sm:max-w-md">
              {data.attempt.title}
            </h1>
            {currentSection ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-300 bg-cyan-400/10 px-2.5 py-1 rounded-xl border border-cyan-400/20">
                <span>{currentSection.title}</span>
                <span>•</span>
                <span>Q {currentIndex + 1} of {data.questions.length}</span>
              </span>
            ) : (
              <span className="hidden sm:inline-block text-xs font-mono font-bold text-slate-400 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
                Q {currentIndex + 1} of {data.questions.length}
              </span>
            )}
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
              className="font-bold text-xs shadow-md shadow-lime-400/20"
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
              className="w-full flex items-center justify-between p-3.5 bento-tile text-xs font-mono font-bold text-white shadow-xs min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                Question Palette ({answeredCount}/{data.questions.length} answered)
              </span>
              <span className="text-lime-400">{isMobilePaletteOpen ? 'Hide ▲' : 'Show ▼'}</span>
            </button>
            {isMobilePaletteOpen && (
              <div className="mt-3 bento-tile p-4">
                <QuestionPalette
                  totalQuestions={data.questions.length}
                  currentIndex={currentIndex}
                  questions={data.questions}
                  answers={answersMap}
                  sections={data.sections}
                  onSelectQuestion={(idx) => {
                    handleSelectQuestion(idx);
                    setIsMobilePaletteOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Section Tabs (Multi-Section Tests) */}
          {data.sections && data.sections.length > 1 && (
            <SectionTabs
              sections={data.sections}
              activeSectionId={activeSectionId}
              onSelectSection={handleSelectSection}
              sectionProgress={sectionProgress}
            />
          )}

          <div className="bento-tile p-6 sm:p-8 space-y-6">
            {/* Meta Tags */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lime-400">
                  {currentQuestion.subjectName}
                </span>
                <span>•</span>
                <span>{currentQuestion.topicName}</span>
              </div>
              <span className="uppercase font-bold tracking-wider text-[10px] bg-black/50 text-slate-300 px-2.5 py-0.5 rounded-full border border-white/10">
                {currentQuestion.difficulty}
              </span>
            </div>

            {/* Question Statement */}
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 tabular">
                Question {currentIndex + 1}
              </span>
              <p className="text-lg sm:text-xl font-medium text-white leading-relaxed font-sans">
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
          <div className="flex flex-wrap items-center justify-between gap-3 bento-tile p-4 font-mono">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleMarkForReview}
                className={`text-xs ${currentAnswer?.isMarkedForReview ? 'border-review text-purple-300 ring-1 ring-review bg-purple-950/40' : ''}`}
              >
                <span>
                  {currentAnswer?.isMarkedForReview
                    ? '★ Marked for Review'
                    : '☆ Mark for Review'}
                </span>
                <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-black/60 border border-white/10 rounded text-slate-400">
                  M
                </kbd>
              </Button>
              {currentAnswer?.selectedOptionId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearResponse}
                  className="text-slate-400 hover:text-rose-400 text-xs"
                >
                  <span>Clear Response</span>
                  <kbd className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-mono bg-black/60 border border-white/10 rounded text-slate-400">
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
                className="text-xs"
              >
                <span>← Previous</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-black/60 border border-white/10 rounded text-slate-400">
                  P
                </kbd>
              </Button>
              <Button
                variant="secondary"
                disabled={currentIndex === data.questions.length - 1}
                onClick={handleNext}
                className="text-xs"
              >
                <span>Next →</span>
                <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-black/60 border border-white/10 rounded text-slate-400">
                  N
                </kbd>
              </Button>

              {isLastQuestionOfSection && nextSection && (
                <Button
                  variant="primary"
                  onClick={handleNextSection}
                  className="font-bold text-xs shadow-md shadow-lime-400/20"
                >
                  <span>Next Section ({nextSection.title}) →</span>
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar: Question Palette (1 col, desktop only) */}
        <aside className="hidden lg:block bento-tile p-5 h-fit space-y-4">
          <QuestionPalette
            totalQuestions={data.questions.length}
            currentIndex={currentIndex}
            questions={data.questions}
            sections={data.sections}
            answers={answersMap}
            onSelectQuestion={handleSelectQuestion}
          />
          <div className="border-t border-white/10 pt-3 text-[11px] font-mono text-slate-400 leading-relaxed">
            <span className="font-bold text-white block mb-1">Keyboard shortcuts:</span>
            <div className="flex flex-wrap gap-1 text-[10px]">
              <span className="bg-black/50 px-1.5 py-0.5 rounded border border-white/10 text-slate-300">1–4 / A–D: Select</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded border border-white/10 text-slate-300">M: Review</span>
              <span className="bg-black/50 px-1.5 py-0.5 rounded border border-white/10 text-slate-300">N / P: Nav</span>
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
        sectionsSummary={sectionsSummary}
        isSubmitting={isSubmitting}
        onConfirm={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
