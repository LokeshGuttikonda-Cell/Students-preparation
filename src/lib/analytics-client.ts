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
import {
  DEFAULT_ANALYTICS_DATA,
  DEFAULT_ATTEMPTS_HISTORY,
  getFallbackRoleReadiness,
} from './catalog-fallbacks';

export async function getUserAttempts(
  page = 1,
  pageSize = 10,
  attemptType?: 'PRACTICE' | 'MOCK_TEST',
): Promise<PaginatedAttempts> {
  try {
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

    if (res.ok) {
      return (await res.json()) as PaginatedAttempts;
    }
  } catch {
    // Graceful fallback
  }

  return DEFAULT_ATTEMPTS_HISTORY;
}

export async function getWeakAreaAnalytics(): Promise<WeakAreaAnalyticsData> {
  try {
    const res = await fetch(apiUrl('attempts/analytics/weak-areas'), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as WeakAreaAnalyticsData;
    }
  } catch {
    // Graceful fallback
  }

  return DEFAULT_ANALYTICS_DATA;
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
  try {
    const endpoint = roleTrackId
      ? `attempts/analytics/role-readiness?roleTrackId=${encodeURIComponent(roleTrackId)}`
      : 'attempts/analytics/role-readiness';

    const res = await fetch(apiUrl(endpoint), {
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.ok) {
      return (await res.json()) as RoleReadinessData;
    }
  } catch {
    // Graceful fallback
  }

  return getFallbackRoleReadiness(roleTrackId);
}

export async function setTargetRole(
  roleTrackId: string | null,
): Promise<void> {
  try {
    const res = await fetch(apiUrl('auth/target-role'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roleTrackId }),
    });

    if (res.ok) {
      return;
    }
  } catch {
    // Graceful fallback
  }
}

