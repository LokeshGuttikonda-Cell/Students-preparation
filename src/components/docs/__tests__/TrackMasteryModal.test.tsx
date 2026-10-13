import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrackMasteryModal } from '../TrackMasteryModal';
import { getDocTrack } from '../../../lib/docs-catalog';

describe('TrackMasteryModal Component', () => {
  const dsaTrack = getDocTrack('dsa')!;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('does not render dialog when isOpen is false', () => {
    render(
      <TrackMasteryModal
        track={dsaTrack}
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders track title, timer, and question palette when isOpen is true', () => {
    render(
      <TrackMasteryModal
        track={dsaTrack}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/Mastery Assessment/i);
    expect(screen.getByText(/Time Remaining/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Submit Assessment/i })).toBeDefined();
  });

  it('navigates between questions using Next and Previous buttons', () => {
    render(
      <TrackMasteryModal
        track={dsaTrack}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/Question 1 of/i)).toBeDefined();
    const nextBtn = screen.getByRole('button', { name: /Next →/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText(/Question 2 of/i)).toBeDefined();
    const prevBtn = screen.getByRole('button', { name: /← Previous/i });
    fireEvent.click(prevBtn);

    expect(screen.getByText(/Question 1 of/i)).toBeDefined();
  });

  it('allows selecting an answer option and enables submit button', () => {
    render(
      <TrackMasteryModal
        track={dsaTrack}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Submit Assessment/i });
    expect(submitBtn.hasAttribute('disabled')).toBe(true);

    // Click first option
    const options = screen.getAllByRole('button').filter(b =>
      b.className.includes('text-left')
    );
    expect(options.length).toBeGreaterThanOrEqual(4);
    fireEvent.click(options[0]);

    // Submit button should now be enabled
    expect(submitBtn.hasAttribute('disabled')).toBe(false);
  });

  it('submits exam and displays score summary and answer review', () => {
    const handleMasteryAchieved = vi.fn();
    render(
      <TrackMasteryModal
        track={dsaTrack}
        isOpen={true}
        onClose={vi.fn()}
        onMasteryAchieved={handleMasteryAchieved}
      />
    );

    // Answer question 1
    const options = screen.getAllByRole('button').filter(b =>
      b.className.includes('text-left')
    );
    fireEvent.click(options[0]);

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Submit Assessment/i });
    fireEvent.click(submitBtn);

    // Result card appears
    expect(screen.getByText(/Detailed Answer Review/i)).toBeDefined();
    expect(screen.getByText(/Final Score/i)).toBeDefined();
    expect(screen.getAllByText(/Architectural Rationale/i).length).toBeGreaterThanOrEqual(1);

    // Done button closes modal
    const doneBtn = screen.getByRole('button', { name: /Done/i });
    expect(doneBtn).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <TrackMasteryModal
        track={dsaTrack}
        isOpen={true}
        onClose={handleClose}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /Close dialog/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('allows student to claim verified track credential upon scoring >= 75%', () => {
    render(
      <TrackMasteryModal
        track={dsaTrack}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    // Extract correct answers across all questions in dsaTrack
    const allQList: Array<{ options: string[]; correctIndex: number }> = [];
    for (const mod of dsaTrack.modules) {
      for (const t of mod.topics) {
        for (const mcq of t.practiceMcqs || []) {
          allQList.push(mcq);
        }
      }
    }

    const questionButtons = screen.getAllByLabelText(/Jump to question/i);
    expect(questionButtons.length).toBe(allQList.length);

    for (let i = 0; i < questionButtons.length; i++) {
      fireEvent.click(questionButtons[i]);
      const targetMcq = allQList[i];
      const correctText = targetMcq.options[targetMcq.correctIndex];
      const correctOptionEl = screen.getByText(correctText);
      fireEvent.click(correctOptionEl);
    }

    const submitBtn = screen.getByRole('button', { name: /Submit Assessment/i });
    fireEvent.click(submitBtn);

    // Score is 100%, passed is true
    expect(screen.getByText(/Track Mastery Verified!/i)).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    const claimBtn = screen.getByRole('button', { name: /Claim Verified Track Credential/i });
    expect(claimBtn).toBeInTheDocument();

    fireEvent.click(claimBtn);

    expect(screen.getByText(/Verified Track Credential Issued/i)).toBeInTheDocument();
    expect(screen.getByText('Credential Code')).toBeInTheDocument();
    expect(screen.getByText('DISTINCTION')).toBeInTheDocument();

    const stored = localStorage.getItem('studentsprep_track_credentials');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)[0].trackSlug).toBe('dsa');
  });
});
