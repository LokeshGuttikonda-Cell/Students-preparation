import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocsFlashcardsModal } from '../DocsFlashcardsModal';

describe('DocsFlashcardsModal Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DocsFlashcardsModal isOpen={false} onClose={onCloseMock} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal title, progress indicator, and initial card when isOpen is true', () => {
    render(<DocsFlashcardsModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText('Architectural Invariants & Gotchas Flashcards')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All Cards/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Languages/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /CS Specializations/i })).toBeInTheDocument();
    expect(screen.getByText(/Press Space to flip/i)).toBeInTheDocument();
  });

  it('flips card to reveal invariant solution on click and allows rating', () => {
    render(<DocsFlashcardsModal isOpen={true} onClose={onCloseMock} />);

    const flipCard = screen.getByText(/Press Space to flip/i).closest('div[class*="rounded-2xl"]');
    expect(flipCard).not.toBeNull();

    fireEvent.click(flipCard!);

    expect(screen.getByText(/Architectural Invariant \/ Solution/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🔄 Again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⚡ Easy/i })).toBeInTheDocument();

    // Click rating button
    const easyBtn = screen.getByRole('button', { name: /⚡ Easy/i });
    fireEvent.click(easyBtn);

    // Progress saved to localStorage
    const stored = localStorage.getItem('studentsprep_flashcard_reviews');
    expect(stored).toBeTruthy();
  });

  it('navigates through cards using Next and Previous buttons', () => {
    render(<DocsFlashcardsModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText((_, el) => el?.tagName === 'SPAN' && /Card\s+1\s+of/i.test(el?.textContent || ''))).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next →/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText((_, el) => el?.tagName === 'SPAN' && /Card\s+2\s+of/i.test(el?.textContent || ''))).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /← Previous/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText((_, el) => el?.tagName === 'SPAN' && /Card\s+1\s+of/i.test(el?.textContent || ''))).toBeInTheDocument();
  });

  it('filters cards when selecting category tabs', () => {
    render(<DocsFlashcardsModal isOpen={true} onClose={onCloseMock} />);

    const csBtn = screen.getByRole('button', { name: /CS Specializations/i });
    fireEvent.click(csBtn);

    expect(screen.getByText((_, el) => el?.tagName === 'SPAN' && /Card\s+1\s+of/i.test(el?.textContent || ''))).toBeInTheDocument();
  });

  it('closes on close button click and on Escape key', () => {
    render(<DocsFlashcardsModal isOpen={true} onClose={onCloseMock} />);

    const closeBtn = screen.getByLabelText('Close flashcards modal');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });
});
