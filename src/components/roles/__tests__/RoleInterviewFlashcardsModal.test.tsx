import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RoleInterviewFlashcardsModal,
  extractFlashcardsFromRole,
} from '../RoleInterviewFlashcardsModal';
import { ROLE_HANDBOOKS } from '../../../lib/role-handbooks-data';

describe('RoleInterviewFlashcardsModal Component', () => {
  const mockRole = ROLE_HANDBOOKS[0]; // Cloud Solutions Architect
  const mockOnClose = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('extractFlashcardsFromRole extracts all three types of cards from a role', () => {
    const cards = extractFlashcardsFromRole(mockRole);
    expect(cards.length).toBeGreaterThan(10);

    const hasInvariants = cards.some((c) => c.type === 'INVARIANT');
    const hasTraps = cards.some((c) => c.type === 'TRAP');
    const hasQuestions = cards.some((c) => c.type === 'QUESTION');

    expect(hasInvariants).toBe(true);
    expect(hasTraps).toBe(true);
    expect(hasQuestions).toBe(true);
  });

  it('renders modal with role header, first card title, and front prompt when open', () => {
    render(
      <RoleInterviewFlashcardsModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    expect(
      screen.getByRole('dialog', { name: /Role Technical Interview Flashcards/i }),
    ).toBeInTheDocument();

    expect(screen.getByText('⚡ Rapid-Fire Flashcards')).toBeInTheDocument();
    expect(screen.getAllByText(mockRole.name).length).toBeGreaterThan(0);

    // Initial card side is Question (Front)
    expect(screen.getByText('Side: Question (Front)')).toBeInTheDocument();
    expect(screen.getByText(/Reveal Answer \(Space\)/i)).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <RoleInterviewFlashcardsModal
        role={mockRole}
        isOpen={false}
        onClose={mockOnClose}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('flips between front (question) and back (answer) sides upon click and button trigger', () => {
    render(
      <RoleInterviewFlashcardsModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText('Side: Question (Front)')).toBeInTheDocument();

    // Click the card body to flip
    const cardTrigger = screen.getByLabelText('Flip to answer side');
    fireEvent.click(cardTrigger);

    // Should now show back (answer) side
    expect(screen.getByText('Side: Answer (Back)')).toBeInTheDocument();
    expect(screen.getByText(/Show Question Side/i)).toBeInTheDocument();

    // Click button to flip back to question side
    const flipButton = screen.getByRole('button', { name: /Show Question Side/i });
    fireEvent.click(flipButton);

    expect(screen.getByText('Side: Question (Front)')).toBeInTheDocument();
  });

  it('filters cards by type (Invariants, Traps, Scenarios)', () => {
    render(
      <RoleInterviewFlashcardsModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    // Click Traps filter tab
    const trapsTab = screen.getByRole('button', { name: /Traps \(\d+\)/i });
    fireEvent.click(trapsTab);

    // The badge on the displayed card should be Recruiter Trap
    expect(screen.getByText(/Recruiter Trap/i)).toBeInTheDocument();

    // Click Invariants filter tab
    const invariantsTab = screen.getByRole('button', { name: /Invariants \(\d+\)/i });
    fireEvent.click(invariantsTab);

    // The badge should be Architectural Invariant
    expect(screen.getByText(/Architectural Invariant/i)).toBeInTheDocument();
  });

  it('rates card with confidence level, saves to localStorage, and updates stats', () => {
    render(
      <RoleInterviewFlashcardsModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    // Rate card 1 as Easy (Mastered)
    const easyBtn = screen.getByRole('button', { name: /3: Easy \(Mastered\)/i });
    fireEvent.click(easyBtn);

    // Should update localStorage
    const stored = localStorage.getItem(`studentsprep_role_flashcards_${mockRole.slug}`);
    expect(stored).toBeDefined();
    expect(stored).toContain('EASY');

    // Easy count should be 1
    expect(screen.getByText('Easy: 1')).toBeInTheDocument();
  });

  it('navigates through cards using Previous and Next buttons', () => {
    render(
      <RoleInterviewFlashcardsModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    // Initial is Card 1
    expect(screen.getByText(/Card 1 of \d+/i)).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next Card/i });
    fireEvent.click(nextBtn);

    // Advanced to Card 2
    expect(screen.getByText(/Card 2 of \d+/i)).toBeInTheDocument();

    const prevBtn = screen.getByRole('button', { name: /Previous Card/i });
    fireEvent.click(prevBtn);

    // Back to Card 1
    expect(screen.getByText(/Card 1 of \d+/i)).toBeInTheDocument();
  });

  it('shuffles cards when clicking Shuffle Deck button', () => {
    render(
      <RoleInterviewFlashcardsModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    const shuffleBtn = screen.getByRole('button', { name: /Shuffle Deck/i });
    fireEvent.click(shuffleBtn);

    // Deck still has Card 1 of N
    expect(screen.getByText(/Card 1 of \d+/i)).toBeInTheDocument();
  });

  it('resets ratings when clicking Reset Ratings button', () => {
    render(
      <RoleInterviewFlashcardsModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    // Rate as Easy
    const easyBtn = screen.getByRole('button', { name: /3: Easy \(Mastered\)/i });
    fireEvent.click(easyBtn);
    expect(screen.getByText('Easy: 1')).toBeInTheDocument();

    // Click Reset Ratings
    const resetBtn = screen.getByRole('button', { name: /Reset Ratings/i });
    fireEvent.click(resetBtn);

    // Stats reset to 0
    expect(screen.getByText('Easy: 0')).toBeInTheDocument();
    expect(localStorage.getItem(`studentsprep_role_flashcards_${mockRole.slug}`)).toBeNull();
  });

  it('closes modal when close button is clicked or Escape key pressed', () => {
    render(
      <RoleInterviewFlashcardsModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    // Close button click
    const closeBtn = screen.getByLabelText(/Close flashcards modal/i);
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });
});
