import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WeakAreaCard } from '../WeakAreaCard';
import { AttemptHistoryTable } from '../AttemptHistoryTable';
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
