'use client';

import React from 'react';
import { TestSectionItem } from '../../lib/mock-test-client';

interface SectionTabsProps {
  sections: TestSectionItem[];
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
  sectionProgress?: Record<
    string,
    { answered: number; total: number; reviewed: number }
  >;
}

export function SectionTabs({
  sections,
  activeSectionId,
  onSelectSection,
  sectionProgress = {},
}: SectionTabsProps) {
  if (!sections || sections.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Test Sections"
      className="border-b border-border bg-surface-muted px-3 py-2 rounded-t-lg"
    >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar"
      >
        {sections.map((sec) => {
          const isActive = activeSectionId === sec.id;
          const prog = sectionProgress[sec.id] || {
            answered: 0,
            total: sec.questionCount,
            reviewed: 0,
          };
          const percent = prog.total > 0 ? Math.round((prog.answered / prog.total) * 100) : 0;

          return (
            <button
              key={sec.id}
              role="tab"
              id={`tab-${sec.id}`}
              aria-selected={isActive}
              aria-controls={`section-panel-${sec.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectSection(sec.id)}
              className={`flex flex-col gap-1 px-4 py-2 text-sm font-medium rounded-md min-h-[50px] touch-manipulation transition-all border shrink-0 relative ${
                isActive
                  ? 'bg-surface text-primary-900 border-primary-700 shadow-xs font-semibold ring-1 ring-primary-700/20'
                  : 'bg-transparent text-text-muted border-transparent hover:bg-surface/60 hover:text-text'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="truncate max-w-[200px] sm:max-w-xs">{sec.title}</span>

                {sec.durationMinutes && (
                  <span className="text-[10px] font-semibold bg-surface-muted px-1.5 py-0.5 rounded text-text-subtle">
                    {sec.durationMinutes}m
                  </span>
                )}

                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-canvas-subtle text-text-subtle'
                  }`}
                  title={`${prog.answered} of ${prog.total} answered`}
                >
                  {prog.answered}/{prog.total}
                </span>

                {prog.reviewed > 0 && (
                  <span
                    className="w-2 h-2 rounded-full bg-accent-amber"
                    title={`${prog.reviewed} flagged for review`}
                  />
                )}
              </div>

              {/* Progress bar under tab */}
              <div className="w-full bg-border/40 h-1 rounded-full overflow-hidden mt-0.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    percent === 100
                      ? 'bg-emerald-600'
                      : isActive
                      ? 'bg-primary-700'
                      : 'bg-primary-400'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
