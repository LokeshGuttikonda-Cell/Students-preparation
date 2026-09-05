import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KernelNetworkSandbox } from '../KernelNetworkSandbox';

describe('KernelNetworkSandbox', () => {
  it('renders CPU Gantt Scheduling by default and tests RR, SRTF, and Priority Preemptive algorithms', () => {
    render(<KernelNetworkSandbox />);

    expect(screen.getByText(/CPU Scheduling Gantt, Virtual Memory Paging & TCP Congestion Dynamics/i)).toBeInTheDocument();
    expect(screen.getByText('Round Robin (q = 2)')).toBeInTheDocument();
    expect(screen.getByText('Process Scheduling Metric Breakdown')).toBeInTheDocument();
    expect(screen.getByText(/Avg Turnaround:/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg Waiting:/i)).toBeInTheDocument();

    // Switch to SRTF
    const srtfBtn = screen.getByRole('button', { name: /SRTF \(Preemptive SJF\)/i });
    fireEvent.click(srtfBtn);
    expect(screen.getByText(/Shortest Remaining Time First/i)).toBeInTheDocument();

    // Switch to Priority
    const priBtn = screen.getByRole('button', { name: /Priority Preemptive/i });
    fireEvent.click(priBtn);
    expect(screen.getByText(/Preemptive Priority Scheduling/i)).toBeInTheDocument();
  });

  it('switches to Virtual Memory Paging and verifies Bélády\'s Anomaly in FIFO and stack optimality in LRU', () => {
    render(<KernelNetworkSandbox />);

    const pagingTabBtn = screen.getByRole('button', { name: /Virtual Memory Paging/i });
    fireEvent.click(pagingTabBtn);

    expect(screen.getByText(/Physical Memory Frame State Matrix/i)).toBeInTheDocument();
    expect(screen.getByText(/Bélády's Anomaly Demonstration/i)).toBeInTheDocument();

    // 3 frames FIFO should have 9 faults
    expect(screen.getByText('Total Page Faults:')).toBeInTheDocument();
    expect(screen.getAllByText('9').length).toBeGreaterThanOrEqual(1);

    // Switch to 4 frames in FIFO -> faults should increase to 10!
    const fourFramesBtn = screen.getByRole('button', { name: /4 Frames/i });
    fireEvent.click(fourFramesBtn);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);

    // Switch to LRU with 4 frames -> faults should decrease to 8!
    const lruBtn = screen.getByRole('button', { name: /LRU \(Stack Optimal\)/i });
    fireEvent.click(lruBtn);
    expect(screen.getAllByText('8').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to TCP Congestion Control and tests Reno vs Tahoe dynamics and round stepping', () => {
    render(<KernelNetworkSandbox />);

    const tcpTabBtn = screen.getByRole('button', { name: /TCP Congestion \(cwnd\)/i });
    fireEvent.click(tcpTabBtn);

    expect(screen.getByText(/Congestion Window Dynamics/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Round:/i)).toBeInTheDocument();
    expect(screen.getByText('9 / 15')).toBeInTheDocument();
    expect(screen.getByText('19 MSS')).toBeInTheDocument();

    // Step forward to round 10
    const nextBtn = screen.getByRole('button', { name: /Next Round →/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText('10 / 15')).toBeInTheDocument();
    // Reno: cwnd at round 10 is 10 MSS
    expect(screen.getByText('10 MSS')).toBeInTheDocument();

    // Switch to TCP Tahoe
    const tahoeBtn = screen.getByRole('button', { name: /TCP Tahoe \(Full Timeout Reset\)/i });
    fireEvent.click(tahoeBtn);
    // Tahoe collapses to 1 MSS at round 10
    expect(screen.getByText('1 MSS')).toBeInTheDocument();
  });
});
