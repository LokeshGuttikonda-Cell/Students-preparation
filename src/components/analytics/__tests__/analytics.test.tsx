import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WeakAreaCard } from '../WeakAreaCard';
import { AttemptHistoryTable } from '../AttemptHistoryTable';
import { RoleReadinessWidget } from '../RoleReadinessWidget';
import { CompetencyGapAnalyzer } from '../CompetencyGapAnalyzer';
import type { WeakAreaItem, AttemptHistoryItem } from '../../../lib/analytics-client';

describe('WeakAreaCard', () => {
  const weakTopic: WeakAreaItem = {
    topicId: 'top_1',
    topicName: 'Time and Work',
    topicSlug: 'time-and-work',
    subjectId: 'sub_1',
    subjectName: 'Quantitative Aptitude',
    totalAttempted: 5,
    correctCount: 2,
    incorrectCount: 3,
    accuracy: 40,
    needsRevision: true,
  };

  const strongTopic: WeakAreaItem = {
    topicId: 'top_2',
    topicName: 'Coding-Decoding',
    topicSlug: 'coding-decoding',
    subjectId: 'sub_2',
    subjectName: 'Logical Reasoning',
    totalAttempted: 4,
    correctCount: 4,
    incorrectCount: 0,
    accuracy: 100,
    needsRevision: false,
  };

  it('renders weak area with "Needs Revision" badge and practice button', () => {
    render(<WeakAreaCard item={weakTopic} />);

    expect(screen.getByText('Time and Work')).toBeInTheDocument();
    expect(screen.getByText('Quantitative Aptitude')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('Needs Revision')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Practice Topic/i })).toHaveAttribute(
      'href',
      '/practice/top_1',
    );
  });

  it('renders strong topic with "Proficient" badge', () => {
    render(<WeakAreaCard item={strongTopic} />);

    expect(screen.getByText('Coding-Decoding')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Proficient')).toBeInTheDocument();
  });
});

describe('AttemptHistoryTable', () => {
  const sampleItems: AttemptHistoryItem[] = [
    {
      id: 'att_1',
      attemptType: 'MOCK_TEST',
      status: 'SUBMITTED',
      title: 'TCS Aptitude Mock 1',
      startedAt: '2026-09-01T08:00:00Z',
      submittedAt: '2026-09-01T08:30:00Z',
      score: 18,
      maxScore: 20,
      correctCount: 9,
      incorrectCount: 1,
      unansweredCount: 0,
      accuracy: 90,
      mockTestId: 'mt_1',
      topicId: null,
    },
    {
      id: 'att_2',
      attemptType: 'PRACTICE',
      status: 'IN_PROGRESS',
      title: 'Quantitative - Number Systems',
      startedAt: '2026-09-01T09:00:00Z',
      submittedAt: null,
      score: null,
      maxScore: null,
      correctCount: 3,
      incorrectCount: 1,
      unansweredCount: null,
      accuracy: 75,
      mockTestId: null,
      topicId: 'top_ns',
    },
  ];

  it('renders history table with items and scorecards', () => {
    const onPageChange = vi.fn();
    render(
      <AttemptHistoryTable
        items={sampleItems}
        currentPage={1}
        totalPages={2}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText('TCS Aptitude Mock 1')).toBeInTheDocument();
    expect(screen.getByText('18 / 20')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    const viewButton = screen.getByRole('link', { name: /View Scorecard/i });
    expect(viewButton).toHaveAttribute('href', '/mock-tests/mt_1/results/att_1');

    const resumeButton = screen.getByRole('link', { name: /Resume/i });
    expect(resumeButton).toHaveAttribute('href', '/practice/top_ns');
  });

  it('calls onPageChange when pagination button is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <AttemptHistoryTable
        items={sampleItems}
        currentPage={1}
        totalPages={3}
        onPageChange={onPageChange}
      />,
    );

    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe('RoleReadinessWidget', () => {
  const sampleReadiness = {
    role: {
      id: 'role_devops',
      name: 'Cloud & DevOps Engineer',
      slug: 'cloud-devops',
      description: 'Infrastructure automation',
      targetLevel: 'ENTRY_LEVEL',
    },
    rri: 75,
    readinessTier: 'COMPETITIVE' as const,
    summary: 'Competitive profile for Cloud & DevOps Engineer.',
    competencies: [],
    benchmarkMockTests: [
      {
        id: 'mt_devops',
        title: 'DevOps Benchmark Mock 1',
        slug: 'devops-mock-1',
        durationMinutes: 45,
        questionCount: 15,
      },
    ],
  };

  const sampleRoles = [
    {
      id: 'role_devops',
      name: 'Cloud & DevOps Engineer',
      slug: 'cloud-devops',
      description: null,
      targetLevel: 'ENTRY_LEVEL',
      orderIndex: 0,
      competenciesCount: 2,
      mockTestsCount: 1,
      competencies: [],
    },
    {
      id: 'role_java',
      name: 'Java Backend Developer',
      slug: 'java-backend',
      description: null,
      targetLevel: 'ENTRY_LEVEL',
      orderIndex: 1,
      competenciesCount: 2,
      mockTestsCount: 1,
      competencies: [],
    },
  ];

  it('renders role title, RRI score gauge, and competitive tier badge', () => {
    const onSelectRole = vi.fn();
    const onSaveTarget = vi.fn();

    render(
      <RoleReadinessWidget
        data={sampleReadiness}
        rolesList={sampleRoles}
        selectedRoleId="role_devops"
        userTargetRoleId="role_java"
        onSelectRole={onSelectRole}
        onSaveAsTarget={onSaveTarget}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Cloud & DevOps Engineer' }),
    ).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Competitive Profile')).toBeInTheDocument();
    expect(screen.getByText('Set as My Target Role')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Set as My Target Role'));
    expect(onSaveTarget).toHaveBeenCalledWith('role_devops');

    const select = screen.getByLabelText(/View Role:/i);
    fireEvent.change(select, { target: { value: 'role_java' } });
    expect(onSelectRole).toHaveBeenCalledWith('role_java');

    expect(
      screen.getByText(/Take Benchmark Mock Test/i).closest('a'),
    ).toHaveAttribute('href', '/mock-tests/mt_devops');
  });

  it('displays "Active Target Role" badge when current role matches target', () => {
    render(
      <RoleReadinessWidget
        data={sampleReadiness}
        rolesList={sampleRoles}
        selectedRoleId="role_devops"
        userTargetRoleId="role_devops"
        onSelectRole={vi.fn()}
        onSaveAsTarget={vi.fn()}
      />,
    );

    expect(screen.getByText('★ Active Target Role')).toBeInTheDocument();
  });
});

describe('CompetencyGapAnalyzer', () => {
  const sampleCompetencies = [
    {
      id: 'comp_1',
      topicId: 'top_ci',
      topicName: 'CI/CD Pipelines',
      topicSlug: 'ci-cd',
      subjectId: 'sub_devops',
      subjectName: 'DevOps Systems',
      weightPercentage: 40,
      benchmarkAccuracy: 70,
      studentQuestionsAttempted: 10,
      studentAccuracy: 80,
      coverageRatio: 100,
      gap: 0,
      status: 'READY' as const,
      practiceTopicId: 'top_ci',
    },
    {
      id: 'comp_2',
      topicId: 'top_k8s',
      topicName: 'Kubernetes',
      topicSlug: 'k8s',
      subjectId: 'sub_devops',
      subjectName: 'DevOps Systems',
      weightPercentage: 60,
      benchmarkAccuracy: 75,
      studentQuestionsAttempted: 5,
      studentAccuracy: 40,
      coverageRatio: 53,
      gap: 35,
      status: 'IN_PROGRESS' as const,
      practiceTopicId: 'top_k8s',
    },
  ];

  it('renders topic benchmarks, student accuracies, and deficit badges', () => {
    render(
      <CompetencyGapAnalyzer
        competencies={sampleCompetencies}
        roleName="Cloud & DevOps Engineer"
      />,
    );

    expect(
      screen.getByText('Cloud & DevOps Engineer Competency Gap Analyzer'),
    ).toBeInTheDocument();
    expect(screen.getByText('CI/CD Pipelines')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Cleared')).toBeInTheDocument();

    expect(screen.getByText('Kubernetes')).toBeInTheDocument();
    expect(screen.getAllByText('40%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/-35% Deficit/i)).toBeInTheDocument();

    const practiceButtons = screen.getAllByRole('button', { name: /Practice Topic/i });
    expect(practiceButtons).toHaveLength(2);
    expect(practiceButtons[0].closest('a')).toHaveAttribute('href', '/practice/top_ci');
    expect(practiceButtons[1].closest('a')).toHaveAttribute('href', '/practice/top_k8s');
  });
});
