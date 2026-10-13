'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { getRoles, RoleTrackItem } from '../../../lib/roles-client';
import { RoleCard } from '../../../components/roles/RoleCard';
import { Button } from '../../../components/ui/Button';
import { BookOpen, FileDown, ArrowRight, Search, X } from 'lucide-react';

export default function RolesCatalogPage() {
  const [roles, setRoles] = useState<RoleTrackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoles() {
      try {
        setLoading(true);
        setError(null);
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load career role tracks. Please check your network.',
        );
      } finally {
        setLoading(false);
      }
    }
    loadRoles();
  }, []);

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.competencies.some((c) =>
      c.topicName.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  return (
    <div className="min-h-dvh bg-[#040711] text-white selection:bg-lime-400 selection:text-black py-8 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden font-sans">
      <div className="max-w-content mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/dashboard" className="hover:text-lime-400 transition-colors">
            Dashboard
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white font-medium">Career Roles</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20 inline-block">
            Role Competency Tracks
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
            Career Roles &amp; Skill Tracks
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
            Prepare directly for the technical profile you are interviewing for.
            Each career track organizes syllabus topics by real-world recruiter weightage
            and evaluation cutoffs without corporate exam branding.
          </p>
        </div>

        {/* Download Handbooks Callout Banner */}
        <div className="bento-tile border-lime-500/30 bg-gradient-to-r from-[#071324] via-[#0b1c35] to-[#040a17] text-white rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 featured-glow relative overflow-hidden">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400">
              <BookOpen className="w-3.5 h-3.5 text-lime-400" />
              <span>Official Curriculum Publication</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-white">
              Download All 12 IT Role Handbooks &amp; PDF Syllabi
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Access comprehensive, publication-grade PDF handbooks covering role responsibilities, multi-tier syllabi, interview questions with counter-probes, recruiter traps, and system invariants.
            </p>
          </div>
          <Link href={"/roles/handbooks" as Route} className="shrink-0">
            <Button
              variant="primary"
              className="font-bold font-mono text-xs shadow-md shadow-lime-400/25"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
              Explore &amp; Download Handbooks
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-white/10 pb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by role, skill, or topic (e.g. DevOps, Java, SQL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-white/10 bg-black/50 text-white font-mono placeholder:text-slate-500 focus-visible:outline-none focus-visible:border-lime-400 min-h-[44px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs font-mono text-slate-400">
            Showing <strong className="text-white">{filteredRoles.length}</strong> of{' '}
            <strong className="text-white">{roles.length}</strong> Career Profiles
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="bento-tile p-6 border-rose-500/30 bg-rose-950/20 text-rose-200 space-y-3"
          >
            <p className="font-semibold text-sm font-sans">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl bento-tile border-white/10 animate-pulse p-6 space-y-4"
              >
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-6 bg-white/10 rounded w-3/4" />
                <div className="h-16 bg-white/10 rounded w-full" />
                <div className="h-8 bg-white/10 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Roles Grid */}
        {!loading && !error && filteredRoles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <RoleCard key={role.id} role={role} />
            ))}
          </div>
        )}

        {/* Empty Search State */}
        {!loading && !error && filteredRoles.length === 0 && (
          <div className="text-center py-12 px-4 bento-tile border-dashed border-white/10 space-y-4">
            <h3 className="text-lg font-display font-bold text-white">No matching career tracks found</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto font-sans">
              We couldn&apos;t find any roles matching &ldquo;{searchQuery}&rdquo;. Try clearing your search or
              browsing our general topic practice sets.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSearchQuery('')}>
                Clear Filter
              </Button>
              <Link href="/practice">
                <Button variant="primary">Browse All Practice Topics</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
