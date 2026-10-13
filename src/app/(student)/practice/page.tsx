'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  getPracticeCatalog,
  type PracticeSubjectWithTopics,
} from '../../../lib/practice-client';
import { Button } from '../../../components/ui/Button';
import { BookOpen, ArrowLeft, ArrowRight, Search } from 'lucide-react';

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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
                TOPIC-WISE ASSESSMENT
              </span>
              <span className="text-xs font-mono text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20 font-bold">
                {totalTopics} Technical Topics
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white mt-2">
              Practice Arena &amp; Socratic Drills
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Select any Computer Science &amp; IT engineering topic to begin practicing with instantaneous verification, Socratic hints, and mathematical derivations.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 font-mono">
            <Link href={'/curriculum' as Route}>
              <Button variant="secondary" size="sm" className="text-xs">
                <BookOpen className="w-3.5 h-3.5 mr-1.5 text-lime-400" />
                Knowledge Hub
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 text-xs font-mono text-rose-300 bg-rose-950/40 border border-rose-500/40 rounded-2xl">
            {error}
          </div>
        )}

        {/* Search & Subject Filters */}
        <div className="bento-tile p-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search topics by name (e.g. AWS, Python, Docker, SQL, Tree, Multithreading, RAG)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/50 text-xs sm:text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedSubjectId === 'all'
                  ? 'bg-lime-400 text-slate-950 font-bold shadow-md shadow-lime-400/20'
                  : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              All Subjects ({catalog.length})
            </button>
            {catalog.map((subj) => (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedSubjectId === subj.id
                    ? 'bg-lime-400 text-slate-950 font-bold shadow-md shadow-lime-400/20'
                    : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
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
            <div className="h-28 bento-tile animate-pulse" />
            <div className="h-28 bento-tile animate-pulse" />
          </div>
        ) : filteredCatalog.length === 0 ? (
          <div className="bento-tile p-12 text-center space-y-3">
            <p className="text-base font-semibold text-white font-display">
              No practice topics match &ldquo;{searchQuery}&rdquo;.
            </p>
            <p className="text-xs text-slate-400">
              Try searching for a different keyword or resetting your filter.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubjectId('all');
              }}
              className="font-mono text-xs"
            >
              Clear Search Filter
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredCatalog.map((subject) => (
              <div key={subject.id} className="space-y-4">
                <div className="flex items-baseline justify-between border-b border-white/10 pb-2.5">
                  <h2 className="text-lg sm:text-xl font-bold text-white font-display">
                    {subject.name}
                  </h2>
                  <span className="text-xs font-mono text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20 font-bold">
                    {subject.topics.length} topics
                  </span>
                </div>
                {subject.description && (
                  <p className="text-xs text-slate-400 max-w-prose">
                    {subject.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {subject.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="bento-tile p-5 flex flex-col justify-between space-y-4 group hover:border-lime-400/40 hover:-translate-y-1 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1.5 text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider mb-2">
                          <span>MCQ Drill</span>
                          <span className="text-slate-500 font-normal">Socratic Mode</span>
                        </div>
                        <h3 className="font-bold text-white text-sm sm:text-base font-display group-hover:text-lime-300 transition-colors">
                          {topic.name}
                        </h3>
                      </div>
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-mono text-slate-400">
                          Interactive Check
                        </span>
                        <Link href={`/practice/${topic.id}` as Route}>
                          <Button variant="primary" size="sm" className="text-xs font-bold shadow-md shadow-lime-400/20 group">
                            <span>Launch</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
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
