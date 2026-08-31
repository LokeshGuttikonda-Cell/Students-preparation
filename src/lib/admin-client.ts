import { apiUrl } from './env';

export interface SubjectItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface TopicItem {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  orderIndex: number;
  isActive: boolean;
  subject?: SubjectItem;
}

export interface QuestionOptionItem {
  id?: string;
  body: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface AdminQuestionItem {
  id: string;
  topicId: string;
  body: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  source: 'ORIGINAL_HUMAN' | 'AI_DRAFTED';
  authorId?: string | null;
  reviewedById?: string | null;
  reviewNotes?: string | null;
  options: QuestionOptionItem[];
  topic?: { id: string; name: string; slug: string; subjectId: string };
  author?: { id: string; name: string; email: string } | null;
  reviewedBy?: { id: string; name: string; email: string } | null;
  updatedAt: string;
}

export interface ContentMetrics {
  draftCount: number;
  inReviewCount: number;
  publishedCount: number;
  archivedCount: number;
  totalCount: number;
}

export interface PaginatedList<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// --- Subjects ---
export async function getAdminSubjects(): Promise<SubjectItem[]> {
  const res = await fetch(apiUrl('admin/subjects'), { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch subjects');
  return res.json();
}

export async function createAdminSubject(data: {
  name: string;
  slug: string;
  description?: string;
  orderIndex?: number;
}): Promise<SubjectItem> {
  const res = await fetch(apiUrl('admin/subjects'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to create subject');
  }
  return res.json();
}

// --- Topics ---
export async function getAdminTopics(subjectId?: string): Promise<TopicItem[]> {
  const url = subjectId
    ? apiUrl(`admin/topics?subjectId=${subjectId}`)
    : apiUrl('admin/topics');
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch topics');
  return res.json();
}

export async function createAdminTopic(data: {
  subjectId: string;
  name: string;
  slug: string;
  orderIndex?: number;
}): Promise<TopicItem> {
  const res = await fetch(apiUrl('admin/topics'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to create topic');
  }
  return res.json();
}

// --- Questions ---
export async function getAdminQuestions(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  topicId?: string;
}): Promise<PaginatedList<AdminQuestionItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('pageSize', String(params.pageSize));
  if (params.status) query.set('status', params.status);
  if (params.topicId) query.set('topicId', params.topicId);

  const res = await fetch(apiUrl(`admin/questions?${query.toString()}`), {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

export async function getAdminQuestion(id: string): Promise<AdminQuestionItem> {
  const res = await fetch(apiUrl(`admin/questions/${id}`), {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Question not found');
  return res.json();
}

export async function createAdminQuestion(data: {
  topicId: string;
  body: string;
  explanation: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  source: 'ORIGINAL_HUMAN' | 'AI_DRAFTED';
  options: QuestionOptionItem[];
}): Promise<AdminQuestionItem> {
  const res = await fetch(apiUrl('admin/questions'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to create question');
  }
  return res.json();
}

export async function updateAdminQuestion(
  id: string,
  data: Partial<AdminQuestionItem>,
): Promise<AdminQuestionItem> {
  const res = await fetch(apiUrl(`admin/questions/${id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Failed to update question');
  }
  return res.json();
}

export async function submitQuestionForReview(id: string): Promise<AdminQuestionItem> {
  const res = await fetch(apiUrl(`admin/questions/${id}/submit-for-review`), {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to submit question for review');
  return res.json();
}

export async function publishAdminQuestion(
  id: string,
  reviewNotes?: string,
): Promise<AdminQuestionItem> {
  const res = await fetch(apiUrl(`admin/questions/${id}/publish`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reviewNotes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Publication failed');
  }
  return res.json();
}

export async function getAdminMetrics(): Promise<ContentMetrics> {
  const res = await fetch(apiUrl('admin/questions/metrics'), {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}
