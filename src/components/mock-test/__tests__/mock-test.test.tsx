import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { TimerCountdown } from '../TimerCountdown';
import { QuestionPalette } from '../QuestionPalette';
import { SectionTabs } from '../SectionTabs';
import { SubmitConfirmModal } from '../SubmitConfirmModal';

describe('TimerCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders tabular formatted time based on server expiry and server now', () => {
    const serverNow = new Date('2026-08-31T10:00:00.000Z').toISOString();
    const expiresAt = new Date('2026-08-31T10:15:00.000Z').toISOString(); // 15 mins

    render(<TimerCountdown expiresAt={expiresAt} serverNow={serverNow} />);

    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('displays "Time Running Out" warning badge when under 5 minutes', () => {
    const serverNow = new Date('2026-08-31T10:00:00.000Z').toISOString();
    const expiresAt = new Date('2026-08-31T10:04:30.000Z').toISOString(); // 4 mins 30s

    render(<TimerCountdown expiresAt={expiresAt} serverNow={serverNow} />);

    expect(screen.getByText('04:30')).toBeInTheDocument();
    const badge = screen.getByText(/Time Running Out/i);
    expect(badge).toBeInTheDocument();
    expect(badge).not.toHaveClass('animate-pulse');
  });

  it('triggers onExpire callback when timer countdown reaches 0', () => {
    const onExpire = vi.fn();
    const serverNow = new Date('2026-08-31T10:00:00.000Z').toISOString();
    const expiresAt = new Date('2026-08-31T10:00:02.000Z').toISOString(); // 2 seconds

    render(<TimerCountdown expiresAt={expiresAt} serverNow={serverNow} onExpire={onExpire} />);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});

describe('QuestionPalette', () => {
  const sampleQuestions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }, { id: 'q4' }];
  const sampleAnswers = new Map([
    ['q1', { selectedOptionId: 'opt1', isMarkedForReview: false }],
    ['q2', { selectedOptionId: null, isMarkedForReview: true }],
    ['q3', { selectedOptionId: 'opt3', isMarkedForReview: true }],
  ]);

  it('renders question numbers and legend', () => {
    const onSelect = vi.fn();
    render(
      <QuestionPalette
        totalQuestions={4}
        currentIndex={0}
        questions={sampleQuestions}
        answers={sampleAnswers}
        onSelectQuestion={onSelect}
      />,
    );

    expect(screen.getByText('Question Palette')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Question 1: Answered/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Question 2: Marked for Review/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Question 3: Answered and Marked for Review/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Question 4: Unanswered/i })).toBeInTheDocument();
  });

  it('calls onSelectQuestion when a question button is clicked', () => {
    const onSelect = vi.fn();
    render(
      <QuestionPalette
        totalQuestions={4}
        currentIndex={0}
        questions={sampleQuestions}
        answers={sampleAnswers}
        onSelectQuestion={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Question 3/i }));
    expect(onSelect).toHaveBeenCalledWith(2);
  });
});

describe('SubmitConfirmModal', () => {
  it('renders summary counts and calls onConfirm on click', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <SubmitConfirmModal
        isOpen={true}
        totalQuestions={10}
        answeredCount={7}
        unansweredCount={3}
        markedCount={2}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText('Submit Assessment?')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Submit Test Now/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Continue Test/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders sectional breakdown list when sectionsSummary is provided', () => {
    render(
      <SubmitConfirmModal
        isOpen={true}
        totalQuestions={10}
        answeredCount={8}
        unansweredCount={2}
        markedCount={1}
        sectionsSummary={[
          { title: 'Section 1: Fundamentals', answered: 5, total: 5 },
          { title: 'Section 2: Databases', answered: 3, total: 5 },
        ]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText('Sectional Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Section 1: Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('5/5')).toBeInTheDocument();
    expect(screen.getByText('Section 2: Databases')).toBeInTheDocument();
    expect(screen.getByText('3/5')).toBeInTheDocument();
  });
});

describe('SectionTabs Component', () => {
  const sampleSections = [
    {
      id: 'sec_1',
      title: 'Section 1: Quantitative Logic',
      orderIndex: 0,
      questionCount: 5,
    },
    {
      id: 'sec_2',
      title: 'Section 2: Computer Systems',
      orderIndex: 1,
      questionCount: 5,
    },
  ];

  it('renders tab list with section titles and answered counts', () => {
    const onSelect = vi.fn();
    render(
      <SectionTabs
        sections={sampleSections}
        activeSectionId="sec_1"
        onSelectSection={onSelect}
        sectionProgress={{
          sec_1: { answered: 4, total: 5, reviewed: 1 },
          sec_2: { answered: 2, total: 5, reviewed: 0 },
        }}
      />,
    );

    expect(screen.getByRole('tablist')).toBeInTheDocument();

    const tab1 = screen.getByRole('tab', { name: /Section 1: Quantitative Logic/i });
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('4/5')).toBeInTheDocument();

    const tab2 = screen.getByRole('tab', { name: /Section 2: Computer Systems/i });
    expect(tab2).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('2/5')).toBeInTheDocument();

    fireEvent.click(tab2);
    expect(onSelect).toHaveBeenCalledWith('sec_2');
  });

  it('renders nothing when sections has 1 or fewer elements', () => {
    const { container } = render(
      <SectionTabs
        sections={[sampleSections[0]]}
        activeSectionId="sec_1"
        onSelectSection={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe('QuestionPalette with Sections', () => {
  it('groups question buttons under section headers', () => {
    const questions = [
      { id: 'q1', sectionId: 'sec_1' },
      { id: 'q2', sectionId: 'sec_1' },
      { id: 'q3', sectionId: 'sec_2' },
    ];
    const sections = [
      { id: 'sec_1', title: 'Part A: Core Fundamentals' },
      { id: 'sec_2', title: 'Part B: System Architecture' },
    ];

    render(
      <QuestionPalette
        totalQuestions={3}
        currentIndex={0}
        questions={questions}
        sections={sections}
        answers={new Map()}
        onSelectQuestion={vi.fn()}
      />,
    );

    expect(screen.getByText('Part A: Core Fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Part B: System Architecture')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Question/i })).toHaveLength(3);
  });
});
