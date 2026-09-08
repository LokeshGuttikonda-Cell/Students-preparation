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
});
