import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionTabs } from '../SectionTabs';
import { TestSectionItem } from '../../../lib/mock-test-client';

describe('Section-Aware Mock Test Runner Components', () => {
  const mockSections: TestSectionItem[] = [
    {
      id: 'sec_1',
      title: 'Quantitative & Logical Aptitude',
      orderIndex: 0,
      durationMinutes: 20,
      cutoffScore: 10,
      questionCount: 10,
    },
    {
      id: 'sec_2',
      title: 'Core Domain Technical',
      orderIndex: 1,
      durationMinutes: 30,
      cutoffScore: 15,
      questionCount: 15,
    },
  ];

  const mockProgress = {
    sec_1: { answered: 5, total: 10, reviewed: 1 },
    sec_2: { answered: 0, total: 15, reviewed: 0 },
  };

  it('renders section titles, duration badges, and progress counts', () => {
    const onSelect = vi.fn();
    render(
      <SectionTabs
        sections={mockSections}
        activeSectionId="sec_1"
        onSelectSection={onSelect}
        sectionProgress={mockProgress}
      />,
    );

    expect(screen.getByText('Quantitative & Logical Aptitude')).toBeDefined();
    expect(screen.getByText('Core Domain Technical')).toBeDefined();
    expect(screen.getByText('20m')).toBeDefined();
    expect(screen.getByText('30m')).toBeDefined();
    expect(screen.getByText('5/10')).toBeDefined();
    expect(screen.getByText('0/15')).toBeDefined();
  });

  it('calls onSelectSection when a section tab is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SectionTabs
        sections={mockSections}
        activeSectionId="sec_1"
        onSelectSection={onSelect}
        sectionProgress={mockProgress}
      />,
    );

    const sec2Tab = screen.getByRole('tab', { name: /Core Domain Technical/i });
    await user.click(sec2Tab);

    expect(onSelect).toHaveBeenCalledWith('sec_2');
  });

  it('returns null when there is 0 or only 1 section', () => {
    const { container } = render(
      <SectionTabs
        sections={[mockSections[0]]}
        activeSectionId="sec_1"
        onSelectSection={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });
});
