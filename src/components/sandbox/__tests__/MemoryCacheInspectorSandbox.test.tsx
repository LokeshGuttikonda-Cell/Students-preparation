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
});
