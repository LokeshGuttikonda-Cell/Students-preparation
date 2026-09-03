'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getInterviewSession,
  type InterviewSessionData,
} from '../../../../../lib/interview-client';
import { Button } from '../../../../../components/ui/Button';

export default function InterviewResultsPage() {
  const params = useParams();
  const interviewId = params.id as string;

  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStage, setFilterStage] = useState<string>('ALL');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const data = await getInterviewSession(interviewId);
        setSession(data);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load interview evaluation results',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [interviewId]);

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas text-text">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-text-muted">
            Generating Technical Interview Evaluation Scorecard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas p-6">
        <div className="bg-surface border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-error-50 text-error-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-text">Scorecard Not Found</h2>
          <p className="text-sm text-text-muted">
            {error || 'Unable to retrieve this interview session.'}
          </p>
          <Link href="/interviews">
            <Button variant="primary">Return to Interviews Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  const overallScore = session.overallScore ?? 0;
  const technicalScore = session.technicalScore ?? 0;
  const clarityScore = session.clarityScore ?? 0;
  const isPassed = overallScore >= 75;

  // Stages breakdown
  const stageWeights: Record<string, number> = {
    INTRODUCTION: 25,
    TECHNICAL_DRILL: 50,
    SCENARIO_DESIGN: 75,
    WRAPUP: 100,
  };
  const stageCompletionScore = stageWeights[session.currentStage] ?? 50;

  // Turns
  const candidateTurns = session.messages.filter((m) => m.sender === 'CANDIDATE');
  const filteredMessages = session.messages.filter((m) => {
    if (filterStage === 'ALL') return true;
    if (filterStage === 'FEEDBACK_ONLY') {
      return m.sender === 'CANDIDATE' && !!m.technicalFeedback;
    }
    return m.stage === filterStage;
  });

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
      {/* Top Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-xs">
        <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/interviews"
              className="text-sm font-semibold text-text-muted hover:text-text"
            >
              ← Back to Hub
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-text truncate">
                {session.roleTrack.name} — Technical Interview Scorecard
              </h1>
              <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                Phase 5 Evaluation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/interviews">
              <Button variant="primary" size="sm">
                Start New Interview
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-content mx-auto px-6 py-8 w-full space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-primary-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/interviews" className="hover:text-primary-700 transition-colors">
            AI Interviews
          </Link>
          <span>/</span>
          <span className="text-text font-medium">Evaluation Scorecard</span>
        </div>

        {/* Hero Performance Card */}
        <section className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    isPassed
                      ? 'bg-success-50 text-success-800 border-success-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {isPassed ? '✓ Technical Screening Cleared' : '⚠ Revision Recommended'}
                </span>
                <span className="text-xs text-text-muted">
                  Conducted on {new Date(session.startedAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-text">
                {session.roleTrack.name} Performance Evaluation
              </h2>

              <p className="text-sm text-text-muted leading-relaxed">
                {session.feedbackSummary ||
                  `Socratic assessment evaluating core engineering capabilities, architectural triage, and verbal problem-solving for the ${session.roleTrack.name} career track.`}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-text-muted">
                <span className="px-2.5 py-1 rounded-md bg-canvas border border-border">
                  Target Duration: <strong className="text-text">{session.targetDurationMinutes} mins</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-canvas border border-border">
                  Candidate Turns: <strong className="text-text">{candidateTurns.length} turns</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-canvas border border-border">
                  Stage Reached: <strong className="text-text">{session.currentStage}</strong>
                </span>
              </div>
            </div>

            {/* Score Radial / Badge */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-canvas border border-border min-w-[200px] text-center shrink-0">
              <span className="text-xs uppercase tracking-wider text-text-muted font-bold mb-1">
                Overall Rating
              </span>
              <div
                className={`text-5xl font-black tracking-tight tabular-nums ${
                  isPassed ? 'text-primary-700' : 'text-amber-700'
                }`}
              >
                {overallScore}%
              </div>
              <span className="text-xs font-semibold text-text-muted mt-2">
                {isPassed ? 'Role-Ready Benchmark' : 'Needs Practice'}
              </span>
            </div>
          </div>
        </section>

        {/* Multi-Axis Rubrics Matrix */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-text">
            Multi-Axis Technical Competency Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Axis 1: Technical Domain Accuracy */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Domain Accuracy
                </span>
                <span className="text-base font-bold text-primary-700 tabular-nums">
                  {technicalScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${technicalScore}%` }}
                />
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Evaluates correct identification of runtime internals, memory constraints, and failure modes.
              </p>
            </div>

            {/* Axis 2: Communication & Clarity */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Articulation Clarity
                </span>
                <span className="text-base font-bold text-accent-700 tabular-nums">
                  {clarityScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-accent-600 rounded-full transition-all duration-500"
                  style={{ width: `${clarityScore}%` }}
                />
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Measures precision, structured trade-off reasoning, and verbal clarity under evaluator probing.
              </p>
            </div>

            {/* Axis 3: Stage Progression & Socratic Depth */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Socratic Depth
                </span>
                <span className="text-base font-bold text-emerald-600 tabular-nums">
                  {stageCompletionScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-canvas rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${stageCompletionScore}%` }}
                />
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Indicates completion through high-scale architectural design and wrap-up triage rounds.
              </p>
            </div>
          </div>
        </section>

        {/* Strengths & Targeted Growth Areas */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Strengths */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success-600" />
              <h3 className="font-bold text-base text-text">
                Demonstrated Engineering Strengths
              </h3>
            </div>
            {session.strengths && session.strengths.length > 0 ? (
              <ul className="space-y-2.5 text-xs text-text">
                {session.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-canvas border border-border">
                    <span className="text-success-700 font-bold">✓</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-text-muted">
                Continue practicing technical drills to establish consistent strengths.
              </p>
            )}
          </div>

          {/* Growth Areas */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="font-bold text-base text-text">
                Targeted Areas for Technical Revision
              </h3>
            </div>
            {session.growthAreas && session.growthAreas.length > 0 ? (
              <div className="space-y-3">
                <ul className="space-y-2.5 text-xs text-text">
                  {session.growthAreas.map((ga, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50/50 border border-amber-200">
                      <span className="text-amber-700 font-bold">⚠</span>
                      <span className="leading-relaxed text-amber-950">{ga}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-2 flex items-center gap-3">
                  <Link href="/practice">
                    <Button variant="secondary" size="sm">
                      Revise in Practice Mode →
                    </Button>
                  </Link>
                  <Link href={`/roles/${session.roleTrack.slug}`}>
                    <Button variant="secondary" size="sm">
                      View Role Syllabus →
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                No immediate critical gaps identified. Keep reinforcing advanced concepts!
              </p>
            )}
          </div>
        </section>

        {/* Turn-by-Turn Socratic Dialogue Review */}
        <section className="space-y-4 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-text">
                Turn-by-Turn Socratic Dialogue Review
              </h3>
              <p className="text-xs text-text-muted">
                Inspect every conversational turn, evaluator critique, and senior-level benchmark model answers.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-canvas border border-border rounded-xl text-xs overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Turns' },
                { id: 'FEEDBACK_ONLY', label: 'Evaluator Insights Only' },
                { id: 'INTRODUCTION', label: 'Intro' },
                { id: 'TECHNICAL_DRILL', label: 'Drill' },
                { id: 'SCENARIO_DESIGN', label: 'Scenario' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterStage(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    filterStage === f.id
                      ? 'bg-surface text-primary-700 font-bold shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dialogue Stream */}
          <div className="space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-sm text-text-muted bg-surface border border-border rounded-2xl">
                No turns matching the selected filter.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isAi = msg.sender === 'AI_INTERVIEWER';

                return (
                  <div
                    key={msg.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      isAi
                        ? 'bg-surface border-border'
                        : 'bg-canvas/50 border-primary-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-xs ${
                            isAi ? 'bg-primary-800' : 'bg-accent-700'
                          }`}
                        >
                          {isAi ? 'AI' : 'You'}
                        </span>
                        <span className="font-bold text-xs text-text">
                          {isAi ? 'Socratic Evaluator' : 'Candidate Response'}
                        </span>
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider bg-canvas px-2 py-0.5 rounded border border-border">
                          {msg.stage}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted tabular-nums">
                        Turn #{msg.turnNumber}
                      </span>
                    </div>

                    <div className="text-sm text-text leading-relaxed whitespace-pre-wrap pl-8">
                      {msg.content}
                    </div>

                    {/* Socratic Feedback and Benchmark for Candidate Turns */}
                    {!isAi && (msg.technicalFeedback || msg.suggestedBetterAnswer) && (
                      <div className="mt-4 ml-8 p-4 rounded-xl bg-primary-50/70 border border-primary-200 space-y-2 text-xs">
                        {msg.technicalFeedback && (
                          <div className="space-y-1">
                            <span className="font-bold text-primary-900 flex items-center gap-1.5">
                              <span>🔍</span>
                              <span>Evaluator Feedback</span>
                            </span>
                            <p className="text-primary-800 leading-relaxed">
                              {msg.technicalFeedback}
                            </p>
                          </div>
                        )}

                        {msg.suggestedBetterAnswer && (
                          <div className="pt-2 border-t border-primary-200/60">
                            <details className="cursor-pointer">
                              <summary className="font-bold text-primary-700 hover:underline">
                                View Socratic Benchmark Ideal Response Pointer
                              </summary>
                              <div className="mt-2 p-3 rounded-lg bg-surface border border-border text-text leading-relaxed">
                                {msg.suggestedBetterAnswer}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Bottom Actions CTA */}
        <section className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-text-muted">
            Evaluation stored permanently in candidate profile.
          </div>
          <div className="flex items-center gap-3">
            <Link href="/interviews">
              <Button variant="secondary" size="md">
                ← Interviews Hub
              </Button>
            </Link>
            <Link href="/practice">
              <Button variant="primary" size="md">
                Practice Target Topics →
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
