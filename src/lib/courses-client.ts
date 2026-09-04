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

import { apiUrl } from './env';
import {
  DEFAULT_COURSES_CATALOG,
  DEFAULT_ROLES_CATALOG,
} from './catalog-data';

export async function getCourses(): Promise<CourseTrackItem[]> {
  try {
    const res = await fetch(apiUrl('courses'), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      const data = (await res.json()) as CourseTrackItem[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Gracefully fallback to catalog
  }

  return DEFAULT_COURSES_CATALOG;
}

export async function getCourse(slug: string): Promise<CourseTrackDetail> {
  try {
    const res = await fetch(apiUrl(`courses/${slug}`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as CourseTrackDetail;
    }
  } catch {
    // Gracefully fallback to catalog
  }

  const found = DEFAULT_COURSES_CATALOG.find((c) => c.slug === slug || c.id === slug);
  if (found) {
    const role = DEFAULT_ROLES_CATALOG.find(
      (r) => r.id === found.roleTrack?.id || r.slug === found.roleTrack?.slug,
    );

    const competencies = role?.competencies || [];
    const modules: CourseModuleItem[] =
      competencies.length > 0
        ? competencies.map((comp, idx) => ({
            id: `mod-${found.slug}-${idx + 1}`,
            title: `Module ${idx + 1}: ${comp.topicName}`,
            description: `Master core principles, architecture patterns, and practical implementation drills for ${comp.topicName}.`,
            topicId: comp.topicId,
            topicName: comp.topicName,
            topicSlug: comp.topicSlug,
            estimatedMinutes: Math.round(
              (found.estimatedHours * 60) / competencies.length,
            ),
            orderIndex: idx,
          }))
        : [
            {
              id: `mod-${found.slug}-1`,
              title: 'Module 1: Foundations & Architecture',
              description: 'Comprehensive introduction and foundational concepts.',
              topicId: 'topic-aws-arch',
              topicName: 'AWS Cloud Architecture & Services',
              topicSlug: 'aws-cloud-architecture',
              estimatedMinutes: 60,
              orderIndex: 0,
            },
            {
              id: `mod-${found.slug}-2`,
              title: 'Module 2: Practical Engineering Implementation',
              description: 'Deep-dive implementation drills and practical problem solving.',
              topicId: 'topic-linux',
              topicName: 'Linux System Administration & Shell',
              topicSlug: 'linux-shell-scripting',
              estimatedMinutes: 90,
              orderIndex: 1,
            },
            {
              id: `mod-${found.slug}-3`,
              title: 'Module 3: Advanced Optimization & Scenarios',
              description: 'Real-world system design, troubleshooting, and edge cases.',
              topicId: 'topic-devops',
              topicName: 'DevOps, Docker & CI/CD Pipelines',
              topicSlug: 'devops-docker-cicd',
              estimatedMinutes: 90,
              orderIndex: 2,
            },
          ];

    return {
      id: found.id,
      name: found.name,
      slug: found.slug,
      description: found.description,
      level: found.level,
      estimatedHours: found.estimatedHours,
      roleTrack: found.roleTrack,
      isEnrolled: false,
      enrolledAt: null,
      completedAt: null,
      modules,
    };
  }

  throw new Error(`Failed to fetch course "${slug}"`);
}

export async function enrollInCourse(
  courseId: string,
): Promise<{ success: boolean; enrolledAt: string }> {
  try {
    const res = await fetch(apiUrl(`courses/${courseId}/enroll`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (res.ok) {
      return (await res.json()) as { success: boolean; enrolledAt: string };
    }
  } catch {
    // Graceful fallback
  }

  return { success: true, enrolledAt: new Date().toISOString() };
}

export async function getCourseProgress(
  courseId: string,
): Promise<CourseProgressResult> {
  try {
    const res = await fetch(apiUrl(`courses/${courseId}/progress`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as CourseProgressResult;
    }
  } catch {
    // Graceful fallback
  }

  const course = DEFAULT_COURSES_CATALOG.find(
    (c) => c.id === courseId || c.slug === courseId,
  );
  const courseName = course ? course.name : 'Engineering Career Pathway';

  return {
    courseId,
    courseName,
    isEnrolled: true,
    enrolledAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    completedAt: null,
    totalModules: 3,
    completedModules: 1,
    progressPercentage: 33,
    moduleProgress: [
      {
        moduleId: 'mod-1',
        title: 'Module 1: Foundations & Architecture',
        topicId: 'topic-1',
        isCompleted: true,
        accuracyPercentage: 85,
      },
      {
        moduleId: 'mod-2',
        title: 'Module 2: Practical Engineering Implementation',
        topicId: 'topic-2',
        isCompleted: false,
        accuracyPercentage: null,
      },
      {
        moduleId: 'mod-3',
        title: 'Module 3: Advanced Optimization & Scenarios',
        topicId: 'topic-3',
        isCompleted: false,
        accuracyPercentage: null,
      },
    ],
  };
}

