import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ArchitectureTradeoffSandbox } from '../ArchitectureTradeoffSandbox';

describe('ArchitectureTradeoffSandbox Component', () => {
  it('renders title, description, and Quorum & Consistency module by default', () => {
    render(<ArchitectureTradeoffSandbox />);

    expect(
      screen.getByRole('heading', {
        name: /Systems Architecture & Storage Trade-Off Laboratory/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Quorum Parameters (N, R, W)')).toBeInTheDocument();
    expect(screen.getByText('✓ Strict Quorum')).toBeInTheDocument();
    expect(screen.getByText(/At least one replica in any read quorum/i)).toBeInTheDocument();
  });

  it('detects weak/eventual consistency and stale read probability when R + W <= N', () => {
    render(<ArchitectureTradeoffSandbox />);

    // Change Read Quorum (R) slider to 1
    const sliders = screen.getAllByRole('slider');
    const readSlider = sliders[0]; // R slider
    fireEvent.change(readSlider, { target: { value: '1' } });

    // Change Write Quorum (W) slider to 2 so R(1) + W(2) = 3 <= N(5)
    const writeSlider = sliders[1]; // W slider
    fireEvent.change(writeSlider, { target: { value: '2' } });

    expect(screen.getByText(/Weak \/ Eventual Quorum/i)).toBeInTheDocument();
    expect(screen.getByText(/Stale Read Probability/i)).toBeInTheDocument();
  });

  it('switches to B+ Tree vs LSM-Tree module and renders WAF & RAF comparisons', () => {
    render(<ArchitectureTradeoffSandbox />);

    const storageTabBtn = screen.getByRole('button', { name: /2\. B\+ Tree vs LSM/i });
    fireEvent.click(storageTabBtn);

    expect(screen.getByText('Workload & Buffer Pool Inputs')).toBeInTheDocument();
    expect(screen.getByText('B+ Tree (In-Place Updates)')).toBeInTheDocument();
    expect(screen.getByText('LSM-Tree (Append-Only)')).toBeInTheDocument();
    expect(screen.getByText(/Recommended Storage Engine Architecture/i)).toBeInTheDocument();

    // Verify presence of WAF and RAF indicators
    expect(screen.getAllByText(/Write Amplification \(WAF\):/i).length).toBe(2);
    expect(screen.getAllByText(/Read Amplification \(RAF\):/i).length).toBe(2);
  });

  it('switches to Row vs Columnar module and calculates scan volume speedup', () => {
    render(<ArchitectureTradeoffSandbox />);

    const layoutTabBtn = screen.getByRole('button', { name: /3\. Row vs Columnar/i });
    fireEvent.click(layoutTabBtn);

    expect(screen.getByText('Analytical Query & Schema Width')).toBeInTheDocument();
    expect(screen.getByText('Columnar Vectorized Speedup')).toBeInTheDocument();
    expect(screen.getByText('Row-Oriented (OLTP)')).toBeInTheDocument();
    expect(screen.getByText('Columnar (OLAP)')).toBeInTheDocument();
    expect(screen.getByText(/Faster I\/O Scan/i)).toBeInTheDocument();

    // Verify row scan vs columnar scan bytes
    expect(screen.getAllByText('Data Scanned:').length).toBe(2);
    expect(screen.getAllByText('Scan Duration:').length).toBe(2);
  });
});
