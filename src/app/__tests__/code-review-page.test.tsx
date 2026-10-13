import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CodeReviewPage from '../(student)/code-review/page';
import * as codeReviewClient from '../../lib/code-review-client';

describe('CodeReviewPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the Code Review & PR Anti-Pattern Lab interface and initial PR', () => {
    render(<CodeReviewPage />);

    expect(screen.getByText('Code Review & PR Anti-Pattern Lab')).toBeInTheDocument();
    expect(screen.getByText('Industrial Mode')).toBeInTheDocument();
    expect(screen.getByText('$0.00 Local Compute')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /feat\(payments\): distributed idempotency and merchant auth gateway/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Alex Chen/)).toBeInTheDocument();
  });

  it('switches to a different PR when selected from dropdown', () => {
    render(<CodeReviewPage />);

    const select = screen.getByLabelText(/Pull Request:/i);
    fireEvent.change(select, { target: { value: 'user-feed-service' } });

    expect(
      screen.getByRole('heading', {
        name: /feat\(feed\): timeline feed ranking and author profile aggregator/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Priya Sharma/)).toBeInTheDocument();
  });

  it('reveals Socratic review guidance hints progressively', () => {
    render(<CodeReviewPage />);

    const hintButton = screen.getByRole('button', { name: /Reveal Hint/i });
    expect(hintButton).toBeInTheDocument();

    fireEvent.click(hintButton);
    expect(screen.getByText(/Hint 1:/i)).toBeInTheDocument();

    fireEvent.click(hintButton);
    expect(screen.getByText(/Hint 2:/i)).toBeInTheDocument();
  });

  it('opens inline comment form on line click and adds comment', async () => {
    render(<CodeReviewPage />);

    // Click on a line number (e.g. line 13)
    const lineCells = screen.getAllByTitle('Click to add review comment');
    expect(lineCells.length).toBeGreaterThan(0);

    fireEvent.click(lineCells[12]); // around line 13

    expect(screen.getByText(/Leave Review Comment on Line/i)).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(
      /Describe the issue, potential vulnerability, or recommended pattern/i,
    );
    fireEvent.change(textarea, {
      target: { value: 'Race condition on idempotency key check. Must use SETNX.' },
    });

    const addCommentBtn = screen.getByRole('button', { name: 'Add Comment' });
    fireEvent.click(addCommentBtn);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Race condition on idempotency key check. Must use SETNX.',
        ),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Your Comments')).toBeInTheDocument();
  });

  it('deletes an inline comment when Delete button is clicked', async () => {
    render(<CodeReviewPage />);

    const lineCells = screen.getAllByTitle('Click to add review comment');
    fireEvent.click(lineCells[0]);

    const textarea = screen.getByPlaceholderText(
      /Describe the issue, potential vulnerability, or recommended pattern/i,
    );
    fireEvent.change(textarea, { target: { value: 'Temporary comment to delete' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Comment' }));

    expect(screen.getByText('Temporary comment to delete')).toBeInTheDocument();

    const deleteBtn = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Temporary comment to delete')).not.toBeInTheDocument();
    });
  });

  it('submits review verdict and opens the calibration scorecard modal', async () => {
    const exportPdfSpy = vi
      .spyOn(codeReviewClient, 'exportCodeReviewReportPdf')
      .mockImplementation(() => {});
    const exportMdSpy = vi
      .spyOn(codeReviewClient, 'downloadFile')
      .mockImplementation(() => {});

    render(<CodeReviewPage />);

    // Add a comment to hit a golden flaw
    const lineCells = screen.getAllByTitle('Click to add review comment');
    fireEvent.click(lineCells[12]); // line 13
    const textarea = screen.getByPlaceholderText(
      /Describe the issue, potential vulnerability, or recommended pattern/i,
    );
    fireEvent.change(textarea, {
      target: { value: 'Race condition with redis.get and redis.set' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Comment' }));

    // Select REQUEST_CHANGES (default)
    const summaryInput = screen.getByPlaceholderText(/e\.g\. Please address the concurrency/i);
    fireEvent.change(summaryInput, {
      target: { value: 'Blocking merge until race condition is addressed.' },
    });

    // Submit review
    const submitBtn = screen.getByRole('button', {
      name: /Submit Review & Calibrate Scorecard/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Code Review Calibration Scorecard'),
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Flaw Recall')).toBeInTheDocument();
    expect(screen.getByText('Verdict Accuracy')).toBeInTheDocument();
    expect(screen.getByText(/SPOTTED/)).toBeInTheDocument();

    // Trigger PDF Export
    const pdfBtn = screen.getByRole('button', { name: /Download Audit \(PDF\)/i });
    fireEvent.click(pdfBtn);
    expect(exportPdfSpy).toHaveBeenCalled();

    // Trigger Markdown Export
    const mdBtn = screen.getByRole('button', { name: /Export Markdown/i });
    fireEvent.click(mdBtn);
    expect(exportMdSpy).toHaveBeenCalled();

    // Close Modal
    const closeBtn = screen.getByRole('button', { name: /Close & Return to Code/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Code Review Calibration Scorecard')).not.toBeInTheDocument();
    });
  });
});
