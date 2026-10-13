import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ArchitectureTradeoffCalculator } from '../ArchitectureTradeoffCalculator';

describe('ArchitectureTradeoffCalculator Component', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ArchitectureTradeoffCalculator isOpen={false} onClose={onCloseMock} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal title, tabs, and default quorum model when isOpen is true', () => {
    render(<ArchitectureTradeoffCalculator isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText('Architecture Decision Visualizer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Replication Quorum/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Storage Engine/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Data Layout/i })).toBeInTheDocument();

    // Default tab is quorum: R=3, W=3, N=5 -> R+W=6 > 5 -> Strong Consistency
    expect(screen.getByText(/Strong \(Linearizable\/Sequential\)/i)).toBeInTheDocument();
    expect(screen.getByText('Read Latency (RTT)')).toBeInTheDocument();
    expect(screen.getByText('Write Latency (RTT)')).toBeInTheDocument();
  });

  it('switches to Storage Engine tab and updates engine recommendation', () => {
    render(<ArchitectureTradeoffCalculator isOpen={true} onClose={onCloseMock} />);

    const storageTab = screen.getByRole('button', { name: /Storage Engine/i });
    fireEvent.click(storageTab);

    expect(screen.getByText(/Optimal Architecture:/i)).toBeInTheDocument();
    expect(screen.getByText(/LSM-Tree \(Log-Structured Merge\)/i)).toBeInTheDocument();
    expect(screen.getByText(/B\+ Tree \(In-Place Updates\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Write Amplification \(WAF\):/i).length).toBe(2);
  });

  it('switches to Data Layout tab and renders columnar vs row speedup', () => {
    render(<ArchitectureTradeoffCalculator isOpen={true} onClose={onCloseMock} />);

    const layoutTab = screen.getByRole('button', { name: /Data Layout/i });
    fireEvent.click(layoutTab);

    expect(screen.getByText(/Analytical Scan Speedup/i)).toBeInTheDocument();
    expect(screen.getByText(/Row-Oriented \(Slotted Page\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Columnar \(Parquet \/ Arrow\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Hardware Bus Transfer Verdict:/i)).toBeInTheDocument();
  });

  it('updates quorum sliders to simulate eventual consistency when R + W <= N', () => {
    render(<ArchitectureTradeoffCalculator isOpen={true} onClose={onCloseMock} />);

    // Total nodes is 5. Let's set Read Quorum to 1 and Write Quorum to 1 -> R + W = 2 <= 5
    const readInput = screen.getByLabelText(/Read Quorum \(R\)/i);
    const writeInput = screen.getByLabelText(/Write Quorum \(W\)/i);

    fireEvent.change(readInput, { target: { value: '1' } });
    fireEvent.change(writeInput, { target: { value: '1' } });

    expect(screen.getByText(/Eventual \(Read Stale Window\)/i)).toBeInTheDocument();
  });

  it('copies architectural markdown analysis to clipboard when clicking Copy Analysis', async () => {
    render(<ArchitectureTradeoffCalculator isOpen={true} onClose={onCloseMock} />);

    const copyBtn = screen.getByRole('button', { name: /Copy Analysis/i });
    await React.act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('closes on close button click and on Escape key', () => {
    render(
      <ArchitectureTradeoffCalculator isOpen={true} onClose={onCloseMock} />
    );

    const closeBtn = screen.getByLabelText('Close trade-off calculator');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseMock).toHaveBeenCalledTimes(2);
  });
});
