'use client';

import React, { useState } from 'react';
import {
  explainMissedQuestion,
  getSimilarDrill,
  type SocraticRemediationResult,
  type DrillQuestion,
} from '../../lib/remediation-client';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export interface SocraticRemediationCardProps {
  questionId: string;
  selectedOptionId?: string;
  targetRoleId?: string;
}

export function SocraticRemediationCard({
  questionId,
  selectedOptionId,
  targetRoleId,
}: SocraticRemediationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<SocraticRemediationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parallel drill state
  const [drill, setDrill] = useState<DrillQuestion | null>(null);
  const [isLoadingDrill, setIsLoadingDrill] = useState(false);
  const [drillSelectedOptionId, setDrillSelectedOptionId] = useState<string | null>(null);
  const [drillFeedback, setDrillFeedback] = useState<string | null>(null);

  const handleOpenDiagnosis = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    if (diagnosis) return; // already loaded

    setIsLoading(true);
    setError(null);
    try {
      const res = await explainMissedQuestion(
        questionId,
        selectedOptionId,
        undefined,
        targetRoleId,
      );
      setDiagnosis(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to diagnose question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadDrill = async () => {
    setIsLoadingDrill(true);
    try {
      const drillQ = await getSimilarDrill(questionId);
      setDrill(drillQ);
      setDrillSelectedOptionId(null);
      setDrillFeedback(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load parallel drill');
    } finally {
      setIsLoadingDrill(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Socratic Diagnosis Trigger */}
      <button
        type="button"
        onClick={handleOpenDiagnosis}
        className="w-full flex items-center justify-between p-4 bg-primary-50/50 hover:bg-primary-50 border border-primary-200/80 rounded-lg text-left transition-colors min-h-[44px] cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">💡</span>
          <div>
            <span className="text-sm font-bold text-primary-900 block">
              Explain Why I Missed This (AI Socratic Diagnosis)
            </span>
            <span className="text-xs text-text-muted">
              Unpack the mental trap and recruiter distractor pattern behind your choice
            </span>
          </div>
        </div>

        <span className="text-xs font-semibold text-primary-700 underline group-hover:text-primary-900 shrink-0">
          {isOpen ? 'Collapse ▲' : 'Analyze My Mistake ▼'}
        </span>
      </button>

      {/* Expanded Diagnosis Panel */}
      {isOpen && (
        <Card className="border-primary-200 bg-surface shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <CardContent className="p-5 sm:p-6 space-y-5">
            {isLoading && (
              <div className="py-6 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-primary-700 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-text-muted">
                  Analyzing distractor pattern, edge conditions, and interview traps...
                </p>
              </div>
            )}

            {error && (
              <div className="p-3.5 bg-error-50 border border-error-200 rounded-lg text-xs text-error-700 font-medium">
                {error}
              </div>
            )}

            {diagnosis && (
              <div className="space-y-4 text-sm leading-relaxed">
                {/* Identified Misconception */}
                <div className="p-4 bg-error-50/40 border border-error-200 rounded-lg space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-error-800 flex items-center gap-1.5">
                    <span>⚡</span> Identified Mental Trap / Misconception:
                  </span>
                  <p className="text-text text-xs sm:text-sm">
                    {diagnosis.misconception}
                  </p>
                </div>

                {/* Recruiter Trap Warning */}
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <span>🎯</span> Recruiter Distractor Design:
                  </span>
                  <p className="text-text text-xs sm:text-sm">
                    {diagnosis.recruiterTrap}
                  </p>
                </div>

                {/* Socratic Thinking Hint */}
                <div className="p-4 bg-primary-50/40 border border-primary-200 rounded-lg space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-900 flex items-center gap-1.5">
                    <span>🤔</span> Socratic Reflection Prompt:
                  </span>
                  <p className="text-text text-xs sm:text-sm italic">
                    &ldquo;{diagnosis.socraticHint}&rdquo;
                  </p>
                </div>

                {/* Golden Invariant Rule */}
                <div className="p-4 bg-canvas border border-border rounded-lg space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <span>📌</span> Key Takeaway Invariant:
                  </span>
                  <p className="text-text text-xs sm:text-sm font-semibold">
                    {diagnosis.conceptualRule}
                  </p>
                </div>

                {/* Parallel Drill Launcher Button */}
                {diagnosis.similarDrillAvailable && !drill && (
                  <div className="pt-2 border-t border-border flex items-center justify-between gap-4">
                    <span className="text-xs text-text-muted">
                      Reinforce this concept with an immediate parallel problem.
                    </span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleLoadDrill}
                      disabled={isLoadingDrill}
                      className="min-h-[44px]"
                    >
                      {isLoadingDrill ? 'Finding Question...' : 'Try a Similar Drill Question →'}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Inline Parallel Drill Arena */}
            {drill && (
              <div className="pt-4 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                    Parallel Concept Drill:
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
                    {drill.difficulty}
                  </span>
                </div>

                <p className="text-sm font-medium text-text">
                  {drill.body}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {drill.options.map((opt, optIdx) => {
                    const isSelected = drillSelectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setDrillSelectedOptionId(opt.id);
                          setDrillFeedback('Selected. Review your answer carefully.');
                        }}
                        className={`w-full p-3 rounded-lg border text-left text-xs font-medium min-h-[44px] flex items-center gap-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-primary-700 bg-primary-50 text-primary-900 font-bold'
                            : 'border-border bg-canvas text-text hover:border-primary-300'
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center font-mono shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt.body}</span>
                      </button>
                    );
                  })}
                </div>

                {drillFeedback && (
                  <div className="text-xs font-semibold text-text-muted">
                    {drillFeedback}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
