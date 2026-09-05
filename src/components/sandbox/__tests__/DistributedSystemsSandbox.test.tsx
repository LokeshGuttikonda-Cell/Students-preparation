import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DistributedSystemsSandbox } from '../DistributedSystemsSandbox';

describe('DistributedSystemsSandbox', () => {
  it('renders Consistent Hash Ring by default and allows scaling out Node D and changing VNodes', () => {
    render(<DistributedSystemsSandbox />);

    expect(screen.getByText('Consistent Hashing, Rate Limiting & Circuit Breakers')).toBeInTheDocument();
    expect(screen.getByText(/Circular Hash Space/i)).toBeInTheDocument();
    expect(screen.getByText('Key Ownership & Relocation Table')).toBeInTheDocument();
    expect(screen.getAllByText('user:101').length).toBeGreaterThanOrEqual(1);

    // Toggle Scale Out Node D
    const scaleOutBtn = screen.getByRole('button', { name: /\+ Scale Out: Add Node D/i });
    fireEvent.click(scaleOutBtn);

    expect(screen.getByText('✓ Node D Active (Scale Out)')).toBeInTheDocument();
    expect(screen.getAllByText(/Node D \(Scale Out\)/i).length).toBeGreaterThanOrEqual(1);

    // Change VNodes to 2x
    const vnode2xBtn = screen.getByRole('button', { name: '2x' });
    fireEvent.click(vnode2xBtn);
    expect(vnode2xBtn).toHaveClass('bg-primary-700');
  });

  it('switches to Traffic Rate Limiters and tests Token Bucket, Leaky Bucket, and Sliding Window', () => {
    render(<DistributedSystemsSandbox />);

    const rateLimiterTab = screen.getByRole('button', { name: /Traffic Rate Limiters/i });
    fireEvent.click(rateLimiterTab);

    // Default is Token Bucket
    expect(screen.getByText(/Token Bucket Tank/i)).toBeInTheDocument();
    expect(screen.getByText(/10 \/ 10/i)).toBeInTheDocument();

    // Send 1 request
    const send1Btn = screen.getByRole('button', { name: /Send 1 Request/i });
    fireEvent.click(send1Btn);
    expect(screen.getByText(/9 \/ 10/i)).toBeInTheDocument();
    expect(screen.getByText(/HTTP 200 OK — Request Processed/i)).toBeInTheDocument();

    // Switch to Leaky Bucket
    const leakyBucketBtn = screen.getByRole('button', { name: /Leaky Bucket \(Smooth Egress\)/i });
    fireEvent.click(leakyBucketBtn);

    expect(screen.getByText(/FIFO Buffer Queue/i)).toBeInTheDocument();
    const enqueueBtn = screen.getByRole('button', { name: /Enqueue 1 Request/i });
    fireEvent.click(enqueueBtn);
    expect(screen.getByText(/1 \/ 8/i)).toBeInTheDocument();
    expect(screen.getByText(/Request Queued in Buffer/i)).toBeInTheDocument();

    // Switch to Sliding Window Counter
    const slidingWindowBtn = screen.getByRole('button', { name: /Sliding Window Counter/i });
    fireEvent.click(slidingWindowBtn);

    expect(screen.getByText(/Sliding Window Approximation/i)).toBeInTheDocument();
    expect(screen.getByText(/Formula Execution:/i)).toBeInTheDocument();
    const sendSwBtn = screen.getByRole('button', { name: /Send Request/i });
    fireEvent.click(sendSwBtn);
  });

  it('switches to Circuit Breaker State Machine and verifies CLOSED to OPEN to HALF-OPEN transitions', () => {
    render(<DistributedSystemsSandbox />);

    const cbTab = screen.getByRole('button', { name: /Circuit Breaker State Machine/i });
    fireEvent.click(cbTab);

    expect(screen.getByText('1. CLOSED')).toBeInTheDocument();
    expect(screen.getByText('● ACTIVE')).toBeInTheDocument();

    // Simulate upstream errors to trip the circuit breaker
    const failBtn = screen.getByRole('button', { name: /Simulate Upstream Error/i });
    fireEvent.click(failBtn);
    fireEvent.click(failBtn);
    fireEvent.click(failBtn);
    fireEvent.click(failBtn);

    // Should trip to OPEN
    expect(screen.getByText('2. OPEN')).toBeInTheDocument();
    expect(screen.getByText(/Cooldown Remaining: 5 tick\(s\)/i)).toBeInTheDocument();

    // Advance cooldown ticks until HALF_OPEN
    const tickBtn = screen.getByRole('button', { name: /Advance Cooldown Clock/i });
    fireEvent.click(tickBtn); // 4
    fireEvent.click(tickBtn); // 3
    fireEvent.click(tickBtn); // 2
    fireEvent.click(tickBtn); // 1
    fireEvent.click(tickBtn); // transitions to HALF_OPEN

    expect(screen.getByText('3. HALF-OPEN')).toBeInTheDocument();
    expect(screen.getByText(/Probe Successes: 0 \/ 2 required/i)).toBeInTheDocument();

    // Send 2 successful probes to reset to CLOSED
    const successBtn = screen.getByRole('button', { name: /Send Success Response/i });
    fireEvent.click(successBtn);
    expect(screen.getByText(/Probe Successes: 1 \/ 2 required/i)).toBeInTheDocument();

    fireEvent.click(successBtn);
    expect(screen.getByText('1. CLOSED')).toBeInTheDocument();
  });
});
