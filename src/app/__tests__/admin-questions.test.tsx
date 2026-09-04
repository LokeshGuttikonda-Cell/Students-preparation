import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AdminQuestionsPage from '../(admin)/admin/questions/page';

vi.mock('../../lib/admin-client', () => ({
  getAdminQuestions: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'q1',
        body: 'What is the worst-case time complexity of quicksort with naive pivot selection?',
        difficulty: 'MEDIUM',
        status: 'PUBLISHED',
        source: 'ORIGINAL_HUMAN',
        topic: { id: 't1', name: 'Algorithms' },
        author: { name: 'Principal Engineer' },
        options: [{ id: 'opt1', text: 'O(N^2)', isCorrect: true }],
      },
      {
        id: 'q2',
        body: 'Explain how virtual memory paging uses TLB to accelerate address translation.',
        difficulty: 'HARD',
        status: 'IN_REVIEW',
        source: 'ORIGINAL_HUMAN',
        topic: { id: 't2', name: 'Operating Systems' },
        author: { name: 'Systems Architect' },
        options: [{ id: 'opt2', text: 'Page table walk caching', isCorrect: true }],
      },
    ],
    total: 2,
    page: 1,
    pageSize: 50,
  }),
  getAdminTopics: vi.fn().mockResolvedValue([
    { id: 't1', name: 'Algorithms' },
    { id: 't2', name: 'Operating Systems' },
  ]),
}));

describe('AdminQuestionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders question bank review queue and questions table', async () => {
    render(<AdminQuestionsPage />);

    expect(screen.getByText('Review Queue & Question Bank')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/What is the worst-case time complexity/i)).toBeInTheDocument();
      expect(screen.getByText(/Explain how virtual memory paging/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Showing 2 of 2 questions/i)).toBeInTheDocument();
  });

  it('filters questions by keyword search input', async () => {
    render(<AdminQuestionsPage />);

    await waitFor(() => {
      expect(screen.getByText(/What is the worst-case time complexity/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search questions by text/i);
    fireEvent.change(searchInput, { target: { value: 'TLB' } });

    expect(screen.getByText(/Explain how virtual memory paging/i)).toBeInTheDocument();
    expect(screen.queryByText(/What is the worst-case time complexity/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 1 of 2 questions/i)).toBeInTheDocument();
  });

  it('resets search when clicking Clear Filters', async () => {
    render(<AdminQuestionsPage />);

    await waitFor(() => {
      expect(screen.getByText(/What is the worst-case time complexity/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search questions by text/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentPattern' } });

    expect(screen.getByText(/No questions found matching criteria/i)).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(screen.getByText(/What is the worst-case time complexity/i)).toBeInTheDocument();
      expect(screen.getByText(/Explain how virtual memory paging/i)).toBeInTheDocument();
    });
  });
});
