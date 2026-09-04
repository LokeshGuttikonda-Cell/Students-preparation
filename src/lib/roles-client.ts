export interface RoleCompetency {
  id: string;
  topicId: string;
  topicName: string;
  topicSlug: string;
  subjectId: string;
  subjectName: string;
  weightPercentage: number;
  benchmarkAccuracy: number;
}

export interface RoleMockTest {
  id: string;
  title: string;
  slug: string;
  durationMinutes: number;
  negativeMarking: number | null;
  marksPerQuestion: number;
}

export interface RoleTrackItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  targetLevel: string;
  competenciesCount: number;
  mockTestsCount: number;
  competencies: RoleCompetency[];
}

export interface RoleTrackDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  targetLevel: string;
  competencies: RoleCompetency[];
  mockTests: RoleMockTest[];
}

import { apiUrl } from './env';
import { DEFAULT_ROLES_CATALOG } from './catalog-data';

export async function getRoles(): Promise<RoleTrackItem[]> {
  try {
    const res = await fetch(apiUrl('roles'), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      const data = (await res.json()) as RoleTrackItem[];
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // Gracefully fallback to catalog
  }

  return DEFAULT_ROLES_CATALOG;
}

export async function getRole(slugOrId: string): Promise<RoleTrackDetail> {
  try {
    const res = await fetch(apiUrl(`roles/${slugOrId}`), {
      credentials: 'include',
      cache: 'no-store',
    });

    if (res.ok) {
      return (await res.json()) as RoleTrackDetail;
    }
  } catch {
    // Gracefully fallback to catalog
  }

  const found = DEFAULT_ROLES_CATALOG.find(
    (r) => r.slug === slugOrId || r.id === slugOrId,
  );
  if (found) {
    return {
      id: found.id,
      name: found.name,
      slug: found.slug,
      description: found.description,
      targetLevel: found.targetLevel,
      competencies: found.competencies,
      mockTests: [
        {
          id: `mock-${found.slug}-1`,
          title: `${found.name} Core Screening Assessment`,
          slug: `${found.slug}-core-assessment`,
          durationMinutes: 45,
          negativeMarking: 0.25,
          marksPerQuestion: 1,
        },
      ],
    };
  }

  throw new Error(`Failed to fetch role track "${slugOrId}"`);
}

