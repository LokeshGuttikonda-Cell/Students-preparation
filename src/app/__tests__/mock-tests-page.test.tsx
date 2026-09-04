import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import MockTestsCatalogPage from '../(student)/mock-tests/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', email: 'test@platform.edu', role: 'STUDENT' },
  }),
}));

vi.mock('../../lib/mock-test-client', () => ({
  getMockTestsCatalog: vi.fn().mockResolvedValue([
    {
      id: 'mock-1',
      slug: 'general-aptitude-mock-1',
      title: 'General Aptitude Mock Test',
      description: 'Quantitative and logical screening.',
      durationMinutes: 30,
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      questionCount: 10,
    },
    {
      id: 'mock-2',
      slug: 'aws-cloud-mock-test',
      title: 'AWS Cloud Solutions Architect Assessment',
      description: 'VPC and IAM screening assessment.',
      durationMinutes: 45,
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      questionCount: 12,
    },
    {
      id: 'mock-3',
      slug: 'java-backend-mock-test',
      title: 'Java Enterprise Backend Technical Exam',
      description: 'Java concurrency and relational transactions.',
      durationMinutes: 45,
      marksPerQuestion: 1,
      negativeMarking: 0.25,
      questionCount: 15,
    },
  ]),
  startMockTestSession: vi.fn().mockResolvedValue({
    attempt: { id: 'att-123' },
  }),
}));

describe('MockTestsCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all mock assessments and summary counters', async () => {
    render(<MockTestsCatalogPage />);

    expect(screen.getByText('Timed Mock Assessments')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('General Aptitude Mock Test')).toBeInTheDocument();
      expect(screen.getByText('AWS Cloud Solutions Architect Assessment')).toBeInTheDocument();
      expect(screen.getByText('Java Enterprise Backend Technical Exam')).toBeInTheDocument();
    });

    expect(screen.getByText(/Showing 3 of 3 assessments/i)).toBeInTheDocument();
  });

  it('filters assessments dynamically based on search keyword', async () => {
    render(<MockTestsCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText('General Aptitude Mock Test')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search assessments by role/i);
    fireEvent.change(searchInput, { target: { value: 'Java' } });

    expect(screen.getByText('Java Enterprise Backend Technical Exam')).toBeInTheDocument();
    expect(screen.queryByText('General Aptitude Mock Test')).not.toBeInTheDocument();
    expect(screen.queryByText('AWS Cloud Solutions Architect Assessment')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 1 of 3 assessments/i)).toBeInTheDocument();
  });

  it('filters assessments by category tab chip', async () => {
    render(<MockTestsCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText('AWS Cloud Solutions Architect Assessment')).toBeInTheDocument();
    });

    const cloudChip = screen.getByRole('tab', { name: /Cloud & DevOps/i });
    fireEvent.click(cloudChip);

    expect(screen.getByText('AWS Cloud Solutions Architect Assessment')).toBeInTheDocument();
    expect(screen.queryByText('General Aptitude Mock Test')).not.toBeInTheDocument();
    expect(screen.queryByText('Java Enterprise Backend Technical Exam')).not.toBeInTheDocument();
  });

  it('displays empty state when no test matches and resets filters', async () => {
    render(<MockTestsCatalogPage />);

    await waitFor(() => {
      expect(screen.getByText('General Aptitude Mock Test')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search assessments by role/i);
    fireEvent.change(searchInput, { target: { value: 'NonexistentAssessmentX' } });

    expect(screen.getByText('No mock assessments match your current filters.')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: 'Reset Filters' });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.getByText('General Aptitude Mock Test')).toBeInTheDocument();
      expect(screen.getByText('AWS Cloud Solutions Architect Assessment')).toBeInTheDocument();
    });
  });
});
