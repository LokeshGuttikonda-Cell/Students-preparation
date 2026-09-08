'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Button } from '../../../components/ui/Button';

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
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
      {/* Main Container */}
      <main className="flex-1 max-w-content mx-auto px-6 py-10 w-full space-y-10">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-300">
                AI Socratic Simulator
              </span>
              <span className="text-[11px] font-semibold bg-white/15 px-2.5 py-0.5 rounded-full text-white">
                Speech-to-Text &amp; Voice Output
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Socratic AI Technical Interview Simulator
            </h1>
            <p className="text-sm sm:text-base text-primary-100 leading-relaxed">
              Step into an interactive live technical screening room. Conduct multi-stage
              architectural drills, respond verbally via microphone speech recognition, and
              receive spoken Socratic follow-ups tailored to your target engineering career role.
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="p-4 bg-error-50 border border-error-200 text-error-800 text-sm rounded-xl font-medium"
          >
            {error}
          </div>
        )}

        {/* Launch Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Setup Simulator */}
          <div className="lg:col-span-2 space-y-8 bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
            {/* Step 1: Role Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text">
                    1. Select Engineering Career Role
                  </h2>
                  <p className="text-xs text-text-muted">
                    Choose the specialized technical persona for your mock interview.
                  </p>
                </div>
                <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-200">
                  Zero Corporate Naming
                </span>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-sm text-text-muted animate-pulse">
                  Loading role tracks...
                </div>
              ) : roles.length === 0 ? (
                <div className="p-4 bg-canvas rounded-xl text-sm text-text-muted text-center">
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
                            ? 'bg-primary-50/70 border-primary-600 ring-2 ring-primary-500/20 shadow-xs'
                            : 'bg-canvas border-border hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-text">
                            {r.name}
                          </span>
                          {isSelected && (
                            <span className="text-xs font-bold text-primary-700">
                              Selected ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted line-clamp-2">
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
            <div className="space-y-3 pt-4 border-t border-border">
              <div>
                <h3 className="text-base font-bold text-text">
                  2. Session Target Duration
                </h3>
                <p className="text-xs text-text-muted">
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
                    className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                      durationMinutes === d.mins
                        ? 'bg-primary-50 border-primary-600 text-primary-900 ring-2 ring-primary-500/20'
                        : 'bg-canvas border-border hover:border-primary-300 text-text'
                    }`}
                  >
                    <div className="font-bold text-sm">{d.label}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">
                      {d.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Launch Action */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-text-muted">
                {selectedRole ? (
                  <span>
                    Ready to simulate: <strong className="text-text">{selectedRole.name}</strong> ({durationMinutes} mins)
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
                className="w-full sm:w-auto"
              >
                {isLaunching ? 'Preparing Interview Room...' : 'Enter Live Interview Room →'}
              </Button>
            </div>
          </div>

          {/* Right Col: Audio & Voice Info Card */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold text-sm text-text">
                  Voice-Enabled Technical Room
                </h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Our interview room uses your browser&apos;s native Web Speech API. You can
                respond either by <strong>speaking into your microphone</strong> or by
                <strong> typing formatted technical answers</strong>.
              </p>
              <ul className="space-y-2 text-xs text-text">
                <li className="flex items-start gap-2">
                  <span className="text-primary-700 font-bold">1.</span>
                  <span><strong>Introduction:</strong> Background &amp; operational experience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-700 font-bold">2.</span>
                  <span><strong>Technical Drill:</strong> Core conceptual mechanics and edge cases.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-700 font-bold">3.</span>
                  <span><strong>Scenario Architecture:</strong> Real-world triage and high-scale design.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-700 font-bold">4.</span>
                  <span><strong>Wrap-Up:</strong> Socratic guidance &amp; final candidate questions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Flagship Technical Interview Q&A Repository */}
        <section id="qa-repository" className="space-y-6 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
                  Comprehensive Q&amp;A Repository
                </span>
                <span className="text-xs font-semibold text-text-muted bg-surface px-2.5 py-0.5 rounded-full border border-border">
                  51+ Master Technical Questions
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
                Top Technical Interview Questions &amp; Answers
              </h2>
              <p className="text-sm text-text-muted max-w-3xl leading-relaxed">
                Study first-principles technical solutions with algorithmic complexity proofs, architectural trade-offs, interviewer counter-questions, and direct links to curriculum concept guides.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 text-xs bg-surface border border-border p-3 rounded-xl shadow-xs">
              <div>
                <span className="block font-bold text-text text-sm">51</span>
                <span className="text-text-muted">Master Questions</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <span className="block font-bold text-text text-sm">8</span>
                <span className="text-text-muted">Disciplines</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <span className="block font-bold text-text text-sm">100%</span>
                <span className="text-text-muted">Follow-ups &amp; Pitfalls</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-4 bg-surface border border-border rounded-2xl p-5 shadow-xs">
            <div className="relative">
              <input
                type="text"
                value={qaSearch}
                onChange={(e) => setQaSearch(e.target.value)}
                placeholder="Search interview questions by keyword, algorithm, design pattern, or trap..."
                className="w-full pl-10 pr-10 py-3 bg-canvas border border-border rounded-xl text-sm text-text placeholder:text-text-muted focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
              <span className="absolute left-3.5 top-3.5 text-text-muted text-sm">🔍</span>
              {qaSearch && (
                <button
                  type="button"
                  onClick={() => setQaSearch('')}
                  className="absolute right-3.5 top-3 text-xs font-semibold text-text-muted hover:text-text bg-surface border border-border px-2 py-0.5 rounded cursor-pointer"
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
                    className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary-700 text-white shadow-xs'
                        : 'bg-canvas text-text-muted hover:text-text border border-border hover:border-primary-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-text-muted flex items-center justify-between pt-1">
              <span>Showing <strong>{filteredQuestions.length}</strong> questions matching criteria</span>
              {qaCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setQaCategory('all')}
                  className="text-primary-700 hover:underline cursor-pointer font-medium"
                >
                  Reset Category
                </button>
              )}
            </div>
          </div>

          {/* Questions Accordion List */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center bg-surface border border-border rounded-2xl space-y-2">
                <p className="text-sm font-semibold text-text">No technical interview questions match your search.</p>
                <p className="text-xs text-text-muted">Try clearing the search input or selecting another engineering discipline.</p>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isExpanded = expandedQaId === q.id;
                return (
                  <div
                    key={q.id}
                    className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs transition-all hover:border-primary-200"
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
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary-50 text-primary-800 border border-primary-200">
                            {q.category}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                              q.difficulty === 'EASY'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : q.difficulty === 'MEDIUM'
                                ? 'bg-sky-50 text-sky-800 border-sky-200'
                                : q.difficulty === 'HARD'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-purple-50 text-purple-800 border-purple-200'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                              q.frequency === 'VERY HIGH'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : q.frequency === 'HIGH'
                                ? 'bg-orange-50 text-orange-800 border-orange-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            Frequency: {q.frequency}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-text hover:text-primary-700 transition-colors">
                          {q.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                          {q.shortSummary}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0">
                        <span className="text-xs font-bold text-primary-700">
                          {isExpanded ? 'Hide Solution ▲' : 'View Solution ▼'}
                        </span>
                      </div>
                    </div>

                    {/* Expandable Model Answer & Deep Dive Details */}
                    {isExpanded && (
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 space-y-6 border-t border-border/60 pt-5 bg-canvas/40">
                        {/* Deep Model Answer */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                            Model Answer &amp; First-Principles Architecture
                          </h4>
                          <div className="p-4 bg-surface border border-border rounded-xl text-xs sm:text-sm text-text font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto">
                            {q.deepAnswer}
                          </div>
                        </div>

                        {/* Two Columns: Follow-ups & Pitfalls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Interviewer Counter-Questions */}
                          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                            <h5 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <span>🎯</span>
                              <span>Senior Interviewer Counter-Questions (Follow-ups)</span>
                            </h5>
                            <ul className="space-y-1.5 text-xs text-amber-950">
                              {q.interviewerCounterQuestions.map((cq, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="font-bold text-amber-800">•</span>
                                  <span>{cq}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Common Traps & Pitfalls */}
                          <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
                            <h5 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                              <span>⚠️</span>
                              <span>Common Candidate Traps &amp; Pitfalls</span>
                            </h5>
                            <ul className="space-y-1.5 text-xs text-rose-950">
                              {q.pitfalls.map((pf, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="font-bold text-rose-800">•</span>
                                  <span>{pf}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Key Takeaways */}
                        <div className="p-4 bg-primary-50/50 border border-primary-200 rounded-xl space-y-2">
                          <h5 className="text-xs font-bold text-primary-900 flex items-center gap-1.5">
                            <span>💡</span>
                            <span>Core Architectural Takeaways</span>
                          </h5>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-primary-950">
                            {q.keyTakeaways.map((tk, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="font-bold text-primary-700">✓</span>
                                <span>{tk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action Footer */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          {q.relatedCurriculumSlug ? (
                            <Link
                              href={`/curriculum/${q.relatedCurriculumSlug}`}
                              className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1 hover:underline"
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
                            className="text-xs font-semibold text-text-muted hover:text-text bg-surface border border-border px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
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
          <section className="space-y-4 pt-6 border-t border-border">
            <div>
              <h2 className="text-xl font-bold text-text">
                Previous Technical Interviews
              </h2>
              <p className="text-xs text-text-muted">
                Review past conversational dialogues, transcripts, and evaluation scorecards.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-canvas border-b border-border text-xs uppercase tracking-wider text-text-muted font-semibold">
                    <tr>
                      <th className="px-5 py-3.5">Role Track</th>
                      <th className="px-5 py-3.5 text-center">Date</th>
                      <th className="px-5 py-3.5 text-center">Target Duration</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-center">Overall Score</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history.items.map((item) => (
                      <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-text">
                          {item.roleTrack.name}
                        </td>
                        <td className="px-5 py-4 text-center text-xs text-text-muted">
                          {new Date(item.startedAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-center text-xs text-text">
                          {item.targetDurationMinutes} mins
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              item.status === 'COMPLETED'
                                ? 'bg-success-50 text-success-800 border-success-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center font-bold tabular-nums">
                          {item.overallScore !== null ? (
                            <span className="text-primary-700">{item.overallScore}%</span>
                          ) : (
                            <span className="text-text-muted">-</span>
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
                            <Button variant="secondary" size="sm">
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
      </main>
    </div>
  );
}
