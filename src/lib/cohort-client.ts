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

import { apiUrl } from './env';
import {
  getFallbackCohortReadiness,
  DEFAULT_COHORTS_OVERVIEW,
} from './catalog-fallbacks';

export async function getCohortReadiness(
  roleTrackId: string,
): Promise<CohortReadinessResponse> {
  try {
    const res = await fetch(apiUrl(`cohorts/${roleTrackId}`), {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      return (await res.json()) as CohortReadinessResponse;
    }
  } catch {
    // Graceful fallback
  }

  return getFallbackCohortReadiness(roleTrackId);
}

export async function getCohortsOverview(): Promise<CohortSummaryItem[]> {
  try {
    const res = await fetch(apiUrl('cohorts'), {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (res.ok) {
      return (await res.json()) as CohortSummaryItem[];
    }
  } catch {
    // Graceful fallback
  }

  return DEFAULT_COHORTS_OVERVIEW;
}

