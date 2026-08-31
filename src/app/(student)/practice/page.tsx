'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  getPracticeCatalog,
  type PracticeSubjectWithTopics,
} from '../../../lib/practice-client';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function PracticeCatalogPage() {
  const [catalog, setCatalog] = useState<PracticeSubjectWithTopics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPracticeCatalog()
      .then(setCatalog)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load topics'),
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-semibold text-accent-700 uppercase tracking-wider">
              Topic-Wise Assessment
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-primary-900 mt-1">
              Practice Mode
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Select a topic to begin practicing with instant answer evaluation
              and complete step-by-step solutions.
            </p>
          </div>
          <Link href="/">
            <Button variant="secondary" size="sm">
              &larr; Back Home
            </Button>
          </Link>
        </div>

        {error && (
          <div className="p-4 text-sm text-error-700 bg-error-50 border border-error-500/30 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-28 bg-surface rounded-lg border border-border animate-pulse" />
            <div className="h-28 bg-surface rounded-lg border border-border animate-pulse" />
          </div>
        ) : catalog.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-text-muted">
              No practice subjects available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {catalog.map((subject) => (
              <div key={subject.id} className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-xl font-bold text-primary-900">
                    {subject.name}
                  </h2>
                  <span className="text-xs text-text-muted">
                    {subject.topics.length} topics
                  </span>
                </div>
                {subject.description && (
                  <p className="text-xs text-text-muted max-w-prose">
                    {subject.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {subject.topics.map((topic) => (
                    <Card
                      key={topic.id}
                      className="hover:border-primary-700/50 hover:shadow-sm transition-all"
                    >
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div>
                          <h3 className="font-semibold text-text text-sm">
                            {topic.name}
                          </h3>
                        </div>
                        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-text-muted">
                            MCQ Practice
                          </span>
                          <Link href={`/practice/${topic.id}` as Route}>
                            <Button variant="primary" size="sm" className="text-xs">
                              Practice &rarr;
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
