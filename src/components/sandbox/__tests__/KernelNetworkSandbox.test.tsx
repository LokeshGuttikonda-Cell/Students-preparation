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
  it('switches to Zero-Copy & io_uring and tests read/write, sendfile, and io_uring ring buffer execution', () => {
    render(<KernelNetworkSandbox />);

    // Switch to Zero-Copy subtab
    const zeroCopyTab = screen.getByRole('button', { name: /Zero-Copy & io_uring/i });
    fireEvent.click(zeroCopyTab);

    // Initial steady state
    expect(screen.getByText('Zero-Copy Linux Kernel I/O: Traditional read()/write() vs sendfile() & io_uring')).toBeInTheDocument();
    expect(screen.getByText('Kernel Space vs User Space Buffer Pipeline')).toBeInTheDocument();
    expect(screen.getByText('io_uring Lockless Shared-Memory Ring Buffer Inspector')).toBeInTheDocument();

    // Default mode is traditional read()/write()
    expect(screen.getByRole('button', { name: 'read()/write()' })).toHaveClass('bg-rose-600');
    expect(screen.getByText('AWAITING_EXECUTION')).toBeInTheDocument();

    // 1. Execute Traditional read/write Transfer
    const transferBtn = screen.getByRole('button', { name: /1. Execute 64KB I\/O Transfer/i });
    fireEvent.click(transferBtn);

    expect(screen.getByText('TRANSFER_COMPLETED')).toBeInTheDocument();
    expect(screen.getAllByText('READ_WRITE_TRANSFER').length).toBeGreaterThanOrEqual(1);

    // 2. Switch to sendfile() mode
    const sendfileBtn = screen.getByRole('button', { name: 'sendfile()' });
    fireEvent.click(sendfileBtn);

    expect(sendfileBtn).toHaveClass('bg-amber-600');
    expect(screen.getByText('Active: SENDFILE_ZERO_COPY')).toBeInTheDocument();

    fireEvent.click(transferBtn);
    expect(screen.getAllByText('SENDFILE_ZERO_COPY').length).toBeGreaterThanOrEqual(1);

    // 3. Switch to io_uring mode
    const ioUringBtn = screen.getByRole('button', { name: 'io_uring' });
    fireEvent.click(ioUringBtn);

    expect(ioUringBtn).toHaveClass('bg-emerald-600');
    expect(screen.getByText('Active: IO_URING_RING_BUFFER')).toBeInTheDocument();

    fireEvent.click(transferBtn);
    expect(screen.getAllByText('IO_URING_ASYNC').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/res = 65536 Bytes OK/i).length).toBe(2);

    // 4. Reset I/O Pipeline
    const resetBtn = screen.getByRole('button', { name: /Reset I\/O Pipeline/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('AWAITING_EXECUTION')).toBeInTheDocument();
  });

  it('switches to Virtual Memory & TLB and verifies 48-bit address walk, TLB hit, miss walk, COW soft fault, and 2MB THP', () => {
    render(<KernelNetworkSandbox />);

    // Switch to Virtual Memory & TLB subtab
    const vmTabBtn = screen.getByRole('button', { name: /Virtual Memory & TLB/i });
    fireEvent.click(vmTabBtn);

    // Verify Title & Canonical Decomposition
    expect(screen.getByText(/Virtual Memory, Multi-Level Page Tables & Translation Lookaside Buffer \(TLB\)/i)).toBeInTheDocument();
    expect(screen.getByText('48-Bit Canonical Virtual Address Decomposition')).toBeInTheDocument();
    expect(screen.getByText(/PGD Index \(L4\)/i)).toBeInTheDocument();
    expect(screen.getByText(/PUD Index \(L3\)/i)).toBeInTheDocument();
    expect(screen.getByText(/PMD Index \(L2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/PTE Index \(L1\)/i)).toBeInTheDocument();

    // Default address 0x7fff_cafe_4000 is a TLB Hit
    expect(screen.getByText(/TLB Hit: Instant 1-Cycle MMU Translation/i)).toBeInTheDocument();
    expect(screen.getByText('1 Cycle')).toBeInTheDocument();

    // 1. Select Cold Heap page -> Triggers TLB Miss & 4-Level Page Walk
    const heapPresetBtn = screen.getByRole('button', { name: /3\. Heap Allocation/i });
    fireEvent.click(heapPresetBtn);

    expect(screen.getByText(/TLB Miss: Full 4-Level Page Table Walk Initiated/i)).toBeInTheDocument();
    expect(screen.getByText('241 Cycles')).toBeInTheDocument();
    expect(screen.getAllByText(/TLB_MISS_WALK/i).length).toBeGreaterThanOrEqual(1);

    // 2. Select Fork COW page -> Triggers Soft Page Fault (Copy-on-Write)
    const cowPresetBtn = screen.getByRole('button', { name: /5\. Fork COW Page/i });
    fireEvent.click(cowPresetBtn);

    expect(screen.getByText(/Soft Page Fault: Copy-on-Write \(COW\) Frame Duplicate/i)).toBeInTheDocument();
    expect(screen.getByText('1,200 Cycles')).toBeInTheDocument();
    expect(screen.getAllByText(/PAGE_FAULT_COW/i).length).toBeGreaterThanOrEqual(1);

    // 3. Toggle Transparent Huge Pages (THP 2MB)
    const thpToggleBtn = screen.getByRole('button', { name: /Switch to 2MB Huge Pages/i });
    fireEvent.click(thpToggleBtn);

    expect(screen.getByText(/✓ THP 2MB Active/i)).toBeInTheDocument();
    expect(screen.getByText('3 Levels (Bypasses PTE)')).toBeInTheDocument();

    // 4. Test Flush TLB (INVLPG)
    const flushBtn = screen.getByRole('button', { name: /Flush TLB \(INVLPG\)/i });
    fireEvent.click(flushBtn);

    expect(screen.getAllByText(/INVLPG_SHOOTDOWN/i).length).toBeGreaterThanOrEqual(1);

    // 5. Test Reset MMU Lab
    const resetBtn = screen.getByRole('button', { name: /Reset MMU Lab/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText(/Switch to 2MB Huge Pages/i)).toBeInTheDocument();
    expect(screen.getByText(/TLB Hit: Instant 1-Cycle MMU Translation/i)).toBeInTheDocument();
  });
});
