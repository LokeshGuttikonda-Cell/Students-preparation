import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RolesCatalogPage from '../(student)/roles/page';
import * as rolesClient from '../../lib/roles-client';

vi.mock('../../lib/roles-client', () => ({
  getRoles: vi.fn(),
}));

const mockRolesData: rolesClient.RoleTrackItem[] = [
  {
    id: 'role_devops',
    name: 'Cloud & DevOps Engineer',
    slug: 'cloud-devops-engineer',
    description: 'Infrastructure automation, Linux, and Kubernetes.',
    targetLevel: 'ENTRY_LEVEL',
    competenciesCount: 2,
    mockTestsCount: 1,
    competencies: [
      {
        id: 'c1',
        topicId: 't1',
        topicName: 'DBMS Basics',
        topicSlug: 'dbms-basics',
        subjectId: 's1',
        subjectName: 'CS',
        weightPercentage: 50,
        benchmarkAccuracy: 65,
      },
    ],
  },
  {
    id: 'role_java',
    name: 'Java Backend Developer',
    slug: 'java-backend-developer',
    description: 'Core Java, Spring Boot, and relational databases.',
    targetLevel: 'ENTRY_LEVEL',
    competenciesCount: 3,
    mockTestsCount: 2,
    competencies: [
      {
        id: 'c2',
        topicId: 't2',
        topicName: 'Data Structures',
        topicSlug: 'data-structures',
        subjectId: 's1',
        subjectName: 'CS',
        weightPercentage: 50,
        benchmarkAccuracy: 70,
      },
    ],
  },
];

describe('RolesCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders roles catalog list when API resolves successfully', async () => {
    vi.mocked(rolesClient.getRoles).mockResolvedValue(mockRolesData);

    render(<RolesCatalogPage />);

    // Wait for loading to finish and roles to render
    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
      expect(screen.getByText('Java Backend Developer')).toBeDefined();
    });

    expect(screen.getByText(/Showing/)).toBeDefined();
    expect(screen.getByText(/Career Profiles/)).toBeDefined();
  });

  it('filters roles dynamically based on search input', async () => {
    vi.mocked(rolesClient.getRoles).mockResolvedValue(mockRolesData);

    render(<RolesCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Search by role, skill, or topic/i);
    await userEvent.type(searchInput, 'DevOps');

    // DevOps should remain; Java should be filtered out
    expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
    expect(screen.queryByText('Java Backend Developer')).toBeNull();
  });

  it('renders error banner when API fetch fails', async () => {
    vi.mocked(rolesClient.getRoles).mockRejectedValue(new Error('Network offline'));

    render(<RolesCatalogPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText('Network offline')).toBeDefined();
    });
  });
});
