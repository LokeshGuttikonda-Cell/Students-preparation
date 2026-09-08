'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import {
  getCurriculumArticle,
  getAdjacentArticles,
  type CurriculumArticle,
  type CurriculumArticleSummary,
} from '../../../../lib/curriculum-client';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export default function CurriculumArticleDetailPage() {
  const routeParams = useParams<{ slug: string }>();
  const slug = routeParams?.slug || '';
  const [article, setArticle] = useState<CurriculumArticle | null>(null);
  const [adjacent, setAdjacent] = useState<{
    prev: CurriculumArticleSummary | null;
    next: CurriculumArticleSummary | null;
  }>({
    prev: null,
    next: null,
  });
  const [loading, setLoading] = useState(true);
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [scrollPercent, setScrollPercent] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setScrollPercent(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [art, adj] = await Promise.all([
          getCurriculumArticle(slug),
          getAdjacentArticles(slug),
        ]);
        setArticle(art);
        setAdjacent(adj);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleCopy = (codeText: string, idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(codeText);
      setCopiedSnippetIdx(idx);
      setTimeout(() => setCopiedSnippetIdx(null), 2000);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // Answer locked
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
    setShowExplanations((prev) => ({ ...prev, [questionId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-canvas py-16 flex flex-col items-center justify-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-700 border-t-transparent" />
        <p className="text-sm text-text-muted">Loading technical documentation...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-dvh bg-canvas py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">Guide Not Found</h1>
        <p className="text-sm text-text-muted">
          The requested technical documentation article could not be located.
        </p>
        <Link href={'/curriculum' as Route}>
          <Button variant="primary">Return to Knowledge Hub</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Reading Progress Indicator */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary-700 z-50 transition-all duration-100"
        style={{ width: `${scrollPercent}%` }}
        role="progressbar"
        aria-valuenow={scrollPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href={'/curriculum' as Route} className="hover:text-primary-800 transition-colors">
            Knowledge Hub
          </Link>
          <span>/</span>
          <span className="font-semibold text-text">{article.domainName}</span>
          <span>/</span>
          <span className="text-text-subtle truncate max-w-xs">{article.title}</span>
        </div>

        {/* Header Title Section */}
        <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2.5 py-0.5 rounded border border-accent-200">
              {article.domainName}
            </span>
            <span className="text-xs text-text-muted">
              ⏱️ {article.readTimeMinutes} min deep read
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
              {article.level} Level
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-900 tracking-tight leading-snug">
            {article.title}
          </h1>

          <p className="text-sm text-text-muted leading-relaxed">
            {article.summary}
          </p>

          {/* Prerequisites & Key Concepts */}
          <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-text block mb-1">Prerequisites:</span>
              <ul className="list-disc list-inside text-text-muted space-y-0.5">
                {article.prerequisites.map((prereq, idx) => (
                  <li key={idx}>{prereq}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-text block mb-1">Core Concepts:</span>
              <div className="flex flex-wrap gap-1">
                {article.keyConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="bg-canvas px-2 py-0.5 rounded text-text-subtle border border-border"
                  >
                    #{concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section Quick Jump Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-border">
          <span className="font-semibold text-text-muted shrink-0">Jump to:</span>
          <a href="#overview" className="px-2.5 py-1 rounded-md bg-surface hover:bg-surface-hover text-text border border-border transition-colors whitespace-nowrap">
            1. Overview
          </a>
          <a href="#theory" className="px-2.5 py-1 rounded-md bg-surface hover:bg-surface-hover text-text border border-border transition-colors whitespace-nowrap">
            2. Theory &amp; Code
          </a>
          <a href="#anti-patterns" className="px-2.5 py-1 rounded-md bg-surface hover:bg-surface-hover text-text border border-border transition-colors whitespace-nowrap">
            3. Anti-Patterns
          </a>
          <a href="#verification" className="px-2.5 py-1 rounded-md bg-surface hover:bg-surface-hover text-text border border-border transition-colors whitespace-nowrap">
            4. Concept MCQs
          </a>
          <a href="#labs" className="px-2.5 py-1 rounded-md bg-primary-50 text-primary-800 border border-primary-200 hover:bg-primary-100 transition-colors whitespace-nowrap font-medium">
            ⚡ Applied Labs
          </a>
        </div>

        {/* Overview */}
        <div id="overview" className="space-y-3 scroll-mt-6">
          <h2 className="text-xl font-bold text-primary-900">1. Executive Overview</h2>
          <div className="bg-surface p-6 rounded-xl border border-border text-sm text-text leading-relaxed whitespace-pre-line">
            {article.overview}
          </div>
        </div>

        {/* Theory & Implementation Sections */}
        <div id="theory" className="space-y-6 scroll-mt-6">
          <h2 className="text-xl font-bold text-primary-900">2. Technical Invariants &amp; Architectural Theory</h2>
          {article.theorySections.map((sec, idx) => (
            <div key={idx} className="bg-surface p-6 rounded-xl border border-border space-y-4">
              <h3 className="text-base font-bold text-text">{sec.heading}</h3>
              <p className="text-sm text-text leading-relaxed whitespace-pre-line">
                {sec.content}
              </p>

              {sec.codeSnippet && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-text-muted px-1">
                    <span className="font-mono uppercase font-bold text-primary-800">
                      {sec.codeSnippet.language}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>Zero External Dependencies</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(sec.codeSnippet!.code, idx)}
                        className="px-2 py-0.5 text-[11px] rounded bg-surface hover:bg-surface-hover text-text border border-border transition-colors cursor-pointer"
                      >
                        {copiedSnippetIdx === idx ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed border border-neutral-800">
                    <code>{sec.codeSnippet.code}</code>
                  </pre>
                  <p className="text-xs text-text-muted italic">
                    💡 {sec.codeSnippet.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Production Traps & Anti-Patterns */}
        <div id="anti-patterns" className="space-y-4 scroll-mt-6">
          <h2 className="text-xl font-bold text-primary-900">
            3. Production Anti-Patterns &amp; Recruiter Traps
          </h2>
          <div className="space-y-3">
            {article.trapsAndAntiPatterns.map((trap, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-950 space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                  <span>⚠️</span>
                  <span>Trap: {trap.trap}</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Misconception:</strong> {trap.misconception}
                </p>
                <p className="text-xs text-emerald-900 bg-emerald-100/70 p-2.5 rounded border border-emerald-200 font-medium">
                  <strong>Architectural Remedy:</strong> {trap.correction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Practice MCQs */}
        <div id="verification" className="space-y-4 scroll-mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-900">
              4. Socratic Concept Verification (MCQs)
            </h2>
            <div className="flex items-center gap-2">
              {Object.keys(selectedAnswers).length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {article.practiceMcqs.filter((q) => selectedAnswers[q.id] === q.correctIndex).length} / {article.practiceMcqs.length} Correct
                </span>
              )}
              <span className="text-xs text-text-muted">
                {article.practiceMcqs.length} Calibrated Questions
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {article.practiceMcqs.map((mcq, qIdx) => {
              const selectedOpt = selectedAnswers[mcq.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === mcq.correctIndex;

              return (
                <Card key={mcq.id} className="p-5 sm:p-6 border-border shadow-xs space-y-4 bg-surface">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-sm text-text">
                      Q{qIdx + 1}. {mcq.question}
                    </span>
                  </div>

                  <CardContent className="p-0 space-y-3">
                    <div className="space-y-2">
                      {mcq.options.map((opt, optIdx) => {
                        let optStyle =
                          'bg-canvas border-border text-text hover:bg-surface-hover hover:border-border-hover';

                        if (isAnswered) {
                          if (optIdx === mcq.correctIndex) {
                            optStyle =
                              'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium shadow-xs';
                          } else if (optIdx === selectedOpt && !isCorrect) {
                            optStyle = 'bg-error-50 border-error-500 text-error-900 font-medium';
                          } else {
                            optStyle = 'bg-canvas border-border text-text-muted opacity-60';
                          }
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(mcq.id, optIdx)}
                            className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-all cursor-pointer ${optStyle}`}
                          >
                            <span>
                              <strong className="mr-2 font-mono">
                                {String.fromCharCode(65 + optIdx)})
                              </strong>
                              {opt}
                            </span>
                            {isAnswered && optIdx === mcq.correctIndex && (
                              <span className="text-emerald-700 font-bold">✓ Correct</span>
                            )}
                            {isAnswered &&
                              optIdx === selectedOpt &&
                              !isCorrect && (
                                <span className="text-error-700 font-bold">✗ Incorrect</span>
                              )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showExplanations[mcq.id] && (
                      <div
                        className={`p-4 rounded-lg text-xs leading-relaxed border ${
                          isCorrect
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : 'bg-neutral-50 border-border text-text'
                        }`}
                      >
                        <strong className="block font-bold mb-1">
                          {isCorrect ? '🎉 Correct Rationale:' : '💡 Detailed Rationale:'}
                        </strong>
                        {mcq.explanation}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Next Actions & Specialized Sandbox Studio Linking */}
        {(() => {
          const getDomainStudioInfo = (domainSlug: string) => {
            switch (domainSlug) {
              case 'system-design-architecture':
                return {
                  tab: 'system-design',
                  title: 'System Design Architecture Studio',
                  description: 'Simulate distributed topology throughput, cache stampedes, Little\'s law queuing latencies, and database sharding partition distributions.',
                };
              case 'operating-systems':
              case 'computer-networks':
                return {
                  tab: 'kernel',
                  title: 'OS Kernel & Network Protocols Studio',
                  description: 'Step through interactive CPU scheduling Gantt charts, Virtual Memory Bélády paging matrices, and TCP Reno vs Tahoe congestion windows.',
                };
              case 'distributed-systems':
              case 'cloud-infrastructure':
              case 'devops-site-reliability':
                return {
                  tab: 'distributed',
                  title: 'Distributed Systems & Architecture Studio',
                  description: 'Interact with 360-degree consistent hash rings, Leaky & Token bucket rate limiters, and circuit breaker state machines.',
                };
              case 'data-structures-algorithms':
                return {
                  tab: 'visual',
                  title: 'Visual Algorithm Stepper Studio',
                  description: 'Visualize binary search intervals, two-pointer convergence, sliding window pointers, and graph BFS/DFS traversal frontiers step-by-step.',
                };
              case 'database-internals':
                return {
                  tab: 'sql',
                  title: 'Relational SQL Query Lab',
                  description: 'Execute window ranking, running totals, and correlated subqueries with zero-latency in-memory relational verification.',
                };
              case 'fullstack-web-architecture':
              case 'machine-learning-ai':
              case 'cybersecurity-cryptography':
                return {
                  tab: 'code',
                  title: 'Algorithmic Code Logic Lab',
                  description: 'Implement algorithmic functions and validate edge cases with sandboxed in-browser Web Worker execution and timeout isolation.',
                };
              default:
                return {
                  tab: 'sql',
                  title: 'Applied Engineering Lab',
                  description: 'Execute queries, validate code logic, and inspect memory architectures in zero-setup browser simulators.',
                };
            }
          };

          const studio = getDomainStudioInfo(article.domainSlug);

          return (
            <div id="labs" className="bg-gradient-to-br from-primary-900 to-primary-950 text-white p-6 sm:p-8 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 scroll-mt-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-accent-400">
                  Interactive Laboratory Experience
                </span>
                <h3 className="text-lg font-bold">Apply this knowledge in {studio.title}</h3>
                <p className="text-xs text-primary-200 max-w-xl leading-relaxed">
                  {studio.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href={`/sandbox?tab=${studio.tab}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white text-primary-900 hover:bg-neutral-100 font-bold"
                  >
                    Launch {studio.title} &rarr;
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-accent-600 hover:bg-accent-700 text-white font-bold border-none"
                  >
                    Practice Topic MCQs &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          );
        })()}

        {/* Previous & Next Article Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {adjacent.prev ? (
            <Link
              href={`/curriculum/${adjacent.prev.slug}` as Route}
              className="group p-4 rounded-xl border border-border bg-surface hover:border-primary-400 hover:shadow-xs transition-all space-y-1 block"
            >
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1 group-hover:text-primary-700">
                &larr; Previous Guide
              </span>
              <div className="text-sm font-bold text-text group-hover:text-primary-800 line-clamp-1">
                {adjacent.prev.title}
              </div>
              <div className="text-xs text-text-muted">
                {adjacent.prev.domainName} &bull; {adjacent.prev.readTimeMinutes} min
              </div>
            </Link>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-border bg-surface-muted/50 text-text-muted text-xs flex items-center">
              <span>First guide in the technical knowledge series</span>
            </div>
          )}

          {adjacent.next ? (
            <Link
              href={`/curriculum/${adjacent.next.slug}` as Route}
              className="group p-4 rounded-xl border border-border bg-surface hover:border-primary-400 hover:shadow-xs transition-all space-y-1 text-right block"
            >
              <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-end gap-1 group-hover:text-primary-700">
                Next Guide &rarr;
              </span>
              <div className="text-sm font-bold text-text group-hover:text-primary-800 line-clamp-1">
                {adjacent.next.title}
              </div>
              <div className="text-xs text-text-muted">
                {adjacent.next.domainName} &bull; {adjacent.next.readTimeMinutes} min
              </div>
            </Link>
          ) : (
            <Link
              href="/sandbox"
              className="group p-4 rounded-xl border border-primary-200 bg-primary-50/50 hover:bg-primary-50 transition-all space-y-1 text-right block"
            >
              <span className="text-[11px] font-bold text-primary-800 uppercase tracking-wider flex items-center justify-end gap-1">
                Curriculum Complete &rarr;
              </span>
              <div className="text-sm font-bold text-primary-900">
                Explore Applied Labs in Sandbox
              </div>
            </Link>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <Link href={'/curriculum' as Route} className="hover:text-primary-800 transition-colors">
            &larr; Back to Knowledge Hub
          </Link>
          <Link href="/courses" className="text-primary-800 font-semibold hover:underline">
            Explore Full Structured Courses &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
