import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiRoleArchitecturalRadar } from '../MultiRoleArchitecturalRadar';

describe('MultiRoleArchitecturalRadar Component', () => {
  it('renders multi-role radar with concentric grid, candidate polygon, and domain axes', () => {
    const { container } = render(
      <MultiRoleArchitecturalRadar
        title="Custom Architectural Radar"
        subtitle="Evaluating core systems domains"
      />,
    );

    expect(screen.getByText('Custom Architectural Radar')).toBeInTheDocument();
    expect(screen.getByText('Evaluating core systems domains')).toBeInTheDocument();
    expect(screen.getByText('Multi-Layer Comparative Radar')).toBeInTheDocument();

    const svg = container.querySelector('svg[aria-label="Multi-Role Architectural Radar Chart"]');
    expect(svg).toBeInTheDocument();

    // Check domain axis labels exist
    expect(screen.getAllByText('Distributed Systems').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('OS & Concurrency').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Storage & DB').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Networking').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cloud & Infra').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SRE & Observability').length).toBeGreaterThanOrEqual(1);
  });

  it('allows selecting domain axis to update domain deep-dive card and CTA', () => {
    render(<MultiRoleArchitecturalRadar />);

    // By default, first domain (Distributed Systems & Consensus) is inspected
    expect(screen.getByText('Distributed Systems & Consensus')).toBeInTheDocument();
    expect(screen.getByText('Practice Distributed Systems →')).toBeInTheDocument();

    // Click on "Storage & DB" domain axis text or button
    const storageButtons = screen.getAllByRole('button', { name: /Database Engines & Storage/i });
    expect(storageButtons.length).toBeGreaterThan(0);
    fireEvent.click(storageButtons[0]);

    // Deep dive updates to Database Engines & Storage
    expect(screen.getByText('Database Engines & Storage')).toBeInTheDocument();
    expect(screen.getByText('Practice Storage & DB →')).toBeInTheDocument();
    expect(screen.getByText('⚡ Open Sandbox')).toBeInTheDocument();
  });

  it('toggles secondary comparison role layer and updates comparison metrics', () => {
    render(<MultiRoleArchitecturalRadar />);

    const secondaryToggle = screen.getByLabelText(/Secondary Role Overlay/i);
    expect(secondaryToggle).toBeChecked();
    expect(screen.getAllByText(/Site Reliability Engineer/i).length).toBeGreaterThanOrEqual(1);

    // Toggle off
    fireEvent.click(secondaryToggle);
    expect(secondaryToggle).not.toBeChecked();

    // Toggle back on
    fireEvent.click(secondaryToggle);
    expect(secondaryToggle).toBeChecked();
  });

  it('toggles 90th percentile cohort decile layer', () => {
    const { container } = render(<MultiRoleArchitecturalRadar />);

    const cohortToggle = screen.getByLabelText(/90th Percentile Cohort/i);
    expect(cohortToggle).toBeChecked();

    // The cohort polygon has strokeDasharray="2 3"
    let cohortPoly = container.querySelector('polygon[stroke-dasharray="2 3"]');
    expect(cohortPoly).toBeInTheDocument();

    // Uncheck cohort toggle
    fireEvent.click(cohortToggle);
    expect(cohortToggle).not.toBeChecked();
    cohortPoly = container.querySelector('polygon[stroke-dasharray="2 3"]');
    expect(cohortPoly).not.toBeInTheDocument();
  });

  it('switches primary target role archetype and updates benchmarks', () => {
    render(<MultiRoleArchitecturalRadar />);

    const primarySelect = screen.getByRole('combobox', { name: 'Primary Target Role' });
    expect(primarySelect).toHaveValue('dist-architect');

    // Switch to Database & Storage Specialist
    fireEvent.change(primarySelect, { target: { value: 'storage-specialist' } });
    expect(primarySelect).toHaveValue('storage-specialist');
  });

  it('renders fallback linear comparison bars when fewer than 3 dimensions are provided', () => {
    const fewDomains = [
      {
        domainId: 'dist-sys',
        name: 'Distributed Systems & Consensus',
        shortName: 'Distributed Systems',
        candidateScore: 85,
      },
      {
        domainId: 'db-storage',
        name: 'Database Engines & Storage',
        shortName: 'Storage & DB',
        candidateScore: 70,
      },
    ];

    const { container } = render(
      <MultiRoleArchitecturalRadar
        candidateDomains={fewDomains}
        title="Compact Two-Domain View"
      />,
    );

    expect(screen.getByText('Compact Two-Domain View')).toBeInTheDocument();
    expect(screen.getByText('Distributed Systems & Consensus')).toBeInTheDocument();
    expect(screen.getByText('Database Engines & Storage')).toBeInTheDocument();

    // SVG radar should not be rendered
    const svg = container.querySelector('svg[aria-label="Multi-Role Architectural Radar Chart"]');
    expect(svg).toBeNull();
  });

  it('returns null when candidateDomains is empty', () => {
    const { container } = render(<MultiRoleArchitecturalRadar candidateDomains={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
