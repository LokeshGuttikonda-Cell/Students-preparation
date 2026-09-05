import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SystemDesignSandbox } from '../SystemDesignSandbox';

describe('SystemDesignSandbox', () => {
  it('renders with default optimal system metrics and architecture topology', () => {
    render(<SystemDesignSandbox />);

    expect(
      screen.getByText(/System Design Architecture Studio & Traffic Bottleneck Simulator/i)
    ).toBeInTheDocument();
    expect(screen.getByText('OPTIMAL')).toBeInTheDocument();
    expect(screen.getByText('25,000')).toBeInTheDocument(); // 25k QPS
    expect(screen.getByText(/Client Ingress Tier/i)).toBeInTheDocument();
    expect(screen.getByText(/Layer-7 Load Balancer/i)).toBeInTheDocument();
    expect(screen.getByText(/Distributed Cache \(In-Memory\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Relational Database Cluster/i)).toBeInTheDocument();
  });

  it('triggers failure presets: Cache Stampede results in OUTAGE or STRESSED with high p99 latency', () => {
    render(<SystemDesignSandbox />);

    const stampedeBtn = screen.getByRole('button', { name: /Cache Stampede/i });
    fireEvent.click(stampedeBtn);

    // Cache hit should be 0%, p99 latency and DB utilization explode
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(
      screen.getByText(/CRITICAL SYSTEM BOTTLE-NECK DETECTED|SYSTEM DEGRADED/i)
    ).toBeInTheDocument();
  });

  it('triggers Resilient Scaled preset and verifies healthy cluster status', () => {
    render(<SystemDesignSandbox />);

    const resilientBtn = screen.getByRole('button', { name: /Resilient Scaled/i });
    fireEvent.click(resilientBtn);

    expect(screen.getByText('OPTIMAL')).toBeInTheDocument();
    expect(screen.getByText('45,000')).toBeInTheDocument(); // 45k QPS
    expect(screen.getByText('0% Error Rate')).toBeInTheDocument();
  });

  it('switches database sharding strategies and updates partition analysis', () => {
    render(<SystemDesignSandbox />);

    expect(
      screen.getByText(/Database Sharding & Partition Key Distribution Analyzer/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Uniform Hash Partitioning/i)).toBeInTheDocument();

    // Switch to Range-based hotspot
    const rangeBtn = screen.getByRole('button', { name: /Range-Based \(Timestamp\)/i });
    fireEvent.click(rangeBtn);
    expect(screen.getByText(/Range-Based Partitioning Hotspot/i)).toBeInTheDocument();
    expect(screen.getByText(/🔥 HOTSPOT/i)).toBeInTheDocument();

    // Switch to Celebrity key trap
    const celebBtn = screen.getByRole('button', { name: /Celebrity Key Trap/i });
    fireEvent.click(celebBtn);
    expect(screen.getByText(/The Celebrity \/ Heavy-Hitter Key Problem/i)).toBeInTheDocument();

    // Switch to Salted Composite key
    const saltedBtn = screen.getByRole('button', { name: /Salted Composite Key/i });
    fireEvent.click(saltedBtn);
    expect(screen.getByText(/Salted Composite Partitioning/i)).toBeInTheDocument();
  });
});
