import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PlacementReadinessPage from '../(student)/readiness/page';
import * as readinessClient from '../../../src/lib/readiness-client';

describe('PlacementReadinessPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders page header, default role metrics, radar chart, and 14-day roadmap', () => {
    render(<PlacementReadinessPage />);

    expect(screen.getByText('Placement Readiness Profiler')).toBeDefined();
    expect(screen.getByLabelText('Target Role Track')).toBeDefined();
    expect(screen.getByText('Competency Spider Matrix')).toBeDefined();
    expect(screen.getByText('14-Day Adaptive Remediation Study Roadmap')).toBeDefined();

    // Check presence of Day 1 and Day 14
    expect(screen.getByText('Day 1')).toBeDefined();
    expect(screen.getByText('Day 14')).toBeDefined();
  });

  it('switches target role when dropdown selection changes', () => {
    render(<PlacementReadinessPage />);

    const select = screen.getByLabelText('Target Role Track') as HTMLSelectElement;
    expect(select.value).toBe('aws-cloud-engineer');

    fireEvent.change(select, { target: { value: 'devops-engineer' } });
    expect(select.value).toBe('devops-engineer');
    expect(screen.getByRole('heading', { level: 2, name: /DevOps & Site Reliability Engineer/i })).toBeDefined();
  });

  it('allows adjusting competency slider and recalculating scores dynamically', () => {
    render(<PlacementReadinessPage />);

    // Find first slider
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBeGreaterThanOrEqual(3);

    // Initial check - Reset button should not be present
    expect(screen.queryByText('Reset Baseline')).toBeNull();

    // Change slider value to 95
    fireEvent.change(sliders[0], { target: { value: '95' } });

    // Now Reset Baseline should be visible
    const resetBtn = screen.getByText('Reset Baseline');
    expect(resetBtn).toBeDefined();

    // Reset back
    fireEvent.click(resetBtn);
    expect(screen.queryByText('Reset Baseline')).toBeNull();
  });

  it('toggles roadmap tasks and persists progress in localStorage', () => {
    render(<PlacementReadinessPage />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    const firstCheckbox = checkboxes[0] as HTMLInputElement;
    expect(firstCheckbox.checked).toBe(false);

    // Check the first task
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox.checked).toBe(true);

    // Check localStorage was written
    const stored = localStorage.getItem('sp_readiness_plan_v1_aws-cloud-engineer');
    expect(stored).toBeDefined();
    expect(stored).toContain('true');
  });

  it('invokes PDF download on clicking the download button', () => {
    const downloadSpy = vi.spyOn(readinessClient, 'downloadRoadmapPdf').mockImplementation(() => {});

    render(<PlacementReadinessPage />);

    const downloadBtn = screen.getByLabelText('Download Plan (PDF)');
    fireEvent.click(downloadBtn);

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy.mock.calls[0][0].roleSlug).toBe('aws-cloud-engineer');
  });

  it('allows claiming placement credential when score reaches threshold', () => {
    render(<PlacementReadinessPage />);

    // Boost all sliders to 95 to ensure score >= 75
    const sliders = screen.getAllByRole('slider');
    sliders.forEach((slider) => {
      fireEvent.change(slider, { target: { value: '95' } });
    });

    const claimBtn = screen.getByRole('button', { name: /Claim Placement Credential/i });
    expect(claimBtn).toBeDefined();

    fireEvent.click(claimBtn);

    expect(screen.getByText(/Verified Credential Issued:/i)).toBeDefined();
    expect(screen.getByText(/SP-2026-/i)).toBeDefined();
  });
});
