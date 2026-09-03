'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import {
  getMockTestsCatalog,
  startMockTestSession,
  type MockTestItem,
} from '../../../lib/mock-test-client';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function MockTestsCatalogPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mockTests, setMockTests] = useState<MockTestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMockTestsCatalog()
      .then((items) => {
        setMockTests(items);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to load mock tests');
        setIsLoading(false);
      });
  }, []);

  const handleStartTest = async (testId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      setStartingId(testId);
      const data = await startMockTestSession(testId);
      router.push(`/mock-tests/${testId}?attemptId=${data.attempt.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not start test session');
      setStartingId(null);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
      {/* Navigation Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-30">
        <div className="max-w-content mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-primary-700 hover:opacity-90"
            >
              Students-preparation
            </Link>
            <nav className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <Link href="/practice" className="text-text-muted hover:text-text">
                Practice Mode
              </Link>
              <Link
                href="/mock-tests"
                className="text-primary-700 font-semibold border-b-2 border-primary-700 pb-1"
              >
                Timed Mock Tests
              </Link>
              <Link href="/interviews" className="text-text-muted hover:text-text">
                AI Interviews
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <span className="text-xs text-text-muted">
                Logged in as <strong className="text-text">{user.name}</strong>
              </span>
            ) : (
              <Link href="/login">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-content mx-auto px-6 py-10 w-full space-y-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-700">
            Real Exam Simulation
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-primary-900">
            Timed Mock Assessments
          </h1>
          <p className="text-base text-text-muted max-w-2xl">
            Simulate real role-based technical screening assessments under strict server countdown timers.
            Answer questions across multiple competency sections with negative marking evaluation.
          </p>
        </div>

        {/* Custom Simulation Generator Banner */}
        <Card className="bg-primary-900 text-white p-6 border-0 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-300">
                ⚡ Build Your Own Mock
              </span>
              <h2 className="text-xl font-bold text-white">Custom Simulation Generator</h2>
              <p className="text-sm text-primary-100">
                Configure an on-demand timed assessment for your target tech stack. Pick topics, duration, difficulty, and question counts to target specific interview requirements.
              </p>
            </div>
            <Link href="/mock-tests/custom" className="shrink-0">
              <Button variant="primary" className="bg-white text-primary-900 hover:bg-neutral-100 font-bold border-0">
                Launch Customizer &rarr;
              </Button>
            </Link>
          </div>
        </Card>

        {error && (
          <div className="p-4 bg-error-50 border border-error-500/30 text-error-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : mockTests.length === 0 ? (
          <Card className="p-12 text-center text-text-muted">
            No mock tests are currently available. Check back soon!
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockTests.map((test) => (
              <Card
                key={test.id}
                className="hover:border-primary-700/50 hover:shadow-md transition-all flex flex-col justify-between p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-1 rounded">
                      {test.durationMinutes} Minutes
                    </span>
                    {test.negativeMarking ? (
                      <span className="text-xs font-semibold text-error-600 bg-error-50 px-2 py-0.5 rounded">
                        -{test.negativeMarking} Neg Marking
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-text-muted bg-canvas px-2 py-0.5 rounded">
                        No Negative Marking
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-text">
                      {test.title}
                    </h2>
                    {test.description && (
                      <p className="text-sm text-text-muted leading-relaxed">
                        {test.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-text-muted border-t border-border pt-3">
                    <div>
                      <span className="font-semibold text-text">
                        {test.questionCount}
                      </span>{' '}
                      Questions
                    </div>
                    <div>
                      <span className="font-semibold text-text">
                        {test.marksPerQuestion}
                      </span>{' '}
                      Marks / Question
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    variant="primary"
                    className="w-full"
                    isLoading={startingId === test.id}
                    onClick={() => handleStartTest(test.id)}
                  >
                    Start Timed Test →
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
