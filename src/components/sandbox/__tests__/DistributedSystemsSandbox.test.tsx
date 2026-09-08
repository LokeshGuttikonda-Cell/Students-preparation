import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DistributedSystemsSandbox } from '../DistributedSystemsSandbox';

describe('DistributedSystemsSandbox', () => {
  it('renders Consistent Hash Ring by default and allows scaling out Node D and changing VNodes', () => {
    render(<DistributedSystemsSandbox />);

    expect(screen.getByText(/Consistent Hashing, Rate Limiting/i)).toBeInTheDocument();
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

  it('switches to Raft Consensus and verifies leader election, client writes, quorum commits, and partition resilience', () => {
    render(<DistributedSystemsSandbox />);

    const raftTab = screen.getByRole('button', { name: /Raft Consensus & Quorum/i });
    fireEvent.click(raftTab);

    expect(screen.getByText(/Raft Consensus & Log Replication Controls/i)).toBeInTheDocument();
    expect(screen.getByText('Q = 3 / 5')).toBeInTheDocument();
    expect(screen.getAllByText('Node 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('👑 LEADER').length).toBeGreaterThanOrEqual(1);

    // Propose a client write
    const proposeBtn = screen.getByRole('button', { name: /Propose Client Write/i });
    fireEvent.click(proposeBtn);
    expect(screen.getAllByText(/cache_ttl=3600/i).length).toBeGreaterThanOrEqual(1);

    // Simulate leader failure & election
    const crashBtn = screen.getByRole('button', { name: /Simulate Leader Crash & Election/i });
    fireEvent.click(crashBtn);
    expect(screen.getByText(/Leader Node 1 crashed/i)).toBeInTheDocument();

    // Simulate network partition
    const partitionBtn = screen.getByRole('button', { name: /Simulate Network Partition/i });
    fireEvent.click(partitionBtn);
    expect(screen.getByText(/Network partitioned!/i)).toBeInTheDocument();
    expect(screen.getByText(/Group A \(Minority/i)).toBeInTheDocument();
    expect(screen.getByText(/Group B \(Majority/i)).toBeInTheDocument();

    // Heal partition
    const healBtn = screen.getByRole('button', { name: /Heal Partition & Reconcile Logs/i });
    fireEvent.click(healBtn);
    expect(screen.getByText(/Network partition healed!/i)).toBeInTheDocument();
  });

  it('switches to Vector Clocks & Causality and verifies local writes, replication, concurrent conflict detection, and reconciliation', () => {
    render(<DistributedSystemsSandbox />);

    const vcTab = screen.getByRole('button', { name: /Vector Clocks & Causality/i });
    fireEvent.click(vcTab);

    // Verify Title & Initial State
    expect(screen.getByText(/Vector Clocks, Lamport Timestamps & Sibling Conflict Inspector/i)).toBeInTheDocument();
    expect(screen.getByText(/us-east-1 \(N. Virginia\)/i)).toBeInTheDocument();
    expect(screen.getByText(/eu-west-1 \(Ireland\)/i)).toBeInTheDocument();
    expect(screen.getByText(/ap-southeast-1 \(Singapore\)/i)).toBeInTheDocument();

    // Verify Initial Clocks (all 0)
    expect(screen.getAllByText('A: 0').length).toBe(3);
    expect(screen.getAllByText('B: 0').length).toBe(3);
    expect(screen.getAllByText('C: 0').length).toBe(3);

    // Write on Node A
    const writeNodeABtn = screen.getByRole('button', { name: /\+ Write on Node A/i });
    fireEvent.click(writeNodeABtn);
    expect(screen.getAllByText('A: 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/cart=\[laptop\]/i).length).toBeGreaterThanOrEqual(1);

    // Simulate Concurrent Split Writes
    const splitBtn = screen.getByRole('button', { name: /Simulate Split Writes \(A ‖ B\)/i });
    fireEvent.click(splitBtn);

    expect(screen.getByText(/Causality Violation & Concurrent Sibling Detected/i)).toBeInTheDocument();
    expect(screen.getAllByText(/NON-DOMINATING VECTORS/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Conflicting Siblings \(2\)/i)).toBeInTheDocument();

    // Reconcile via CRDT Set Union
    const reconcileBtn = screen.getByRole('button', { name: /Reconcile via CRDT Set Union/i });
    fireEvent.click(reconcileBtn);

    expect(screen.queryByText(/Causality Violation & Concurrent Sibling Detected/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/cart=\[laptop, phone\]/i).length).toBeGreaterThanOrEqual(1);

    // Test Reset
    const resetBtn = screen.getByRole('button', { name: /Reset Clocks/i });
    fireEvent.click(resetBtn);
    expect(screen.getAllByText('A: 0').length).toBe(3);
  });
  it('switches to 2PC vs Saga Coordinator and tests two-phase commit, coordinator crash blocking, and saga backward compensation', () => {
    render(<DistributedSystemsSandbox />);

    const txTab = screen.getByRole('button', { name: /2PC vs Saga Coordinator/i });
    fireEvent.click(txTab);

    // Verify Title & Initial State
    expect(
      screen.getByRole('heading', {
        name: 'Two-Phase Commit (2PC) vs Distributed Saga Coordinator Studio',
        level: 3,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('Central 2PC Transaction Coordinator')).toBeInTheDocument();
    expect(screen.getByText('STATE: IDLE')).toBeInTheDocument();
    expect(screen.getByText('Order Service')).toBeInTheDocument();
    expect(screen.getByText('Payment Service')).toBeInTheDocument();
    expect(screen.getByText('Inventory Service')).toBeInTheDocument();
    expect(screen.getAllByText('UNLOCKED 🔓').length).toBe(3);

    // 1. Run 2PC Success
    const success2pcBtn = screen.getByRole('button', { name: /Run 2PC Success/i });
    fireEvent.click(success2pcBtn);
    expect(screen.getByText('STATE: COMMITTED')).toBeInTheDocument();
    expect(screen.getByText(/TX_101 GLOBAL_COMMIT/i)).toBeInTheDocument();
    expect(screen.getAllByText('COMMITTED').length).toBe(3);
    expect(screen.getAllByText('UNLOCKED 🔓').length).toBe(3);

    // 2. Run 2PC Failure (Inventory Aborts)
    const fail2pcBtn = screen.getByRole('button', { name: /Run 2PC Failure/i });
    fireEvent.click(fail2pcBtn);
    expect(screen.getByText('STATE: ABORTED')).toBeInTheDocument();
    expect(screen.getByText(/TX_102 GLOBAL_ROLLBACK/i)).toBeInTheDocument();
    expect(screen.getAllByText('ABORTED').length).toBe(3);

    // 3. Simulate Coordinator Crash (Indefinite Blocking)
    const crashBtn = screen.getByRole('button', { name: /Simulate Coordinator Crash/i });
    fireEvent.click(crashBtn);
    expect(screen.getByText('STATE: CRASHED_BLOCKING')).toBeInTheDocument();
    expect(screen.getByText(/COORDINATOR OFFLINE — PARTICIPANTS LOCKED INDEFINITELY/i)).toBeInTheDocument();
    expect(screen.getAllByText('LOCKED 🔒').length).toBe(4); // 1 in top banner + 3 in participant cards

    // 4. Switch to Distributed Saga Mode
    const sagaTabBtn = screen.getByRole('button', { name: 'Distributed Saga (Orchestrated)' });
    fireEvent.click(sagaTabBtn);
    expect(screen.getByText('Stateful Workflow Coordinator (Event-Driven)')).toBeInTheDocument();
    expect(screen.getByText('ORCHESTRATOR: IDLE')).toBeInTheDocument();
    expect(screen.getByText(/0 Distributed Locks Held/i)).toBeInTheDocument();
    expect(screen.getByText('Step 1: Order Service')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Payment Service')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Inventory Service')).toBeInTheDocument();

    // 5. Run Saga Forward Success
    const sagaSuccessBtn = screen.getByRole('button', { name: /Run Saga Forward/i });
    fireEvent.click(sagaSuccessBtn);
    expect(screen.getByText('ORCHESTRATOR: COMPLETED')).toBeInTheDocument();
    expect(screen.getAllByText('COMMITTED').length).toBe(3);

    // 6. Simulate Failure & Backward Recovery
    const sagaCompensateBtn = screen.getByRole('button', { name: /Simulate Failure & Backward Recovery/i });
    fireEvent.click(sagaCompensateBtn);
    expect(screen.getByText('ORCHESTRATOR: COMPENSATED_ABORT')).toBeInTheDocument();
    expect(screen.getByText('FAILED')).toBeInTheDocument();
    expect(screen.getAllByText('COMPENSATED').length).toBe(2);

    // 7. Reset Saga
    const sagaResetBtn = screen.getByRole('button', { name: /Reset Saga State/i });
    fireEvent.click(sagaResetBtn);
    expect(screen.getByText('ORCHESTRATOR: IDLE')).toBeInTheDocument();
  });
});
