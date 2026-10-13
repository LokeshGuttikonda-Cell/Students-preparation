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
import { SocraticRemediationCard } from '../../../../../../components/practice/SocraticRemediationCard';
import { RoleReadinessRadar } from '../../../../../../components/analytics/RoleReadinessRadar';
import { Button } from '../../../../../../components/ui/Button';
import {
  trackEvent,
  TelemetryEventType,
  triggerFeedbackPrompt,
  FeedbackContextTrigger,
} from '../../../../../../lib/telemetry-client';

export default function MockTestResultsPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [scorecard, setScorecard] = useState<MockTestScorecardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState(0);
  const [reviewSectionFilter, setReviewSectionFilter] = useState<string>('ALL');

  useEffect(() => {
    getMockTestScorecard(attemptId)
      .then((data) => {
        setScorecard(data);
        setIsLoading(false);
        void trackEvent(TelemetryEventType.MOCK_TEST_COMPLETED, {
          attemptId,
          score: data.accuracy,
          totalQuestions: data.totalQuestions,
        });
        triggerFeedbackPrompt(FeedbackContextTrigger.QUIZ_MOCK, {
          attemptId,
          score: data.accuracy,
        });
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to load test scorecard');
        setIsLoading(false);
      });
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#040711] text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Evaluating assessment results...</p>
        </div>
      </div>
    );
  }

  if (error || !scorecard) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#040711] text-white p-6">
        <div className="bento-tile p-8 max-w-md w-full text-center space-y-4 shadow-xl border-rose-500/30">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-xl font-mono font-bold">
            !
          </div>
          <h2 className="text-xl font-display font-bold text-white">Error Loading Scorecard</h2>
          <p className="text-xs font-mono text-slate-400">{error}</p>
          <Link href="/mock-tests">
            <Button variant="primary">Return to Mock Tests</Button>
          </Link>
        </div>
      </div>
    );
  }

  const activeQuestion = scorecard.questions[selectedQuestionIdx];

  return (
    <div className="min-h-dvh flex flex-col bg-[#040711] text-white selection:bg-lime-400 selection:text-black font-sans relative overflow-x-hidden">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#040711]/90 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/mock-tests"
              className="text-xs font-mono font-semibold text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Mock Tests
            </Link>
            <span className="text-white/20 font-mono">|</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
                SCORECARD
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate">
                {scorecard.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/mock-tests">
              <Button variant="secondary" size="sm">
                Take Another Test
              </Button>
            </Link>
            <Link href="/dashboard">
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
        <div className="bento-tile p-6 sm:p-8 space-y-6 relative overflow-hidden border-lime-500/20">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20 inline-block">
                Assessment Complete
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mt-1">
                Your Test Performance
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold uppercase px-3 py-1 rounded-full border ${
                  scorecard.status === 'SUBMITTED'
                    ? 'bg-lime-400/10 text-lime-400 border-lime-400/30'
                    : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                }`}
              >
                {scorecard.status === 'SUBMITTED' ? 'Submitted in time' : 'Auto-Submitted (Expired)'}
              </span>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bento-tile bg-black/40 border-white/10 p-4 text-center space-y-1">
              <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block">
                Total Score
              </span>
              <div className="text-3xl font-mono font-extrabold text-white tabular">
                {scorecard.score}{' '}
                <span className="text-sm font-normal text-slate-500 font-sans">
                  / {scorecard.maxScore}
                </span>
              </div>
            </div>

            <div className="bento-tile bg-black/40 border-lime-500/30 p-4 text-center space-y-1 shadow-inner shadow-lime-400/5">
              <span className="text-[10px] font-mono font-semibold text-lime-400 uppercase tracking-wider block">
                Accuracy
              </span>
              <div className="text-3xl font-mono font-extrabold text-lime-400 tabular">
                {scorecard.accuracy}%
              </div>
            </div>

            <div className="bento-tile bg-black/40 border-white/10 p-4 text-center space-y-1">
              <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-wider block">
                Correct Answers
              </span>
              <div className="text-3xl font-mono font-extrabold text-emerald-400 tabular">
                {scorecard.correctCount}{' '}
                <span className="text-sm font-normal text-slate-500 font-sans">
                  / {scorecard.totalQuestions}
                </span>
              </div>
            </div>

            <div className="bento-tile bg-black/40 border-white/10 p-4 text-center space-y-1">
              <span className="text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-wider block">
                Incorrect / Left
              </span>
              <div className="text-3xl font-mono font-extrabold text-rose-400 tabular">
                {scorecard.incorrectCount}{' '}
                <span className="text-xs font-normal text-slate-500 font-sans">
                  ({scorecard.unansweredCount} skipped)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Empirical Percentile Rank Banner */}
        {scorecard.percentileRank && (
          <div className="bento-tile border-cyan-500/30 bg-gradient-to-r from-[#071324] via-[#081b33] to-[#040814] text-white p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 featured-glow">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20">
                  Empirical Percentile Engine
                </span>
                <span className="text-[11px] font-mono font-semibold bg-white/10 px-2.5 py-0.5 rounded-full text-slate-300 border border-white/10">
                  {scorecard.percentileRank.totalPeerAttempts} verified attempt{scorecard.percentileRank.totalPeerAttempts === 1 ? '' : 's'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-white">
                Top {scorecard.percentileRank.topPercentage}% Candidate Standing
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Your performance ranked higher than {scorecard.percentileRank.percentile}% of students on this assessment. Benchmark standing: <strong className="text-cyan-300">{scorecard.percentileRank.rankTier}</strong>.
              </p>
            </div>

            <div className="bento-tile bg-cyan-950/40 border-cyan-400/30 p-4 text-center shrink-0 min-w-[150px] shadow-lg shadow-cyan-500/10">
              <span className="text-[10px] font-mono font-semibold text-cyan-300 uppercase tracking-wider block">
                Percentile Rank
              </span>
              <div className="text-4xl font-mono font-extrabold text-cyan-300 tabular mt-0.5">
                {scorecard.percentileRank.percentile}th
              </div>
              <span className="text-[10px] font-mono text-lime-400 font-bold block mt-1 uppercase tracking-wider">
                {scorecard.percentileRank.rankTier}
              </span>
            </div>
          </div>
        )}

        {/* Multi-Competency Radar Matrix */}
        {scorecard.competencyDimensions && scorecard.competencyDimensions.length > 0 && (
          <div className="bento-tile p-6 border-white/10">
            <RoleReadinessRadar
              dimensions={scorecard.competencyDimensions}
              title="Role Competency Diagnostic Spider Matrix"
              subtitle="Candidate demonstrated proficiency vs technical screening benchmark target across assessed dimensions"
            />
          </div>
        )}

        {/* Role Qualification Benchmark Banner */}
        {scorecard.roleQualification?.isRoleBenchmark && (
          <div
            className={`bento-tile p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border ${
              scorecard.roleQualification.isQualified
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-display font-bold text-base sm:text-lg">
                <span>{scorecard.roleQualification.isQualified ? '✓' : '⚠️'}</span>
                <span>
                  {scorecard.roleQualification.isQualified
                    ? 'Role Technical Benchmark: QUALIFIED'
                    : 'Role Technical Benchmark: ACTION REQUIRED'}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-sans opacity-90">
                {scorecard.roleQualification.verdictText}
              </p>
            </div>
            <div className="shrink-0">
              <span
                className={`text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border ${
                  scorecard.roleQualification.isQualified
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {scorecard.roleQualification.isQualified ? 'Benchmark Cleared' : 'Needs Practice'}
              </span>
            </div>
          </div>
        )}

        {/* Sectional Performance Breakdown (Multi-Section Tests) */}
        {scorecard.sectionBreakdown && scorecard.sectionBreakdown.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xl font-display font-bold text-white">
                Sectional Performance Scorecard
              </h3>
              <p className="text-xs sm:text-sm font-mono text-slate-400">
                Section-by-section breakdown evaluating whether individual competency cutoffs were cleared.
              </p>
            </div>

            <div className="bento-tile border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/60 border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    <tr>
                      <th className="px-5 py-3">Section Title</th>
                      <th className="px-5 py-3 text-center">Questions</th>
                      <th className="px-5 py-3 text-center">Correct</th>
                      <th className="px-5 py-3 text-center">Incorrect</th>
                      <th className="px-5 py-3 text-center">Score</th>
                      <th className="px-5 py-3 text-center">Accuracy</th>
                      <th className="px-5 py-3 text-center">Cutoff Target</th>
                      <th className="px-5 py-3 text-right">Section Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {scorecard.sectionBreakdown.map((s) => (
                      <tr key={s.sectionId} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-white">
                          {s.title}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono tabular text-slate-400 font-medium">
                          {s.total}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono tabular text-emerald-400 font-semibold">
                          {s.correct}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono tabular text-rose-400 font-semibold">
                          {s.incorrect}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono tabular font-bold text-white">
                          {s.score} / {s.maxScore}
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono tabular font-bold text-lime-400">
                          {s.accuracy}%
                        </td>
                        <td className="px-5 py-3.5 text-center font-mono tabular text-xs text-slate-500">
                          {s.cutoffScore !== null ? `≥ ${s.cutoffScore} pts` : 'None'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {s.clearedCutoff ? (
                            <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                              <span>✓</span> Cleared
                            </span>
                          ) : (
                            <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 inline-flex items-center gap-1">
                              <span>✗</span> Below Cutoff
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
        )}

        {/* Section 1: Weak-Area Topic Breakdown */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-xl font-display font-bold text-white">
              Topic-wise Performance & Weak Areas
            </h3>
            <p className="text-xs sm:text-sm font-mono text-slate-400">
              Identify subjects and concepts where accuracy was below benchmark.
            </p>
          </div>

          <div className="bento-tile border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/60 border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
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
                <tbody className="divide-y divide-white/5">
                  {scorecard.topicBreakdown.map((t, i) => (
                    <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-200">
                        {t.subjectName}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-400">
                        {t.topicName}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono tabular font-medium text-slate-300">
                        {t.total}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono tabular text-emerald-400 font-semibold">
                        {t.correct}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono tabular text-rose-400 font-semibold">
                        {t.incorrect}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono tabular font-bold text-white">
                        {t.accuracy}%
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {t.accuracy >= 70 ? (
                          <span className="text-xs font-mono font-semibold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
                            Strong Area
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-display font-bold text-white">
                Detailed Solutions & Answer Key Review
              </h3>
              <p className="text-xs sm:text-sm font-mono text-slate-400">
                Step-by-step mathematical explanations revealed for all questions.
              </p>
            </div>

            {/* Section Filter Tabs for Multi-Section Review */}
            {scorecard.sectionBreakdown && scorecard.sectionBreakdown.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setReviewSectionFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                    reviewSectionFilter === 'ALL'
                      ? 'bg-lime-400 text-slate-950 border-lime-400 font-bold shadow-md shadow-lime-400/20'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:border-lime-400/30 hover:text-white'
                  }`}
                >
                  All ({scorecard.questions.length})
                </button>
                {scorecard.sectionBreakdown.map((s) => (
                  <button
                    key={s.sectionId}
                    type="button"
                    onClick={() => {
                      setReviewSectionFilter(s.sectionId);
                      // Auto-select first question in this section
                      const firstInSecIdx = scorecard.questions.findIndex(
                        (q) => q.sectionId === s.sectionId,
                      );
                      if (firstInSecIdx !== -1) {
                        setSelectedQuestionIdx(firstInSecIdx);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-colors flex items-center gap-1.5 ${
                      reviewSectionFilter === s.sectionId
                        ? 'bg-lime-400 text-slate-950 border-lime-400 font-bold shadow-md shadow-lime-400/20'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-lime-400/30 hover:text-white'
                    }`}
                  >
                    <span>{s.title}</span>
                    <span className="opacity-80">({s.total})</span>
                    {s.clearedCutoff ? (
                      <span className="text-[10px] text-emerald-400">✓</span>
                    ) : (
                      <span className="text-[10px] text-amber-400">!</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Question Quick Jump Ribbon */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {scorecard.questions
              .map((q, idx) => ({ q, idx }))
              .filter(({ q }) =>
                reviewSectionFilter === 'ALL' ? true : q.sectionId === reviewSectionFilter,
              )
              .map(({ q, idx }) => {
                const isCorrect = q.studentAnswer.isCorrect;
                const isSkipped = !q.studentAnswer.selectedOptionId;
                const isSelected = idx === selectedQuestionIdx;

                let pillColor = 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25';
                if (isSkipped) {
                  pillColor = 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10';
                } else if (isCorrect) {
                  pillColor = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setSelectedQuestionIdx(idx)}
                    className={`min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] rounded-lg border text-xs font-mono font-bold tabular touch-manipulation transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#040711] ${pillColor} ${
                      isSelected ? 'ring-2 ring-lime-400 ring-offset-2 ring-offset-[#040711] scale-105 shadow-md shadow-lime-400/25' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
          </div>

          {/* Active Question Solution Card */}
          {activeQuestion && (
            <div className="bento-tile p-6 sm:p-8 space-y-6 border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-lime-400">
                    {activeQuestion.subjectName}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="font-mono text-slate-300">{activeQuestion.topicName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="uppercase font-mono font-bold tracking-wider text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-slate-300">
                    {activeQuestion.difficulty}
                  </span>
                  {activeQuestion.studentAnswer.isCorrect ? (
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      ✓ Correct (+1)
                    </span>
                  ) : activeQuestion.studentAnswer.selectedOptionId ? (
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/20">
                      ✗ Incorrect
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-medium text-slate-400 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
                      ○ Skipped
                    </span>
                  )}
                </div>
              </div>

              {/* Statement */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 tabular">
                  Question {selectedQuestionIdx + 1} of {scorecard.questions.length}
                </span>
                <p className="text-lg font-sans font-medium text-slate-100 leading-relaxed">
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

              {/* AI Socratic Diagnosis for Missed Mock Test Questions */}
              {!(activeQuestion.studentAnswer.isCorrect ?? false) && (
                <SocraticRemediationCard
                  questionId={activeQuestion.id}
                  selectedOptionId={activeQuestion.studentAnswer.selectedOptionId ?? undefined}
                />
              )}

              {/* Review Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
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
