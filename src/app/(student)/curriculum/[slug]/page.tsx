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
import { Button } from '../../../../components/ui/Button';
import { Terminal, Copy, Check, Sparkles, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function CurriculumArticleDetailPage() {
  const routeParams = useParams<{ slug: string }>();
  const rawSlug = routeParams?.slug || '';
  const slug = decodeURIComponent(rawSlug).trim();
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
      if (!slug) return;
      try {
        setLoading(true);
        const [art, adj] = await Promise.all([
          getCurriculumArticle(slug),
          getAdjacentArticles(slug),
        ]);
        setArticle(art);
        setAdjacent(adj);
      } catch (err) {
        console.error('Failed to load curriculum guide:', err);
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
      <div className="min-h-dvh bg-[#040711] text-white py-16 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Loading technical documentation...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-dvh bg-[#040711] text-white py-16 px-4 text-center space-y-4">
        <div className="bento-tile p-8 max-w-md mx-auto space-y-4 border-rose-500/30">
          <h1 className="text-2xl font-display font-bold text-white">Guide Not Found</h1>
          <p className="text-xs font-mono text-slate-400">
            The requested technical documentation article could not be located.
          </p>
          <Link href={'/curriculum' as Route}>
            <Button variant="primary">Return to Knowledge Hub</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#040711] text-white selection:bg-lime-400 selection:text-black py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden font-sans">
      {/* Reading Progress Indicator */}
      <div
        className="fixed top-0 left-0 h-1 bg-lime-400 z-50 transition-all duration-100 shadow-sm shadow-lime-400/50"
        style={{ width: `${scrollPercent}%` }}
        role="progressbar"
        aria-valuenow={scrollPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href={'/curriculum' as Route} className="hover:text-lime-400 transition-colors">
            Knowledge Hub
          </Link>
          <span className="text-white/20">/</span>
          <span className="font-semibold text-white">{article.domainName}</span>
          <span className="text-white/20">/</span>
          <span className="text-slate-400 truncate max-w-xs">{article.title}</span>
        </div>

        {/* Header Title Section */}
        <div className="bento-tile p-6 sm:p-8 space-y-4 border-white/10 relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded border border-lime-400/20">
              {article.domainName}
            </span>
            <span className="text-xs font-mono text-slate-400 inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-lime-400" />
              <span>{article.readTimeMinutes} min deep read</span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-slate-300 border border-white/10">
              {article.level} Level
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight leading-snug">
            {article.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {article.summary}
          </p>

          {/* Prerequisites & Key Concepts */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="font-bold text-white block mb-1">Prerequisites:</span>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5 font-sans">
                {article.prerequisites.map((prereq, idx) => (
                  <li key={idx}>{prereq}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="font-bold text-white block mb-1">Core Concepts:</span>
              <div className="flex flex-wrap gap-1">
                {article.keyConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="bg-white/5 px-2 py-0.5 rounded text-slate-300 border border-white/10"
                  >
                    #{concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section Quick Jump Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs border-b border-white/10 font-mono">
          <span className="font-semibold text-slate-400 shrink-0">Jump to:</span>
          <a href="#overview" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors whitespace-nowrap">
            1. Overview
          </a>
          <a href="#theory" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors whitespace-nowrap">
            2. Theory &amp; Code
          </a>
          <a href="#anti-patterns" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors whitespace-nowrap">
            3. Anti-Patterns
          </a>
          <a href="#verification" className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors whitespace-nowrap">
            4. Concept MCQs
          </a>
          <a href="#labs" className="px-2.5 py-1 rounded-lg bg-lime-400/10 text-lime-400 border border-lime-400/30 hover:bg-lime-400/20 transition-colors whitespace-nowrap font-bold flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-lime-400" />
            <span>Applied Labs</span>
          </a>
        </div>

        {/* Overview */}
        <div id="overview" className="space-y-3 scroll-mt-6">
          <h2 className="text-xl font-display font-bold text-white">1. Executive Overview</h2>
          <div className="bento-tile p-6 text-sm text-slate-200 leading-relaxed whitespace-pre-line border-white/10 font-sans">
            {article.overview}
          </div>
        </div>

        {/* Theory & Implementation Sections */}
        <div id="theory" className="space-y-6 scroll-mt-6">
          <h2 className="text-xl font-display font-bold text-white">2. Technical Invariants &amp; Architectural Theory</h2>
          {article.theorySections.map((sec, idx) => (
            <div key={idx} className="bento-tile p-6 space-y-4 border-white/10">
              <h3 className="text-base font-display font-bold text-white">{sec.heading}</h3>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                {sec.content}
              </p>

              {sec.codeSnippet && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                    <span className="uppercase font-bold text-lime-400">
                      {sec.codeSnippet.language}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>Zero External Dependencies</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(sec.codeSnippet!.code, idx)}
                        className="px-2 py-0.5 text-[11px] rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {copiedSnippetIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-xl bg-black/80 text-lime-300 font-mono text-xs overflow-x-auto leading-relaxed border border-white/10 shadow-inner">
                    <code>{sec.codeSnippet.code}</code>
                  </pre>
                  <p className="text-xs text-slate-400 italic flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                    <span>{sec.codeSnippet.explanation}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Production Traps & Anti-Patterns */}
        <div id="anti-patterns" className="space-y-4 scroll-mt-6">
          <h2 className="text-xl font-display font-bold text-white">
            3. Production Anti-Patterns &amp; Recruiter Traps
          </h2>
          <div className="space-y-3">
            {article.trapsAndAntiPatterns.map((trap, idx) => (
              <div
                key={idx}
                className="bento-tile p-5 bg-amber-950/20 border-amber-500/30 text-amber-200 space-y-2"
              >
                <div className="flex items-center gap-2 font-display font-bold text-amber-300 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Trap: {trap.trap}</span>
                </div>
                <p className="text-xs text-amber-200 leading-relaxed font-sans">
                  <strong>Misconception:</strong> {trap.misconception}
                </p>
                <p className="text-xs text-emerald-300 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30 font-medium font-sans">
                  <strong>Architectural Remedy:</strong> {trap.correction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Practice MCQs */}
        <div id="verification" className="space-y-4 scroll-mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-white">
              4. Socratic Concept Verification (MCQs)
            </h2>
            <div className="flex items-center gap-2 font-mono">
              {Object.keys(selectedAnswers).length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {article.practiceMcqs.filter((q) => selectedAnswers[q.id] === q.correctIndex).length} / {article.practiceMcqs.length} Correct
                </span>
              )}
              <span className="text-xs text-slate-400">
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
                <div key={mcq.id} className="bento-tile p-5 sm:p-6 border-white/10 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-sm text-white font-sans">
                      Q{qIdx + 1}. {mcq.question}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      {mcq.options.map((opt, optIdx) => {
                        let optStyle =
                          'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10 hover:border-lime-400/40';

                        if (isAnswered) {
                          if (optIdx === mcq.correctIndex) {
                            optStyle =
                              'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium shadow-xs';
                          } else if (optIdx === selectedOpt && !isCorrect) {
                            optStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium';
                          } else {
                            optStyle = 'bg-white/[0.02] border-white/5 text-slate-500 opacity-60';
                          }
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(mcq.id, optIdx)}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer font-sans ${optStyle}`}
                          >
                            <span>
                              <strong className="mr-2 font-mono">
                                {String.fromCharCode(65 + optIdx)})
                              </strong>
                              {opt}
                            </span>
                            {isAnswered && optIdx === mcq.correctIndex && (
                              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Correct</span>
                              </span>
                            )}
                            {isAnswered &&
                              optIdx === selectedOpt &&
                              !isCorrect && (
                                <span className="text-rose-400 font-mono font-bold flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Incorrect</span>
                                </span>
                              )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {showExplanations[mcq.id] && (
                      <div
                        className={`p-4 rounded-xl text-xs leading-relaxed border ${
                          isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                            : 'bg-white/5 border-white/10 text-slate-200'
                        }`}
                      >
                        <strong className="block font-mono font-bold mb-1">
                          {isCorrect ? 'Correct Architectural Rationale:' : 'Detailed Architectural Rationale:'}
                        </strong>
                        <p className="font-sans leading-relaxed">{mcq.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
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
            <div id="labs" className="bento-tile border-lime-500/30 bg-gradient-to-br from-[#071324] via-[#091b34] to-[#040915] text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 scroll-mt-6 featured-glow">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400">
                  Interactive Laboratory Experience
                </span>
                <h3 className="text-lg font-display font-bold">Apply this knowledge in {studio.title}</h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed font-sans">
                  {studio.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link href={`/sandbox?tab=${studio.tab}`}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="font-bold"
                  >
                    Launch {studio.title} &rarr;
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button
                    variant="primary"
                    size="sm"
                    className="font-bold shadow-lg shadow-lime-400/20"
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
              className="group p-4 rounded-xl bento-tile border-white/10 hover:border-lime-400/30 transition-all space-y-1 block"
            >
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-lime-400">
                &larr; Previous Guide
              </span>
              <div className="text-sm font-display font-bold text-white group-hover:text-lime-300 line-clamp-1">
                {adjacent.prev.title}
              </div>
              <div className="text-xs font-mono text-slate-400">
                {adjacent.prev.domainName} &bull; {adjacent.prev.readTimeMinutes} min
              </div>
            </Link>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-slate-500 text-xs font-mono flex items-center">
              <span>First guide in the technical knowledge series</span>
            </div>
          )}

          {adjacent.next ? (
            <Link
              href={`/curriculum/${adjacent.next.slug}` as Route}
              className="group p-4 rounded-xl bento-tile border-white/10 hover:border-lime-400/30 transition-all space-y-1 text-right block"
            >
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end gap-1 group-hover:text-lime-400">
                Next Guide &rarr;
              </span>
              <div className="text-sm font-display font-bold text-white group-hover:text-lime-300 line-clamp-1">
                {adjacent.next.title}
              </div>
              <div className="text-xs font-mono text-slate-400">
                {adjacent.next.domainName} &bull; {adjacent.next.readTimeMinutes} min
              </div>
            </Link>
          ) : (
            <Link
              href="/sandbox"
              className="group p-4 rounded-xl bento-tile border-lime-500/30 bg-lime-400/5 hover:bg-lime-400/10 transition-all space-y-1 text-right block"
            >
              <span className="text-[10px] font-mono font-bold text-lime-400 uppercase tracking-wider flex items-center justify-end gap-1">
                Curriculum Complete &rarr;
              </span>
              <div className="text-sm font-display font-bold text-white">
                Explore Applied Labs in Sandbox
              </div>
            </Link>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
          <Link href={'/curriculum' as Route} className="hover:text-white transition-colors">
            &larr; Back to Knowledge Hub
          </Link>
          <Link href="/courses" className="text-lime-400 font-semibold hover:underline">
            Explore Full Structured Courses &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
