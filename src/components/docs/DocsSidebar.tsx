'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import type { DocTrack, DocModule } from '../../lib/docs-catalog';
import { DOC_TRACKS } from '../../lib/docs-catalog';
import { DocsSearchModal } from './DocsSearchModal';

interface DocsSidebarProps {
  currentTrack: DocTrack;
  currentTopicSlug?: string;
  onTopicSelect?: () => void;
}

export const DocsSidebar: React.FC<DocsSidebarProps> = ({
  currentTrack,
  currentTopicSlug,
  onTopicSelect,
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [readTopics, setReadTopics] = useState<Set<string>>(new Set());
  const [bookmarkedTopics, setBookmarkedTopics] = useState<Set<string>>(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Load read status and bookmarked status from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('studentsprep_read_topics');
      if (stored) {
        setReadTopics(new Set(JSON.parse(stored)));
      }
      const bStored = localStorage.getItem('studentsprep_bookmarked_topics');
      if (bStored) {
        setBookmarkedTopics(new Set(JSON.parse(bStored)));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleModule = (moduleId: string) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetTrackSlug = e.target.value;
    router.push(`/docs/${targetTrackSlug}` as Route);
  };

  const filteredModules = useMemo(() => {
    let mods = currentTrack.modules;

    if (showBookmarkedOnly) {
      mods = mods
        .map((mod) => ({
          ...mod,
          topics: mod.topics.filter((t) => bookmarkedTopics.has(t.id)),
        }))
        .filter((mod) => mod.topics.length > 0);
    }

    if (!searchQuery.trim()) return mods;
    const q = searchQuery.toLowerCase().trim();

    return mods
      .map((mod) => {
        const matchingTopics = mod.topics.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.shortDescription.toLowerCase().includes(q),
        );
        return {
          ...mod,
          topics: matchingTopics,
        };
      })
      .filter((mod) => mod.topics.length > 0);
  }, [currentTrack.modules, searchQuery, showBookmarkedOnly, bookmarkedTopics]);

  return (
    <aside
      className="w-full h-full flex flex-col bg-surface border-r border-border select-none"
      aria-label="Documentation Navigation"
    >
      {/* Track Selector Header */}
      <div className="p-4 border-b border-border space-y-3 bg-surface-subtle">
        <div className="flex items-center justify-between">
          <Link
            href={'/docs' as Route}
            className="text-xs font-bold uppercase tracking-wider text-primary-700 hover:text-primary-900 flex items-center gap-1.5 transition-colors"
          >
            <span>&larr;</span>
            <span>All Tutorials</span>
          </Link>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-100 text-accent-800 border border-accent-200">
            {currentTrack.badge}
          </span>
        </div>

        {/* Track Dropdown Switcher */}
        <div className="space-y-1">
          <label htmlFor="track-selector" className="text-xs font-semibold text-text-muted">
            Current Track:
          </label>
          <div className="relative">
            <select
              id="track-selector"
              value={currentTrack.slug}
              onChange={handleTrackChange}
              className="w-full appearance-none bg-surface border border-border rounded-lg px-3 py-2 text-sm font-semibold text-text focus:outline-none focus:ring-2 focus:ring-primary-500 pr-8 cursor-pointer shadow-xs transition-colors hover:border-primary-400"
            >
              <optgroup label="Programming Languages">
                {DOC_TRACKS.filter((t) => t.category === 'PROGRAMMING_LANGUAGE').map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.icon} {t.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Computer Science Specializations">
                {DOC_TRACKS.filter((t) => t.category === 'CS_SPECIALIZATION').map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.icon} {t.title}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Global Spotlight Search Trigger (Ctrl+K) */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-muted hover:text-text hover:border-primary-400 transition-colors shadow-2xs group"
          aria-label="Search all documentation topics"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-primary-700">🔍</span>
            <span className="group-hover:text-text">Search all 13 tracks...</span>
          </span>
          <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-subtle border border-border text-text-subtle">
            Ctrl K
          </kbd>
        </button>

        {/* Search input within track */}
        <div className="relative">
          <input
            type="text"
            placeholder="Filter current track..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-2xs"
            aria-label="Filter topics in this track"
          />
          <span className="absolute left-2.5 top-2 text-text-subtle text-xs">⚡</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1.5 text-text-subtle hover:text-text text-xs"
              aria-label="Clear filter"
            >
              &times;
            </button>
          )}
        </div>

        {/* Quick Filter Status Strip */}
        <div className="flex items-center justify-between text-[11px] pt-0.5">
          <button
            type="button"
            onClick={() => setShowBookmarkedOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] transition-all ${
              showBookmarkedOnly
                ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold dark:bg-amber-950/50 dark:text-amber-200'
                : 'bg-surface text-text-muted border-border hover:border-amber-400 hover:text-text'
            }`}
            aria-pressed={showBookmarkedOnly}
          >
            <span>{showBookmarkedOnly ? '★' : '☆'}</span>
            <span>Bookmarked ({bookmarkedTopics.size})</span>
          </button>
          <span className="text-text-subtle">
            {readTopics.size} read
          </span>
        </div>
      </div>

      {/* Modules and Topics Accordion Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredModules.length === 0 ? (
          <div className="p-4 text-center text-xs text-text-muted space-y-1">
            {showBookmarkedOnly ? (
              <p>No bookmarked chapters in this track yet. Click &ldquo;☆ Bookmark&rdquo; on any chapter to save it here.</p>
            ) : (
              <p>No topics matching &ldquo;{searchQuery}&rdquo;</p>
            )}
          </div>
        ) : (
          filteredModules.map((mod: DocModule) => {
            const isCollapsed = collapsedModules[mod.id] && !searchQuery.trim();

            return (
              <div key={mod.id} className="space-y-1">
                {/* Module Header Toggle */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs font-bold text-text hover:bg-neutral-100 transition-colors group"
                  aria-expanded={!isCollapsed}
                >
                  <span className="truncate group-hover:text-primary-800">
                    {mod.title}
                  </span>
                  <span className="text-[10px] text-text-subtle ml-2 shrink-0">
                    {isCollapsed ? '▶' : '▼'}
                  </span>
                </button>

                {/* Topics in Module */}
                {!isCollapsed && (
                  <div className="pl-2 space-y-0.5 border-l-2 border-border/60 ml-2">
                    {mod.topics.map((top) => {
                      const isActive = top.slug === currentTopicSlug;
                      const isRead = readTopics.has(top.id);

                      return (
                        <Link
                          key={top.id}
                          href={`/docs/${currentTrack.slug}/${top.slug}` as Route}
                          onClick={onTopicSelect}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all ${
                            isActive
                              ? 'bg-primary-50 text-primary-900 font-bold shadow-2xs border-l-3 border-primary-700 -ml-[2px]'
                              : 'text-text-muted hover:text-text hover:bg-neutral-50'
                          }`}
                        >
                          <span className="truncate pr-2">{top.title}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isRead && (
                              <span
                                className="text-[10px] text-success-600"
                                title="Completed"
                              >
                                ✓
                              </span>
                            )}
                            <span className="text-[10px] text-text-subtle font-mono">
                              {top.readTimeMinutes}m
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border bg-surface-subtle text-[11px] text-text-subtle flex items-center justify-between">
        <span>{currentTrack.topicsCount} In-Depth Guides</span>
        <span className="font-semibold text-accent-700">100% Signal</span>
      </div>

      {/* Spotlight Search Modal */}
      <DocsSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </aside>
  );
};
