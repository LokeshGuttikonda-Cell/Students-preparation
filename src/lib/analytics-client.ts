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

  const res = await fetch(`/api/v1/attempts?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch user assessment history');
  }

  return (await res.json()) as PaginatedAttempts;
}

export async function getWeakAreaAnalytics(): Promise<WeakAreaAnalyticsData> {
  const res = await fetch('/api/v1/attempts/analytics/weak-areas', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch weak-area diagnostic analytics');
  }

  return (await res.json()) as WeakAreaAnalyticsData;
}
