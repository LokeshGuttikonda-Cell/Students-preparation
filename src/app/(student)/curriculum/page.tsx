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
import { Button } from '../../../components/ui/Button';
import { Search, X, Clock } from 'lucide-react';

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
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'INTERMEDIATE':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'ADVANCED':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-white/5 text-slate-400 border-white/10';
    }
  };

  return (
    <div className="min-h-dvh bg-[#040711] text-white selection:bg-lime-400 selection:text-black py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20 inline-block">
                Universal CS &amp; IT Knowledge Base
              </span>
              <span className="text-[11px] font-mono font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full border border-white/10">
                100% Original Pedagogy
              </span>
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">
              Technical Documentation &amp; Concept Guides
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl font-sans leading-relaxed">
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
        <div className="bento-tile p-4 sm:p-5 border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search concepts, algorithms, data structures, protocols, or keywords... (Press '/' to focus)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-black/50 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-lime-400 transition-all placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search input"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                aria-label="Filter articles by difficulty level"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/60 text-xs font-mono text-white focus:outline-none focus:border-lime-400"
              >
                <option value="all">All Difficulty Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* Guide Match Count Banner */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredArticles.length}</strong> of{' '}
              <strong className="text-white">{articles.length}</strong> in-depth technical guides across{' '}
              <strong className="text-white">{domains.length}</strong> engineering disciplines
            </span>
            {(searchQuery || selectedDomain !== 'all' || selectedLevel !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDomain('all');
                  setSelectedLevel('all');
                }}
                className="text-lime-400 hover:underline font-mono text-xs cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>

          {/* Domain Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-full font-mono font-medium transition-colors whitespace-nowrap text-xs border ${
                selectedDomain === 'all'
                  ? 'bg-lime-400 text-slate-950 font-bold border-lime-400 shadow-md shadow-lime-400/20'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-lime-400/30 hover:text-white'
              }`}
            >
              All Disciplines ({articles.length})
            </button>
            {domains.map((dom) => (
              <button
                key={dom.slug}
                onClick={() => setSelectedDomain(dom.slug)}
                className={`px-3 py-1.5 rounded-full font-mono font-medium transition-colors whitespace-nowrap flex items-center gap-1 text-xs border ${
                  selectedDomain === dom.slug
                    ? 'bg-lime-400 text-slate-950 font-bold border-lime-400 shadow-md shadow-lime-400/20'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-lime-400/30 hover:text-white'
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
                className="h-44 bento-tile animate-pulse border-white/10"
              />
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bento-tile p-16 text-center space-y-3 border-white/10">
            <p className="text-base font-display font-semibold text-white">
              No documentation guides match your search criteria.
            </p>
            <p className="text-xs font-mono text-slate-400">
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                className="bento-tile hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-400/5 transition-all flex flex-col justify-between group p-5 border-white/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
                      {art.domainName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-lime-400" />
                        <span>{art.readTimeMinutes} min read</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${levelBadgeClass(
                          art.level,
                        )}`}
                      >
                        {art.level}
                      </span>
                    </div>
                  </div>

                  <Link href={`/curriculum/${art.slug}` as Route}>
                    <h2 className="text-base font-display font-bold text-white group-hover:text-lime-300 transition-colors">
                      {art.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                    {art.summary}
                  </p>

                  {/* Key concept tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {art.keyConcepts.slice(0, 3).map((concept, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/10"
                      >
                        #{concept}
                      </span>
                    ))}
                    {art.keyConcepts.length > 3 && (
                      <span className="text-[10px] font-mono text-slate-500 self-center">
                        +{art.keyConcepts.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>{art.practiceMcqsCount} Practice MCQs</span>
                    {art.sandboxChallengeId && (
                      <span className="text-emerald-400 font-semibold">
                        • Lab Ready
                      </span>
                    )}
                  </div>
                  <Link href={`/curriculum/${art.slug}` as Route}>
                    <Button variant="ghost" size="sm" className="text-xs font-mono font-bold text-lime-400 hover:text-white hover:bg-lime-400/10">
                      Read Guide &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
