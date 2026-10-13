'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { DocTopic } from '../../lib/docs-catalog';
import { Button } from '../ui/Button';

interface TocItem {
  id: string;
  label: string;
}

interface DocsTableOfContentsProps {
  topic: DocTopic;
}

export const DocsTableOfContents: React.FC<DocsTableOfContentsProps> = ({ topic }) => {
  const [activeId, setActiveId] = useState<string>('sec-overview');

  // Build list of TOC sections
  const tocItems: TocItem[] = useMemo(() => [
    { id: 'sec-overview', label: 'Overview & Fundamentals' },
    { id: 'sec-invariants', label: 'Architectural Invariants' },
    ...(topic.complexity ? [{ id: 'sec-complexity', label: 'Complexity & Bounds' }] : []),
    ...(topic.theorySections || []).map((s, idx) => ({
      id: s.id || `sec-theory-${idx}`,
      label: s.heading.replace(/^[0-9]+\.\s*/, ''),
    })),
    ...(topic.interactivePlayground ? [{ id: 'sec-playground', label: 'Interactive Code Playground' }] : []),
    ...(topic.interviewerGotchas.length > 0 ? [{ id: 'sec-gotchas', label: 'Interviewer Traps & Gotchas' }] : []),
    ...(topic.practiceMcqs.length > 0 ? [{ id: 'sec-quiz', label: 'Verification MCQ Checkpoint' }] : []),
  ], [topic]);

  // Scroll-spy observer
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const item = tocItems[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <nav
      className="w-full space-y-6 text-xs select-none"
      aria-label="Table of Contents"
    >
      {/* On This Page List */}
      <div className="space-y-2">
        <h4 className="font-bold text-text uppercase tracking-wider text-[11px] text-primary-900 flex items-center gap-1.5">
          <span>📑</span>
          <span>On This Page</span>
        </h4>
        <ul className="space-y-1 border-l border-border pl-2.5">
          {tocItems.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`block py-1 transition-colors truncate ${
                    isActive
                      ? 'text-primary-700 font-bold border-l-2 border-primary-700 -ml-[11px] pl-[9px]'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Interactive Sandbox Launcher Card */}
      {(() => {
        let labTitle = 'Live Interactive Labs';
        let labDesc = 'Step into our high-performance interactive sandboxes to inspect real-time state.';
        let labRoute: Route = '/sandbox' as Route;

        if (topic.id.includes('-sd-') || topic.id.includes('-cloud-')) {
          labTitle = 'Distributed Systems Lab';
          labDesc = 'Simulate Raft leader elections, split-brain quorum partitions, and consistent hash rings in real time.';
          labRoute = '/sandbox?tab=distributed' as Route;
        } else if (topic.id.includes('-sql-') || topic.id.includes('-db-')) {
          labTitle = 'SQL Engine & Storage Lab';
          labDesc = 'Execute queries against live in-memory SQLite tables and inspect B+ Tree page allocations.';
          labRoute = '/sandbox?tab=sql' as Route;
        } else if (topic.id.includes('-os-') || topic.id.includes('-net-')) {
          labTitle = 'Kernel & Network Lab';
          labDesc = 'Trace eBPF bytecode, XDP packet filters, and Linux socket ring buffer behavior.';
          labRoute = '/sandbox?tab=kernel-network' as Route;
        } else if (topic.id.includes('-dsa-')) {
          labTitle = 'Algorithm Visualizer Lab';
          labDesc = 'Step through tree rotations, Floyd build-heap siftdowns, and monotonic stack operations.';
          labRoute = '/sandbox?tab=visualizer' as Route;
        } else {
          labTitle = 'Code Logic & Test Lab';
          labDesc = 'Execute test cases against our high-speed isolated in-browser evaluation runner.';
          labRoute = '/sandbox?tab=code' as Route;
        }

        return (
          <div className="p-3.5 rounded-xl bg-surface-muted border border-border space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-primary-800 font-bold">
              <span className="text-base">⚡</span>
              <span>{labTitle}</span>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              {labDesc}
            </p>
            <Link href={labRoute} className="block">
              <Button variant="secondary" size="sm" className="w-full text-xs font-semibold">
                Open {labTitle.split(' ')[0]} Lab &rarr;
              </Button>
            </Link>
          </div>
        );
      })()}

      {/* Related Interview Questions */}
      {topic.relatedInterviewIds && topic.relatedInterviewIds.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-text uppercase tracking-wider text-[11px] text-text-subtle flex items-center gap-1.5">
            <span>🎯</span>
            <span>Interview Guides</span>
          </h4>
          <div className="space-y-1.5">
            {topic.relatedInterviewIds.map((qId) => (
              <Link
                key={qId}
                href={`/interviews?search=${encodeURIComponent(qId)}` as Route}
                className="block p-2 rounded-lg border border-border bg-surface hover:bg-neutral-50 hover:border-primary-300 transition-all group"
              >
                <div className="text-[11px] font-semibold text-primary-800 group-hover:text-primary-900 truncate">
                  Master Q&amp;A: {qId.toUpperCase()}
                </div>
                <div className="text-[10px] text-text-subtle">
                  Deep answers, counter-questions &amp; pitfalls &rarr;
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Back to top */}
      <div className="pt-2 border-t border-border">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-text-muted hover:text-text text-[11px] flex items-center gap-1 transition-colors"
        >
          <span>↑</span>
          <span>Back to top</span>
        </button>
      </div>
    </nav>
  );
};
