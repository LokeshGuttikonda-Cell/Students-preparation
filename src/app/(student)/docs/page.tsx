'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { DOC_TRACKS, type DocTrack } from '../../../lib/docs-catalog';
import { Card, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { TechIcon } from '../../../components/ui/TechIcon';
import {
  Layers,
  Scale,
  Cpu,
  Sparkles,
  RotateCw,
  FileDown,
  BookOpen,
  Loader2,
  Search,
  Bookmark,
  ShieldCheck,
  ArrowRight,
  X,
} from 'lucide-react';
import { DocsSearchModal } from '../../../components/docs/DocsSearchModal';
import { LanguageEvolutionModal } from '../../../components/docs/LanguageEvolutionModal';
import { ArchitectureTradeoffCalculator } from '../../../components/docs/ArchitectureTradeoffCalculator';
import { StructPaddingVisualizer } from '../../../components/docs/StructPaddingVisualizer';
import { DocsFlashcardsModal } from '../../../components/docs/DocsFlashcardsModal';
import { EventLoopSimulator } from '../../../components/docs/EventLoopSimulator';
import { exportNotesRevisionGuide } from '../../../lib/docs-notes-exporter';
import { generateCompleteEngineeringDocsPdf, downloadPdfFile } from '../../../lib/docs-pdf';

export default function DocsHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PROGRAMMING_LANGUAGE' | 'CS_SPECIALIZATION' | 'BOOKMARKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [isTradeoffModalOpen, setIsTradeoffModalOpen] = useState(false);
  const [isStructModalOpen, setIsStructModalOpen] = useState(false);
  const [isFlashcardsModalOpen, setIsFlashcardsModalOpen] = useState(false);
  const [isEventLoopModalOpen, setIsEventLoopModalOpen] = useState(false);
  const [isGeneratingCompendium, setIsGeneratingCompendium] = useState(false);
  const [bookmarkedTopicIds, setBookmarkedTopicIds] = useState<Set<string>>(new Set());

  // Load bookmarked topics from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('studentsprep_bookmarked_topics');
      if (stored) {
        setBookmarkedTopicIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredTracks = useMemo(() => {
    return DOC_TRACKS.filter((track) => {
      const matchesCategory =
        selectedCategory === 'ALL'
          ? true
          : selectedCategory === 'BOOKMARKED'
          ? track.modules.some((m) => m.topics.some((t) => bookmarkedTopicIds.has(t.id)))
          : track.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        track.title.toLowerCase().includes(q) ||
        track.tagline.toLowerCase().includes(q) ||
        track.description.toLowerCase().includes(q) ||
        track.modules.some((m) =>
          m.title.toLowerCase().includes(q) ||
          m.topics.some((t) => t.title.toLowerCase().includes(q)),
        );

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, bookmarkedTopicIds]);

  const handleDownloadCompendium = () => {
    setIsGeneratingCompendium(true);
    try {
      const pdfBytes = generateCompleteEngineeringDocsPdf(DOC_TRACKS);
      downloadPdfFile(pdfBytes, 'studentsprep-master-engineering-compendium.pdf');
    } finally {
      setIsGeneratingCompendium(false);
    }
  };

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="border-b border-border pb-8 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2.5 py-0.5 rounded-full border border-accent-200">
              Interactive Engineering Library
            </span>
            <span className="text-[11px] font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
              Zero Ads • 100% Signal
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary-950">
            Technical Documentation &amp; Concept Guides
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-3xl leading-relaxed">
            Textbook-grade engineering documentation and deep-dive language tutorials designed to surpass traditional ad-supported tutorial portals. Every topic includes architectural invariants, multi-language code comparisons, visual memory diagrams, in-situ runnable playgrounds, and senior interviewer counter-questions.
          </p>

          {/* Quick Action Tools */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setIsEvolutionModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-primary-50 text-neutral-800 hover:text-primary-900 border border-border hover:border-primary-300 transition-all shadow-2xs cursor-pointer group"
            >
              <Layers className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
              <span>Language Evolution Matrix</span>
            </button>
            <button
              onClick={() => setIsTradeoffModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-primary-50 text-neutral-800 hover:text-primary-900 border border-border hover:border-primary-300 transition-all shadow-2xs cursor-pointer group"
            >
              <Scale className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
              <span>Trade-off Calculators</span>
            </button>
            <button
              onClick={() => setIsStructModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-primary-50 text-neutral-800 hover:text-primary-900 border border-border hover:border-primary-300 transition-all shadow-2xs cursor-pointer group"
            >
              <Cpu className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
              <span>Struct Memory Inspector</span>
            </button>
            <button
              onClick={() => setIsFlashcardsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-primary-50 text-neutral-800 hover:text-primary-900 border border-border hover:border-primary-300 transition-all shadow-2xs cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-accent-600 group-hover:scale-110 transition-transform" />
              <span>Invariant Flashcards</span>
            </button>
            <button
              onClick={() => setIsEventLoopModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-primary-50 text-neutral-800 hover:text-primary-900 border border-border hover:border-primary-300 transition-all shadow-2xs cursor-pointer group"
            >
              <RotateCw className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
              <span>Event Loop Simulator</span>
            </button>
            <button
              onClick={() => exportNotesRevisionGuide()}
              title="Download your personal notes as an executive Markdown revision textbook"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-primary-50 text-neutral-800 hover:text-primary-900 border border-border hover:border-primary-300 transition-all shadow-2xs cursor-pointer group"
            >
              <FileDown className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
              <span>Export Revision Guide (.md)</span>
            </button>
            <button
              onClick={handleDownloadCompendium}
              disabled={isGeneratingCompendium}
              title="Download Master Engineering Documentation Compendium (All 13 Specialization Tracks PDF)"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary-700 hover:bg-primary-800 text-white shadow-xs transition-all cursor-pointer"
            >
              {isGeneratingCompendium ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4 text-white" />
              )}
              <span>{isGeneratingCompendium ? 'Compiling PDF...' : 'Master Compendium (PDF)'}</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="pt-2 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search across all languages, topics, JVM internals, algorithms, and protocols..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
                aria-label="Search documentation"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text p-1 rounded-md hover:bg-neutral-100 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsSpotlightOpen(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-text-muted bg-surface-subtle hover:bg-neutral-100 px-2 py-1 rounded-md border border-border transition-colors cursor-pointer"
                  title="Open Spotlight Search"
                >
                  <span className="font-bold text-primary-700">Ctrl K</span>
                  <span className="text-[10px] text-text-subtle">Spotlight</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto shrink-0">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-primary-900 text-white shadow-xs'
                    : 'bg-surface border border-border text-text-muted hover:text-text hover:bg-neutral-50'
                }`}
              >
                All Tracks ({DOC_TRACKS.length})
              </button>
              <button
                onClick={() => setSelectedCategory('PROGRAMMING_LANGUAGE')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'PROGRAMMING_LANGUAGE'
                    ? 'bg-primary-900 text-white shadow-xs'
                    : 'bg-surface border border-border text-text-muted hover:text-text hover:bg-neutral-50'
                }`}
              >
                Languages (7)
              </button>
              <button
                onClick={() => setSelectedCategory('CS_SPECIALIZATION')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'CS_SPECIALIZATION'
                    ? 'bg-primary-900 text-white shadow-xs'
                    : 'bg-surface border border-border text-text-muted hover:text-text hover:bg-neutral-50'
                }`}
              >
                CS Specializations (6)
              </button>
              <button
                onClick={() => setSelectedCategory('BOOKMARKED')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedCategory === 'BOOKMARKED'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-surface border border-border text-text-muted hover:text-text hover:bg-neutral-50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved ({bookmarkedTopicIds.size})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTracks.map((track: DocTrack) => (
            <Card
              key={track.slug}
              className="hover:border-primary-400 hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden border-border bg-surface"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center shadow-2xs group-hover:scale-105 group-hover:bg-primary-100/70 transition-all">
                    <TechIcon name={track.slug} size={26} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200">
                    {track.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-text group-hover:text-primary-800 transition-colors">
                    {track.title}
                  </h2>
                  <p className="text-xs font-semibold text-accent-800">
                    {track.tagline}
                  </p>
                </div>

                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                  {track.description}
                </p>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-text-subtle">
                  <span>{track.modulesCount} Core Modules</span>
                  <span>{track.topicsCount} In-Depth Guides</span>
                </div>
              </CardContent>

              <div className="px-6 pb-6 pt-0">
                <Link href={`/docs/${track.slug}` as Route} className="block">
                  <Button variant="primary" size="sm" className="w-full font-semibold flex items-center justify-center gap-1.5 shadow-xs">
                    <span>Explore Syllabus</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Architectural Advantages Callout */}
        <div className="p-6 rounded-2xl border border-primary-200 bg-primary-50/50 space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-primary-700" />
            <h3 className="text-base font-bold text-primary-950">
              Why Our Documentation Architecture Sets a New Standard
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-surface border border-primary-100 space-y-1">
              <strong className="text-primary-900 font-bold block">100% Signal, Zero Spam</strong>
              <p className="text-text-muted">
                No intrusive ads, cookie popups, or auto-playing videos. Pure, high-density technical material formatted for deep cognitive retention.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-primary-100 space-y-1">
              <strong className="text-primary-900 font-bold block">In-Situ Live Code Execution</strong>
              <p className="text-text-muted">
                Run, edit, and experiment with code directly on the documentation page or open the scenario in our high-performance sandbox labs.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-primary-100 space-y-1">
              <strong className="text-primary-900 font-bold block">Senior Interviewer Gotchas</strong>
              <p className="text-text-muted">
                Beyond superficial syntax, every topic reveals the common misconceptions and tricky edge cases probed during Tier-1 technical interviews.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spotlight Command Palette Modal */}
      <DocsSearchModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />

      {/* Language Evolution Matrix Modal */}
      <LanguageEvolutionModal
        isOpen={isEvolutionModalOpen}
        onClose={() => setIsEvolutionModalOpen(false)}
      />

      {/* Architecture Decision Visualizer (Trade-Off Calculators) */}
      <ArchitectureTradeoffCalculator
        isOpen={isTradeoffModalOpen}
        onClose={() => setIsTradeoffModalOpen(false)}
      />

      {/* Struct Memory Layout & Padding Inspector */}
      <StructPaddingVisualizer
        isOpen={isStructModalOpen}
        onClose={() => setIsStructModalOpen(false)}
      />

      {/* Spaced-Repetition Architecture Flashcards */}
      <DocsFlashcardsModal
        isOpen={isFlashcardsModalOpen}
        onClose={() => setIsFlashcardsModalOpen(false)}
      />

      {/* Asynchronous Event Loop & Concurrency Simulator */}
      <EventLoopSimulator
        isOpen={isEventLoopModalOpen}
        onClose={() => setIsEventLoopModalOpen(false)}
      />
    </div>
  );
}
