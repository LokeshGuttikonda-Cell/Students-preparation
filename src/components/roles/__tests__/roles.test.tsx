import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleCard } from '../RoleCard';
import { RoleCompetencyList } from '../RoleCompetencyList';
import { RoleTrackItem } from '../../../lib/roles-client';

const mockRole: RoleTrackItem = {
  id: 'role_devops',
  name: 'Cloud & DevOps Engineer',
  slug: 'cloud-devops-engineer',
  description: 'Infrastructure automation, Linux, Docker, and Kubernetes.',
  targetLevel: 'ENTRY_LEVEL',
  competenciesCount: 2,
  mockTestsCount: 1,
  competencies: [
    {
      id: 'comp_1',
      topicId: 'top_dsa',
      topicName: 'Data Structures',
      topicSlug: 'data-structures',
      subjectId: 'sub_cs',
      subjectName: 'Computer Fundamentals',
      weightPercentage: 40,
      benchmarkAccuracy: 70,
    },
    {
      id: 'comp_2',
      topicId: 'top_dbms',
      topicName: 'DBMS Basics',
      topicSlug: 'dbms-basics',
      subjectId: 'sub_cs',
      subjectName: 'Computer Fundamentals',
      weightPercentage: 60,
      benchmarkAccuracy: 65,
    },
  ],
};

describe('RoleCard Component', () => {
  it('renders role title, target level, and competencies with weight %', () => {
    render(<RoleCard role={mockRole} />);

    expect(screen.getByText('Cloud & DevOps Engineer')).toBeDefined();
    expect(screen.getByText('Entry Level / Campus')).toBeDefined();
    expect(screen.getByText(/Infrastructure automation/)).toBeDefined();
    expect(screen.getByText('1 Mock Test')).toBeDefined();

    // Verify competency chips
    expect(screen.getByText('Data Structures')).toBeDefined();
    expect(screen.getByText('40%')).toBeDefined();
    expect(screen.getByText('DBMS Basics')).toBeDefined();
    expect(screen.getByText('60%')).toBeDefined();

    // Verify CTA button link
    const link = screen.getByRole('link', { name: /Explore Role Track/i });
    expect(link.getAttribute('href')).toBe('/roles/cloud-devops-engineer');
  });
});

describe('RoleCompetencyList Component', () => {
  it('renders topic competencies, subject names, weights, and practice triggers', () => {
    render(<RoleCompetencyList competencies={mockRole.competencies} />);

    expect(screen.getByText('Evaluated Syllabus Competencies')).toBeDefined();
    expect(screen.getByText('2 Topics Weighted')).toBeDefined();

    // Check individual topic cards
    expect(screen.getByText('Data Structures')).toBeDefined();
    expect(screen.getByText('40% Weight')).toBeDefined();
    expect(screen.getByText('70% Accuracy')).toBeDefined();

    expect(screen.getByText('DBMS Basics')).toBeDefined();
    expect(screen.getByText('60% Weight')).toBeDefined();
    expect(screen.getByText('65% Accuracy')).toBeDefined();

    // Check practice links
    const practiceLinks = screen.getAllByRole('link', { name: /Practice This Topic/i });
    expect(practiceLinks).toHaveLength(2);
    expect(practiceLinks[0].getAttribute('href')).toBe('/practice/top_dsa');
    expect(practiceLinks[1].getAttribute('href')).toBe('/practice/top_dbms');
  });
});
