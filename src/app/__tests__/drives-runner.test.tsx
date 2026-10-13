import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DriveRunnerPage from '../(student)/drives/[id]/page';
import * as drivesClient from '../../../src/lib/drives-client';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'hyperscale-backend' }),
}));

describe('DriveRunnerPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders round 1 questions and disabled submit button initially', () => {
    render(<DriveRunnerPage />);

    expect(screen.getByRole('heading', { level: 1, name: /HyperScale Distributed Systems Placement Drive/i })).toBeDefined();
    expect(screen.getByText(/Round 1 of 4/i)).toBeDefined();
    expect(screen.getAllByText(/Online Technical & CS Fundamentals Screening/i).length).toBeGreaterThan(0);

    // Submit button should be disabled before answering
    const submitBtn = screen.getByRole('button', { name: /Submit Round 1 Evaluation/i }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('allows answering questions, submitting, and advancing to next round when cutoff met', () => {
    render(<DriveRunnerPage />);

    expect(screen.getByRole('heading', { level: 1, name: /HyperScale Distributed Systems Placement Drive/i })).toBeDefined();

    // Answer all 4 questions correctly (option index 1 for all 4 in hyperscale-backend round 1)
    const radios = screen.getAllByRole('radio');
    expect(radios.length).toBe(16); // 4 questions * 4 options

    // Select options
    fireEvent.click(radios[1]); // Q1 option 1
    fireEvent.click(radios[5]); // Q2 option 1
    fireEvent.click(radios[9]); // Q3 option 1
    fireEvent.click(radios[13]); // Q4 option 1

    const submitBtn = screen.getByRole('button', { name: /Submit Round 1 Evaluation/i }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);

    fireEvent.click(submitBtn);

    // Should advance to Round 2
    expect(screen.getByText(/Round 2 of 4/i)).toBeDefined();
    expect(screen.getAllByText(/Diagnostic Scenario & Incident Troubleshooting Lab/i).length).toBeGreaterThan(0);
  });

  it('renders elimination view when cutoff hurdle is not met', () => {
    render(<DriveRunnerPage />);

    expect(screen.getByRole('heading', { level: 1, name: /HyperScale Distributed Systems Placement Drive/i })).toBeDefined();

    // Answer incorrectly (select option 0 for all)
    const radios = screen.getAllByRole('radio');
    fireEvent.click(radios[0]);
    fireEvent.click(radios[4]);
    fireEvent.click(radios[8]);
    fireEvent.click(radios[12]);

    const submitBtn = screen.getByRole('button', { name: /Submit Round 1 Evaluation/i });
    fireEvent.click(submitBtn);

    // Elimination view
    expect(screen.getByText(/Round Cutoff Hurdle Not Satisfied/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Retry Drive Simulation/i })).toBeDefined();
  });

  it('renders offer celebration screen and triggers PDF download when offer extended', () => {
    // Seed an offer extended application
    const drive = drivesClient.getDriveById('hyperscale-backend')!;
    const offer = drivesClient.generateOfferLetter(drive, 'Rahul Sharma', 'National Institute of Technology');

    localStorage.setItem(
      'sp_campus_drives_v1_apps',
      JSON.stringify({
        'hyperscale-backend': {
          driveId: 'hyperscale-backend',
          status: 'OFFER_EXTENDED',
          currentRoundIndex: 3,
          roundScores: { 1: 100, 2: 100, 3: 100, 4: 100 },
          offerDetails: offer,
          lastUpdated: new Date().toISOString(),
        },
      })
    );

    const pdfSpy = vi.spyOn(drivesClient, 'downloadOfferLetterPdf').mockImplementation(() => {});

    render(<DriveRunnerPage />);

    expect(screen.getByText(/Official Campus Placement Offer Extended!/i)).toBeDefined();
    expect(screen.getByText(offer.offerCode)).toBeDefined();

    // Trigger PDF download
    const downloadBtn = screen.getByLabelText('Download Official Offer Letter (PDF)');
    fireEvent.click(downloadBtn);

    expect(pdfSpy).toHaveBeenCalledTimes(1);
    expect(pdfSpy.mock.calls[0][0].offerCode).toBe(offer.offerCode);
  });
});
