import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import type { CourseTrackItem } from '../../lib/courses-client';

interface CourseCardProps {
  course: CourseTrackItem;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
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

  const getLevelBadgeClass = (level: string) => {
    switch (level.toUpperCase()) {
      case 'BEGINNER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'INTERMEDIATE':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'ADVANCED':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-primary-50 text-primary-800 border-primary-200';
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between hover:border-primary-700/50 hover:shadow-md transition-all">
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border inline-block ${getLevelBadgeClass(
                course.level,
              )}`}
            >
              {formatLevel(course.level)}
            </span>
            <span className="text-xs font-medium text-text-muted bg-surface-muted px-2 py-1 rounded border border-border shrink-0">
              {course.modulesCount} {course.modulesCount === 1 ? 'Module' : 'Modules'}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary-900 leading-snug">
              {course.name}
            </h3>
            {course.roleTrack && (
              <p className="text-xs font-medium text-text-muted mt-1">
                Role Track:{' '}
                <span className="text-primary-700 font-semibold">
                  {course.roleTrack.name}
                </span>
              </p>
            )}
          </div>

          {course.description && (
            <p className="text-sm text-text-muted line-clamp-3 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-border/60 mt-4">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Estimated Duration</span>
            <span className="font-semibold text-text">~{course.estimatedHours} Hours</span>
          </div>

          <Link href={`/courses/${course.slug}`} className="block">
            <Button variant="primary" size="sm" className="w-full">
              Explore Curriculum &rarr;
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
