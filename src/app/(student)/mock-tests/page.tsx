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
import { Button } from '../../../components/ui/Button';
import {
  Sparkles,
  ArrowRight,
  Clock,
  AlertCircle,
  Search,
  X,
  Sliders,
} from 'lucide-react';

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
        <div className="space-y-2 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20 inline-block">
              17 TIMED MOCK ASSESSMENTS
            </span>
            <span className="text-xs font-mono text-slate-400">NEGATIVE MARKING • REALISTIC BENCHMARKS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white">
            Timed Mock Assessments
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-mono">
            Simulate real role-based technical screening assessments under strict server countdown timers.
            Answer questions across multiple competency sections with negative marking evaluation.
          </p>
        </div>

        {/* Custom Simulation Generator Banner */}
        <div className="bento-tile bg-gradient-to-r from-[#071324] via-[#0b1b33] to-[#040b17] border-lime-500/30 p-6 sm:p-7 relative overflow-hidden featured-glow">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-lime-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-lime-300 bg-lime-400/20 px-3 py-1 rounded-full border border-lime-400/30">
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                Build Your Own Mock
              </span>
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">Custom Simulation Generator</h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Configure an on-demand timed assessment for your target tech stack. Pick topics, duration, difficulty, and question counts to target specific interview requirements.
              </p>
            </div>
            <Link href="/mock-tests/custom" className="shrink-0">
              <Button variant="primary" size="lg" className="font-bold flex items-center gap-2 shadow-lg shadow-lime-400/25">
                <Sliders className="w-4 h-4 text-slate-950" />
                <span>Launch Customizer</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search assessments by role, title, or topic..."
                value={searchQuery}
                aria-label="Search assessments"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-lime-400 transition-all placeholder:text-slate-500 text-white font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 self-center sm:self-auto font-mono">
              Showing {filteredMockTests.length} of {mockTests.length} assessments
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2 pt-1 font-mono" role="tablist" aria-label="Assessment Categories">
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
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all border ${
                    isActive
                      ? 'bg-lime-400 text-slate-950 font-bold border-lime-400 shadow-md shadow-lime-400/20'
                      : 'bg-black/40 text-slate-300 border-white/10 hover:border-lime-400/40 hover:text-white'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/30 border border-rose-500/40 text-rose-300 rounded-2xl text-sm font-mono">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-lime-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMockTests.length === 0 ? (
          <div className="bento-tile p-12 text-center text-slate-400 space-y-4">
            <p className="text-base font-medium text-white">
              No mock assessments match your current filters.
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try modifying your search keywords or resetting your category filter to explore all available role assessments.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="font-mono text-xs"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMockTests.map((test) => (
              <div
                key={test.id}
                className="bento-tile hover:border-lime-400/40 hover:shadow-lg hover:shadow-lime-400/10 transition-all flex flex-col justify-between p-6 space-y-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-lime-300 bg-lime-400/20 px-2.5 py-1 rounded-full border border-lime-400/30">
                      <Clock className="w-3.5 h-3.5 text-lime-400" />
                      {test.durationMinutes} Minutes
                    </span>
                    {test.negativeMarking ? (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-rose-300 bg-rose-400/20 px-2.5 py-0.5 rounded-full border border-rose-400/30">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        -{test.negativeMarking} Neg Marking
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                        No Negative Marking
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl font-display font-extrabold text-white">
                      {test.title}
                    </h2>
                    {test.description && (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                        {test.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-400 border-t border-white/10 pt-3 font-mono">
                    <div>
                      <span className="font-bold text-white">
                        {test.questionCount}
                      </span>{' '}
                      Questions
                    </div>
                    <div>
                      <span className="font-bold text-white">
                        {test.marksPerQuestion}
                      </span>{' '}
                      Marks / Question
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="primary"
                    className="w-full font-bold shadow-md shadow-lime-400/20 flex items-center justify-center gap-2"
                    isLoading={startingId === test.id}
                    onClick={() => handleStartTest(test.id)}
                  >
                    <span>Start Timed Test</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
