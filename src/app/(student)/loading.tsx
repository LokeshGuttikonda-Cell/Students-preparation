import React from 'react';

export default function StudentSectionLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-surface-muted rounded animate-pulse" />
        <span className="text-text-muted">/</span>
        <div className="h-4 w-24 bg-surface-muted rounded animate-pulse" />
      </div>

      {/* Hero Header Skeleton */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-3">
        <div className="h-7 w-64 bg-surface-muted rounded animate-pulse" />
        <div className="h-4 w-96 max-w-full bg-surface-muted rounded animate-pulse" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((cardIdx) => (
          <div
            key={cardIdx}
            className="rounded-xl border border-border bg-surface p-6 space-y-4"
          >
            <div className="h-5 w-3/4 bg-surface-muted rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-surface-muted rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-surface-muted rounded animate-pulse" />
            </div>
            <div className="pt-2 flex items-center justify-between">
              <div className="h-6 w-20 bg-surface-muted rounded animate-pulse" />
              <div className="h-8 w-24 bg-surface-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading section content...</span>
    </div>
  );
}
