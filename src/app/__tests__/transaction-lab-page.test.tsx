import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionLabPage from '../(student)/transaction-lab/page';
import * as transactionLabClient from '../../lib/transaction-lab-client';

describe('TransactionLabPage Component & Interaction Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders the Transaction Lab header, controls, and scenarios ribbon', () => {
    render(<TransactionLabPage />);

    expect(
      screen.getByText('Distributed Transactions & Saga Orchestrator Studio')
    ).toBeInTheDocument();
    expect(screen.getByText('E-Commerce Checkout & Inventory Reservation')).toBeInTheDocument();
    expect(screen.getByText('Cross-Border Multi-Currency Wire Transfer')).toBeInTheDocument();
    expect(screen.getByText('Apply Golden Reference')).toBeInTheDocument();
    expect(screen.getByText('Execute Distributed Transaction')).toBeInTheDocument();
  });

  it('switches to another scenario when clicking a scenario card in ribbon', () => {
    render(<TransactionLabPage />);

    const wireTransferCard = screen.getByText('Cross-Border Multi-Currency Wire Transfer');
    fireEvent.click(wireTransferCard);

    expect(screen.getAllByText(/FinTech & Banking/i).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(/A digital banking platform processes international wire transfers across separate ledger services/i)
    ).toBeInTheDocument();
  });

  it('reveals Socratic guidance hints when clicking Hint buttons', () => {
    render(<TransactionLabPage />);

    const hint1Btn = screen.getByRole('button', { name: /Hint 1/i });
    fireEvent.click(hint1Btn);

    expect(screen.getByText(/Q1:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/What happens to database thread pools when 2PC prepare locks/i)
    ).toBeInTheDocument();
  });

  it('executes distributed transaction and transitions to step waterfall tab', async () => {
    render(<TransactionLabPage />);

    const executeBtn = screen.getByRole('button', { name: /Execute Distributed Transaction/i });
    fireEvent.click(executeBtn);

    await waitFor(() => {
      expect(screen.getByText('Transaction Outcome')).toBeInTheDocument();
      expect(screen.getByText('Distributed Lock Holding Time')).toBeInTheDocument();
      expect(screen.getByText('Saga Execution Step Waterfall')).toBeInTheDocument();
      expect(screen.getByText(/Step 1: Order Service/i)).toBeInTheDocument();
    });
  });

  it('applies Golden Reference Architecture and navigates to scorecard with Grade S', async () => {
    render(<TransactionLabPage />);

    const goldenBtn = screen.getByRole('button', { name: /Apply Golden Reference/i });
    fireEvent.click(goldenBtn);

    await waitFor(() => {
      expect(screen.getByText(/ARCHITECTURAL SCORECARD/i)).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText(/Score: (9\d|100) \/ 100/i)).toBeInTheDocument();
      expect(screen.getAllByText(/SAGA_ORCHESTRATOR/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('triggers PDF and Markdown export cleanly from scorecard tab', async () => {
    const exportPdfSpy = vi.spyOn(transactionLabClient, 'exportTransactionLabPdf').mockImplementation(() => {});
    const downloadSpy = vi.spyOn(transactionLabClient, 'downloadFile').mockImplementation(() => {});

    render(<TransactionLabPage />);

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
