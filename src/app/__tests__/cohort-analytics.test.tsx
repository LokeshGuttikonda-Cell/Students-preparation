import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CohortAnalyticsPage from '../(student)/analytics/cohort/page';

const mockRoles = [
  {
    id: 'r_devops',
    name: 'Cloud & DevOps Engineer',
    slug: 'cloud-devops-engineer',
    description: 'Cloud and DevOps role',
    targetLevel: 'MID_LEVEL',
    competenciesCount: 2,
    mockTestsCount: 1,
    competencies: [],
  },
  {
    id: 'r_python',
    name: 'Python Developer',
    slug: 'python-developer',
    description: 'Python backend role',
    targetLevel: 'ENTRY_LEVEL',
    competenciesCount: 2,
    mockTestsCount: 1,
    competencies: [],
  },
];

const mockDevopsReadiness = {
  roleTrackId: 'r_devops',
  roleName: 'Cloud & DevOps Engineer',
  roleSlug: 'cloud-devops-engineer',
  candidateScore: 88,
  percentileRank: 88,
  readinessBand: 'JOB_READY' as const,
  cohortSampleSize: 52,
  cohortMedianScore: 71,
  cohortTopDecileScore: 90,
  distribution: [
    { range: '0-9%', minScore: 0, maxScore: 9, count: 0, percentage: 0, isStudentBucket: false },
    { range: '10-19%', minScore: 10, maxScore: 19, count: 0, percentage: 0, isStudentBucket: false },
    { range: '20-29%', minScore: 20, maxScore: 29, count: 0, percentage: 0, isStudentBucket: false },
    { range: '30-39%', minScore: 30, maxScore: 39, count: 2, percentage: 4, isStudentBucket: false },
    { range: '40-49%', minScore: 40, maxScore: 49, count: 4, percentage: 8, isStudentBucket: false },
    { range: '50-59%', minScore: 50, maxScore: 59, count: 6, percentage: 12, isStudentBucket: false },
    { range: '60-69%', minScore: 60, maxScore: 69, count: 12, percentage: 23, isStudentBucket: false },
    { range: '70-79%', minScore: 70, maxScore: 79, count: 14, percentage: 27, isStudentBucket: false },
    { range: '80-89%', minScore: 80, maxScore: 89, count: 9, percentage: 17, isStudentBucket: true },
    { range: '90-100%', minScore: 90, maxScore: 100, count: 5, percentage: 10, isStudentBucket: false },
  ],
  competencyBenchmarks: [
    {
      topicId: 't_cicd',
      topicName: 'CI/CD Automation',
      studentAccuracy: 92,
      cohortMedian: 74,
      topDecileBenchmark: 90,
      gapFromMedian: 18,
    },
    {
      topicId: 't_k8s',
      topicName: 'Kubernetes Architecture',
      studentAccuracy: 60,
      cohortMedian: 72,
      topDecileBenchmark: 88,
      gapFromMedian: -12,
    },
  ],
  keyDeficit: {
    topicId: 't_k8s',
    topicName: 'Kubernetes Architecture',
    studentAccuracy: 60,
    cohortMedian: 72,
    topDecileBenchmark: 88,
    gapFromMedian: -12,
  },
  keyStrength: {
    topicId: 't_cicd',
    topicName: 'CI/CD Automation',
    studentAccuracy: 92,
    cohortMedian: 74,
    topDecileBenchmark: 90,
    gapFromMedian: 18,
  },
};

const mockPythonReadiness = {
  roleTrackId: 'r_python',
  roleName: 'Python Developer',
  roleSlug: 'python-developer',
  candidateScore: null,
  percentileRank: null,
  readinessBand: null,
  cohortSampleSize: 48,
  cohortMedianScore: 69,
  cohortTopDecileScore: 89,
  distribution: [],
  competencyBenchmarks: [],
  keyDeficit: null,
  keyStrength: null,
};

describe('CohortAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/roles')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockRoles),
        });
      }
      if (url.includes('/api/v1/cohorts/r_devops')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockDevopsReadiness),
        });
      }
      if (url.includes('/api/v1/cohorts/r_python')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPythonReadiness),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });
  });

  it('renders hero title and loads default role track cohort benchmarking', async () => {
    render(<CohortAnalyticsPage />);

    expect(
      screen.getByText('Peer Percentile Cohort Benchmarking'),
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getAllByText('Cloud & DevOps Engineer').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('◆ JOB READY (TOP 20%)')).toBeInTheDocument();
        expect(screen.getByText('Top 12% of Cohort')).toBeInTheDocument();
        expect(screen.getByText('88%')).toBeInTheDocument();
        expect(screen.getByText('71%')).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });

  it('renders histogram bucket highlighting the student current bucket', async () => {
    render(<CohortAnalyticsPage />);

    await waitFor(
      () => {
        expect(screen.getByText(/You are in the/i)).toBeInTheDocument();
        expect(screen.getByText(/bucket/i)).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });

  it('renders competency-level peer benchmarks and gap indicators', async () => {
    render(<CohortAnalyticsPage />);

    await waitFor(
      () => {
        expect(screen.getByText('CI/CD Automation')).toBeInTheDocument();
        expect(screen.getByText('+18% above median')).toBeInTheDocument();
        expect(screen.getAllByText('Kubernetes Architecture').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('-12% below median')).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });

  it('renders highest priority capability deficit card with direct practice button', async () => {
    render(<CohortAnalyticsPage />);

    await waitFor(
      () => {
        expect(
          screen.getByText(/Highest Priority Capability Deficit/i),
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Practice Topic/i })).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });

  it('switches role track benchmarking when clicking another role track tab', async () => {
    render(<CohortAnalyticsPage />);

    await waitFor(
      () => {
        expect(screen.getByText('Python Developer')).toBeInTheDocument();
      },
      { timeout: 4000 },
    );

    fireEvent.click(screen.getByText('Python Developer'));

    await waitFor(
      () => {
        expect(screen.getByText(/No score recorded yet/i)).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });
});
