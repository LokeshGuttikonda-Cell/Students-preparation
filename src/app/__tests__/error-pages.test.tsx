import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NotFound from '../not-found';
import GlobalErrorBoundary from '../error';

describe('NotFound Page (404)', () => {
  it('renders 404 badge, heading, and navigation links', () => {
    render(<NotFound />);

    expect(screen.getByText(/404 — Not Found/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /Page Does Not Exist/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /Return Home/i })).toHaveAttribute('href', '/');
  });
});

describe('GlobalErrorBoundary', () => {
  it('renders error alert and executes reset when clicking Try Again', () => {
    const mockReset = vi.fn();
    const testError = new Error('Test application runtime fault');

    render(<GlobalErrorBoundary error={testError} reset={mockReset} />);

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(
      screen.getByText(/An unexpected error occurred while loading this view/i),
    ).toBeInTheDocument();

    const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i });
    fireEvent.click(tryAgainBtn);

    expect(mockReset).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('link', { name: /Return Home/i })).toHaveAttribute('href', '/');
  });
});
