import React from 'react';
import Link from 'next/link';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-canvas p-6 text-text">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-sm border-border">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-accent-700 bg-canvas px-3 py-1 rounded border border-border inline-block">
            404 — Not Found
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-primary-900">
            Page Does Not Exist
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            The page or assessment session you are trying to access cannot be found. It may have been moved, expired, or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              Go to Dashboard
            </Button>
          </Link>
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
