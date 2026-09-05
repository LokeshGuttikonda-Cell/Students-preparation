import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InterviewResultsPage from '../(student)/interviews/[id]/results/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'sess_completed_123' }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const mockCompletedSession = {
  id: 'sess_completed_123',
  userId: 'stu_1',
  roleTrackId: 'r_devops',
  status: 'COMPLETED' as const,
  currentStage: 'WRAPUP' as const,
  targetDurationMinutes: 20,
  overallScore: 88,
  technicalScore: 90,
  clarityScore: 85,
  feedbackSummary:
    'Demonstrated solid command of containerization and CI/CD pipelines with strong failure-mode mitigation awareness.',
  strengths: [
    'Deep understanding of rolling vs blue/green deployment trade-offs',
    'Clear articulation of Kubernetes pod lifecycle failure modes',
  ],
  growthAreas: [
    'Could elaborate more on Prometheus query syntax for latency percentiles',
  ],
  startedAt: '2026-09-02T10:00:00.000Z',
  completedAt: '2026-09-02T10:20:00.000Z',
  roleTrack: {
    id: 'r_devops',
    name: 'Cloud & DevOps Engineer',
    slug: 'cloud-devops-engineer',
  },
  messages: [
    {
      id: 'msg_1',
      sender: 'AI_INTERVIEWER' as const,
      content: 'Can you describe how you architect a resilient CI/CD pipeline?',
      stage: 'INTRODUCTION' as const,
      turnNumber: 1,
      technicalFeedback: null,
      suggestedBetterAnswer: null,
      createdAt: '2026-09-02T10:00:00.000Z',
    },
    {
      id: 'msg_2',
      sender: 'CANDIDATE' as const,
      content:
        'I use multi-stage Docker builds and automated canary deployments.',
      stage: 'INTRODUCTION' as const,
      turnNumber: 2,
      technicalFeedback: 'Clear introductory summary of pipeline architecture.',
      suggestedBetterAnswer:
        'Structure around 3 pillars: artifact immutability, automated linting/testing, and progressive canary rollout with automated rollback.',
      createdAt: '2026-09-02T10:02:00.000Z',
    },
    {
      id: 'msg_3',
      sender: 'AI_INTERVIEWER' as const,
      content: 'How do you detect memory leaks in long-running pods?',
      stage: 'TECHNICAL_DRILL' as const,
      turnNumber: 3,
      technicalFeedback: null,
      suggestedBetterAnswer: null,
      createdAt: '2026-09-02T10:04:00.000Z',
    },
  ],
};

const mockGetInterviewSession = vi.fn();

vi.mock('../../lib/interview-client', () => ({
  getInterviewSession: (...args: unknown[]) => mockGetInterviewSession(...args),
}));

describe('InterviewResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetInterviewSession.mockResolvedValue(mockCompletedSession);
  });

  it('renders overall score, performance rubrics, and evaluator findings', async () => {
    render(<InterviewResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('88%')).toBeDefined();
      expect(
        screen.getByText(/Cloud & DevOps Engineer Performance Evaluation/i),
      ).toBeDefined();
      expect(
        screen.getByText('✓ Technical Screening Cleared'),
      ).toBeDefined();
    });

    // Multi-axis rubrics
    expect(screen.getByText('90%')).toBeDefined();
    expect(screen.getByText('85%')).toBeDefined();
    expect(screen.getByText('Domain Accuracy')).toBeDefined();
    expect(screen.getByText('Articulation Clarity')).toBeDefined();
    expect(screen.getByText('Speech Cadence')).toBeDefined();
    expect(screen.getByText(/Verbal Articulation & Systems Vocabulary Telemetry/i)).toBeDefined();

    // Strengths
    expect(
      screen.getByText(
        'Deep understanding of rolling vs blue/green deployment trade-offs',
      ),
    ).toBeDefined();

    // Growth areas
    expect(
      screen.getByText(
        'Could elaborate more on Prometheus query syntax for latency percentiles',
      ),
    ).toBeDefined();
  });

  it('renders turn-by-turn dialogue stream with evaluator insights and benchmark guidance', async () => {
    render(<InterviewResultsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Can you describe how you architect a resilient CI/CD pipeline?',
        ),
      ).toBeDefined();
      expect(
        screen.getByText(
          'I use multi-stage Docker builds and automated canary deployments.',
        ),
      ).toBeDefined();
    });

    // Audio playback button
    const listenButtons = screen.getAllByRole('button', { name: /Listen to Turn Audio/i });
    expect(listenButtons.length).toBeGreaterThan(0);
    fireEvent.click(listenButtons[0]);

    // Turn feedback
    expect(
      screen.getByText('Clear introductory summary of pipeline architecture.'),
    ).toBeDefined();

    // Benchmark pointer
    expect(
      screen.getByText(/View Socratic Benchmark Ideal Response Pointer/i),
    ).toBeDefined();
  });

  it('filters dialogue turns when selecting stage filters', async () => {
    render(<InterviewResultsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Can you describe how you architect a resilient CI/CD pipeline?',
        ),
      ).toBeDefined();
    });

    // Click 'Evaluator Insights Only'
    const feedbackOnlyBtn = screen.getByText('Evaluator Insights Only');
    fireEvent.click(feedbackOnlyBtn);

    // Only candidate turn with feedback should show
    expect(
      screen.getByText(
        'I use multi-stage Docker builds and automated canary deployments.',
      ),
    ).toBeDefined();
    // Question without feedback should be filtered out
    expect(
      screen.queryByText('How do you detect memory leaks in long-running pods?'),
    ).toBeNull();
  });

  it('renders error state when session retrieval fails', async () => {
    mockGetInterviewSession.mockRejectedValueOnce(
      new Error('Interview session does not exist'),
    );

    render(<InterviewResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('Scorecard Not Found')).toBeDefined();
      expect(
        screen.getByText('Interview session does not exist'),
      ).toBeDefined();
    });
  });
});
