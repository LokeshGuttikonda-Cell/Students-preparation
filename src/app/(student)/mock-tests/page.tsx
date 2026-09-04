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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CLOUD_DEVOPS' | 'BACKEND_SYSTEMS' | 'DATA_AI' | 'SECURITY_QA' | 'APTITUDE'>('ALL');

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

  const matchesCategory = (test: MockTestItem, cat: string) => {
    const text = `${test.title} ${test.description || ''}`.toLowerCase();
    switch (cat) {
      case 'CLOUD_DEVOPS':
        return text.includes('cloud') || text.includes('aws') || text.includes('azure') || text.includes('devops') || text.includes('docker') || text.includes('ci/cd');
      case 'BACKEND_SYSTEMS':
        return text.includes('backend') || text.includes('java') || text.includes('python') || text.includes('crm') || text.includes('systems');
      case 'DATA_AI':
        return text.includes('data') || text.includes('analyst') || text.includes('machine learning') || text.includes('ai') || text.includes('etl') || text.includes('sql');
      case 'SECURITY_QA':
        return text.includes('security') || text.includes('cyber') || text.includes('qa') || text.includes('sdet') || text.includes('automation');
      case 'APTITUDE':
        return text.includes('aptitude') || text.includes('general') || text.includes('fundamental');
      default:
        return true;
    }
  };

  const filteredMockTests = mockTests.filter((test) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = matchesCategory(test, selectedCategory);
    return matchesQuery && matchesCat;
  });

  const categories = [
    { id: 'ALL', label: 'All Assessments' },
    { id: 'BACKEND_SYSTEMS', label: 'Backend & Systems' },
    { id: 'CLOUD_DEVOPS', label: 'Cloud & DevOps' },
    { id: 'DATA_AI', label: 'Data & AI' },
    { id: 'SECURITY_QA', label: 'Security & QA' },
    { id: 'APTITUDE', label: 'General Aptitude' },
  ] as const;

  return (
    <div className="min-h-dvh flex flex-col bg-canvas text-text">
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

        {/* Search & Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search assessments by role, title, or topic..."
                value={searchQuery}
                aria-label="Search assessments"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all placeholder:text-text-muted"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted hover:text-text px-1.5 py-0.5 rounded"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-text-muted self-center sm:self-auto font-medium">
              Showing {filteredMockTests.length} of {mockTests.length} assessments
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2 pt-1" role="tablist" aria-label="Assessment Categories">
            {categories.map((cat) => {
              const count = mockTests.filter((t) => matchesCategory(t, cat.id)).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${
                    isActive
                      ? 'bg-primary-900 text-white border-primary-900 shadow-xs'
                      : 'bg-surface text-text-muted border-border hover:border-primary-600/40 hover:text-text'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error-50 border border-error-500/30 text-error-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-primary-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMockTests.length === 0 ? (
          <Card className="p-12 text-center text-text-muted space-y-4">
            <p className="text-base font-medium text-text">
              No mock assessments match your current filters.
            </p>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              Try modifying your search keywords or resetting your category filter to explore all available role assessments.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
            >
              Reset Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMockTests.map((test) => (
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
