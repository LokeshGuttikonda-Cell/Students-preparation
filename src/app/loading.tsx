import React from 'react';

export default function RootLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-dvh flex flex-col items-center justify-center bg-canvas p-6 text-text"
    >
      <div className="flex flex-col items-center space-y-4 max-w-sm w-full text-center">
        {/* Animated Brand Ring Spinner */}
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-700 animate-spin" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary-900">
            Loading preparation module...
          </p>
          <p className="text-xs text-text-muted">
            Initializing deterministic evaluation engine
          </p>
        </div>

        {/* Pulse Skeleton Placeholder Cards */}
        <div className="w-full space-y-2.5 pt-4">
          <div className="h-4 bg-surface-muted rounded animate-pulse w-3/4 mx-auto" />
          <div className="h-3 bg-surface-muted rounded animate-pulse w-1/2 mx-auto" />
        </div>
      </div>
      <span className="sr-only">Loading application content...</span>
    </div>
  );
}
