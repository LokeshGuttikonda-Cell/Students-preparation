import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentDashboardPage from '../(student)/dashboard/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u_1', name: 'Student Tester', email: 'test@example.com', targetRoleId: 'r_dist' },
    isLoading: false,
    refresh: vi.fn(),
  }),
}));

vi.mock('../../lib/analytics-client', () => ({
  getUserAttempts: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'att-1',
        attemptType: 'PRACTICE',
        status: 'SUBMITTED',
        title: 'Practice: Advanced SQL',
        startedAt: '2026-09-01T10:00:00Z',
        submittedAt: '2026-09-01T10:25:00Z',
        score: 8,
        maxScore: 10,
        correctCount: 8,
        incorrectCount: 2,
        unansweredCount: 0,
        accuracy: 80,
        mockTestId: null,
        topicId: 't-sql',
      },
    ],
    totalItems: 1,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  }),
  getWeakAreaAnalytics: vi.fn().mockResolvedValue({
    kpis: {
      totalTestsCompleted: 15,
      totalQuestionsAnswered: 110,
      overallAccuracy: 82,
    },
    weakAreas: [
      {
        topicId: 't-sql',
        topicName: 'Advanced SQL',
        topicSlug: 'advanced-sql',
        subjectId: 'sub-db',
        subjectName: 'Databases',
        totalAttempted: 20,
        correctCount: 10,
        incorrectCount: 10,
        accuracy: 50,
        needsRevision: true,
      },
    ],
  }),
  getRoleReadiness: vi.fn().mockResolvedValue({
    role: {
      id: 'r_dist',
      name: 'Distributed Systems Architect',
      slug: 'distributed-systems-architect',
      description: 'Distributed consensus and high-throughput systems',
      targetLevel: 'SENIOR',
    },
    rri: 85,
    readinessTier: 'READY',
    summary: 'Strong competency demonstrated across core architecture.',
    competencies: [
      {
        id: 'c-1',
        topicId: 't-consensus',
        topicName: 'Raft & Paxos Consensus',
        topicSlug: 'raft-paxos-consensus',
        subjectId: 'sub-dist',
        subjectName: 'Distributed Systems',
        weightPercentage: 40,
        benchmarkAccuracy: 80,
        studentQuestionsAttempted: 30,
        studentAccuracy: 86,
        coverageRatio: 0.9,
        gap: 6,
        status: 'READY',
        practiceTopicId: 't-consensus',
      },
      {
        id: 'c-2',
        topicId: 't-concurrency',
        topicName: 'OS Kernel Concurrency',
        topicSlug: 'os-kernel-concurrency',
        subjectId: 'sub-os',
        subjectName: 'Operating Systems',
        weightPercentage: 30,
        benchmarkAccuracy: 75,
        studentQuestionsAttempted: 25,
        studentAccuracy: 78,
        coverageRatio: 0.85,
        gap: 3,
        status: 'READY',
        practiceTopicId: 't-concurrency',
      },
      {
        id: 'c-3',
        topicId: 't-storage',
        topicName: 'LSM-Trees & Storage',
        topicSlug: 'lsm-trees-storage',
        subjectId: 'sub-db',
        subjectName: 'Database Engines',
        weightPercentage: 30,
        benchmarkAccuracy: 80,
        studentQuestionsAttempted: 20,
        studentAccuracy: 82,
        coverageRatio: 0.8,
        gap: 2,
        status: 'READY',
        practiceTopicId: 't-storage',
      },
    ],
    benchmarkMockTests: [],
  }),
  setTargetRole: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../../lib/roles-client', () => ({
  getRoles: vi.fn().mockResolvedValue([
    {
      id: 'r_dist',
      name: 'Distributed Systems Architect',
      slug: 'distributed-systems-architect',
      description: 'Distributed systems role',
      targetLevel: 'SENIOR',
      competenciesCount: 3,
      mockTestsCount: 1,
      competencies: [],
    },
  ]),
}));

vi.mock('../../lib/gamification-client', () => ({
  fetchUserStreak: vi.fn().mockResolvedValue({
    currentStreak: 5,
    longestStreak: 12,
    todayCompleted: true,
  }),
  fetchUserBadges: vi.fn().mockResolvedValue([]),
}));

describe('StudentDashboardPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student dashboard with KPIs, readiness section, and Multi-Role Architectural Radar', async () => {
    render(<StudentDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Performance Dashboard')).toBeInTheDocument();
    });

    // Check KPIs
    expect(screen.getByText('Tests Completed')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getAllByText('82%').length).toBeGreaterThanOrEqual(1);

    // Check Multi-Role Architectural Radar exists
    const radar = screen.getByTestId('multi-role-architectural-radar');
    expect(radar).toBeInTheDocument();
    expect(screen.getByText('Multi-Role Architectural Competency Matrix')).toBeInTheDocument();
    expect(screen.getByText('Multi-Layer Comparative Radar')).toBeInTheDocument();

    // Check interactive controls inside the radar
    const primarySelect = screen.getByRole('combobox', { name: 'Primary Target Role' });
    expect(primarySelect).toBeInTheDocument();

    const secondaryToggle = screen.getByLabelText(/Secondary Role Overlay/i);
    expect(secondaryToggle).toBeChecked();

    // Toggle off secondary role overlay
    fireEvent.click(secondaryToggle);
    expect(secondaryToggle).not.toBeChecked();

    // Check Longitudinal Vocabulary Growth & Architectural Drift (Session 54)
    const longitudinalTracker = screen.getByTestId('longitudinal-growth-tracker');
    expect(longitudinalTracker).toBeInTheDocument();
    expect(screen.getByText('Longitudinal Articulation Radar')).toBeInTheDocument();
    expect(screen.getByText('Technical Vocabulary Growth & Architectural Drift')).toBeInTheDocument();
    expect(screen.getByText('Net Concept Density Gain')).toBeInTheDocument();
  });
});
