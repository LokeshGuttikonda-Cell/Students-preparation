'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRoles, type RoleTrackItem } from '../../../../lib/roles-client';
import {
  getCohortReadiness,
  type CohortReadinessResponse,
  type ReadinessBand,
} from '../../../../lib/cohort-client';
import { Button } from '../../../../components/ui/Button';

export default function CohortAnalyticsPage() {
  const [roles, setRoles] = useState<RoleTrackItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [readiness, setReadiness] = useState<CohortReadinessResponse | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingReadiness, setIsLoadingReadiness] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // What-If Competency ROI Simulator State
  const [simulatedTopicId, setSimulatedTopicId] = useState<string>('');
  const [boostPercent, setBoostPercent] = useState<number>(15);

  useEffect(() => {
    async function loadRoles() {
      try {
        setIsLoadingRoles(true);
        const rolesData = await getRoles().catch(() => []);
        setRoles(rolesData);
        if (rolesData.length > 0) {
          setSelectedRoleId(rolesData[0].id);
        }
      } catch {
        setError('Failed to load career role tracks');
      } finally {
        setIsLoadingRoles(false);
      }
    }

    loadRoles();
  }, []);

  useEffect(() => {
    if (!selectedRoleId) return;

    async function loadReadiness() {
      try {
        setIsLoadingReadiness(true);
        setError(null);
        const data = await getCohortReadiness(selectedRoleId);
        setReadiness(data);
        if (data.keyDeficit) {
          setSimulatedTopicId(data.keyDeficit.topicId);
        } else if (data.competencyBenchmarks?.[0]) {
          setSimulatedTopicId(data.competencyBenchmarks[0].topicId);
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load cohort benchmark analytics',
        );
      } finally {
        setIsLoadingReadiness(false);
      }
    }

    loadReadiness();
  }, [selectedRoleId]);

  const getBandBadge = (band: string | null) => {
    switch (band) {
      case 'ELITE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            ★ ELITE (TOP 10%)
          </span>
        );
      case 'JOB_READY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            ◆ JOB READY (TOP 20%)
          </span>
        );
      case 'COMPETITIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            ✓ COMPETITIVE
          </span>
        );
      case 'NEEDS_REMEDIATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-300">
            ⚠ DEVELOPMENT NEEDED
          </span>
        );
      default:
        return null;
    }
  };

  // Helper formatting for dates
  const formatMilestoneDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoStr;
    }
  };

  // Trajectory calculations
  const history = readiness?.percentileHistory || [];
  const hasHistory = history.length > 0;
  const firstMilestone = history[0];
  const lastMilestone = history[history.length - 1];
  const totalDelta = hasHistory && history.length > 1 ? lastMilestone.percentile - firstMilestone.percentile : 0;
  const avgVelocity = hasHistory && history.length > 1 ? ((lastMilestone.percentile - firstMilestone.percentile) / (history.length - 1)).toFixed(1) : '0.0';

  let trajectoryStatus = {
    label: 'STEADY PROGRESSION',
    badgeStyle: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    icon: '📈',
    desc: 'Consistent positive percentile growth across consecutive evaluation cycles.',
  };
  const numVelocity = Number(avgVelocity);
  if (numVelocity >= 8) {
    trajectoryStatus = {
      label: 'RAPID ASCENT',
      badgeStyle: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: '🚀',
      desc: 'Exceptional longitudinal velocity across verified evaluation sittings.',
    };
  } else if (numVelocity >= 3) {
    trajectoryStatus = {
      label: 'STEADY PROGRESSION',
      badgeStyle: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      icon: '📈',
      desc: 'Consistent positive percentile growth across consecutive evaluation cycles.',
    };
  } else if (numVelocity >= -2) {
    trajectoryStatus = {
      label: 'STABLE PLATEAU',
      badgeStyle: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: '⏸',
      desc: 'Performance stabilized; targeted competency remediation will accelerate ascent.',
    };
  } else {
    trajectoryStatus = {
      label: 'REMEDIATION ADVISORY',
      badgeStyle: 'bg-rose-100 text-rose-900 border-rose-300',
      icon: '📉',
      desc: 'Negative percentile drift detected; foundational review advised.',
    };
  }

  // SVG Chart Geometry
  const svgWidth = 600;
  const svgHeight = 160;
  const padX = 48;
  const padTop = 24;
  const padBottom = 32;
  const plotW = svgWidth - 2 * padX;
  const plotH = svgHeight - padTop - padBottom;

  const points = history.map((m, i) => {
    const x = history.length > 1 ? padX + (i / (history.length - 1)) * plotW : svgWidth / 2;
    const y = padTop + ((100 - m.percentile) / 100) * plotH;
    return { x, y, milestone: m };
  });

  const pathD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  const areaD = points.length > 1
    ? `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
    : '';

  // What-If Simulation Computations
  const selectedComp = readiness?.competencyBenchmarks?.find((b) => b.topicId === simulatedTopicId) || readiness?.competencyBenchmarks?.[0];
  const curAccuracy = selectedComp?.studentAccuracy ?? 60;
  const simulatedAccuracy = Math.min(100, curAccuracy + boostPercent);
  const compCount = Math.max(1, readiness?.competencyBenchmarks?.length || 4);
  const compositeDelta = Math.round(boostPercent / compCount);
  const baseCandidateScore = readiness?.candidateScore ?? 70;
  const simulatedCandidateScore = Math.min(100, baseCandidateScore + compositeDelta);

  const median = readiness?.cohortMedianScore || 68;
  const topDecile = readiness?.cohortTopDecileScore || 88;
  const sigma = Math.max(8, (topDecile - median) / 1.282);
  const projectedZ = (simulatedCandidateScore - median) / sigma;

  // Logistic approximation to Gaussian CDF: 100 / (1 + exp(-1.702 * z))
  const normalCdf = (z: number) => 100 / (1 + Math.exp(-1.702 * z));
  const rawProjectedRank = Math.round(normalCdf(projectedZ));
  const basePercentile = readiness?.percentileRank ?? 50;
  const minGain = Math.max(1, Math.round(boostPercent / 4));
  const simulatedPercentile = Math.min(99, Math.max(basePercentile + minGain, rawProjectedRank));
  const percentileGain = simulatedPercentile - basePercentile;
  const cohortSample = readiness?.cohortSampleSize || 100;
  const peersOvertaken = Math.max(1, Math.round((percentileGain / 100) * cohortSample));

  let projectedBand: ReadinessBand = 'NEEDS_REMEDIATION';
  if (simulatedPercentile >= 90) projectedBand = 'ELITE';
  else if (simulatedPercentile >= 80) projectedBand = 'JOB_READY';
  else if (simulatedPercentile >= 50) projectedBand = 'COMPETITIVE';

  const isTierElevated = readiness?.readinessBand && projectedBand !== readiness.readinessBand && simulatedPercentile > (readiness.percentileRank ?? 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-800 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:text-slate-800 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Cohort Benchmarking</span>
        </nav>

        {/* Hero Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-50 rounded-full opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold mb-3">
              📊 Peer Relative Readiness Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Peer Percentile Cohort Benchmarking
            </h1>
            <p className="mt-2 text-slate-600 max-w-2xl text-sm sm:text-base leading-relaxed">
              Compare your performance against the global candidate cohort across role tracks. View Gaussian-calibrated percentile distributions, competency-level peer medians, and targeted recommendations to close capability gaps.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start justify-between gap-3">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Role Track Selector Tabs */}
        {isLoadingRoles ? (
          <div className="flex gap-2 animate-pulse">
            <div className="h-10 w-32 bg-slate-200 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200 rounded-xl" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {roles.map((track) => (
              <button
                key={track.id}
                onClick={() => setSelectedRoleId(track.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  selectedRoleId === track.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        {isLoadingReadiness ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-600 font-medium">
              Calculating cohort percentiles and competency benchmarks...
            </p>
          </div>
        ) : !readiness ? null : (
          <div className="space-y-8">
            {/* Section 1: Percentile Hero Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {readiness.roleName}
                    </h2>
                    {getBandBadge(readiness.readinessBand)}
                  </div>
                  <p className="text-sm text-slate-500">
                    Evaluated against a cohort pool of {readiness.cohortSampleSize} verified candidate assessments.
                  </p>
                </div>

                {readiness.percentileRank !== null ? (
                  <div className="text-left md:text-right bg-slate-50 p-4 rounded-xl border border-slate-100 min-w-[200px]">
                    <div className="text-3xl sm:text-4xl font-black text-primary-900">
                      {readiness.percentileRank}
                      <span className="text-xl font-bold text-slate-400">th</span>
                    </div>
                    <div className="text-xs font-semibold text-primary-800 uppercase tracking-wider mt-1">
                      Top {100 - readiness.percentileRank}% of Cohort
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 text-amber-900 p-4 rounded-xl border border-amber-200 text-xs max-w-sm">
                    <strong>No score recorded yet:</strong> Complete a timed mock test or AI interview to calculate your relative percentile standing.
                  </div>
                )}
              </div>

              {/* Benchmarking Comparison Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Your Score</span>
                  <span className="text-xl font-bold text-slate-900">
                    {readiness.candidateScore !== null
                      ? `${readiness.candidateScore}%`
                      : '—'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Cohort Median</span>
                  <span className="text-xl font-bold text-slate-700">
                    {readiness.cohortMedianScore}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Top 10% Cutoff</span>
                  <span className="text-xl font-bold text-amber-700">
                    {readiness.cohortTopDecileScore}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 block">Cohort Sample</span>
                  <span className="text-xl font-bold text-slate-700">
                    {readiness.cohortSampleSize}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Historical Percentile Velocity & Milestone Trajectory */}
            {hasHistory && (
              <div
                data-testid="percentile-velocity-hud"
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-2">
                      <span>{trajectoryStatus.icon}</span>
                      <span>Percentile Velocity Trajectory</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Historical Milestone Ascent & Velocity
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {trajectoryStatus.desc}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
                      <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">
                        Velocity Rate
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {totalDelta >= 0 ? `+${totalDelta}` : totalDelta} pts{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({numVelocity >= 0 ? `+${avgVelocity}` : avgVelocity} / sitting)
                        </span>
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 ${trajectoryStatus.badgeStyle}`}
                    >
                      {trajectoryStatus.label}
                    </span>
                  </div>
                </div>

                {/* SVG Velocity Chart */}
                <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner">
                  <div className="min-w-[540px]">
                    <svg
                      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                      className="w-full h-40 select-none"
                    >
                      <defs>
                        <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Reference Percentile Gridlines */}
                      {[
                        { pct: 90, label: '90th (Elite)' },
                        { pct: 75, label: '75th' },
                        { pct: 50, label: '50th (Median)' },
                        { pct: 25, label: '25th' },
                      ].map((grid) => {
                        const y = padTop + ((100 - grid.pct) / 100) * plotH;
                        return (
                          <g key={grid.pct}>
                            <line
                              x1={padX}
                              y1={y}
                              x2={svgWidth - padX}
                              y2={y}
                              stroke="#334155"
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />
                            <text
                              x={padX - 8}
                              y={y + 3}
                              fill="#64748b"
                              fontSize="9"
                              textAnchor="end"
                              fontFamily="monospace"
                            >
                              {grid.label}
                            </text>
                          </g>
                        );
                      })}

                      {/* Gradient Fill under Path */}
                      {areaD && <path d={areaD} fill="url(#velocityGrad)" />}

                      {/* Main Stroke Polyline */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Milestone Markers */}
                      {points.map((pt, i) => {
                        const isLatest = i === points.length - 1;
                        return (
                          <g key={pt.milestone.attemptId}>
                            {/* Outer Pulse for Latest */}
                            {isLatest && (
                              <circle
                                cx={pt.x}
                                cy={pt.y}
                                r="10"
                                fill="#818cf8"
                                opacity="0.3"
                                className="animate-ping"
                              />
                            )}
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={isLatest ? '6' : '4.5'}
                              fill={isLatest ? '#38bdf8' : '#818cf8'}
                              stroke="#0f172a"
                              strokeWidth="2"
                            />
                            <text
                              x={pt.x}
                              y={pt.y - 10}
                              fill={isLatest ? '#38bdf8' : '#f1f5f9'}
                              fontSize="11"
                              fontWeight="700"
                              textAnchor="middle"
                            >
                              {pt.milestone.percentile}th
                            </text>
                            <text
                              x={pt.x}
                              y={svgHeight - 10}
                              fill="#94a3b8"
                              fontSize="9"
                              textAnchor="middle"
                            >
                              M{i + 1}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Milestone Chronology Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {history.map((m, idx) => {
                    const isLatest = idx === history.length - 1;
                    return (
                      <div
                        key={m.attemptId}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isLatest
                            ? 'bg-indigo-50/70 border-indigo-200 ring-1 ring-indigo-300'
                            : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
                          <span>Milestone {idx + 1}</span>
                          <span>{formatMilestoneDate(m.date)}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate mb-2" title={m.assessmentTitle}>
                          {m.assessmentTitle}
                        </h4>
                        <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-sm font-black text-indigo-700">
                            {m.percentile}
                            <span className="text-[10px] font-medium text-slate-400">th %ile</span>
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            Score: {m.score}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 3: Cohort Score Distribution Histogram */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">
                    Cohort Score Distribution
                  </h3>
                  <p className="text-xs text-slate-500">
                    Histogram of candidate assessment scores across 10 deciles.
                  </p>
                </div>
                {readiness.candidateScore !== null && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-600 inline-block" />
                    You are in the{' '}
                    {
                      (readiness.distribution || []).find((b) => b.isStudentBucket)?.range
                    }{' '}
                    bucket
                  </span>
                )}
              </div>

              {/* Histogram visualization */}
              <div className="pt-6 pb-2">
                <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 border-b border-slate-200 pb-2">
                  {(readiness.distribution || []).map((bucket) => {
                    const isCandidate = bucket.isStudentBucket;
                    const heightPercent = Math.max(8, bucket.percentage * 3.5);

                    return (
                      <div
                        key={bucket.range}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-10">
                          {bucket.range}: {bucket.count} candidates ({bucket.percentage}%)
                        </div>

                        {/* Bar */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-md transition-all ${
                            isCandidate
                              ? 'bg-primary-600 ring-2 ring-primary-400 ring-offset-2'
                              : 'bg-slate-200 group-hover:bg-slate-300'
                          }`}
                        />
                        {/* Bucket label */}
                        <span className="text-[10px] font-mono text-slate-400 truncate max-w-full">
                          {bucket.minScore}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section 4: Competency-Level Peer Benchmarks */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Competency-Level Cohort Benchmarking
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sub-skill accuracy comparison against the cohort median and top 10% benchmark.
                </p>
              </div>

              <div className="space-y-4">
                {(readiness.competencyBenchmarks || []).map((comp) => {
                  const isPositive = comp.gapFromMedian >= 0;

                  return (
                    <div
                      key={comp.topicId}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800 text-sm">
                          {comp.topicName}
                        </span>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isPositive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isPositive
                              ? `+${comp.gapFromMedian}% above median`
                              : `${comp.gapFromMedian}% below median`}
                          </span>
                          <span className="text-xs font-semibold text-slate-600">
                            Accuracy: {comp.studentAccuracy}%
                          </span>
                        </div>
                      </div>

                      {/* Visual comparative bar */}
                      <div className="space-y-1">
                        <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden relative">
                          {/* Student Accuracy bar */}
                          <div
                            style={{ width: `${Math.min(100, comp.studentAccuracy)}%` }}
                            className={`h-full rounded-full ${
                              isPositive ? 'bg-emerald-600' : 'bg-rose-500'
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>0%</span>
                          <span className="text-slate-600">
                            Cohort Median: {comp.cohortMedian}%
                          </span>
                          <span className="text-amber-700">
                            Top 10%: {comp.topDecileBenchmark}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Interactive What-If Competency ROI Simulator */}
            {readiness.competencyBenchmarks && readiness.competencyBenchmarks.length > 0 && (
              <div
                data-testid="cohort-what-if-simulator"
                className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold mb-2">
                      🔬 Interactive Simulation Engine
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      What-If Competency ROI Simulator
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Model the statistical impact of targeting capability deficits. Adjust topic mastery to simulate real-time percentile shifts and peer rank advancement.
                    </p>
                  </div>
                  {isTierElevated && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold self-start sm:self-auto animate-pulse">
                      🎉 Tier Elevation: {readiness.readinessBand} ➔ {projectedBand}
                    </span>
                  )}
                </div>

                {/* Simulation Control Strip */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  {/* Topic Select */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="topic-selector"
                      className="text-xs font-semibold text-slate-700 block"
                    >
                      Target Competency Domain:
                    </label>
                    <select
                      id="topic-selector"
                      aria-label="Target Competency Domain"
                      value={simulatedTopicId}
                      onChange={(e) => setSimulatedTopicId(e.target.value)}
                      className="w-full text-sm font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {readiness.competencyBenchmarks.map((c) => (
                        <option key={c.topicId} value={c.topicId}>
                          {c.topicName} (Current: {c.studentAccuracy}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Boost Range Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="boost-slider"
                        className="text-xs font-semibold text-slate-700"
                      >
                        Target Accuracy Boost:
                      </label>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                        +{boostPercent}% Improvement
                      </span>
                    </div>
                    <input
                      id="boost-slider"
                      type="range"
                      min={5}
                      max={25}
                      step={5}
                      value={boostPercent}
                      onChange={(e) => setBoostPercent(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>+5%</span>
                      <span>+10%</span>
                      <span>+15%</span>
                      <span>+20%</span>
                      <span>+25%</span>
                    </div>
                  </div>
                </div>

                {/* Projected Impact Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block font-medium">
                      Simulated Topic Accuracy
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-slate-900">
                        {simulatedAccuracy}%
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        (+{boostPercent}%)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      From base {curAccuracy}%
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block font-medium">
                      Projected Overall Score
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-slate-900">
                        {simulatedCandidateScore}%
                      </span>
                      <span className="text-xs font-bold text-indigo-600">
                        (+{compositeDelta}%)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      From base {baseCandidateScore}%
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block font-medium">
                      Projected Percentile
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold text-emerald-700">
                        {simulatedPercentile}th
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        (+{percentileGain} pts)
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      From {basePercentile}th percentile
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-xs text-slate-500 block font-medium">
                      Peers Overtaken
                    </span>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-indigo-900">
                        +{peersOvertaken}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        candidates
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Cohort pool: {readiness.cohortSampleSize}
                    </span>
                  </div>
                </div>

                {/* Simulation Action CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <p className="text-xs text-slate-700 leading-relaxed max-w-xl">
                    Targeting <strong>{selectedComp?.topicName}</strong> yields highest ROI, advancing you from the{' '}
                    <strong>{basePercentile}th</strong> to the <strong>{simulatedPercentile}th</strong> percentile.
                  </p>
                  <Link href="/practice" className="shrink-0">
                    <Button variant="primary" className="text-xs py-2 px-4 shadow-md">
                      Practice {selectedComp?.topicName || 'Topic'} to Unlock +{percentileGain}% Boost →
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Section 6: Precision Gap Remediation Card */}
            {readiness.keyDeficit && (
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
                    🎯 Highest Priority Capability Deficit
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {readiness.keyDeficit.topicName}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Your accuracy ({readiness.keyDeficit.studentAccuracy}%) is{' '}
                    <strong className="text-rose-300">
                      {Math.abs(readiness.keyDeficit.gapFromMedian)}% below
                    </strong>{' '}
                    the peer median ({readiness.keyDeficit.cohortMedian}%). Bridging this topic deficit represents your highest statistical leverage for achieving Job-Ready standing.
                  </p>
                </div>

                <div className="shrink-0">
                  <Link href="/practice">
                    <Button variant="primary" className="text-xs py-2 px-4 shadow-lg">
                      Practice Topic Now →
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
