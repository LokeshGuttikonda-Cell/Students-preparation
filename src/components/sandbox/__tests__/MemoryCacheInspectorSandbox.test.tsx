import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryCacheInspectorSandbox } from '../MemoryCacheInspectorSandbox';

describe('MemoryCacheInspectorSandbox', () => {
  it('renders Stack vs Heap simulator by default and steps through clean allocation lifecycle', () => {
    render(<MemoryCacheInspectorSandbox />);

    expect(screen.getByText('Process Virtual Memory & CPU Cache Coherence Simulator')).toBeInTheDocument();
    expect(screen.getByText('Safe Allocation & Free')).toBeInTheDocument();
    expect(screen.getByText('Initial Program Entry: main() Stack Frame Allocated')).toBeInTheDocument();
    expect(screen.getByText(/STEP 1 \/ 6/i)).toBeInTheDocument();

    // Step forward to step 2 (createUser call)
    const nextBtn = screen.getByRole('button', { name: /Next Step →/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Function Call: createUser() Stack Frame Pushed')).toBeInTheDocument();
    expect(screen.getByText(/STEP 2 \/ 6/i)).toBeInTheDocument();

    // Step forward to step 3 (malloc heap allocation)
    fireEvent.click(nextBtn);
    expect(screen.getByText('Heap Allocation: malloc(sizeof(User))')).toBeInTheDocument();
    expect(screen.getByText(/32 Bytes/i)).toBeInTheDocument();

    // Reset back to step 1
    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText('Initial Program Entry: main() Stack Frame Allocated')).toBeInTheDocument();
  });

  it('switches to Memory Leak and Use-After-Free scenarios in Stack vs Heap module', () => {
    render(<MemoryCacheInspectorSandbox />);

    // Switch to Memory Leak
    const leakBtn = screen.getByRole('button', { name: /Memory Leak \(Orphaned\)/i });
    fireEvent.click(leakBtn);

    expect(screen.getByText('Heap Chunk Allocated & Initialized')).toBeInTheDocument();
    const nextBtn = screen.getByRole('button', { name: /Next Step →/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Function Exits Without Calling free(temp)')).toBeInTheDocument();
    expect(screen.getByText(/CRITICAL MEMORY LEAK/i)).toBeInTheDocument();

    // Switch to Use-After-Free
    const uafBtn = screen.getByRole('button', { name: /Use-After-Free \(UAF\) Hazard/i });
    fireEvent.click(uafBtn);

    expect(screen.getByText('Object Allocated and Freed Without Nullifying Pointer')).toBeInTheDocument();
    expect(screen.getByText(/Dangling pointer hazard/i)).toBeInTheDocument();
  });

  it('switches to L1/L2 Cache Lines & False Sharing and tests struct padding and false sharing modes', () => {
    render(<MemoryCacheInspectorSandbox />);

    const cacheTabBtn = screen.getByRole('button', { name: /L1\/L2 Cache Lines & False Sharing/i });
    fireEvent.click(cacheTabBtn);

    // Default is Struct Packing & Alignment
    expect(screen.getByText(/64-Byte L1 Data Cache Line Byte Visualization/i)).toBeInTheDocument();
    expect(screen.getByText(/Naive Struct Order \(24 Bytes — 50% Padding Waste\)/i)).toBeInTheDocument();

    // Switch to Optimal Struct
    const optimalBtn = screen.getByRole('button', { name: /Optimal Reordered Struct/i });
    fireEvent.click(optimalBtn);
    expect(screen.getByText(/Exactly 4.0 structs per line/i)).toBeInTheDocument();

    // Switch to False Sharing sub-mode
    const falseSharingBtn = screen.getByRole('button', { name: /Multi-Core False Sharing/i });
    fireEvent.click(falseSharingBtn);

    expect(screen.getByText(/CPU Core 0 \(Thread 0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/CPU Core 1 \(Thread 1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/MESI Protocol Ping-Pong Storm/i)).toBeInTheDocument();

    // Step through false sharing
    const nextSharingBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextSharingBtn);
    expect(screen.getByText(/MODIFIED \(M\)/i)).toBeInTheDocument();

    // Switch to Padded variant
    const paddedBtn = screen.getByRole('button', { name: /Cache-Line Padded: alignas\(64\)/i });
    fireEvent.click(paddedBtn);
    expect(screen.getByText(/Zero Cache Coherence Contention/i)).toBeInTheDocument();
  });

  it('switches to Hash Table Collision Probing and tests chaining, linear, and quadratic probing', () => {
    render(<MemoryCacheInspectorSandbox />);

    const hashTabBtn = screen.getByRole('button', { name: /Hash Table Collision Probing/i });
    fireEvent.click(hashTabBtn);

    expect(screen.getByText(/Bucket Array Representation/i)).toBeInTheDocument();
    expect(screen.getByText(/Primary Clustering Observation/i)).toBeInTheDocument();

    // Test inserting and clearing
    const clearBtn = screen.getByRole('button', { name: /Clear Table/i });
    fireEvent.click(clearBtn);
    expect(screen.getByText(/0 \/ 8 Keys Inserted/i)).toBeInTheDocument();

    const insertNextBtn = screen.getByRole('button', { name: /Insert Next Key →/i });
    fireEvent.click(insertNextBtn);
    expect(screen.getByText(/1 \/ 8 Keys Inserted/i)).toBeInTheDocument();

    // Switch to Separate Chaining
    const chainingBtn = screen.getByRole('button', { name: /Separate Chaining/i });
    fireEvent.click(chainingBtn);
    expect(screen.getByText(/LinkedList Node Pointers/i)).toBeInTheDocument();
    expect(screen.getByText('Bucket [5]')).toBeInTheDocument();

    // Switch to Quadratic Probing
    const quadraticBtn = screen.getByRole('button', { name: /Quadratic Probing/i });
    fireEvent.click(quadraticBtn);
    expect(screen.getByText(/Quadratic Jump Offsets/i)).toBeInTheDocument();
    expect(screen.getByText(/Quadratic Invariant/i)).toBeInTheDocument();
  });
  it('switches to LSM-Tree & SSTables and tests writes, auto-flush, tombstone deletion, bloom filter read skipping, and leveled compaction', () => {
    render(<MemoryCacheInspectorSandbox />);

    const lsmTabBtn = screen.getByRole('button', { name: /LSM-Tree & SSTables/i });
    fireEvent.click(lsmTabBtn);

    // Verify Title & Initial State
    expect(
      screen.getByRole('heading', {
        name: 'Log-Structured Merge-Tree (LSM-Tree) & SSTable Compaction Studio',
        level: 3,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('In-Memory Tier (RAM)')).toBeInTheDocument();
    expect(screen.getByText('Sequential Write-Ahead Log (WAL)')).toBeInTheDocument();
    expect(screen.getByText('Persistent Storage Tier (Disk / SSD)')).toBeInTheDocument();
    expect(screen.getByText('1 / 4 Entries')).toBeInTheDocument();
    expect(screen.getByText('user:088')).toBeInTheDocument();

    // 1. Insert keys up to capacity (triggering auto-flush)
    const putAliceBtn = screen.getByRole('button', { name: /\+ Put "user:101=Alice"/i });
    fireEvent.click(putAliceBtn);
    expect(screen.getByText('2 / 4 Entries')).toBeInTheDocument();

    const putBobBtn = screen.getByRole('button', { name: /\+ Put "user:204=Bob"/i });
    fireEvent.click(putBobBtn);
    expect(screen.getByText('3 / 4 Entries')).toBeInTheDocument();

    // Fourth insertion triggers auto-flush to L0 SSTable
    const putDavidBtn = screen.getByRole('button', { name: /Put "user:412=David" \(Triggers Auto-Flush\)/i });
    fireEvent.click(putDavidBtn);

    // MemTable should now be 0 / 4 (flushed)
    expect(screen.getByText('0 / 4 Entries')).toBeInTheDocument();
    expect(screen.getByText(/MemTable is empty \(flushed to disk\)/i)).toBeInTheDocument();
    expect(screen.getAllByText('2 Tables').length).toBeGreaterThanOrEqual(1); // L0 tables count increased from 1 to 2

    // 2. Tombstone Deletion
    const deleteBtn = screen.getByRole('button', { name: /Delete "user:101" \(Tombstone\)/i });
    fireEvent.click(deleteBtn);
    expect(screen.getByText('1 / 4 Entries')).toBeInTheDocument();
    expect(screen.getByText('TOMBSTONE')).toBeInTheDocument();
    expect(screen.getAllByText('✝ DELETED').length).toBeGreaterThanOrEqual(1);

    // 3. Point Read Query for existing key (Trace check)
    const queryBobBtn = screen.getByRole('button', { name: /Query "user:204"/i });
    fireEvent.click(queryBobBtn);
    expect(screen.getByText(/Multi-Tier Read Pipeline Execution Trace:/i)).toBeInTheDocument();
    expect(screen.getAllByText('HIT').length).toBeGreaterThanOrEqual(1);

    // 4. Point Read Query for missing key (Bloom Filter Negative Skip)
    const queryMissingBtn = screen.getByRole('button', { name: /Query Missing "user:999"/i });
    fireEvent.click(queryMissingBtn);
    expect(screen.getAllByText(/BLOOM_FILTER_NEGATIVE_SKIP/i).length).toBeGreaterThanOrEqual(1);

    // 5. Trigger Leveled Compaction
    const compactBtn = screen.getByRole('button', { name: /Trigger Leveled Compaction/i });
    fireEvent.click(compactBtn);
    expect(screen.getAllByText('0 Tables').length).toBeGreaterThanOrEqual(1); // L0 tables compacted into L1
    expect(screen.getByText(/No L0 tables on disk \(compacted into L1\)/i)).toBeInTheDocument();

    // 6. Reset Engine
    const resetBtn = screen.getByRole('button', { name: /Reset Engine/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText('1 / 4 Entries')).toBeInTheDocument();
    expect(screen.getAllByText('1 Tables').length).toBeGreaterThanOrEqual(1); // L0 restored to 1 table
  });

  it('switches to ARIES Database Recovery and tests Crash, Analysis, Redo, and Undo passes with CLRs', () => {
    render(<MemoryCacheInspectorSandbox />);

    const ariesTab = screen.getByRole('button', { name: /ARIES Database Recovery/i });
    fireEvent.click(ariesTab);

    // Initial steady state
    expect(screen.getByText('Durable Disk Write-Ahead Log (WAL Stream)')).toBeInTheDocument();
    expect(screen.getByText('STATUS: IDLE')).toBeInTheDocument();
    expect(screen.getAllByText(/PageLSN: 50/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('ACTIVE IN RAM ✓').length).toBeGreaterThanOrEqual(1);

    // 1. Trigger Database Crash
    const crashBtn = screen.getByRole('button', { name: /⚡ Trigger Database Crash/i });
    fireEvent.click(crashBtn);

    expect(screen.getByText('STATUS: CRASHED')).toBeInTheDocument();
    expect(screen.getAllByText('WIPED ON CRASH ✕').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Buffer Pool is completely empty/i)).toBeInTheDocument();

    // 2. Pass 1: Analysis Pass
    const analysisBtn = screen.getByRole('button', { name: /Pass 1: Analysis/i });
    fireEvent.click(analysisBtn);

    expect(screen.getByText('STATUS: ANALYSIS_COMPLETE')).toBeInTheDocument();
    expect(screen.getByText(/Losers: \[T2, T3\]/i)).toBeInTheDocument();
    expect(screen.getByText(/RedoStartLSN: 20/i)).toBeInTheDocument();

    // 3. Pass 2: Redo Pass (Repeating History)
    const redoBtn = screen.getByRole('button', { name: /Pass 2: Redo \(Repeat History\)/i });
    fireEvent.click(redoBtn);

    expect(screen.getByText('STATUS: REDO_COMPLETE')).toBeInTheDocument();
    expect(screen.getAllByText('REPEATING_HISTORY').length).toBeGreaterThanOrEqual(1);

    // 4. Pass 3: Undo Pass (Rollback Losers and emit CLRs)
    const undoBtn = screen.getByRole('button', { name: /Pass 3: Undo \(Rollback Losers\)/i });
    fireEvent.click(undoBtn);

    expect(screen.getByText('STATUS: UNDO_COMPLETE')).toBeInTheDocument();
    expect(screen.getAllByText('ROLLBACK_DONE').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/4 CLRs Emitted/i)).toBeInTheDocument();
    expect(screen.getAllByText('CLR').length).toBeGreaterThanOrEqual(2);

    // 5. Reset Engine
    const resetBtn = screen.getByRole('button', { name: /Reset Engine/i });
    fireEvent.click(resetBtn);
    expect(screen.getByText('STATUS: IDLE')).toBeInTheDocument();
  });

  it('switches to Cache Stampede & XFetch and tests Naive Expiry, Mutex Singleflight, and Probabilistic Early Refresh', () => {
    render(<MemoryCacheInspectorSandbox />);

    const stampedeTab = screen.getByRole('button', { name: /Cache Stampede & XFetch/i });
    fireEvent.click(stampedeTab);

    // Initial steady state
    expect(screen.getByText('Two-Tier Cache Stampede & Probabilistic Early Recomputation (XFetch)')).toBeInTheDocument();
    expect(screen.getByText(/Tier 1: L1 In-Process Cache/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 2: L2 Distributed Cache/i)).toBeInTheDocument();
    expect(screen.getByText(/Tier 3: Relational Database/i)).toBeInTheDocument();
    expect(screen.getByText('The XFetch Optimal Early Recomputation Invariant (VLDB 2015)')).toBeInTheDocument();

    // 1. Test XFetch Probabilistic Strategy near expiry
    const jumpBtn = screen.getByRole('button', { name: /Near Expiry \(9.8s\)/i });
    fireEvent.click(jumpBtn);

    const burst50Btn = screen.getByRole('button', { name: /⚡ 50 Reqs/i });
    fireEvent.click(burst50Btn);

    expect(screen.getAllByText(/OPTIMAL PROBABILISTIC REFRESH/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('100%')).toBeInTheDocument(); // Cache hit rate 100%

    // 2. Switch to Naive TTL Expiry and test Cache Stampede
    const naiveBtn = screen.getByRole('button', { name: /1. Naive TTL Expiry/i });
    fireEvent.click(naiveBtn);

    const expireBtn = screen.getByRole('button', { name: /Expire \(10s\)/i });
    fireEvent.click(expireBtn);

    const burst100Btn = screen.getByRole('button', { name: /⚡ 100 Reqs/i });
    fireEvent.click(burst100Btn);

    expect(screen.getAllByText(/CATASTROPHIC STAMPEDE/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/10 \/ 10/i).length).toBeGreaterThanOrEqual(1); // 10/10 connection pool saturated

    // 3. Switch to Distributed Mutex (Singleflight)
    const mutexBtn = screen.getByRole('button', { name: /2. Distributed Mutex/i });
    fireEvent.click(mutexBtn);

    // Force expire again
    fireEvent.click(expireBtn);
    fireEvent.click(burst50Btn);

    expect(screen.getAllByText(/MUTEX SINGLEFLIGHT/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/1 \/ 10/i).length).toBeGreaterThanOrEqual(1); // Only 1 DB connection used

    // Test Mutex crash simulation
    const crashWorkerBtn = screen.getByRole('button', { name: /Crash Mutex Worker/i });
    fireEvent.click(crashWorkerBtn);

    fireEvent.click(burst50Btn);
    expect(screen.getAllByText(/DEADLOCK COLLAPSE/i).length).toBeGreaterThanOrEqual(1);

    // 4. Test Sliders: Beta and Delta
    const betaSlider = screen.getByLabelText(/XFetch Beta Multiplier/i);
    fireEvent.change(betaSlider, { target: { value: '1.5' } });
    expect(screen.getByText('1.5×')).toBeInTheDocument();

    // 5. Reset Studio
    const resetBtn = screen.getByRole('button', { name: /Reset Studio/i });
    fireEvent.click(resetBtn);
    expect(screen.getAllByText(/remaining TTL = 1.5s/i).length).toBeGreaterThanOrEqual(1);
  });
});
