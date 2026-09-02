import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  RoleReadinessRadar,
  CompetencyDimension,
} from '../RoleReadinessRadar';

describe('RoleReadinessRadar Component', () => {
  const multiDimensions: CompetencyDimension[] = [
    { dimension: 'Cloud Architecture', score: 85, target: 70 },
    { dimension: 'DevOps & CI/CD', score: 60, target: 70 },
    { dimension: 'Linux & Scripting', score: 90, target: 70 },
    { dimension: 'Database & SQL', score: 75, target: 70 },
  ];

  const fewDimensions: CompetencyDimension[] = [
    { dimension: 'Python Basics', score: 80, target: 70 },
    { dimension: 'Data Structures', score: 50, target: 70 },
  ];

  it('renders SVG polygons and axis labels for multi-dimensional competencies', () => {
    const { container } = render(
      <RoleReadinessRadar
        dimensions={multiDimensions}
        title="Engineering Competency Radar"
      />,
    );

    expect(screen.getByText('Engineering Competency Radar')).toBeDefined();
    expect(screen.getByText('Multi-Competency Radar')).toBeDefined();

    // Check SVG exists
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();

    // Check dimensions exist in DOM
    expect(screen.getAllByText('Cloud Architecture').length).toBeGreaterThan(0);
    expect(screen.getAllByText('DevOps & CI/CD').length).toBeGreaterThan(0);
    expect(screen.getAllByText('85%').length).toBeGreaterThan(0);
  });

  it('renders fallback comparative bars when fewer than 3 dimensions provided', () => {
    const { container } = render(
      <RoleReadinessRadar
        dimensions={fewDimensions}
        title="Two-Axis Radar"
      />,
    );

    expect(screen.getByText('Two-Axis Radar')).toBeDefined();
    expect(screen.getByText('Python Basics')).toBeDefined();
    expect(screen.getByText('Data Structures')).toBeDefined();

    // SVG should not be rendered in < 3 mode
    const svg = container.querySelector('svg');
    expect(svg).toBeNull();
  });

  it('returns null when dimensions array is empty', () => {
    const { container } = render(<RoleReadinessRadar dimensions={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
