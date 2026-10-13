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
                  ? 'bg-lime-400 text-black shadow-[0_0_15px_rgba(163,230,53,0.3)] ring-2 ring-lime-400/50 font-bold'
                  : isCompleted
                  ? 'bg-lime-400/10 text-lime-400 border border-lime-400/30'
                  : 'bg-white/5 text-slate-400 border border-white/10 opacity-70'
              }`}
            >
              {isCompleted ? (
                <span className="text-lime-400 font-bold">✓</span>
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-black' : 'bg-current'}`} />
              )}
              <span className="hidden md:inline">{s.label}</span>
              <span className="inline md:hidden">{s.shortLabel}</span>
            </div>

            {idx < STAGES.length - 1 && (
              <span
                className={`w-3 sm:w-6 h-0.5 ${
                  idx < currentIndex ? 'bg-lime-400/50' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
