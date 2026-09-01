'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring if configured
    console.error('Unhandled platform error:', error);
  }, [error]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-canvas p-6 text-text">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-sm border-border">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-error-700 bg-error-50 px-3 py-1 rounded border border-error-200 inline-block">
            System Alert
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-primary-900">
            Something went wrong
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            An unexpected error occurred while loading this view. Your saved responses and test progress remain safe on the server.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full sm:w-auto">
              Return Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
