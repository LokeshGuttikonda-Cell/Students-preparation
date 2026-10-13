import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleInterviewDrillModal } from '../RoleInterviewDrillModal';
import { ROLE_HANDBOOKS } from '../../../lib/role-handbooks-data';

describe('RoleInterviewDrillModal Component', () => {
  const mockRole = ROLE_HANDBOOKS[0]; // Cloud Solutions Architect
  const mockOnClose = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders scenario title, discipline category, and prompt when open', () => {
    render(
      <RoleInterviewDrillModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
        initialQuestionIndex={0}
      />,
    );

    expect(
      screen.getByRole('dialog', { name: /Role Technical Interview Defense Drill/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: new RegExp(`Scenario 1 of ${mockRole.questions.length}`, 'i'),
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(mockRole.questions[0].questionText)).toBeInTheDocument();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(
      <RoleInterviewDrillModal
        role={mockRole}
        isOpen={false}
        onClose={mockOnClose}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('allows candidate to type notes in the defense scratchpad', () => {
    render(
      <RoleInterviewDrillModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
        initialQuestionIndex={0}
      />,
    );

    const textarea = screen.getByLabelText(/Candidate Defense Scratchpad/i);
    fireEvent.change(textarea, {
      target: { value: 'Drafting multi-region failover invariants.' },
    });

    expect(textarea).toHaveValue('Drafting multi-region failover invariants.');
  });

  it('reveals model solution, counter-probes, and pitfalls upon clicking reveal button', () => {
    render(
      <RoleInterviewDrillModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
        initialQuestionIndex={0}
      />,
    );

    // Model solution should not be visible initially
    expect(screen.queryByText(/Model Architectural Solution:/i)).not.toBeInTheDocument();

    // Click Reveal Model Solution
    const revealBtn = screen.getByRole('button', { name: /Reveal Model Solution/i });
    fireEvent.click(revealBtn);

    // Model solution and interviewer counter-probes are now displayed
    expect(screen.getByText(/Model Architectural Solution:/i)).toBeInTheDocument();
    expect(screen.getByText(/Interviewer Counter-Questions & Edge Cases:/i)).toBeInTheDocument();
    expect(screen.getByText(/Candidate Rejection Pitfalls/i)).toBeInTheDocument();
  });

  it('toggles counter-probe checkboxes', () => {
    render(
      <RoleInterviewDrillModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
        initialQuestionIndex={0}
      />,
    );

    // Reveal solution
    fireEvent.click(screen.getByRole('button', { name: /Reveal Model Solution/i }));

    const firstProbe = mockRole.questions[0].counterQuestions[0];
    const probeItem = screen.getByText(new RegExp(`Probe #1: ${firstProbe.slice(0, 20)}`, 'i'));

    // Click on probe row
    fireEvent.click(probeItem);

    expect(screen.getByText(/✓ Defended in design proposal/i)).toBeInTheDocument();
  });

  it('allows self-evaluating scenario as Mastered and updates readiness', () => {
    render(
      <RoleInterviewDrillModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
        initialQuestionIndex={0}
      />,
    );

    // Reveal solution
    fireEvent.click(screen.getByRole('button', { name: /Reveal Model Solution/i }));

    // Click Mastered
    const masteredBtn = screen.getByRole('button', { name: /Mastered/i });
    fireEvent.click(masteredBtn);

    // Readiness pill should show 1 of Total Mastered
    expect(
      screen.getByText(new RegExp(`1/${mockRole.questions.length} Mastered`, 'i')),
    ).toBeInTheDocument();

    // Stored in localStorage
    const stored = localStorage.getItem(`studentsprep_role_drill_${mockRole.slug}`);
    expect(stored).toContain('MASTERED');
  });

  it('navigates between scenarios using Next and Previous buttons', () => {
    render(
      <RoleInterviewDrillModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
        initialQuestionIndex={0}
      />,
    );

    // Click Next Scenario
    const nextBtn = screen.getByRole('button', { name: /Next Scenario/i });
    fireEvent.click(nextBtn);

    // Now on Scenario 2
    expect(
      screen.getByRole('heading', {
        name: new RegExp(`Scenario 2 of ${mockRole.questions.length}`, 'i'),
      }),
    ).toBeInTheDocument();

    // Click Previous Scenario
    const prevBtn = screen.getByRole('button', { name: /Previous Scenario/i });
    fireEvent.click(prevBtn);

    // Back to Scenario 1
    expect(
      screen.getByRole('heading', {
        name: new RegExp(`Scenario 1 of ${mockRole.questions.length}`, 'i'),
      }),
    ).toBeInTheDocument();
  });

  it('resets drill data when clicking Reset Drill Data', () => {
    render(
      <RoleInterviewDrillModal
        role={mockRole}
        isOpen={true}
        onClose={mockOnClose}
        initialQuestionIndex={0}
      />,
    );

    // Reveal and master
    fireEvent.click(screen.getByRole('button', { name: /Reveal Model Solution/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mastered/i }));

    expect(
      screen.getByText(new RegExp(`1/${mockRole.questions.length} Mastered`, 'i')),
    ).toBeInTheDocument();

    // Click Reset
    const resetBtn = screen.getByRole('button', { name: /Reset Drill Data/i });
    fireEvent.click(resetBtn);

    // Back to 0
    expect(
      screen.getByText(new RegExp(`0/${mockRole.questions.length} Mastered`, 'i')),
    ).toBeInTheDocument();
  });
});
