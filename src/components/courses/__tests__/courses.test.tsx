import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseCard } from '../CourseCard';
import type { CourseTrackItem } from '../../../lib/courses-client';

const mockCourse: CourseTrackItem = {
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
};

describe('CourseCard Component', () => {
  it('renders course title, level badge, estimated hours, and module count', () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText('AWS Cloud Foundations & Architecture')).toBeDefined();
    expect(screen.getByText('Beginner')).toBeDefined();
    expect(screen.getByText('3 Modules')).toBeDefined();
    expect(screen.getByText('~12 Hours')).toBeDefined();
    expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
    expect(
      screen.getByText(/Master core AWS infrastructure concepts/),
    ).toBeDefined();

    // Verify link CTA
    const link = screen.getByRole('link', { name: /Explore Curriculum/i });
    expect(link.getAttribute('href')).toBe('/courses/aws-cloud-foundations');
  });

  it('renders intermediate level styling appropriately', () => {
    const intermediateCourse: CourseTrackItem = {
      ...mockCourse,
      id: 'c_java',
      name: 'Core Java & Concurrency',
      slug: 'core-java-concurrency',
      level: 'INTERMEDIATE',
      estimatedHours: 20,
      modulesCount: 5,
    };

    render(<CourseCard course={intermediateCourse} />);

    expect(screen.getByText('Core Java & Concurrency')).toBeDefined();
    expect(screen.getByText('Intermediate')).toBeDefined();
    expect(screen.getByText('5 Modules')).toBeDefined();
    expect(screen.getByText('~20 Hours')).toBeDefined();
  });
});
