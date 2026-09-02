export interface CourseModuleItem {
  id: string;
  title: string;
  description: string | null;
  topicId: string | null;
  topicName: string | null;
  topicSlug: string | null;
  estimatedMinutes: number;
  orderIndex: number;
}

export interface CourseTrackItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  estimatedHours: number;
  roleTrack: {
    id: string;
    name: string;
    slug: string;
  } | null;
  modulesCount: number;
  orderIndex: number;
}

export interface CourseTrackDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string;
  estimatedHours: number;
  roleTrack: {
    id: string;
    name: string;
    slug: string;
  } | null;
  modules: CourseModuleItem[];
  isEnrolled: boolean;
  enrolledAt: string | null;
  completedAt: string | null;
}

export interface CourseProgressResult {
  courseId: string;
  courseName: string;
  isEnrolled: boolean;
  enrolledAt: string | null;
  completedAt: string | null;
  totalModules: number;
  completedModules: number;
  progressPercentage: number;
  moduleProgress: Array<{
    moduleId: string;
    title: string;
    topicId: string | null;
    isCompleted: boolean;
    accuracyPercentage: number | null;
  }>;
}

export async function getCourses(): Promise<CourseTrackItem[]> {
  const res = await fetch('/api/v1/courses', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch course tracks');
  }

  return (await res.json()) as CourseTrackItem[];
}

export async function getCourse(slug: string): Promise<CourseTrackDetail> {
  const res = await fetch(`/api/v1/courses/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch course "${slug}"`);
  }

  return (await res.json()) as CourseTrackDetail;
}

export async function enrollInCourse(
  courseId: string,
): Promise<{ success: boolean; enrolledAt: string }> {
  const res = await fetch(`/api/v1/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Please sign in to enroll in this course');
    }
    throw new Error('Failed to enroll in course');
  }

  return (await res.json()) as { success: boolean; enrolledAt: string };
}

export async function getCourseProgress(
  courseId: string,
): Promise<CourseProgressResult> {
  const res = await fetch(`/api/v1/courses/${courseId}/progress`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch course progress');
  }

  return (await res.json()) as CourseProgressResult;
}
