'use client';

import React from 'react';
import Link from 'next/link';
import type { RoleReadinessData } from '../../lib/analytics-client';
import type { RoleTrackItem } from '../../lib/roles-client';
import { RoleReadinessRadar } from './RoleReadinessRadar';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface RoleReadinessWidgetProps {
  data: RoleReadinessData;
  rolesList: RoleTrackItem[];
  selectedRoleId: string;
  userTargetRoleId?: string | null;
  onSelectRole: (roleId: string) => void;
  onSaveAsTarget: (roleId: string) => void;
  isSavingTarget?: boolean;
}

export function RoleReadinessWidget({
  data,
  rolesList,
  selectedRoleId,
  userTargetRoleId,
  onSelectRole,
  onSaveAsTarget,
  isSavingTarget = false,
}: RoleReadinessWidgetProps) {
  const isTarget = userTargetRoleId === data.role.id;
  const primaryMockTest = data.benchmarkMockTests[0];

  // Tier configuration
  const tierConfig = {
    READY: {
      label: 'Ready for Interviews',
      badgeClass: 'bg-success-50 text-success-700 border-success-200',
      ringColor: '#1b7340', // success-700
      icon: '✓',
    },
    COMPETITIVE: {
      label: 'Competitive Profile',
      badgeClass: 'bg-accent-50 text-accent-700 border-accent-200',
      ringColor: '#b45309', // accent-700
      icon: '★',
    },
    NEEDS_PRACTICE: {
      label: 'Foundation in Progress',
      badgeClass: 'bg-warning-50 text-warning-800 border-warning-200',
      ringColor: '#d97706', // warning-600
      icon: '⚡',
    },
    BEGINNER: {
      label: 'Early Preparation',
      badgeClass: 'bg-canvas text-text-muted border-border',
      ringColor: '#94a3b8', // slate-400
      icon: '○',
    },
  }[data.readinessTier] || {
    label: 'Assessment Required',
    badgeClass: 'bg-canvas text-text-muted border-border',
    ringColor: '#94a3b8',
    icon: '○',
  };

  // SVG Gauge calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.rri / 100) * circumference;

  return (
    <Card className="p-6 sm:p-8 border-border shadow-xs space-y-6">
      {/* Top Header: Role Selector & Target Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
              Role Readiness Index (RRI)
            </span>
            {isTarget ? (
              <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2.5 py-0.5 rounded-full border border-primary-200">
                ★ Active Target Role
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSaveAsTarget(data.role.id)}
                disabled={isSavingTarget}
                className="text-[11px] font-semibold text-primary-700 hover:text-primary-800 underline min-h-[44px] flex items-center"
              >
                {isSavingTarget ? 'Saving...' : 'Set as My Target Role'}
              </button>
            )}
          </div>
          <h2 className="text-2xl font-bold text-text">
            {data.role.name}
          </h2>
        </div>

        {/* Role Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label htmlFor="role-select" className="text-xs font-semibold text-text-muted shrink-0">
            View Role:
          </label>
          <select
            id="role-select"
            value={selectedRoleId}
            onChange={(e) => onSelectRole(e.target.value)}
            className="text-sm font-semibold text-text bg-canvas border border-border rounded-lg px-3 py-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-hidden"
          >
            {rolesList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Readiness Meter & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Circular Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-canvas rounded-xl border border-border text-center space-y-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-border"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={tierConfig.ringColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-primary-900 tabular">
                {data.rri}%
              </span>
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                RRI Score
              </span>
            </div>
          </div>

          <div
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${tierConfig.badgeClass}`}
          >
            <span>{tierConfig.icon}</span>
            <span>{tierConfig.label}</span>
          </div>
        </div>

        {/* Diagnostic Summary & Benchmark CTA */}
        <div className="md:col-span-2 space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-text">
              Recruiter Benchmark Status
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              {data.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {primaryMockTest ? (
              <Link href={`/mock-tests/${primaryMockTest.id}`}>
                <Button variant="primary" size="md">
                  Take Benchmark Mock Test ({primaryMockTest.durationMinutes}m) →
                </Button>
              </Link>
            ) : (
              <Link href="/mock-tests">
                <Button variant="primary" size="md">
                  Browse Role Mock Tests →
                </Button>
              </Link>
            )}

            <Link href={`/roles/${data.role.slug}`}>
              <Button variant="secondary" size="md">
                View Role Blueprint &amp; Syllabus
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Competency Spider Radar Matrix */}
      {data.competencies && data.competencies.length >= 3 && (
        <div className="pt-5 border-t border-border">
          <RoleReadinessRadar
            dimensions={data.competencies.map((c) => ({
              dimension: c.topicName,
              score: c.studentAccuracy,
              target: c.benchmarkAccuracy,
            }))}
            title={`${data.role.name} Competency Spider Matrix`}
            subtitle="Verified diagnostic accuracy vs recruiter benchmark cutoffs across evaluated topics"
          />
        </div>
      )}
    </Card>
  );
}
