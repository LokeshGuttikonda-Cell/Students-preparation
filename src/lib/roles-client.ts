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

export async function getRoles(): Promise<RoleTrackItem[]> {
  const res = await fetch('/api/v1/roles', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch career role tracks');
  }

  return (await res.json()) as RoleTrackItem[];
}

export async function getRole(slugOrId: string): Promise<RoleTrackDetail> {
  const res = await fetch(`/api/v1/roles/${slugOrId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch role track "${slugOrId}"`);
  }

  return (await res.json()) as RoleTrackDetail;
}
