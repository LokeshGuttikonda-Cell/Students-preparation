import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RateLimiterPage from '../(student)/rate-limiter/page';
import * as rateLimiterClient from '../../lib/rate-limiter-client';

describe('RateLimiterPage Component & Interaction Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the Rate Limiting Studio header, controls, and scenarios ribbon', () => {
    render(<RateLimiterPage />);

    expect(
      screen.getByText('Distributed Rate Limiting & Throttling Studio')
    ).toBeInTheDocument();
    expect(screen.getByText('Public Search API Scraper Defense')).toBeInTheDocument();
    expect(screen.getByText('Financial Payment Processing Gateway')).toBeInTheDocument();
    expect(screen.getByText('Apply Golden Reference')).toBeInTheDocument();
    expect(screen.getByText('Run Rate Limit Simulation')).toBeInTheDocument();
  });

  it('switches to another scenario when clicking a scenario card in ribbon', () => {
    render(<RateLimiterPage />);

    const paymentScenarioCard = screen.getByText('Financial Payment Processing Gateway');
    fireEvent.click(paymentScenarioCard);

    expect(screen.getAllByText(/FinTech & Payments/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/A global card payment processing gateway processes authorized transactions/i)
    ).toBeInTheDocument();
  });

  it('reveals Socratic guidance hints when clicking Hint buttons', () => {
    render(<RateLimiterPage />);

    const hint1Btn = screen.getByRole('button', { name: /Hint 1/i });
    fireEvent.click(hint1Btn);

    expect(screen.getByText(/Q1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Why does an algorithm with a sharp counter reset/i)).toBeInTheDocument();
  });

  it('runs rate limiter simulation and transitions to live telemetry tab', async () => {
    render(<RateLimiterPage />);

    const runBtn = screen.getByRole('button', { name: /Run Rate Limit Simulation/i });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Request Throughput')).toBeInTheDocument();
      expect(screen.getByText('Boundary Burst Penetration')).toBeInTheDocument();
      expect(screen.getByText('Live Simulated HTTP Response Headers')).toBeInTheDocument();
      expect(screen.getByText(/X-RateLimit-Limit:/i)).toBeInTheDocument();
    });
  });

  it('applies Golden Reference Architecture and navigates to scorecard with Grade S', async () => {
    render(<RateLimiterPage />);

    const goldenBtn = screen.getByRole('button', { name: /Apply Golden Reference/i });
    fireEvent.click(goldenBtn);

    await waitFor(() => {
      expect(screen.getByText(/ARCHITECTURAL SCORECARD/i)).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText(/Score: (9\d|100) \/ 100/i)).toBeInTheDocument();
      expect(screen.getAllByText(/RATE_LIMIT_ARCHITECT/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('triggers PDF and Markdown export cleanly from scorecard tab', async () => {
    const exportPdfSpy = vi.spyOn(rateLimiterClient, 'exportRateLimiterPdf').mockImplementation(() => {});
    const downloadSpy = vi.spyOn(rateLimiterClient, 'downloadFile').mockImplementation(() => {});

    render(<RateLimiterPage />);

    // Apply golden and switch to scorecard
    const goldenBtn = screen.getByRole('button', { name: /Apply Golden Reference/i });
    fireEvent.click(goldenBtn);

    await waitFor(() => {
      expect(screen.getByText('Download Report (PDF)')).toBeInTheDocument();
    });

    const pdfBtn = screen.getByRole('button', { name: /Download Report \(PDF\)/i });
    fireEvent.click(pdfBtn);
    expect(exportPdfSpy).toHaveBeenCalled();

    const mdBtn = screen.getByRole('button', { name: /Export Markdown/i });
    fireEvent.click(mdBtn);
    expect(downloadSpy).toHaveBeenCalled();
  });
});
