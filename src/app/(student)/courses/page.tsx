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
          <Link href="/" className="hover:text-primary-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-text font-medium">Courses</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-accent-700 bg-accent-50 px-2.5 py-1 rounded border border-accent-200 inline-block">
            Phase 3: Structured Learning Pathways
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-900">
            Technology Courses &amp; Learning Pathways
          </h1>
          <p className="text-base text-text-muted max-w-3xl leading-relaxed">
            Master engineering competencies step-by-step with structured, role-aligned courses.
            Each pathway groups syllabus topics into guided modules with interactive practice,
            applied drills, and milestone validation.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="space-y-4 bg-surface p-4 sm:p-6 rounded-lg border border-border">
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
              className="w-full px-4 py-2.5 rounded border border-border bg-canvas text-sm text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary-700"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border/60">
            {/* Role Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-text-muted mr-1">Role:</span>
              <button
                type="button"
                onClick={() => setSelectedRole('ALL')}
                className={`text-xs px-2.5 py-1 rounded transition-colors ${
                  selectedRole === 'ALL'
                    ? 'bg-primary-700 text-white font-medium'
                    : 'bg-canvas text-text-muted hover:text-text border border-border'
                }`}
              >
                All Roles
              </button>
              {availableRoles.map((r) => (
                <button
                  key={r.slug}
                  type="button"
                  onClick={() => setSelectedRole(r.slug)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    selectedRole === r.slug
                      ? 'bg-primary-700 text-white font-medium'
                      : 'bg-canvas text-text-muted hover:text-text border border-border'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-text-muted mr-1">Level:</span>
              {['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors ${
                    selectedLevel === lvl
                      ? 'bg-primary-700 text-white font-medium'
                      : 'bg-canvas text-text-muted hover:text-text border border-border'
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
