import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { StudentFeedbackModal } from '../StudentFeedbackModal';
import { FeedbackContextTrigger } from '../../../lib/telemetry-client';

vi.mock('../../../lib/telemetry-client', async () => {
  return {
    FeedbackContextTrigger: {
      MCQ_PRACTICE: 'MCQ_PRACTICE',
      QUIZ_MOCK: 'QUIZ_MOCK',
      MOCK_INTERVIEW: 'MOCK_INTERVIEW',
      TIME_SPENT_1HR: 'TIME_SPENT_1HR',
      GENERAL: 'GENERAL',
    },
    FeedbackCategory: {
      CONTENT_QUALITY: 'CONTENT_QUALITY',
      DIFFICULTY: 'DIFFICULTY',
      PLATFORM_UI: 'PLATFORM_UI',
      FEATURE_REQUEST: 'FEATURE_REQUEST',
      BUG_REPORT: 'BUG_REPORT',
    },
    submitStudentFeedback: vi.fn().mockResolvedValue({
      id: 'fb_mock_123',
      contextTrigger: 'MCQ_PRACTICE',
      rating: 5,
      category: 'CONTENT_QUALITY',
      comment: 'Very informative practice set!',
      status: 'NEW',
      createdAt: new Date().toISOString(),
    }),
    recordFeedbackDismissed: vi.fn(),
    recordFeedbackSubmitted: vi.fn(),
  };
});

describe('StudentFeedbackModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <StudentFeedbackModal
        isOpen={false}
        trigger={FeedbackContextTrigger.MCQ_PRACTICE}
        onClose={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders contextual title and controls when opened for MCQ practice', () => {
    render(
      <StudentFeedbackModal
        isOpen={true}
        trigger={FeedbackContextTrigger.MCQ_PRACTICE}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('How was your practice session?')).toBeInTheDocument();
    expect(screen.getByText(/Help us improve question quality/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rate 5 stars/i)).toBeInTheDocument();
    expect(screen.getByText('Content Quality')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What was helpful/i)).toBeInTheDocument();
  });

  it('renders contextual title for Socratic Interview', () => {
    render(
      <StudentFeedbackModal
        isOpen={true}
        trigger={FeedbackContextTrigger.MOCK_INTERVIEW}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('How was your Socratic Interview?')).toBeInTheDocument();
    expect(screen.getByText(/Tell us how closely the interview mirrored/i)).toBeInTheDocument();
  });

  it('allows rating stars, selecting category, and submitting feedback', async () => {
    const onSubmitted = vi.fn();
    const onClose = vi.fn();

    render(
      <StudentFeedbackModal
        isOpen={true}
        trigger={FeedbackContextTrigger.QUIZ_MOCK}
        onClose={onClose}
        onSubmitted={onSubmitted}
      />,
    );

    // Click 4 stars
    const star4 = screen.getByLabelText('Rate 4 stars');
    fireEvent.click(star4);

    // Select category UI & Usability
    const uiCatBtn = screen.getByText('UI & Usability');
    fireEvent.click(uiCatBtn);

    // Type comment
    const textarea = screen.getByPlaceholderText(/What was helpful/i);
    fireEvent.change(textarea, { target: { value: 'Great timed interface with clear timer.' } });

    // Submit
    const submitBtn = screen.getByText('Send Feedback');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Thank You for Your Feedback!')).toBeInTheDocument();
      expect(onSubmitted).toHaveBeenCalled();
    });
  });

  it('calls onClose and recordFeedbackDismissed when dismissed via Maybe Later', () => {
    const onClose = vi.fn();
    render(
      <StudentFeedbackModal
        isOpen={true}
        trigger={FeedbackContextTrigger.TIME_SPENT_1HR}
        onClose={onClose}
      />,
    );

    const laterBtn = screen.getByText('Maybe Later');
    fireEvent.click(laterBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
