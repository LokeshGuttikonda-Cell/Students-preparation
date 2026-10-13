'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { searchDocTopics, type DocSearchResult } from '../../lib/docs-client';
import { DOC_TRACKS } from '../../lib/docs-catalog';
import { Search, Clock, X } from 'lucide-react';
import { TechIcon } from '../ui/TechIcon';

interface DocsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsSearchModal: React.FC<DocsSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'LANGUAGES' | 'SPECIALIZATIONS'>('ALL');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open and reset state
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Global keydown listener for Escape and Arrow navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter search results
  const results = useMemo(() => {
    if (!query.trim()) {
      // Return popular starter topics if query is empty
      const starters: DocSearchResult[] = [];
      for (const track of DOC_TRACKS) {
        if (selectedCategory === 'LANGUAGES' && track.category !== 'PROGRAMMING_LANGUAGE') continue;
        if (selectedCategory === 'SPECIALIZATIONS' && track.category !== 'CS_SPECIALIZATION') continue;

        if (track.modules.length > 0 && track.modules[0].topics.length > 0) {
          const t = track.modules[0].topics[0];
          starters.push({
            trackSlug: track.slug,
            trackTitle: track.title,
            trackIcon: track.icon,
            moduleTitle: track.modules[0].title,
            topicSlug: t.slug,
            topicTitle: t.title,
            shortDescription: t.shortDescription,
            difficulty: t.difficulty,
            readTimeMinutes: t.readTimeMinutes,
          });
        }
      }
      return starters.slice(0, 8);
    }

    const allResults = searchDocTopics(query);
    if (selectedCategory === 'ALL') return allResults;

    return allResults.filter((r) => {
      const track = DOC_TRACKS.find((t) => t.slug === r.trackSlug);
      if (!track) return true;
      if (selectedCategory === 'LANGUAGES') return track.category === 'PROGRAMMING_LANGUAGE';
      if (selectedCategory === 'SPECIALIZATIONS') return track.category === 'CS_SPECIALIZATION';
      return true;
    });
  }, [query, selectedCategory]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleSelectTopic = (trackSlug: string, topicSlug: string) => {
    onClose();
    router.push(`/docs/${trackSlug}/${topicSlug}` as Route);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
      scrollItemIntoView((selectedIndex + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      scrollItemIntoView((selectedIndex - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = results[selectedIndex];
      if (current) {
        handleSelectTopic(current.trackSlug, current.topicSlug);
      }
    }
  };

  const scrollItemIntoView = (index: number) => {
    if (!listRef.current) return;
    const item = listRef.current.children[index] as HTMLElement;
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Documentation Spotlight Search"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-4 border-b border-border flex items-center gap-3 bg-surface-subtle">
          <Search className="w-5 h-5 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search across all 13 tracks, algorithms, JVM, kernels..."
            className="flex-1 bg-transparent border-none text-base text-text focus:outline-none placeholder:text-text-subtle font-medium"
            aria-label="Search tutorials and topics"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-text-muted hover:text-text px-1.5 py-0.5 rounded bg-surface border border-border flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-text-muted border border-border">
            ESC
          </kbd>
        </div>

        {/* Category Tabs Filter */}
        <div className="px-4 py-2 border-b border-border/60 bg-surface flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-text-muted text-[11px] font-semibold uppercase tracking-wider mr-1">
            Filter:
          </span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-200 font-bold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            All Tracks
          </button>
          <button
            onClick={() => setSelectedCategory('LANGUAGES')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'LANGUAGES'
                ? 'bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-200 font-bold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Languages (7)
          </button>
          <button
            onClick={() => setSelectedCategory('SPECIALIZATIONS')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'SPECIALIZATIONS'
                ? 'bg-primary-100 text-primary-900 dark:bg-primary-950 dark:text-primary-200 font-bold'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Specializations (6)
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-border/40"
          tabIndex={-1}
        >
          {results.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Search className="w-8 h-8 text-text-muted mx-auto" />
              <p className="text-sm font-semibold text-text">No documentation topics found</p>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                No matching topics for &ldquo;{query}&rdquo;. Try searching for &ldquo;Virtual Threads&rdquo;, &ldquo;B+ Tree&rdquo;, &ldquo;CFS&rdquo;, or &ldquo;RAII&rdquo;.
              </p>
            </div>
          ) : (
            results.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.trackSlug}-${item.topicSlug}`}
                  onClick={() => handleSelectTopic(item.trackSlug, item.topicSlug)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-transparent'
                  }`}
                >
                  <TechIcon slug={item.trackSlug} name={item.trackTitle} className="w-6 h-6 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                        {item.trackTitle}
                      </span>
                      <span className="text-[10px] text-text-subtle">•</span>
                      <span className="text-[10px] text-text-muted truncate max-w-[180px]">
                        {item.moduleTitle}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          item.difficulty === 'BEGINNER'
                            ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                            : item.difficulty === 'INTERMEDIATE'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : item.difficulty === 'ADVANCED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {item.difficulty}
                      </span>
                      <span className="text-[10px] text-text-subtle ml-auto inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-text-muted" />
                        <span>{item.readTimeMinutes} min</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text truncate">
                      {item.topicTitle}
                    </h4>

                    <p className="text-xs text-text-muted line-clamp-1">
                      {item.shortDescription}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="p-3 border-t border-border bg-surface-subtle flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono font-bold">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono font-bold">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-mono font-bold">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="text-text-subtle">
            {results.length} {results.length === 1 ? 'topic' : 'topics'}
          </span>
        </div>
      </div>
    </div>
  );
};
