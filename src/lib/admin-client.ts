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

// --- Courses & Curriculum Management (Session 18) ---

export interface AdminCourseItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  level: string;
  estimatedHours: number;
  roleTrackId?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  orderIndex: number;
  roleTrack?: { id: string; name: string; slug: string } | null;
  _count: { modules: number; enrollments: number };
  createdAt: string;
  updatedAt: string;
}

export interface AdminCourseModuleItem {
  id: string;
  courseTrackId: string;
  title: string;
  description?: string | null;
  topicId?: string | null;
  estimatedMinutes: number;
  orderIndex: number;
  topic?: { id: string; name: string; slug: string } | null;
}

export interface AdminCourseDetail extends AdminCourseItem {
  modules: AdminCourseModuleItem[];
}

export async function getAdminCourses(status?: string): Promise<AdminCourseItem[]> {
  const url = status ? `admin/courses?status=${status}` : 'admin/courses';
  const res = await fetch(apiUrl(url), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch admin courses');
  return res.json();
}

export async function getAdminCourse(id: string): Promise<AdminCourseDetail> {
  const res = await fetch(apiUrl(`admin/courses/${id}`), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch course details');
  return res.json();
}

export async function createAdminCourse(data: {
  name: string;
  slug: string;
  description?: string;
  level?: string;
  estimatedHours?: number;
  roleTrackId?: string | null;
  status?: string;
}): Promise<AdminCourseItem> {
  const res = await fetch(apiUrl('admin/courses'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to create course');
  }
  return res.json();
}

export async function updateAdminCourse(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    level: string;
    estimatedHours: number;
    roleTrackId: string | null;
    status: string;
    orderIndex: number;
  }>,
): Promise<AdminCourseItem> {
  const res = await fetch(apiUrl(`admin/courses/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to update course');
  }
  return res.json();
}

export async function deleteAdminCourse(id: string): Promise<{ id: string }> {
  const res = await fetch(apiUrl(`admin/courses/${id}`), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete course');
  return res.json();
}

export async function addAdminCourseModule(
  courseId: string,
  data: {
    title: string;
    description?: string;
    topicId?: string | null;
    estimatedMinutes?: number;
    orderIndex?: number;
  },
): Promise<AdminCourseModuleItem> {
  const res = await fetch(apiUrl(`admin/courses/${courseId}/modules`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to add module');
  }
  return res.json();
}

export async function updateAdminCourseModule(
  courseId: string,
  moduleId: string,
  data: Partial<{
    title: string;
    description: string;
    topicId: string | null;
    estimatedMinutes: number;
    orderIndex: number;
  }>,
): Promise<AdminCourseModuleItem> {
  const res = await fetch(apiUrl(`admin/courses/${courseId}/modules/${moduleId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to update module');
  }
  return res.json();
}

export async function deleteAdminCourseModule(
  courseId: string,
  moduleId: string,
): Promise<{ id: string }> {
  const res = await fetch(apiUrl(`admin/courses/${courseId}/modules/${moduleId}`), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete module');
  return res.json();
}

export async function reorderAdminCourseModules(
  courseId: string,
  moduleIds: string[],
): Promise<AdminCourseDetail> {
  const res = await fetch(apiUrl(`admin/courses/${courseId}/modules-order`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ moduleIds }),
  });
  if (!res.ok) throw new Error('Failed to reorder modules');
  return res.json();
}

// --- Mock Tests Studio & Multi-Section Blueprint (Phase 4 Session 19) ---

export interface AdminTestSectionItem {
  id: string;
  mockTestId: string;
  title: string;
  description?: string | null;
  durationMinutes?: number | null;
  cutoffScore?: number | null;
  orderIndex: number;
}

export interface AdminMockTestQuestionItem {
  mockTestId: string;
  questionId: string;
  sectionId?: string | null;
  orderIndex: number;
  question: {
    id: string;
    body: string;
    difficulty: string;
    topic: {
      id: string;
      name: string;
      slug: string;
    };
  };
  section?: {
    id: string;
    title: string;
  } | null;
}

export interface AdminMockTestItem {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  durationMinutes: number;
  marksPerQuestion: number;
  negativeMarking?: number | null;
  roleTrackId?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  roleTrack?: { id: string; name: string; slug: string } | null;
  _count: { questions: number; sections: number; attempts: number };
}

export interface AdminMockTestDetail extends AdminMockTestItem {
  sections: AdminTestSectionItem[];
  questions: AdminMockTestQuestionItem[];
}

export async function getAdminMockTests(status?: string): Promise<AdminMockTestItem[]> {
  const url = status ? `admin/mock-tests?status=${status}` : 'admin/mock-tests';
  const res = await fetch(apiUrl(url), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch admin mock tests');
  return res.json();
}

export async function getAdminMockTest(id: string): Promise<AdminMockTestDetail> {
  const res = await fetch(apiUrl(`admin/mock-tests/${id}`), {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch mock test detail');
  return res.json();
}

export async function createAdminMockTest(data: {
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  marksPerQuestion?: number;
  negativeMarking?: number | null;
  roleTrackId?: string | null;
  status?: string;
}): Promise<AdminMockTestItem> {
  const res = await fetch(apiUrl('admin/mock-tests'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to create mock test');
  }
  return res.json();
}

export async function updateAdminMockTest(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    description: string;
    durationMinutes: number;
    marksPerQuestion: number;
    negativeMarking: number | null;
    roleTrackId: string | null;
    status: string;
  }>,
): Promise<AdminMockTestItem> {
  const res = await fetch(apiUrl(`admin/mock-tests/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to update mock test');
  }
  return res.json();
}

export async function deleteAdminMockTest(id: string): Promise<{ id: string }> {
  const res = await fetch(apiUrl(`admin/mock-tests/${id}`), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete mock test');
  return res.json();
}

export async function createAdminTestSection(
  testId: string,
  data: {
    title: string;
    description?: string;
    durationMinutes?: number | null;
    cutoffScore?: number | null;
    orderIndex?: number;
  },
): Promise<AdminTestSectionItem> {
  const res = await fetch(apiUrl(`admin/mock-tests/${testId}/sections`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to create section');
  }
  return res.json();
}

export async function updateAdminTestSection(
  testId: string,
  sectionId: string,
  data: Partial<{
    title: string;
    description: string;
    durationMinutes: number | null;
    cutoffScore: number | null;
    orderIndex: number;
  }>,
): Promise<AdminTestSectionItem> {
  const res = await fetch(apiUrl(`admin/mock-tests/${testId}/sections/${sectionId}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to update section');
  }
  return res.json();
}

export async function deleteAdminTestSection(
  testId: string,
  sectionId: string,
): Promise<{ id: string }> {
  const res = await fetch(apiUrl(`admin/mock-tests/${testId}/sections/${sectionId}`), {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete section');
  return res.json();
}

export async function assignAdminMockQuestions(
  testId: string,
  questions: Array<{
    questionId: string;
    sectionId?: string | null;
    orderIndex: number;
  }>,
): Promise<AdminMockTestDetail> {
  const res = await fetch(apiUrl(`admin/mock-tests/${testId}/questions`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ questions }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to assign questions');
  }
  return res.json();
}


