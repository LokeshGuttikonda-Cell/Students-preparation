import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomMockTestPage from '../(student)/mock-tests/custom/page';
import * as practiceClient from '../../lib/practice-client';
import * as rolesClient from '../../lib/roles-client';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u_1', name: 'Student Tester', email: 'test@example.com' },
  }),
}));

vi.mock('../../lib/practice-client', () => ({
  getPracticeCatalog: vi.fn(),
}));

vi.mock('../../lib/roles-client', () => ({
  getRoles: vi.fn(),
}));

vi.mock('../../lib/mock-test-client', async () => {
  const actual = await vi.importActual('../../lib/mock-test-client');
  return {
    ...actual,
    createCustomMockTest: vi.fn(),
    startMockTestSession: vi.fn(),
  };
});

describe('CustomMockTestPage', () => {
  const mockCatalog: practiceClient.PracticeSubjectWithTopics[] = [
    {
      id: 'sub_1',
      name: 'Cloud Computing',
      slug: 'cloud-computing',
      topics: [
        { id: 'top_aws', name: 'AWS Cloud Services', slug: 'aws-cloud' },
        { id: 'top_azure', name: 'Azure Infrastructure', slug: 'azure-infra' },
      ],
    },
    {
      id: 'sub_2',
      name: 'Programming Languages',
      slug: 'programming',
      topics: [
        { id: 'top_python', name: 'Python Fundamentals', slug: 'python-fund' },
      ],
    },
  ];

  const mockRoles = [
    {
      id: 'r_devops',
      name: 'Cloud & DevOps Engineer',
      slug: 'cloud-devops',
      description: 'Cloud systems',
      targetLevel: 'MID',
      competencies: [],
      competenciesCount: 2,
      mockTestsCount: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(practiceClient.getPracticeCatalog).mockResolvedValue(mockCatalog);
    vi.mocked(rolesClient.getRoles).mockResolvedValue(mockRoles);
  });

  it('renders simulation title, presets, and syllabus topics', async () => {
    render(<CustomMockTestPage />);

    await waitFor(() => {
      expect(screen.getByText('Custom Simulation Generator')).toBeDefined();
      expect(screen.getAllByText('Cloud & DevOps Engineer').length).toBeGreaterThan(0);
      expect(screen.getByText('AWS Cloud Services')).toBeDefined();
      expect(screen.getByText('Python Fundamentals')).toBeDefined();
    });
  });

  it('applies a preset when clicked', async () => {
    const user = userEvent.setup();
    render(<CustomMockTestPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Python Developer').length).toBeGreaterThan(0);
    });

    const pythonPreset = screen.getByRole('button', { name: /Python Developer/i });
    await user.click(pythonPreset);

    // Python preset defaults to 15 Qs and 25m
    expect(screen.getAllByText(/15 Qs/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/25 Minutes/i).length).toBeGreaterThan(0);
  });

  it('selects and clears topics via action buttons', async () => {
    const user = userEvent.setup();
    render(<CustomMockTestPage />);

    await waitFor(() => {
      expect(screen.getByText('AWS Cloud Services')).toBeDefined();
    });

    const clearBtn = screen.getByRole('button', { name: /^Clear$/i });
    await user.click(clearBtn);

    expect(screen.getByText(/0 topics selected/i)).toBeDefined();

    const selectAllBtn = screen.getByRole('button', { name: /^Select All$/i });
    await user.click(selectAllBtn);

    expect(screen.getByText(/3 topics selected/i)).toBeDefined();
  });
});
