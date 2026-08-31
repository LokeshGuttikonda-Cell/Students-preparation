import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OptionRow } from '../OptionRow';
import { ExplanationCard } from '../ExplanationCard';
import { PracticeHeader } from '../PracticeHeader';

describe('Practice Mode Components', () => {
  describe('OptionRow', () => {
    it('renders label and body with default styling', () => {
      render(<OptionRow label="A" body="Linear Search" state="default" />);
      expect(screen.getByText('A')).toBeDefined();
      expect(screen.getByText('Linear Search')).toBeDefined();
    });

    it('renders correct state with Correct indicator', () => {
      render(<OptionRow label="B" body="Binary Search" state="correct" />);
      expect(screen.getByText('Correct')).toBeDefined();
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('border-success-500');
    });

    it('renders incorrect state with Incorrect indicator', () => {
      render(<OptionRow label="C" body="Bubble Sort" state="incorrect" />);
      expect(screen.getByText('Incorrect')).toBeDefined();
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('border-error-500');
    });

    it('fires onClick when clicked and not disabled', () => {
      const handleClick = vi.fn();
      render(
        <OptionRow
          label="D"
          body="Merge Sort"
          onClick={handleClick}
        />,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('ExplanationCard', () => {
    it('renders explanation content and correct badge', () => {
      render(
        <ExplanationCard
          isCorrect={true}
          explanation="Binary search operates in logarithmic time."
        />,
      );
      expect(screen.getByText('Correct Verdict')).toBeDefined();
      expect(
        screen.getByText('Binary search operates in logarithmic time.'),
      ).toBeDefined();
    });
  });

  describe('PracticeHeader', () => {
    it('renders topic, subject, and question counter', () => {
      const handleExit = vi.fn();
      render(
        <PracticeHeader
          topicName="Data Structures"
          subjectName="Computer Fundamentals"
          currentIndex={2}
          totalQuestions={10}
          onExit={handleExit}
        />,
      );
      expect(screen.getByText('Data Structures')).toBeDefined();
      expect(screen.getByText(/3/)).toBeDefined();
      expect(screen.getByText(/\/ 10/)).toBeDefined();
      fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
      expect(handleExit).toHaveBeenCalledTimes(1);
    });
  });
});
