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
import { DifficultyBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';

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
      <div className="min-h-dvh bg-canvas py-12 px-4">
        <div className="max-w-lg mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <Card elevated>
            <CardHeader className="text-center pb-2">
              <span className="text-xs font-semibold text-success-700 uppercase tracking-wider">
                Practice Session Complete
              </span>
              <CardTitle className="text-2xl mt-1 text-primary-900">
                {data.attempt.topicName}
              </CardTitle>
              <p className="text-xs text-text-muted mt-1">
                {data.attempt.subjectName}
              </p>
            </CardHeader>

            <CardContent className="space-y-6 pt-4">
              {/* Score Highlight */}
              <div className="bg-neutral-50 rounded-lg p-6 text-center border border-border">
                <span className="text-xs font-medium text-text-muted uppercase">
                  Accuracy Score
                </span>
                <div className="text-5xl font-bold text-primary-900 tabular mt-1">
                  {accuracy}%
                </div>
                <p className="text-xs text-text-muted mt-2 tabular font-medium">
                  {correctCount} of {questions.length} questions answered correctly
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setIsCompleted(false);
                    setCurrentIndex(0);
                  }}
                >
                  Review Answers
                </Button>
                <Link href="/practice" className="w-full">
                  <Button variant="primary" className="w-full">
                    Practice Another Topic &rarr;
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
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
        {/* Question Statement Card */}
        <Card>
          <CardHeader className="py-4 px-6 border-b border-border flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-text-muted font-mono tabular">
              Q{currentIndex + 1} of {questions.length}
            </span>
            <DifficultyBadge difficulty={currentQ.difficulty} />
          </CardHeader>

          <CardContent className="p-6">
            <h1 className="text-lg sm:text-xl font-medium text-text leading-relaxed whitespace-pre-line">
              {currentQ.body}
            </h1>
          </CardContent>
        </Card>

        {/* Options List */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
            Options
          </span>
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

        {/* Bottom Navigation Toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            &larr; Previous
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant={isAnswered ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleNext}
            >
              {currentIndex === questions.length - 1
                ? 'Finish Practice'
                : 'Next Question \u2192'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
