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
        return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30';
      case 'INTERMEDIATE':
        return 'bg-amber-400/10 text-amber-300 border-amber-400/30';
      case 'ADVANCED':
        return 'bg-purple-400/10 text-purple-300 border-purple-400/30';
      default:
        return 'bg-lime-400/10 text-lime-300 border-lime-400/30';
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-400/10 transition-all border-white/10">
      <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <span
              className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block ${getLevelBadgeClass(
                course.level,
              )}`}
            >
              {formatLevel(course.level)}
            </span>
            <span className="text-xs font-mono font-semibold text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 shrink-0">
              {course.modulesCount} {course.modulesCount === 1 ? 'Module' : 'Modules'}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-display font-extrabold text-white leading-snug">
              {course.name}
            </h3>
            {course.roleTrack && (
              <p className="text-xs font-mono text-slate-400 mt-1">
                Role Track:{' '}
                <span className="text-cyan-400 font-semibold">
                  {course.roleTrack.name}
                </span>
              </p>
            )}
          </div>

          {course.description && (
            <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10 mt-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Estimated Duration</span>
            <span className="font-bold text-white">~{course.estimatedHours} Hours</span>
          </div>

          <Link href={`/courses/${course.slug}`} className="block">
            <Button variant="primary" size="sm" className="w-full font-bold shadow-md shadow-lime-400/20">
              Explore Curriculum &rarr;
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
