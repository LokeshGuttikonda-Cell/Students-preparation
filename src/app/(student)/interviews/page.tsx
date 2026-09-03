'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getRoles, type RoleTrackItem } from '../../../lib/roles-client';
import {
  getUserInterviews,
  startInterviewSession,
  type PaginatedInterviews,
} from '../../../lib/interview-client';
import { Button } from '../../../components/ui/Button';

export default function InterviewsHubPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [roles, setRoles] = useState<RoleTrackItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [history, setHistory] = useState<PaginatedInterviews | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-xs">
        <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-primary-700 hover:opacity-90"
            >
              Students-preparation
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <Link href="/dashboard" className="text-text-muted hover:text-text">
                Dashboard
              </Link>
              <Link href="/practice" className="text-text-muted hover:text-text">
                Practice Mode
              </Link>
              <Link href="/mock-tests" className="text-text-muted hover:text-text">
                Mock Tests
              </Link>
              <Link
                href="/interviews"
                className="text-primary-700 font-semibold border-b-2 border-primary-700 pb-1"
              >
                AI Interviews
              </Link>
              <Link href="/credentials" className="text-text-muted hover:text-text">
                Credentials
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted">
              Student: <strong className="text-text">{user?.name || 'Candidate'}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-content mx-auto px-6 py-10 w-full space-y-10">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-950 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-300">
                Phase 5 Simulator
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
