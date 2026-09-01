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

          return (
            <button
              key={sec.id}
              role="tab"
              id={`tab-${sec.id}`}
              aria-selected={isActive}
              aria-controls={`section-panel-${sec.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectSection(sec.id)}
              className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium rounded-md min-h-[44px] touch-manipulation transition-all border shrink-0 ${
                isActive
                  ? 'bg-surface text-primary-900 border-primary-700 shadow-xs font-semibold ring-1 ring-primary-700/20'
                  : 'bg-transparent text-text-muted border-transparent hover:bg-surface/60 hover:text-text'
              }`}
            >
              <span className="truncate max-w-[200px] sm:max-w-xs">{sec.title}</span>
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
            </button>
          );
        })}
      </div>
    </nav>
  );
}
