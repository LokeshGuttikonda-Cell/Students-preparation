'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import {
  getDocTopic,
  getAdjacentDocTopics,
  type DocTrack,
  type DocModule,
  type DocTopic,
} from '../../../../../lib/docs-client';
import { DocsSidebar } from '../../../../../components/docs/DocsSidebar';
import { DocsTableOfContents } from '../../../../../components/docs/DocsTableOfContents';
import { DocsCodeTabs } from '../../../../../components/docs/DocsCodeTabs';
import { DocsPlayground } from '../../../../../components/docs/DocsPlayground';
import { DocsDiagramCard } from '../../../../../components/docs/DocsDiagramCard';
import { DocsInterviewGotchas } from '../../../../../components/docs/DocsInterviewGotchas';
import { DocsQuizCard } from '../../../../../components/docs/DocsQuizCard';
import { DocsNotesDrawer } from '../../../../../components/docs/DocsNotesDrawer';
import { Button } from '../../../../../components/ui/Button';
import {
  Menu,
  X,
  Clock,
  Bookmark,
  Printer,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

export default function DocTopicReaderPage() {
  const routeParams = useParams<{ track: string; slug: string }>();
  const trackSlug = routeParams?.track || '';
  const topicSlug = routeParams?.slug || '';

  const [data, setData] = useState<{
    track: DocTrack;
    module: DocModule;
    topic: DocTopic;
  } | null>(null);

  const [adjacent, setAdjacent] = useState<{
    prev: { trackSlug: string; topicSlug: string; title: string } | null;
    next: { trackSlug: string; topicSlug: string; title: string } | null;
  }>({ prev: null, next: null });

  const [loading, setLoading] = useState<boolean>(true);
  const [scrollPercent, setScrollPercent] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isRead, setIsRead] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (scrollHeight > 0) {
        setScrollPercent(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load topic data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [topicData, adjData] = await Promise.all([
          getDocTopic(trackSlug, topicSlug),
          getAdjacentDocTopics(trackSlug, topicSlug),
        ]);
        setData(topicData || null);
        setAdjacent(adjData);

        // Check read status and bookmark status
        if (topicData) {
          try {
            const stored = localStorage.getItem('studentsprep_read_topics');
            if (stored) {
              const parsed: string[] = JSON.parse(stored);
              setIsRead(parsed.includes(topicData.topic.id));
            }
            const bStored = localStorage.getItem('studentsprep_bookmarked_topics');
            if (bStored) {
              const bParsed: string[] = JSON.parse(bStored);
              setIsBookmarked(bParsed.includes(topicData.topic.id));
            }
          } catch {
            // ignore
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [trackSlug, topicSlug]);

  const toggleReadStatus = () => {
    if (!data) return;
    try {
      const stored = localStorage.getItem('studentsprep_read_topics');
      const list: string[] = stored ? JSON.parse(stored) : [];
      let nextList: string[];
      if (isRead) {
        nextList = list.filter((id) => id !== data.topic.id);
        setIsRead(false);
      } else {
        nextList = [...list, data.topic.id];
        setIsRead(true);
      }
      localStorage.setItem('studentsprep_read_topics', JSON.stringify(nextList));
    } catch {
      // ignore
    }
  };

  const toggleBookmark = () => {
    if (!data) return;
    try {
      const stored = localStorage.getItem('studentsprep_bookmarked_topics');
      const list: string[] = stored ? JSON.parse(stored) : [];
      let nextList: string[];
      if (isBookmarked) {
        nextList = list.filter((id) => id !== data.topic.id);
        setIsBookmarked(false);
      } else {
        nextList = [...list, data.topic.id];
        setIsBookmarked(true);
      }
      localStorage.setItem('studentsprep_bookmarked_topics', JSON.stringify(nextList));
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-canvas py-16 flex flex-col items-center justify-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-700 border-t-transparent" />
        <p className="text-sm text-text-muted">Loading documentation chapter...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-dvh bg-canvas py-16 px-4 text-center space-y-4">
        <h1 className="text-2xl font-bold text-text">Chapter Not Found</h1>
        <p className="text-sm text-text-muted">
          The requested documentation chapter could not be located in track &ldquo;{trackSlug}&rdquo;.
        </p>
        <Link href={'/docs' as Route}>
          <Button variant="primary">Return to All Tutorials</Button>
        </Link>
      </div>
    );
  }

  const { track, module: currentModule, topic } = data;

  return (
    <div className="min-h-dvh bg-canvas relative">
      {/* Fixed Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-primary-600 z-50 transition-all duration-100 print:hidden"
        style={{ width: `${scrollPercent}%` }}
        role="progressbar"
        aria-valuenow={scrollPercent}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* 3-Column Responsive Container */}
      <div className="max-w-[96rem] mx-auto flex flex-col lg:flex-row print:block">
        {/* Mobile Navigation Header */}
        <div className="lg:hidden p-4 border-b border-border bg-surface flex items-center justify-between sticky top-16 z-30 shadow-2xs print:hidden">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200"
          >
            <Menu className="w-4 h-4 text-primary-700" />
            <span>{track.title} Menu</span>
          </button>
          <span className="text-xs text-text-muted truncate max-w-[200px]">
            {topic.title}
          </span>
        </div>

        {/* Left Column: Persistent Desktop Sidebar (width: 72 / 18rem) */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-16 h-[calc(100dvh-4rem)] border-r border-border print:hidden">
          <DocsSidebar currentTrack={track} currentTopicSlug={topic.slug} />
        </div>

        {/* Mobile Sidebar Modal Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex print:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] h-full bg-surface shadow-2xl z-10 flex flex-col">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text">
                  Course Navigation
                </span>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1 rounded text-text-subtle hover:text-text text-sm"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <DocsSidebar
                  currentTrack={track}
                  currentTopicSlug={topic.slug}
                  onTopicSelect={() => setIsMobileSidebarOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Center Column: Main Content Reading Pane */}
        <main className="flex-1 min-w-0 py-8 px-4 sm:px-8 lg:px-12 max-w-4xl mx-auto space-y-8 print:max-w-none print:py-0 print:px-2">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-text-muted flex-wrap print:hidden">
            <Link href={'/docs' as Route} className="hover:text-primary-800 transition-colors">
              Docs
            </Link>
            <span>/</span>
            <Link href={`/docs/${track.slug}` as Route} className="hover:text-primary-800 transition-colors font-medium">
              {track.title}
            </Link>
            <span>/</span>
            <span className="text-text-subtle truncate max-w-xs">{currentModule.title}</span>
          </nav>

          {/* Chapter Title & Header */}
          <div className="border-b border-border pb-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2 py-0.5 rounded border border-accent-200">
                  {currentModule.title}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-muted text-text-muted border border-border">
                  {topic.difficulty}
                </span>
                <span className="text-xs font-mono text-text-subtle inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-text-subtle" />
                  <span>{topic.readTimeMinutes} min read</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 print:hidden">
                {/* Bookmark Button */}
                <button
                  onClick={toggleBookmark}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    isBookmarked
                      ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700'
                      : 'bg-surface text-text-muted border-border hover:border-amber-400 hover:text-text'
                  }`}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-600' : 'text-text-muted'}`} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                </button>

                {/* Print Cheat Sheet Button */}
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-full text-xs font-semibold border border-border bg-surface text-text-muted hover:border-primary-400 hover:text-text transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Print or export cheat sheet to PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-text-muted" />
                  <span>Print Cheat Sheet</span>
                </button>

                {/* Mark as Completed Button */}
                <button
                  onClick={toggleReadStatus}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isRead
                      ? 'bg-success-50 text-success-800 border-success-300 shadow-2xs'
                      : 'bg-surface text-text-muted border-border hover:border-primary-400 hover:text-text'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isRead ? 'text-success-700' : 'text-text-muted'}`} />
                  <span>{isRead ? 'Completed' : 'Mark as Read'}</span>
                </button>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-950 leading-tight">
              {topic.title}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {topic.shortDescription}
            </p>
          </div>

          {/* Section: Overview */}
          <section id="sec-overview" className="space-y-3">
            <h2 className="text-lg font-bold text-text tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-700" />
              <span>Overview &amp; Architectural Context</span>
            </h2>
            <div className="p-5 rounded-2xl bg-surface border border-border text-sm leading-relaxed text-text space-y-3 shadow-2xs">
              <p>{topic.overview}</p>
            </div>
          </section>

          {/* Section: Invariants */}
          <section id="sec-invariants" className="space-y-3">
            <h2 className="text-lg font-bold text-text tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary-700" />
              <span>Architectural Invariants &amp; Core Guarantees</span>
            </h2>
            <div className="p-5 rounded-2xl bg-primary-50/60 border border-primary-200 space-y-2.5">
              {topic.invariants.map((inv, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-primary-950">
                  <span className="text-primary-700 font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed font-medium">{inv}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Complexity Analysis */}
          {topic.complexity && (
            <section id="sec-complexity" className="space-y-3">
              <h2 className="text-lg font-bold text-text tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-700" />
                <span>Asymptotic Complexity &amp; Hardware Bounds</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-text-subtle">
                    Time Complexity
                  </span>
                  <div className="font-mono text-xs font-bold text-primary-800">
                    {topic.complexity.time}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-text-subtle">
                    Space Complexity
                  </span>
                  <div className="font-mono text-xs font-bold text-primary-800">
                    {topic.complexity.space}
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-muted italic px-1">
                {topic.complexity.details}
              </p>
            </section>
          )}

          {/* Theory Sections with Code Tabs & Diagrams */}
          {(topic.theorySections || []).map((sec, secIdx) => (
            <section
              key={sec.id || secIdx}
              id={sec.id || `sec-theory-${secIdx}`}
              className="space-y-4 pt-4 border-t border-border/80"
            >
              <h2 className="text-xl font-bold text-text tracking-tight">
                {sec.heading}
              </h2>
              <div className="text-sm text-text leading-relaxed whitespace-pre-line space-y-3">
                {sec.content}
              </div>

              {/* Monospace Diagram */}
              {sec.diagramAscii && (
                <DocsDiagramCard
                  title={`${sec.heading} — Layout`}
                  diagramAscii={sec.diagramAscii}
                />
              )}

              {/* Tabbed Code Snippet */}
              {(sec.multiLanguageSnippets || sec.codeSnippet) && (
                <DocsCodeTabs
                  primarySnippet={sec.codeSnippet}
                  multiSnippets={sec.multiLanguageSnippets}
                />
              )}
            </section>
          ))}

          {/* Interactive Code Playground */}
          {topic.interactivePlayground && (
            <DocsPlayground playground={topic.interactivePlayground} />
          )}

          {/* Interviewer Gotchas & Traps */}
          {topic.interviewerGotchas.length > 0 && (
            <DocsInterviewGotchas gotchas={topic.interviewerGotchas} />
          )}

          {/* Verification MCQ Checkpoint */}
          {topic.practiceMcqs.length > 0 && (
            <DocsQuizCard questions={topic.practiceMcqs} />
          )}

          {/* Personal Engineering Notes Drawer */}
          <DocsNotesDrawer topicId={topic.id} topicTitle={topic.title} />

          {/* Chapter Next / Previous Footer Navigation */}
          <div className="pt-8 border-t border-border flex items-center justify-between flex-wrap gap-4 print:hidden">
            {adjacent.prev ? (
              <Link href={`/docs/${adjacent.prev.trackSlug}/${adjacent.prev.topicSlug}` as Route}>
                <Button variant="secondary" size="sm" className="text-xs font-semibold flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous: {adjacent.prev.title}</span>
                </Button>
              </Link>
            ) : (
              <div />
            )}

            {adjacent.next ? (
              <Link href={`/docs/${adjacent.next.trackSlug}/${adjacent.next.topicSlug}` as Route}>
                <Button variant="primary" size="sm" className="text-xs font-bold flex items-center gap-1.5">
                  <span>Next: {adjacent.next.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <Link href={`/docs/${track.slug}` as Route}>
                <Button variant="secondary" size="sm" className="text-xs font-semibold flex items-center gap-1.5">
                  <span>Complete Track Syllabus</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            )}
          </div>
        </main>

        {/* Right Column: Sticky Table of Contents (width: 64 / 16rem) */}
        <div className="hidden xl:block w-64 shrink-0 sticky top-16 h-[calc(100dvh-4rem)] p-6 overflow-y-auto border-l border-border print:hidden">
          <DocsTableOfContents topic={topic} />
        </div>
      </div>
    </div>
  );
}
