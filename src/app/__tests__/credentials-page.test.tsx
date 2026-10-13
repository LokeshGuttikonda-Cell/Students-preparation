import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CredentialsPage from '../(student)/credentials/page';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'stu_1', name: 'Alex Johnson', email: 'alex@example.com' },
    isAuthenticated: true,
  }),
}));

const mockCredential = {
  id: 'cred_1',
  credentialCode: 'CRED-CLOU-12345678',
  title: 'Cloud & DevOps Engineer Readiness Credential',
  grade: 'DISTINCTION' as const,
  compositeScore: 92,
  mockTestScore: 90,
  interviewScore: 94,
  verificationHash: 'sha256_mock_hash_value',
  competencies: ['CI/CD Pipelines', 'Kubernetes Architecture'],
  issuedAt: '2026-09-02T10:00:00.000Z',
  roleTrack: {
    id: 'r_devops',
    name: 'Cloud & DevOps Engineer',
    slug: 'cloud-devops-engineer',
  },
};

const mockMilestones = [
  {
    roleTrackId: 'r_devops',
    roleName: 'Cloud & DevOps Engineer',
    roleSlug: 'cloud-devops-engineer',
    mockTestCleared: true,
    bestMockScore: 90,
    interviewCleared: true,
    bestInterviewScore: 94,
    isEligible: true,
    credential: mockCredential,
  },
  {
    roleTrackId: 'r_python',
    roleName: 'Python Developer',
    roleSlug: 'python-developer',
    mockTestCleared: true,
    bestMockScore: 85,
    interviewCleared: true,
    bestInterviewScore: 82,
    isEligible: true,
    credential: null,
  },
];

describe('CredentialsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/v1/credentials/milestones')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMilestones),
        });
      }
      if (url.includes('/api/v1/credentials/claim')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 'cred_python_new',
              credentialCode: 'CRED-PYTH-87654321',
              title: 'Python Developer Readiness Credential',
              grade: 'MERIT',
              compositeScore: 83.5,
              mockTestScore: 85,
              interviewScore: 82,
              verificationHash: 'pyth_hash',
              competencies: ['Concurrency', 'AsyncIO'],
              issuedAt: '2026-09-03T10:00:00.000Z',
              roleTrack: {
                id: 'r_python',
                name: 'Python Developer',
                slug: 'python-developer',
              },
            }),
        });
      }
      if (url.includes('/api/v1/credentials')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockCredential]),
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders title, milestones, and existing credentials', async () => {
    render(<CredentialsPage />);

    expect(
      screen.getByText('Skill Mastery Credentials & Certifications'),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('Cloud & DevOps Engineer Readiness Credential'),
      ).toBeInTheDocument();
      expect(screen.getByText('ID: CRED-CLOU-12345678')).toBeInTheDocument();
      expect(screen.getByText('92%')).toBeInTheDocument();
    });
  });

  it('allows claiming eligible credential and opens certificate modal', async () => {
    render(<CredentialsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Claim Credential/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Claim Credential/i));

    await waitFor(() => {
      expect(
        screen.getByText(/Congratulations! Your "Python Developer Readiness Credential"/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Official Credential of Competency'),
      ).toBeInTheDocument();
    });
  });

  it('opens certificate modal when clicking View Certificate', async () => {
    render(<CredentialsPage />);

    await waitFor(() => {
      const viewButtons = screen.getAllByText(/View Certificate/i);
      expect(viewButtons.length).toBeGreaterThan(0);
      fireEvent.click(viewButtons[0]);
    });

    expect(
      screen.getByText('Autonomous Technical Assessment Authority'),
    ).toBeInTheDocument();
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
  });

  it('copies public verification link to clipboard when clicking Copy Link', async () => {
    render(<CredentialsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Copy Link/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Copy Link/i));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/verify/CRED-CLOU-12345678'),
      );
      expect(screen.getByText(/Link Copied!/i)).toBeInTheDocument();
    });
  });
});
