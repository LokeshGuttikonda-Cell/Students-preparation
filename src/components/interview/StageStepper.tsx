'use client';

import React from 'react';

export type InterviewStageType =
  | 'INTRODUCTION'
  | 'TECHNICAL_DRILL'
  | 'SCENARIO_DESIGN'
  | 'WRAPUP';

export interface StageStepperProps {
  currentStage: InterviewStageType;
  className?: string;
}

const STAGES: Array<{ key: InterviewStageType; label: string; shortLabel: string }> = [
  { key: 'INTRODUCTION', label: '1. Introduction', shortLabel: 'Intro' },
  { key: 'TECHNICAL_DRILL', label: '2. Technical Drill', shortLabel: 'Drill' },
  { key: 'SCENARIO_DESIGN', label: '3. Scenario & Design', shortLabel: 'Scenario' },
  { key: 'WRAPUP', label: '4. Wrap-up & Q&A', shortLabel: 'Wrap-up' },
];

export function StageStepper({ currentStage, className = '' }: StageStepperProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <nav
      aria-label="Interview Progress Stages"
      className={`flex items-center gap-1.5 sm:gap-3 ${className}`}
    >
      {STAGES.map((s, idx) => {
        const isCompleted = idx < currentIndex;
        const isCurrent = idx === currentIndex;

        return (
          <div key={s.key} className="flex items-center gap-1.5 sm:gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-primary-700 text-white shadow-xs ring-2 ring-primary-300'
                  : isCompleted
                  ? 'bg-success-100 text-success-800 border border-success-300'
                  : 'bg-canvas text-text-muted border border-border opacity-70'
              }`}
            >
              {isCompleted ? (
                <span className="text-success-700 font-bold">✓</span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
              <span className="hidden md:inline">{s.label}</span>
              <span className="inline md:hidden">{s.shortLabel}</span>
            </div>

            {idx < STAGES.length - 1 && (
              <span
                className={`w-3 sm:w-6 h-0.5 ${
                  idx < currentIndex ? 'bg-success-400' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
