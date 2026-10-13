'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

export interface LongitudinalSessionPoint {
  sessionId: string;
  date: string;
  title: string;
  conceptDensity: number; // e.g. 3.4, 4.8, 6.5, 7.9, 9.2
  tier: 'CONVERSATIONAL' | 'PROFICIENT' | 'EXEMPLARY';
  wpm: number;
  fillerCount: number;
  durationMinutes: number;
  topConcepts: string[];
}

export interface DomainDriftScore {
  domainId: string;
  domainName: string;
  shortName: string;
  baselineScore: number;
  currentScore: number;
  targetBenchmark: number;
  delta: number;
  remediationTopicSlug: string;
  sandboxTab: string;
}

export interface LongitudinalGrowthTrackerProps {
  sessions?: LongitudinalSessionPoint[];
  domains?: DomainDriftScore[];
  className?: string;
}

export const DEFAULT_LONGITUDINAL_SESSIONS: LongitudinalSessionPoint[] = [
  {
    sessionId: 'sess-1',
    date: '30 days ago',
    title: 'Introductory Microservices Mock',
    conceptDensity: 3.4,
    tier: 'CONVERSATIONAL',
    wpm: 96,
    fillerCount: 14,
    durationMinutes: 18,
    topConcepts: ['database', 'api', 'server', 'request'],
  },
  {
    sessionId: 'sess-2',
    date: '22 days ago',
    title: 'Relational Indexing & Storage Engine Lab',
    conceptDensity: 4.8,
    tier: 'PROFICIENT',
    wpm: 112,
    fillerCount: 9,
    durationMinutes: 24,
    topConcepts: ['b-tree', 'wal', 'buffer-pool', 'page-lsn'],
  },
  {
    sessionId: 'sess-3',
    date: '15 days ago',
    title: 'Distributed Consensus & Raft Simulator',
    conceptDensity: 6.5,
    tier: 'PROFICIENT',
    wpm: 128,
    fillerCount: 5,
    durationMinutes: 30,
    topConcepts: ['raft', 'quorum', 'vector-clock', 'split-brain'],
  },
  {
    sessionId: 'sess-4',
    date: '7 days ago',
    title: 'LSM-Tree & SSTables Storage Internals',
    conceptDensity: 7.9,
    tier: 'PROFICIENT',
    wpm: 138,
    fillerCount: 2,
    durationMinutes: 32,
    topConcepts: ['memtable', 'bloom-filter', 'tombstone', 'compaction'],
  },
  {
    sessionId: 'sess-5',
    date: '2 days ago',
    title: 'Senior Distributed Systems Architecture',
    conceptDensity: 9.2,
    tier: 'EXEMPLARY',
    wpm: 145,
    fillerCount: 0,
    durationMinutes: 38,
    topConcepts: ['2pc', 'saga-orchestrator', 'aries', 'flushed-lsn', 'pigeonhole-quorum'],
  },
];

export const DEFAULT_DOMAIN_DRIFT: DomainDriftScore[] = [
  {
    domainId: 'dist-sys',
    domainName: 'Distributed Systems & Consensus',
    shortName: 'Distributed Systems',
    baselineScore: 64,
    currentScore: 86,
    targetBenchmark: 85,
    delta: 22,
    remediationTopicSlug: 'distributed-systems',
    sandboxTab: 'DISTRIBUTED_CONSENSUS',
  },
  {
    domainId: 'db-storage',
    domainName: 'Database Engines & Storage',
    shortName: 'Storage & DB',
    baselineScore: 68,
    currentScore: 89,
    targetBenchmark: 82,
    delta: 21,
    remediationTopicSlug: 'database-engines',
    sandboxTab: 'SQL_ENGINE',
  },
  {
    domainId: 'os-concurrency',
    domainName: 'Operating Systems & Concurrency',
    shortName: 'OS & Concurrency',
    baselineScore: 62,
    currentScore: 78,
    targetBenchmark: 78,
    delta: 16,
    remediationTopicSlug: 'os-concurrency',
    sandboxTab: 'KERNEL_NETWORK',
  },
  {
    domainId: 'net-protocols',
    domainName: 'Networking & Kernel Protocols',
    shortName: 'Networking',
    baselineScore: 55,
    currentScore: 72,
    targetBenchmark: 75,
    delta: 17,
    remediationTopicSlug: 'networking-protocols',
    sandboxTab: 'KERNEL_NETWORK',
  },
  {
    domainId: 'cloud-infra',
    domainName: 'Cloud Infrastructure & Virtualization',
    shortName: 'Cloud & Infra',
    baselineScore: 70,
    currentScore: 84,
    targetBenchmark: 70,
    delta: 14,
    remediationTopicSlug: 'cloud-infrastructure',
    sandboxTab: 'SYSTEM_DESIGN',
  },
  {
    domainId: 'sre-observability',
    domainName: 'Reliability Engineering & Observability',
    shortName: 'SRE & Observability',
    baselineScore: 58,
    currentScore: 70,
    targetBenchmark: 72,
    delta: 12,
    remediationTopicSlug: 'reliability-sre',
    sandboxTab: 'SYSTEM_DESIGN',
  },
];

export function LongitudinalGrowthTracker({
  sessions = DEFAULT_LONGITUDINAL_SESSIONS,
  domains = DEFAULT_DOMAIN_DRIFT,
  className = '',
}: LongitudinalGrowthTrackerProps) {
  const [selectedMetric, setSelectedMetric] = useState<'DENSITY' | 'PACE' | 'FILLERS'>('DENSITY');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions[sessions.length - 1]?.sessionId || 'sess-5'
  );

  const activeSession = sessions.find((s) => s.sessionId === selectedSessionId) || sessions[sessions.length - 1];

  const firstSession = sessions[0];
  const latestSession = sessions[sessions.length - 1];
  const netDensityGain = Math.round((latestSession.conceptDensity - firstSession.conceptDensity) * 10) / 10;
  const netPaceGain = latestSession.wpm - firstSession.wpm;
  const fillerReductionPct = Math.round(
    ((firstSession.fillerCount - latestSession.fillerCount) / Math.max(1, firstSession.fillerCount)) * 100
  );

  // Lowest domain (highest gap to benchmark)
  const lowestDomain = [...domains].sort(
    (a, b) => (a.currentScore - a.targetBenchmark) - (b.currentScore - b.targetBenchmark)
  )[0];

  // Helper for radar polygon math
  const radarSize = 320;
  const radarCenter = radarSize / 2;
  const radarRadius = 110;
  const totalAxes = domains.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (Math.min(100, Math.max(0, value)) / 100) * radarRadius;
    const x = radarCenter + r * Math.cos(angle);
    const y = radarCenter + r * Math.sin(angle);
    return { x, y, angle };
  };

  const baselinePoints = domains
    .map((d, i) => {
      const { x, y } = getCoordinates(d.baselineScore, i);
      return `${x},${y}`;
    })
    .join(' ');

  const currentPoints = domains
    .map((d, i) => {
      const { x, y } = getCoordinates(d.currentScore, i);
      return `${x},${y}`;
    })
    .join(' ');

  const benchmarkPoints = domains
    .map((d, i) => {
      const { x, y } = getCoordinates(d.targetBenchmark, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div data-testid="longitudinal-growth-tracker" className={`space-y-6 ${className}`}>
      {/* Header & KPI Highlights */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                Longitudinal Articulation Radar
              </span>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                {sessions.length} Sittings Analyzed
              </span>
            </div>
            <h2 className="text-xl font-bold text-text mt-1">
              Technical Vocabulary Growth &amp; Architectural Drift
            </h2>
            <p className="text-xs text-text-muted mt-0.5 max-w-3xl">
              Track how your Socratic interview concept density, articulation pace, and architectural depth have evolved across repeated mock assessment sittings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-50 text-primary-900 border border-primary-200">
              Grade: {latestSession.tier}
            </span>
          </div>
        </div>

        {/* 3 Metric Highlight Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-canvas border border-border space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Net Concept Density Gain
            </span>
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              +{netDensityGain}%
            </div>
            <p className="text-[11px] text-text-muted">
              {firstSession.conceptDensity}% (Baseline) → <strong>{latestSession.conceptDensity}% (Latest)</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-border space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Articulation Pace Growth
            </span>
            <div className="text-2xl font-bold text-primary-700 font-mono">
              +{netPaceGain} WPM
            </div>
            <p className="text-[11px] text-text-muted">
              {firstSession.wpm} WPM (Deliberate) → <strong>{latestSession.wpm} WPM (Optimal Cadence)</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-canvas border border-border space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Filler Word Elimination
            </span>
            <div className="text-2xl font-bold text-accent-700 font-mono">
              {fillerReductionPct}% Reduction
            </div>
            <p className="text-[11px] text-text-muted">
              {firstSession.fillerCount} fillers → <strong>{latestSession.fillerCount} fillers (Clean Articulation)</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Trajectory Timeline + Radar Drift */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Longitudinal Trajectory Stepper & Chart */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h3 className="font-bold text-base text-text">
                Multi-Session Trajectory Timeline
              </h3>
              <p className="text-xs text-text-muted">
                Inspect progress across individual interview simulations.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setSelectedMetric('DENSITY')}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                  selectedMetric === 'DENSITY'
                    ? 'bg-primary-700 text-white shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Concept Density
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric('PACE')}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                  selectedMetric === 'PACE'
                    ? 'bg-primary-700 text-white shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Pace (WPM)
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric('FILLERS')}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer transition-colors ${
                  selectedMetric === 'FILLERS'
                    ? 'bg-primary-700 text-white shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Fillers
              </button>
            </div>
          </div>

          {/* Longitudinal Chart Visualization */}
          <div className="space-y-4">
            <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2 border-b border-border relative">
              {/* Reference guideline for 8.0% Exemplary or 100 WPM */}
              <div
                className="absolute w-full border-t border-dashed border-emerald-400 dark:border-emerald-700/60 left-0"
                style={{
                  bottom:
                    selectedMetric === 'DENSITY'
                      ? `${(8.0 / 12.0) * 100}%`
                      : selectedMetric === 'PACE'
                      ? `${(140 / 180) * 100}%`
                      : '80%',
                }}
              >
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-surface px-1.5 py-0.5 rounded ml-2 -top-2.5 relative">
                  {selectedMetric === 'DENSITY'
                    ? '8.0% Exemplary Threshold'
                    : selectedMetric === 'PACE'
                    ? '140 WPM Target'
                    : '0 Fillers Target'}
                </span>
              </div>

              {sessions.map((sess, idx) => {
                const isSelected = sess.sessionId === selectedSessionId;
                const barHeight =
                  selectedMetric === 'DENSITY'
                    ? `${(sess.conceptDensity / 12.0) * 100}%`
                    : selectedMetric === 'PACE'
                    ? `${(sess.wpm / 180) * 100}%`
                    : `${Math.max(8, ((16 - sess.fillerCount) / 16) * 100)}%`;

                return (
                  <div
                    key={sess.sessionId}
                    role="button"
                    tabIndex={0}
                    aria-label={`Session ${idx + 1}: ${sess.title}, metric value: ${
                      selectedMetric === 'DENSITY'
                        ? `${sess.conceptDensity}%`
                        : selectedMetric === 'PACE'
                        ? `${sess.wpm} WPM`
                        : `${sess.fillerCount} fillers`
                    }`}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedSessionId(sess.sessionId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedSessionId(sess.sessionId);
                      }
                    }}
                    className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
                  >
                    <span
                      className={`text-[11px] font-mono font-bold transition-transform group-hover:-translate-y-0.5 ${
                        isSelected ? 'text-primary-700 font-extrabold' : 'text-text-muted'
                      }`}
                    >
                      {selectedMetric === 'DENSITY'
                        ? `${sess.conceptDensity}%`
                        : selectedMetric === 'PACE'
                        ? `${sess.wpm}`
                        : `${sess.fillerCount}`}
                    </span>
                    <div
                      className={`w-full max-w-[48px] rounded-t-lg transition-all duration-300 ${
                        isSelected
                          ? 'bg-primary-700 shadow-md ring-2 ring-primary-300'
                          : sess.tier === 'EXEMPLARY'
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : sess.tier === 'PROFICIENT'
                          ? 'bg-primary-600 hover:bg-primary-500'
                          : 'bg-slate-400 hover:bg-slate-500'
                      }`}
                      style={{ height: barHeight }}
                    />
                    <span className="text-[10px] font-mono text-text-muted truncate max-w-[60px]">
                      S{idx + 1}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Session Detail Card */}
            <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-text-muted uppercase">
                    Session Selected: {activeSession.date}
                  </span>
                  <h4 className="font-bold text-sm text-text">
                    {activeSession.title}
                  </h4>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold border font-mono ${
                    activeSession.tier === 'EXEMPLARY'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : activeSession.tier === 'PROFICIENT'
                      ? 'bg-primary-100 text-primary-900 border-primary-300'
                      : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {activeSession.tier} ({activeSession.conceptDensity}%)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-[10px] text-text-muted block">Duration</span>
                  <span className="font-bold text-text">{activeSession.durationMinutes} mins</span>
                </div>
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-[10px] text-text-muted block">Pace</span>
                  <span className="font-bold text-text">{activeSession.wpm} WPM</span>
                </div>
                <div className="bg-surface p-2 rounded border border-border">
                  <span className="text-[10px] text-text-muted block">Fillers</span>
                  <span className={`font-bold ${activeSession.fillerCount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {activeSession.fillerCount} detected
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-text-muted block">
                  Top Technical Concepts Emitted:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSession.topConcepts.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-surface border border-border text-text"
                    >
                      #{c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Comparative Radar Drift Visualizer */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-xl p-6 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-1 border-b border-border pb-3">
            <h3 className="font-bold text-base text-text">
              Architectural Competency Drift
            </h3>
            <p className="text-xs text-text-muted">
              Compares your Initial Baseline vs Latest Sitting vs Target Benchmark.
            </p>
          </div>

          {/* SVG Multi-Overlay Radar */}
          <div className="flex justify-center items-center py-2">
            <svg width={radarSize} height={radarSize} className="select-none overflow-visible">
              {/* Concentric Grid Rings */}
              {[0.33, 0.66, 1.0].map((level) => (
                <polygon
                  key={level}
                  points={domains
                    .map((_, i) => {
                      const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
                      const r = radarRadius * level;
                      return `${radarCenter + r * Math.cos(angle)},${radarCenter + r * Math.sin(angle)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  className="dark:stroke-zinc-800"
                />
              ))}

              {/* Axis Rays */}
              {domains.map((d, i) => {
                const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
                const x2 = radarCenter + radarRadius * Math.cos(angle);
                const y2 = radarCenter + radarRadius * Math.sin(angle);
                const labelRadius = radarRadius + 22;
                const lx = radarCenter + labelRadius * Math.cos(angle);
                const ly = radarCenter + labelRadius * Math.sin(angle);

                return (
                  <g key={d.domainId}>
                    <line
                      x1={radarCenter}
                      y1={radarCenter}
                      x2={x2}
                      y2={y2}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      className="dark:stroke-zinc-800"
                    />
                    <text
                      x={lx}
                      y={ly + 3}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="middle"
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {d.shortName}
                    </text>
                  </g>
                );
              })}

              {/* Target Benchmark Polygon (Dotted Amber) */}
              <polygon
                points={benchmarkPoints}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              {/* Baseline Polygon (Dashed Slate) */}
              <polygon
                points={baselinePoints}
                fill="#94a3b8"
                fillOpacity="0.15"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Current Score Polygon (Solid Emerald / Primary) */}
              <polygon
                points={currentPoints}
                fill="#10b981"
                fillOpacity="0.35"
                stroke="#059669"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* Legend & Drift Chips */}
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-text-muted">
                <span className="w-3 h-0.5 bg-slate-500 inline-block border-t border-dashed" />
                Baseline (Sitting 1)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <span className="w-3 h-1 bg-emerald-600 rounded-full inline-block" />
                Current (Sitting 5)
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-3 h-0.5 bg-amber-500 inline-block border-t border-dotted" />
                Target Benchmark
              </span>
            </div>

            {/* Domain Delta Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {domains.map((d) => (
                <div
                  key={d.domainId}
                  className="p-2 rounded bg-canvas border border-border flex items-center justify-between font-mono"
                >
                  <span className="text-[11px] text-text-muted truncate">{d.shortName}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                    +{d.delta}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Next-Step Recommendation Banner */}
      {lowestDomain && (
        <div className="bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-800 dark:text-primary-300">
                Socratic Growth Recommendation
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                Remaining Gap: {lowestDomain.targetBenchmark - lowestDomain.currentScore}%
              </span>
            </div>
            <p className="text-xs text-primary-950 dark:text-primary-200">
              Your highest architectural leverage is in <strong>{lowestDomain.domainName}</strong>. Elevate from {lowestDomain.currentScore}% to target benchmark {lowestDomain.targetBenchmark}% with focused practice.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href={`/practice/${lowestDomain.remediationTopicSlug}`}>
              <Button variant="primary" size="sm" className="text-xs">
                Target Practice →
              </Button>
            </Link>
            <Link href="/sandbox">
              <Button variant="secondary" size="sm" className="text-xs">
                Launch Sandbox
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
