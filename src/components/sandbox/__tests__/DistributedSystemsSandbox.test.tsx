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

  it('tests Dynamo-Style Multi-Replica Consistent Hashing, Quorum Consistency, and Load Distribution Histogram', () => {
    render(<DistributedSystemsSandbox />);

    // Defaults: Consistent Hash Ring tab is active
    expect(screen.getByText('Partition Arc & Load Distribution Histogram')).toBeInTheDocument();
    expect(screen.getByText('Key Preference List & Quorum Simulator')).toBeInTheDocument();
    expect(screen.getByText('STRONG_CONSISTENCY')).toBeInTheDocument();

    // 1. Quorum Consistency toggle (Strong -> Eventual)
    const w1Btn = screen.getByRole('button', { name: 'W=1' });
    const r1Btn = screen.getByRole('button', { name: 'R=1' });
    fireEvent.click(w1Btn);
    fireEvent.click(r1Btn);
    expect(screen.getByText('EVENTUAL_CONSISTENCY')).toBeInTheDocument();
    expect(screen.getByText(/Disjoint Quorums:/i)).toBeInTheDocument();

    // Restore Strong Consistency W=2, R=2
    const w2Btn = screen.getByRole('button', { name: 'W=2' });
    const r2Btn = screen.getByRole('button', { name: 'R=2' });
    fireEvent.click(w2Btn);
    fireEvent.click(r2Btn);
    expect(screen.getByText('STRONG_CONSISTENCY')).toBeInTheDocument();

    // 2. Simulate Quorum Write (Success when all nodes online)
    const writeBtn = screen.getByRole('button', { name: /Simulate Quorum Write \(W=2\)/i });
    fireEvent.click(writeBtn);
    expect(screen.getAllByText('WRITE_SUCCESS').length).toBeGreaterThanOrEqual(1);

    // 3. Simulate Quorum Read (Success)
    const readBtn = screen.getByRole('button', { name: /Simulate Quorum Read \(R=2\)/i });
    fireEvent.click(readBtn);
    expect(screen.getAllByText('STRONG_READ_HIT').length).toBeGreaterThanOrEqual(1);

    // 4. Set N=2 and Partition Node B (leaving Node B offline in preference list [B, C])
    const n2Btn = screen.getByRole('button', { name: 'N=2' });
    fireEvent.click(n2Btn);

    const nodeBBtn = screen.getByRole('button', { name: /Node B.*ONLINE/i });
    fireEvent.click(nodeBBtn);

    // 5. Strict Quorum Write fails (W=2 requires 2 acks, but only Node C is online in pref list)
    fireEvent.click(writeBtn);
    expect(screen.getAllByText('WRITE_QUORUM_FAILED').length).toBeGreaterThanOrEqual(1);

    // 6. Enable Sloppy Quorum & Hinted Handoff (Node A outside pref list accepts write with hint)
    const sloppyCheckbox = screen.getByRole('checkbox', { name: /Sloppy Quorum & Hinted Handoff/i });
    fireEvent.click(sloppyCheckbox);

    fireEvent.click(writeBtn);
    expect(screen.getAllByText('SLOPPY_HINTED_HANDOFF').length).toBeGreaterThanOrEqual(1);

    // 7. Reset Cluster
    const resetClusterBtn = screen.getByRole('button', { name: /Reset Cluster/i });
    fireEvent.click(resetClusterBtn);
    expect(screen.getAllByText('CLUSTER_RESET').length).toBeGreaterThanOrEqual(1);
  });

  it('verifies Distributed Lock Fencing Tokens, Stop-the-World GC pauses, and Split-Brain storage prevention', () => {
    render(<DistributedSystemsSandbox />);

    // 1. Switch to Lock Fencing & Split-Brain tab
    const fencingTabBtn = screen.getByRole('button', { name: /Lock Fencing & Split-Brain/i });
    fireEvent.click(fencingTabBtn);

    expect(screen.getByText('Distributed Lock Fencing Tokens & Asynchronous Split-Brain Storage Simulation')).toBeInTheDocument();
    expect(screen.getByText(/Token #32/i)).toBeInTheDocument();
    expect(screen.getByText('Shared Persistent Storage Engine')).toBeInTheDocument();
    expect(screen.getByText('maxToken = 32')).toBeInTheDocument();

    // Default mode is Fencing Token Gated
    expect(screen.getByRole('button', { name: 'Fencing Token Gated' })).toHaveClass('bg-emerald-600');

    // Step 1: Client 1 Acquires Lock
    const step1Btn = screen.getByRole('button', { name: /1. Client 1 Acquires Lock/i });
    fireEvent.click(step1Btn);

    expect(screen.getByText(/Token #33/i)).toBeInTheDocument();
    expect(screen.getByText('#33')).toBeInTheDocument();
    expect(screen.getByText('ACQUIRED_LOCK')).toBeInTheDocument();

    // Step 2: Inject Stop-the-World GC Pause (15s)
    const step2Btn = screen.getByRole('button', { name: /2. Inject 15s STW GC Pause/i });
    fireEvent.click(step2Btn);

    expect(screen.getByText('STW_PAUSED')).toBeInTheDocument();
    expect(screen.getByText(/Stop-The-World Freeze/i)).toBeInTheDocument();
    expect(screen.getByText('LEASE EXPIRED (REVOKED)')).toBeInTheDocument();

    // Step 3: Client 2 Acquires Lock & Writes
    const step3Btn = screen.getByRole('button', { name: /3. Client 2 Acquires & Writes/i });
    fireEvent.click(step3Btn);

    expect(screen.getByText(/Token #34/i)).toBeInTheDocument();
    expect(screen.getByText('#34')).toBeInTheDocument();
    expect(screen.getByText('maxToken = 34')).toBeInTheDocument();
    expect(screen.getAllByText(/"status": "REVOKED"/i).length).toBeGreaterThanOrEqual(1);

    // Step 4: Client 1 Wakes & Submits Stale Write (Fencing Token Gated Mode)
    const step4Btn = screen.getByRole('button', { name: /4. Client 1 Wakes & Writes/i });
    fireEvent.click(step4Btn);

    expect(screen.getByText('WRITE_REJECTED')).toBeInTheDocument();
    expect(screen.getByText(/STORAGE INTEGRITY PRESERVED VIA FENCING TOKEN/i)).toBeInTheDocument();
    expect(screen.getAllByText(/"status": "REVOKED"/i).length).toBeGreaterThanOrEqual(1);

    // 2. Test Naive Unfenced Storage Mode (Vulnerable to Split-Brain)
    const naiveModeBtn = screen.getByRole('button', { name: 'Naive (Unfenced)' });
    fireEvent.click(naiveModeBtn);

    expect(naiveModeBtn).toHaveClass('bg-rose-600');
    expect(screen.getByText('Mode: UNFENCED (NAIVE)')).toBeInTheDocument();

    // Re-run the 4 steps under Naive mode
    const step1NaiveBtn = screen.getByRole('button', { name: /1. Client 1 Acquires Lock/i });
    fireEvent.click(step1NaiveBtn);

    const step2NaiveBtn = screen.getByRole('button', { name: /2. Inject 15s STW GC Pause/i });
    fireEvent.click(step2NaiveBtn);

    const step3NaiveBtn = screen.getByRole('button', { name: /3. Client 2 Acquires & Writes/i });
    fireEvent.click(step3NaiveBtn);

    const step4NaiveBtn = screen.getByRole('button', { name: /4. Client 1 Wakes & Writes/i });
    fireEvent.click(step4NaiveBtn);

    // Naive mode permits the stale write, leading to split-brain corruption!
    expect(screen.getByText(/CRITICAL SPLIT-BRAIN CORRUPTION DETECTED/i)).toBeInTheDocument();
    expect(screen.getAllByText(/"status": "SETTLED"/i).length).toBeGreaterThanOrEqual(1);

    // 3. Reset Cluster
    const resetBtn = screen.getByRole('button', { name: /Reset Cluster/i });
    fireEvent.click(resetBtn);

    expect(screen.getByText('maxToken = 32')).toBeInTheDocument();
    expect(screen.queryByText(/CRITICAL SPLIT-BRAIN CORRUPTION DETECTED/i)).not.toBeInTheDocument();
  });
  it('switches to Paxos & Multi-Paxos and verifies Classic 2-RTT consensus, Dueling Proposer Livelock, and 1-RTT fast path', () => {
    render(<DistributedSystemsSandbox />);

    // Switch to Paxos subtab
    const paxosTabBtn = screen.getByRole('button', { name: /Paxos & Multi-Paxos/i });
    fireEvent.click(paxosTabBtn);

    // Initial steady state
    expect(screen.getByText('Classic Paxos vs Multi-Paxos: 2-RTT Quorums, Dueling Proposer Livelock & 1-RTT Fast Path')).toBeInTheDocument();
    expect(screen.getByText('Proposer Nodes (Client Request Gateways)')).toBeInTheDocument();
    expect(screen.getByText('Acceptor Quorum Nodes (State Consensus Storage)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Classic Paxos (2 RTT)' })).toHaveClass('bg-primary-700');
    expect(screen.getAllByText('READY').length).toBe(3);

    // 1. Run Classic Paxos Clean 2-RTT Write
    const cleanWriteBtn = screen.getByRole('button', { name: /1. Classic Paxos Clean 2-RTT Write/i });
    fireEvent.click(cleanWriteBtn);

    expect(screen.getAllByText('ACCEPTED').length).toBe(3);
    expect(screen.getAllByText('COMMITTED').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('PAXOS_2RTT_COMMIT').length).toBeGreaterThanOrEqual(1);

    // 2. Trigger Dueling Proposer Livelock
    const livelockBtn = screen.getByRole('button', { name: /2. Simulate Dueling Proposer Livelock/i });
    fireEvent.click(livelockBtn);

    expect(screen.getByText(/CRITICAL DUELING PROPOSER LIVELOCK DETECTED/i)).toBeInTheDocument();
    expect(screen.getAllByText('REJECTED_LIVELOCK').length).toBe(2);
    expect(screen.getAllByText('PROMISED').length).toBe(3);
    expect(screen.getAllByText('DUELING_LIVELOCK').length).toBeGreaterThanOrEqual(1);

    // 3. Test Multi-Paxos 1-RTT Stream Write
    const multiPaxosBtn = screen.getByRole('button', { name: /3. Multi-Paxos 1-RTT Stream Write/i });
    fireEvent.click(multiPaxosBtn);

    expect(screen.queryByText(/CRITICAL DUELING PROPOSER LIVELOCK DETECTED/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('MULTI_PAXOS_1RTT').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/COMMITTED ✓/i).length).toBeGreaterThanOrEqual(1);

    // 4. Reset Paxos Lab
    const resetBtn = screen.getByRole('button', { name: /Reset Paxos Lab/i });
    fireEvent.click(resetBtn);

    expect(screen.getAllByText('READY').length).toBe(3);
    expect(screen.queryByText(/CRITICAL DUELING PROPOSER LIVELOCK DETECTED/i)).not.toBeInTheDocument();
  });
  it('switches to CRDTs & Real-Time Collab and verifies PN-Counter, OR-Set, and RGA text sequence convergence', () => {
    render(<DistributedSystemsSandbox />);

    // Switch to CRDT subtab
    const crdtTabBtn = screen.getByRole('button', { name: /CRDTs & Real-Time Collab/i });
    fireEvent.click(crdtTabBtn);

    // Initial steady state
    expect(screen.getByText('Conflict-Free Replicated Data Types (CRDTs): State-based Join Semilattices & Real-Time Sync')).toBeInTheDocument();
    expect(screen.getByText('Join-Semilattice (CvRDT) Algebraic Invariants & Proof of Convergence')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'P-N Counter' })).toHaveClass('bg-primary-700');

    // 1. Mutate Local Replicas (PN Counter)
    const mutateBtn = screen.getByRole('button', { name: /1. Mutate Local Replicas/i });
    fireEvent.click(mutateBtn);

    expect(screen.getAllByText('DIVERGENT').length).toBe(3);
    expect(screen.getAllByText('CONCURRENT_MUTATIONS').length).toBeGreaterThanOrEqual(1);

    // 2. Merge Across Network
    const mergeBtn = screen.getByRole('button', { name: /2. Merge Across Network/i });
    fireEvent.click(mergeBtn);

    expect(screen.getAllByText('CONVERGED').length).toBe(3);
    expect(screen.getAllByText('SEMILATTICE_MERGED').length).toBeGreaterThanOrEqual(1);

    // 3. Switch to OR-Set mode
    const orSetBtn = screen.getByRole('button', { name: 'OR-Set (Add-Wins)' });
    fireEvent.click(orSetBtn);

    expect(orSetBtn).toHaveClass('bg-primary-700');
    expect(screen.getAllByText('Design Review').length).toBe(3);

    fireEvent.click(mutateBtn);
    expect(screen.getAllByText('CONCURRENT_ADD_REMOVE').length).toBeGreaterThanOrEqual(1);

    fireEvent.click(mergeBtn);
    expect(screen.getAllByText('ADD_WINS_CONVERGENCE').length).toBeGreaterThanOrEqual(1);

    // 4. Switch to RGA Text Sequence mode
    const rgaBtn = screen.getByRole('button', { name: 'RGA Text Seq' });
    fireEvent.click(rgaBtn);

    expect(rgaBtn).toHaveClass('bg-primary-700');
    expect(screen.getAllByText(/"SYS"/i).length).toBe(3);

    fireEvent.click(mutateBtn);
    expect(screen.getAllByText('CONCURRENT_TYPING').length).toBeGreaterThanOrEqual(1);

    fireEvent.click(mergeBtn);
    expect(screen.getAllByText('RGA_DETERMINISTIC_MERGE').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/"SYST!"/i).length).toBe(4);

    // 5. Reset CRDT Lab
    const resetBtn = screen.getByRole('button', { name: /Reset CRDT Lab/i });
    fireEvent.click(resetBtn);

    expect(screen.getAllByText(/"SYS"/i).length).toBe(3);
  });

  it('switches to Gossip & SWIM Protocol and tests direct ping, timeout drop, indirect ping-req proxy, suspicion, and gossip convergence', () => {
    render(<DistributedSystemsSandbox />);

    // Switch to Gossip & SWIM Protocol subtab
    const swimTabBtn = screen.getByRole('button', { name: /Gossip & SWIM Protocol/i });
    fireEvent.click(swimTabBtn);

    // Verify Title & Initial Cluster Nodes
    expect(screen.getByText(/Distributed Gossip Protocol, Anti-Entropy & SWIM Failure Detector Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Node 1 \(Local Leader\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Node 2 \(Peer Worker\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Node 3 \(Flaky Edge Link\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Node 6 \(Crash Candidate\)/i)).toBeInTheDocument();

    const step1Btn = screen.getByRole('button', { name: /1\. Direct Ping/i });
    const step2Btn = screen.getByRole('button', { name: /2\. Packet Loss/i });
    const step3Btn = screen.getByRole('button', { name: /3\. Indirect ping-req/i });
    const step4Btn = screen.getByRole('button', { name: /4\. Suspicion State/i });
    const step5Btn = screen.getByRole('button', { name: /5\. Declare DEAD/i });
    const step6Btn = screen.getByRole('button', { name: /6\. Epidemic Gossip/i });
    const resetBtn = screen.getByRole('button', { name: /Reset Cluster Lab/i });

    // 1. Step 1: Direct Ping (N1 -> N2)
    fireEvent.click(step1Btn);
    expect(screen.getAllByText(/DIRECT_PING_ACK/i).length).toBeGreaterThanOrEqual(1);

    // 2. Step 2: Direct Drop (N1 -> N3)
    fireEvent.click(step2Btn);
    expect(screen.getAllByText(/PROBE_TIMEOUT/i).length).toBeGreaterThanOrEqual(1);

    // 3. Step 3: Indirect ping-req (via N4, N5 -> N3)
    fireEvent.click(step3Btn);
    expect(screen.getAllByText(/PING_REQ_SUCCESS/i).length).toBeGreaterThanOrEqual(1);

    // 4. Step 4: True failure -> Suspicion State (N6)
    fireEvent.click(step4Btn);
    expect(screen.getAllByText(/NODE_SUSPECT/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('SUSPECT').length).toBeGreaterThanOrEqual(1);

    // 5. Step 5: Suspicion timer expires -> Declare DEAD
    fireEvent.click(step5Btn);
    expect(screen.getAllByText(/DECLARED_DEAD/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('DEAD').length).toBeGreaterThanOrEqual(1);

    // 6. Step 6: Epidemic Gossip dissemination converges
    fireEvent.click(step6Btn);
    expect(screen.getAllByText(/GOSSIP_CONVERGED/i).length).toBeGreaterThanOrEqual(1);

    // 7. Reset Cluster Lab
    fireEvent.click(resetBtn);
    expect(screen.queryByText('DEAD')).not.toBeInTheDocument();
    expect(screen.queryByText('SUSPECT')).not.toBeInTheDocument();
  });
});
