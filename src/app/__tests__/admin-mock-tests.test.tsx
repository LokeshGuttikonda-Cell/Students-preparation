import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminMockTestsPage from '../(admin)/admin/mock-tests/page';
import * as adminClient from '../../lib/admin-client';
import * as rolesClient from '../../lib/roles-client';

vi.mock('../../lib/admin-client', async () => {
  const actual = await vi.importActual('../../lib/admin-client');
  return {
    ...actual,
    getAdminMockTests: vi.fn(),
  };
});

vi.mock('../../lib/roles-client', () => ({
  getRoles: vi.fn(),
}));

describe('AdminMockTestsPage', () => {
  const mockTests: adminClient.AdminMockTestItem[] = [
    {
      id: 'mt_1',
      title: 'Cloud & DevOps Screening Simulation',
      slug: 'cloud-devops-simulation',
      description: 'AWS, Azure and Docker technical mock assessment',
      durationMinutes: 60,
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      roleTrackId: 'r_devops',
      status: 'PUBLISHED',
      createdAt: '2026-09-02T10:00:00Z',
      updatedAt: '2026-09-02T10:00:00Z',
      roleTrack: { id: 'r_devops', name: 'Cloud & DevOps', slug: 'cloud-devops' },
      _count: { questions: 30, sections: 3, attempts: 24 },
    },
    {
      id: 'mt_2',
      title: 'Python Developer Technical Benchmark',
      slug: 'python-developer-benchmark',
      description: 'Python syntax, OOP, algorithms and testing',
      durationMinutes: 45,
      marksPerQuestion: 1,
      negativeMarking: null,
      roleTrackId: 'r_python',
      status: 'DRAFT',
      createdAt: '2026-09-02T10:00:00Z',
      updatedAt: '2026-09-02T10:00:00Z',
      roleTrack: { id: 'r_python', name: 'Python Developer', slug: 'python-developer' },
      _count: { questions: 20, sections: 2, attempts: 0 },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminClient.getAdminMockTests).mockResolvedValue(mockTests);
    vi.mocked(rolesClient.getRoles).mockResolvedValue([
      {
        id: 'r_devops',
        name: 'Cloud & DevOps',
        slug: 'cloud-devops',
        description: '',
        targetLevel: '',
        competencies: [],
        competenciesCount: 0,
        mockTestsCount: 0,
      },
    ]);
  });

  it('renders mock tests table with sections count and duration', async () => {
    render(<AdminMockTestsPage />);

    expect(screen.getByText(/Loading mock tests catalog/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Screening Simulation')).toBeDefined();
      expect(screen.getByText('Python Developer Technical Benchmark')).toBeDefined();
      expect(screen.getByText('3 sections')).toBeDefined();
      expect(screen.getByText('2 sections')).toBeDefined();
    });
  });

  it('filters tests dynamically based on search query', async () => {
    const user = userEvent.setup();
    render(<AdminMockTestsPage />);

    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Screening Simulation')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Search by test title/i);
    await user.type(searchInput, 'Python');

    expect(screen.queryByText('Cloud & DevOps Screening Simulation')).toBeNull();
    expect(screen.getByText('Python Developer Technical Benchmark')).toBeDefined();
  });

  it('opens Create Mock Test modal when clicking + Create Mock Test button', async () => {
    const user = userEvent.setup();
    render(<AdminMockTestsPage />);

    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Screening Simulation')).toBeDefined();
    });

    const createBtn = screen.getByRole('button', { name: /\+ Create Mock Test/i });
    await user.click(createBtn);

    expect(screen.getByText('Create Mock Test Assessment')).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. Cloud & DevOps Screening Simulation/i)).toBeDefined();
  });
});
