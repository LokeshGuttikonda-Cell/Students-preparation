import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InterviewsHubPage from '../(student)/interviews/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'stu_1', name: 'Test Candidate', email: 'candidate@example.com' },
    isAuthenticated: true,
  }),
}));

const mockRoles = [
  {
    id: 'r_devops',
    name: 'Cloud & DevOps Engineer',
    slug: 'cloud-devops-engineer',
    description: 'CI/CD and Kubernetes role',
    targetLevel: 'MID_LEVEL',
    competenciesCount: 4,
    mockTestsCount: 2,
    competencies: [],
  },
  {
    id: 'r_python',
    name: 'Python Developer',
    slug: 'python-developer',
    description: 'Python backend role',
    targetLevel: 'ENTRY_LEVEL',
    competenciesCount: 3,
    mockTestsCount: 1,
    competencies: [],
  },
];

const mockHistory = {
  items: [
    {
      id: 'sess_1',
      userId: 'stu_1',
      roleTrackId: 'r_devops',
      status: 'COMPLETED' as const,
      currentStage: 'WRAPUP',
      targetDurationMinutes: 20,
      overallScore: 88,
      startedAt: '2026-09-02T10:00:00.000Z',
      completedAt: '2026-09-02T10:20:00.000Z',
      roleTrack: {
        id: 'r_devops',
        name: 'Cloud & DevOps Engineer',
        slug: 'cloud-devops-engineer',
      },
    },
  ],
  totalItems: 1,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

vi.mock('../../lib/roles-client', () => ({
  getRoles: vi.fn().mockImplementation(() => Promise.resolve(mockRoles)),
}));

const mockStartInterviewSession = vi.fn();
vi.mock('../../lib/interview-client', () => ({
  getRoles: vi.fn().mockImplementation(() => Promise.resolve(mockRoles)),
  getUserInterviews: vi.fn().mockImplementation(() => Promise.resolve(mockHistory)),
  startInterviewSession: (...args: unknown[]) => mockStartInterviewSession(...args),
}));

describe('InterviewsHubPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders hero title and role cards', async () => {
    render(<InterviewsHubPage />);

    expect(
      screen.getByText('Socratic AI Technical Interview Simulator'),
    ).toBeDefined();

    await waitFor(() => {
      expect(screen.getAllByText('Cloud & DevOps Engineer').length).toBeGreaterThan(0);
      expect(screen.getByText('Python Developer')).toBeDefined();
    });

    // Verify duration pills
    expect(screen.getByText('15 Minutes')).toBeDefined();
    expect(screen.getByText('20 Minutes')).toBeDefined();
    expect(screen.getByText('30 Minutes')).toBeDefined();

    // Verify historical interviews inside waitFor
    await waitFor(() => {
      expect(screen.getByText('Previous Technical Interviews')).toBeDefined();
      expect(screen.getByText('88%')).toBeDefined();
    });
  });

  it('launches interview session on button click and navigates', async () => {
    mockStartInterviewSession.mockResolvedValueOnce({
      id: 'sess_new_123',
    });

    render(<InterviewsHubPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Cloud & DevOps Engineer').length).toBeGreaterThan(0);
    });

    const launchButton = screen.getByText('Enter Live Interview Room →');
    await waitFor(() => expect(launchButton).not.toBeDisabled());
    fireEvent.click(launchButton);

    await waitFor(() => {
      expect(mockStartInterviewSession).toHaveBeenCalledWith('r_devops', 20);
      expect(mockPush).toHaveBeenCalledWith('/interviews/sess_new_123');
    });
  });
});
