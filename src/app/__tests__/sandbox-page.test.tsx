import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SandboxPage from '../(student)/sandbox/page';

vi.mock('../../components/sandbox/SqlQuerySandbox', () => ({
  SqlQuerySandbox: ({ title, taskDescription }: { title: string; taskDescription?: string }) => (
    <div data-testid="sql-sandbox-mock">
      <h4>{title}</h4>
      <p>{taskDescription}</p>
    </div>
  ),
}));

vi.mock('../../components/sandbox/CodeLogicSandbox', () => ({
  CodeLogicSandbox: ({ title, problemDescription }: { title: string; problemDescription?: string }) => (
    <div data-testid="code-sandbox-mock">
      <h4>{title}</h4>
      <p>{problemDescription}</p>
    </div>
  ),
}));

describe('SandboxPage', () => {
  it('renders SQL challenges by default with challenge pills', () => {
    render(<SandboxPage />);

    expect(screen.getByText('Interactive Code & SQL Studio')).toBeInTheDocument();
    expect(screen.getByTestId('sql-sandbox-mock')).toBeInTheDocument();
    expect(screen.getAllByText('Department Headcount & Average Compensation').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /Employees Earning Above Department Average/i })).toBeInTheDocument();
  });

  it('switches active SQL challenge when clicking a challenge button', () => {
    render(<SandboxPage />);

    const aboveAvgBtn = screen.getByRole('button', { name: /Employees Earning Above Department Average/i });
    fireEvent.click(aboveAvgBtn);

    const mockSandbox = screen.getByTestId('sql-sandbox-mock');
    expect(mockSandbox).toHaveTextContent('Employees Earning Above Department Average');
    expect(mockSandbox).toHaveTextContent('Identify employees whose compensation exceeds the average salary');
  });

  it('switches to Code tab and renders code challenges including Dynamic Programming and Prefix Search', () => {
    render(<SandboxPage />);

    const codeTabBtn = screen.getByRole('button', { name: /Algorithmic Code Logic Lab/i });
    fireEvent.click(codeTabBtn);

    expect(screen.getByTestId('code-sandbox-mock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Two-Sum Linear Search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Minimum Coins for Change/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Prefix Matching & Lexicographical Ordering/i })).toBeInTheDocument();

    // Select Minimum Coins for Change
    const coinChangeBtn = screen.getByRole('button', { name: /Minimum Coins for Change/i });
    fireEvent.click(coinChangeBtn);

    const mockSandbox = screen.getByTestId('code-sandbox-mock');
    expect(mockSandbox).toHaveTextContent('Minimum Coins for Change (Dynamic Programming)');
    expect(mockSandbox).toHaveTextContent('Find the minimum number of coins needed to make up a given amount');
  });

  it('switches to Visual Algorithm Stepper tab and interacts with visual stepper controls', () => {
    render(<SandboxPage />);

    const visualizerTabBtn = screen.getByRole('button', { name: /Visual Algorithm Stepper/i });
    fireEvent.click(visualizerTabBtn);

    expect(screen.getByText('Interactive State Stepper & Memory Inspector')).toBeInTheDocument();
    expect(screen.getByText('Binary Search (Logarithmic Range Elimination)')).toBeInTheDocument();

    // Step forward
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);

    expect(screen.getByText('Eliminate Left Half: 47 < 68')).toBeInTheDocument();

    // Switch to Two-Pointer algorithm
    const twoPointerBtn = screen.getByRole('button', { name: /Two-Pointer Target Sum Traversal/i });
    fireEvent.click(twoPointerBtn);

    expect(screen.getByText('Initial Extremes: left = 0, right = 7')).toBeInTheDocument();

    // Switch to Graph BFS algorithm
    const bfsBtn = screen.getByRole('button', { name: /Breadth-First Search/i });
    fireEvent.click(bfsBtn);

    expect(screen.getByText('Interactive Graph Topology & Frontier')).toBeInTheDocument();
    expect(screen.getByText('BFS Initialization: Enqueue Source Vertex A')).toBeInTheDocument();

    // Switch to Binary Search Tree algorithm
    const bstBtn = screen.getByRole('button', { name: /Binary Search Tree/i });
    fireEvent.click(bstBtn);

    expect(screen.getByText('Binary Search Tree Layout')).toBeInTheDocument();
    expect(screen.getByText('Insert Key 25: Compare with Root (40)')).toBeInTheDocument();
  });

  it('switches to Memory & Cache Hierarchy Lab tab and interacts with low-level systems simulator', () => {
    render(<SandboxPage />);

    const memoryTabBtn = screen.getByRole('button', { name: /Memory & Cache Hierarchy Lab/i });
    fireEvent.click(memoryTabBtn);

    expect(screen.getByText('Process Virtual Memory & CPU Cache Coherence Simulator')).toBeInTheDocument();
    expect(screen.getByText('Safe Allocation & Free')).toBeInTheDocument();

    // Verify step forward in memory simulator
    const nextBtn = screen.getByRole('button', { name: /Next Step →/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText('Function Call: createUser() Stack Frame Pushed')).toBeInTheDocument();

    // Switch to L1/L2 Cache line subtab
    const cacheBtn = screen.getByRole('button', { name: /L1\/L2 Cache Lines & False Sharing/i });
    fireEvent.click(cacheBtn);
    expect(screen.getByText(/64-Byte L1 Data Cache Line Byte Visualization/i)).toBeInTheDocument();

    // Switch to Hash Table Collision Probing subtab
    const hashBtn = screen.getByRole('button', { name: /Hash Table Collision Probing/i });
    fireEvent.click(hashBtn);
    expect(screen.getByText(/Bucket Array Representation/i)).toBeInTheDocument();
  });

  it('switches to Distributed Systems & Architecture Lab tab and interacts with consistent hash ring and rate limiters', () => {
    render(<SandboxPage />);

    const distTabBtn = screen.getByRole('button', { name: /Distributed Systems & Architecture Lab/i });
    fireEvent.click(distTabBtn);

    expect(screen.getByText('Consistent Hashing, Rate Limiting & Circuit Breakers')).toBeInTheDocument();
    expect(screen.getByText(/Circular Hash Space/i)).toBeInTheDocument();

    // Scale Out: Add Node D
    const scaleOutBtn = screen.getByRole('button', { name: /\+ Scale Out: Add Node D/i });
    fireEvent.click(scaleOutBtn);
    expect(screen.getByText('✓ Node D Active (Scale Out)')).toBeInTheDocument();

    // Switch to Traffic Rate Limiters
    const rlBtn = screen.getByRole('button', { name: /Traffic Rate Limiters/i });
    fireEvent.click(rlBtn);
    expect(screen.getByText(/Token Bucket Tank/i)).toBeInTheDocument();

    // Switch to Circuit Breaker State Machine
    const cbBtn = screen.getByRole('button', { name: /Circuit Breaker State Machine/i });
    fireEvent.click(cbBtn);
    expect(screen.getByText('1. CLOSED')).toBeInTheDocument();
  });

  it('switches to OS Kernel & Network Protocols Lab tab and interacts with CPU scheduling and paging matrix', () => {
    render(<SandboxPage />);

    const kernelTabBtn = screen.getByRole('button', { name: /OS Kernel & Network Protocols Lab/i });
    fireEvent.click(kernelTabBtn);

    expect(screen.getByText(/CPU Scheduling Gantt, Virtual Memory Paging & TCP Congestion Dynamics/i)).toBeInTheDocument();
    expect(screen.getByText('Round Robin (q = 2)')).toBeInTheDocument();

    // Switch to Virtual Memory Paging subtab
    const pagingTabBtn = screen.getByRole('button', { name: /Virtual Memory Paging/i });
    fireEvent.click(pagingTabBtn);
    expect(screen.getByText(/Physical Memory Frame State Matrix/i)).toBeInTheDocument();

    // Switch to TCP Congestion (cwnd) subtab
    const tcpTabBtn = screen.getByRole('button', { name: /TCP Congestion \(cwnd\)/i });
    fireEvent.click(tcpTabBtn);
    expect(screen.getByText(/Congestion Window Dynamics/i)).toBeInTheDocument();
  });

  it('switches to System Design Architecture Lab tab and interacts with topology simulator and sharding analyzer', () => {
    render(<SandboxPage />);

    const sysDesignTabBtn = screen.getByRole('button', { name: /System Design Architecture Lab/i });
    fireEvent.click(sysDesignTabBtn);

    expect(screen.getByText(/System Design Architecture Studio & Traffic Bottleneck Simulator/i)).toBeInTheDocument();
    expect(screen.getByText(/Distributed Architecture Request Propagation Topology/i)).toBeInTheDocument();
    expect(screen.getByText('OPTIMAL')).toBeInTheDocument();

    // Trigger Cache Stampede failure preset
    const stampedeBtn = screen.getByRole('button', { name: /Cache Stampede/i });
    fireEvent.click(stampedeBtn);
    expect(screen.getByText(/CRITICAL SYSTEM BOTTLE-NECK DETECTED|SYSTEM DEGRADED/i)).toBeInTheDocument();

    // Switch Sharding Strategy to Celebrity Key Trap
    const celebBtn = screen.getByRole('button', { name: /Celebrity Key Trap/i });
    fireEvent.click(celebBtn);
    expect(screen.getByText(/The Celebrity \/ Heavy-Hitter Key Problem/i)).toBeInTheDocument();
  });

  it('activates target studio tab directly from URL search parameter on mount', () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '?tab=system-design' },
      configurable: true,
    });

    try {
      render(<SandboxPage />);
      expect(
        screen.getByText(/System Design Architecture Studio & Traffic Bottleneck Simulator/i),
      ).toBeInTheDocument();
      expect(screen.getByText('OPTIMAL')).toBeInTheDocument();
    } finally {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      });
    }
  });
});
