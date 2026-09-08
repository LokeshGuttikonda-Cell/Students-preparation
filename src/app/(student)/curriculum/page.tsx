'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  getCurriculumDomains,
  getCurriculumArticles,
  type CurriculumDomain,
  type CurriculumArticleSummary,
} from '../../../lib/curriculum-client';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function CurriculumHubPage() {
  const [domains, setDomains] = useState<CurriculumDomain[]>([]);
  const [articles, setArticles] = useState<CurriculumArticleSummary[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [doms, arts] = await Promise.all([
          getCurriculumDomains(),
          getCurriculumArticles(),
        ]);
        setDomains(doms);
        setArticles(arts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const matchesDomain =
        selectedDomain === 'all' || art.domainSlug === selectedDomain;
      const matchesLevel =
        selectedLevel === 'all' || art.level === selectedLevel;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.domainName.toLowerCase().includes(q) ||
        art.keyConcepts.some((c) => c.toLowerCase().includes(q));

      return matchesDomain && matchesLevel && matchesSearch;
    });
  }, [articles, selectedDomain, selectedLevel, searchQuery]);

  const levelBadgeClass = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'INTERMEDIATE':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'ADVANCED':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-surface-muted text-text-muted border-border';
    }
  };

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                Universal CS &amp; IT Knowledge Base
              </span>
              <span className="text-[11px] font-semibold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
                100% Original Pedagogy
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-900">
              Technical Documentation &amp; Concept Guides
            </h1>
            <p className="text-sm text-text-muted max-w-3xl">
              Comprehensive, peer-reviewed engineering documentation across all 15 core computer science and IT disciplines — designed to give engineering students complete mastery beyond textbook gloss.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/practice">
              <Button variant="secondary" size="sm">
                Topic MCQs &rarr;
              </Button>
            </Link>
            <Link href="/sandbox">
              <Button variant="primary" size="sm">
                Code &amp; SQL Lab &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-surface p-4 rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search concepts, algorithms, data structures, protocols, or keywords... (Press '/' to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
              />
              <span className="absolute left-3 top-3 text-text-muted text-sm">
                🔍
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-3 top-2.5 text-text-muted hover:text-text text-sm px-1.5 py-0.5 rounded-full hover:bg-surface-muted"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                aria-label="Filter articles by difficulty level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-border bg-canvas text-xs font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary-700/20"
              >
                <option value="all">All Difficulty Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* Guide Match Count Banner */}
          <div className="flex items-center justify-between text-xs text-text-muted px-1">
            <span>
              Showing <strong className="text-text">{filteredArticles.length}</strong> of{' '}
              <strong className="text-text">{articles.length}</strong> in-depth technical guides across{' '}
              <strong className="text-text">{domains.length}</strong> engineering disciplines
            </span>
            {(searchQuery || selectedDomain !== 'all' || selectedLevel !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDomain('all');
                  setSelectedLevel('all');
                }}
                className="text-primary-700 hover:underline font-medium cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* Domain Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                selectedDomain === 'all'
                  ? 'bg-primary-900 text-white font-bold'
                  : 'bg-surface-muted text-text-muted hover:bg-neutral-200'
              }`}
            >
              All Disciplines ({articles.length})
            </button>
            {domains.map((dom) => (
              <button
                key={dom.slug}
                onClick={() => setSelectedDomain(dom.slug)}
                className={`px-3 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                  selectedDomain === dom.slug
                    ? 'bg-primary-900 text-white font-bold'
                    : 'bg-surface-muted text-text-muted hover:bg-neutral-200'
                }`}
              >
                <span>{dom.icon}</span>
                <span>{dom.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-44 bg-surface rounded-xl border border-border animate-pulse"
              />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center space-y-3">
              <p className="text-base font-semibold text-text">
                No documentation guides match your search criteria.
              </p>
              <p className="text-xs text-text-muted">
                Try adjusting your search terms or clearing the domain filter.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDomain('all');
                  setSelectedLevel('all');
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((art) => (
              <Card
                key={art.id}
                className="hover:border-primary-700/50 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-200/60">
                        {art.domainName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">
                          ⏱️ {art.readTimeMinutes} min read
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${levelBadgeClass(
                            art.level,
                          )}`}
                        >
                          {art.level}
                        </span>
                      </div>
                    </div>

                    <Link href={`/curriculum/${art.slug}` as Route}>
                      <h2 className="text-base font-bold text-text hover:text-primary-800 transition-colors">
                        {art.title}
                      </h2>
                    </Link>

                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>

                    {/* Key concept tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {art.keyConcepts.slice(0, 3).map((concept, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-canvas text-text-subtle px-2 py-0.5 rounded border border-border"
                        >
                          #{concept}
                        </span>
                      ))}
                      {art.keyConcepts.length > 3 && (
                        <span className="text-[10px] text-text-muted self-center">
                          +{art.keyConcepts.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>{art.practiceMcqsCount} Practice MCQs</span>
                      {art.sandboxChallengeId && (
                        <span className="text-emerald-700 font-medium">
                          • Lab Ready
                        </span>
                      )}
                    </div>
                    <Link href={`/curriculum/${art.slug}` as Route}>
                      <Button variant="ghost" size="sm" className="text-xs font-bold text-primary-800 hover:bg-primary-50">
                        Read Guide &rarr;
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
