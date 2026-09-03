export interface AttemptHistoryItem {
  id: string;
  attemptType: 'PRACTICE' | 'MOCK_TEST';
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'ABANDONED';
  title: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  correctCount: number | null;
  incorrectCount: number | null;
  unansweredCount: number | null;
  accuracy: number;
  mockTestId: string | null;
  topicId: string | null;
}

export interface WeakAreaItem {
  topicId: string;
  topicName: string;
  topicSlug: string;
  subjectId: string;
  subjectName: string;
  totalAttempted: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  needsRevision: boolean;
}

export interface WeakAreaAnalyticsData {
  kpis: {
    totalTestsCompleted: number;
    totalQuestionsAnswered: number;
    overallAccuracy: number;
  };
  weakAreas: WeakAreaItem[];
}

export interface PaginatedAttempts {
  items: AttemptHistoryItem[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

import { apiUrl } from './env';

export async function getUserAttempts(
  page = 1,
  pageSize = 10,
  attemptType?: 'PRACTICE' | 'MOCK_TEST',
): Promise<PaginatedAttempts> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (attemptType) {
    params.set('attemptType', attemptType);
  }

  const res = await fetch(apiUrl(`attempts?${params.toString()}`), {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user assessment history');
  }

  return (await res.json()) as PaginatedAttempts;
}

export async function getWeakAreaAnalytics(): Promise<WeakAreaAnalyticsData> {
  const res = await fetch(apiUrl('attempts/analytics/weak-areas'), {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch weak-area diagnostic analytics');
  }

  return (await res.json()) as WeakAreaAnalyticsData;
}

export interface RoleReadinessCompetency {
  id: string;
  topicId: string;
  topicName: string;
  topicSlug: string;
  subjectId: string;
  subjectName: string;
  weightPercentage: number;
  benchmarkAccuracy: number;
  studentQuestionsAttempted: number;
  studentAccuracy: number;
  coverageRatio: number;
  gap: number;
  status: 'READY' | 'IN_PROGRESS' | 'NOT_STARTED';
  practiceTopicId: string;
}

export interface RoleReadinessData {
  role: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    targetLevel: string;
  };
  rri: number;
  readinessTier: 'READY' | 'COMPETITIVE' | 'NEEDS_PRACTICE' | 'BEGINNER';
  summary: string;
  competencies: RoleReadinessCompetency[];
  benchmarkMockTests: Array<{
    id: string;
    title: string;
    slug: string;
    durationMinutes: number;
    questionCount: number;
  }>;
}

export async function getRoleReadiness(
  roleTrackId?: string,
): Promise<RoleReadinessData> {
  const endpoint = roleTrackId
    ? `attempts/analytics/role-readiness?roleTrackId=${encodeURIComponent(roleTrackId)}`
    : 'attempts/analytics/role-readiness';

  const res = await fetch(apiUrl(endpoint), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch role readiness analytics');
  }

  return (await res.json()) as RoleReadinessData;
}

export async function setTargetRole(
  roleTrackId: string | null,
): Promise<void> {
  const res = await fetch(apiUrl('auth/target-role'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ roleTrackId }),
  });

  if (!res.ok) {
    throw new Error('Failed to update target career role');
  }
}

