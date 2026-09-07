'use client';

import React, { useState, useMemo } from 'react';
import {
  analyzeConceptDensity,
  analyzeSpeechFluency,
  type SystemsDomain,
} from '../../lib/speech';

export interface ConceptDensityHUDProps {
  inputText: string;
  isListening?: boolean;
  onInjectRecommendation?: (term: string) => void;
  className?: string;
}

const DOMAIN_LABELS: Record<SystemsDomain, string> = {
  DISTRIBUTED_SYSTEMS: 'Distributed',
  RESILIENCE: 'Resilience',
  CONCURRENCY: 'Concurrency',
  DATABASE_STORAGE: 'Storage',
  NETWORKING: 'Networking',
  OBSERVABILITY: 'Observability',
};

const DOMAIN_BADGE_COLORS: Record<SystemsDomain, string> = {
  DISTRIBUTED_SYSTEMS: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  RESILIENCE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CONCURRENCY: 'bg-amber-50 text-amber-800 border-amber-200',
  DATABASE_STORAGE: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  NETWORKING: 'bg-sky-50 text-sky-800 border-sky-200',
  OBSERVABILITY: 'bg-purple-50 text-purple-800 border-purple-200',
};

export function ConceptDensityHUD({
  inputText,
  isListening = false,
  onInjectRecommendation,
  className = '',
}: ConceptDensityHUDProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute concept density metrics reactively as text changes
  const density = useMemo(() => analyzeConceptDensity(inputText), [inputText]);

  // Compute speech fluency/cadence if active
  const fluency = useMemo(() => {
    if (!isListening && !inputText) return null;
    return analyzeSpeechFluency(inputText, 1);
  }, [inputText, isListening]);

  const getTierBadgeStyle = () => {
    switch (density.tier) {
      case 'STAFF_ARCHITECT':
        return 'bg-purple-100 text-purple-900 border-purple-300 ring-1 ring-purple-400';
      case 'SENIOR_ENGINEER':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'INTERMEDIATE_ENGINEER':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getProgressBarColor = () => {
    if (density.densityIndex >= 75) return 'bg-purple-600';
    if (density.densityIndex >= 50) return 'bg-emerald-600';
    if (density.densityIndex >= 25) return 'bg-sky-600';
    return 'bg-slate-400';
  };

  return (
    <div
      data-testid="concept-density-hud"
      className={`rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all ${className}`}
    >
      {/* HUD Header Bar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>🧠</span>
            <span>Architectural Concept Density</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${getTierBadgeStyle()}`}
          >
            {density.tierLabel}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
            CDI: {density.densityIndex} / 100
          </span>
          <span className="text-slate-500 font-medium">
            {density.coveredDomainCount} / 6 Domains
          </span>

          {isListening && fluency && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
              🎙 {fluency.articulationPaceWpm} WPM ({fluency.cadenceDescription})
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer ml-1"
          >
            {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
          </button>
        </div>
      </div>

      {/* Real-Time CDI Progress Meter */}
      <div className="h-1.5 w-full bg-slate-100 overflow-hidden">
        <div
          style={{ width: `${Math.max(4, density.densityIndex)}%` }}
          className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
        />
      </div>

      {/* Expanded Breakdown Console */}
      {isExpanded && (
        <div className="p-3.5 space-y-3 bg-white text-xs">
          {/* Systems Domain Matrix Strip */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Systems Architecture Domain Coverage:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
              {(Object.keys(DOMAIN_LABELS) as SystemsDomain[]).map((domain) => {
                const count = density.domainCoverage[domain] || 0;
                const isCovered = count > 0;
                return (
                  <div
                    key={domain}
                    className={`p-1.5 rounded-lg border text-center transition-all ${
                      isCovered
                        ? DOMAIN_BADGE_COLORS[domain] + ' font-bold shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] truncate">{DOMAIN_LABELS[domain]}</div>
                    <div className="text-[11px] font-mono">
                      {isCovered ? `${count} mention${count > 1 ? 's' : ''}` : '0'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detected Concepts Stream */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Detected Rigorous Terminology ({density.uniqueConceptsCount} Unique Concepts):
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {density.totalConceptHits} total occurrences
              </span>
            </div>

            {density.detectedConcepts.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                Articulate your architecture using first-principles systems vocabulary (e.g. <em>Raft consensus</em>, <em>idempotency</em>, <em>backpressure</em>, <em>write-ahead log</em>, <em>tail latency</em>) to elevate concept density.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {density.detectedConcepts.map((item) => (
                  <span
                    key={item.term}
                    className={`px-2 py-0.5 rounded-md text-[11px] border font-medium inline-flex items-center gap-1 ${DOMAIN_BADGE_COLORS[item.domain]}`}
                  >
                    <span>{item.term}</span>
                    {item.count > 1 && (
                      <span className="text-[9px] font-mono opacity-80">×{item.count}</span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Precision Vocabulary Injector */}
          {density.recommendations.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Recommended Precision Tokens:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {density.recommendations.map((rec) => (
                  <button
                    key={rec}
                    type="button"
                    onClick={() => onInjectRecommendation?.(rec)}
                    title={`Click to inject "${rec}" into your response`}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors"
                  >
                    + {rec}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
