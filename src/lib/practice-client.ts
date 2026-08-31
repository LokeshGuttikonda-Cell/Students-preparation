import { apiUrl } from './env';

export interface PracticeOption {
  id: string;
  body: string;
  orderIndex: number;
}

export interface PracticeQuestion {
  id: string;
  topicId: string;
  body: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  options: PracticeOption[];
  explanation?: string;
  answered?: {
    selectedOptionId: string;
    isCorrect: boolean;
    correctOptionId?: string;
  };
}

export interface PracticeAttemptData {
  attempt: {
    id: string;
    topicId: string;
    attemptType: 'PRACTICE';
    status: 'IN_PROGRESS' | 'SUBMITTED' | 'ABANDONED';
    startedAt: string;
    topicName: string;
    subjectName: string;
  };
  questions: PracticeQuestion[];
  answers: Array<{
    id: string;
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
}

export interface AnswerFeedback {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  selectedOptionId: string;
}

export async function startPracticeSession(
  topicId: string,
): Promise<PracticeAttemptData> {
  const res = await fetch(apiUrl('attempts'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ attemptType: 'PRACTICE', topicId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message ||
        (res.status === 401
          ? 'Please sign in to start practicing'
          : 'Failed to start practice session'),
    );
  }

  return res.json();
}

export async function submitPracticeAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
  timeSpentSeconds = 0,
): Promise<AnswerFeedback> {
  const res = await fetch(
    apiUrl(`attempts/${attemptId}/answers/${questionId}`),
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ selectedOptionId, timeSpentSeconds }),
    },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || 'Failed to submit practice answer',
    );
  }

  return res.json();
}

export async function abandonPracticeSession(
  attemptId: string,
): Promise<{ success: boolean }> {
  const res = await fetch(apiUrl(`attempts/${attemptId}/abandon`), {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to abandon practice session');
  }

  return res.json();
}

export interface PracticeSubjectWithTopics {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  topics: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export async function getPracticeCatalog(): Promise<PracticeSubjectWithTopics[]> {
  const [subjectsRes, topicsRes] = await Promise.all([
    fetch(apiUrl('subjects')),
    fetch(apiUrl('topics')),
  ]);

  if (!subjectsRes.ok || !topicsRes.ok) {
    throw new Error('Failed to load subjects and topics');
  }

  const subjects = await subjectsRes.json();
  const topics = await topicsRes.json();

  return subjects.map(
    (s: { id: string; name: string; slug: string; description?: string }) => ({
      ...s,
      topics: topics.filter((t: { subjectId: string }) => t.subjectId === s.id),
    }),
  );
}
