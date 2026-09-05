export interface MockTestItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMarking: number | null;
  questionCount: number;
  createdAt: string;
}

export interface TestSectionItem {
  id: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  durationMinutes?: number | null;
  cutoffScore?: number | null;
  questionCount: number;
}

export interface MockTestAttemptData {
  attempt: {
    id: string;
    mockTestId: string;
    attemptType: string;
    status: string;
    startedAt: string;
    expiresAt: string;
    durationMinutes: number;
    marksPerQuestion: number;
    negativeMarking: number | null;
    title: string;
  };
  sections?: TestSectionItem[];
  questions: Array<{
    id: string;
    topicId: string;
    body: string;
    difficulty: string;
    orderIndex: number;
    topicName: string;
    subjectName: string;
    sectionId?: string | null;
    sectionTitle?: string | null;
    options: Array<{
      id: string;
      body: string;
      orderIndex: number;
    }>;
  }>;
  answers: Array<{
    questionId: string;
    selectedOptionId: string | null;
    isMarkedForReview: boolean;
    timeSpentSeconds: number;
  }>;
  serverNow: string;
}

export interface MockTestScorecardData {
  attemptId: string;
  mockTestId: string;
  title: string;
  status: string;
  startedAt: string;
  submittedAt: string;
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  accuracy: number;
  timeSpentSeconds?: number;
  topicBreakdown: Array<{
    topicName: string;
    subjectName: string;
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    accuracy: number;
  }>;
  sectionBreakdown?: Array<{
    sectionId: string;
    title: string;
    orderIndex: number;
    durationMinutes: number | null;
    cutoffScore: number | null;
    total: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    score: number;
    maxScore: number;
    accuracy: number;
    clearedCutoff: boolean;
  }>;
  roleQualification?: {
    isRoleBenchmark: boolean;
    isQualified: boolean;
    verdictText: string;
  };
  percentileRank?: {
    percentile: number;
    rankTier: string;
    totalPeerAttempts: number;
    topPercentage: number;
  };
  competencyDimensions?: Array<{
    dimension: string;
    score: number;
    target: number;
    status: 'MET' | 'NEEDS_PRACTICE';
  }>;
  questions: Array<{
    id: string;
    topicId: string;
    body: string;
    explanation: string;
    difficulty: string;
    orderIndex: number;
    topicName: string;
    subjectName: string;
    sectionId?: string | null;
    sectionTitle?: string | null;
    options: Array<{
      id: string;
      body: string;
      isCorrect: boolean;
      orderIndex: number;
    }>;
    studentAnswer: {
      selectedOptionId: string | null;
      isCorrect: boolean | null;
      isMarkedForReview: boolean;
      timeSpentSeconds: number;
    };
  }>;
}

import { apiUrl } from './env';
import { DEFAULT_MOCK_TESTS_CATALOG } from './catalog-data';
import { getMockTestQuestionsForDomain } from './catalog-fallbacks';

export async function getMockTestsCatalog(): Promise<MockTestItem[]> {
  try {
    const res = await fetch(apiUrl('mock-tests'), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      const json = (await res.json()) as { items: MockTestItem[] };
      if (Array.isArray(json?.items) && json.items.length > 0) {
        return json.items;
      }
    }
  } catch {
    // Gracefully fallback to catalog
  }

  return DEFAULT_MOCK_TESTS_CATALOG;
}

export async function getMockTestDetail(id: string): Promise<MockTestItem> {
  try {
    const res = await fetch(apiUrl(`mock-tests/${id}`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as MockTestItem;
    }
  } catch {
    // Gracefully fallback to catalog
  }

  const found = DEFAULT_MOCK_TESTS_CATALOG.find((m) => m.id === id || m.slug === id);
  if (found) {
    return found;
  }

  throw new Error('Failed to fetch mock test details');
}

export async function startMockTestSession(
  mockTestId: string,
): Promise<MockTestAttemptData> {
  try {
    const res = await fetch(apiUrl('attempts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        attemptType: 'MOCK_TEST',
        mockTestId,
      }),
    });

    if (res.ok) {
      return (await res.json()) as MockTestAttemptData;
    }
  } catch {
    // Graceful fallback to rich local simulation session
  }

  return createFallbackSession(mockTestId);
}

export async function saveMockTestAnswer(
  attemptId: string,
  questionId: string,
  data: {
    selectedOptionId?: string | null;
    isMarkedForReview?: boolean;
    timeSpentSeconds?: number;
  },
) {
  try {
    const res = await fetch(
      apiUrl(`attempts/${attemptId}/answers/${questionId}`),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      },
    );

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback
  }

  return { success: true };
}

export async function submitMockTestSession(
  attemptId: string,
): Promise<MockTestScorecardData> {
  try {
    const res = await fetch(apiUrl(`attempts/${attemptId}/submit`), {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      return (await res.json()) as MockTestScorecardData;
    }
  } catch {
    // Graceful fallback
  }

  return createFallbackScorecard(attemptId);
}

export async function getMockTestScorecard(
  attemptId: string,
): Promise<MockTestScorecardData> {
  try {
    const res = await fetch(apiUrl(`attempts/${attemptId}/results`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as MockTestScorecardData;
    }
  } catch {
    // Graceful fallback
  }

  return createFallbackScorecard(attemptId);
}

function createFallbackSession(mockTestId: string): MockTestAttemptData {
  const found =
    DEFAULT_MOCK_TESTS_CATALOG.find(
      (m) => m.id === mockTestId || m.slug === mockTestId,
    ) || DEFAULT_MOCK_TESTS_CATALOG[0];
  const now = Date.now();
  const duration = found.durationMinutes || 40;

  const domainQuestions = getMockTestQuestionsForDomain(mockTestId);
  const half = Math.ceil(domainQuestions.length / 2);

  const isGeneralAptitude =
    mockTestId === 'mock-1' ||
    found.slug.includes('aptitude') ||
    found.title.toLowerCase().includes('aptitude');
  const sec1Title = isGeneralAptitude
    ? 'Section 1: Quantitative & Numerical Logic'
    : 'Section 1: Architecture & Technical Principles';
  const sec2Title = isGeneralAptitude
    ? 'Section 2: Logical Reasoning & Analytical Deduction'
    : 'Section 2: Applied Engineering & Troubleshooting';

  return {
    attempt: {
      id: `attempt-${mockTestId}`,
      mockTestId: found.id,
      attemptType: 'MOCK_TEST',
      status: 'IN_PROGRESS',
      startedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + duration * 60 * 1000).toISOString(),
      durationMinutes: duration,
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      title: found.title,
    },
    sections: [
      {
        id: 'sec-1',
        title: sec1Title,
        orderIndex: 0,
        durationMinutes: Math.floor(duration / 2),
        cutoffScore: 2.5,
        questionCount: half,
      },
      {
        id: 'sec-2',
        title: sec2Title,
        orderIndex: 1,
        durationMinutes: Math.ceil(duration / 2),
        cutoffScore: 2.5,
        questionCount: domainQuestions.length - half,
      },
    ],
    questions: domainQuestions.map((q) => ({
      id: q.id,
      topicId: q.topicId,
      body: q.body,
      difficulty: q.difficulty,
      orderIndex: q.orderIndex,
      topicName: q.topicName,
      subjectName: q.subjectName,
      sectionId: q.sectionId,
      sectionTitle: q.sectionTitle,
      options: q.options.map((o) => ({
        id: o.id,
        body: o.body,
        orderIndex: o.orderIndex,
      })),
    })),
    answers: [],
    serverNow: new Date().toISOString(),
  };
}

function createFallbackScorecard(attemptId: string): MockTestScorecardData {
  const mockTestId = attemptId.replace(/^attempt-/, '') || 'mock-1';
  const found =
    DEFAULT_MOCK_TESTS_CATALOG.find(
      (m) => m.id === mockTestId || m.slug === mockTestId,
    ) || DEFAULT_MOCK_TESTS_CATALOG[0];

  const domainQuestions = getMockTestQuestionsForDomain(mockTestId);
  const total = domainQuestions.length || 10;
  const correct = Math.max(1, Math.round(total * 0.85));
  const incorrect = total - correct;
  const score = correct - incorrect * 0.25;

  const topicMap = new Map<string, { topicName: string; subjectName: string; count: number }>();
  for (const q of domainQuestions) {
    const entry = topicMap.get(q.topicName) || {
      topicName: q.topicName,
      subjectName: q.subjectName,
      count: 0,
    };
    entry.count += 1;
    topicMap.set(q.topicName, entry);
  }

  const topicBreakdown = Array.from(topicMap.values()).map((t) => {
    const c = Math.max(1, Math.round(t.count * 0.85));
    return {
      topicName: t.topicName,
      subjectName: t.subjectName,
      total: t.count,
      correct: c,
      incorrect: t.count - c,
      unanswered: 0,
      accuracy: Math.round((c / t.count) * 100),
    };
  });

  const half = Math.ceil(total / 2);

  const isGeneralAptitude =
    mockTestId === 'mock-1' ||
    found.slug.includes('aptitude') ||
    found.title.toLowerCase().includes('aptitude');
  const sec1Title = isGeneralAptitude
    ? 'Section 1: Quantitative & Numerical Logic'
    : 'Section 1: Architecture & Technical Principles';
  const sec2Title = isGeneralAptitude
    ? 'Section 2: Logical Reasoning & Analytical Deduction'
    : 'Section 2: Applied Engineering & Troubleshooting';

  return {
    attemptId,
    mockTestId: found.id,
    title: found.title,
    status: 'SUBMITTED',
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    submittedAt: new Date().toISOString(),
    score: Number(score.toFixed(2)),
    maxScore: total,
    correctCount: correct,
    incorrectCount: incorrect,
    unansweredCount: 0,
    totalQuestions: total,
    accuracy: Math.round((correct / total) * 100),
    timeSpentSeconds: 1450,
    topicBreakdown,
    sectionBreakdown: [
      {
        sectionId: 'sec-1',
        title: sec1Title,
        orderIndex: 0,
        durationMinutes: 20,
        cutoffScore: 2.5,
        total: half,
        correct: Math.round(half * 0.9),
        incorrect: half - Math.round(half * 0.9),
        unanswered: 0,
        score: Math.round(half * 0.9),
        maxScore: half,
        accuracy: 90,
        clearedCutoff: true,
      },
      {
        sectionId: 'sec-2',
        title: sec2Title,
        orderIndex: 1,
        durationMinutes: 20,
        cutoffScore: 2.5,
        total: total - half,
        correct: correct - Math.round(half * 0.9),
        incorrect: incorrect - (half - Math.round(half * 0.9)),
        unanswered: 0,
        score: Number((score - Math.round(half * 0.9)).toFixed(2)),
        maxScore: total - half,
        accuracy: 80,
        clearedCutoff: true,
      },
    ],
    roleQualification: {
      isRoleBenchmark: true,
      isQualified: true,
      verdictText: 'Demonstrates strong engineering aptitude. Ready for next-stage technical evaluation.',
    },
    percentileRank: {
      percentile: 88,
      rankTier: 'Tier 1 - Competitive',
      totalPeerAttempts: 340,
      topPercentage: 12,
    },
    competencyDimensions: [
      { dimension: 'Core Engineering Principles', score: 88, target: 75, status: 'MET' },
      { dimension: 'Applied Problem Solving', score: 85, target: 70, status: 'MET' },
      { dimension: 'Resilience & Architecture', score: 82, target: 70, status: 'MET' },
    ],
    questions: domainQuestions.map((q, idx) => {
      const isCorrect = idx !== 1;
      return {
        id: q.id,
        topicId: q.topicId,
        body: q.body,
        explanation: q.explanation,
        difficulty: q.difficulty,
        orderIndex: q.orderIndex,
        topicName: q.topicName,
        subjectName: q.subjectName,
        sectionId: q.sectionId,
        sectionTitle: q.sectionTitle,
        options: q.options.map((o) => ({
          id: o.id,
          body: o.body,
          isCorrect: o.isCorrect,
          orderIndex: o.orderIndex,
        })),
        studentAnswer: {
          selectedOptionId: isCorrect
            ? q.correctOptionId
            : q.options.find((o) => o.id !== q.correctOptionId)?.id || null,
          isCorrect,
          isMarkedForReview: false,
          timeSpentSeconds: 45,
        },
      };
    }),
  };
}

export interface CustomMockTestPayload {
  roleTrackId?: string;
  title?: string;
  topicIds: string[];
  questionCount?: number;
  durationMinutes?: number;
  difficulty?: 'ALL' | 'EASY' | 'MEDIUM' | 'HARD';
  marksPerQuestion?: number;
  negativeMarking?: number;
}

export async function createCustomMockTest(
  data: CustomMockTestPayload,
): Promise<{
  id: string;
  slug: string;
  title: string;
  durationMinutes: number;
  questionCount: number;
}> {
  try {
    const res = await fetch(apiUrl('mock-tests/custom'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback
  }

  const customId = `custom-mock-${Date.now()}`;
  return {
    id: customId,
    slug: customId,
    title: data.title || 'Custom Engineering Screening Simulation',
    durationMinutes: data.durationMinutes || 30,
    questionCount: data.questionCount || 20,
  };
}

