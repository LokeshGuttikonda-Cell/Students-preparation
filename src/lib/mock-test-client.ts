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

export async function getMockTestsCatalog(): Promise<MockTestItem[]> {
  const res = await fetch(apiUrl('mock-tests'), {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch mock tests catalog');
  }

  const json = (await res.json()) as { items: MockTestItem[] };
  return json.items;
}

export async function getMockTestDetail(id: string): Promise<MockTestItem> {
  const res = await fetch(apiUrl(`mock-tests/${id}`), {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch mock test details');
  }

  return (await res.json()) as MockTestItem;
}

export async function startMockTestSession(
  mockTestId: string,
): Promise<MockTestAttemptData> {
  const res = await fetch(apiUrl('attempts'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      attemptType: 'MOCK_TEST',
      mockTestId,
    }),
  });

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(errorJson.message || 'Failed to start mock test session');
  }

  return (await res.json()) as MockTestAttemptData;
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
  const res = await fetch(
    apiUrl(`attempts/${attemptId}/answers/${questionId}`),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as {
      message?: string;
      statusCode?: number;
    };
    if (res.status === 409) {
      throw new Error('Time expired: answer could not be recorded.');
    }
    throw new Error(errorJson.message || 'Failed to record answer');
  }

  return res.json();
}

export async function submitMockTestSession(
  attemptId: string,
): Promise<MockTestScorecardData> {
  const res = await fetch(apiUrl(`attempts/${attemptId}/submit`), {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(errorJson.message || 'Failed to submit mock test');
  }

  return (await res.json()) as MockTestScorecardData;
}

export async function getMockTestScorecard(
  attemptId: string,
): Promise<MockTestScorecardData> {
  const res = await fetch(apiUrl(`attempts/${attemptId}/results`), {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(errorJson.message || 'Failed to load test scorecard');
  }

  return (await res.json()) as MockTestScorecardData;
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
  const res = await fetch(apiUrl('mock-tests/custom'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as {
      message?: string;

    };
    throw new Error(errorJson.message || 'Failed to generate custom simulation');
  }

  return res.json();
}

