'use client';

import React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { AttemptHistoryItem } from '../../lib/analytics-client';
import { Button } from '../ui/Button';

export interface AttemptHistoryTableProps {
  items: AttemptHistoryItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const AttemptHistoryTable: React.FC<AttemptHistoryTableProps> = ({
  items,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  if (items.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12 bg-surface rounded-xl border border-border p-6 text-text-muted">
        <p className="text-base font-medium">No assessment history yet.</p>
        <p className="text-xs text-text-muted mt-1">
          Take a topic practice session or timed mock test to track your performance history here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas border-b border-border text-xs uppercase tracking-wider text-text-muted font-semibold">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Assessment Title</th>
              <th className="px-5 py-3 text-center">Score</th>
              <th className="px-5 py-3 text-center">Accuracy</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => {
              const formattedDate = new Date(item.startedAt).toLocaleDateString(
                undefined,
                { month: 'short', day: 'numeric', year: 'numeric' },
              );

              let statusBadge = (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                  {item.status}
                </span>
              );

              if (item.status === 'SUBMITTED') {
                statusBadge = (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-success-50 text-success-700 border border-success-500/30">
                    Completed
                  </span>
                );
              } else if (item.status === 'EXPIRED') {
                statusBadge = (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-warning-50 text-warning-800 border border-warning-200">
                    Expired
                  </span>
                );
              } else if (item.status === 'IN_PROGRESS') {
                statusBadge = (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-500/30">
                    In Progress
                  </span>
                );
              }

              const resultHref = item.mockTestId
                ? `/mock-tests/${item.mockTestId}/results/${item.id}`
                : item.topicId
                ? `/practice/${item.topicId}`
                : '/dashboard';

              const resumeHref =
                item.attemptType === 'MOCK_TEST' && item.mockTestId
                  ? `/mock-tests/${item.mockTestId}?attemptId=${item.id}`
                  : item.topicId
                  ? `/practice/${item.topicId}`
                  : '/dashboard';

              return (
                <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                  <td className="px-5 py-3.5 text-text-muted tabular whitespace-nowrap">
                    {formattedDate}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        item.attemptType === 'MOCK_TEST'
                          ? 'bg-accent-50 text-accent-800 border-accent-300'
                          : 'bg-primary-50 text-primary-700 border-primary-300'
                      }`}
                    >
                      {item.attemptType === 'MOCK_TEST' ? 'Mock Test' : 'Practice'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-text max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="px-5 py-3.5 text-center tabular font-medium text-text">
                    {item.score !== null ? `${item.score} / ${item.maxScore}` : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-center tabular font-bold text-text">
                    {item.status === 'SUBMITTED' || item.status === 'EXPIRED'
                      ? `${item.accuracy}%`
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {statusBadge}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    {item.status === 'SUBMITTED' || item.status === 'EXPIRED' ? (
                      <Link href={resultHref as Route}>
                        <Button variant="secondary" size="sm">
                          View Scorecard →
                        </Button>
                      </Link>
                    ) : item.status === 'IN_PROGRESS' ? (
                      <Link href={resumeHref as Route}>
                        <Button variant="primary" size="sm">
                          Resume →
                        </Button>
                      </Link>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="border-t border-border bg-canvas px-5 py-3 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage <= 1 || isLoading}
            onClick={() => onPageChange(currentPage - 1)}
          >
            ← Previous
          </Button>

          <span className="text-xs text-text-muted tabular">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
};
