import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CacheLabPage from '../(student)/cache-lab/page';
import * as cacheLabClient from '../../lib/cache-lab-client';

describe('CacheLabPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the Cache Lab interface and default scenario', () => {
    render(<CacheLabPage />);

    expect(
      screen.getByText('Distributed Caching & Invalidation Lab')
    ).toBeInTheDocument();
    expect(screen.getByText('Industrial Sim')).toBeInTheDocument();
    expect(
      screen.getByText('Flash-Sale High-Contention Inventory Counter')
    ).toBeInTheDocument();
    expect(screen.getByText(/40,000 req\/sec/i)).toBeInTheDocument();
  });

  it('switches to a different scenario from the dropdown', () => {
    render(<CacheLabPage />);

    const select = screen.getByLabelText(/Scenario:/i);
    fireEvent.change(select, { target: { value: 'user-session-store' } });

    expect(
      screen.getByText('Multi-Region User Session Token Store')
    ).toBeInTheDocument();
  });

  it('reveals Socratic guidance hints progressively on click', () => {
    render(<CacheLabPage />);

    const hintBtn = screen.getByRole('button', { name: /Reveal Hint/i });
    fireEvent.click(hintBtn);

    expect(screen.getByText(/Clue 1:/i)).toBeInTheDocument();

    fireEvent.click(hintBtn);
    expect(screen.getByText(/Clue 2:/i)).toBeInTheDocument();
  });

  it('runs 10,000 request benchmark and navigates to telemetry tab', async () => {
    render(<CacheLabPage />);

    const runBtn = screen.getByRole('button', {
      name: /Run 10,000 Request Benchmark Simulation/i,
    });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Cache Hit Rate')).toBeInTheDocument();
      expect(screen.getByText('Average Latency')).toBeInTheDocument();
      expect(screen.getByText('Database Offload')).toBeInTheDocument();
    });
  });

  it('applies Golden Reference Architecture and achieves Grade S on scorecard', async () => {
    render(<CacheLabPage />);

    const goldenBtn = screen.getByRole('button', {
      name: /Apply Golden Reference Architecture/i,
    });
    fireEvent.click(goldenBtn);

    const runBtn = screen.getByRole('button', {
      name: /Run 10,000 Request Benchmark Simulation/i,
    });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Cache Hit Rate')).toBeInTheDocument();
    });

    const scorecardTabBtn = screen.getByRole('button', {
      name: /3\. Performance Scorecard & Blueprint/i,
    });
    fireEvent.click(scorecardTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Architecture Grade: S/i)).toBeInTheDocument();
      expect(screen.getByText(/CACHE ARCHITECT/i)).toBeInTheDocument();
    });
  });

  it('triggers PDF and Markdown export cleanly from scorecard tab', async () => {
    const exportPdfSpy = vi.spyOn(cacheLabClient, 'exportCacheLabPdf').mockImplementation(() => {});
    const downloadSpy = vi.spyOn(cacheLabClient, 'downloadFile').mockImplementation(() => {});

    render(<CacheLabPage />);

    // Run simulation first
    const runBtn = screen.getByRole('button', {
      name: /Run 10,000 Request Benchmark Simulation/i,
    });
    fireEvent.click(runBtn);

    // Switch to scorecard tab
    const scorecardTabBtn = screen.getByRole('button', {
      name: /3\. Performance Scorecard & Blueprint/i,
    });
    fireEvent.click(scorecardTabBtn);

    const exportMdBtn = screen.getByRole('button', { name: /Export Markdown/i });
    const exportPdfBtn = screen.getByRole('button', { name: /Download Report \(PDF\)/i });

    fireEvent.click(exportMdBtn);
    expect(downloadSpy).toHaveBeenCalled();

    fireEvent.click(exportPdfBtn);
    expect(exportPdfSpy).toHaveBeenCalled();
  });
});
