'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getRole, RoleTrackDetail } from '../../../../lib/roles-client';
import { RoleCompetencyList } from '../../../../components/roles/RoleCompetencyList';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';

export default function RoleDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [role, setRole] = useState<RoleTrackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    async function loadRole() {
      try {
        setLoading(true);
        setError(null);
        const data = await getRole(slug);
        setRole(data);
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

        {/* Section 2: Role Benchmark Mock Tests */}
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
      </div>
    </div>
  );
}
