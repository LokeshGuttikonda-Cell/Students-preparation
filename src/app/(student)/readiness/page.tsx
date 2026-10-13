'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DEFAULT_ROLES_CATALOG } from '../../../lib/catalog-data';
import {
  generateReadinessReport,
  getSavedRoadmapProgress,
  saveRoadmapProgress,
  downloadRoadmapPdf,
  type PlacementReadinessReport,
  type CompetencyAssessment,
} from '../../../lib/readiness-client';

// ---------------------------------------------------------------------------
// Pure SVG Radar / Spider Chart Component
// ---------------------------------------------------------------------------
function RoleReadinessRadar({
  competencies,
}: {
  competencies: CompetencyAssessment[];
}) {
  const size = 320;
  const center = size / 2;
  const radius = 110;
  const count = competencies.length;

  if (count < 3) return null;

  // Compute angle for each dimension
  const angleStep = (Math.PI * 2) / count;

  // Concentric polygon levels: 25%, 50%, 75%, 100%
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * Math.min(1.0, Math.max(0.1, valueRatio));
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Student Score Polygon Points
  const studentPoints = competencies
    .map((c, i) => {
      const { x, y } = getCoordinates(i, c.score / 100);
      return x.toFixed(1) + ',' + y.toFixed(1);
    })
    .join(' ');

  // Target Benchmark Polygon Points
  const targetPoints = competencies
    .map((c, i) => {
      const { x, y } = getCoordinates(i, c.target / 100);
      return x.toFixed(1) + ',' + y.toFixed(1);
    })
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg
        width={size}
        height={size}
        className="overflow-visible"
        aria-label="Role Readiness Competency Spider Matrix"
      >
        {/* Background Concentric Webs */}
        {levels.map((lvl) => {
          const webPoints = Array.from({ length: count })
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return x.toFixed(1) + ',' + y.toFixed(1);
            })
            .join(' ');
          return (
            <polygon
              key={lvl}
              points={webPoints}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray={lvl === 1.0 ? undefined : '2,2'}
            />
          );
        })}

        {/* Axis Lines from Center to Perimeter */}
        {competencies.map((_, i) => {
          const { x, y } = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark Cutoff Polygon (Amber dashed) */}
        <polygon
          points={targetPoints}
          fill="rgba(245, 158, 11, 0.08)"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4,3"
        />

        {/* Student Actual Score Polygon (Indigo / Blue solid) */}
        <polygon
          points={studentPoints}
          fill="rgba(79, 70, 229, 0.25)"
          stroke="#4f46e5"
          strokeWidth="2.5"
        />

        {/* Student Data Points & Tooltips */}
        {competencies.map((c, i) => {
          const { x, y } = getCoordinates(i, c.score / 100);
          const isMet = c.status === 'MET';
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4.5"
              fill={isMet ? '#10b981' : '#ef4444'}
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Dimension Labels */}
        {competencies.map((c, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelR = radius + 22;
          const lx = center + labelR * Math.cos(angle);
          const ly = center + labelR * Math.sin(angle);

          // Anchor alignment based on x position
          let anchor: 'inherit' | 'end' | 'middle' | 'start' = 'middle';
          if (Math.cos(angle) > 0.3) anchor = 'start';
          else if (Math.cos(angle) < -0.3) anchor = 'end';

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={anchor}
              fontSize="10"
              fontWeight="600"
              className="fill-neutral-700 select-none"
            >
              {c.dimension.length > 16
                ? c.dimension.substring(0, 14) + '...'
                : c.dimension}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 text-xs font-medium text-neutral-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
          <span>Candidate Diagnostic</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
          <span>Industry Benchmark (70%)</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function PlacementReadinessPage() {
  const [selectedRoleSlug, setSelectedRoleSlug] = useState<string>(
    DEFAULT_ROLES_CATALOG[0].slug,
  );
  const [customScores, setCustomScores] = useState<Record<string, number>>({});
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [claimedCredential, setClaimedCredential] = useState<string | null>(null);

  // Synchronize saved task progress from localStorage
  useEffect(() => {
    const saved = getSavedRoadmapProgress(selectedRoleSlug);
    setCompletedTasks(saved);
    setClaimedCredential(null);
  }, [selectedRoleSlug]);

  // Compute report based on selected role and interactive sliders
  const report: PlacementReadinessReport = useMemo(() => {
    return generateReadinessReport(selectedRoleSlug, customScores);
  }, [selectedRoleSlug, customScores]);

  // Handle task checkbox toggle
  const handleToggleTask = (taskId: string) => {
    const nextState = !completedTasks[taskId];
    const updated = saveRoadmapProgress(selectedRoleSlug, taskId, nextState);
    setCompletedTasks({ ...updated });
  };

  // Handle competency score adjustment
  const handleScoreChange = (dimension: string, val: number) => {
    setCustomScores((prev) => ({
      ...prev,
      [dimension]: val,
    }));
  };

  // Reset custom adjustments to baseline
  const handleResetScores = () => {
    setCustomScores({});
  };

  // Calculate overall roadmap progress percentage
  const totalRoadmapTasks = report.roadmap.reduce((acc, d) => acc + d.tasks.length, 0);
  const completedTaskCount = Object.values(completedTasks).filter(Boolean).length;
  const roadmapCompletionPct = totalRoadmapTasks > 0
    ? Math.round((completedTaskCount / totalRoadmapTasks) * 100)
    : 0;

  const tierBannerBg =
    report.tier === 'VERIFIED_READY'
      ? 'bg-success-50/50 border-success-200'
      : report.tier === 'NEARING_BENCHMARK'
      ? 'bg-accent-50/40 border-accent-200'
      : 'bg-primary-50/30 border-primary-200';

  const gaugeColor =
    report.tier === 'VERIFIED_READY'
      ? 'text-success-600'
      : report.tier === 'NEARING_BENCHMARK'
      ? 'text-accent-600'
      : 'text-primary-600';

  return (
    <div className="min-h-screen bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Breadcrumbs & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
              <Link href={'/dashboard' as Route} className="hover:underline">
                Dashboard
              </Link>
              <span>/</span>
              <span>Placement Profiler</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
              Placement Readiness Profiler
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Multi-dimensional competency spider matrix, skill gap detection, and 14-day remediation plan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Role Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="role-select" className="text-xs font-bold text-neutral-700">
                Target Track:
              </label>
              <select
                id="role-select"
                aria-label="Target Role Track"
                value={selectedRoleSlug}
                onChange={(e) => {
                  setSelectedRoleSlug(e.target.value);
                  setCustomScores({});
                }}
                className="text-sm font-medium border border-border rounded-md px-3 py-2 bg-surface text-neutral-800 shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
              >
                {DEFAULT_ROLES_CATALOG.map((role) => (
                  <option key={role.slug} value={role.slug}>
                    {role.name} ({role.targetLevel})
                  </option>
                ))}
              </select>
            </div>

            {/* Export Roadmap PDF */}
            <Button
              variant="secondary"
              size="sm"
              aria-label="Download Plan (PDF)"
              onClick={() => downloadRoadmapPdf(report)}
              className="flex items-center gap-1.5 font-semibold"
            >
              <svg className="w-4 h-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Plan (PDF)
            </Button>
          </div>
        </div>

        {/* Readiness Overview Score Banner */}
        <div className={'rounded-xl border p-6 shadow-xs transition-colors ' + tierBannerBg}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Circular Gauge Representation */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-neutral-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={gaugeColor}
                    strokeDasharray={report.overallScore + ', 100'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-neutral-900 tracking-tight">
                    {report.overallScore}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-neutral-500">Readiness</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-neutral-900">{report.roleName}</h2>
                  <Badge
                    variant={
                      report.tier === 'VERIFIED_READY'
                        ? 'success'
                        : report.tier === 'NEARING_BENCHMARK'
                        ? 'warning'
                        : 'neutral'
                    }
                  >
                    {report.tierLabel}
                  </Badge>
                </div>
                <p className="text-sm text-neutral-600 mt-1 max-w-xl">
                  {report.tier === 'VERIFIED_READY'
                    ? 'Congratulations! Your diagnostic mastery satisfies all primary campus hiring cutoffs. You are eligible to claim a verified readiness credential.'
                    : report.tier === 'NEARING_BENCHMARK'
                    ? 'You are within 15% of the primary hiring cutoff. Targeted remediation on highlighted blindspots will elevate you to interview-ready status.'
                    : 'Foundational gaps identified across key architectural competencies. Follow the structured 14-day study curriculum below to establish baseline mastery.'}
                </p>
              </div>
            </div>

            {/* Credential Action */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              {report.credentialEligible ? (
                <div>
                  {!claimedCredential ? (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => setClaimedCredential(report.credentialCode || 'SP-2026-VERIFIED')}
                      className="font-bold shadow-sm"
                    >
                      Claim Placement Credential
                    </Button>
                  ) : (
                    <div className="bg-surface border border-success-400 rounded-lg p-3 text-right shadow-xs">
                      <span className="text-xs font-semibold text-success-700 block">
                        Verified Credential Issued:
                      </span>
                      <code className="text-xs font-mono font-bold text-neutral-900 select-all">
                        {claimedCredential}
                      </code>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xs text-neutral-500 font-medium block">
                    Credential Unlocks at &ge; 75% Score
                  </span>
                  <span className="text-xs font-semibold text-primary-700">
                    Deficit: {Math.max(0, 75 - report.overallScore)}% remaining
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Matrix & Competency Sliders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Competency Adjuster */}
          <div className="lg:col-span-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Competency Diagnostics</CardTitle>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Simulate your test accuracy across each evaluated dimension.
                  </p>
                </div>
                {Object.keys(customScores).length > 0 && (
                  <button
                    onClick={handleResetScores}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    Reset Baseline
                  </button>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {report.competencies.map((comp) => (
                  <div key={comp.dimension} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-800">{comp.dimension}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-neutral-900">{comp.score}%</span>
                        <span className="text-neutral-400">/ Target {comp.target}%</span>
                        <Badge
                          variant={comp.status === 'MET' ? 'success' : 'error'}
                          className="text-[10px] py-0 px-1.5"
                        >
                          {comp.status === 'MET' ? 'Met' : 'Deficit'}
                        </Badge>
                      </div>
                    </div>
                    {/* Score Slider */}
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={comp.score}
                      aria-label={'Accuracy slider for ' + comp.dimension}
                      onChange={(e) =>
                        handleScoreChange(comp.dimension, parseInt(e.target.value, 10))
                      }
                      className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Identified Skill Gaps & Blindspots */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Detected Skill Gaps</span>
                  <Badge variant={report.skillGaps.length > 0 ? 'warning' : 'success'}>
                    {report.skillGaps.length} Action Items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {report.skillGaps.length === 0 ? (
                  <div className="p-4 rounded-lg bg-success-50 border border-success-200 text-center">
                    <p className="text-xs font-semibold text-success-800">
                      Excellent! Zero competency deficits detected for {report.roleName}.
                    </p>
                    <p className="text-xs text-success-600 mt-1">
                      Your test accuracy meets or surpasses the required hiring benchmarks.
                    </p>
                  </div>
                ) : (
                  report.skillGaps.map((gap) => (
                    <div
                      key={gap.topicId}
                      className="border border-border rounded-lg p-4 bg-surface hover:border-neutral-300 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-neutral-900">
                          {gap.topicName}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant={gap.priority === 'HIGH' ? 'error' : 'warning'}>
                            {gap.priority} Priority
                          </Badge>
                          <span className="text-xs font-mono font-bold text-error-600">
                            -{gap.deficit}% Deficit
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-600">{gap.recommendedAction}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <Link
                          href={gap.practiceUrl as Route}
                          className="text-xs font-bold text-primary-600 hover:text-primary-800 hover:underline"
                        >
                          Practice Drills &rarr;
                        </Link>
                        <span className="text-neutral-300">|</span>
                        <Link
                          href={gap.handbookUrl as Route}
                          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
                        >
                          Read Handbook
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Spider / Radar Visualization */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Competency Spider Matrix</CardTitle>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Multi-axial geometric map comparing candidate mastery against enterprise thresholds.
                </p>
              </CardHeader>
              <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
                <RoleReadinessRadar competencies={report.competencies} />

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-4 w-full mt-6 pt-6 border-t border-border">
                  <div className="bg-canvas p-3 rounded-lg border border-border text-center">
                    <span className="text-xs text-neutral-500 font-medium block">
                      Target Role Level
                    </span>
                    <span className="text-sm font-bold text-neutral-900">
                      {report.targetLevel}
                    </span>
                  </div>
                  <div className="bg-canvas p-3 rounded-lg border border-border text-center">
                    <span className="text-xs text-neutral-500 font-medium block">
                      Met Benchmarks
                    </span>
                    <span className="text-sm font-bold text-neutral-900">
                      {report.competencies.filter((c) => c.status === 'MET').length} of{' '}
                      {report.competencies.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 14-Day Remediation Curriculum Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
                14-Day Adaptive Remediation Study Roadmap
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                Structured daily drills, hands-on sandbox labs, and mock technical checkpoints.
              </p>
            </div>
            {/* Progress Tracker Bar */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-neutral-700">
                Roadmap Progress: {completedTaskCount}/{totalRoadmapTasks} ({roadmapCompletionPct}%)
              </span>
              <div className="w-28 h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: roadmapCompletionPct + '%' }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.roadmap.map((day) => {
              const dayTasks = day.tasks;
              const completedDayCount = dayTasks.filter((t) => completedTasks[t.id]).length;
              const isDayComplete = completedDayCount === dayTasks.length && dayTasks.length > 0;

              return (
                <Card
                  key={day.day}
                  className={'transition-colors ' + (isDayComplete ? 'border-success-300 bg-success-50/20' : 'border-border')}
                >
                  <CardHeader className="py-4 px-5 flex flex-row items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-800">
                          Day {day.day}
                        </span>
                        <span className="text-xs font-semibold text-primary-700">
                          {day.domain}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 mt-1">{day.title}</h4>
                    </div>
                    {isDayComplete && (
                      <Badge variant="success" className="text-[10px]">
                        Complete
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="px-5 py-4 space-y-3">
                    <p className="text-xs text-neutral-600">{day.description}</p>
                    <div className="space-y-2 pt-1 border-t border-border">
                      {day.tasks.map((task) => {
                        const isChecked = !!completedTasks[task.id];
                        return (
                          <div
                            key={task.id}
                            className="flex items-start justify-between gap-3 text-xs"
                          >
                            <label className="flex items-start gap-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTask(task.id)}
                                className="mt-0.5 rounded-sm border-neutral-300 text-primary-600 focus:ring-primary-500"
                              />
                              <span
                                className={'font-medium ' + (isChecked ? 'line-through text-neutral-400' : 'text-neutral-800')}
                              >
                                {task.text}
                              </span>
                            </label>
                            {task.link && (
                              <Link
                                href={task.link as Route}
                                className="shrink-0 font-semibold text-primary-600 hover:text-primary-800 hover:underline"
                              >
                                {task.linkText || 'Open'} &rarr;
                              </Link>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
