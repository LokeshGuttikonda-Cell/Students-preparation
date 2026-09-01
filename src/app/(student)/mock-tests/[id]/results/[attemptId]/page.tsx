'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getMockTestScorecard,
  type MockTestScorecardData,
} from '../../../../../../lib/mock-test-client';
import { OptionRow } from '../../../../../../components/practice/OptionRow';
import { ExplanationCard } from '../../../../../../components/practice/ExplanationCard';
import { Button } from '../../../../../../components/ui/Button';

export default function MockTestResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [scorecard, setScorecard] = useState<MockTestScorecardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);

  useEffect(() => {
    getMockTestScorecard(attemptId)
      .then((data) => {
        setScorecard(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to load test scorecard');
        setIsLoading(false);
      });
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-text-muted">Evaluating assessment results...</p>
        </div>
      </div>
    );
  }

  if (error || !scorecard) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas p-6">
        <div className="bg-surface border border-border rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-error-50 text-error-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-text">Error Loading Scorecard</h2>
          <p className="text-sm text-text-muted">{error}</p>
          <Link href="/mock-tests">
            <Button variant="primary">Return to Mock Tests</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeQuestion = scorecard.questions[selectedQuestionIdx];

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
      {/* Top Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/mock-tests"
              className="text-sm font-semibold text-text-muted hover:text-text"
            >
              ← Back to Mock Tests
            </Link>
            <span className="text-border">|</span>
            <h1 className="text-base font-bold text-primary-900 truncate">
              {scorecard.title} — Scorecard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/mock-tests`}>
              <Button variant="secondary" size="sm">
                Take Another Test
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Scorecard View */}
      <main className="flex-1 max-w-content mx-auto px-6 py-10 w-full space-y-10">
        {/* Scorecard Hero Banner */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                Assessment Complete
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text mt-1">
                Your Test Performance
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                  scorecard.status === 'SUBMITTED'
                    ? 'bg-success-50 text-success-700 border border-success-500/30'
                    : 'bg-warning-50 text-warning-800 border border-warning-200'
                }`}
              >
                {scorecard.status === 'SUBMITTED' ? 'Submitted in time' : 'Auto-Submitted (Expired)'}
              </span>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-canvas border border-border rounded-xl p-4 text-center space-y-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Total Score
              </span>
              <div className="text-3xl font-bold text-primary-900 tabular">
                {scorecard.score}{' '}
                <span className="text-base text-text-muted font-normal">
                  / {scorecard.maxScore}
                </span>
              </div>
            </div>

            <div className="bg-canvas border border-border rounded-xl p-4 text-center space-y-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Accuracy
              </span>
              <div className="text-3xl font-bold text-success-700 tabular">
                {scorecard.accuracy}%
              </div>
            </div>

            <div className="bg-canvas border border-border rounded-xl p-4 text-center space-y-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Correct Answers
              </span>
              <div className="text-3xl font-bold text-success-700 tabular">
                {scorecard.correctCount}{' '}
                <span className="text-base text-text-muted font-normal">
                  / {scorecard.totalQuestions}
                </span>
              </div>
            </div>

            <div className="bg-canvas border border-border rounded-xl p-4 text-center space-y-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Incorrect / Left
              </span>
              <div className="text-3xl font-bold text-error-600 tabular">
                {scorecard.incorrectCount}{' '}
                <span className="text-base text-text-muted font-normal">
                  ({scorecard.unansweredCount} skipped)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Weak-Area Topic Breakdown */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-text">
              Topic-wise Performance & Weak Areas
            </h3>
            <p className="text-sm text-text-muted">
              Identify subjects and concepts where accuracy was below benchmark.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-canvas border-b border-border text-xs uppercase tracking-wider text-text-muted font-semibold">
                  <tr>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Topic</th>
                    <th className="px-5 py-3 text-center">Total</th>
                    <th className="px-5 py-3 text-center">Correct</th>
                    <th className="px-5 py-3 text-center">Incorrect</th>
                    <th className="px-5 py-3 text-center">Accuracy</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scorecard.topicBreakdown.map((t, i) => (
                    <tr key={i} className="hover:bg-canvas/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-text">
                        {t.subjectName}
                      </td>
                      <td className="px-5 py-3.5 text-text-muted">
                        {t.topicName}
                      </td>
                      <td className="px-5 py-3.5 text-center tabular font-medium">
                        {t.total}
                      </td>
                      <td className="px-5 py-3.5 text-center tabular text-success-700 font-semibold">
                        {t.correct}
                      </td>
                      <td className="px-5 py-3.5 text-center tabular text-error-600 font-semibold">
                        {t.incorrect}
                      </td>
                      <td className="px-5 py-3.5 text-center tabular font-bold">
                        {t.accuracy}%
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {t.accuracy >= 70 ? (
                          <span className="text-xs font-semibold text-success-700 bg-success-50 px-2 py-0.5 rounded">
                            Strong Area
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-error-600 bg-error-50 px-2 py-0.5 rounded">
                            Needs Revision
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 2: Detailed Question-by-Question Solutions Review */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-text">
                Detailed Solutions & Answer Key Review
              </h3>
              <p className="text-sm text-text-muted">
                Step-by-step mathematical explanations revealed for all questions.
              </p>
            </div>

            {/* Question Quick Jump Ribbon */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {scorecard.questions.map((q, idx) => {
                const isCorrect = q.studentAnswer.isCorrect;
                const isSkipped = !q.studentAnswer.selectedOptionId;
                const isSelected = idx === selectedQuestionIdx;

                let pillColor = 'bg-error-50 text-error-700 border-error-500/40';
                if (isSkipped) {
                  pillColor = 'bg-canvas text-text-muted border-border';
                } else if (isCorrect) {
                  pillColor = 'bg-success-50 text-success-700 border-success-500/40';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQuestionIdx(idx)}
                    className={`w-8 h-8 rounded border text-xs font-bold tabular transition-all focus:outline-none ${pillColor} ${
                      isSelected ? 'ring-2 ring-focus ring-offset-2 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Solution Card */}
          {activeQuestion && (
            <div className="bg-surface border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between text-xs text-text-muted border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary-700">
                    {activeQuestion.subjectName}
                  </span>
                  <span>•</span>
                  <span>{activeQuestion.topicName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="uppercase font-bold tracking-wider text-[11px] bg-canvas px-2 py-0.5 rounded border border-border">
                    {activeQuestion.difficulty}
                  </span>
                  {activeQuestion.studentAnswer.isCorrect ? (
                    <span className="text-xs font-bold text-success-700 bg-success-50 px-2 py-0.5 rounded">
                      ✓ Correct (+1)
                    </span>
                  ) : activeQuestion.studentAnswer.selectedOptionId ? (
                    <span className="text-xs font-bold text-error-600 bg-error-50 px-2 py-0.5 rounded">
                      ✗ Incorrect
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-text-muted bg-canvas px-2 py-0.5 rounded">
                      ○ Skipped
                    </span>
                  )}
                </div>
              </div>

              {/* Statement */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-700 tabular">
                  Question {selectedQuestionIdx + 1} of {scorecard.questions.length}
                </span>
                <p className="text-lg font-medium text-text leading-relaxed">
                  {activeQuestion.body}
                </p>
              </div>

              {/* Options with Reveal State */}
              <div className="space-y-3 pt-2">
                {activeQuestion.options.map((opt, optIdx) => {
                  const isCorrectAnswer = opt.isCorrect;
                  const isStudentSelection =
                    activeQuestion.studentAnswer.selectedOptionId === opt.id;

                  let state: 'default' | 'selected' | 'correct' | 'incorrect' = 'default';
                  if (isCorrectAnswer) {
                    state = 'correct';
                  } else if (isStudentSelection && !isCorrectAnswer) {
                    state = 'incorrect';
                  }

                  return (
                    <OptionRow
                      key={opt.id}
                      label={String.fromCharCode(65 + optIdx)}
                      body={opt.body}
                      state={state}
                      disabled={true}
                    />
                  );
                })}
              </div>

              {/* Step-by-step Solution */}
              <ExplanationCard
                explanation={activeQuestion.explanation}
                isCorrect={activeQuestion.studentAnswer.isCorrect ?? false}
              />

              {/* Review Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedQuestionIdx === 0}
                  onClick={() => setSelectedQuestionIdx(selectedQuestionIdx - 1)}
                >
                  ← Previous Question
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={selectedQuestionIdx === scorecard.questions.length - 1}
                  onClick={() => setSelectedQuestionIdx(selectedQuestionIdx + 1)}
                >
                  Next Question →
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
