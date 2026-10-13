'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getPracticeCatalog,
  type PracticeSubjectWithTopics,
} from '../../../../lib/practice-client';
import { getRoles, type RoleTrackItem } from '../../../../lib/roles-client';
import {
  createCustomMockTest,
  startMockTestSession,
} from '../../../../lib/mock-test-client';
import { useAuth } from '../../../../context/AuthContext';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Zap, ArrowLeft, ArrowRight } from 'lucide-react';

interface RolePreset {
  id: string;
  roleName: string;
  title: string;
  description: string;
  topicKeyword: string;
  questionCount: number;
  durationMinutes: number;
  difficulty: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
}

const PRESETS: RolePreset[] = [
  {
    id: 'preset-devops',
    roleName: 'Cloud & DevOps Engineer',
    title: 'Cloud & DevOps Screening Simulation',
    description: 'Cloud Infrastructure, Docker containers, Kubernetes and Linux Systems.',
    topicKeyword: 'cloud',
    questionCount: 20,
    durationMinutes: 30,
    difficulty: 'ALL',
  },
  {
    id: 'preset-solutions-architect',
    roleName: 'Cloud Solutions Architect',
    title: 'Cloud Solutions Architecture Assessment',
    description: 'VPC subnets, IAM security, object storage tiers, virtual machine auto-scaling, and resilience.',
    topicKeyword: 'cloud',
    questionCount: 20,
    durationMinutes: 35,
    difficulty: 'ALL',
  },
  {
    id: 'preset-cloud-infra',
    roleName: 'Cloud Infrastructure Specialist',
    title: 'Cloud Infrastructure & Workload Simulation',
    description: 'Cloud VNets, network security groups, identity access management, and hybrid systems.',
    topicKeyword: 'infra',
    questionCount: 20,
    durationMinutes: 35,
    difficulty: 'ALL',
  },
  {
    id: 'preset-python',
    roleName: 'Python Developer',
    title: 'Python Developer Technical Drill',
    description: 'Python syntax, OOP, automation, and algorithmic problem solving.',
    topicKeyword: 'python',
    questionCount: 15,
    durationMinutes: 25,
    difficulty: 'ALL',
  },
  {
    id: 'preset-java',
    roleName: 'Core Java Developer',
    title: 'Core Java & Concurrency Benchmark',
    description: 'JVM internals, collections framework, multithreading, and OOP design.',
    topicKeyword: 'java',
    questionCount: 20,
    durationMinutes: 30,
    difficulty: 'ALL',
  },
  {
    id: 'preset-fullstack',
    roleName: 'Full Stack JavaScript Engineer',
    title: 'Full Stack JavaScript & Web API Architecture',
    description: 'Node.js event loop, TypeScript, REST endpoints, and async design.',
    topicKeyword: 'javascript',
    questionCount: 20,
    durationMinutes: 30,
    difficulty: 'ALL',
  },
  {
    id: 'preset-sql',
    roleName: 'Data Analyst & SQL Specialist',
    title: 'Enterprise SQL & Relational Analytics',
    description: 'Complex JOINs, window functions, indexing, and query optimization.',
    topicKeyword: 'sql',
    questionCount: 15,
    durationMinutes: 20,
    difficulty: 'ALL',
  },
  {
    id: 'preset-crm',
    roleName: 'CRM Technical Specialist',
    title: 'CRM Technical Logic & Integration Workflows',
    description: 'Data model validation, process automation, and integration patterns.',
    topicKeyword: 'crm',
    questionCount: 15,
    durationMinutes: 25,
    difficulty: 'ALL',
  },
  {
    id: 'preset-data-eng',
    roleName: 'Data Engineer & ETL Architect',
    title: 'Data Engineering & Scalable ETL Simulation',
    description: 'Distributed PySpark transformations, Lakehouse ACID storage, and streaming pipelines.',
    topicKeyword: 'etl',
    questionCount: 20,
    durationMinutes: 30,
    difficulty: 'ALL',
  },
  {
    id: 'preset-ml-ai',
    roleName: 'Machine Learning & AI Systems Engineer',
    title: 'Machine Learning & AI Systems Benchmark',
    description: 'Vector embeddings, low-latency feature stores, model drift detection, and quantization.',
    topicKeyword: 'machine learning',
    questionCount: 20,
    durationMinutes: 30,
    difficulty: 'ALL',
  },
  {
    id: 'preset-cyber-sec',
    roleName: 'Cybersecurity & Infrastructure Defense Specialist',
    title: 'Cloud Defense & Threat Modeling Assessment',
    description: 'Zero-trust architecture, cloud IAM least privilege, threat modeling, and incident response.',
    topicKeyword: 'security',
    questionCount: 20,
    durationMinutes: 30,
    difficulty: 'ALL',
  },
  {
    id: 'preset-qa-sdet',
    roleName: 'QA Automation & SDET Engineer',
    title: 'QA Automation & Quality Engineering Screening',
    description: 'Playwright test automation, test pyramids, contract testing, and CI quality gates.',
    topicKeyword: 'qa',
    questionCount: 20,
    durationMinutes: 30,
    difficulty: 'ALL',
  },
];

export default function CustomMockTestPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [catalog, setCatalog] = useState<PracticeSubjectWithTopics[]>([]);
  const [roles, setRoles] = useState<RoleTrackItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Form state
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [difficulty, setDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getPracticeCatalog().catch(() => []),
      getRoles().catch(() => []),
    ])
      .then(([catalogData, rolesData]) => {
        setCatalog(catalogData);
        setRoles(rolesData);
        // Default select all topics from first subject if available
        if (catalogData.length > 0 && catalogData[0].topics.length > 0) {
          const initialTopics = new Set(catalogData[0].topics.map((t) => t.id));
          setSelectedTopicIds(initialTopics);
        }
      })
      .finally(() => setIsLoadingCatalog(false));
  }, []);

  const allTopics = useMemo(() => {
    return catalog.flatMap((subject) =>
      subject.topics.map((t) => ({ ...t, subjectName: subject.name })),
    );
  }, [catalog]);

  const handleApplyPreset = (preset: RolePreset) => {
    setCustomTitle(preset.title);
    setQuestionCount(preset.questionCount);
    setDurationMinutes(preset.durationMinutes);
    setDifficulty(preset.difficulty);

    // Find matching role
    const matchedRole = roles.find((r) =>
      r.name.toLowerCase().includes(preset.roleName.toLowerCase().split(' ')[0]),
    );
    if (matchedRole) {
      setSelectedRoleId(matchedRole.id);
    }

    // Match topics matching keyword
    const matchedTopicIds = allTopics
      .filter(
        (t) =>
          t.name.toLowerCase().includes(preset.topicKeyword) ||
          t.subjectName.toLowerCase().includes(preset.topicKeyword),
      )
      .map((t) => t.id);

    if (matchedTopicIds.length > 0) {
      setSelectedTopicIds(new Set(matchedTopicIds));
    }
  };

  const handleToggleTopic = (topicId: string) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const handleSelectAllTopics = () => {
    setSelectedTopicIds(new Set(allTopics.map((t) => t.id)));
  };

  const handleClearAllTopics = () => {
    setSelectedTopicIds(new Set());
  };

  const handleGenerateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    if (selectedTopicIds.size === 0) {
      setError('Please select at least one syllabus topic for your assessment.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const created = await createCustomMockTest({
        roleTrackId: selectedRoleId || undefined,
        title: customTitle.trim() || undefined,
        topicIds: Array.from(selectedTopicIds),
        questionCount,
        durationMinutes,
        difficulty,
        marksPerQuestion: 1,
        negativeMarking: 0.25,
      });

      // Start the test attempt immediately
      const session = await startMockTestSession(created.id);
      router.push(`/mock-tests/${created.id}?attemptId=${session.attempt.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate custom simulation');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-dvh bg-canvas py-10 px-4 sm:px-6 lg:px-8 text-text">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <Link
              href="/mock-tests"
              className="text-xs text-primary-700 font-semibold hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Timed Mock Tests</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-primary-900 mt-2">
              Custom Simulation Generator
            </h1>
            <p className="text-sm text-text-muted mt-1 max-w-2xl">
              Configure an on-demand timed assessment matching your target role and technical topics.
              Practice under strict exam timers with automated scoring and instant Socratic remediation.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-accent-50 text-accent-800 rounded-full border border-accent-200 self-start sm:self-center">
            Role-Based Engine
          </span>
        </div>

        {error && (
          <div className="p-4 bg-error-50 border border-error-500/30 text-error-700 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* 1-Click Role Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Role Presets (1-Click Setup)</span>
            </h2>
            <span className="text-xs text-text-muted">Click any preset to auto-configure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-3.5 bg-surface border border-border rounded-xl text-left hover:border-primary-600 hover:shadow-xs transition-all flex flex-col justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-primary-700 block">
                    {preset.roleName}
                  </span>
                  <p className="text-xs font-semibold text-text line-clamp-2">
                    {preset.title}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                  <span>{preset.durationMinutes}m</span>
                  <span>{preset.questionCount} Qs</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Configuration Form */}
        <form onSubmit={handleGenerateAssessment} className="space-y-8">
          <Card className="border border-border bg-surface p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-text border-b border-border pb-3">
              Simulation Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custom Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Assessment Title (Optional)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Cloud & DevOps Screening Simulation"
                  className="w-full px-3.5 py-2 text-sm border border-border rounded-lg bg-canvas focus:ring-2 focus:ring-primary-700"
                />
              </div>

              {/* Target Role Track */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Target Career Role Alignment
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-border rounded-lg bg-canvas"
                >
                  <option value="">-- General Technical Simulation --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Count and Duration Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-border">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Question Count: <strong className="text-text">{questionCount} Qs</strong>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[10, 15, 20, 30, 45].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                        questionCount === cnt
                          ? 'bg-primary-700 text-white border-primary-700'
                          : 'bg-canvas text-text-muted border-border hover:text-text'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Duration: <strong className="text-text">{durationMinutes} Minutes</strong>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[15, 20, 30, 45, 60].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setDurationMinutes(dur)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                        durationMinutes === dur
                          ? 'bg-primary-700 text-white border-primary-700'
                          : 'bg-canvas text-text-muted border-border hover:text-text'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                  Difficulty Level
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                        difficulty === diff
                          ? 'bg-primary-700 text-white border-primary-700'
                          : 'bg-canvas text-text-muted border-border hover:text-text'
                      }`}
                    >
                      {diff === 'ALL' ? 'Mixed' : diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Topic Selection Panel */}
          <Card className="border border-border bg-surface p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold text-text">Syllabus Topic Selection</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Select which technical topics to pull questions from ({selectedTopicIds.size} topics selected).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllTopics}
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllTopics}
                >
                  Clear
                </Button>
              </div>
            </div>

            {isLoadingCatalog ? (
              <div className="py-8 text-center text-text-muted text-xs">
                Loading syllabus topics...
              </div>
            ) : catalog.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-xs">
                No syllabus topics found in system.
              </div>
            ) : (
              <div className="space-y-6 pt-2">
                {catalog.map((subject) => (
                  <div key={subject.id} className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary-800">
                      {subject.name}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {subject.topics.map((topic) => {
                        const isChecked = selectedTopicIds.has(topic.id);
                        return (
                          <label
                            key={topic.id}
                            className={`p-3 rounded-lg border flex items-center gap-2.5 cursor-pointer text-xs transition-colors ${
                              isChecked
                                ? 'bg-primary-50/50 border-primary-600 font-semibold text-primary-950'
                                : 'bg-canvas border-border text-text-muted hover:border-border-subtle hover:text-text'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleTopic(topic.id)}
                              className="h-4 w-4 rounded border-border text-primary-700 focus:ring-primary-700"
                            />
                            <span className="truncate">{topic.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Submission Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-surface border border-border rounded-xl shadow-xs">
            <div className="text-xs text-text-muted space-y-0.5">
              <div>
                Assessment: <strong className="text-text">{questionCount} Questions</strong> ·{' '}
                <strong className="text-text">{durationMinutes} Minutes</strong> · Negative Marking:{' '}
                <strong className="text-text">+1 / -0.25</strong>
              </div>
              <p className="text-[11px] text-text-subtle">
                A server-authoritative timed attempt will be launched immediately.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isGenerating || selectedTopicIds.size === 0}
              className="px-6 py-2.5 font-bold shadow-xs text-sm group"
            >
              <span>{isGenerating ? 'Generating Simulation...' : 'Generate & Launch Assessment'}</span>
              {!isGenerating && <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
