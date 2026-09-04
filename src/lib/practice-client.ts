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

import {
  createFallbackPracticeSession,
  evaluateFallbackPracticeAnswer,
} from './catalog-fallbacks';

export async function startPracticeSession(
  topicId: string,
): Promise<PracticeAttemptData> {
  try {
    const res = await fetch(apiUrl('attempts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ attemptType: 'PRACTICE', topicId }),
    });

    if (res.ok) {
      return (await res.json()) as PracticeAttemptData;
    }
  } catch {
    // Graceful fallback to local practice session
  }

  return createFallbackPracticeSession(topicId);
}

export async function submitPracticeAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string,
  timeSpentSeconds = 0,
): Promise<AnswerFeedback> {
  try {
    const res = await fetch(
      apiUrl(`attempts/${attemptId}/answers/${questionId}`),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ selectedOptionId, timeSpentSeconds }),
      },
    );

    if (res.ok) {
      return (await res.json()) as AnswerFeedback;
    }
  } catch {
    // Graceful fallback to evaluation
  }

  return evaluateFallbackPracticeAnswer(attemptId, questionId, selectedOptionId);
}

export async function abandonPracticeSession(
  attemptId: string,
): Promise<{ success: boolean }> {
  try {
    const res = await fetch(apiUrl(`attempts/${attemptId}/abandon`), {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback
  }

  return { success: true };
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

import { DEFAULT_PRACTICE_CATALOG } from './catalog-data';

export async function getPracticeCatalog(): Promise<PracticeSubjectWithTopics[]> {
  try {
    const [subjectsRes, topicsRes] = await Promise.all([
      fetch(apiUrl('subjects'), { credentials: 'include' }),
      fetch(apiUrl('topics'), { credentials: 'include' }),
    ]);

    if (subjectsRes.ok && topicsRes.ok) {
      const subjects = await subjectsRes.json();
      const topics = await topicsRes.json();

      if (Array.isArray(subjects) && subjects.length > 0) {
        return subjects.map(
          (s: { id: string; name: string; slug: string; description?: string }) => ({
            ...s,
            topics: topics.filter((t: { subjectId: string }) => t.subjectId === s.id),
          }),
        );
      }
    }
  } catch {
    // Gracefully fallback to catalog
  }

  return DEFAULT_PRACTICE_CATALOG;
}
