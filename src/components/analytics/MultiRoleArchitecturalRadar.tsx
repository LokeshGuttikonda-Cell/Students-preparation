'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

export interface ArchitecturalDomainScore {
  domainId: string;
  name: string;
  shortName: string;
  candidateScore: number;
  practiceTopicSlug?: string;
  sandboxTab?: string;
}

export interface RoleArchetype {
  id: string;
  name: string;
  description: string;
  benchmarks: Record<string, number>; // domainId -> target %
}

export interface MultiRoleArchitecturalRadarProps {
  candidateDomains?: ArchitecturalDomainScore[];
  primaryRoleId?: string;
  secondaryRoleId?: string;
  showCohortDecile?: boolean;
  showSecondaryRole?: boolean;
  availableRoles?: RoleArchetype[];
  onSelectPrimaryRole?: (roleId: string) => void;
  onSelectSecondaryRole?: (roleId: string) => void;
  title?: string;
  subtitle?: string;
  size?: number;
  className?: string;
}

export const DEFAULT_ARCHITECTURAL_DOMAINS: ArchitecturalDomainScore[] = [
  {
    domainId: 'dist-sys',
    name: 'Distributed Systems & Consensus',
    shortName: 'Distributed Systems',
    candidateScore: 82,
    practiceTopicSlug: 'distributed-systems',
    sandboxTab: 'DISTRIBUTED_CONSENSUS',
  },
  {
    domainId: 'os-concurrency',
    name: 'Operating Systems & Concurrency',
    shortName: 'OS & Concurrency',
    candidateScore: 76,
    practiceTopicSlug: 'os-concurrency',
    sandboxTab: 'KERNEL_NETWORK',
  },
  {
    domainId: 'db-storage',
    name: 'Database Engines & Storage',
    shortName: 'Storage & DB',
    candidateScore: 88,
    practiceTopicSlug: 'database-engines',
    sandboxTab: 'SQL_ENGINE',
  },
  {
    domainId: 'net-protocols',
    name: 'Networking & Kernel Protocols',
    shortName: 'Networking',
    candidateScore: 70,
    practiceTopicSlug: 'networking-protocols',
    sandboxTab: 'KERNEL_NETWORK',
  },
  {
    domainId: 'cloud-infra',
    name: 'Cloud Infrastructure & Virtualization',
    shortName: 'Cloud & Infra',
    candidateScore: 85,
    practiceTopicSlug: 'cloud-infrastructure',
    sandboxTab: 'SYSTEM_DESIGN',
  },
  {
    domainId: 'sre-observability',
    name: 'Reliability Engineering & Observability',
    shortName: 'SRE & Observability',
    candidateScore: 68,
    practiceTopicSlug: 'reliability-sre',
    sandboxTab: 'SYSTEM_DESIGN',
  },
];

export const DEFAULT_ROLE_ARCHETYPES: RoleArchetype[] = [
  {
    id: 'dist-architect',
    name: 'Distributed Systems Architect',
    description: 'High concurrency, consensus protocols (Raft/Paxos), distributed storage, and partition tolerance.',
    benchmarks: {
      'dist-sys': 85,
      'os-concurrency': 78,
      'db-storage': 82,
      'net-protocols': 75,
      'cloud-infra': 70,
      'sre-observability': 72,
    },
  },
  {
    id: 'sre-lead',
    name: 'Site Reliability Engineer (SRE)',
    description: 'Kernel tuning, high-availability SLI/SLO metrics, automated incident remediation, and fault recovery.',
    benchmarks: {
      'dist-sys': 72,
      'os-concurrency': 82,
      'db-storage': 70,
      'net-protocols': 82,
      'cloud-infra': 78,
      'sre-observability': 88,
    },
  },
  {
    id: 'storage-specialist',
    name: 'Database & Storage Systems Specialist',
    description: 'LSM-trees, B+ trees, query execution planning, ACID transactions, and disk block I/O optimization.',
    benchmarks: {
      'dist-sys': 80,
      'os-concurrency': 78,
      'db-storage': 90,
      'net-protocols': 68,
      'cloud-infra': 70,
      'sre-observability': 72,
    },
  },
  {
    id: 'cloud-platform',
    name: 'Cloud Infrastructure Platform Engineer',
    description: 'Multi-region VPC topologies, container virtualization, edge networking, and resilient service fabrics.',
    benchmarks: {
      'dist-sys': 75,
      'os-concurrency': 75,
      'db-storage': 72,
      'net-protocols': 80,
      'cloud-infra': 88,
      'sre-observability': 80,
    },
  },
];

export const COHORT_TOP_DECILE_BENCHMARKS: Record<string, number> = {
  'dist-sys': 90,
  'os-concurrency': 88,
  'db-storage': 92,
  'net-protocols': 86,
  'cloud-infra': 90,
  'sre-observability': 88,
};

export function MultiRoleArchitecturalRadar({
  candidateDomains = DEFAULT_ARCHITECTURAL_DOMAINS,
  primaryRoleId: initialPrimaryRoleId = 'dist-architect',
  secondaryRoleId: initialSecondaryRoleId = 'sre-lead',
  showCohortDecile: initialShowCohortDecile = true,
  showSecondaryRole: initialShowSecondaryRole = true,
  availableRoles = DEFAULT_ROLE_ARCHETYPES,
  onSelectPrimaryRole,
  onSelectSecondaryRole,
  title = 'Multi-Role Architectural Competency Matrix',
  subtitle = 'Compare evaluated systems diagnostic mastery against primary target benchmarks, secondary roles, and top-decile peer standards.',
  size = 420,
  className = '',
}: MultiRoleArchitecturalRadarProps) {
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<string>(initialPrimaryRoleId);
  const [selectedSecondaryId, setSelectedSecondaryId] = useState<string>(initialSecondaryRoleId);
  const [showCohort, setShowCohort] = useState<boolean>(initialShowCohortDecile);
  const [showSecondary, setShowSecondary] = useState<boolean>(initialShowSecondaryRole);
  const [inspectedDomainId, setInspectedDomainId] = useState<string>(candidateDomains[0]?.domainId || 'dist-sys');

  if (!candidateDomains || candidateDomains.length === 0) {
    return null;
  }

  const primaryRole =
    availableRoles.find((r) => r.id === selectedPrimaryId) || availableRoles[0];
  const secondaryRole =
    availableRoles.find((r) => r.id === selectedSecondaryId) || availableRoles[1] || availableRoles[0];

  const handlePrimaryChange = (id: string) => {
    setSelectedPrimaryId(id);
    onSelectPrimaryRole?.(id);
  };

  const handleSecondaryChange = (id: string) => {
    setSelectedSecondaryId(id);
    onSelectSecondaryRole?.(id);
  };

  // If fewer than 3 dimensions, fallback to comparative list
  if (candidateDomains.length < 3) {
    return (
      <div className={`bg-surface border border-border rounded-xl p-6 space-y-4 shadow-xs ${className}`}>
        <div>
          <h4 className="text-base font-bold text-text">{title}</h4>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="space-y-3">
          {candidateDomains.map((d) => {
            const target = primaryRole?.benchmarks[d.domainId] || 75;
            return (
              <div key={d.domainId} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-text">{d.name}</span>
                  <span className={d.candidateScore >= target ? 'text-success-700' : 'text-accent-800'}>
                    {d.candidateScore}% / Target {target}%
                  </span>
                </div>
                <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden relative">
                  <div
                    className="bg-primary-700 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, d.candidateScore)}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-amber-500"
                    style={{ left: `${target}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const N = candidateDomains.length;
  const center = size / 2;
  const maxR = size * 0.36;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (2 * Math.PI * index) / N - Math.PI / 2;
    const r = Math.max(0, Math.min(1, valueRatio)) * maxR;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Concentric Grid Polygons
  const gridPolygons = levels.map((lvl) => {
    return candidateDomains
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  // 1. Candidate Polygon (Solid Primary)
  const candidatePoints = candidateDomains
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.candidateScore / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // 2. Primary Role Benchmark (Amber Dashed)
  const primaryPoints = candidateDomains
    .map((d, i) => {
      const target = primaryRole?.benchmarks[d.domainId] ?? 75;
      const { x, y } = getCoordinates(i, target / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // 3. Secondary Role Benchmark (Cyan Dashed)
  const secondaryPoints = candidateDomains
    .map((d, i) => {
      const target = secondaryRole?.benchmarks[d.domainId] ?? 70;
      const { x, y } = getCoordinates(i, target / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // 4. Cohort Top Decile (90th Percentile) (Emerald Dotted)
  const cohortPoints = candidateDomains
    .map((d, i) => {
      const benchmark = COHORT_TOP_DECILE_BENCHMARKS[d.domainId] ?? 88;
      const { x, y } = getCoordinates(i, benchmark / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Inspected Domain Information
  const inspectedDomain =
    candidateDomains.find((d) => d.domainId === inspectedDomainId) || candidateDomains[0];
  const inspectedPrimaryTarget = primaryRole?.benchmarks[inspectedDomain.domainId] ?? 75;
  const inspectedSecondaryTarget = secondaryRole?.benchmarks[inspectedDomain.domainId] ?? 70;
  const inspectedCohortTarget = COHORT_TOP_DECILE_BENCHMARKS[inspectedDomain.domainId] ?? 88;
  const inspectedDelta = inspectedDomain.candidateScore - inspectedPrimaryTarget;
  const isPrimaryPassing = inspectedDelta >= 0;

  return (
    <div
      data-testid="multi-role-architectural-radar"
      className={`bg-surface border border-border rounded-xl p-5 sm:p-7 shadow-xs space-y-6 ${className}`}
    >
      {/* Header & Role Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
              Architectural Systems Diagnostic Matrix
            </span>
            <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded border border-primary-200">
              Multi-Layer Comparative Radar
            </span>
          </div>
          <h3 className="text-xl font-bold text-text">{title}</h3>
          {subtitle && (
            <p className="text-xs text-text-muted leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Role Selectors & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex flex-col gap-1">
            <label htmlFor="primary-role-select" className="text-[11px] font-semibold text-text-muted">
              Primary Target:
            </label>
            <select
              id="primary-role-select"
              aria-label="Primary Target Role"
              value={selectedPrimaryId}
              onChange={(e) => handlePrimaryChange(e.target.value)}
              className="text-xs font-semibold text-text bg-canvas border border-border rounded-lg px-2.5 py-1.5 min-h-[38px] focus-visible:ring-2 focus-visible:ring-focus"
            >
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="secondary-role-select" className="text-[11px] font-semibold text-text-muted">
              Compare Against:
            </label>
            <select
              id="secondary-role-select"
              aria-label="Secondary Comparison Role"
              value={selectedSecondaryId}
              onChange={(e) => handleSecondaryChange(e.target.value)}
              disabled={!showSecondary}
              className="text-xs font-semibold text-text bg-canvas border border-border rounded-lg px-2.5 py-1.5 min-h-[38px] disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-focus"
            >
              {availableRoles
                .filter((r) => r.id !== selectedPrimaryId)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Layer Visibility Toggles Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-canvas/70 border border-border p-3 rounded-lg">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Candidate Layer Legend */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-900 border border-primary-950" />
            <span className="font-semibold text-text">Candidate Verified Accuracy</span>
          </div>

          {/* Primary Target Benchmark Legend */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 bg-amber-500 border-t-2 border-dashed border-amber-500" />
            <span className="font-medium text-amber-900 dark:text-amber-400">
              Primary Target ({primaryRole?.name})
            </span>
          </div>

          {/* Secondary Role Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showSecondary}
              onChange={(e) => setShowSecondary(e.target.checked)}
              className="rounded border-border text-cyan-600 focus:ring-cyan-500"
            />
            <span className="w-4 h-0.5 bg-cyan-500 border-t-2 border-dashed border-cyan-500" />
            <span className="font-medium text-cyan-900 dark:text-cyan-400">
              Secondary Role Overlay
            </span>
          </label>

          {/* Top Decile Cohort Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCohort}
              onChange={(e) => setShowCohort(e.target.checked)}
              className="rounded border-border text-emerald-600 focus:ring-emerald-500"
            />
            <span className="w-4 h-0.5 bg-emerald-500 border-t-2 border-dotted border-emerald-500" />
            <span className="font-medium text-emerald-900 dark:text-emerald-400">
              90th Percentile Cohort
            </span>
          </label>
        </div>

        <span className="text-[11px] text-text-muted italic">
          Click any radar axis node to inspect domain details
        </span>
      </div>

      {/* Main Visualizer Body: SVG Radar + Inspected Domain Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* SVG Radar Chart Column */}
        <div className="lg:col-span-7 flex justify-center items-center py-2">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[380px] sm:max-w-[430px] h-auto overflow-visible select-none"
            role="img"
            aria-label="Multi-Role Architectural Radar Chart"
          >
            {/* Concentric Grid Polygons */}
            {gridPolygons.map((pts, idx) => (
              <polygon
                key={`grid-${idx}`}
                points={pts}
                fill={idx % 2 === 0 ? 'currentColor' : 'none'}
                className={idx % 2 === 0 ? 'text-canvas/50' : ''}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
            ))}

            {/* Grid Percentage Scale Markers */}
            {levels.map((lvl) => {
              const y = center - lvl * maxR;
              return (
                <text
                  key={`lvl-${lvl}`}
                  x={center + 5}
                  y={y - 2}
                  fontSize="9"
                  fill="#94a3b8"
                  fontWeight="600"
                  fontFamily="monospace"
                >
                  {Math.round(lvl * 100)}%
                </text>
              );
            })}

            {/* Radial Spokes */}
            {candidateDomains.map((_, i) => {
              const { x, y } = getCoordinates(i, 1.0);
              return (
                <line
                  key={`spoke-${i}`}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1.2"
                />
              );
            })}

            {/* Layer 4: Cohort Top Decile Polygon (Emerald Dotted) */}
            {showCohort && (
              <polygon
                points={cohortPoints}
                fill="#10b981"
                fillOpacity="0.08"
                stroke="#059669"
                strokeWidth="2"
                strokeDasharray="2 3"
              />
            )}

            {/* Layer 3: Secondary Role Benchmark Polygon (Cyan Dashed) */}
            {showSecondary && (
              <polygon
                points={secondaryPoints}
                fill="#06b6d4"
                fillOpacity="0.12"
                stroke="#0891b2"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            )}

            {/* Layer 2: Primary Role Benchmark Polygon (Amber Dashed) */}
            <polygon
              points={primaryPoints}
              fill="#f59e0b"
              fillOpacity="0.15"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="5 4"
            />

            {/* Layer 1: Candidate Accuracy Polygon (Solid Primary) */}
            <polygon
              points={candidatePoints}
              fill="#1e3a8a"
              fillOpacity="0.30"
              stroke="#1e3a8a"
              strokeWidth="3"
            />

            {/* Interactive Candidate Vertices Nodes */}
            {candidateDomains.map((d, i) => {
              const { x, y } = getCoordinates(i, d.candidateScore / 100);
              const isSelected = d.domainId === inspectedDomainId;
              const target = primaryRole?.benchmarks[d.domainId] ?? 75;
              const passes = d.candidateScore >= target;

              return (
                <g
                  key={`pt-${d.domainId}`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setInspectedDomainId(d.domainId)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${d.name}, Candidate Score: ${d.candidateScore}%`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setInspectedDomainId(d.domainId);
                    }
                  }}
                >
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="9"
                      fill="none"
                      stroke="#1e3a8a"
                      strokeWidth="2"
                      className="animate-ping opacity-75"
                    />
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? '6.5' : '5'}
                    fill={passes ? '#10b981' : '#f59e0b'}
                    stroke={isSelected ? '#1e3a8a' : '#ffffff'}
                    strokeWidth={isSelected ? '2.5' : '2'}
                  />
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#1e293b"
                    className="select-none pointer-events-none font-mono"
                  >
                    {d.candidateScore}%
                  </text>
                </g>
              );
            })}

            {/* Radial Axis Labels */}
            {candidateDomains.map((d, i) => {
              const angle = (2 * Math.PI * i) / N - Math.PI / 2;
              const labelR = maxR + 26;
              const lx = center + labelR * Math.cos(angle);
              const ly = center + labelR * Math.sin(angle);
              const isSelected = d.domainId === inspectedDomainId;

              let anchor: 'start' | 'middle' | 'end' = 'middle';
              if (Math.cos(angle) > 0.3) anchor = 'start';
              else if (Math.cos(angle) < -0.3) anchor = 'end';

              return (
                <text
                  key={`label-${d.domainId}`}
                  x={lx}
                  y={ly}
                  textAnchor={anchor}
                  dominantBaseline="central"
                  fontSize={isSelected ? '11' : '10'}
                  fontWeight={isSelected ? '800' : '600'}
                  fill={isSelected ? '#1e3a8a' : '#475569'}
                  className="cursor-pointer hover:fill-primary-700 transition-colors"
                  onClick={() => setInspectedDomainId(d.domainId)}
                >
                  {d.shortName}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Inspected Domain Detail Card Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-canvas border border-border rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Domain Deep-Dive
                </span>
                <h4 className="text-base font-bold text-text mt-0.5">
                  {inspectedDomain.name}
                </h4>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  isPrimaryPassing
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {isPrimaryPassing ? '✓ Target Met' : '⚡ Gap Identified'}
              </span>
            </div>

            {/* Score Comparison Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
                <span className="text-[10px] font-medium text-text-muted">Candidate Score</span>
                <p className="text-lg font-mono font-extrabold text-primary-900 dark:text-primary-400">
                  {inspectedDomain.candidateScore}%
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5">
                <span className="text-[10px] font-medium text-text-muted truncate block">
                  {primaryRole?.name.split(' ')[0]} Target
                </span>
                <p className="text-lg font-mono font-extrabold text-amber-800 dark:text-amber-400">
                  {inspectedPrimaryTarget}%
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-surface border border-border space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] font-medium text-text-muted">90th Percentile</span>
                <p className="text-lg font-mono font-extrabold text-emerald-800 dark:text-emerald-400">
                  {inspectedCohortTarget}%
                </p>
              </div>
            </div>

            {/* Comparative Gap Status */}
            <div className="p-3 rounded-lg bg-surface border border-border text-xs space-y-1.5">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-text-muted">Primary Role Delta:</span>
                <span
                  className={`font-mono font-bold ${
                    inspectedDelta >= 0 ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {inspectedDelta >= 0 ? `+${inspectedDelta}%` : `${inspectedDelta}%`}
                </span>
              </div>
              {showSecondary && (
                <div className="flex items-center justify-between font-semibold text-text-muted">
                  <span>{secondaryRole?.name.split(' ')[0]} Delta:</span>
                  <span className="font-mono font-bold text-cyan-800 dark:text-cyan-400">
                    {inspectedDomain.candidateScore - inspectedSecondaryTarget >= 0
                      ? `+${inspectedDomain.candidateScore - inspectedSecondaryTarget}%`
                      : `${inspectedDomain.candidateScore - inspectedSecondaryTarget}%`}
                  </span>
                </div>
              )}
              <p className="text-text-muted text-[11px] leading-relaxed pt-1">
                {isPrimaryPassing
                  ? `Candidate exceeds the hiring benchmark for ${primaryRole?.name} in this domain by ${inspectedDelta} percentage points.`
                  : `Candidate has a ${Math.abs(inspectedDelta)}% deficit against recruiter benchmark criteria for ${primaryRole?.name}. Structured revision recommended.`}
              </p>
            </div>

            {/* Quick Action Deep Links */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                href={
                  inspectedDomain.practiceTopicSlug
                    ? (`/practice/${inspectedDomain.practiceTopicSlug}` as const)
                    : '/practice'
                }
                className="flex-1"
              >
                <Button variant="primary" size="sm" className="w-full text-xs font-semibold">
                  Practice {inspectedDomain.shortName} →
                </Button>
              </Link>
              {inspectedDomain.sandboxTab && (
                <Link href="/sandbox" className="shrink-0">
                  <Button variant="secondary" size="sm" className="text-xs">
                    ⚡ Open Sandbox
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Domain-by-Domain Differential Strip */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-text uppercase tracking-wider text-[11px]">
            Domain-by-Domain Differential ({primaryRole?.name})
          </span>
          <span className="text-text-muted text-[11px]">
            Positive values indicate competitive advantage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {candidateDomains.map((d) => {
            const target = primaryRole?.benchmarks[d.domainId] ?? 75;
            const delta = d.candidateScore - target;
            const isPassing = delta >= 0;

            return (
              <div
                key={d.domainId}
                onClick={() => setInspectedDomainId(d.domainId)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  d.domainId === inspectedDomainId
                    ? 'bg-primary-50/50 border-primary-300 ring-1 ring-primary-300'
                    : 'bg-canvas border-border hover:border-border-hover'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text truncate max-w-[150px]">
                    {d.shortName}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      isPassing ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {isPassing ? `+${delta}%` : `${delta}%`}
                  </span>
                </div>

                {/* Progress Visualizer */}
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isPassing ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, d.candidateScore)}%` }}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-slate-900 dark:bg-slate-100"
                      style={{ left: `${target}%` }}
                      title={`Benchmark Target: ${target}%`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                    <span>Score: {d.candidateScore}%</span>
                    <span>Target: {target}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
