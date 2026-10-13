import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CompensationAnalyzerPage from '../(student)/compensation/page';
import * as compClient from '../../lib/compensation-client';

describe('CompensationAnalyzerPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders page header, active offer breakdown, in-hand deposit card, and navigation tabs', () => {
    render(<CompensationAnalyzerPage />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Compensation & Take-Home Salary Analyzer/i,
      })
    ).toBeDefined();

    expect(screen.getByText(/Financial Modeling Suite/i)).toBeDefined();
    expect(screen.getByText(/FY 2024–2026 Indian Tax Regimes/i)).toBeDefined();

    // Action buttons
    expect(screen.getByRole('button', { name: /Import from Drives/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Summary \(\.md\)/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Report \(PDF\)/i })).toBeDefined();

    // 3 Tabs
    expect(screen.getByRole('button', { name: /1\. CTC Deconstruction & Monthly In-Hand/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /2\. Multi-Offer Comparison Matrix/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /3\. Negotiation Simulator & Script Studio/i })).toBeDefined();

    // Default package details
    expect(screen.getByDisplayValue('HyperScale Systems Consortium')).toBeDefined();
    expect(screen.getByText(/Monthly In-Hand Deposit/i)).toBeDefined();
  });

  it('allows editing package base salary and recalculating take-home pay dynamically', () => {
    render(<CompensationAnalyzerPage />);

    const baseInput = screen.getByDisplayValue('2000000');
    fireEvent.change(baseInput, { target: { value: '2500000' } });

    expect((baseInput as HTMLInputElement).value).toBe('2500000');
    expect(screen.getByText(/₹25\.00 LPA/i)).toBeDefined();
  });

  it('adds a new custom offer and allows removing offers', () => {
    render(<CompensationAnalyzerPage />);

    const addBtn = screen.getByRole('button', { name: /Add Custom Offer/i });
    fireEvent.click(addBtn);

    expect(screen.getByText(/New Tech Offer #4/i)).toBeDefined();

    // Remove active package
    const removeBtn = screen.getByRole('button', { name: /Remove/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText(/New Tech Offer #4/i)).toBeNull();
  });

  it('switches to Multi-Offer Comparison Matrix tab and displays side-by-side rankings', () => {
    render(<CompensationAnalyzerPage />);

    const comparisonTab = screen.getByRole('button', { name: /2\. Multi-Offer Comparison Matrix/i });
    fireEvent.click(comparisonTab);

    expect(screen.getByText(/Side-by-Side Offer Comparison & Purchasing Power Parity/i)).toBeDefined();
    expect(screen.getByText(/Rank #1/i)).toBeDefined();
    expect(screen.getByText(/Rank #2/i)).toBeDefined();
    expect(screen.getByText(/Rank #3/i)).toBeDefined();
  });

  it('switches to Negotiation Simulator tab and generates customized counter-offer scripts', () => {
    render(<CompensationAnalyzerPage />);

    const negotiationTab = screen.getByRole('button', { name: /3\. Negotiation Simulator & Script Studio/i });
    fireEvent.click(negotiationTab);

    expect(screen.getByText(/Offer Negotiation Strategy & Talking Points Studio/i)).toBeDefined();
    expect(screen.getByText(/Targeting offer from/i)).toBeDefined();

    // Select Exceptional Credentials scenario
    const credBtn = screen.getByText(/2\. Exceptional Verified Credentials/i);
    fireEvent.click(credBtn);

    expect(screen.getByText(/Generated Counter-Offer Email Draft/i)).toBeDefined();

    // Adjust target increase slider
    const slider = screen.getByLabelText(/Target base salary increase percentage/i);
    fireEvent.change(slider, { target: { value: '20' } });

    expect(screen.getByText(/\+20%/i)).toBeDefined();

    // Copy script
    const copyEmailBtn = screen.getByRole('button', { name: /Copy Email Draft/i });
    fireEvent.click(copyEmailBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  it('imports offers from Placement Drives localStorage storage', () => {
    localStorage.setItem(
      'sp_campus_drives_v1_apps',
      JSON.stringify({
        'titan-fintech': {
          driveId: 'titan-fintech',
          status: 'OFFER_EXTENDED',
          offerDetails: {
            offerCode: 'SP-OFFER-2026-TITAN',
            consortiumName: 'Titan Core FinTech Labs',
            roleTitle: 'High-Throughput Platform Engineer',
            ctcAnnual: '₹32.0 LPA',
            baseSalary: '₹22.0 LPA',
          },
        },
      })
    );

    render(<CompensationAnalyzerPage />);

    const importBtn = screen.getByRole('button', { name: /Import from Drives/i });
    fireEvent.click(importBtn);

    expect(screen.getAllByText(/Titan Core FinTech Labs/i).length).toBeGreaterThan(0);
  });

  it('triggers PDF report export and Markdown summary download handlers', () => {
    const pdfSpy = vi.spyOn(compClient, 'exportCompensationReportPdf').mockImplementation(() => {});
    const downloadSpy = vi.spyOn(compClient, 'downloadFile').mockImplementation(() => {});

    render(<CompensationAnalyzerPage />);

    const pdfBtn = screen.getByRole('button', { name: /Report \(PDF\)/i });
    fireEvent.click(pdfBtn);
    expect(pdfSpy).toHaveBeenCalledTimes(1);

    const mdBtn = screen.getByRole('button', { name: /Summary \(\.md\)/i });
    fireEvent.click(mdBtn);
    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy.mock.calls[0][0]).toBe('compensation-offer-comparison.md');
  });

  it('resets offer packages to default baseline when reset button is clicked', () => {
    render(<CompensationAnalyzerPage />);

    const resetBtn = screen.getByLabelText(/Reset Packages to Default/i);
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Reset to default benchmark tech compensation packages/i)).toBeDefined();
  });
});
