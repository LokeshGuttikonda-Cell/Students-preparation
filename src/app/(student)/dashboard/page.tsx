'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import {
  getUserAttempts,
  getWeakAreaAnalytics,
  getRoleReadiness,
  setTargetRole,
  type PaginatedAttempts,
  type WeakAreaAnalyticsData,
  type RoleReadinessData,
} from '../../../lib/analytics-client';
import { getRoles, type RoleTrackItem } from '../../../lib/roles-client';
import { RoleReadinessWidget } from '../../../components/analytics/RoleReadinessWidget';
import { CompetencyGapAnalyzer } from '../../../components/analytics/CompetencyGapAnalyzer';
import { WeakAreaCard } from '../../../components/analytics/WeakAreaCard';
import { AttemptHistoryTable } from '../../../components/analytics/AttemptHistoryTable';
import { StreakWidget } from '../../../components/dashboard/StreakWidget';
import { BadgeShowcase } from '../../../components/dashboard/BadgeShowcase';
import {
  fetchUserStreak,
  fetchUserBadges,
  type StreakData,
  type BadgeItem,
} from '../../../lib/gamification-client';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, refresh: refreshUser } = useAuth();

  const [analytics, setAnalytics] = useState<WeakAreaAnalyticsData | null>(null);
  const [history, setHistory] = useState<PaginatedAttempts | null>(null);
  const [readiness, setReadiness] = useState<RoleReadinessData | null>(null);
  const [rolesList, setRolesList] = useState<RoleTrackItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isSavingTarget, setIsSavingTarget] = useState(false);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [badges, setBadges] = useState<BadgeItem[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'ALL' | 'PRACTICE' | 'MOCK_TEST'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (page: number, type: 'ALL' | 'PRACTICE' | 'MOCK_TEST', roleIdParam?: string) => {
    try {
      setIsLoading(true);
      const attemptTypeParam = type === 'ALL' ? undefined : type;
      const [analyticsData, historyData, rolesData, readinessData, streakData, badgesData] = await Promise.all([
        getWeakAreaAnalytics(),
        getUserAttempts(page, 10, attemptTypeParam),
        getRoles().catch(() => []),
        getRoleReadiness(roleIdParam || undefined).catch(() => null),
        fetchUserStreak().catch(() => null),
        fetchUserBadges().catch(() => []),
      ]);
      setAnalytics(analyticsData);
      setHistory(historyData);
      setRolesList(rolesData);
      setStreak(streakData);
      setBadges(badgesData);
      if (readinessData) {
        setReadiness(readinessData);
        setSelectedRoleId(readinessData.role.id);
      }
      setIsLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      setIsLoading(false);
    }
  }, []);

  const handleSelectRole = async (roleId: string) => {
    setSelectedRoleId(roleId);
    try {
      const res = await getRoleReadiness(roleId);
      setReadiness(res);
    } catch (err: unknown) {
      console.error('Failed to load readiness for role', err);
    }
  };

  const handleSaveAsTarget = async (roleId: string) => {
    try {
      setIsSavingTarget(true);
      await setTargetRole(roleId);
      await refreshUser();
      setIsSavingTarget(false);
    } catch (err: unknown) {
      setIsSavingTarget(false);
      setError(err instanceof Error ? err.message : 'Failed to update target role');
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadData(currentPage, filterType);
    }
  }, [user, isAuthLoading, currentPage, filterType, router, loadData]);

  if (isAuthLoading || (isLoading && !analytics && !history)) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-text-muted">Loading your performance dashboard...</p>
        </div>
      </div>
    );
  }

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
              <Link
                href="/dashboard"
                className="text-primary-700 font-semibold border-b-2 border-primary-700 pb-1"
              >
                Dashboard
              </Link>
              <Link href="/practice" className="text-text-muted hover:text-text">
                Practice Mode
              </Link>
              <Link href="/mock-tests" className="text-text-muted hover:text-text">
                Mock Tests
              </Link>
              <Link href="/interviews" className="text-text-muted hover:text-text">
                AI Interviews
              </Link>
              <Link href="/credentials" className="text-text-muted hover:text-text">
                Credentials
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-text-muted">
              Student: <strong className="text-text">{user?.name}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-content mx-auto px-6 py-10 w-full space-y-10">
        {/* Welcome & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-700">
              Personalized Learning Radar
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-primary-900">
              Performance Dashboard
            </h1>
            <p className="text-sm text-text-muted">
              Track your diagnostic accuracy trends, target weak areas, and review past test scorecards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/practice">
              <Button variant="secondary" size="sm">
                Topic Practice
              </Button>
            </Link>
            <Link href="/mock-tests">
              <Button variant="primary" size="sm">
                Take Mock Test →
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error-50 border border-error-500/30 text-error-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Daily Study Streak Tracker (Phase 3) */}
        <StreakWidget streak={streak} loading={isLoading} />

        {/* Role Readiness Accelerator Section */}
        {readiness && (
          <section className="space-y-6">
            <RoleReadinessWidget
              data={readiness}
              rolesList={rolesList}
              selectedRoleId={selectedRoleId || readiness.role.id}
              userTargetRoleId={user?.targetRoleId}
              onSelectRole={handleSelectRole}
              onSaveAsTarget={handleSaveAsTarget}
              isSavingTarget={isSavingTarget}
            />
            <CompetencyGapAnalyzer
              competencies={readiness.competencies}
              roleName={readiness.role.name}
            />
          </section>
        )}

        {/* Top KPI Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="p-6 space-y-2 border-border shadow-xs">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Tests Completed
              </span>
              <div className="text-3xl sm:text-4xl font-bold text-primary-900 tabular">
                {analytics.kpis.totalTestsCompleted}
              </div>
              <p className="text-xs text-text-muted">
                Completed practice &amp; timed mock assessment sittings
              </p>
            </Card>

            <Card className="p-6 space-y-2 border-border shadow-xs">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Questions Answered
              </span>
              <div className="text-3xl sm:text-4xl font-bold text-text tabular">
                {analytics.kpis.totalQuestionsAnswered}
              </div>
              <p className="text-xs text-text-muted">
                Cumulative questions evaluated across all sessions
              </p>
            </Card>

            <Card className="p-6 space-y-2 border-border shadow-xs">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Overall Accuracy
              </span>
              <div className="text-3xl sm:text-4xl font-bold text-success-700 tabular">
                {analytics.kpis.overallAccuracy}%
              </div>
              <p className="text-xs text-text-muted">
                Weighted aggregate correctness across all topics
              </p>
            </Card>
          </div>
        )}

        {/* Section 1: Weak-Area Diagnostic Radar */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-text">
                Weak-Area Diagnosis &amp; Revision Queue
              </h2>
              <p className="text-xs text-text-muted">
                Topics with accuracy under 60% require focused practice before campus tests.
              </p>
            </div>
            <span className="text-xs text-text-muted">
              {analytics?.weakAreas.filter((w) => w.needsRevision).length || 0} topics flagged
            </span>
          </div>

          {!analytics || analytics.weakAreas.length === 0 ? (
            <Card className="p-8 text-center text-text-muted">
              <p className="text-sm font-medium">No diagnostic history available yet.</p>
              <p className="text-xs text-text-muted mt-1">
                Complete a few practice modules or a timed test to generate your topic-wise accuracy radar.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {analytics.weakAreas.map((area) => (
                <WeakAreaCard key={area.topicId} item={area} />
              ))}
            </div>
          )}
        </section>

        {/* Section: Placement Readiness Badges Showcase (Phase 3) */}
        <section>
          <BadgeShowcase badges={badges} loading={isLoading} />
        </section>

        {/* Section 2: Assessment History Table */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold text-text">
                Assessment History
              </h2>
              <p className="text-xs text-text-muted">
                Chronological record of all practice sessions and timed mock tests.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => {
                  setFilterType('ALL');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-primary-700 text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterType('MOCK_TEST');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filterType === 'MOCK_TEST'
                    ? 'bg-primary-700 text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Mock Tests
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterType('PRACTICE');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filterType === 'PRACTICE'
                    ? 'bg-primary-700 text-white'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Practice
              </button>
            </div>
          </div>

          <AttemptHistoryTable
            items={history?.items || []}
            currentPage={currentPage}
            totalPages={history?.totalPages || 1}
            onPageChange={(p) => setCurrentPage(p)}
            isLoading={isLoading}
          />
        </section>
      </main>
    </div>
  );
}
