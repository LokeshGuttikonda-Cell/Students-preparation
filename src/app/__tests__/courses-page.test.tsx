import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoursesCatalogPage from '../(student)/courses/page';
import * as coursesClient from '../../lib/courses-client';

vi.mock('../../lib/courses-client', () => ({
  getCourses: vi.fn(),
}));

const mockCoursesData: coursesClient.CourseTrackItem[] = [
  {
    id: 'c_aws',
    name: 'AWS Cloud Foundations & Architecture',
    slug: 'aws-cloud-foundations',
    description: 'Master core AWS infrastructure concepts, patterns, VPCs, and storage services.',
    level: 'BEGINNER',
    estimatedHours: 12,
    orderIndex: 0,
    modulesCount: 3,
    roleTrack: {
      id: 'r_devops',
      name: 'Cloud & DevOps Engineer',
      slug: 'cloud-devops',
    },
  },
  {
    id: 'c_java',
    name: 'Core Java, Concurrency & Backend Systems',
    slug: 'core-java-concurrency',
    description: 'Deep dive into modern Java 21, JVM memory models, thread pools, and object-oriented architecture.',
    level: 'INTERMEDIATE',
    estimatedHours: 20,
    orderIndex: 1,
    modulesCount: 5,
    roleTrack: {
      id: 'r_java',
      name: 'Java Backend Developer',
      slug: 'java-backend',
    },
  },
];

describe('CoursesCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading, breadcrumbs, and loaded course cards', async () => {
    vi.mocked(coursesClient.getCourses).mockResolvedValue(mockCoursesData);

    render(<CoursesCatalogPage />);

    expect(screen.getByText(/Loading curriculum pathways/i)).toBeDefined();

    await waitFor(() => {
      expect(
        screen.getByText('Technology Courses & Learning Pathways'),
      ).toBeDefined();
      expect(
        screen.getByText('AWS Cloud Foundations & Architecture'),
      ).toBeDefined();
      expect(
        screen.getByText('Core Java, Concurrency & Backend Systems'),
      ).toBeDefined();
    });
  });

  it('filters courses via search input', async () => {
    const user = userEvent.setup();
    vi.mocked(coursesClient.getCourses).mockResolvedValue(mockCoursesData);

    render(<CoursesCatalogPage />);

    await waitFor(() => {
      expect(
        screen.getByText('AWS Cloud Foundations & Architecture'),
      ).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText(
      /Search by course name, topic, or engineering domain/i,
    );
    await user.type(searchInput, 'Java');

    expect(
      screen.getByText('Core Java, Concurrency & Backend Systems'),
    ).toBeDefined();
    expect(
      screen.queryByText('AWS Cloud Foundations & Architecture'),
    ).toBeNull();
  });

  it('handles error state gracefully with retry button', async () => {
    vi.mocked(coursesClient.getCourses).mockRejectedValue(
      new Error('Network offline'),
    );

    render(<CoursesCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText('Network offline')).toBeDefined();
      expect(screen.getByRole('button', { name: /Retry Loading/i })).toBeDefined();
    });
  });
});
