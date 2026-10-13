'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  startPracticeSession,
  submitPracticeAnswer,
  type PracticeAttemptData,
  type PracticeQuestion,
} from '../../../../lib/practice-client';
import { PracticeHeader } from '../../../../components/practice/PracticeHeader';
import { OptionRow, type OptionState } from '../../../../components/practice/OptionRow';
import { ExplanationCard } from '../../../../components/practice/ExplanationCard';
import { SocraticRemediationCard } from '../../../../components/practice/SocraticRemediationCard';
import { DifficultyBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import {
  trackEvent,
  TelemetryEventType,
  triggerFeedbackPrompt,
  FeedbackContextTrigger,
} from '../../../../lib/telemetry-client';

export default function PracticeRunnerPage() {
  const params = useParams<{ topicId: string }>();
  const router = useRouter();

  const [data, setData] = useState<PracticeAttemptData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load or resume practice attempt
  useEffect(() => {
    if (!params.topicId) return;

    setIsLoading(true);
    startPracticeSession(params.topicId)
      .then((res) => {
        setData(res);
        setQuestions(res.questions);

        // Find the first unanswered question if resuming
        const firstUnanswered = res.questions.findIndex((q) => !q.answered);
        if (firstUnanswered !== -1) {
          setCurrentIndex(firstUnanswered);
        } else if (res.questions.length > 0) {
          // If all answered, show last question or summary
          setCurrentIndex(res.questions.length - 1);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load practice session');
      })
      .finally(() => setIsLoading(false));
  }, [params.topicId]);

  const handleSelectOption = async (optionId: string) => {
    if (!data || isSubmitting) return;

    const currentQ = questions[currentIndex];
    // If already answered, do nothing
    if (currentQ.answered) return;

    setIsSubmitting(true);
    try {
      const feedback = await submitPracticeAnswer(
        data.attempt.id,
        currentQ.id,
        optionId,
      );

      // Update question with answer feedback and explanation
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...currentQ,
        explanation: feedback.explanation,
        answered: {
          selectedOptionId: feedback.selectedOptionId,
          isCorrect: feedback.isCorrect,
          correctOptionId: feedback.correctOptionId,
        },
      };

      setQuestions(updatedQuestions);

      void trackEvent(TelemetryEventType.MCQ_ANSWERED, {
        topicId: params.topicId,
        questionId: currentQ.id,
        isCorrect: feedback.isCorrect,
        isPractice: true,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      triggerFeedbackPrompt(FeedbackContextTrigger.MCQ_PRACTICE, {
        topicId: params.topicId,
        totalQuestions: questions.length,
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleExit = () => {
    router.push('/practice');
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-text-muted">
            Loading practice session...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    const isAuthError = error.includes('sign in');
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-canvas">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-base text-primary-900">
              {isAuthError ? 'Authentication Required' : 'Unable to Practice'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-muted">{error}</p>
            <div className="flex gap-3 justify-center">
              <Link href="/practice">
                <Button variant="secondary" size="sm">
                  Back to Topics
                </Button>
              </Link>
              {isAuthError && (
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Sign In &rarr;
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || questions.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4 bg-canvas">
        <Card className="max-w-md w-full text-center">
          <CardContent className="py-8 space-y-4">
            <p className="text-sm text-text-muted">
              No questions found for this topic.
            </p>
            <Link href="/practice">
              <Button variant="secondary" size="sm">
                Return to Topics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Summary / Completed View
  if (isCompleted) {
    const answeredList = questions.filter((q) => q.answered);
    const correctCount = answeredList.filter((q) => q.answered?.isCorrect).length;
    const accuracy =
      answeredList.length > 0
        ? Math.round((correctCount / answeredList.length) * 100)
        : 0;

    return (
      <div className="min-h-dvh bg-canvas py-12 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="bento-tile p-8 space-y-6 border-lime-500/30 text-center">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-lime-400/20 text-lime-300 border border-lime-400/30">
                PRACTICE SESSION COMPLETE
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-2">
                {data.attempt.topicName}
              </h1>
              <p className="text-xs font-mono text-slate-400">
                {data.attempt.subjectName}
              </p>
            </div>

            {/* Score Highlight Box */}
            <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Session Accuracy Score
              </span>
              <div className="text-5xl sm:text-6xl font-black text-lime-400 font-display tabular">
                {accuracy}%
              </div>
              <p className="text-xs font-mono text-slate-300 tabular">
                {correctCount} of {questions.length} questions answered correctly
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="secondary"
                className="w-full text-xs font-mono"
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentIndex(0);
                }}
              >
                Review Answers
              </Button>
              <Link href="/practice" className="w-full">
                <Button variant="secondary" className="w-full text-xs font-mono">
                  Other Topics
                </Button>
              </Link>
              <Link href="/curriculum" className="w-full">
                <Button variant="primary" className="w-full text-xs font-bold shadow-md shadow-lime-400/20">
                  Knowledge Hub →
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Interactive Kernel Lab</span>
              <Link href="/sandbox" className="text-cyan-400 font-bold hover:underline">
                Launch Applied Sandbox →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isAnswered = Boolean(currentQ.answered);

  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      <PracticeHeader
        topicName={data.attempt.topicName}
        subjectName={data.attempt.subjectName}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onExit={handleExit}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Question Statement Bento Tile */}
        <div className="bento-tile p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-lime-400/20 text-lime-300 border border-lime-400/30">
              QUESTION {currentIndex + 1} OF {questions.length}
            </span>
            <DifficultyBadge difficulty={currentQ.difficulty} />
          </div>

          <h1 className="text-base sm:text-xl font-medium text-white leading-relaxed whitespace-pre-line font-sans">
            {currentQ.body}
          </h1>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span className="uppercase tracking-wider font-bold text-slate-400">Select Choice</span>
            <span className="text-[11px] text-cyan-400">Instant Verification</span>
          </div>
          {currentQ.options.map((opt, idx) => {
            let state: OptionState = 'default';

            if (currentQ.answered) {
              const isSelected =
                currentQ.answered.selectedOptionId === opt.id;
              const isCorrectOpt =
                currentQ.answered.correctOptionId === opt.id;

              if (isCorrectOpt) {
                state = 'correct';
              } else if (isSelected && !currentQ.answered.isCorrect) {
                state = 'incorrect';
              }
            }

            return (
              <OptionRow
                key={opt.id}
                label={String.fromCharCode(65 + idx)}
                body={opt.body}
                state={state}
                disabled={isAnswered || isSubmitting}
                onClick={() => handleSelectOption(opt.id)}
              />
            );
          })}
        </div>

        {/* Solution / Explanation Card */}
        {isAnswered && currentQ.explanation && (
          <ExplanationCard
            isCorrect={Boolean(currentQ.answered?.isCorrect)}
            explanation={currentQ.explanation}
          />
        )}

        {/* AI Socratic Remediation for Missed Questions */}
        {isAnswered && !currentQ.answered?.isCorrect && (
          <SocraticRemediationCard
            questionId={currentQ.id}
            selectedOptionId={currentQ.answered?.selectedOptionId}
          />
        )}

        {/* Bottom Navigation Toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-8 font-mono">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="text-xs"
          >
            ← Previous
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant={isAnswered ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleNext}
              className="text-xs font-bold"
            >
              {currentIndex === questions.length - 1
                ? 'Finish Practice'
                : 'Next Question →'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
