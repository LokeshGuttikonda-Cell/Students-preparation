'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  getCourse,
  enrollInCourse,
  getCourseProgress,
  type CourseTrackDetail,
  type CourseProgressResult,
} from '../../../../lib/courses-client';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent } from '../../../../components/ui/Card';

interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = use(params);
  const { user } = useAuth();

  const [course, setCourse] = useState<CourseTrackDetail | null>(null);
  const [progress, setProgress] = useState<CourseProgressResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const courseData = await getCourse(slug);
        setCourse(courseData);

        if (user && (courseData.isEnrolled || courseData.id)) {
          try {
            const prog = await getCourseProgress(courseData.id);
            setProgress(prog);
          } catch {
            // Student might not be enrolled yet
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load course curriculum. Please check your connection.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [slug, user]);

  const handleEnroll = async () => {
    if (!course) return;
    try {
      setEnrolling(true);
      setError(null);
      await enrollInCourse(course.id);
      setEnrollSuccess('You have successfully enrolled in this course!');
      // Reload progress
      const prog = await getCourseProgress(course.id);
      setProgress(prog);
      setCourse((prev) => (prev ? { ...prev, isEnrolled: true } : null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const formatLevel = (level: string) => {
    switch (level.toUpperCase()) {
      case 'BEGINNER':
        return 'Beginner';
      case 'INTERMEDIATE':
        return 'Intermediate';
      case 'ADVANCED':
        return 'Advanced';
      default:
        return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-canvas py-16 flex flex-col items-center justify-center space-y-3">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-700 border-t-transparent" />
        <p className="text-sm text-text-muted">Loading course curriculum...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-dvh bg-canvas py-16 px-4">
        <div className="max-w-md mx-auto p-6 bg-error-50 border border-error-200 rounded-lg text-center space-y-4">
          <p className="text-sm text-error-800 font-medium">{error}</p>
          <Link href="/courses">
            <Button variant="secondary" size="sm">
              &larr; Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!course) return null;

  const isEnrolled = course.isEnrolled || Boolean(progress?.isEnrolled);
  const progressPct = progress?.progressPercentage ?? 0;

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-content mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-primary-700 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/courses" className="hover:text-primary-700 transition-colors">
            Courses
          </Link>
          <span>/</span>
          <span className="text-text font-medium">{course.name}</span>
        </div>

        {/* Hero Header */}
        <div className="space-y-4 bg-surface p-6 sm:p-8 rounded-lg border border-border">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider bg-primary-50 text-primary-800 px-2.5 py-0.5 rounded border border-primary-200">
              {formatLevel(course.level)}
            </span>
            <span className="text-xs font-medium text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
              {course.modules.length} Modules
            </span>
            <span className="text-xs font-medium text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
              ~{course.estimatedHours} Hours Total
            </span>
            {course.roleTrack && (
              <Link
                href={`/roles/${course.roleTrack.slug}`}
                className="text-xs font-medium text-accent-700 hover:underline bg-accent-50 px-2 py-0.5 rounded border border-accent-200"
              >
                Track: {course.roleTrack.name}
              </Link>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-900">
            {course.name}
          </h1>

          {course.description && (
            <p className="text-base text-text-muted max-w-3xl leading-relaxed">
              {course.description}
            </p>
          )}

          {/* Enrollment / Progress Banner */}
          <div className="pt-4 border-t border-border/60">
            {!user ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-canvas-subtle rounded-md border border-border">
                <div>
                  <p className="text-sm font-semibold text-text">Track your course progress</p>
                  <p className="text-xs text-text-muted">
                    Sign in to save completed modules and track competency mastery.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Sign In to Enroll
                  </Button>
                </Link>
              </div>
            ) : !isEnrolled ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-canvas-subtle rounded-md border border-border">
                <div>
                  <p className="text-sm font-semibold text-text">Enroll in this pathway</p>
                  <p className="text-xs text-text-muted">
                    Start learning module by module and earn competency recognition.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-emerald-50/50 rounded-md border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Enrolled Student
                    </span>
                  </div>
                  <span className="text-sm font-bold text-emerald-900">
                    {progressPct}% Completed ({progress?.completedModules ?? 0}/{course.modules.length} Modules)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-emerald-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {progressPct === 100 && (
                  <p className="text-xs font-semibold text-emerald-800">
                    🎉 Outstanding! You have completed all modules in this course pathway.
                  </p>
                )}
              </div>
            )}

            {enrollSuccess && (
              <p className="text-xs text-emerald-700 font-medium mt-2">{enrollSuccess}</p>
            )}
            {error && (
              <p className="text-xs text-error-700 font-medium mt-2">{error}</p>
            )}
          </div>
        </div>

        {/* Syllabus Modules List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary-900 tracking-tight">
              Course Modules &amp; Learning Roadmap
            </h2>
            <span className="text-xs text-text-muted">
              {course.modules.length} Sequential Modules
            </span>
          </div>

          <div className="space-y-4">
            {course.modules.map((mod, idx) => {
              const moduleProg = progress?.moduleProgress.find((p) => p.moduleId === mod.id);
              const isCompleted = moduleProg?.isCompleted ?? false;

              return (
                <Card
                  key={mod.id}
                  className={`border transition-all ${
                    isCompleted
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-border bg-surface'
                  }`}
                >
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-surface-muted text-text-muted border border-border">
                          Module {idx + 1}
                        </span>
                        <span className="text-xs text-text-muted">
                          ~{mod.estimatedMinutes} mins
                        </span>
                        {isCompleted && (
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <span>✓ Completed</span>
                            {moduleProg?.accuracyPercentage !== null && (
                              <span className="text-emerald-700 font-medium">
                                ({moduleProg?.accuracyPercentage}%)
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-text">{mod.title}</h3>

                      {mod.description && (
                        <p className="text-xs text-text-muted">{mod.description}</p>
                      )}

                      {mod.topicName && (
                        <div className="flex items-center gap-2 text-xs text-text-subtle pt-1">
                          <span>Syllabus Topic:</span>
                          <span className="font-semibold text-primary-800 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                            {mod.topicName}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {mod.topicId ? (
                        <Link href={`/practice/${mod.topicId}`}>
                          <Button
                            variant={isCompleted ? 'secondary' : 'primary'}
                            size="sm"
                          >
                            {isCompleted ? 'Review Topic' : 'Start Practice &rarr;'}
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-xs text-text-subtle italic">
                          Conceptual Module
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <Link href="/courses" className="hover:text-primary-700 transition-colors">
            &larr; Back to all courses
          </Link>
          {course.roleTrack && (
            <Link
              href={`/roles/${course.roleTrack.slug}`}
              className="text-primary-700 font-medium hover:underline"
            >
              View {course.roleTrack.name} Role Blueprint &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
