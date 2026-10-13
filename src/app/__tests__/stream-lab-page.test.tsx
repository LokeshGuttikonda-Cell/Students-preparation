import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StreamLabPage from '../(student)/stream-lab/page';
import * as streamLabClient from '../../lib/stream-lab-client';

describe('StreamLabPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the Stream Lab interface and default scenario', () => {
    render(<StreamLabPage />);

    expect(
      screen.getByText('Message Streaming & Partitioning Lab')
    ).toBeInTheDocument();
    expect(screen.getByText('Stream Studio')).toBeInTheDocument();
    expect(
      screen.getByText('E-Commerce Payment Gateway Webhook Pipeline')
    ).toBeInTheDocument();
    expect(screen.getAllByText(/10,000 msgs\/sec/i).length).toBeGreaterThanOrEqual(1);
  });

  it('switches to a different scenario from the dropdown', () => {
    render(<StreamLabPage />);

    const select = screen.getByLabelText(/Scenario:/i);
    fireEvent.change(select, { target: { value: 'order-fulfillment-saga' } });

    expect(
      screen.getByText('Distributed Order Fulfillment Saga & Poison Pill Defense')
    ).toBeInTheDocument();
  });

  it('reveals Socratic guidance hints progressively on click', () => {
    render(<StreamLabPage />);

    const hintBtn = screen.getByRole('button', { name: /Reveal Clue/i });
    fireEvent.click(hintBtn);

    expect(screen.getByText(/Clue 1:/i)).toBeInTheDocument();

    fireEvent.click(hintBtn);
    expect(screen.getByText(/Clue 2:/i)).toBeInTheDocument();
  });

  it('runs streaming benchmark simulation and navigates to telemetry tab', async () => {
    render(<StreamLabPage />);

    const runBtn = screen.getByRole('button', {
      name: /Run 10,000 Message Streaming Benchmark/i,
    });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Pipeline Throughput')).toBeInTheDocument();
      expect(screen.getByText('Consumer Group Lag')).toBeInTheDocument();
      expect(screen.getByText(/Partition Lag & Traffic Distribution Heatmap/i)).toBeInTheDocument();
    });
  });

  it('applies Golden Reference Architecture and achieves Grade S on scorecard', async () => {
    render(<StreamLabPage />);

    const goldenBtn = screen.getByRole('button', {
      name: /Apply Golden Reference Architecture/i,
    });
    fireEvent.click(goldenBtn);

    const runBtn = screen.getByRole('button', {
      name: /Run 10,000 Message Streaming Benchmark/i,
    });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Pipeline Throughput')).toBeInTheDocument();
    });

    const scorecardTabBtn = screen.getByRole('button', {
      name: /3\. Architecture Scorecard & Blueprint/i,
    });
    fireEvent.click(scorecardTabBtn);

    await waitFor(() => {
      expect(screen.getByText(/Architecture Grade: S/i)).toBeInTheDocument();
      expect(screen.getByText(/STREAM ARCHITECT/i)).toBeInTheDocument();
    });
  });

  it('triggers PDF and Markdown export cleanly from scorecard tab', async () => {
    const exportPdfSpy = vi.spyOn(streamLabClient, 'exportStreamLabPdf').mockImplementation(() => {});
    const downloadSpy = vi.spyOn(streamLabClient, 'downloadFile').mockImplementation(() => {});

    render(<StreamLabPage />);

    // Run simulation
    const runBtn = screen.getByRole('button', {
      name: /Run 10,000 Message Streaming Benchmark/i,
    });
    fireEvent.click(runBtn);

    // Switch to scorecard
    const scorecardTabBtn = screen.getByRole('button', {
      name: /3\. Architecture Scorecard & Blueprint/i,
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
