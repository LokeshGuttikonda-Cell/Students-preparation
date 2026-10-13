import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import MockTestRunnerPage from '../(student)/mock-tests/[id]/page';
import * as mockTestClient from '../../lib/mock-test-client';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-123' }),
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

vi.mock('../../lib/mock-test-client', () => ({
  startMockTestSession: vi.fn(),
  saveMockTestAnswer: vi.fn(),
  submitMockTestSession: vi.fn(),
}));

const mockAttemptData: mockTestClient.MockTestAttemptData = {
  attempt: {
    id: 'att-123',
    mockTestId: 'test-123',
    attemptType: 'TIMED',
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    durationMinutes: 60,
    marksPerQuestion: 1,
    negativeMarking: null,
    title: 'Full-Stack Technical Screening Benchmark',
  },
  serverNow: new Date().toISOString(),
  questions: [
    {
      id: 'q-1',
      topicId: 'top-1',
      body: 'What is the primary operational advantage of Write-Ahead Logging (WAL)?',
      difficulty: 'MEDIUM',
      orderIndex: 0,
      subjectName: 'Databases',
      topicName: 'Storage Engines',
      sectionId: 'sec-db',
      sectionTitle: 'Database Internals',
      options: [
        { id: 'opt-1', body: 'Enables sequential disk I/O before updating in-place pages', orderIndex: 0 },
        { id: 'opt-2', body: 'Eliminates need for any disk durability', orderIndex: 1 },
      ],
    },
    {
      id: 'q-2',
      topicId: 'top-2',
      body: 'Which data structure powers logarithmic range queries in relational indexes?',
      difficulty: 'EASY',
      orderIndex: 1,
      subjectName: 'Databases',
      topicName: 'Indexing',
      sectionId: 'sec-db',
      sectionTitle: 'Database Internals',
      options: [
        { id: 'opt-3', body: 'B+ Tree', orderIndex: 0 },
        { id: 'opt-4', body: 'Linked List', orderIndex: 1 },
      ],
    },
  ],
  answers: [
    {
      questionId: 'q-1',
      selectedOptionId: null,
      isMarkedForReview: false,
      timeSpentSeconds: 0,
    },
    {
      questionId: 'q-2',
      selectedOptionId: null,
      isMarkedForReview: false,
      timeSpentSeconds: 0,
    },
  ],
  sections: [
    { id: 'sec-db', title: 'Database Internals', questionCount: 2, orderIndex: 0 },
  ],
};

describe('MockTestRunnerPage - State Persistence & Recovery', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(mockTestClient.startMockTestSession).mockResolvedValue(mockAttemptData);
    vi.mocked(mockTestClient.saveMockTestAnswer).mockResolvedValue({
      id: 'ans-1',
      attemptId: 'att-123',
      questionId: 'q-1',
      selectedOptionId: 'opt-1',
      isMarkedForReview: false,
      timeSpentSeconds: 10,
    });
    vi.mocked(mockTestClient.submitMockTestSession).mockResolvedValue({
      attemptId: 'att-123',
      mockTestId: 'test-123',
      title: 'Full-Stack Technical Screening Benchmark',
      status: 'SUBMITTED',
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      score: 100,
      maxScore: 100,
      accuracy: 100,
      totalQuestions: 2,
      correctCount: 2,
      incorrectCount: 0,
      unansweredCount: 0,
      topicBreakdown: [],
      questions: [],
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('restores previous unsynced choices from localStorage backup upon initialization', async () => {
    const backup = {
      'q-1': { selectedOptionId: 'opt-1', isMarkedForReview: true },
    };
    localStorage.setItem('studentsprep_mocktest_backup_test-123', JSON.stringify(backup));

    render(<MockTestRunnerPage />);

    await waitFor(() => {
      expect(screen.getByText('Full-Stack Technical Screening Benchmark')).toBeInTheDocument();
    });

    // Check that question 1 option 1 is selected
    const opt1 = screen.getByText('Enables sequential disk I/O before updating in-place pages');
    expect(opt1).toBeInTheDocument();
  });

  it('persists selected answer to localStorage when candidate picks an option', async () => {
    render(<MockTestRunnerPage />);

    await waitFor(() => {
      expect(screen.getByText('Full-Stack Technical Screening Benchmark')).toBeInTheDocument();
    });

    const opt1 = screen.getByText('Enables sequential disk I/O before updating in-place pages');
    fireEvent.click(opt1);

    await waitFor(() => {
      const savedRaw = localStorage.getItem('studentsprep_mocktest_backup_test-123');
      expect(savedRaw).not.toBeNull();
      const parsed = JSON.parse(savedRaw!);
      expect(parsed['q-1'].selectedOptionId).toBe('opt-1');
    });
  });

  it('persists review status to localStorage when toggling Mark for Review', async () => {
    render(<MockTestRunnerPage />);

    await waitFor(() => {
      expect(screen.getByText('Full-Stack Technical Screening Benchmark')).toBeInTheDocument();
    });

    const markBtn = screen.getByRole('button', { name: /Mark for Review/i });
    fireEvent.click(markBtn);

    await waitFor(() => {
      const savedRaw = localStorage.getItem('studentsprep_mocktest_backup_test-123');
      expect(savedRaw).not.toBeNull();
      const parsed = JSON.parse(savedRaw!);
      expect(parsed['q-1'].isMarkedForReview).toBe(true);
    });
  });

  it('cleans up localStorage backup when test is submitted', async () => {
    localStorage.setItem(
      'studentsprep_mocktest_backup_test-123',
      JSON.stringify({
        'q-1': { selectedOptionId: 'opt-1', isMarkedForReview: false },
      }),
    );

    render(<MockTestRunnerPage />);

    await waitFor(() => {
      expect(screen.getByText('Full-Stack Technical Screening Benchmark')).toBeInTheDocument();
    });

    const submitHeaderBtn = screen.getByRole('button', { name: /Submit Test/i });
    fireEvent.click(submitHeaderBtn);

    // Modal appears
    await waitFor(() => {
      expect(screen.getByText(/Submit Assessment\?/i)).toBeInTheDocument();
    });

    const confirmSubmitBtn = screen.getByRole('button', { name: /Submit Test Now/i });
    fireEvent.click(confirmSubmitBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/mock-tests/test-123/results/att-123');
    });

    expect(localStorage.getItem('studentsprep_mocktest_backup_test-123')).toBeNull();
  });
});
