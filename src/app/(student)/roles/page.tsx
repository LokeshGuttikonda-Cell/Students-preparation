'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRoles, RoleTrackItem } from '../../../lib/roles-client';
import { RoleCard } from '../../../components/roles/RoleCard';
import { Button } from '../../../components/ui/Button';

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
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-content mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-primary-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-text font-medium">Career Roles</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-700 bg-accent-50 px-2.5 py-1 rounded border border-accent-200 inline-block">
            Role Competency Tracks
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-900">
            Career Roles &amp; Skill Tracks
          </h1>
          <p className="text-base text-text-muted max-w-3xl leading-relaxed">
            Prepare directly for the technical profile you are interviewing for.
            Each career track organizes syllabus topics by real-world recruiter weightage
            and evaluation cutoffs without corporate exam branding.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-border pb-6">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by role, skill, or topic (e.g. DevOps, Java, SQL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-md border border-border bg-surface text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700 min-h-[44px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-xs text-text-muted">
            Showing <strong className="text-text">{filteredRoles.length}</strong> of{' '}
            <strong className="text-text">{roles.length}</strong> Career Profiles
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div
            role="alert"
            className="p-6 rounded-md bg-error-50 border border-error-200 text-error-800 space-y-3"
          >
            <p className="font-semibold">{error}</p>
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
                className="h-64 rounded-lg bg-surface border border-border/60 animate-pulse p-6 space-y-4"
              >
                <div className="h-4 bg-canvas-subtle rounded w-1/3" />
                <div className="h-6 bg-canvas-subtle rounded w-3/4" />
                <div className="h-16 bg-canvas-subtle rounded w-full" />
                <div className="h-8 bg-canvas-subtle rounded w-full mt-4" />
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
          <div className="text-center py-12 px-4 rounded-lg border border-dashed border-border bg-surface-muted space-y-4">
            <h3 className="text-lg font-bold text-text">No matching career tracks found</h3>
            <p className="text-sm text-text-muted max-w-md mx-auto">
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
