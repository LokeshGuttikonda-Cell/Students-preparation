import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminCoursesPage from '../(admin)/admin/courses/page';
import * as adminClient from '../../lib/admin-client';
import * as rolesClient from '../../lib/roles-client';

vi.mock('../../lib/admin-client', async () => {
  const actual = await vi.importActual('../../lib/admin-client');
  return {
    ...actual,
    getAdminCourses: vi.fn(),
    getAdminTopics: vi.fn(),
  };
});

vi.mock('../../lib/roles-client', () => ({
  getRoles: vi.fn(),
}));

describe('AdminCoursesPage', () => {
  const mockCourses: adminClient.AdminCourseItem[] = [
    {
      id: 'c_1',
      name: 'AWS Cloud Architecture',
      slug: 'aws-cloud-architecture',
      description: 'Foundations of AWS VPC and EC2',
      level: 'INTERMEDIATE',
      estimatedHours: 12,
      status: 'PUBLISHED',
      orderIndex: 0,
      roleTrack: { id: 'r_1', name: 'Cloud & DevOps', slug: 'cloud-devops' },
      _count: { modules: 4, enrollments: 15 },
      createdAt: '2026-09-02T10:00:00Z',
      updatedAt: '2026-09-02T10:00:00Z',
    },
    {
      id: 'c_2',
      name: 'Core Java & Concurrency',
      slug: 'core-java-concurrency',
      description: 'Multithreading and JVM internals',
      level: 'ADVANCED',
      estimatedHours: 16,
      status: 'DRAFT',
      orderIndex: 1,
      roleTrack: { id: 'r_2', name: 'Java Developer', slug: 'java-developer' },
      _count: { modules: 5, enrollments: 0 },
      createdAt: '2026-09-02T10:00:00Z',
      updatedAt: '2026-09-02T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminClient.getAdminCourses).mockResolvedValue(mockCourses);
    vi.mocked(adminClient.getAdminTopics).mockResolvedValue([]);
    vi.mocked(rolesClient.getRoles).mockResolvedValue([]);
  });

  it('renders courses table with status and module badges', async () => {
    render(<AdminCoursesPage />);

    expect(screen.getByText(/Loading course catalog/i)).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('AWS Cloud Architecture')).toBeDefined();
      expect(screen.getByText('Core Java & Concurrency')).toBeDefined();
      expect(screen.getByText('4 modules')).toBeDefined();
      expect(screen.getByText('5 modules')).toBeDefined();
    });
  });

  it('filters courses dynamically based on search query', async () => {
    const user = userEvent.setup();
    render(<AdminCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('AWS Cloud Architecture')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(/Search by course name/i);
    await user.type(searchInput, 'Java');

    expect(screen.queryByText('AWS Cloud Architecture')).toBeNull();
    expect(screen.getByText('Core Java & Concurrency')).toBeDefined();
  });

  it('opens Create Course modal when clicking + Create Course Track button', async () => {
    const user = userEvent.setup();
    render(<AdminCoursesPage />);

    await waitFor(() => {
      expect(screen.getByText('AWS Cloud Architecture')).toBeDefined();
    });

    const createBtn = screen.getByRole('button', { name: /\+ Create Course Track/i });
    await user.click(createBtn);

    expect(screen.getByText('Create Course Track')).toBeDefined();
    expect(screen.getByPlaceholderText(/e\.g\. AWS Cloud Foundations/i)).toBeDefined();
  });
});
