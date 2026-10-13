import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DrivesHubPage from '../(student)/drives/page';

describe('DrivesHubPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders page header, KPI cards, search bar, and 6 recruitment drives', () => {
    render(<DrivesHubPage />);

    expect(screen.getByText('Campus Placement Drives & Virtual Hiring Simulator')).toBeDefined();
    expect(screen.getByText('6 Consortium Drives')).toBeDefined();
    expect(screen.getByLabelText('Search Recruitment Drives')).toBeDefined();

    // Verify presence of consortium drives
    expect(screen.getByText('HyperScale Systems Consortium')).toBeDefined();
    expect(screen.getByText('Titan Distributed FinTech Labs')).toBeDefined();
    expect(screen.getByText('Nova Cloud Infrastructure Labs')).toBeDefined();
    expect(screen.getByText('Apex AI & Data Platform Systems')).toBeDefined();
  });

  it('filters drives dynamically based on search query', () => {
    render(<DrivesHubPage />);

    const searchInput = screen.getByLabelText('Search Recruitment Drives');
    fireEvent.change(searchInput, { target: { value: 'FinTech' } });

    expect(screen.getByText('Titan Distributed FinTech Labs')).toBeDefined();
    expect(screen.queryByText('Nova Cloud Infrastructure Labs')).toBeNull();
  });

  it('filters drives by application status', () => {
    // Seed an offer extended application in localStorage
    localStorage.setItem(
      'sp_campus_drives_v1_apps',
      JSON.stringify({
        'hyperscale-backend': {
          driveId: 'hyperscale-backend',
          status: 'OFFER_EXTENDED',
          currentRoundIndex: 3,
          roundScores: { 1: 100, 2: 100, 3: 100, 4: 100 },
          lastUpdated: new Date().toISOString(),
        },
      })
    );

    render(<DrivesHubPage />);

    const statusFilter = screen.getByLabelText('Status Filter') as HTMLSelectElement;
    fireEvent.change(statusFilter, { target: { value: 'OFFER' } });

    expect(screen.getByText('HyperScale Systems Consortium')).toBeDefined();
    expect(screen.queryByText('Titan Distributed FinTech Labs')).toBeNull();
  });
});
