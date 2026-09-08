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

  it('switches to B-Tree Concurrency & OLC and tests Lock Crabbing, OLC versioning, split contention, and optimistic restarts', () => {
    render(<MemoryCacheInspectorSandbox />);

    // Switch to B-Tree Concurrency & OLC subtab
    const bTreeTab = screen.getByRole('button', { name: /B-Tree Concurrency & OLC/i });
    fireEvent.click(bTreeTab);

    // Initial steady state
    expect(screen.getByText('B-Tree Storage Engine Concurrency: Pessimistic Lock Crabbing vs Optimistic Lock Coupling (OLC)')).toBeInTheDocument();
    expect(screen.getByText('ROOT NODE')).toBeInTheDocument();
    expect(screen.getByText('Internal I1')).toBeInTheDocument();
    expect(screen.getByText('Internal I2')).toBeInTheDocument();
    expect(screen.getByText('Leaf L1 [10-24]')).toBeInTheDocument();
    expect(screen.getByText('Leaf L2 [25-49]')).toBeInTheDocument();

    // Default strategy is OLC
    expect(screen.getByRole('button', { name: 'Optimistic Coupling (OLC)' })).toHaveClass('bg-emerald-600');

    // 1. Run Clean Reader Traversal (OLC)
    const readBtn = screen.getByRole('button', { name: /Clean Read/i });
    fireEvent.click(readBtn);

    expect(screen.getAllByText('COMMITTED').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Traversed Root.*zero locks/i)).toBeInTheDocument();
    expect(screen.getAllByText('OLC_READ_LOCK_FREE').length).toBeGreaterThanOrEqual(1);

    // 2. Run Writer Mutation (Insert 45) under OLC
    const writeBtn = screen.getByRole('button', { name: /Writer Mutation/i });
    fireEvent.click(writeBtn);

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getAllByText('OLC_WRITE_VERSION_BUMP').length).toBeGreaterThanOrEqual(1);

    // 3. Simulate Reader Collision & Optimistic Restart (OLC)
    const collisionBtn = screen.getByRole('button', { name: /Simulate OLC Collision/i });
    fireEvent.click(collisionBtn);

    expect(screen.getByText('RESTARTED_COLLISION')).toBeInTheDocument();
    expect(screen.getByText(/OPTIMISTIC RESTART: Reader observed v_start = 102/i)).toBeInTheDocument();
    expect(screen.getAllByText('OPTIMISTIC_RESTART').length).toBeGreaterThanOrEqual(1);

    // 4. Switch to Pessimistic Lock Crabbing
    const crabbingBtn = screen.getByRole('button', { name: 'Pessimistic Crabbing' });
    fireEvent.click(crabbingBtn);

    expect(crabbingBtn).toHaveClass('bg-sky-700');

    // 5. Simulate Node Split Hazard under Pessimistic Crabbing
    const splitBtn = screen.getByRole('button', { name: /Node Split Hazard/i });
    fireEvent.click(splitBtn);

    expect(screen.getByText(/ROOT CONTENTION COLLAPSE/i)).toBeInTheDocument();
    expect(screen.getByText('BLOCKED_LOCK')).toBeInTheDocument();
    expect(screen.getAllByText('ROOT_X_LOCK_BLOCKING').length).toBeGreaterThanOrEqual(1);

    // 6. Run Reader Traversal under Pessimistic Crabbing
    fireEvent.click(readBtn);
    expect(screen.getByText(/S-lock Root -> S-lock I1/i)).toBeInTheDocument();
    expect(screen.getAllByText('S_LOCK_CRAB').length).toBeGreaterThanOrEqual(1);

    // 7. Reset B-Tree
    const resetBtn = screen.getByRole('button', { name: /Reset B-Tree/i });
    fireEvent.click(resetBtn);

    expect(screen.queryByText(/ROOT CONTENTION COLLAPSE/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('IDLE').length).toBe(2);
  });
  it('switches to MVCC & Snapshot Isolation and tests concurrent reads, Write Skew anomaly, and SSI cycle abort', () => {
    render(<MemoryCacheInspectorSandbox />);

    // Switch to MVCC & Snapshot Isolation subtab
    const mvccTab = screen.getByRole('button', { name: /MVCC & Snapshot Isolation/i });
    fireEvent.click(mvccTab);

    // Initial steady state
    expect(screen.getByText('MVCC Tuple Visibility, Snapshot Isolation & Write Skew Anomalies')).toBeInTheDocument();
    expect(screen.getByText('MVCC Physical Tuple Heap & Version Chain')).toBeInTheDocument();
    expect(screen.getByText('2 Active Doctor(s)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Snapshot Isolation (SI)' })).toHaveClass('bg-primary-700');

    // 1. Concurrent Snapshot Reads (T1 & T2)
    const step1Btn = screen.getByRole('button', { name: /1. T1 & T2 Snapshot & Read Count/i });
    fireEvent.click(step1Btn);

    expect(screen.getAllByText('ACTIVE_READ').length).toBe(2);
    expect(screen.getAllByText('CONCURRENT_SNAPSHOT_READ').length).toBeGreaterThanOrEqual(1);

    // 2. T1 modifies Alice and Commits
    const step2Btn = screen.getByRole('button', { name: /2. T1 Off-Call Alice & Commit/i });
    fireEvent.click(step2Btn);

    expect(screen.getByText('Alice-v2')).toBeInTheDocument();
    expect(screen.getByText('EXPIRED (xmax=101)')).toBeInTheDocument();
    expect(screen.getAllByText('COMMITTED').length).toBe(1);
    expect(screen.getAllByText('T1_COMMITTED').length).toBeGreaterThanOrEqual(1);

    // 3. T2 modifies Bob and attempts commit under Snapshot Isolation (causes Write Skew)
    const step3Btn = screen.getByRole('button', { name: /3. T2 Off-Call Bob & Attempt Commit/i });
    fireEvent.click(step3Btn);

    expect(screen.getByText('Bob-v2')).toBeInTheDocument();
    expect(screen.getAllByText('COMMITTED').length).toBe(2);
    expect(screen.getByText('0 Active Doctor(s)')).toBeInTheDocument();
    expect(screen.getByText(/CRITICAL WRITE SKEW.*Berenson.*ANOMALY DETECTED/i)).toBeInTheDocument();
    expect(screen.getAllByText('WRITE_SKEW_HAZARD').length).toBeGreaterThanOrEqual(1);

    // 4. Switch to Serializable SSI mode
    const ssiModeBtn = screen.getByRole('button', { name: 'Serializable SSI' });
    fireEvent.click(ssiModeBtn);

    expect(ssiModeBtn).toHaveClass('bg-amber-600');
    expect(screen.getByText('2 Active Doctor(s)')).toBeInTheDocument();
    expect(screen.queryByText(/CRITICAL WRITE SKEW/i)).not.toBeInTheDocument();

    // 5. Re-run under SSI: Step 1 -> Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: /1. T1 & T2 Snapshot & Read Count/i }));
    fireEvent.click(screen.getByRole('button', { name: /2. T1 Off-Call Alice & Commit/i }));
    fireEvent.click(screen.getByRole('button', { name: /3. T2 Off-Call Bob & Attempt Commit/i }));

    // SSI aborts T2 with serialization_failure!
    expect(screen.getByText('ABORTED_SSI_CYCLE')).toBeInTheDocument();
    expect(screen.getByText(/SSI Serializability Safety Verified: Cycle Blocked/i)).toBeInTheDocument();
    expect(screen.getAllByText('SSI_CYCLE_ABORT').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('1 Active Doctor(s)')).toBeInTheDocument();

    // 6. Reset MVCC Lab
    const resetBtn = screen.getByRole('button', { name: /Reset MVCC Lab/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('2 Active Doctor(s)')).toBeInTheDocument();
    expect(screen.queryByText(/SSI Serializability Safety Verified/i)).not.toBeInTheDocument();
  });
});
