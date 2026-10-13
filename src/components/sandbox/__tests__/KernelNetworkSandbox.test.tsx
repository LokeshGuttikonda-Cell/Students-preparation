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

  it('switches to TCP BBR & Bufferbloat and verifies Kleinrock optimal operating point, Reno queue bloat, tail drop, and BBR 4-phase state machine', () => {
    render(<KernelNetworkSandbox />);

    // Switch to BBR & Bufferbloat tab
    const bbrTabBtn = screen.getByRole('button', { name: /BBR & Bufferbloat/i });
    fireEvent.click(bbrTabBtn);

    // Verify Title & Baseline
    expect(screen.getByText(/TCP BBR Congestion Control vs Loss-Based Reno\/CUBIC & Bufferbloat Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Kleinrock Optimal Point: Zero Queuing Delay & 100% Wire Saturation/i)).toBeInTheDocument();
    expect(screen.getByText(/Inflight Wire \(BDP = 25 pkts\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Step 1 of 8/i).length).toBeGreaterThanOrEqual(1);

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    const resetBtn = screen.getByRole('button', { name: /Reset Studio/i });

    // Step 2: Loss-Based Reno Bufferbloat Trap
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/Step 2 of 8/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Loss-Based Reno\/CUBIC Additive Increase: The Bufferbloat Trap/i)).toBeInTheDocument();
    expect(screen.getByText(/Bufferbloat Hazard: Standing Queue Inflates Latency/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Queuing Delay: \+40 ms/i).length).toBeGreaterThanOrEqual(1);

    // Step 3: Buffer Overflow & Tail Drop
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/Step 3 of 8/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Buffer Overflow & Tail Drop: Packet Loss and Halving Collapse/i)).toBeInTheDocument();
    expect(screen.getByText(/Tail Drop Event: Buffer Saturated & Multiplicative cwnd Collapse/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tail Dropped \(8 pkts\)/i).length).toBeGreaterThanOrEqual(1);

    // Step 4: BBR STARTUP
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/Step 4 of 8/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/BBR State Machine Phase 1: STARTUP \(Bottleneck Bandwidth Search\)/i)).toBeInTheDocument();
    expect(screen.getByText(/BBR STARTUP: Exponential Search Discovers Bottleneck/i)).toBeInTheDocument();
    expect(screen.getByText(/2.89x \(2\/ln2\)/i)).toBeInTheDocument();

    // Step 5: BBR DRAIN
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/Step 5 of 8/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/BBR State Machine Phase 2: DRAIN \(Purging the Startup Queue\)/i)).toBeInTheDocument();
    expect(screen.getByText(/BBR DRAIN: Queue Drained to Zero via Under-Pacing/i)).toBeInTheDocument();
    expect(screen.getByText(/0.35x \(1\/2.89\)/i)).toBeInTheDocument();

    // Step 6: BBR PROBE_BW
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/Step 6 of 8/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/BBR State Machine Phase 3: PROBE_BW \(Cyclic Pacing Gain Cycling\)/i)).toBeInTheDocument();
    expect(screen.getByText(/BBR PROBE_BW: 8-Phase Gain Modulation Probes Bandwidth Without Bloat/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\[1.25, 0.75, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0\]/i).length).toBeGreaterThanOrEqual(1);

    // Step 7: BBR PROBE_RTT
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/Step 7 of 8/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/BBR State Machine Phase 4: PROBE_RTT \(Min-RTT Unmasking\)/i)).toBeInTheDocument();
    expect(screen.getByText(/BBR PROBE_RTT: cwnd Clamped to 4 Packets/i)).toBeInTheDocument();
    expect(screen.getByText(/1.0x \(Probe-RTT Clamp\)/i)).toBeInTheDocument();

    // Step 8: Full Benchmark Verification & Invariants
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/Step 8 of 8/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Quantitative Bufferbloat Benchmark: BBR vs Reno\/CUBIC Invariants/i)).toBeInTheDocument();
    expect(screen.getByText(/✓ TCP BBR Congestion Control Verified/i)).toBeInTheDocument();
    expect(screen.getByText('1. Kleinrock Optimal Operating Point')).toBeInTheDocument();
    expect(screen.getByText('2. Bufferbloat & Standing Queues')).toBeInTheDocument();
    expect(screen.getByText('3. Cyclic Pacing Gain Modulation')).toBeInTheDocument();
    expect(screen.getByText('4. Probe-RTT Min-Latency Sampling')).toBeInTheDocument();

    // Interactive parameter testing
    const cap50Btn = screen.getByRole('button', { name: '50 pkts' });
    fireEvent.click(cap50Btn);
    expect(screen.getByText(/Buffer Capacity: 50 packets/i)).toBeInTheDocument();

    const burstBtn = screen.getByRole('button', { name: /\+ Inject Burst/i });
    fireEvent.click(burstBtn);
    expect(screen.getByText(/Burst Active/i)).toBeInTheDocument();

    // Reset Studio
    fireEvent.click(resetBtn);
    expect(screen.getAllByText(/Step 1 of 8/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Kleinrock Optimal Point: Zero Queuing Delay/i)).toBeInTheDocument();
  });

  it('switches to eBPF & XDP Packet Filter Studio and verifies registers, bounds checking, DDoS mitigation, and invariants', () => {
    render(<KernelNetworkSandbox />);

    const ebpfTabBtn = screen.getByRole('button', { name: /eBPF & XDP Packet Filter/i });
    fireEvent.click(ebpfTabBtn);

    // Verify Header & Architecture
    expect(
      screen.getByText(/Linux Kernel eBPF Virtual Machine & XDP Packet Filter Studio/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/JIT: x86-64 Native \(Active\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Verifier: Safety Proof OK \(DAG\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Mode: XDP_NATIVE_DRIVER/i)).toBeInTheDocument();

    // Verify Datapath Comparison
    expect(screen.getAllByText(/Standard Linux Network Stack/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/XDP In-Situ Driver Hook \(eBPF\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero sk_buff Allocation Invariant/i)).toBeInTheDocument();

    // Verify 11 Virtual CPU Registers Grid
    expect(screen.getByText(/eBPF Virtual CPU 11-Register State/i)).toBeInTheDocument();
    expect(screen.getByText('R0')).toBeInTheDocument();
    expect(screen.getByText('R1')).toBeInTheDocument();
    expect(screen.getByText('R2')).toBeInTheDocument();
    expect(screen.getByText('R3')).toBeInTheDocument();
    expect(screen.getByText('R10')).toBeInTheDocument();

    // Verify In-Kernel BPF Map
    expect(screen.getByText(/BPF Map: ip_blacklist_map/i)).toBeInTheDocument();
    expect(screen.getByText('198.51.100.23')).toBeInTheDocument();
    expect(screen.getByText('203.0.113.88')).toBeInTheDocument();

    // Verify Initial Step 1
    expect(screen.getByText(/1\. NIC RX Ring Buffer Ingress/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage: NIC_RX_DMA/i)).toBeInTheDocument();

    // Step to Step 2: Verifier Bounds Check
    const nextBtn = screen.getByRole('button', { name: /Next Instruction ▶/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText(/2\. In-Kernel Static Verifier Safety & Bounds Check/i)).toBeInTheDocument();
    expect(screen.getByText(/VERIFIER SAFETY PASSED/i)).toBeInTheDocument();

    // Step to Step 5: BPF Map Lookup
    fireEvent.click(nextBtn); // Step 3
    fireEvent.click(nextBtn); // Step 4
    fireEvent.click(nextBtn); // Step 5
    expect(screen.getByText(/5\. In-Kernel BPF Map Lookup/i)).toBeInTheDocument();
    expect(screen.getByText(/BLACKLIST_HIT/i)).toBeInTheDocument();

    // Step to Step 7: Verdict Assignment (R0 = XDP_DROP)
    fireEvent.click(nextBtn); // Step 6
    fireEvent.click(nextBtn); // Step 7
    expect(screen.getByText(/7\. XDP Verdict Assignment/i)).toBeInTheDocument();
    expect(screen.getByText(/XDP_DROP \(Zero-Copy Driver Wire Drop\)/i)).toBeInTheDocument();

    // Step to Step 8: Execution & Invariants
    fireEvent.click(nextBtn);
    expect(screen.getByText(/8\. Driver Execution & Line-Rate Hardware Mitigation/i)).toBeInTheDocument();
    expect(screen.getByText(/XDP NATIVE DRIVER TRIUMPH/i)).toBeInTheDocument();

    // Verify 4 Socratic Invariants
    expect(screen.getByText('1. In-Situ RX Ring Execution')).toBeInTheDocument();
    expect(screen.getByText('2. Mathematical Static Verifier Safety')).toBeInTheDocument();
    expect(screen.getByText('3. Lockless Per-CPU BPF Maps')).toBeInTheDocument();
    expect(screen.getByText('4. Linear iptables Complexity Elimination')).toBeInTheDocument();

    // Verify Quantitative Benchmark Table
    expect(screen.getByText(/Quantitative Kernel Packet Processing Benchmark/i)).toBeInTheDocument();
    expect(screen.getByText('24.8 Mpps / core')).toBeInTheDocument();

    // Test Scenario Switch: Clean Traffic
    const cleanBtn = screen.getByRole('button', { name: /Legitimate Web Traffic/i });
    fireEvent.click(cleanBtn);
    expect(screen.getByText(/Step 1 of 8/i)).toBeInTheDocument();

    // Test Scenario Switch: Verifier Fault Trap
    const faultBtn = screen.getByRole('button', { name: /Verifier Bounds Rejection Trap/i });
    fireEvent.click(faultBtn);
    expect(screen.getByText(/SAFETY VIOLATION!/i)).toBeInTheDocument();
    expect(screen.getAllByText(/XDP_ABORTED/i).length).toBeGreaterThanOrEqual(1);

    // Test Hook Mode Switch
    const iptablesBtn = screen.getByRole('button', { name: /Traditional Linux Stack/i });
    fireEvent.click(iptablesBtn);
    expect(screen.getByText(/Mode: TRADITIONAL_IPTABLES/i)).toBeInTheDocument();
  });
});


