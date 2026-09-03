export type ReadinessBand =
  | 'NEEDS_REMEDIATION'
  | 'COMPETITIVE'
  | 'JOB_READY'
  | 'ELITE';

export interface CohortDistributionBucket {
  range: string;
  minScore: number;
  maxScore: number;
  count: number;
  percentage: number;
  isStudentBucket: boolean;
}

export interface CohortCompetencyBenchmark {
  topicId: string;
  topicName: string;
  studentAccuracy: number;
  cohortMedian: number;
  topDecileBenchmark: number;
  gapFromMedian: number;
}

export interface CohortReadinessResponse {
  roleTrackId: string;
  roleName: string;
  roleSlug: string;
  candidateScore: number | null;
  percentileRank: number | null;
  readinessBand: ReadinessBand | null;
  cohortSampleSize: number;
  cohortMedianScore: number;
  cohortTopDecileScore: number;
  distribution: CohortDistributionBucket[];
  competencyBenchmarks: CohortCompetencyBenchmark[];
  keyDeficit: CohortCompetencyBenchmark | null;
  keyStrength: CohortCompetencyBenchmark | null;
}

export interface CohortSummaryItem {
  roleTrackId: string;
  roleName: string;
  roleSlug: string;
  candidateScore: number | null;
  percentileRank: number | null;
  readinessBand: ReadinessBand | null;
  cohortMedianScore: number;
  cohortSampleSize: number;
}

export async function getCohortReadiness(
  roleTrackId: string,
): Promise<CohortReadinessResponse> {
  const res = await fetch(`/api/v1/cohorts/${roleTrackId}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to load cohort readiness analytics');
  }
  return res.json();
}

export async function getCohortsOverview(): Promise<CohortSummaryItem[]> {
  const res = await fetch('/api/v1/cohorts', {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error('Failed to load cohort analytics overview');
  }
  return res.json();
}
