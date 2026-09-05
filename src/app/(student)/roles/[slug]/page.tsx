'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { getRole, RoleTrackDetail } from '../../../../lib/roles-client';
import { RoleCompetencyList } from '../../../../components/roles/RoleCompetencyList';
import { RoleInterviewTrapsSection } from '../../../../components/roles/RoleInterviewTrapsSection';
import { getArticlesForRole, type CurriculumArticleSummary } from '../../../../lib/curriculum-client';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export default function RoleDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [role, setRole] = useState<RoleTrackDetail | null>(null);
  const [roleArticles, setRoleArticles] = useState<CurriculumArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function loadRole() {
      try {
        setLoading(true);
        setError(null);
        const [data, articles] = await Promise.all([
          getRole(slug),
          getArticlesForRole(slug),
        ]);
        setRole(data);
        setRoleArticles(articles);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to load career role "${slug}". Please check your network.`,
        );
      } finally {
        setLoading(false);
      }
    }
    loadRole();
  }, [slug]);

  const formatLevel = (level: string) => {
    switch (level) {
      case 'ENTRY_LEVEL':
        return 'Entry Level / Campus Screening';
      case 'MID_LEVEL':
        return 'Mid Level (1-3 Yrs)';
      case 'SPECIALIST':
        return 'Specialist Track';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-content mx-auto space-y-8 animate-pulse">
          <div className="h-4 bg-canvas-subtle rounded w-32" />
          <div className="h-10 bg-canvas-subtle rounded w-2/3" />
          <div className="h-24 bg-surface rounded-lg border border-border" />
          <div className="h-64 bg-surface rounded-lg border border-border" />
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="min-h-dvh bg-canvas py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto p-6 rounded-lg bg-error-50 border border-error-200 text-error-800 space-y-4">
          <h2 className="text-lg font-bold">Unable to Load Career Track</h2>
          <p className="text-sm">{error ?? 'Role profile not found.'}</p>
          <div className="flex gap-3 pt-2">
            <Link href="/roles">
              <Button variant="secondary" size="sm">
                &larr; Back to Career Roles
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-content mx-auto space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-primary-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/roles" className="hover:text-primary-700 transition-colors">
            Career Roles
          </Link>
          <span>/</span>
          <span className="text-text font-medium">{role.name}</span>
        </div>

        {/* Role Hero Card */}
        <Card className="border border-border bg-surface shadow-xs">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider bg-primary-50 text-primary-800 px-3 py-1 rounded border border-primary-200">
                {formatLevel(role.targetLevel)}
              </span>
              <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded border border-border">
                {role.competencies.length} Evaluated Topics
              </span>
              <span className="text-xs text-text-muted bg-surface-muted px-2.5 py-1 rounded border border-border">
                {role.mockTests.length}{' '}
                {role.mockTests.length === 1 ? 'Benchmark Mock' : 'Benchmark Mocks'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-900">
              {role.name}
            </h1>

            {role.description && (
              <p className="text-base text-text-muted max-w-3xl leading-relaxed">
                {role.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Section 1: Evaluated Syllabus Competencies */}
        <section aria-labelledby="competencies-heading" className="space-y-4">
          <RoleCompetencyList competencies={role.competencies} />
        </section>

        {/* Section 2: Recruiter Traps & Anti-Patterns */}
        <RoleInterviewTrapsSection roleSlug={role.slug} />

        {/* Section 3: Live Socratic AI Technical Interview */}
        <Card className="bg-primary-900 text-white p-6 sm:p-8 border-0 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-300">
                🎙️ Live Socratic Evaluation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                AI Technical Scenario Interview
              </h2>
              <p className="text-sm text-primary-100 leading-relaxed">
                Simulate a real technical screening interview for the {role.name} role.
                Answer scenario questions with live speech recognition, counter-probes, and automated rubric scoring.
              </p>
            </div>
            <Link href="/interviews" className="shrink-0">
              <Button variant="primary" className="bg-white text-primary-900 hover:bg-neutral-100 font-bold border-0 min-h-[44px]">
                Launch Interview Room &rarr;
              </Button>
            </Link>
          </div>
        </Card>

        {/* Section 4: Curated Knowledge Hub Guides */}
        {roleArticles.length > 0 && (
          <section aria-labelledby="articles-heading" className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 id="articles-heading" className="text-xl font-bold text-primary-900">
                  Curated Technical Documentation
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  In-depth architectural articles, invariants, and implementation patterns mapped to this role.
                </p>
              </div>
              <Link href="/curriculum" className="text-xs font-semibold text-primary-700 hover:underline">
                View All Knowledge Hub &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleArticles.map((art) => (
                <Card key={art.id} className="p-5 hover:border-primary-600/50 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-text-muted">{art.domainName}</span>
                      <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                        {art.level} · {art.readTimeMinutes} min
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-text hover:text-primary-800 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                  <div className="pt-4">
                    <Link href={`/curriculum/${art.slug}` as Route} className="text-xs font-semibold text-primary-700 hover:underline inline-flex items-center gap-1">
                      Read Technical Guide &rarr;
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Section 5: Role Benchmark Mock Tests */}
        <section aria-labelledby="mock-tests-heading" className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 id="mock-tests-heading" className="text-xl font-bold text-primary-900">
                Role Benchmark Mock Tests
              </h2>
              <p className="text-xs text-text-muted mt-1">
                Full-length timed assessments evaluating all core competencies required for this role.
              </p>
            </div>
          </div>

          {role.mockTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {role.mockTests.map((test) => (
                <Card
                  key={test.id}
                  className="hover:border-accent-500/50 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-primary-900 leading-snug">
                        {test.title}
                      </h3>
                      <span className="text-xs font-semibold text-accent-800 bg-accent-50 px-2 py-0.5 rounded border border-accent-200 shrink-0">
                        {test.durationMinutes} Mins
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-muted pt-2 border-t border-border/50">
                      <span>
                        Marks per question: <strong className="text-text">{test.marksPerQuestion}</strong>
                      </span>
                      {test.negativeMarking ? (
                        <span>
                          Negative: <strong className="text-text">-{test.negativeMarking}</strong>
                        </span>
                      ) : (
                        <span className="text-success-700 font-medium">No negative marking</span>
                      )}
                    </div>
                  </CardContent>

                  <div className="p-6 pt-0">
                    <Link href={`/mock-tests/${test.id}`} className="block w-full">
                      <Button variant="accent" className="w-full min-h-[44px] touch-manipulation">
                        Start Role Mock Test &rarr;
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 rounded-lg border border-dashed border-border bg-surface-muted space-y-3">
              <p className="text-sm font-semibold text-text">
                No full-length mock tests assigned to this role yet
              </p>
              <p className="text-xs text-text-muted max-w-md mx-auto">
                You can still build 100% role readiness by practicing the individual syllabus competencies listed above!
              </p>
              <div className="pt-2">
                <Link href="/practice">
                  <Button variant="secondary" size="sm">
                    Go to Topic Practice &rarr;
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Section 6: Applied Code & SQL Sandbox Banner */}
        {(() => {
          const getRoleStudioTab = (roleSlug: string) => {
            switch (roleSlug) {
              case 'cloud-devops-engineer':
              case 'site-reliability-engineer':
              case 'devops-engineer':
                return { tab: 'distributed', name: 'Distributed Systems & Architecture Studio' };
              case 'cloud-solutions-architect':
              case 'system-design-architect':
              case 'enterprise-architect':
                return { tab: 'system-design', name: 'System Design Architecture Studio' };
              case 'operating-systems-engineer':
              case 'cybersecurity-specialist':
              case 'embedded-systems-engineer':
                return { tab: 'kernel', name: 'OS Kernel & Network Protocols Studio' };
              case 'java-backend-developer':
              case 'database-administrator':
              case 'data-engineer':
              case 'backend-systems-engineer':
                return { tab: 'sql', name: 'Relational SQL Query Lab' };
              case 'frontend-developer':
              case 'fullstack-engineer':
              case 'software-development-engineer':
              case 'algorithms-specialist':
                return { tab: 'visual', name: 'Visual Algorithm Stepper Studio' };
              default:
                return { tab: 'sql', name: 'Applied Engineering Laboratories' };
            }
          };

          const roleStudio = getRoleStudioTab(slug || '');

          return (
            <Card className="p-6 border border-border bg-surface shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                    ⚡ Applied Engineering
                  </span>
                  <h3 className="text-lg font-bold text-primary-900">
                    Interactive Code &amp; SQL Sandbox
                  </h3>
                  <p className="text-xs text-text-muted max-w-xl">
                    Practice algorithm implementations, multi-tenant SQL queries, and distributed architecture models in the {roleStudio.name}.
                  </p>
                </div>
                <Link href={`/sandbox?tab=${roleStudio.tab}`} className="shrink-0">
                  <Button variant="secondary" size="sm">
                    Open Sandbox &rarr;
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })()}
      </div>
    </div>
  );
}

