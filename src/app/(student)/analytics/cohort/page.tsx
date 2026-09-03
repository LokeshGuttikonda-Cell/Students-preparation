'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRoles, type RoleTrackItem } from '../../../../lib/roles-client';
import {
  getCohortReadiness,
  type CohortReadinessResponse,
} from '../../../../lib/cohort-client';
import { Button } from '../../../../components/ui/Button';

export default function CohortAnalyticsPage() {
  const [roles, setRoles] = useState<RoleTrackItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [readiness, setReadiness] = useState<CohortReadinessResponse | null>(null);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingReadiness, setIsLoadingReadiness] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

            {/* Section 2: Cohort Score Distribution Histogram */}
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
                      readiness.distribution.find((b) => b.isStudentBucket)?.range
                    }{' '}
                    bucket
                  </span>
                )}
              </div>

              {/* Histogram visualization */}
              <div className="pt-6 pb-2">
                <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 border-b border-slate-200 pb-2">
                  {readiness.distribution.map((bucket) => {
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

            {/* Section 3: Competency-Level Peer Benchmarks */}
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
                {readiness.competencyBenchmarks.map((comp) => {
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

            {/* Section 4: Precision Gap Remediation Card */}
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
