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

  it('switches to epoll & C10K I/O and tests Level-Triggered, Edge-Triggered stall hazards, and EAGAIN draining', () => {
    render(<KernelNetworkSandbox />);

    // Switch to epoll & C10K I/O tab
    const epollTabBtn = screen.getByRole('button', { name: /epoll & C10K/i });
    fireEvent.click(epollTabBtn);

    expect(screen.getByText('Linux Kernel epoll Architecture: Level-Triggered (LT) vs Edge-Triggered (ET) & C10K Scaling')).toBeInTheDocument();
    expect(screen.getByText('Linux Kernel epoll Subsystem')).toBeInTheDocument();
    expect(screen.getByText(/Ready List \(rdllist\):/i)).toBeInTheDocument();
    expect(screen.getByText('0 Socket(s) Ready')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Level-Triggered (LT)' })).toHaveClass('bg-primary-700');

    // 1. Inject Packet on FD 4 (+1024B)
    const injectBtn = screen.getByRole('button', { name: /1. Inject Packet/i });
    fireEvent.click(injectBtn);

    expect(screen.getByText('1 Socket(s) Ready')).toBeInTheDocument();
    expect(screen.getByText(/1024 \/ 4096 Bytes/i)).toBeInTheDocument();
    expect(screen.getAllByText('NIC_PACKET').length).toBeGreaterThanOrEqual(1);

    // 2. Call epoll_wait()
    const waitBtn = screen.getByRole('button', { name: /2. Call epoll_wait()/i });
    fireEvent.click(waitBtn);

    expect(screen.getAllByText('EPOLL_WAIT').length).toBeGreaterThanOrEqual(1);

    // 3. Partial Read (256B) under Level-Triggered (LT)
    const partialReadBtn = screen.getByRole('button', { name: /3. Partial Read/i });
    fireEvent.click(partialReadBtn);

    expect(screen.getByText(/768 \/ 4096 Bytes/i)).toBeInTheDocument();
    // Under LT, FD 4 remains ready on rdllist because 768B remain
    expect(screen.getByText('1 Socket(s) Ready')).toBeInTheDocument();
    expect(screen.getAllByText('LT_PARTIAL_READ').length).toBeGreaterThanOrEqual(1);

    // 4. Switch to Edge-Triggered (ET) mode
    const etModeBtn = screen.getByRole('button', { name: 'Edge-Triggered (ET)' });
    fireEvent.click(etModeBtn);

    expect(etModeBtn).toHaveClass('bg-amber-600');
    expect(screen.getByText('0 Socket(s) Ready')).toBeInTheDocument();

    // 5. Inject packet and trigger Edge-Triggered Partial Read Stall Hazard
    fireEvent.click(injectBtn);
    expect(screen.getByText('1 Socket(s) Ready')).toBeInTheDocument();

    // Call epoll_wait() - under ET, this consumes the event and removes from rdllist
    fireEvent.click(waitBtn);
    expect(screen.getByText('0 Socket(s) Ready')).toBeInTheDocument();

    // Partial Read under ET leaves data trapped without ready notification!
    fireEvent.click(partialReadBtn);
    expect(screen.getByText(/CRITICAL EDGE-TRIGGERED STALL DETECTED/i)).toBeInTheDocument();
    expect(screen.getAllByText('ET_STALL_HAZARD').length).toBeGreaterThanOrEqual(1);

    // 6. Drain to EAGAIN to satisfy Edge-Triggered contract
    const drainBtn = screen.getByRole('button', { name: /4. Drain to EAGAIN/i });
    fireEvent.click(drainBtn);

    expect(screen.queryByText(/CRITICAL EDGE-TRIGGERED STALL DETECTED/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/0 \/ 4096 Bytes/i).length).toBe(4);
    expect(screen.getAllByText('DRAIN_EAGAIN').length).toBeGreaterThanOrEqual(1);

    // 7. Reset epoll Lab
    const resetBtn = screen.getByRole('button', { name: /Reset epoll Lab/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('0 Socket(s) Ready')).toBeInTheDocument();
  });
});
