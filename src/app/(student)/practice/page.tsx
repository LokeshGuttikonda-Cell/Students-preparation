'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  useEffect(() => {
    getPracticeCatalog()
      .then(setCatalog)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load topics'),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const totalTopics = useMemo(() => {
    return catalog.reduce((acc, subj) => acc + subj.topics.length, 0);
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return catalog
      .filter((subj) => {
        if (selectedSubjectId !== 'all' && subj.id !== selectedSubjectId) {
          return false;
        }
        return true;
      })
      .map((subj) => {
        if (!q) return subj;
        const matchesSubj = subj.name.toLowerCase().includes(q);
        const filteredTopics = subj.topics.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.slug.toLowerCase().includes(q) ||
            matchesSubj,
        );
        return {
          ...subj,
          topics: filteredTopics,
        };
      })
      .filter((subj) => subj.topics.length > 0);
  }, [catalog, searchQuery, selectedSubjectId]);

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-accent-700 uppercase tracking-wider">
                Topic-Wise Assessment
              </span>
              <span className="text-[11px] font-semibold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
                {totalTopics} Technical Topics
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-900 mt-1">
              Practice Mode &amp; Knowledge Drills
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Select any Computer Science &amp; IT engineering topic to begin practicing with instant evaluation, Socratic hints, and comprehensive step-by-step solutions.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href={'/curriculum' as Route}>
              <Button variant="secondary" size="sm">
                📖 Knowledge Hub
              </Button>
            </Link>
            <Link href="/">
              <Button variant="secondary" size="sm">
                &larr; Home
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-error-700 bg-error-50 border border-error-500/30 rounded-md">
            {error}
          </div>
        )}

        {/* Search & Subject Filters */}
        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search topics by name (e.g. AWS, Python, Docker, SQL, Tree, Multithreading)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
            />
            <span className="absolute left-3 top-3 text-text-muted text-sm">
              🔍
            </span>
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedSubjectId === 'all'
                  ? 'bg-primary-900 text-white font-bold'
                  : 'bg-surface-muted text-text-muted hover:bg-neutral-200'
              }`}
            >
              All Subjects ({catalog.length})
            </button>
            {catalog.map((subj) => (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                  selectedSubjectId === subj.id
                    ? 'bg-primary-900 text-white font-bold'
                    : 'bg-surface-muted text-text-muted hover:bg-neutral-200'
                }`}
              >
                {subj.name} ({subj.topics.length})
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Content */}
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-28 bg-surface rounded-lg border border-border animate-pulse" />
            <div className="h-28 bg-surface rounded-lg border border-border animate-pulse" />
          </div>
        ) : filteredCatalog.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-3">
              <p className="text-base font-semibold text-text">
                No practice topics match &ldquo;{searchQuery}&rdquo;.
              </p>
              <p className="text-xs text-text-muted">
                Try searching for a different keyword or resetting your filter.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubjectId('all');
                }}
              >
                Clear Search Filter
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredCatalog.map((subject) => (
              <div key={subject.id} className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
                  <h2 className="text-xl font-bold text-primary-900">
                    {subject.name}
                  </h2>
                  <span className="text-xs font-semibold text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
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
                      <CardContent className="p-4 flex flex-col justify-between h-full space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] text-accent-700 font-bold uppercase tracking-wider mb-1">
                            <span>MCQ Drill</span>
                          </div>
                          <h3 className="font-semibold text-text text-sm">
                            {topic.name}
                          </h3>
                        </div>
                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-text-muted">
                            Socratic Mode
                          </span>
                          <Link href={`/practice/${topic.id}` as Route}>
                            <Button variant="primary" size="sm" className="text-xs font-bold">
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
