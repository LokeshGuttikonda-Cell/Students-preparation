'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminMetrics, type ContentMetrics } from '../../../lib/admin-client';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminMetrics()
      .then(setMetrics)
      .catch(() => setMetrics(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-900">
            Overview
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Question bank review queue and content health
          </p>
        </div>
        <Link href="/admin/questions/new">
          <Button variant="accent">
            <svg
              className="w-4 h-4 mr-1"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Create Question
          </Button>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-text-muted">
              In Review (Queue)
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-accent-700 tabular">
                {isLoading ? '...' : metrics?.inReviewCount ?? 0}
              </span>
              <Link
                href="/admin/questions?status=IN_REVIEW"
                className="text-xs text-primary-700 hover:underline font-medium"
              >
                Review now &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Published
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-success-700 tabular">
                {isLoading ? '...' : metrics?.publishedCount ?? 0}
              </span>
              <span className="text-xs text-text-muted">Live questions</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Drafts
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-text tabular">
                {isLoading ? '...' : metrics?.draftCount ?? 0}
              </span>
              <Link
                href="/admin/questions?status=DRAFT"
                className="text-xs text-primary-700 hover:underline font-medium"
              >
                View &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase text-text-muted">
              Total Questions
            </p>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-primary-900 tabular">
                {isLoading ? '...' : metrics?.totalCount ?? 0}
              </span>
              <span className="text-xs text-text-muted">All statuses</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Invariant Notice Card */}
      <Card className="border-primary-100 bg-primary-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-primary-900 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary-700"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Publication Invariant System Active (D-018)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-text-muted space-y-1.5">
          <p>
            Questions are protected by strict service-level publication rules:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>
              <strong>Peer Review:</strong> An author cannot approve and publish
              their own draft.
            </li>
            <li>
              <strong>Structure:</strong> Exactly 4 options and exactly 1 correct
              answer required.
            </li>
            <li>
              <strong>Completeness:</strong> Step-by-step non-empty explanation
              mandatory.
            </li>
            <li>
              <strong>Provenance:</strong> Source tag (ORIGINAL_HUMAN / AI_DRAFTED)
              recorded for full copyright compliance.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
