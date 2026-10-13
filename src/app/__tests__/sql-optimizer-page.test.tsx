import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SqlOptimizerPage from '../(student)/sql-optimizer/page';
import * as sqlOptimizerClient from '../../lib/sql-optimizer-client';

describe('SqlOptimizerPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the SQL Optimizer interface and default scenario', () => {
    render(<SqlOptimizerPage />);

    expect(
      screen.getByText('SQL Execution Plan & Index Tuning Studio'),
    ).toBeInTheDocument();
    expect(screen.getByText('Industrial Mode')).toBeInTheDocument();
    expect(screen.getByText('$0.00 Local Compute')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Customer Order History with Date Predicate & Status Filter/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Total Records')).toBeInTheDocument();
  });

  it('switches to a different query scenario from the dropdown', () => {
    render(<SqlOptimizerPage />);

    const select = screen.getByLabelText(/Scenario:/i);
    fireEvent.change(select, { target: { value: 'feed-events-pagination' } });

    expect(
      screen.getByRole('heading', {
        name: /High-Throughput Activity Timeline with Deep Pagination/,
      }),
    ).toBeInTheDocument();
  });

  it('reveals Socratic guidance hints progressively on click', () => {
    render(<SqlOptimizerPage />);

    const hintBtn = screen.getByRole('button', { name: /Reveal Hint/i });
    fireEvent.click(hintBtn);

    expect(screen.getByText(/Hint 1:/i)).toBeInTheDocument();

    fireEvent.click(hintBtn);
    expect(screen.getByText(/Hint 2:/i)).toBeInTheDocument();
  });

  it('navigates to Index Architect tab and allows adding a candidate index', async () => {
    render(<SqlOptimizerPage />);

    const tuningTabBtn = screen.getByRole('button', {
      name: /2\. Index Architect & Query Tuner/i,
    });
    fireEvent.click(tuningTabBtn);

    expect(screen.getByText('Candidate Index Architect')).toBeInTheDocument();

    const colsInput = screen.getByPlaceholderText(
      /customer_id, status, created_at/i,
    );
    fireEvent.change(colsInput, {
      target: { value: 'customer_id, status, created_at' },
    });

    const addIndexBtn = screen.getByRole('button', {
      name: /Add Index to Proposal/i,
    });
    fireEvent.click(addIndexBtn);

    await waitFor(() => {
      expect(
        screen.getByText(
          /CREATE INDEX idx_orders_customer_id_status_created_at ON orders/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it('runs plan simulation, displays scorecard, and triggers exports', async () => {
    const exportPdfSpy = vi
      .spyOn(sqlOptimizerClient, 'exportSqlOptimizationPdf')
      .mockImplementation(() => {});
    const exportMdSpy = vi
      .spyOn(sqlOptimizerClient, 'downloadFile')
      .mockImplementation(() => {});

    const { container } = render(<SqlOptimizerPage />);

    // Switch to tuning tab
    fireEvent.click(
      screen.getByRole('button', { name: /2\. Index Architect & Query Tuner/i }),
    );

    // Add matching index
    const colsInput = screen.getByPlaceholderText(
      /customer_id, status, created_at/i,
    );
    fireEvent.change(colsInput, {
      target: { value: 'customer_id, status, created_at' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: /Add Index to Proposal/i }),
    );

    // Rewrite query to range
    const textarea = container.querySelector('textarea')!;
    fireEvent.change(textarea, {
      target: {
        value: `SELECT id, total_amount, created_at\nFROM orders\nWHERE customer_id = 48291 AND status = 'COMPLETED' AND created_at >= '2025-01-01' AND created_at < '2026-01-01'\nORDER BY created_at DESC;`,
      },
    });

    // Run simulation
    const runBtn = screen.getByRole('button', {
      name: /Run Execution Plan Simulation/i,
    });
    fireEvent.click(runBtn);

    await waitFor(() => {
      expect(screen.getByText('Latency Drop')).toBeInTheDocument();
      expect(screen.getByText('Cost Reduction')).toBeInTheDocument();
    });

    // Verify exports
    const pdfBtn = screen.getByRole('button', {
      name: /Download Tuning Audit \(PDF\)/i,
    });
    fireEvent.click(pdfBtn);
    expect(exportPdfSpy).toHaveBeenCalled();

    const mdBtn = screen.getByRole('button', { name: /Export Markdown/i });
    fireEvent.click(mdBtn);
    expect(exportMdSpy).toHaveBeenCalled();
  });
});
