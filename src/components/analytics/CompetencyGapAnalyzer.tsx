'use client';

import React from 'react';
import Link from 'next/link';
import type { RoleReadinessCompetency } from '../../lib/analytics-client';
import { Button } from '../ui/Button';

export interface CompetencyGapAnalyzerProps {
  competencies: RoleReadinessCompetency[];
  roleName: string;
}

export function CompetencyGapAnalyzer({
  competencies,
  roleName,
}: CompetencyGapAnalyzerProps) {
  if (!competencies || competencies.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-text">
          {roleName} Competency Gap Analyzer
        </h3>
        <p className="text-sm text-text-muted">
          Compare your verified diagnostic accuracy against recruiter benchmarks for each evaluated topic.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-border text-xs uppercase tracking-wider text-text-muted font-semibold">
              <tr>
                <th className="px-5 py-3">Competency Topic</th>
                <th className="px-5 py-3 text-center">Weight</th>
                <th className="px-5 py-3 text-center">Benchmark</th>
                <th className="px-5 py-3 text-center">Your Accuracy</th>
                <th className="px-5 py-3 text-center">Readiness Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {competencies.map((comp) => {
                const isCleared = comp.status === 'READY';
                const isNotStarted = comp.status === 'NOT_STARTED';

                return (
                  <tr key={comp.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-text">
                        {comp.topicName}
                      </div>
                      <div className="text-xs text-text-muted">
                        {comp.subjectName}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center tabular font-semibold text-primary-700">
                      {comp.weightPercentage}%
                    </td>

                    <td className="px-5 py-4 text-center tabular font-medium text-text-muted">
                      ≥ {comp.benchmarkAccuracy}%
                    </td>

                    <td className="px-5 py-4 text-center">
                      {isNotStarted ? (
                        <span className="text-xs font-semibold text-text-muted italic">
                          No attempts
                        </span>
                      ) : (
                        <div className="space-y-1 inline-block">
                          <span
                            className={`text-sm font-bold tabular ${
                              isCleared ? 'text-success-700' : 'text-error-600'
                            }`}
                          >
                            {comp.studentAccuracy}%
                          </span>
                          <div className="w-20 bg-canvas rounded-full h-1.5 overflow-hidden border border-border">
                            <div
                              className={`h-full rounded-full ${
                                isCleared ? 'bg-success-600' : 'bg-error-500'
                              }`}
                              style={{ width: `${Math.min(100, comp.studentAccuracy)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-center">
                      {isCleared && (
                        <span className="text-xs font-semibold text-success-700 bg-success-50 px-2.5 py-1 rounded-full border border-success-200 inline-flex items-center gap-1">
                          <span>✓</span> Cleared
                        </span>
                      )}
                      {!isCleared && !isNotStarted && (
                        <span className="text-xs font-semibold text-warning-800 bg-warning-50 px-2.5 py-1 rounded-full border border-warning-200 inline-flex items-center gap-1">
                          <span>⚡</span> -{comp.gap}% Deficit
                        </span>
                      )}
                      {isNotStarted && (
                        <span className="text-xs font-semibold text-text-muted bg-canvas px-2.5 py-1 rounded-full border border-border inline-flex items-center gap-1">
                          <span>○</span> Needs Drill
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <Link href={`/practice/${comp.practiceTopicId}`}>
                        <Button
                          variant={isCleared ? 'secondary' : 'primary'}
                          size="sm"
                          className="min-h-[44px]"
                        >
                          Practice Topic →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
