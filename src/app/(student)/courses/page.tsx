'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses, type CourseTrackItem } from '../../../lib/courses-client';
import { CourseCard } from '../../../components/courses/CourseCard';
import { Button } from '../../../components/ui/Button';

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<CourseTrackItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load course pathways. Please check your network.',
        );
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  // Filter logic
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.roleTrack && c.roleTrack.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRole === 'ALL' || (c.roleTrack && c.roleTrack.slug === selectedRole);

    const matchesLevel =
      selectedLevel === 'ALL' || c.level.toUpperCase() === selectedLevel.toUpperCase();

    return matchesSearch && matchesRole && matchesLevel;
  });

  // Unique roles for filtering
  const roleMap = new Map<string, { id: string; name: string; slug: string }>();
  courses.forEach((c) => {
    if (c.roleTrack) roleMap.set(c.roleTrack.slug, c.roleTrack);
  });
  const availableRoles = Array.from(roleMap.values());

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-content mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/dashboard" className="hover:text-primary-700 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-text font-medium">Courses</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20 inline-block">
              22 PRODUCTION TRACKS
            </span>
            <span className="text-xs font-mono text-slate-400">182 THEORY MODULES • ZERO FLUFF</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
            Technology Courses &amp; Learning Pathways
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Master engineering competencies step-by-step with structured, role-aligned courses.
            Each pathway groups syllabus topics into guided modules with interactive practice,
            applied drills, and milestone validation.
          </p>
        </div>

        {/* CURRICULUM PREREQUISITE DAG VISUALIZER */}
        <div className="bento-tile p-6 space-y-4 bg-gradient-to-br from-[#081524] via-[#0a1829] to-[#050e18] border-cyan-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">[ENGINEERING ROADMAP DAG]</span>
                <span className="text-xs font-mono text-slate-400">PREREQUISITE KNOWLEDGE TREE</span>
              </div>
              <h2 className="text-base font-bold text-white font-display">Staff AI Systems Mastery Progression</h2>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/20 font-bold">
              Level 3 of 5 In Flight
            </span>
          </div>

          {/* Horizontal Flow Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-black/50 border border-emerald-500/40 text-emerald-300 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">STAGE 1</span>
                <span className="text-emerald-400 font-bold">✓ DONE</span>
              </div>
              <div className="font-bold text-white text-xs">AST Foundations</div>
              <span className="text-[10px] text-slate-400 block font-sans">Python AST, AsyncIO, Memory Profiling</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-emerald-500/40 text-emerald-300 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">STAGE 2</span>
                <span className="text-emerald-400 font-bold">✓ DONE</span>
              </div>
              <div className="font-bold text-white text-xs">ReAct &amp; Tool Use</div>
              <span className="text-[10px] text-slate-400 block font-sans">Structured JSON, Dynamic Schemas, Sandboxes</span>
            </div>

            <div className="p-3 rounded-2xl bg-lime-950/40 border border-lime-400/60 text-lime-300 space-y-1.5 shadow-[0_0_15px_rgba(163,230,53,0.2)]">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-lime-400 font-bold">STAGE 3 (ACTIVE)</span>
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
              </div>
              <div className="font-bold text-white text-xs">GraphRAG Leiden</div>
              <span className="text-[10px] text-slate-300 block font-sans">Hierarchical Summaries &amp; Community Clusters</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-cyan-500/30 text-cyan-300 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">STAGE 4</span>
                <span className="text-cyan-400 font-bold">NEXT UP</span>
              </div>
              <div className="font-bold text-white text-xs">PagedAttention</div>
              <span className="text-[10px] text-slate-400 block font-sans">KV Block Virtualization &amp; Speculative Horizons</span>
            </div>

            <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-slate-500 space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">STAGE 5</span>
                <span className="text-slate-500">🔒 LOCKED</span>
              </div>
              <div className="font-bold text-slate-400 text-xs">Production Evals</div>
              <span className="text-[10px] text-slate-500 block font-sans">Judge Calibrations &amp; Automated CI Benchmarks</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="space-y-4 bento-tile p-4 sm:p-6 border-white/10">
          {/* Search Box */}
          <div>
            <label htmlFor="course-search" className="sr-only">
              Search courses
            </label>
            <input
              id="course-search"
              type="text"
              placeholder="Search by course name, topic, or engineering domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-lime-400 font-mono"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
            {/* Role Filter */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono">
              <span className="text-xs font-semibold text-slate-400 mr-1">Role:</span>
              <button
                type="button"
                onClick={() => setSelectedRole('ALL')}
                className={`text-xs px-2.5 py-1 rounded-xl transition-colors ${
                  selectedRole === 'ALL'
                    ? 'bg-lime-400 text-slate-950 font-bold'
                    : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                All Roles
              </button>
              {availableRoles.map((r) => (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => setSelectedRole(r.slug)}
                  className={`text-xs px-2.5 py-1 rounded-xl transition-colors ${
                    selectedRole === r.slug
                      ? 'bg-lime-400 text-slate-950 font-bold'
                      : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-xs font-semibold text-slate-400 mr-1">Level:</span>
              {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`text-xs px-2.5 py-1 rounded-xl transition-colors ${
                    selectedLevel === lvl
                      ? 'bg-cyan-400 text-slate-950 font-bold'
                      : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  {lvl === 'ALL' ? 'All' : lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-700 border-t-transparent" />
            <p className="text-sm text-text-muted">Loading curriculum pathways...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-error-50 border border-error-200 rounded-lg text-center space-y-3">
            <p className="text-sm text-error-800 font-medium">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry Loading
            </Button>
          </div>
        )}

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="p-12 bg-surface border border-border rounded-lg text-center space-y-3">
            <p className="text-base font-semibold text-text">No courses match your criteria</p>
            <p className="text-xs text-text-muted">
              Try adjusting your search terms, role selection, or difficulty level.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedRole('ALL');
                setSelectedLevel('ALL');
              }}
            >
              Reset All Filters
            </Button>
          </div>
        )}

        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
