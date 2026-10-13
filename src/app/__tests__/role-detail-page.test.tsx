import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import RoleDetailPage from '../(student)/roles/[slug]/page';

vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'backend-systems-engineer' }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('../../lib/roles-client', () => ({
  getRole: vi.fn().mockResolvedValue({
    id: 'role-backend',
    slug: 'backend-systems-engineer',
    name: 'Backend Systems Engineer',
    description: 'High-throughput distributed systems and data storage engines.',
    targetLevel: 'MID_LEVEL',
    competencies: [
      {
        id: 'comp-1',
        name: 'Database Storage & ACID Transactions',
        level: 'INTERMEDIATE',
        description: 'B+ trees, WAL, and MVCC concurrency.',
      },
    ],
    mockTests: [
      {
        id: 'mock-backend-1',
        title: 'Backend Systems Benchmark Exam',
        durationMinutes: 45,
        marksPerQuestion: 1,
        negativeMarking: 0.25,
      },
    ],
  }),
}));

vi.mock('../../lib/curriculum-client', () => ({
  getArticlesForRole: vi.fn().mockResolvedValue([
    {
      id: 'art-1',
      slug: 'acid-transactions-mvcc-and-isolation-anomalies',
      title: 'ACID Internals: MVCC Read Views, WAL ARIES & Concurrency Anomalies',
      domainName: 'Database Management Systems & Storage',
      level: 'ADVANCED',
      readTimeMinutes: 19,
      summary: 'Explore Multi-Version Concurrency Control (MVCC) row versioning.',
    },
  ]),
}));

vi.mock('../../components/roles/RoleInterviewTrapsSection', () => ({
  RoleInterviewTrapsSection: () => <div data-testid="interview-traps-section">Interview Traps</div>,
}));

describe('RoleDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders role overview and competency details', async () => {
    render(<RoleDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Backend Systems Engineer' })).toBeInTheDocument();
      expect(screen.getByText(/High-throughput distributed systems and data storage engines/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Mid Level (1-3 Yrs)')).toBeInTheDocument();
    expect(screen.getByTestId('interview-traps-section')).toBeInTheDocument();
  });

  it('renders Socratic AI Technical Interview CTA banner', async () => {
    render(<RoleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('AI Technical Scenario Interview')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Launch Interview Room/i })).toBeInTheDocument();
  });

  it('renders curated Knowledge Hub articles and Sandbox launcher', async () => {
    render(<RoleDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('Curated Technical Documentation')).toBeInTheDocument();
      expect(screen.getByText('ACID Internals: MVCC Read Views, WAL ARIES & Concurrency Anomalies')).toBeInTheDocument();
    });

    expect(screen.getByText('Interactive Code & SQL Sandbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open Sandbox/i })).toBeInTheDocument();
  });

  it('renders Rapid Flashcards button and opens the flashcards modal', async () => {
    const { fireEvent } = await import('@testing-library/react');
    render(<RoleDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Rapid Flashcards/i })).toBeInTheDocument();
    });

    // Click Rapid Flashcards
    const flashcardsBtn = screen.getByRole('button', { name: /Rapid Flashcards/i });
    fireEvent.click(flashcardsBtn);

    // Modal dialog is open
    expect(
      screen.getByRole('dialog', { name: /Role Technical Interview Flashcards/i }),
    ).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByLabelText(/Close flashcards modal/i);
    fireEvent.click(closeBtn);

    // Modal closed
    expect(
      screen.queryByRole('dialog', { name: /Role Technical Interview Flashcards/i }),
    ).not.toBeInTheDocument();
  });
});
