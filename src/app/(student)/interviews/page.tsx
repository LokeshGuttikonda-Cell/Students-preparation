'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { getRoles, type RoleTrackItem } from '../../../lib/roles-client';
import {
  getUserInterviews,
  startInterviewSession,
  type PaginatedInterviews,
} from '../../../lib/interview-client';
import {
  INTERVIEW_CATEGORIES,
  getInterviewQuestions,
} from '../../../lib/interview-catalog';
import { ROLE_HANDBOOKS, type RoleHandbook } from '../../../lib/role-handbooks-data';
import { Button } from '../../../components/ui/Button';
import { Target, Zap, BookOpen, Search, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { RoleInterviewDrillModal } from '../../../components/roles/RoleInterviewDrillModal';
import { RoleInterviewFlashcardsModal } from '../../../components/roles/RoleInterviewFlashcardsModal';

export default function InterviewsHubPage() {
  const router = useRouter();

  const [roles, setRoles] = useState<RoleTrackItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [history, setHistory] = useState<PaginatedInterviews | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [qaCategory, setQaCategory] = useState<string>('all');
  const [qaSearch, setQaSearch] = useState<string>('');
  const [expandedQaId, setExpandedQaId] = useState<string | null>(null);

  // Role technical interview defense drill state
  const [drillRole, setDrillRole] = useState<RoleHandbook | null>(null);
  const [drillCategory, setDrillCategory] = useState<string>('All Disciplines');

  // Role rapid-fire flashcards state
  const [flashcardsRole, setFlashcardsRole] = useState<RoleHandbook | null>(null);

  const filteredDrillRoles = useMemo(() => {
    if (drillCategory === 'All Disciplines') return ROLE_HANDBOOKS;
    return ROLE_HANDBOOKS.filter((r) => r.category === drillCategory);
  }, [drillCategory]);

  const filteredQuestions = useMemo(() => {
    return getInterviewQuestions(qaCategory, qaSearch);
  }, [qaCategory, qaSearch]);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [rolesData, historyData] = await Promise.all([
          getRoles().catch(() => []),
          getUserInterviews(1, 10).catch(() => null),
        ]);

        setRoles(rolesData);
        if (rolesData.length > 0) {
          setSelectedRoleId(rolesData[0].id);
        }
        setHistory(historyData);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load interview simulator data',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLaunch = async () => {
    if (!selectedRoleId || isLaunching) return;

    try {
      setIsLaunching(true);
      setError(null);
      const session = await startInterviewSession(
        selectedRoleId,
        durationMinutes,
      );
      router.push(`/interviews/${session.id}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to launch interview session',
      );
      setIsLaunching(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="min-h-dvh flex flex-col bg-[#040711] text-white selection:bg-lime-400 selection:text-black font-sans relative overflow-x-hidden">
      {/* Main Container */}
      <main className="flex-1 max-w-content mx-auto px-6 py-10 w-full space-y-10">
        {/* Hero Section */}
        <section className="bento-tile border-lime-500/30 bg-gradient-to-r from-[#071324] via-[#091b34] to-[#040915] text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden featured-glow">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20 inline-block">
                AI Socratic Simulator
              </span>
              <span className="text-[11px] font-mono font-semibold bg-white/10 px-2.5 py-0.5 rounded-full text-slate-300 border border-white/10">
                Speech-to-Text &amp; Voice Output
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
              Socratic AI Technical Interview Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              Step into an interactive live technical screening room. Conduct multi-stage
              architectural drills, respond verbally via microphone speech recognition, and
              receive spoken Socratic follow-ups tailored to your target engineering career role.
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="p-4 bento-tile border-rose-500/30 bg-rose-950/20 text-rose-200 text-sm rounded-xl font-medium"
          >
            {error}
          </div>
        )}

        {/* Launch Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Setup Simulator */}
          <div className="lg:col-span-2 space-y-8 bento-tile border-white/10 p-6 sm:p-8">
            {/* Step 1: Role Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-display font-bold text-white">
                    1. Select Engineering Career Role
                  </h2>
                  <p className="text-xs font-mono text-slate-400">
                    Choose the specialized technical persona for your mock interview.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-400/10 px-2.5 py-1 rounded-md border border-lime-400/20">
                  Zero Corporate Naming
                </span>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-xs font-mono text-slate-400 animate-pulse">
                  Loading role tracks...
                </div>
              ) : roles.length === 0 ? (
                <div className="p-4 bg-white/5 rounded-xl text-xs font-mono text-slate-400 text-center border border-white/10">
                  No active career tracks available. Please check back later.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {roles.map((r) => {
                    const isSelected = r.id === selectedRoleId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedRoleId(r.id)}
                        className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-lime-400/10 border-lime-400 ring-2 ring-lime-400/30 shadow-md shadow-lime-400/10'
                            : 'bg-white/[0.02] border-white/10 hover:border-lime-400/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-display font-bold text-sm text-white">
                            {r.name}
                          </span>
                          {isSelected && (
                            <span className="text-xs font-mono font-bold text-lime-400">
                              Selected ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-2 font-sans">
                          {r.description ||
                            `Technical interview simulation assessing core competencies in ${r.name}.`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Duration Selector */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <div>
                <h3 className="text-base font-display font-bold text-white">
                  2. Session Target Duration
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Sets the interview countdown clock and target depth.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { mins: 15, label: '15 Minutes', desc: 'Quick Screening' },
                  { mins: 20, label: '20 Minutes', desc: 'Standard Drill' },
                  { mins: 30, label: '30 Minutes', desc: 'System Deep-Dive' },
                ].map((d) => (
                  <button
                    key={d.mins}
                    type="button"
                    onClick={() => setDurationMinutes(d.mins)}
                    className={`p-3 rounded-xl text-center border transition-all cursor-pointer font-mono ${
                      durationMinutes === d.mins
                        ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md shadow-lime-400/20 font-bold'
                        : 'bg-white/5 border-white/10 hover:border-lime-400/30 text-slate-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-bold">{d.label}</div>
                    <div className={`text-[10px] mt-0.5 ${durationMinutes === d.mins ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                      {d.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Launch Action */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-mono text-slate-400">
                {selectedRole ? (
                  <span>
                    Ready to simulate: <strong className="text-white">{selectedRole.name}</strong> ({durationMinutes} mins)
                  </span>
                ) : (
                  <span>Please choose a role to begin.</span>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                disabled={!selectedRoleId || isLaunching || isLoading}
                onClick={handleLaunch}
                className="w-full sm:w-auto font-bold font-mono shadow-md shadow-lime-400/20"
              >
                {isLaunching ? 'Preparing Interview Room...' : 'Enter Live Interview Room →'}
              </Button>
            </div>
          </div>

          {/* Right Col: Audio & Voice Info Card */}
          <div className="space-y-6">
            <div className="bento-tile border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                <h3 className="font-display font-bold text-sm text-white">
                  Voice-Enabled Technical Room
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Our interview room uses your browser&apos;s native Web Speech API. You can
                respond either by <strong>speaking into your microphone</strong> or by
                <strong> typing formatted technical answers</strong>.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 font-mono font-bold">1.</span>
                  <span><strong>Introduction:</strong> Background &amp; operational experience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 font-mono font-bold">2.</span>
                  <span><strong>Technical Drill:</strong> Core conceptual mechanics and edge cases.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 font-mono font-bold">3.</span>
                  <span><strong>Scenario Architecture:</strong> Real-world triage and high-scale design.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lime-400 font-mono font-bold">4.</span>
                  <span><strong>Wrap-Up:</strong> Socratic guidance &amp; final candidate questions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Role Technical Scenario Defense Drills Section */}
        <section id="role-drills" className="space-y-6 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20 inline-flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-lime-400" />
                  <span>Interactive Scenario Practice</span>
                </span>
                <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  12 IT Engineering Personas
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Role Technical Scenario Defense Drills
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
                Step into authentic technical screening scenarios tailored for each career persona. Draft architectural proposals, formulate invariants, defend against interviewer counter-probes, and identify disqualifying anti-pattern pitfalls.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono bg-white/5 border border-white/10 p-3 rounded-2xl shadow-xs shrink-0">
              <div>
                <span className="block font-bold text-white text-sm">12</span>
                <span className="text-slate-400">Role Personas</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block font-bold text-white text-sm">48+</span>
                <span className="text-slate-400">Scenarios</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block font-bold text-lime-400 text-sm">100%</span>
                <span className="text-slate-400">Signal Driven</span>
              </div>
            </div>
          </div>

          {/* Discipline Category Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'All Disciplines',
              'Cloud & Infrastructure',
              'Backend & Systems',
              'Full-Stack & Web',
              'Data & AI',
              'Security & QA',
              'Enterprise Systems',
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setDrillCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer border ${
                  drillCategory === cat
                    ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md shadow-lime-400/20 font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Role Drills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDrillRoles.map((role) => {
              return (
                <div
                  key={role.slug}
                  className="bento-tile border-white/10 hover:border-lime-400/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/10">
                        {role.category}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20">
                        {role.questions.length} Scenarios
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-base text-white leading-snug group-hover:text-lime-300 transition-colors">
                        {role.name}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                        {role.summary}
                      </p>
                    </div>

                    {/* Scenarios preview */}
                    <div className="space-y-1 pt-2 border-t border-white/10 text-[11px] font-mono text-slate-400">
                      {role.questions.slice(0, 2).map((q, idx) => (
                        <div key={q.id} className="flex items-center gap-1.5 truncate">
                          <span className="text-lime-400 font-bold shrink-0">#{idx + 1}</span>
                          <span className="truncate">{q.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1 text-xs font-bold font-mono gap-1 shadow-md shadow-lime-400/20"
                      onClick={() => setDrillRole(role)}
                    >
                      <Target className="w-3.5 h-3.5 mr-1" />
                      <span>Launch Drill</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs font-bold font-mono gap-1"
                      onClick={() => setFlashcardsRole(role)}
                    >
                      <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
                      <span>Flashcards</span>
                    </Button>
                    <Link href={`/roles/handbooks/${role.slug}` as Route} className="shrink-0">
                      <Button variant="ghost" size="sm" className="text-xs font-mono text-slate-400 hover:text-white">
                        <BookOpen className="w-3.5 h-3.5 mr-1 text-lime-400" />
                        <span>Handbook</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Flagship Technical Interview Q&A Repository */}
        <section id="qa-repository" className="space-y-6 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
                  Comprehensive Q&amp;A Repository
                </span>
                <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                  51+ Master Technical Questions
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Top Technical Interview Questions &amp; Answers
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
                Study first-principles technical solutions with algorithmic complexity proofs, architectural trade-offs, interviewer counter-questions, and direct links to curriculum concept guides.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 text-xs font-mono bg-white/5 border border-white/10 p-3 rounded-2xl shadow-xs">
              <div>
                <span className="block font-bold text-white text-sm">51</span>
                <span className="text-slate-400">Master Questions</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block font-bold text-white text-sm">8</span>
                <span className="text-slate-400">Disciplines</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block font-bold text-lime-400 text-sm">100%</span>
                <span className="text-slate-400">Follow-ups &amp; Pitfalls</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-4 bento-tile border-white/10 p-5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={qaSearch}
                onChange={(e) => setQaSearch(e.target.value)}
                placeholder="Search interview questions by keyword, algorithm, design pattern, or trap..."
                className="w-full pl-10 pr-10 py-3 bg-black/50 border border-white/10 rounded-xl text-xs sm:text-sm text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-lime-400 transition-all"
              />
              {qaSearch && (
                <button
                  type="button"
                  onClick={() => setQaSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-semibold text-slate-400 hover:text-white bg-white/10 border border-white/10 px-2 py-0.5 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {INTERVIEW_CATEGORIES.map((cat) => {
                const isActive = qaCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setQaCategory(cat.slug)}
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-mono font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-lime-400 text-slate-950 border-lime-400 shadow-md shadow-lime-400/20 font-bold'
                        : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:border-lime-400/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center justify-between pt-1">
              <span>Showing <strong className="text-white">{filteredQuestions.length}</strong> questions matching criteria</span>
              {qaCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setQaCategory('all')}
                  className="text-lime-400 hover:underline cursor-pointer font-mono"
                >
                  Reset Category
                </button>
              )}
            </div>
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center bento-tile border-white/10 space-y-2">
                <p className="text-sm font-display font-semibold text-white">No technical interview questions match your search.</p>
                <p className="text-xs font-mono text-slate-400">Try clearing the search input or selecting another engineering discipline.</p>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isExpanded = expandedQaId === q.id;
                return (
                  <div
                    key={q.id}
                    className="bento-tile border-white/10 overflow-hidden transition-all hover:border-lime-400/40"
                  >
                    {/* Card Header / Summary */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedQaId(isExpanded ? null : q.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedQaId(isExpanded ? null : q.id);
                        }
                      }}
                      className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-4 select-none"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-lime-400/10 text-lime-400 border border-lime-400/20">
                            {q.category}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              q.difficulty === 'EASY'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : q.difficulty === 'MEDIUM'
                                ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                                : q.difficulty === 'HARD'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              q.frequency === 'VERY HIGH'
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : q.frequency === 'HIGH'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-white/5 text-slate-300 border-white/10'
                            }`}
                          >
                            Frequency: {q.frequency}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-display font-bold text-white hover:text-lime-300 transition-colors">
                          {q.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                          {q.shortSummary}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0">
                        <span className="text-xs font-mono font-bold text-lime-400">
                          {isExpanded ? 'Hide Solution ▲' : 'View Solution ▼'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Model Answer & Deep Dive Details */}
                    {isExpanded && (
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 space-y-6 border-t border-white/10 pt-5 bg-black/40">
                        {/* Deep Model Answer */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                            Model Answer &amp; First-Principles Architecture
                          </h4>
                          <div className="p-4 bg-black/80 border border-white/10 rounded-xl text-xs sm:text-sm text-lime-300 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto shadow-inner">
                            {q.deepAnswer}
                          </div>
                        </div>

                        {/* Two Columns: Follow-ups & Pitfalls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Interviewer Counter-Questions */}
                          <div className="p-4 bento-tile bg-amber-950/20 border-amber-500/30 text-amber-200 rounded-xl space-y-2">
                            <h5 className="text-xs font-display font-bold text-amber-300 flex items-center gap-1.5">
                              <Target className="w-3.5 h-3.5 text-amber-400" />
                              <span>Senior Interviewer Counter-Questions (Follow-ups)</span>
                            </h5>
                            <ul className="space-y-1.5 text-xs text-amber-200 font-sans">
                              {q.interviewerCounterQuestions.map((cq, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="font-bold text-amber-400 font-mono">•</span>
                                  <span>{cq}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Common Traps & Pitfalls */}
                          <div className="p-4 bento-tile bg-rose-950/20 border-rose-500/30 text-rose-200 rounded-xl space-y-2">
                            <h5 className="text-xs font-display font-bold text-rose-300 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Common Candidate Traps &amp; Pitfalls</span>
                            </h5>
                            <ul className="space-y-1.5 text-xs text-rose-200 font-sans">
                              {q.pitfalls.map((pf, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="font-bold text-rose-400 font-mono">•</span>
                                  <span>{pf}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Key Takeaways */}
                        <div className="p-4 bento-tile bg-cyan-950/20 border-cyan-500/30 text-cyan-200 rounded-xl space-y-2">
                          <h5 className="text-xs font-display font-bold text-cyan-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Core Architectural Takeaways</span>
                          </h5>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-cyan-200 font-sans">
                            {q.keyTakeaways.map((tk, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                <span>{tk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                          {q.relatedCurriculumSlug ? (
                            <Link
                              href={`/curriculum/${q.relatedCurriculumSlug}`}
                              className="text-xs font-mono font-bold text-lime-400 hover:text-white flex items-center gap-1 hover:underline"
                            >
                              <span>Read In-Depth Theory &amp; Code in Curriculum</span>
                              <span>→</span>
                            </Link>
                          ) : (
                            <div />
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs font-mono font-semibold text-slate-300 hover:text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                          >
                            Launch AI Simulator for this Topic ↑
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Historical Interviews Section */}
        {history && history.items.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-white/10">
            <div>
              <h2 className="text-xl font-display font-bold text-white">
                Previous Technical Interviews
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Review past conversational dialogues, transcripts, and evaluation scorecards.
              </p>
            </div>

            <div className="bento-tile border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/60 border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Role Track</th>
                      <th className="px-5 py-3.5 text-center">Date</th>
                      <th className="px-5 py-3.5 text-center">Target Duration</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-center">Overall Score</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-4 font-semibold text-white">
                          {item.roleTrack.name}
                        </td>
                        <td className="px-5 py-4 text-center text-xs font-mono text-slate-400">
                          {new Date(item.startedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-center text-xs font-mono text-slate-300">
                          {item.targetDurationMinutes} mins
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                              item.status === 'COMPLETED'
                                ? 'bg-lime-400/10 text-lime-400 border-lime-400/30'
                                : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-mono font-bold tabular-nums">
                          {item.overallScore !== null ? (
                            <span className="text-lime-400">{item.overallScore}%</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href={
                              item.status === 'COMPLETED'
                                ? `/interviews/${item.id}/results`
                                : `/interviews/${item.id}`
                            }
                          >
                            <Button variant="secondary" size="sm" className="font-mono text-xs">
                              {item.status === 'COMPLETED' ? 'View Scorecard' : 'Resume Room'}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Role Technical Scenario Defense Drill Modal */}
        {drillRole && (
          <RoleInterviewDrillModal
            role={drillRole}
            isOpen={!!drillRole}
            onClose={() => setDrillRole(null)}
          />
        )}

        {/* Role Rapid-Fire Flashcards Modal */}
        {flashcardsRole && (
          <RoleInterviewFlashcardsModal
            role={flashcardsRole}
            isOpen={!!flashcardsRole}
            onClose={() => setFlashcardsRole(null)}
          />
        )}
      </main>
    </div>
  );
}
