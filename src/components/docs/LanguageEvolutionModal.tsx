'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { LANGUAGE_EVOLUTION_ITEMS } from '../../lib/language-evolution-data';
import { Button } from '../ui/Button';

interface LanguageEvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLanguage?: string;
}

export const LanguageEvolutionModal: React.FC<LanguageEvolutionModalProps> = ({
  isOpen,
  onClose,
  initialLanguage,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialLanguage) {
      setSelectedLanguage(initialLanguage.toUpperCase());
    }
  }, [initialLanguage]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyCode = useCallback(async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  }, []);

  if (!isOpen) return null;

  const filteredItems = LANGUAGE_EVOLUTION_ITEMS.filter((item) => {
    if (selectedLanguage === 'ALL') return true;
    return item.language.toUpperCase() === selectedLanguage;
  });

  const languageTabs = [
    { label: 'All Languages', value: 'ALL' },
    { label: 'Java', value: 'JAVA' },
    { label: 'Python', value: 'PYTHON' },
    { label: 'C++', value: 'C++' },
    { label: 'Rust', value: 'RUST' },
    { label: 'TypeScript', value: 'TYPESCRIPT' },
    { label: 'Go', value: 'GO' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evolution-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-surface flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Architectural Evolution Matrix
              </span>
              <span className="text-[11px] font-bold text-text-subtle">
                LTS Paradigm Diffs
              </span>
            </div>
            <h2
              id="evolution-modal-title"
              className="text-2xl font-extrabold text-primary-950 dark:text-white"
            >
              Language Evolution &amp; Modern Idiom Migration
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Side-by-side technical breakdowns contrasting legacy idioms with modern production syntax, runtime allocations, and concurrency models.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-text-subtle hover:text-text hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-lg transition-colors text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-border bg-surface-subtle/50 flex items-center gap-2 overflow-x-auto shrink-0">
          {languageTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedLanguage(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                selectedLanguage === tab.value
                  ? 'bg-primary-900 text-white shadow-xs dark:bg-primary-700'
                  : 'bg-surface border border-border text-text-muted hover:text-text hover:bg-surface-subtle'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Evolution Cards List */}
        <div className="p-6 space-y-8 overflow-y-auto flex-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6"
            >
              {/* Card Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 border border-primary-200 dark:border-primary-700">
                      {item.language}
                    </span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {item.versionShift}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-primary-950 dark:text-white">
                    {item.featureTitle}
                  </h3>
                </div>
              </div>

              {/* Paradigm Summary */}
              <p className="text-xs sm:text-sm text-text leading-relaxed bg-surface-subtle p-3.5 rounded-xl border border-border">
                <span className="font-bold text-primary-900 dark:text-primary-300">Core Paradigm Shift: </span>
                {item.paradigmSummary}
              </p>

              {/* Side-by-Side Code Diff */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Legacy Paradigm */}
                <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 overflow-hidden flex flex-col">
                  <div className="px-4 py-2 bg-rose-100/60 dark:bg-rose-900/40 border-b border-rose-200 dark:border-rose-800/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Legacy Paradigm ({item.legacyVersion})</span>
                    </span>
                    <button
                      onClick={() => handleCopyCode(item.legacyCode, `${item.id}-legacy`)}
                      className="text-[11px] text-rose-700 dark:text-rose-300 hover:text-rose-900 font-mono cursor-pointer"
                    >
                      {copiedId === `${item.id}-legacy` ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3 bg-neutral-900 overflow-x-auto flex-1">
                    <pre className="text-xs font-mono text-neutral-200 leading-relaxed">
                      <code>{item.legacyCode}</code>
                    </pre>
                  </div>
                  <div className="p-3 border-t border-rose-200 dark:border-rose-900/40 text-xs text-rose-900 dark:text-rose-200 bg-rose-50/50 dark:bg-rose-950/30">
                    <p className="leading-relaxed">{item.legacyDescription}</p>
                  </div>
                </div>

                {/* Modern Production Idiom */}
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 overflow-hidden flex flex-col">
                  <div className="px-4 py-2 bg-emerald-100/60 dark:bg-emerald-900/40 border-b border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <span>✨</span>
                      <span>Modern Production Idiom ({item.modernVersion})</span>
                    </span>
                    <button
                      onClick={() => handleCopyCode(item.modernCode, `${item.id}-modern`)}
                      className="text-[11px] text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 font-mono cursor-pointer"
                    >
                      {copiedId === `${item.id}-modern` ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-3 bg-neutral-900 overflow-x-auto flex-1">
                    <pre className="text-xs font-mono text-neutral-200 leading-relaxed">
                      <code>{item.modernCode}</code>
                    </pre>
                  </div>
                  <div className="p-3 border-t border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/30">
                    <p className="leading-relaxed">{item.modernDescription}</p>
                  </div>
                </div>
              </div>

              {/* Performance & Memory Allocation Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-text-subtle mb-0.5">
                    Asymptotic Complexity
                  </div>
                  <div className="text-xs font-semibold text-text">
                    {item.performanceMetrics.asymptotic}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-text-subtle mb-0.5">
                    Memory Footprint
                  </div>
                  <div className="text-xs font-semibold text-text">
                    {item.performanceMetrics.memoryAllocation}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-surface-subtle border border-border">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-text-subtle mb-0.5">
                    Throughput Delta
                  </div>
                  <div className="text-xs font-semibold text-text">
                    {item.performanceMetrics.throughputGain}
                  </div>
                </div>
              </div>

              {/* Breaking Changes & Migration Gotchas */}
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/20 p-4 space-y-2">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Migration Traps &amp; Breaking Changes</span>
                </div>
                <ul className="space-y-1 text-xs text-amber-950 dark:text-amber-300 list-disc list-inside">
                  {item.breakingChangesAndGotchas.map((gotcha, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {gotcha}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Architectural Takeaway */}
              <div className="text-xs text-text-muted italic border-l-2 border-primary-500 pl-3">
                <span className="font-bold not-italic text-primary-900 dark:text-primary-300">
                  Architectural Verdict:{' '}
                </span>
                {item.architecturalTakeaway}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface flex items-center justify-between text-xs text-text-subtle shrink-0">
          <div>
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle border border-border font-mono">ESC</kbd> to exit
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Matrix
          </Button>
        </div>
      </div>
    </div>
  );
};
