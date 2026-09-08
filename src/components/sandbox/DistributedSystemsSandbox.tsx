'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export type DistributedMode =
  | 'CONSISTENT_HASHING'
  | 'RATE_LIMITER'
  | 'CIRCUIT_BREAKER'
  | 'RAFT_CONSENSUS'
  | 'VECTOR_CLOCKS'
  | 'TWO_PHASE_COMMIT_SAGA'
  | 'FENCING_TOKENS_JEPSEN'
  | 'PAXOS_CONSENSUS';

export type TxArchitecture = 'TWO_PHASE_COMMIT' | 'DISTRIBUTED_SAGA';



// --- Module 8: Classic Paxos vs Multi-Paxos Consensus & Livelock Types ---
export type PaxosProtocolMode = 'CLASSIC_PAXOS' | 'MULTI_PAXOS';

export interface PaxosProposer {
  id: 'P1' | 'P2';
  name: string;
  proposalNum: number;
  proposedValue: string;
  phase: 'IDLE' | 'PREPARE_SENT' | 'ACCEPT_SENT' | 'COMMITTED' | 'REJECTED_LIVELOCK';
  promisesReceived: string[];
  acceptedReceived: string[];
  statusMessage: string;
}

export interface PaxosAcceptor {
  id: 'A1' | 'A2' | 'A3';
  name: string;
  minProposal: number;
  acceptedProposal: number | null;
  acceptedValue: string | null;
  stateBadge: 'READY' | 'PROMISED' | 'ACCEPTED';
}

export interface PaxosLogEntry {
  slot: number;
  proposalNum: number;
  value: string;
  committed: boolean;
  leader: string;
}

export interface PaxosAuditEvent {
  id: number;
  time: string;
  protocol: string;
  badge: string;
  badgeClass: string;
  message: string;
}

// --- Module 7: Distributed Lock Fencing Tokens & Split-Brain Storage Types ---
export type FencingClientStatus =
  | 'IDLE'
  | 'ACQUIRED_LOCK'
  | 'STW_PAUSED'
  | 'COMMITTING_WRITE'
  | 'WRITE_COMMITTED'
  | 'WRITE_REJECTED';

export type FencingStorageMode = 'UNFENCED_NAIVE' | 'FENCING_TOKEN_GATED';

export interface FencingClient {
  id: 'client-1' | 'client-2';
  name: string;
  heldToken: number | null;
  status: FencingClientStatus;
  leaseSecondsRemaining: number;
  dataPayload: string;
  statusMessage: string;
}

export interface FencingStorageState {
  currentData: string;
  maxCommittedToken: number;
  committedBy: string;
  isCorrupted: boolean;
  integrityMessage: string;
}

export interface FencingAuditEvent {
  id: number;
  time: string;
  badge: string;
  badgeClass: string;
  message: string;
}

export type TwoPhaseCoordinatorState =
  | 'IDLE'
  | 'PREPARING'
  | 'ALL_PREPARED'
  | 'COMMITTING'
  | 'COMMITTED'
  | 'ABORTING'
  | 'ABORTED'
  | 'CRASHED_BLOCKING';

export type TwoPhaseParticipantStatus =
  | 'IDLE'
  | 'PREPARED'
  | 'COMMITTED'
  | 'ABORTED';

export interface TwoPhaseParticipant {
  id: 'order' | 'payment' | 'inventory';
  name: string;
  resource: string;
  status: TwoPhaseParticipantStatus;
  locked: boolean;
  vote: 'COMMIT' | 'ABORT' | null;
  dbState: string;
}

export type SagaOrchestratorState =
  | 'IDLE'
  | 'EXECUTING_T1'
  | 'EXECUTING_T2'
  | 'EXECUTING_T3'
  | 'COMPLETED'
  | 'COMPENSATING_C2'
  | 'COMPENSATING_C1'
  | 'COMPENSATED_ABORT';

export interface SagaStep {
  id: 'order' | 'payment' | 'inventory';
  serviceName: string;
  stepNumber: number;
  forwardTx: string;
  compensatingTx: string;
  status: 'IDLE' | 'PENDING' | 'COMMITTED' | 'FAILED' | 'COMPENSATED';
  dbState: string;
}

export interface TxAuditEvent {
  id: number;
  time: string;
  badge: string;
  badgeClass: string;
  message: string;
}

export type VectorClockTriple = [number, number, number]; // [A, B, C]

export interface VectorClockNode {
  id: 'node-a' | 'node-b' | 'node-c';
  name: string;
  region: string;
  color: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  vclock: VectorClockTriple;
  lamportTime: number;
  value: string;
  siblings?: Array<{ value: string; vclock: VectorClockTriple; originNode: string }>;
}

export interface VectorClockEvent {
  id: number;
  time: string;
  nodeId: 'node-a' | 'node-b' | 'node-c';
  type: 'LOCAL_WRITE' | 'REPLICATION' | 'CONCURRENT_SPLIT' | 'RECONCILE';
  summary: string;
  vclock: VectorClockTriple;
  lamportTime: number;
}

export interface HashNode {
  id: string;
  name: string;
  baseAngle: number;
  color: string;
  badgeBg: string;
}

export interface RingToken {
  id: string;
  nodeId: string;
  name: string;
  angle: number;
  color: string;
  isVirtual: boolean;
  badgeBg: string;
}

export interface PreferenceListEntry {
  physicalNode: HashNode;
  token: RingToken;
  isCoordinator: boolean;
  isOnline: boolean;
}

export interface NodePartitionStats {
  nodeId: string;
  name: string;
  color: string;
  badgeBg: string;
  arcDegrees: number;
  percentShare: number;
  assignedKeyCount: number;
  isOnline: boolean;
}

export interface HashSimulationEvent {
  id: number;
  time: string;
  op: 'WRITE' | 'READ' | 'TOPOLOGY';
  badge: string;
  badgeClass: string;
  message: string;
}

export interface CacheKey {
  id: string;
  label: string;
  angle: number;
}

const BASE_NODES: HashNode[] = [
  { id: 'node-a', name: 'Node A', baseAngle: 45, color: '#10b981', badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'node-b', name: 'Node B', baseAngle: 165, color: '#0284c7', badgeBg: 'bg-sky-100 text-sky-900 border-sky-300' },
  { id: 'node-c', name: 'Node C', baseAngle: 285, color: '#d97706', badgeBg: 'bg-amber-100 text-amber-900 border-amber-300' },
];

const NODE_D: HashNode = {
  id: 'node-d',
  name: 'Node D (Scale Out)',
  baseAngle: 215,
  color: '#8b5cf6',
  badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
};

const CACHE_KEYS: CacheKey[] = [
  { id: 'k1', label: 'user:101', angle: 25 },
  { id: 'k2', label: 'order:492', angle: 75 },
  { id: 'k3', label: 'cart:991', angle: 130 },
  { id: 'k4', label: 'session:a3', angle: 180 },
  { id: 'k5', label: 'item:42', angle: 235 },
  { id: 'k6', label: 'profile:x', angle: 270 },
  { id: 'k7', label: 'auth:token', angle: 320 },
  { id: 'k8', label: 'payment:77', angle: 355 },
];

// --- Raft Consensus Types & Initial Data ---
export interface RaftLogEntry {
  index: number;
  term: number;
  command: string;
  committed: boolean;
}

export interface RaftNode {
  id: string;
  name: string;
  role: 'LEADER' | 'FOLLOWER' | 'CANDIDATE' | 'OFFLINE';
  term: number;
  votedFor: string | null;
  log: RaftLogEntry[];
  commitIndex: number;
  partitionGroup: 'A' | 'B' | 'NONE';
  x: number;
  y: number;
}

const INITIAL_RAFT_NODES: RaftNode[] = [
  {
    id: 'node-1',
    name: 'Node 1',
    role: 'LEADER',
    term: 1,
    votedFor: 'node-1',
    log: [
      { index: 1, term: 1, command: 'SET cluster=ACTIVE', committed: true },
      { index: 2, term: 1, command: 'SET schema=V2', committed: true },
    ],
    commitIndex: 2,
    partitionGroup: 'A',
    x: 270,
    y: 60,
  },
  {
    id: 'node-2',
    name: 'Node 2',
    role: 'FOLLOWER',
    term: 1,
    votedFor: 'node-1',
    log: [
      { index: 1, term: 1, command: 'SET cluster=ACTIVE', committed: true },
      { index: 2, term: 1, command: 'SET schema=V2', committed: true },
    ],
    commitIndex: 2,
    partitionGroup: 'A',
    x: 375,
    y: 135,
  },
  {
    id: 'node-3',
    name: 'Node 3',
    role: 'FOLLOWER',
    term: 1,
    votedFor: 'node-1',
    log: [
      { index: 1, term: 1, command: 'SET cluster=ACTIVE', committed: true },
      { index: 2, term: 1, command: 'SET schema=V2', committed: true },
    ],
    commitIndex: 2,
    partitionGroup: 'B',
    x: 335,
    y: 255,
  },
  {
    id: 'node-4',
    name: 'Node 4',
    role: 'FOLLOWER',
    term: 1,
    votedFor: 'node-1',
    log: [
      { index: 1, term: 1, command: 'SET cluster=ACTIVE', committed: true },
      { index: 2, term: 1, command: 'SET schema=V2', committed: true },
    ],
    commitIndex: 2,
    partitionGroup: 'B',
    x: 205,
    y: 255,
  },
  {
    id: 'node-5',
    name: 'Node 5',
    role: 'FOLLOWER',
    term: 1,
    votedFor: 'node-1',
    log: [
      { index: 1, term: 1, command: 'SET cluster=ACTIVE', committed: true },
      { index: 2, term: 1, command: 'SET schema=V2', committed: true },
    ],
    commitIndex: 2,
    partitionGroup: 'B',
    x: 165,
    y: 135,
  },
];

export function DistributedSystemsSandbox() {
  const [activeTab, setActiveTab] = useState<DistributedMode>('CONSISTENT_HASHING');

  // --- Vector Clocks & Causality State ---
  const initialVcNodes: VectorClockNode[] = [
    {
      id: 'node-a',
      name: 'Node A',
      region: 'us-east-1 (N. Virginia)',
      color: '#10b981',
      borderClass: 'border-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
      textClass: 'text-emerald-900 dark:text-emerald-200',
      vclock: [0, 0, 0],
      lamportTime: 0,
      value: 'cart=[]',
    },
    {
      id: 'node-b',
      name: 'Node B',
      region: 'eu-west-1 (Ireland)',
      color: '#0284c7',
      borderClass: 'border-sky-400',
      bgClass: 'bg-sky-50 dark:bg-sky-950/30',
      textClass: 'text-sky-900 dark:text-sky-200',
      vclock: [0, 0, 0],
      lamportTime: 0,
      value: 'cart=[]',
    },
    {
      id: 'node-c',
      name: 'Node C',
      region: 'ap-southeast-1 (Singapore)',
      color: '#d97706',
      borderClass: 'border-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/30',
      textClass: 'text-amber-900 dark:text-amber-200',
      vclock: [0, 0, 0],
      lamportTime: 0,
      value: 'cart=[]',
    },
  ];

  const [vcNodes, setVcNodes] = useState<VectorClockNode[]>(initialVcNodes);
  const [vcPartitionActive, setVcPartitionActive] = useState<boolean>(false);
  const [vcConflictNotice, setVcConflictNotice] = useState<string | null>(null);
  const [vcLwwWarning, setVcLwwWarning] = useState<string | null>(null);
  const [vcEvents, setVcEvents] = useState<VectorClockEvent[]>([
    {
      id: 1,
      time: '00:00:00',
      nodeId: 'node-a',
      type: 'LOCAL_WRITE',
      summary: 'Cluster initialized. All vector clocks [A:0, B:0, C:0], Lamport L=0.',
      vclock: [0, 0, 0],
      lamportTime: 0,
    },
  ]);

  // Vector Clock comparison helper
  const compareVectors = (v1: VectorClockTriple, v2: VectorClockTriple): 'V1_DOMINATES' | 'V2_DOMINATES' | 'EQUAL' | 'CONCURRENT' => {
    let v1GreaterOrEqual = true;
    let v2GreaterOrEqual = true;
    let equal = true;

    for (let i = 0; i < 3; i++) {
      if (v1[i] < v2[i]) v1GreaterOrEqual = false;
      if (v2[i] < v1[i]) v2GreaterOrEqual = false;
      if (v1[i] !== v2[i]) equal = false;
    }

    if (equal) return 'EQUAL';
    if (v1GreaterOrEqual) return 'V1_DOMINATES';
    if (v2GreaterOrEqual) return 'V2_DOMINATES';
    return 'CONCURRENT';
  };

  const handleVcLocalWrite = (nodeIndex: 0 | 1 | 2, item: string) => {
    setVcLwwWarning(null);
    setVcNodes((prev) =>
      prev.map((n, idx) => {
        if (idx === nodeIndex) {
          const nextVclock: VectorClockTriple = [...n.vclock] as VectorClockTriple;
          nextVclock[nodeIndex] += 1;
          const nextLamport = n.lamportTime + 1;
          const nextVal = `cart=[${item}]`;

          setVcEvents((evs) => [
            {
              id: Date.now(),
              time: new Date().toLocaleTimeString(),
              nodeId: n.id,
              type: 'LOCAL_WRITE',
              summary: `Local write on ${n.name}: ${nextVal}. Incremented local clock component ${['A', 'B', 'C'][nodeIndex]} -> ${nextVclock[nodeIndex]}.`,
              vclock: nextVclock,
              lamportTime: nextLamport,
            },
            ...evs.slice(0, 10),
          ]);

          return {
            ...n,
            vclock: nextVclock,
            lamportTime: nextLamport,
            value: nextVal,
            siblings: undefined,
          };
        }
        return n;
      })
    );
  };

  const handleVcReplicate = (fromIdx: 0 | 1 | 2, toIdx: 0 | 1 | 2) => {
    if (fromIdx === toIdx) return;
    const source = vcNodes[fromIdx];
    const target = vcNodes[toIdx];

    // Check if network partition isolates A and B
    if (vcPartitionActive && ((fromIdx === 0 && toIdx === 1) || (fromIdx === 1 && toIdx === 0))) {
      setVcConflictNotice(`Replication blocked! Network partition severed direct communication between ${source.name} and ${target.name}.`);
      return;
    }

    const rel = compareVectors(source.vclock, target.vclock);
    const nextLamport = Math.max(source.lamportTime, target.lamportTime) + 1;
    const nextVclock: VectorClockTriple = [
      Math.max(source.vclock[0], target.vclock[0]),
      Math.max(source.vclock[1], target.vclock[1]),
      Math.max(source.vclock[2], target.vclock[2]),
    ];
    // Increment receiver's own clock on receipt
    nextVclock[toIdx] += 1;

    if (rel === 'CONCURRENT') {
      // Sibling generation!
      const siblingList = [
        { value: target.value, vclock: target.vclock, originNode: target.name },
        { value: source.value, vclock: source.vclock, originNode: source.name },
      ];

      setVcNodes((prev) =>
        prev.map((n, idx) =>
          idx === toIdx
            ? {
                ...n,
                vclock: nextVclock,
                lamportTime: nextLamport,
                siblings: siblingList,
              }
            : n
        )
      );

      setVcConflictNotice(
        `Concurrent Conflict on ${target.name}! Incoming vector [${source.vclock.join(', ')}] and local vector [${target.vclock.join(', ')}] are non-dominating (${source.name} ‖ ${target.name}). Dynamo-style sibling values preserved for application resolution!`
      );

      setVcEvents((evs) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          nodeId: target.id,
          type: 'CONCURRENT_SPLIT',
          summary: `Conflict detected on ${target.name}: ${source.name} [${source.vclock.join(', ')}] ‖ ${target.name} [${target.vclock.join(', ')}]. Retained 2 concurrent siblings.`,
          vclock: nextVclock,
          lamportTime: nextLamport,
        },
        ...evs.slice(0, 10),
      ]);
    } else {
      // One dominates or equal: take the dominant value
      const dominantValue = rel === 'V1_DOMINATES' ? source.value : target.value;
      setVcNodes((prev) =>
        prev.map((n, idx) =>
          idx === toIdx
            ? {
                ...n,
                vclock: nextVclock,
                lamportTime: nextLamport,
                value: dominantValue,
                siblings: undefined,
              }
            : n
        )
      );

      setVcEvents((evs) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          nodeId: target.id,
          type: 'REPLICATION',
          summary: `Replication from ${source.name} to ${target.name}. Clock updated to [${nextVclock.join(', ')}], Lamport L=${nextLamport}.`,
          vclock: nextVclock,
          lamportTime: nextLamport,
        },
        ...evs.slice(0, 10),
      ]);
    }
  };

  const handleVcSimulateConcurrentSplit = () => {
    setVcLwwWarning(null);
    setVcPartitionActive(true);

    // Node A writes 'laptop'
    const vA: VectorClockTriple = [1, 0, 0];
    // Node B writes 'phone'
    const vB: VectorClockTriple = [0, 1, 0];

    // Node C receives both concurrent writes
    const vC: VectorClockTriple = [1, 1, 2];
    const siblings = [
      { value: 'cart=[laptop]', vclock: vA, originNode: 'Node A' },
      { value: 'cart=[phone]', vclock: vB, originNode: 'Node B' },
    ];

    setVcNodes([
      { ...initialVcNodes[0], vclock: vA, lamportTime: 1, value: 'cart=[laptop]', siblings: undefined },
      { ...initialVcNodes[1], vclock: vB, lamportTime: 1, value: 'cart=[phone]', siblings: undefined },
      { ...initialVcNodes[2], vclock: vC, lamportTime: 2, value: 'cart=[laptop, phone] (conflicted)', siblings },
    ]);

    setVcConflictNotice(
      'Partition & Concurrent Split Writes Activated: Node A wrote "cart=[laptop]" [1, 0, 0] while Node B wrote "cart=[phone]" [0, 1, 0]. Node C received both non-dominating vectors ([1, 0, 0] ‖ [0, 1, 0]) and generated Dynamo-style siblings!'
    );

    setVcEvents((evs) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        nodeId: 'node-c',
        type: 'CONCURRENT_SPLIT',
        summary: 'Concurrent split writes replicated to Node C! Created 2 conflicting siblings: "cart=[laptop]" [1, 0, 0] vs "cart=[phone]" [0, 1, 0].',
        vclock: vC,
        lamportTime: 2,
      },
      ...evs.slice(0, 10),
    ]);
  };

  const handleVcReconcile = (strategy: 'CRDT_UNION' | 'LWW_CLOCK') => {
    if (strategy === 'CRDT_UNION') {
      const mergedVal = 'cart=[laptop, phone]';
      const mergedClock: VectorClockTriple = [2, 2, 3];
      const mergedLamport = 4;

      setVcNodes((prev) =>
        prev.map((n) => ({
          ...n,
          vclock: mergedClock,
          lamportTime: mergedLamport,
          value: mergedVal,
          siblings: undefined,
        }))
      );

      setVcPartitionActive(false);
      setVcConflictNotice(null);
      setVcLwwWarning(null);

      setVcEvents((evs) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          nodeId: 'node-c',
          type: 'RECONCILE',
          summary: 'Resolved conflict via CRDT 3-way Set Union. Merged cart=[laptop, phone], took supremum clock [2, 2, 3]. Zero data loss!',
          vclock: mergedClock,
          lamportTime: mergedLamport,
        },
        ...evs.slice(0, 10),
      ]);
    } else {
      // LWW: Node B's clock was arbitrarily 1 ms higher, dropping Node A's laptop
      const lwwVal = 'cart=[phone]';
      const lwwClock: VectorClockTriple = [1, 2, 2];

      setVcNodes((prev) =>
        prev.map((n) => ({
          ...n,
          vclock: lwwClock,
          lamportTime: 3,
          value: lwwVal,
          siblings: undefined,
        }))
      );

      setVcPartitionActive(false);
      setVcConflictNotice(null);
      setVcLwwWarning(
        '⚠️ CRITICAL DATA LOSS DETECTED: Last-Write-Wins (LWW) with physical wall clock silently discarded Node A\'s write ("laptop")! The customer\'s shopping cart lost an item due to minor NTP clock skew.'
      );

      setVcEvents((evs) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          nodeId: 'node-c',
          type: 'RECONCILE',
          summary: 'Resolved via Last-Write-Wins (LWW). Overwrote Node A\'s cart item due to NTP timestamp bias. Data loss occurred!',
          vclock: lwwClock,
          lamportTime: 3,
        },
        ...evs.slice(0, 10),
      ]);
    }
  };

  const handleVcReset = () => {
    setVcNodes(initialVcNodes);
    setVcPartitionActive(false);
    setVcConflictNotice(null);
    setVcLwwWarning(null);
    setVcEvents([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        nodeId: 'node-a',
        type: 'LOCAL_WRITE',
        summary: 'Cluster reset to clean initial state. All vector clocks [A:0, B:0, C:0].',
        vclock: [0, 0, 0],
        lamportTime: 0,
      },
    ]);
  };

  // --- Module 1: Consistent Hashing, Multi-Replica & Quorums State ---
  const [includeNodeD, setIncludeNodeD] = useState(false);
  const [vnodesMultiplier, setVnodesMultiplier] = useState<1 | 2 | 3>(1);
  const [replicationFactor, setReplicationFactor] = useState<1 | 2 | 3>(3);
  const [writeQuorum, setWriteQuorum] = useState<1 | 2 | 3>(2);
  const [readQuorum, setReadQuorum] = useState<1 | 2 | 3>(2);
  const [enableSloppyQuorum, setEnableSloppyQuorum] = useState(false);
  const [offlineNodes, setOfflineNodes] = useState<Record<string, boolean>>({});
  const [selectedKeyId, setSelectedKeyId] = useState<string>('k2');
  const [hashAuditLog, setHashAuditLog] = useState<HashSimulationEvent[]>([
    {
      id: 1,
      time: '12:00:00',
      op: 'TOPOLOGY',
      badge: 'CLUSTER_INIT',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      message: 'Consistent Hash Ring initialized: 3 physical nodes, Replication Factor N=3, Quorums W=2, R=2 (Strong Consistency W+R > N).',
    },
  ]);

  // Generate active node positions (with virtual nodes if multiplier > 1)
  const activeNodes = includeNodeD ? [...BASE_NODES, NODE_D] : BASE_NODES;
  const ringPoints: RingToken[] = [];

  for (const node of activeNodes) {
    for (let v = 0; v < vnodesMultiplier; v++) {
      // Offset virtual nodes evenly around ring: angle + v * (360 / (activeNodes.length * vnodesMultiplier))
      const offset = (v * (360 / (activeNodes.length * vnodesMultiplier * 1.5))) % 360;
      const ringAngle = (node.baseAngle + offset) % 360;
      ringPoints.push({
        id: `${node.id}-v${v}`,
        nodeId: node.id,
        name: v === 0 ? node.name : `${node.name}#${v + 1}`,
        angle: Math.round(ringAngle),
        color: node.color,
        isVirtual: v > 0,
        badgeBg: node.badgeBg,
      });
    }
  }
  ringPoints.sort((a, b) => a.angle - b.angle);

  // Compute ring partition arc for each physical node
  const partitionStats: NodePartitionStats[] = activeNodes.map((node) => {
    let nodeArc = 0;
    for (let i = 0; i < ringPoints.length; i++) {
      const pt = ringPoints[i];
      if (pt.nodeId === node.id) {
        const prevPt = ringPoints[(i - 1 + ringPoints.length) % ringPoints.length];
        const arc = ringPoints.length === 1 ? 360 : (pt.angle - prevPt.angle + 360) % 360;
        nodeArc += arc;
      }
    }
    const percentShare = Math.round((nodeArc / 360) * 1000) / 10;
    return {
      nodeId: node.id,
      name: node.name,
      color: node.color,
      badgeBg: node.badgeBg,
      arcDegrees: nodeArc,
      percentShare,
      assignedKeyCount: 0, // updated below
      isOnline: !offlineNodes[node.id],
    };
  });

  // Function to compute preference list for any given key angle
  const getPreferenceListForKey = (keyAngle: number): PreferenceListEntry[] => {
    if (ringPoints.length === 0) return [];
    // Find first token with angle >= keyAngle (or ringPoints[0])
    let startIndex = 0;
    for (let i = 0; i < ringPoints.length; i++) {
      if (ringPoints[i].angle >= keyAngle) {
        startIndex = i;
        break;
      }
    }

    const prefList: PreferenceListEntry[] = [];
    const seenPhysicalNodes = new Set<string>();
    const targetN = Math.min(replicationFactor, activeNodes.length);

    for (let step = 0; step < ringPoints.length; step++) {
      const token = ringPoints[(startIndex + step) % ringPoints.length];
      if (!seenPhysicalNodes.has(token.nodeId)) {
        seenPhysicalNodes.add(token.nodeId);
        const physical = activeNodes.find((n) => n.id === token.nodeId)!;
        prefList.push({
          physicalNode: physical,
          token,
          isCoordinator: prefList.length === 0,
          isOnline: !offlineNodes[physical.id],
        });
        if (prefList.length >= targetN) break;
      }
    }
    return prefList;
  };

  // Map each key clockwise to preference list and primary coordinator
  const keyAssignments = CACHE_KEYS.map((k) => {
    const prefList = getPreferenceListForKey(k.angle);
    const assigned = prefList[0]?.token || ringPoints[0];
    const primaryNode = prefList[0]?.physicalNode || activeNodes[0];
    return {
      ...k,
      assignedNode: assigned,
      primaryPhysicalNode: primaryNode,
      preferenceList: prefList,
    };
  });

  // Update assignedKeyCount in partitionStats
  keyAssignments.forEach((k) => {
    const stat = partitionStats.find((s) => s.nodeId === k.primaryPhysicalNode.id);
    if (stat) stat.assignedKeyCount += 1;
  });

  // Calculate load distribution variance and CV
  const idealShare = 100 / activeNodes.length;
  const variance =
    partitionStats.reduce((sum, s) => sum + Math.pow(s.percentShare - idealShare, 2), 0) /
    activeNodes.length;
  const stdDev = Math.sqrt(variance);
  const coeffVariation = idealShare > 0 ? (stdDev / idealShare) * 100 : 0;

  // Selected key and its preference list
  const activeSelectedKey = keyAssignments.find((k) => k.id === selectedKeyId) || keyAssignments[0];
  const activePrefList = activeSelectedKey.preferenceList;
  const isStrongConsistency = writeQuorum + readQuorum > replicationFactor;
  const quorumMargin = writeQuorum + readQuorum - replicationFactor;

  const handleToggleNodeOnline = (nodeId: string) => {
    const target = activeNodes.find((n) => n.id === nodeId);
    const isCurrentlyOffline = !!offlineNodes[nodeId];
    const nextState = !isCurrentlyOffline;

    setOfflineNodes((prev) => ({ ...prev, [nodeId]: nextState }));
    setHashAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        op: 'TOPOLOGY',
        badge: nextState ? 'NODE_OFFLINE' : 'NODE_ONLINE',
        badgeClass: nextState ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300',
        message: `${target?.name || nodeId} transitioned to ${nextState ? 'OFFLINE (Partitioned/Crashed)' : 'ONLINE'}. Ring health updated.`,
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleSimulateQuorumWrite = () => {
    const pref = activePrefList;
    const onlineNodesInPref = pref.filter((p) => p.isOnline);
    const acks = onlineNodesInPref.length;

    if (acks >= writeQuorum) {
      setHashAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          op: 'WRITE',
          badge: 'WRITE_SUCCESS',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          message: `Quorum Write for "${activeSelectedKey.label}" SUCCEEDED! Acknowledged by ${acks}/${writeQuorum} replicas (${onlineNodesInPref.map((p) => p.physicalNode.name).join(', ')}). Durable write confirmed.`,
        },
        ...prev.slice(0, 8),
      ]);
    } else if (enableSloppyQuorum) {
      const healthyOutside = activeNodes.find((n) => !offlineNodes[n.id] && !pref.some((p) => p.physicalNode.id === n.id));
      if (healthyOutside) {
        setHashAuditLog((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            op: 'WRITE',
            badge: 'SLOPPY_HINTED_HANDOFF',
            badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
            message: `Sloppy Quorum Active: Replicas down (only ${acks}/${writeQuorum} healthy in preference list). Accepted write via Hinted Handoff on healthy successor ${healthyOutside.name}! Will replay upon replica recovery.`,
          },
          ...prev.slice(0, 8),
        ]);
      } else {
        setHashAuditLog((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            op: 'WRITE',
            badge: 'SLOPPY_WRITE_FAILED',
            badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
            message: `Sloppy Quorum Write FAILED: Not enough healthy nodes in cluster to accept hinted handoff!`,
          },
          ...prev.slice(0, 8),
        ]);
      }
    } else {
      setHashAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          op: 'WRITE',
          badge: 'WRITE_QUORUM_FAILED',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
          message: `Strict Quorum Write for "${activeSelectedKey.label}" FAILED! Required W=${writeQuorum} acks, but only ${acks} online replica(s) responded (${onlineNodesInPref.map((p) => p.physicalNode.name).join(', ') || 'none'}). Rejected to preserve safety.`,
        },
        ...prev.slice(0, 8),
      ]);
    }
  };

  const handleSimulateQuorumRead = () => {
    const pref = activePrefList;
    const onlineNodesInPref = pref.filter((p) => p.isOnline);
    const acks = onlineNodesInPref.length;

    if (acks >= readQuorum) {
      if (isStrongConsistency) {
        setHashAuditLog((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            op: 'READ',
            badge: 'STRONG_READ_HIT',
            badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
            message: `Strong Consistency Read: Received ${acks}/${readQuorum} acks (${onlineNodesInPref.map((p) => p.physicalNode.name).join(', ')}). W (${writeQuorum}) + R (${readQuorum}) = ${writeQuorum + readQuorum} > N (${replicationFactor}). Pigeonhole Principle guarantees intersection with write set. Latest value verified!`,
          },
          ...prev.slice(0, 8),
        ]);
      } else {
        setHashAuditLog((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            op: 'READ',
            badge: 'STALE_READ_RISK',
            badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
            message: `Eventual Consistency Read: Achieved R=${readQuorum} acks (${onlineNodesInPref.map((p) => p.physicalNode.name).join(', ')}), BUT W+R (${writeQuorum}+${readQuorum}) <= N (${replicationFactor}). Read set and write set may be disjoint! Risk of reading stale data.`,
          },
          ...prev.slice(0, 8),
        ]);
      }
    } else {
      setHashAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          op: 'READ',
          badge: 'READ_QUORUM_FAILED',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
          message: `Read Quorum FAILED! Required R=${readQuorum} acks, but only ${acks} online replica(s) available in preference list.`,
        },
        ...prev.slice(0, 8),
      ]);
    }
  };

  const handleResetHashCluster = () => {
    setOfflineNodes({});
    setHashAuditLog([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        op: 'TOPOLOGY',
        badge: 'CLUSTER_RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        message: 'All physical nodes restored to ONLINE. Quorum metrics reset.',
      },
    ]);
  };

  // --- Module 2: Rate Limiter State ---
  const [rateLimiterType, setRateLimiterType] = useState<'TOKEN_BUCKET' | 'LEAKY_BUCKET' | 'SLIDING_WINDOW'>('TOKEN_BUCKET');
  // Token Bucket:
  const [tbTokens, setTbTokens] = useState(10);
  const [tbCapacity] = useState(10);
  const [tbLog, setTbLog] = useState<Array<{ id: number; status: 'ALLOW' | 'REJECT'; time: string }>>([]);

  // Leaky Bucket:
  const [lbQueue, setLbQueue] = useState<number[]>([]);
  const [lbCapacity] = useState(8);
  const [lbLog, setLbLog] = useState<Array<{ id: number; status: 'QUEUED' | 'DROPPED'; time: string }>>([]);

  // Sliding Window:
  const [swCurrentCount, setSwCurrentCount] = useState(4);
  const [swPrevCount] = useState(6);
  const [swElapsedSeconds, setSwElapsedSeconds] = useState(20);
  const swWindowSeconds = 60;
  const swLimit = 10;
  const swWeight = Math.max(0, (swWindowSeconds - swElapsedSeconds) / swWindowSeconds);
  const swEstimatedCount = Math.round((swCurrentCount + swPrevCount * swWeight) * 10) / 10;

  const handleTbRequest = (count: number) => {
    if (tbTokens >= count) {
      setTbTokens((prev) => prev - count);
      setTbLog((prev) => [
        { id: Date.now(), status: 'ALLOW', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 7),
      ]);
    } else {
      setTbLog((prev) => [
        { id: Date.now(), status: 'REJECT', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 7),
      ]);
    }
  };

  const handleTbRefill = () => {
    setTbTokens((prev) => Math.min(tbCapacity, prev + 2));
  };

  const handleLbRequest = (count: number) => {
    if (lbQueue.length + count <= lbCapacity) {
      setLbQueue((prev) => [...prev, ...Array(count).fill(1)]);
      setLbLog((prev) => [
        { id: Date.now(), status: 'QUEUED', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 7),
      ]);
    } else {
      setLbLog((prev) => [
        { id: Date.now(), status: 'DROPPED', time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 7),
      ]);
    }
  };

  const handleLbLeak = () => {
    setLbQueue((prev) => prev.slice(2));
  };

  const handleSwRequest = () => {
    if (swEstimatedCount < swLimit) {
      setSwCurrentCount((prev) => prev + 1);
    }
  };

  // --- Module 3: Circuit Breaker State ---
  type CbState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  const [cbState, setCbState] = useState<CbState>('CLOSED');
  const [cbHistory, setCbHistory] = useState<Array<'SUCCESS' | 'FAILURE'>>([
    'SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS',
  ]);
  const [cbCooldown, setCbCooldown] = useState(5);
  const [cbProbeSuccesses, setCbProbeSuccesses] = useState(0);

  const cbFailureCount = cbHistory.filter((h) => h === 'FAILURE').length;
  const cbFailureRate = cbHistory.length > 0 ? Math.round((cbFailureCount / cbHistory.length) * 100) : 0;

  const handleCbSuccess = () => {
    if (cbState === 'OPEN') return; // Cannot execute while open
    if (cbState === 'HALF_OPEN') {
      const nextCount = cbProbeSuccesses + 1;
      setCbProbeSuccesses(nextCount);
      if (nextCount >= 2) {
        setCbState('CLOSED');
        setCbProbeSuccesses(0);
        setCbHistory(['SUCCESS', 'SUCCESS', 'SUCCESS']);
      }
      return;
    }

    // Closed:
    const newHistory = [...cbHistory.slice(-9), 'SUCCESS' as const];
    setCbHistory(newHistory);
  };

  const handleCbFailure = () => {
    if (cbState === 'OPEN') return;
    if (cbState === 'HALF_OPEN') {
      // Immediate trip back to open on trial failure!
      setCbState('OPEN');
      setCbCooldown(5);
      setCbProbeSuccesses(0);
      return;
    }

    // Closed:
    const newHistory = [...cbHistory.slice(-9), 'FAILURE' as const];
    setCbHistory(newHistory);
    const failRate = Math.round((newHistory.filter((h) => h === 'FAILURE').length / newHistory.length) * 100);
    if (failRate >= 50 && newHistory.length >= 4) {
      setCbState('OPEN');
      setCbCooldown(5);
    }
  };

  const handleCbTick = () => {
    if (cbState === 'OPEN') {
      if (cbCooldown <= 1) {
        setCbState('HALF_OPEN');
        setCbCooldown(0);
        setCbProbeSuccesses(0);
      } else {
        setCbCooldown((prev) => prev - 1);
      }
    }
  };

  // --- Module 4: Raft Consensus & Quorum State ---
  const [raftNodes, setRaftNodes] = useState<RaftNode[]>(INITIAL_RAFT_NODES);
  const [raftTerm, setRaftTerm] = useState<number>(1);
  const [isPartitioned, setIsPartitioned] = useState<boolean>(false);
  const [customCommand, setCustomCommand] = useState<string>('SET cache_ttl=3600');
  const [raftStore, setRaftStore] = useState<Record<string, string>>({
    cluster: 'ACTIVE',
    schema: 'V2',
  });
  const [raftAuditLog, setRaftAuditLog] = useState<
    Array<{ id: number; time: string; text: string; badge: string; isWarning?: boolean }>
  >([
    {
      id: 1,
      time: '12:00:00',
      text: 'Cluster initialized. Node 1 elected Leader for Term 1 with unanimous 5/5 quorum.',
      badge: 'ELECTION',
    },
    {
      id: 2,
      time: '12:00:02',
      text: 'AppendEntries heartbeats active. State machine applied [cluster=ACTIVE], [schema=V2].',
      badge: 'HEARTBEAT',
    },
  ]);

  const activeLeader = raftNodes.find((n) => n.role === 'LEADER');
  const quorumThreshold = Math.floor(raftNodes.length / 2) + 1; // 3 out of 5

  const handleProposeCommand = (cmdToPropose?: string) => {
    const cmd = (cmdToPropose || customCommand).trim();
    if (!cmd) return;

    const leader = raftNodes.find((n) => n.role === 'LEADER');
    if (!leader) {
      setRaftAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          text: 'Proposal Rejected: No active Leader reachable in the cluster. Trigger an election or restore a leader.',
          badge: 'REJECTED',
          isWarning: true,
        },
        ...prev.slice(0, 8),
      ]);
      return;
    }

    const nextIndex = leader.log.length + 1;

    if (isPartitioned) {
      if (leader.partitionGroup === 'A') {
        // Group A is Minority (2 nodes: Node 1 & Node 2). Quorum = 3. 2 < 3 -> FAILS
        setRaftNodes((prev) =>
          prev.map((n) => {
            if (n.partitionGroup === 'A' && n.role !== 'OFFLINE') {
              return {
                ...n,
                log: [
                  ...n.log,
                  { index: nextIndex, term: leader.term, command: cmd, committed: false },
                ],
              };
            }
            return n;
          })
        );
        setRaftAuditLog((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            text: `WARNING: Write blocked in Minority Partition! Leader ${leader.name} acquired only 2/3 required quorum ACKs. Log entry #${nextIndex} [${cmd}] remains uncommitted. State machine unchanged.`,
            badge: 'QUORUM_FAIL',
            isWarning: true,
          },
          ...prev.slice(0, 8),
        ]);
      } else {
        // Group B is Majority (3 nodes: Node 3, 4, 5). 3 >= 3 -> SUCCEEDS
        setRaftNodes((prev) =>
          prev.map((n) => {
            if (n.partitionGroup === 'B' && n.role !== 'OFFLINE') {
              return {
                ...n,
                commitIndex: nextIndex,
                log: [
                  ...n.log,
                  { index: nextIndex, term: leader.term, command: cmd, committed: true },
                ],
              };
            }
            return n;
          })
        );
        if (cmd.startsWith('SET ')) {
          const parts = cmd.substring(4).split('=');
          if (parts.length === 2) {
            setRaftStore((prev) => ({ ...prev, [parts[0].trim()]: parts[1].trim() }));
          }
        }
        setRaftAuditLog((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            text: `Success: Leader ${leader.name} in Group B (majority) committed entry #${nextIndex} [${cmd}] with 3/3 quorum. Applied to state machine!`,
            badge: 'COMMIT',
          },
          ...prev.slice(0, 8),
        ]);
      }
    } else {
      // Normal unpartitioned cluster
      const onlineCount = raftNodes.filter((n) => n.role !== 'OFFLINE').length;
      const isCommitted = onlineCount >= quorumThreshold;

      setRaftNodes((prev) =>
        prev.map((n) => {
          if (n.role !== 'OFFLINE') {
            return {
              ...n,
              commitIndex: isCommitted ? nextIndex : n.commitIndex,
              log: [
                ...n.log,
                { index: nextIndex, term: leader.term, command: cmd, committed: isCommitted },
              ],
            };
          }
          return n;
        })
      );

      if (isCommitted) {
        if (cmd.startsWith('SET ')) {
          const parts = cmd.substring(4).split('=');
          if (parts.length === 2) {
            setRaftStore((prev) => ({ ...prev, [parts[0].trim()]: parts[1].trim() }));
          }
        }
        setRaftAuditLog((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            text: `Success: Leader ${leader.name} committed entry #${nextIndex} [${cmd}] with ${onlineCount}/5 quorum. Applied to replicated state machine!`,
            badge: 'COMMIT',
          },
          ...prev.slice(0, 8),
        ]);
      }
    }
  };

  const handleSimulateLeaderCrash = () => {
    const leader = raftNodes.find((n) => n.role === 'LEADER');
    if (!leader) return;

    const nextTerm = raftTerm + 1;
    setRaftTerm(nextTerm);

    // Pick candidate from online followers (Node 2 if available, else first online)
    const candidate = raftNodes.find((n) => n.id !== leader.id && n.role !== 'OFFLINE') || raftNodes[1];

    setRaftNodes((prev) =>
      prev.map((n) => {
        if (n.id === leader.id) {
          return { ...n, role: 'OFFLINE' };
        }
        if (n.id === candidate.id) {
          return { ...n, role: 'LEADER', term: nextTerm, votedFor: n.id };
        }
        return { ...n, role: 'FOLLOWER', term: nextTerm, votedFor: candidate.id };
      })
    );

    setRaftAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: `Leader ${leader.name} crashed! Heartbeat timed out. ${candidate.name} called election for Term ${nextTerm}, gathered 4/4 online votes (quorum >= 3), and transitioned to LEADER!`,
        badge: 'ELECTION',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleSimulatePartition = () => {
    if (isPartitioned) return;
    setIsPartitioned(true);
    const nextTerm = raftTerm + 1;
    setRaftTerm(nextTerm);

    // Group A: Node 1 (Term 1 Leader), Node 2 -> Minority (2/5 nodes, no quorum)
    // Group B: Node 3 becomes Term 2 Leader, Nodes 4 & 5 Followers -> Majority (3/5 nodes, quorum >= 3)
    setRaftNodes((prev) =>
      prev.map((n) => {
        if (n.id === 'node-1') {
          return { ...n, role: 'LEADER', term: raftTerm, partitionGroup: 'A' };
        }
        if (n.id === 'node-2') {
          return { ...n, role: 'FOLLOWER', term: raftTerm, partitionGroup: 'A' };
        }
        if (n.id === 'node-3') {
          return { ...n, role: 'LEADER', term: nextTerm, partitionGroup: 'B', votedFor: 'node-3' };
        }
        return { ...n, role: 'FOLLOWER', term: nextTerm, partitionGroup: 'B', votedFor: 'node-3' };
      })
    );

    setRaftAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: `Network partitioned! Group A [Node 1, 2] (Minority, 2 nodes). Group B [Node 3, 4, 5] (Majority, 3 nodes). Group B elected Node 3 as Leader in Term ${nextTerm} with majority quorum. Split-brain prevented!`,
        badge: 'PARTITION',
        isWarning: true,
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleHealPartition = () => {
    if (!isPartitioned) return;
    setIsPartitioned(false);

    // Node 3 in Group B was the majority leader in Term 2
    const authLeader = raftNodes.find((n) => n.id === 'node-3') || raftNodes[2];
    const authoritativeLog = [...authLeader.log];
    const authoritativeCommit = authLeader.commitIndex;

    setRaftNodes((prev) =>
      prev.map((n) => {
        if (n.id === 'node-3') {
          return { ...n, role: 'LEADER', partitionGroup: 'NONE' };
        }
        return {
          ...n,
          role: 'FOLLOWER',
          term: authLeader.term,
          votedFor: authLeader.id,
          log: [...authoritativeLog],
          commitIndex: authoritativeCommit,
          partitionGroup: 'NONE',
        };
      })
    );

    setRaftAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: `Network partition healed! Node 1 detected higher Term ${authLeader.term} from Node 3 and stepped down to Follower. Nodes 1 & 2 reconciled uncommitted entries per the Log Matching Invariant. All 5 nodes synchronized!`,
        badge: 'HEAL',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleResetRaft = () => {
    setRaftNodes(INITIAL_RAFT_NODES);
    setRaftTerm(1);
    setIsPartitioned(false);
    setRaftStore({
      cluster: 'ACTIVE',
      schema: 'V2',
    });
    setRaftAuditLog([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        text: 'Cluster state reset. Node 1 restored as Leader in Term 1 with synchronized logs.',
        badge: 'RESET',
      },
    ]);
  };

  // --- Module 6: 2PC vs Distributed Saga State ---
  const [txArchitecture, setTxArchitecture] = useState<TxArchitecture>('TWO_PHASE_COMMIT');

  // 2PC State
  const [twoPhaseCoordState, setTwoPhaseCoordState] = useState<TwoPhaseCoordinatorState>('IDLE');
  const [twoPhaseParticipants, setTwoPhaseParticipants] = useState<TwoPhaseParticipant[]>([
    {
      id: 'order',
      name: 'Order Service',
      resource: 'Postgres (orders table)',
      status: 'IDLE',
      locked: false,
      vote: null,
      dbState: 'orders: empty',
    },
    {
      id: 'payment',
      name: 'Payment Service',
      resource: 'Ledger DB (balances table)',
      status: 'IDLE',
      locked: false,
      vote: null,
      dbState: 'balance: $500 available',
    },
    {
      id: 'inventory',
      name: 'Inventory Service',
      resource: 'Warehouse DB (stock table)',
      status: 'IDLE',
      locked: false,
      vote: null,
      dbState: 'sku_SRV_X: 12 units in stock',
    },
  ]);
  const [twoPhaseWal, setTwoPhaseWal] = useState<string>('WAL: INIT');

  // Saga State
  const [sagaOrchestratorState, setSagaOrchestratorState] = useState<SagaOrchestratorState>('IDLE');
  const [sagaSteps, setSagaSteps] = useState<SagaStep[]>([
    {
      id: 'order',
      serviceName: 'Order Service',
      stepNumber: 1,
      forwardTx: 'T1: CreateOrder(PENDING)',
      compensatingTx: 'C1: CancelOrder(CANCELLED)',
      status: 'IDLE',
      dbState: 'orders: empty',
    },
    {
      id: 'payment',
      serviceName: 'Payment Service',
      stepNumber: 2,
      forwardTx: 'T2: ChargeCustomer($120)',
      compensatingTx: 'C2: RefundCustomer($120)',
      status: 'IDLE',
      dbState: 'balance: $500',
    },
    {
      id: 'inventory',
      serviceName: 'Inventory Service',
      stepNumber: 3,
      forwardTx: 'T3: ReserveItem(sku=SRV-X)',
      compensatingTx: 'C3: RestockItem(sku=SRV-X)',
      status: 'IDLE',
      dbState: 'stock: 12 units',
    },
  ]);

  const [txAuditLog, setTxAuditLog] = useState<TxAuditEvent[]>([
    {
      id: 1,
      time: '12:00:00',
      badge: 'INIT',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      message: 'Transaction studio ready. Select 2PC (ACID) or Saga (BASE).',
    },
  ]);

  // 2PC Handlers
  const handle2pcCommitSuccess = () => {
    setTwoPhaseCoordState('COMMITTED');
    setTwoPhaseWal('WAL: TX_101 GLOBAL_COMMIT (Appended to Disk)');
    setTwoPhaseParticipants([
      {
        id: 'order',
        name: 'Order Service',
        resource: 'Postgres (orders table)',
        status: 'COMMITTED',
        locked: false,
        vote: 'COMMIT',
        dbState: 'orders: #101 COMMITTED (Row lock released)',
      },
      {
        id: 'payment',
        name: 'Payment Service',
        resource: 'Ledger DB (balances table)',
        status: 'COMMITTED',
        locked: false,
        vote: 'COMMIT',
        dbState: 'balance: $380 ($120 debited, Lock released)',
      },
      {
        id: 'inventory',
        name: 'Inventory Service',
        resource: 'Warehouse DB (stock table)',
        status: 'COMMITTED',
        locked: false,
        vote: 'COMMIT',
        dbState: 'sku_SRV_X: 11 units (-1 deducted, Lock released)',
      },
    ]);

    setTxAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: '2PC_COMMIT',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        message: 'Phase 1: All 3 participants voted COMMIT_READY and held row locks. Phase 2: Coordinator appended GLOBAL_COMMIT to WAL and broadcasted commit. All row locks released successfully.',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handle2pcParticipantFailure = () => {
    setTwoPhaseCoordState('ABORTED');
    setTwoPhaseWal('WAL: TX_102 GLOBAL_ROLLBACK (Inventory Out-of-Stock)');
    setTwoPhaseParticipants([
      {
        id: 'order',
        name: 'Order Service',
        resource: 'Postgres (orders table)',
        status: 'ABORTED',
        locked: false,
        vote: 'COMMIT',
        dbState: 'orders: #102 ROLLED_BACK (No partial record)',
      },
      {
        id: 'payment',
        name: 'Payment Service',
        resource: 'Ledger DB (balances table)',
        status: 'ABORTED',
        locked: false,
        vote: 'COMMIT',
        dbState: 'balance: $500 (Pre-auth rolled back)',
      },
      {
        id: 'inventory',
        name: 'Inventory Service',
        resource: 'Warehouse DB (stock table)',
        status: 'ABORTED',
        locked: false,
        vote: 'ABORT',
        dbState: 'sku_SRV_X: 0 units available (VOTED ABORT)',
      },
    ]);

    setTxAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: '2PC_ABORT',
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
        message: 'Phase 1: Inventory Service detected stockout and voted ABORT. Phase 2: Coordinator forced GLOBAL_ROLLBACK. All participants rolled back local state and released locks. Zero data corruption.',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handle2pcCoordinatorCrash = () => {
    setTwoPhaseCoordState('CRASHED_BLOCKING');
    setTwoPhaseWal('WAL: TX_103 PREPARE_BROADCAST (COORDINATOR CRASHED BEFORE COMMIT DECISION!)');
    setTwoPhaseParticipants([
      {
        id: 'order',
        name: 'Order Service',
        resource: 'Postgres (orders table)',
        status: 'PREPARED',
        locked: true,
        vote: 'COMMIT',
        dbState: 'orders: #103 PREPARED 🔒 (EXCLUSIVE ROW LOCK HELD - BLOCKED)',
      },
      {
        id: 'payment',
        name: 'Payment Service',
        resource: 'Ledger DB (balances table)',
        status: 'PREPARED',
        locked: true,
        vote: 'COMMIT',
        dbState: 'balance: $380 PREPARED 🔒 (EXCLUSIVE LEDGER LOCK HELD - BLOCKED)',
      },
      {
        id: 'inventory',
        name: 'Inventory Service',
        resource: 'Warehouse DB (stock table)',
        status: 'PREPARED',
        locked: true,
        vote: 'COMMIT',
        dbState: 'sku_SRV_X: 11 PREPARED 🔒 (EXCLUSIVE WAREHOUSE LOCK HELD - BLOCKED)',
      },
    ]);

    setTxAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: '2PC_CRASH_BLOCK',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        message: 'CRITICAL FAILURE: Coordinator sent PREPARE and crashed before deciding! All 3 participants are INDEFINITELY BLOCKED holding exclusive database row locks! Neither unilateral commit nor unilateral abort is allowed under 2PC.',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handle2pcReset = () => {
    setTwoPhaseCoordState('IDLE');
    setTwoPhaseWal('WAL: IDLE');
    setTwoPhaseParticipants([
      {
        id: 'order',
        name: 'Order Service',
        resource: 'Postgres (orders table)',
        status: 'IDLE',
        locked: false,
        vote: null,
        dbState: 'orders: empty',
      },
      {
        id: 'payment',
        name: 'Payment Service',
        resource: 'Ledger DB (balances table)',
        status: 'IDLE',
        locked: false,
        vote: null,
        dbState: 'balance: $500 available',
      },
      {
        id: 'inventory',
        name: 'Inventory Service',
        resource: 'Warehouse DB (stock table)',
        status: 'IDLE',
        locked: false,
        vote: null,
        dbState: 'sku_SRV_X: 12 units in stock',
      },
    ]);
    setTxAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        message: '2PC cluster state reset to initial idle state.',
      },
      ...prev.slice(0, 7),
    ]);
  };

  // Saga Handlers
  const handleSagaRunSuccess = () => {
    setSagaOrchestratorState('COMPLETED');
    setSagaSteps([
      {
        id: 'order',
        serviceName: 'Order Service',
        stepNumber: 1,
        forwardTx: 'T1: CreateOrder(status=PENDING)',
        compensatingTx: 'C1: CancelOrder(status=CANCELLED)',
        status: 'COMMITTED',
        dbState: 'orders: #201 [CONFIRMED] (Committed locally, 0 locks held)',
      },
      {
        id: 'payment',
        serviceName: 'Payment Service',
        stepNumber: 2,
        forwardTx: 'T2: ChargeCustomer($120)',
        compensatingTx: 'C2: RefundCustomer($120)',
        status: 'COMMITTED',
        dbState: 'balance: $380 ($120 captured, 0 locks held)',
      },
      {
        id: 'inventory',
        serviceName: 'Inventory Service',
        stepNumber: 3,
        forwardTx: 'T3: ReserveItem(sku=SRV-X)',
        compensatingTx: 'C3: RestockItem(sku=SRV-X)',
        status: 'COMMITTED',
        dbState: 'stock: 11 units (-1 reserved, 0 locks held)',
      },
    ]);

    setTxAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'SAGA_SUCCESS',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        message: 'Saga Forward Execution Completed! T1 committed -> T2 committed -> T3 committed. Each transaction committed immediately in its local database with ZERO global locks held.',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handleSagaRunFailureCompensate = () => {
    setSagaOrchestratorState('COMPENSATED_ABORT');
    setSagaSteps([
      {
        id: 'order',
        serviceName: 'Order Service',
        stepNumber: 1,
        forwardTx: 'T1: CreateOrder(status=PENDING)',
        compensatingTx: 'C1: CancelOrder(status=CANCELLED)',
        status: 'COMPENSATED',
        dbState: 'orders: #202 [CANCELLED] (Compensated via C1)',
      },
      {
        id: 'payment',
        serviceName: 'Payment Service',
        stepNumber: 2,
        forwardTx: 'T2: ChargeCustomer($120)',
        compensatingTx: 'C2: RefundCustomer($120)',
        status: 'COMPENSATED',
        dbState: 'balance: $500 ($120 refunded via C2)',
      },
      {
        id: 'inventory',
        serviceName: 'Inventory Service',
        stepNumber: 3,
        forwardTx: 'T3: ReserveItem(sku=SRV-X)',
        compensatingTx: 'C3: RestockItem(sku=SRV-X)',
        status: 'FAILED',
        dbState: 'stock: 0 units (Out of stock! T3 FAILED)',
      },
    ]);

    setTxAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'SAGA_COMPENSATE',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
        message: 'Backward Recovery Triggered: T3 failed at Inventory. Saga Orchestrator initiated compensating transactions in reverse order: C2 refunded $120 to customer, then C1 marked Order #202 as CANCELLED. System reached eventual consistency without holding locks!',
      },
      ...prev.slice(0, 7),
    ]);
  };

  const handleSagaReset = () => {
    setSagaOrchestratorState('IDLE');
    setSagaSteps([
      {
        id: 'order',
        serviceName: 'Order Service',
        stepNumber: 1,
        forwardTx: 'T1: CreateOrder(PENDING)',
        compensatingTx: 'C1: CancelOrder(CANCELLED)',
        status: 'IDLE',
        dbState: 'orders: empty',
      },
      {
        id: 'payment',
        serviceName: 'Payment Service',
        stepNumber: 2,
        forwardTx: 'T2: ChargeCustomer($120)',
        compensatingTx: 'C2: RefundCustomer($120)',
        status: 'IDLE',
        dbState: 'balance: $500',
      },
      {
        id: 'inventory',
        serviceName: 'Inventory Service',
        stepNumber: 3,
        forwardTx: 'T3: ReserveItem(sku=SRV-X)',
        compensatingTx: 'C3: RestockItem(sku=SRV-X)',
        status: 'IDLE',
        dbState: 'stock: 12 units',
      },
    ]);
    setTxAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        message: 'Saga orchestrator state reset to initial idle state.',
      },
      ...prev.slice(0, 7),
    ]);
  };


  // --- Module 7: Distributed Lock Fencing Tokens & Split-Brain State ---
  const [fencingStorageMode, setFencingStorageMode] = useState<FencingStorageMode>('FENCING_TOKEN_GATED');
  const [fencingStep, setFencingStep] = useState<number>(0);
  const [fencingLockManager, setFencingLockManager] = useState<{
    currentHolder: 'client-1' | 'client-2' | null;
    currentToken: number;
    leaseSeconds: number;
    isExpired: boolean;
  }>({
    currentHolder: null,
    currentToken: 32,
    leaseSeconds: 10,
    isExpired: false,
  });

  const [fencingClient1, setFencingClient1] = useState<FencingClient>({
    id: 'client-1',
    name: 'Client 1 (Batch Invoice Settler)',
    heldToken: null,
    status: 'IDLE',
    leaseSecondsRemaining: 0,
    dataPayload: '{"invoiceId": 901, "status": "SETTLED", "amount": 1500}',
    statusMessage: 'Process idle. Awaiting lock acquisition to settle invoice.',
  });

  const [fencingClient2, setFencingClient2] = useState<FencingClient>({
    id: 'client-2',
    name: 'Client 2 (Dispute Revocation Worker)',
    heldToken: null,
    status: 'IDLE',
    leaseSecondsRemaining: 0,
    dataPayload: '{"invoiceId": 901, "status": "REVOKED", "amount": 0}',
    statusMessage: 'Process idle. Awaiting lock acquisition to revoke disputed invoice.',
  });

  const [fencingStorage, setFencingStorage] = useState<FencingStorageState>({
    currentData: '{"invoiceId": 901, "status": "PENDING", "amount": 1500}',
    maxCommittedToken: 32,
    committedBy: 'Initial Seed State',
    isCorrupted: false,
    integrityMessage: 'Storage engine consistent. Monotonic token watermark = 32.',
  });

  const [fencingAuditLog, setFencingAuditLog] = useState<FencingAuditEvent[]>([
    {
      id: 1,
      time: '00:00:00',
      badge: 'INIT',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
      message: 'Lock Coordinator active. Storage engine initialized at token watermark 32. Mode: FENCING_TOKEN_GATED.',
    },
  ]);

  const handleFencingStep1AcquireClient1 = () => {
    const newToken = 33;
    setFencingLockManager({
      currentHolder: 'client-1',
      currentToken: newToken,
      leaseSeconds: 10,
      isExpired: false,
    });
    setFencingClient1((prev) => ({
      ...prev,
      heldToken: newToken,
      status: 'ACQUIRED_LOCK',
      leaseSecondsRemaining: 10,
      statusMessage: 'Acquired lock lease! Granted fencing token = 33. Pre-computation starting.',
    }));
    setFencingStep(1);
    setFencingAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'LOCK_GRANTED',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
        message: 'Lock Manager granted lease (10s) to Client 1 with Monotonic Fencing Token = 33.',
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleFencingStep2InjectGCPause = () => {
    // Client 1 freezes in GC pause; time passes (10s); lock manager expires lease
    setFencingLockManager((prev) => ({
      ...prev,
      currentHolder: null,
      isExpired: true,
      leaseSeconds: 0,
    }));
    setFencingClient1((prev) => ({
      ...prev,
      status: 'STW_PAUSED',
      leaseSecondsRemaining: 0,
      statusMessage: 'FROZEN: Stop-the-World GC pause (15s). Thread suspended; lease expired on coordinator without client knowledge!',
    }));
    setFencingStep(2);
    setFencingAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'STW_GC_PAUSE',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300',
        message: 'SIMULATION: Injected 15s Stop-the-World GC pause on Client 1! Lease expired at t=10s on Coordinator.',
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleFencingStep3AcquireClient2 = () => {
    const newToken = 34;
    setFencingLockManager({
      currentHolder: 'client-2',
      currentToken: newToken,
      leaseSeconds: 10,
      isExpired: false,
    });
    setFencingClient2((prev) => ({
      ...prev,
      heldToken: newToken,
      status: 'WRITE_COMMITTED',
      leaseSecondsRemaining: 8,
      statusMessage: 'Acquired lock (token=34) and immediately committed REVOKED write to storage engine!',
    }));
    // Storage accepts Client 2 write
    setFencingStorage({
      currentData: '{"invoiceId": 901, "status": "REVOKED", "amount": 0}',
      maxCommittedToken: newToken,
      committedBy: 'Client 2 (Dispute Revocation Worker)',
      isCorrupted: false,
      integrityMessage: 'Storage updated by Client 2 (token=34). High-watermark advanced to 34.',
    });
    setFencingStep(3);
    setFencingAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'WRITE_COMMITTED',
        badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/50 dark:text-sky-300',
        message: 'Client 2 acquired lock with Token 34 and successfully committed REVOKED payload to storage (watermark=34).',
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleFencingStep4AwakenClient1 = () => {
    const client1Token = fencingClient1.heldToken || 33;
    const client1Payload = fencingClient1.dataPayload;

    if (fencingStorageMode === 'UNFENCED_NAIVE') {
      // NAIVE MODE: Storage blindly accepts stale write!
      setFencingStorage({
        currentData: client1Payload,
        maxCommittedToken: fencingStorage.maxCommittedToken, // naive storage does not track tokens
        committedBy: 'Client 1 (STALE LEASE OVERWRITE)',
        isCorrupted: true,
        integrityMessage: 'CRITICAL CORRUPTION: Split-Brain Lost Update! Client 1 overwrote Client 2 valid data using an expired lease!',
      });
      setFencingClient1((prev) => ({
        ...prev,
        status: 'WRITE_COMMITTED',
        statusMessage: 'Client 1 awoke and committed stale write without error! (CORRUPTED STORAGE)',
      }));
      setFencingAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          badge: 'SPLIT_BRAIN_CORRUPTED',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 animate-pulse',
          message: 'CRITICAL CORRUPTION: Naive storage accepted stale write from Client 1! Client 2 dispute revocation was overwritten!',
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      // FENCING TOKEN GATED MODE: Storage rejects stale write!
      setFencingClient1((prev) => ({
        ...prev,
        status: 'WRITE_REJECTED',
        statusMessage: `WRITE REJECTED: HTTP 409 Stale Fencing Token ${client1Token} < ${fencingStorage.maxCommittedToken}! Storage safe.`,
      }));
      setFencingStorage((prev) => ({
        ...prev,
        isCorrupted: false,
        integrityMessage: `STORAGE SECURE: Rejected write from Client 1. Stale token ${client1Token} < current watermark ${prev.maxCommittedToken}.`,
      }));
      setFencingAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          badge: 'FENCING_REJECTED',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
          message: `FENCING INTEGRITY ENFORCED: Storage rejected Client 1 write! Stale token ${client1Token} < high-watermark ${fencingStorage.maxCommittedToken}.`,
        },
        ...prev.slice(0, 9),
      ]);
    }
    setFencingStep(4);
  };

  const handleFencingReset = () => {
    setFencingStep(0);
    setFencingLockManager({
      currentHolder: null,
      currentToken: 32,
      leaseSeconds: 10,
      isExpired: false,
    });
    setFencingClient1({
      id: 'client-1',
      name: 'Client 1 (Batch Invoice Settler)',
      heldToken: null,
      status: 'IDLE',
      leaseSecondsRemaining: 0,
      dataPayload: '{"invoiceId": 901, "status": "SETTLED", "amount": 1500}',
      statusMessage: 'Process idle. Awaiting lock acquisition to settle invoice.',
    });
    setFencingClient2({
      id: 'client-2',
      name: 'Client 2 (Dispute Revocation Worker)',
      heldToken: null,
      status: 'IDLE',
      leaseSecondsRemaining: 0,
      dataPayload: '{"invoiceId": 901, "status": "REVOKED", "amount": 0}',
      statusMessage: 'Process idle. Awaiting lock acquisition to revoke disputed invoice.',
    });
    setFencingStorage({
      currentData: '{"invoiceId": 901, "status": "PENDING", "amount": 1500}',
      maxCommittedToken: 32,
      committedBy: 'Initial Seed State',
      isCorrupted: false,
      integrityMessage: 'Storage engine consistent. Monotonic token watermark = 32.',
    });
    setFencingAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
        message: 'Cluster and storage state reset to initial baseline (token watermark 32).',
      },
      ...prev.slice(0, 9),
    ]);
  };


  // --- Module 8: Paxos & Multi-Paxos Consensus State ---
  const [paxosMode, setPaxosMode] = useState<PaxosProtocolMode>('CLASSIC_PAXOS');
  const [paxosLivelockAlert, setPaxosLivelockAlert] = useState<string | null>(null);

  const initialProposers: Record<'P1' | 'P2', PaxosProposer> = {
    P1: {
      id: 'P1',
      name: 'Proposer 1 (Leader Candidate A)',
      proposalNum: 10,
      proposedValue: 'SET account:101 = $500',
      phase: 'IDLE',
      promisesReceived: [],
      acceptedReceived: [],
      statusMessage: 'Proposer idle. Proposal tuple: (10, P1). Ready to propose value.',
    },
    P2: {
      id: 'P2',
      name: 'Proposer 2 (Rival Proposer B)',
      proposalNum: 20,
      proposedValue: 'SET account:101 = $750',
      phase: 'IDLE',
      promisesReceived: [],
      acceptedReceived: [],
      statusMessage: 'Proposer idle. Proposal tuple: (20, P2). Ready to propose value.',
    },
  };

  const initialAcceptors: PaxosAcceptor[] = [
    { id: 'A1', name: 'Acceptor 1', minProposal: 0, acceptedProposal: null, acceptedValue: null, stateBadge: 'READY' },
    { id: 'A2', name: 'Acceptor 2', minProposal: 0, acceptedProposal: null, acceptedValue: null, stateBadge: 'READY' },
    { id: 'A3', name: 'Acceptor 3', minProposal: 0, acceptedProposal: null, acceptedValue: null, stateBadge: 'READY' },
  ];

  const initialPaxosLog: PaxosLogEntry[] = [
    { slot: 1, proposalNum: 5, value: 'INIT config_epoch = 1', committed: true, leader: 'P1' },
  ];

  const [paxosProposers, setPaxosProposers] = useState<Record<'P1' | 'P2', PaxosProposer>>(initialProposers);
  const [paxosAcceptors, setPaxosAcceptors] = useState<PaxosAcceptor[]>(initialAcceptors);
  const [paxosLog, setPaxosLog] = useState<PaxosLogEntry[]>(initialPaxosLog);
  const [paxosAuditLog, setPaxosAuditLog] = useState<PaxosAuditEvent[]>([
    {
      id: 1,
      time: '00:00:00',
      protocol: 'CLASSIC_PAXOS',
      badge: 'CLUSTER_INIT',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
      message: 'Paxos Cluster initialized: 2 Proposers (P1, P2) and 3 Acceptors (A1, A2, A3). Majority quorum Q = 2.',
    },
  ]);

  const handleClassicPaxosRunCleanWrite = () => {
    setPaxosLivelockAlert(null);
    const n = 10;
    const val = 'SET account:101 = $500';

    // Phase 1: Prepare(10) -> Promise from majority (A1, A2, A3)
    // Phase 2: Accept(10, val) -> Accepted from majority -> COMMITTED
    setPaxosAcceptors((prev) =>
      prev.map((a) => ({
        ...a,
        minProposal: n,
        acceptedProposal: n,
        acceptedValue: val,
        stateBadge: 'ACCEPTED',
      }))
    );

    setPaxosProposers((prev) => ({
      ...prev,
      P1: {
        ...prev.P1,
        phase: 'COMMITTED',
        promisesReceived: ['A1', 'A2', 'A3'],
        acceptedReceived: ['A1', 'A2', 'A3'],
        statusMessage: 'COMMITTED in 2 RTTs! Phase 1: Received 3/3 Promises for n=10. Phase 2: Received 3/3 Accepted for "SET account:101 = $500".',
      },
    }));

    setPaxosLog((prev) => [
      ...prev,
      { slot: prev.length + 1, proposalNum: n, value: val, committed: true, leader: 'P1' },
    ]);

    setPaxosAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        protocol: 'CLASSIC_PAXOS',
        badge: 'PAXOS_2RTT_COMMIT',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
        message: 'Classic Paxos 2-RTT write succeeded: Phase 1 (Prepare/Promise, 1 RTT) + Phase 2 (Accept/Accepted, 1 RTT). Total latency = 2 RTTs.',
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleClassicPaxosTriggerLivelock = () => {
    // Dueling Proposers Livelock:
    // 1. P1 prepares n=10, Acceptors promise n=10
    // 2. P2 preempts with prepare n=20, Acceptors promise n=20 (minProposal becomes 20)
    // 3. P1 tries to Accept(n=10), rejected because 10 < 20!
    // 4. P1 preempts with prepare n=30, Acceptors promise n=30 (minProposal becomes 30)
    // 5. P2 tries to Accept(n=20), rejected because 20 < 30!
    // Zero values committed!
    setPaxosAcceptors((prev) =>
      prev.map((a) => ({
        ...a,
        minProposal: 30, // Overwritten by P1's counter-proposal
        acceptedProposal: null,
        acceptedValue: null,
        stateBadge: 'PROMISED',
      }))
    );

    setPaxosProposers({
      P1: {
        id: 'P1',
        name: 'Proposer 1',
        proposalNum: 30,
        proposedValue: 'SET account:101 = $500',
        phase: 'REJECTED_LIVELOCK',
        promisesReceived: ['A1', 'A2'],
        acceptedReceived: [],
        statusMessage: 'LIVELOCK: P1 Accept(10) rejected (10 < minProposal 20). Counter-prepared n=30, but P2 will preempt again!',
      },
      P2: {
        id: 'P2',
        name: 'Proposer 2',
        proposalNum: 20,
        proposedValue: 'SET account:101 = $750',
        phase: 'REJECTED_LIVELOCK',
        promisesReceived: ['A2', 'A3'],
        acceptedReceived: [],
        statusMessage: 'LIVELOCK: P2 Accept(20) rejected (20 < minProposal 30). Preempted by P1. Zero progress possible!',
      },
    });

    setPaxosLivelockAlert(
      'CRITICAL DUELING PROPOSER LIVELOCK DETECTED: P1 and P2 continually preempt each other with higher proposal numbers before Phase 2 can complete. Classic Paxos guarantees safety but not liveness in the presence of uncoordinated dueling proposers!'
    );

    setPaxosAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        protocol: 'CLASSIC_PAXOS',
        badge: 'DUELING_LIVELOCK',
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300',
        message: 'LIVELOCK COLLAPSE: P1 (n=10) &rarr; P2 preempts (n=20) &rarr; P1 Accept rejected &rarr; P1 counter-preempts (n=30) &rarr; P2 Accept rejected. 0 values committed!',
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleMultiPaxosStreamWrite = () => {
    setPaxosLivelockAlert(null);
    // In Multi-Paxos, Phase 1 was executed once during leader election for P1.
    // Subsequent writes execute purely in Phase 2 in 1 RTT!
    const nextSlot = paxosLog.length + 1;
    const val = 'SET invoice:882 = PAID (Tx #' + nextSlot + ')';

    setPaxosAcceptors((prev) =>
      prev.map((a) => ({
        ...a,
        minProposal: 50,
        acceptedProposal: 50,
        acceptedValue: val,
        stateBadge: 'ACCEPTED',
      }))
    );

    setPaxosProposers((prev) => ({
      ...prev,
      P1: {
        ...prev.P1,
        proposalNum: 50,
        phase: 'COMMITTED',
        promisesReceived: ['A1', 'A2', 'A3'],
        acceptedReceived: ['A1', 'A2', 'A3'],
        statusMessage: 'MULTI-PAXOS 1-RTT STREAM: Stable Leader P1 skipped Phase 1 entirely! Broadcasted Accept(slot ' + nextSlot + ', val) directly. Quorum committed in 1 RTT.',
      },
      P2: {
        ...prev.P2,
        phase: 'IDLE',
        statusMessage: 'Follower / Standby Proposer. Leader lease active on P1; P2 does not contend.',
      },
    }));

    setPaxosLog((prev) => [
      ...prev,
      { slot: nextSlot, proposalNum: 50, value: val, committed: true, leader: 'P1' },
    ]);

    setPaxosAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        protocol: 'MULTI_PAXOS',
        badge: 'MULTI_PAXOS_1RTT',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
        message: 'Multi-Paxos Fast Path: Skipped Phase 1! Streamed write directly into slot ' + nextSlot + ' via Phase 2 in 1 RTT. Zero livelock contention.',
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handlePaxosReset = () => {
    setPaxosLivelockAlert(null);
    setPaxosProposers(initialProposers);
    setPaxosAcceptors(initialAcceptors);
    setPaxosLog(initialPaxosLog);
    setPaxosAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        protocol: paxosMode,
        badge: 'RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
        message: 'Paxos cluster state, acceptor promises, and proposers reset to baseline.',
      },
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden space-y-6">
      {/* Sub-Header Tabs */}
      <div className="bg-surface-hover/50 border-b border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
              Distributed Systems Studio
            </span>
            <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
              High-Level System Design
            </span>
          </div>
          <h2 className="text-lg font-bold text-text mt-0.5">
            Consistent Hashing, Rate Limiting &amp; Circuit Breakers
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-canvas p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('CONSISTENT_HASHING')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'CONSISTENT_HASHING'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Consistent Hash Ring
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RATE_LIMITER')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'RATE_LIMITER'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Traffic Rate Limiters
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CIRCUIT_BREAKER')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'CIRCUIT_BREAKER'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Circuit Breaker State Machine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RAFT_CONSENSUS')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'RAFT_CONSENSUS'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Raft Consensus &amp; Quorum
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('VECTOR_CLOCKS')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'VECTOR_CLOCKS'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Vector Clocks &amp; Causality
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TWO_PHASE_COMMIT_SAGA')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'TWO_PHASE_COMMIT_SAGA'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            2PC vs Saga Coordinator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FENCING_TOKENS_JEPSEN')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'FENCING_TOKENS_JEPSEN'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Lock Fencing &amp; Split-Brain
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PAXOS_CONSENSUS')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'PAXOS_CONSENSUS'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Paxos &amp; Multi-Paxos
          </button>
        </div>
      </div>

      {/* MODULE 1: CONSISTENT HASH RING, MULTI-REPLICA QUORUMS & LOAD HISTOGRAM */}
      {activeTab === 'CONSISTENT_HASHING' && (
        <div className="p-6 space-y-6">
          {/* Controls & Quorum Configuration Banner */}
          <div className="space-y-4 bg-canvas border border-border p-4 rounded-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Topology &amp; Partitioning Controls:
                </span>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    variant={includeNodeD ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setIncludeNodeD(!includeNodeD)}
                  >
                    {includeNodeD ? '✓ Node D Active (Scale Out)' : '+ Scale Out: Add Node D'}
                  </Button>

                  <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs">
                    <span className="text-text-muted px-1.5 font-medium">Virtual Nodes:</span>
                    {([1, 2, 3] as const).map((mul) => (
                      <button
                        key={mul}
                        type="button"
                        onClick={() => setVnodesMultiplier(mul)}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          vnodesMultiplier === mul
                            ? 'bg-primary-700 text-white shadow-xs'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        {mul}x
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs">
                    <span className="text-text-muted px-1.5 font-medium">Replicas (N):</span>
                    {([1, 2, 3] as const).map((nVal) => (
                      <button
                        key={nVal}
                        type="button"
                        onClick={() => setReplicationFactor(nVal)}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          replicationFactor === nVal
                            ? 'bg-primary-700 text-white shadow-xs'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        N={nVal}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs">
                    <span className="text-text-muted px-1.5 font-medium">Write Quorum (W):</span>
                    {([1, 2, 3] as const).map((wVal) => (
                      <button
                        key={wVal}
                        type="button"
                        onClick={() => setWriteQuorum(wVal)}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          writeQuorum === wVal
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        W={wVal}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs">
                    <span className="text-text-muted px-1.5 font-medium">Read Quorum (R):</span>
                    {([1, 2, 3] as const).map((rVal) => (
                      <button
                        key={rVal}
                        type="button"
                        onClick={() => setReadQuorum(rVal)}
                        className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                          readQuorum === rVal
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-text-muted hover:text-text'
                        }`}
                      >
                        R={rVal}
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-lg border border-border text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableSloppyQuorum}
                      onChange={(e) => setEnableSloppyQuorum(e.target.checked)}
                      className="rounded border-border text-primary-600 focus:ring-0"
                    />
                    <span className="font-semibold text-text">Sloppy Quorum &amp; Hinted Handoff</span>
                  </label>

                  <Button variant="secondary" size="sm" onClick={handleResetHashCluster}>
                    Reset Cluster
                  </Button>
                </div>
              </div>

              <div className="text-right sm:max-w-xs text-xs text-text-muted">
                <span className="font-semibold text-text block">Circular Hash Space: 0° → 360°</span>
                Keys route clockwise to N distinct physical node preference replicas.
              </div>
            </div>

            {/* Consistency Invariant Status HUD */}
            <div
              className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                isStrongConsistency
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-[11px] ${
                    isStrongConsistency ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {isStrongConsistency ? 'STRONG_CONSISTENCY' : 'EVENTUAL_CONSISTENCY'}
                </span>
                <span className="font-semibold">
                  {isStrongConsistency
                    ? `W (${writeQuorum}) + R (${readQuorum}) = ${writeQuorum + readQuorum} > N (${replicationFactor})`
                    : `W (${writeQuorum}) + R (${readQuorum}) = ${writeQuorum + readQuorum} ≤ N (${replicationFactor})`}
                </span>
              </div>
              <div className="text-xs">
                {isStrongConsistency ? (
                  <span>
                    ✓ <strong>Pigeonhole Principle Guaranteed:</strong> Write set and Read set overlap by at least{' '}
                    <strong>{quorumMargin}</strong> replica(s). Eliminates stale reads!
                  </span>
                ) : (
                  <span>
                    ⚠️ <strong>Disjoint Quorums:</strong> Write set and Read set can be disjoint! Stale reads are possible until anti-entropy sync.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Node Health & Partition Toolbar */}
          <div className="bg-canvas border border-border p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text uppercase tracking-wider text-[11px]">
                Physical Node Health (Click to Partition):
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {activeNodes.map((n) => {
                  const isOff = !!offlineNodes[n.id];
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleToggleNodeOnline(n.id)}
                      className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isOff
                          ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                          : 'bg-surface text-text border-border hover:bg-surface-hover'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: isOff ? '#f43f5e' : n.color }}
                      />
                      <span>{n.name}</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${isOff ? 'bg-rose-200 text-rose-900 font-bold' : 'text-emerald-700 font-bold'}`}>
                        {isOff ? 'OFFLINE 🔴' : 'ONLINE 🟢'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="text-text-muted text-[11px]">
              Simulate network partitions or hardware failures to test Quorum tolerance.
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual SVG Hash Ring */}
            <div className="lg:col-span-6 bg-canvas border border-border rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-full max-w-[380px] aspect-square relative">
                <svg viewBox="0 0 400 400" className="w-full h-full select-none">
                  {/* Outer Ring */}
                  <circle
                    cx="200"
                    cy="200"
                    r="140"
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="8"
                    strokeDasharray="4 6"
                    className="dark:stroke-zinc-800"
                  />

                  {/* Ring Degree Markers */}
                  {[0, 90, 180, 270].map((deg) => {
                    const rad = ((deg - 90) * Math.PI) / 180;
                    const tx = 200 + 165 * Math.cos(rad);
                    const ty = 200 + 165 * Math.sin(rad);
                    return (
                      <text
                        key={deg}
                        x={tx}
                        y={ty + 4}
                        fontSize="10"
                        fill="#94a3b8"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {deg}°
                      </text>
                    );
                  })}

                  {/* Node Tokens on Ring */}
                  {ringPoints.map((pt) => {
                    const rad = ((pt.angle - 90) * Math.PI) / 180;
                    const cx = 200 + 140 * Math.cos(rad);
                    const cy = 200 + 140 * Math.sin(rad);
                    const isOff = !!offlineNodes[pt.nodeId];

                    return (
                      <g key={pt.id} className="cursor-pointer group">
                        <circle
                          cx={cx}
                          cy={cy}
                          r={pt.isVirtual ? '8' : '14'}
                          fill={isOff ? '#94a3b8' : pt.color}
                          stroke="#ffffff"
                          strokeWidth="2"
                          opacity={isOff ? 0.5 : 1}
                          className="transition-all duration-200 shadow-sm"
                        />
                        {isOff && (
                          <text
                            x={cx}
                            y={cy + 3}
                            fontSize="9"
                            fill="#ffffff"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            ✕
                          </text>
                        )}
                        {!pt.isVirtual && !isOff && (
                          <text
                            x={cx}
                            y={cy + 3.5}
                            fontSize="8"
                            fill="#ffffff"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {pt.name.slice(5, 6)}
                          </text>
                        )}
                        <text
                          x={cx}
                          y={cy + (pt.isVirtual ? 16 : 24)}
                          fontSize="9"
                          fill={isOff ? '#f43f5e' : '#64748b'}
                          textAnchor="middle"
                          fontWeight={pt.isVirtual ? 'normal' : 'bold'}
                          className="font-mono"
                        >
                          {pt.name} ({pt.angle}°)
                        </text>
                      </g>
                    );
                  })}

                  {/* Selected Key Vectors to Preference List */}
                  {activePrefList.map((pref, idx) => {
                    const krad = ((activeSelectedKey.angle - 90) * Math.PI) / 180;
                    const kx = 200 + 90 * Math.cos(krad);
                    const ky = 200 + 90 * Math.sin(krad);

                    const nrad = ((pref.token.angle - 90) * Math.PI) / 180;
                    const nx = 200 + 140 * Math.cos(nrad);
                    const ny = 200 + 140 * Math.sin(nrad);

                    return (
                      <g key={pref.token.id}>
                        <line
                          x1={kx}
                          y1={ky}
                          x2={nx}
                          y2={ny}
                          stroke={pref.isOnline ? pref.physicalNode.color : '#f43f5e'}
                          strokeWidth={idx === 0 ? '2' : '1.5'}
                          strokeDasharray={idx === 0 ? undefined : '3 3'}
                          opacity={pref.isOnline ? (idx === 0 ? 0.9 : 0.6) : 0.4}
                        />
                      </g>
                    );
                  })}

                  {/* Selected Key Marker */}
                  {(() => {
                    const rad = ((activeSelectedKey.angle - 90) * Math.PI) / 180;
                    const kx = 200 + 90 * Math.cos(rad);
                    const ky = 200 + 90 * Math.sin(rad);
                    return (
                      <g key="selected-key">
                        <circle
                          cx={kx}
                          cy={ky}
                          r="6"
                          fill="#475569"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={kx}
                          y={ky - 10}
                          fontSize="10"
                          fill="#0f172a"
                          className="dark:fill-white font-mono font-bold"
                          textAnchor="middle"
                        >
                          {activeSelectedKey.label}
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Topology Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
                {activeNodes.map((n) => {
                  const isOff = !!offlineNodes[n.id];
                  return (
                    <span
                      key={n.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        isOff ? 'bg-rose-50 text-rose-800 border-rose-300 opacity-60' : n.badgeBg
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: isOff ? '#f43f5e' : n.color }}
                      />
                      {n.name} ({n.baseAngle}°) {isOff && '(OFFLINE)'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Partition Histogram & Quorum Simulation Console */}
            <div className="lg:col-span-6 space-y-4">
              {/* Partition Arc & Load Distribution Histogram */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-text">
                      Partition Arc &amp; Load Distribution Histogram
                    </h3>
                    <p className="text-[11px] text-text-muted">
                      Proves how Virtual Nodes eliminate partition imbalance and hot spots.
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                        coeffVariation < 15
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : coeffVariation < 30
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}
                    >
                      CV = {coeffVariation.toFixed(1)}% ({coeffVariation < 15 ? 'Near-Uniform' : coeffVariation < 30 ? 'Moderate Skew' : 'High Skew'})
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {partitionStats.map((stat) => (
                    <div key={stat.nodeId} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-semibold text-text flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-sm inline-block"
                            style={{ backgroundColor: stat.color }}
                          />
                          {stat.name}
                          {!stat.isOnline && <span className="text-[10px] text-rose-600 font-bold">(OFFLINE)</span>}
                        </span>
                        <span className="text-text-muted">
                          {stat.arcDegrees}° ({stat.percentShare}%) — {stat.assignedKeyCount} keys
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden flex relative">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (stat.percentShare / (idealShare * 1.5)) * 100)}%`,
                            backgroundColor: stat.color,
                            opacity: stat.isOnline ? 1 : 0.4,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="text-[11px] text-text-muted flex justify-between pt-1 border-t border-border">
                    <span>Ideal Parity Baseline: <strong>{idealShare.toFixed(1)}%</strong> per node</span>
                    <span>Std Dev: <strong>σ = {stdDev.toFixed(1)}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Dynamic Preference List & Quorum Simulation Console */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-text">
                      Key Preference List &amp; Quorum Simulator
                    </h3>
                    <span className="text-[11px] text-text-muted font-mono">
                      Select Key to inspect Distinct-Physical-Node placement
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {CACHE_KEYS.slice(0, 4).map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => setSelectedKeyId(k.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                          selectedKeyId === k.id
                            ? 'bg-primary-700 text-white shadow-xs'
                            : 'bg-canvas text-text-muted border border-border hover:text-text'
                        }`}
                      >
                        {k.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preference List Breakdown */}
                <div className="space-y-1.5 bg-canvas p-3 rounded-lg border border-border text-xs">
                  <div className="flex items-center justify-between font-mono pb-1 border-b border-border text-[11px]">
                    <span className="font-bold text-text">Target: {activeSelectedKey.label} ({activeSelectedKey.angle}°)</span>
                    <span className="text-text-muted">Clockwise Walk: N={replicationFactor} Replicas</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {activePrefList.map((pref, idx) => (
                      <div
                        key={pref.token.id}
                        className={`p-2 rounded border text-center space-y-1 ${
                          pref.isOnline
                            ? 'bg-surface border-border'
                            : 'bg-rose-50 border-rose-300 dark:bg-rose-950/20 text-rose-900'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-text-muted block">
                          {idx === 0 ? 'Primary (Coord)' : `Replica #${idx}`}
                        </span>
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold text-white"
                          style={{ backgroundColor: pref.physicalNode.color }}
                        >
                          {pref.physicalNode.name}
                        </span>
                        <div className="text-[10px] font-mono">
                          {pref.isOnline ? (
                            <span className="text-emerald-700 font-bold">ONLINE ✓</span>
                          ) : (
                            <span className="text-rose-600 font-bold">OFFLINE ✕</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Simulation Trigger Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSimulateQuorumWrite}
                    className="flex-1"
                  >
                    Simulate Quorum Write (W={writeQuorum})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSimulateQuorumRead}
                    className="flex-1"
                  >
                    Simulate Quorum Read (R={readQuorum})
                  </Button>
                </div>

                {/* Live Audit Log */}
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {hashAuditLog.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-2 rounded bg-canvas border border-border text-[11px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] border ${ev.badgeClass}`}>
                          {ev.badge}
                        </span>
                        <span className="text-text-muted font-mono text-[10px]">{ev.time}</span>
                      </div>
                      <p className="text-text leading-tight">{ev.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key Ownership & Relocation Table (Preserved for compatibility) */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="font-bold text-sm text-text">
                Key Ownership &amp; Relocation Table
              </h3>
              <span className="text-[11px] text-text-muted font-mono">8 Sample Keys</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
              {keyAssignments.map((k) => (
                <div
                  key={k.id}
                  onClick={() => setSelectedKeyId(k.id)}
                  className={`p-2.5 rounded-lg border flex flex-col justify-between text-xs cursor-pointer transition-colors ${
                    selectedKeyId === k.id
                      ? 'bg-primary-50 border-primary-300 dark:bg-primary-950/20'
                      : 'bg-canvas border-border hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-text">{k.label}</span>
                    <span className="text-[10px] text-text-muted">({k.angle}°)</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px]">
                    <span className="text-text-muted">Coord:</span>
                    <span
                      className="px-1.5 py-0.5 rounded font-bold text-white shadow-2xs"
                      style={{ backgroundColor: k.assignedNode.color }}
                    >
                      {k.assignedNode.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg text-xs text-primary-900 leading-relaxed dark:bg-primary-950/20 dark:border-primary-800 dark:text-primary-300">
              <strong>Architectural Invariant:</strong> In naive modulo hashing ($hash(k) \pmod N$), adding or removing a node relocates nearly <strong>100%</strong> of cached keys, causing catastrophic cache avalanches. In Consistent Hashing, adding Node D only relocates <strong>$k / N$</strong> keys ($approx 25%$), leaving the remaining <strong>$75%$</strong> of cache entries undisturbed!
            </div>
          </div>

          {/* Socratic Invariant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Consistency Invariant
              </span>
              <h4 className="font-bold text-sm text-text">Pigeonhole Quorum ($R + W &gt; N$)</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                If the read quorum $R$ and write quorum $W$ sum to strictly greater than $N$, the Pigeonhole Principle guarantees that the read set and write set must share at least one replica. That overlapping replica supplies the latest monotonic version timestamp, preventing stale data.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Fault Domain Invariant
              </span>
              <h4 className="font-bold text-sm text-text">Distinct Physical Placement</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                When virtual nodes (vnodes) are enabled, multiple tokens belong to the same machine. A naive successor walk could place all $N$ replicas on distinct vnodes of the <em>same</em> physical server. Dynamo engines enforce distinct physical node collection to avoid single-point-of-failure loss.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Availability Invariant
              </span>
              <h4 className="font-bold text-sm text-text">Sloppy Quorum &amp; Hinted Handoff</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                During network partitions, strict quorum rejects writes if $W$ replicas in the preference list are unreachable. A Sloppy Quorum routes the write to a healthy successor node with a metadata hint. When the primary recovers, the hinted handoff replays the write.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Load Balancing Invariant
              </span>
              <h4 className="font-bold text-sm text-text">Variance Reduction (σ ∝ 1/√V)</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                With only 1 token per node, random ring placement yields high partition variance (CV &gt; 40%), creating severe hotspot nodes. Allocating V virtual tokens per node dramatically decreases standard deviation by 1/√V, driving load balance toward uniform parity.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: TRAFFIC RATE LIMITING ENGINES */}
      {activeTab === 'RATE_LIMITER' && (
        <div className="p-6 space-y-6">
          {/* Strategy Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas border border-border p-4 rounded-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Rate Limiter Algorithm:
              </span>
              <p className="text-xs text-text-muted mt-0.5">
                Compare burst-tolerant Token Bucket vs smooth Leaky Bucket vs boundary-accurate Sliding Window.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRateLimiterType('TOKEN_BUCKET')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  rateLimiterType === 'TOKEN_BUCKET'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Token Bucket (Burst Allowed)
              </button>
              <button
                type="button"
                onClick={() => setRateLimiterType('LEAKY_BUCKET')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  rateLimiterType === 'LEAKY_BUCKET'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Leaky Bucket (Smooth Egress)
              </button>
              <button
                type="button"
                onClick={() => setRateLimiterType('SLIDING_WINDOW')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  rateLimiterType === 'SLIDING_WINDOW'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Sliding Window Counter
              </button>
            </div>
          </div>

          {/* TYPE A: TOKEN BUCKET */}
          {rateLimiterType === 'TOKEN_BUCKET' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-canvas border border-border rounded-xl p-6 space-y-4 flex flex-col items-center justify-center">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Token Bucket Tank (Capacity: 10 Tokens)
                </div>

                <div className="w-44 h-56 border-4 border-t-0 border-primary-700 rounded-b-2xl p-2 flex flex-col-reverse gap-1.5 bg-surface relative overflow-hidden">
                  {Array.from({ length: tbCapacity }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-3.5 rounded transition-all ${
                        idx < tbTokens
                          ? 'bg-emerald-500 shadow-xs'
                          : 'bg-zinc-200 dark:bg-zinc-800 opacity-40'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span>Available Tokens: <strong className="text-emerald-700 text-sm">{tbTokens} / {tbCapacity}</strong></span>
                  <span>Refill Rate: <strong className="text-primary-700">+2 / sec</strong></span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="primary" size="sm" onClick={() => handleTbRequest(1)}>
                    Send 1 Request
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleTbRequest(5)}>
                    Burst: 5 Requests
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleTbRefill}>
                    +2 Refill Tick
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setTbTokens(tbCapacity)}>
                    Reset
                  </Button>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text">
                    Live Request Response Log
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">Max Burst = Capacity</span>
                </div>

                {tbLog.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-muted italic">
                    Click &apos;Send 1 Request&apos; or &apos;Burst&apos; to trigger incoming API calls.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tbLog.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between font-mono ${
                          item.status === 'ALLOW'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <span>{item.time} — Request Token Acquired</span>
                        <span className="font-bold">
                          {item.status === 'ALLOW'
                            ? 'HTTP 200 OK — Request Processed'
                            : 'HTTP 429 Too Many Requests'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TYPE B: LEAKY BUCKET */}
          {rateLimiterType === 'LEAKY_BUCKET' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-canvas border border-border rounded-xl p-6 space-y-4 flex flex-col items-center justify-center">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  FIFO Buffer Queue (Capacity: 8 Requests)
                </div>

                <div className="w-44 h-56 border-4 border-t-0 border-sky-700 rounded-b-2xl p-2 flex flex-col-reverse gap-1.5 bg-surface relative overflow-hidden">
                  {Array.from({ length: lbCapacity }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-4.5 rounded text-[9px] font-mono font-bold flex items-center justify-center transition-all ${
                        idx < lbQueue.length
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-zinc-200 dark:bg-zinc-800 opacity-30 text-transparent'
                      }`}
                    >
                      REQ #{idx + 1}
                    </div>
                  ))}
                  {/* Leaking spigot animation */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-sky-700" />
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span>Queued: <strong className="text-sky-700 text-sm">{lbQueue.length} / {lbCapacity}</strong></span>
                  <span>Drain Rate: <strong className="text-text">2 req / tick</strong></span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="primary" size="sm" onClick={() => handleLbRequest(1)}>
                    Enqueue 1 Request
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleLbRequest(4)}>
                    Burst: 4 Requests
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleLbLeak}>
                    Process &amp; Leak (-2)
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setLbQueue([])}>
                    Clear Buffer
                  </Button>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text">
                    Buffer Egress &amp; Drop Telemetry
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">Constant Outflow</span>
                </div>

                {lbLog.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-muted italic">
                    Enqueue requests to observe queue smoothing and buffer overflow drops.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lbLog.map((item) => (
                      <div
                        key={item.id}
                        className={`p-2 rounded-lg border text-xs flex items-center justify-between font-mono ${
                          item.status === 'QUEUED'
                            ? 'bg-sky-50 border-sky-200 text-sky-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                        }`}
                      >
                        <span>{item.time}</span>
                        <span className="font-bold">
                          {item.status === 'QUEUED'
                            ? 'Request Queued in Buffer'
                            : 'Buffer Full (HTTP 429 Dropped)'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TYPE C: SLIDING WINDOW COUNTER */}
          {rateLimiterType === 'SLIDING_WINDOW' && (
            <div className="bg-canvas border border-border rounded-xl p-6 space-y-6">
              <div>
                <h3 className="font-bold text-sm text-text">
                  Sliding Window Approximation (Fixed Window Edge Elimination)
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  Prevents 2x burst exploit at minute boundaries by weighting previous window requests with elapsed time.
                </p>
              </div>

              {/* Graphical Sliding Window Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                  <span className="text-xs text-text-muted block">Previous 1-Min Window [t - 60s]</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-text">{swPrevCount}</span>
                    <span className="text-xs text-text-muted">requests recorded</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${(swPrevCount / swLimit) * 100}%` }} className="bg-zinc-400 h-full" />
                  </div>
                  <span className="text-[11px] font-mono text-text-muted">
                    Overlap Weight: ({swWindowSeconds} - {swElapsedSeconds}) / {swWindowSeconds} = {(swWeight).toFixed(2)}
                  </span>
                </div>

                <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
                  <span className="text-xs text-text-muted block">Current 1-Min Window [t]</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary-700">{swCurrentCount}</span>
                    <span className="text-xs text-text-muted">requests so far</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${(swCurrentCount / swLimit) * 100}%` }} className="bg-primary-600 h-full" />
                  </div>
                  <span className="text-[11px] font-mono text-text-muted">
                    Elapsed Seconds: {swElapsedSeconds}s / 60s
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-text block">
                    Formula Execution:
                  </span>
                  <code className="text-xs font-mono text-primary-800 dark:text-primary-300 block mt-1">
                    Estimated = Current ({swCurrentCount}) + Prev ({swPrevCount}) × {swWeight.toFixed(2)} = {swEstimatedCount} / {swLimit}
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={handleSwRequest}>
                    Send Request
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSwElapsedSeconds((prev) => (prev + 15) % 60)}
                  >
                    +15s Clock Advance
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 3: CIRCUIT BREAKER STATE MACHINE */}
      {activeTab === 'CIRCUIT_BREAKER' && (
        <div className="p-6 space-y-6">
          {/* State Indicator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-xl border transition-all ${
                cbState === 'CLOSED'
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
                  : 'bg-canvas border-border opacity-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase mb-1 text-emerald-900">
                <span>1. CLOSED</span>
                {cbState === 'CLOSED' && <span className="animate-pulse">● ACTIVE</span>}
              </div>
              <p className="text-xs text-text-muted">
                Normal operations. Requests forwarded to upstream. Error rate monitored continuously.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all ${
                cbState === 'OPEN'
                  ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300'
                  : 'bg-canvas border-border opacity-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase mb-1 text-rose-900">
                <span>2. OPEN</span>
                {cbState === 'OPEN' && <span className="animate-pulse">● FAULT ISOLATION</span>}
              </div>
              <p className="text-xs text-text-muted">
                Circuit tripped! All requests short-circuited with fast-fail response. Cooldown active.
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border transition-all ${
                cbState === 'HALF_OPEN'
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                  : 'bg-canvas border-border opacity-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold uppercase mb-1 text-amber-900">
                <span>3. HALF-OPEN</span>
                {cbState === 'HALF_OPEN' && <span className="animate-pulse">● PROBE TRIAL</span>}
              </div>
              <p className="text-xs text-text-muted">
                Trial canary mode. Small subset of requests sent to test if upstream has recovered.
              </p>
            </div>
          </div>

          {/* Breaker Metrics & Gauge */}
          <div className="bg-canvas border border-border rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Failure Window &amp; Thresholds:
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-3xl font-black text-text">{cbFailureRate}%</span>
                  <span className="text-xs text-text-muted">
                    Failure Rate (Trip Threshold: ≥ 50% over last 4 requests)
                  </span>
                </div>
              </div>

              <div className="text-right">
                {cbState === 'OPEN' && (
                  <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                    Cooldown Remaining: {cbCooldown} tick(s)
                  </span>
                )}
                {cbState === 'HALF_OPEN' && (
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                    Probe Successes: {cbProbeSuccesses} / 2 required
                  </span>
                )}
              </div>
            </div>

            {/* Rolling Request History Strip */}
            <div className="flex items-center gap-1.5 pt-2">
              <span className="text-[11px] font-mono text-text-muted mr-2">Last Requests:</span>
              {cbHistory.map((res, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                    res === 'SUCCESS'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {res === 'SUCCESS' ? '✓' : '✗'}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCbSuccess}
              disabled={cbState === 'OPEN'}
            >
              Send Success Response (200 OK)
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleCbFailure}
              disabled={cbState === 'OPEN'}
            >
              Simulate Upstream Error (500 / Timeout)
            </Button>

            {cbState === 'OPEN' && (
              <Button variant="secondary" size="sm" onClick={handleCbTick}>
                Advance Cooldown Clock (-1 Tick)
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCbState('CLOSED');
                setCbHistory(['SUCCESS', 'SUCCESS', 'SUCCESS', 'SUCCESS']);
                setCbCooldown(5);
                setCbProbeSuccesses(0);
              }}
            >
              Reset Circuit
            </Button>
          </div>
        </div>
      )}

      {/* MODULE 4: RAFT CONSENSUS & LOG REPLICATION STUDIO */}
      {activeTab === 'RAFT_CONSENSUS' && (
        <div className="p-6 space-y-6">
          {/* Header Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-canvas border border-border">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Current Term
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-text">Term {raftTerm}</span>
                <span className="text-xs text-primary-700 font-bold font-mono">
                  {isPartitioned ? 'Split: T1 / T2' : 'Synchronized'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-border">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Active Leader
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">
                  {activeLeader ? activeLeader.name : 'None (Electing)'}
                </span>
                {activeLeader && <span className="text-xs font-bold text-amber-500">👑</span>}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-border">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Quorum Requirement
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-black text-indigo-700">Q = 3 / 5</span>
                <span className="text-xs text-text-muted font-mono">⌊N/2⌋ + 1</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-border">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                Cluster Topology
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    isPartitioned
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  {isPartitioned ? '⚡ PARTITIONED (A / B)' : '✓ FULL MESH HEALTHY'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Cluster Actions Console */}
          <div className="bg-canvas border border-border rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-text">
                  Raft Consensus &amp; Log Replication Controls
                </h3>
                <p className="text-xs text-text-muted">
                  Simulate client state machine writes, leader crashes, and split-brain network partitions.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleResetRaft}>
                Reset Cluster State
              </Button>
            </div>

            {/* Write Proposal Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={customCommand}
                onChange={(e) => setCustomCommand(e.target.value)}
                placeholder="e.g. SET max_connections=500"
                className="flex-1 text-xs font-mono bg-surface border border-border rounded-lg px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleProposeCommand()}
              >
                Propose Client Write
              </Button>
            </div>

            {/* Simulation Triggers Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleProposeCommand('SET worker_pool=16')}
              >
                + Propose worker_pool=16
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleProposeCommand('SET db_replica_count=4')}
              >
                + Propose db_replica_count=4
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSimulateLeaderCrash}
              >
                ⚡ Simulate Leader Crash &amp; Election
              </Button>
              {!isPartitioned ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSimulatePartition}
                >
                  ✂ Simulate Network Partition (Split-Brain)
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleHealPartition}
                >
                  🔗 Heal Partition &amp; Reconcile Logs
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SVG Cluster Topology Canvas */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <div className="w-full max-w-[500px] aspect-[5/3] relative">
                <svg viewBox="0 0 540 320" className="w-full h-full select-none">
                  <defs>
                    <linearGradient id="groupAGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
                    </linearGradient>
                    <linearGradient id="groupBGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>

                  {/* Partition Visual Overlays */}
                  {isPartitioned && (
                    <>
                      {/* Group A Minority Shading (Left/Top) */}
                      <path
                        d="M 270 20 L 520 20 L 520 180 L 270 180 Z"
                        fill="url(#groupAGrad)"
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                      />
                      <text
                        x="480"
                        y="40"
                        fill="#f87171"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        Group A (Minority: 2/5 — No Quorum)
                      </text>

                      {/* Group B Majority Shading (Right/Bottom) */}
                      <path
                        d="M 20 140 L 520 140 L 520 300 L 20 300 Z"
                        fill="url(#groupBGrad)"
                        stroke="#10b981"
                        strokeDasharray="4 4"
                        strokeWidth="1.5"
                      />
                      <text
                        x="40"
                        y="285"
                        fill="#34d399"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        Group B (Majority: 3/5 — Quorum Active)
                      </text>

                      {/* Severed Network Divider */}
                      <line
                        x1="20"
                        y1="160"
                        x2="520"
                        y2="160"
                        stroke="#ef4444"
                        strokeWidth="2.5"
                        strokeDasharray="6 6"
                      />
                    </>
                  )}

                  {/* Inter-node Communication Channels */}
                  {raftNodes.map((node, i) => {
                    const nextNode = raftNodes[(i + 1) % raftNodes.length];
                    const isSevered =
                      isPartitioned &&
                      ((node.partitionGroup === 'A' && nextNode.partitionGroup === 'B') ||
                        (node.partitionGroup === 'B' && nextNode.partitionGroup === 'A'));

                    return (
                      <line
                        key={`link-${node.id}-${nextNode.id}`}
                        x1={node.x}
                        y1={node.y}
                        x2={nextNode.x}
                        y2={nextNode.y}
                        stroke={isSevered ? '#ef4444' : '#334155'}
                        strokeWidth={isSevered ? '1.5' : '2'}
                        strokeDasharray={isSevered ? '4 4' : 'none'}
                        opacity={isSevered ? 0.6 : 0.8}
                      />
                    );
                  })}

                  {/* Nodes */}
                  {raftNodes.map((node) => {
                    const isLeader = node.role === 'LEADER';
                    const isOffline = node.role === 'OFFLINE';

                    let strokeColor = '#3b82f6';
                    let fillColor = '#1e293b';
                    if (isLeader) {
                      strokeColor = '#10b981';
                      fillColor = '#064e3b';
                    } else if (isOffline) {
                      strokeColor = '#ef4444';
                      fillColor = '#450a0a';
                    }

                    return (
                      <g key={node.id} className="cursor-pointer group">
                        {/* Outer Glow for Leader */}
                        {isLeader && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="36"
                            fill="#10b981"
                            opacity="0.25"
                            className="animate-pulse"
                          />
                        )}

                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="28"
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={isLeader ? '3.5' : '2.5'}
                        />

                        {/* Node Label */}
                        <text
                          x={node.x}
                          y={node.y - 4}
                          fontSize="11"
                          fontWeight="bold"
                          fill="#f8fafc"
                          textAnchor="middle"
                        >
                          {node.name}
                        </text>

                        {/* Role / Term Badge */}
                        <text
                          x={node.x}
                          y={node.y + 11}
                          fontSize="9"
                          fontWeight="600"
                          fill={isLeader ? '#34d399' : isOffline ? '#f87171' : '#94a3b8'}
                          textAnchor="middle"
                        >
                          {isLeader ? '👑 LEADER' : isOffline ? 'OFFLINE' : `FOLLOWER (T${node.term})`}
                        </text>

                        {/* Commit index pill below node */}
                        <rect
                          x={node.x - 26}
                          y={node.y + 32}
                          width="52"
                          height="14"
                          rx="4"
                          fill="#0f172a"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <text
                          x={node.x}
                          y={node.y + 42}
                          fontSize="8"
                          fontFamily="monospace"
                          fill="#cbd5e1"
                          textAnchor="middle"
                        >
                          idx: {node.commitIndex}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Visual Legend */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  Leader (Heartbeats &amp; Commit Authority)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                  Follower (Replication Target)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  Offline / Partitioned
                </span>
              </div>
            </div>

            {/* Replicated Log Array & State Machine Inspector */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-sm text-text">
                    Replicated Log Array Across Nodes
                  </h3>
                  <span className="text-[10px] text-text-muted font-mono">
                    ★ = Committed to State Machine
                  </span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {raftNodes.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-canvas border border-border space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-text flex items-center gap-1.5">
                          {n.name}
                          {n.role === 'LEADER' && (
                            <span className="text-[9px] px-1 py-0.2 bg-emerald-100 text-emerald-900 rounded font-semibold">
                              Leader
                            </span>
                          )}
                          {n.role === 'OFFLINE' && (
                            <span className="text-[9px] px-1 py-0.2 bg-rose-100 text-rose-900 rounded font-semibold">
                              Offline
                            </span>
                          )}
                        </span>
                        <span className="text-text-muted font-mono text-[10px]">
                          commitIndex: {n.commitIndex}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {n.log.map((entry) => (
                          <span
                            key={entry.index}
                            title={`Term: ${entry.term}, Command: ${entry.command}`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                              entry.committed
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                : 'bg-amber-50 text-amber-900 border-amber-300 border-dashed'
                            }`}
                          >
                            {entry.committed ? '★ ' : ''}#{entry.index}: {entry.command}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Applied State Machine Key-Value Store */}
                <div className="pt-2 border-t border-border">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Applied Replicated State Machine (KV Store):
                  </span>
                  <div className="bg-canvas p-2.5 rounded-lg border border-border font-mono text-xs flex flex-wrap gap-2">
                    {Object.entries(raftStore).map(([k, v]) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded bg-surface border border-border text-text"
                      >
                        <strong className="text-primary-700">{k}</strong>: &quot;{v}&quot;
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Event & Audit Telemetry Log */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text">
                    Raft Event &amp; Election Telemetry
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">Live Log</span>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {raftAuditLog.map((log) => (
                    <div
                      key={log.id}
                      className={`p-1.5 rounded text-[11px] border font-mono flex items-start gap-2 ${
                        log.isWarning
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : 'bg-canvas border-border text-text'
                      }`}
                    >
                      <span className="text-text-muted text-[10px] shrink-0 mt-0.5">
                        {log.time}
                      </span>
                      <span className="flex-1 leading-tight">{log.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Socratic Raft Invariants & Mathematical Proof Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                1. Quorum Invariant
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                $Q = \lfloor N/2 \rfloor + 1$. In a 5-node cluster, any leader election or entry commit requires at least 3 nodes ($60\%$). Two disjoint majorities cannot exist.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. Election Safety
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                At most one leader can be elected in a given term. A candidate only grants its vote to peers with logs at least as up-to-date as its own.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. Log Matching Property
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                If two logs contain an entry with the same index and term, they are guaranteed identical in all entries up to that index.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. Split-Brain Immunity
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                When network partitions occur, the minority partition cannot attain quorum ($2 &lt; 3$). Writes are blocked, preserving total linearizability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 5: VECTOR CLOCKS & DISTRIBUTED CAUSALITY */}
      {activeTab === 'VECTOR_CLOCKS' && (
        <div className="p-6 space-y-6">
          {/* Controls & Action Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-canvas border border-border p-4 rounded-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary-700 bg-primary-100 dark:bg-primary-950/40 px-2 py-0.5 rounded">
                  MODULE 5
                </span>
                <h3 className="text-sm font-bold text-text">
                  Vector Clocks, Lamport Timestamps &amp; Sibling Conflict Inspector
                </h3>
              </div>
              <p className="text-xs text-text-muted">
                Explore partial ordering, the happens-before relation ($a \to b$), concurrent writes ($a \parallel b$), and Dynamo-style multi-version siblings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleVcLocalWrite(0, 'laptop')}
              >
                + Write on Node A
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleVcLocalWrite(1, 'phone')}
              >
                + Write on Node B
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleVcLocalWrite(2, 'tablet')}
              >
                + Write on Node C
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleVcSimulateConcurrentSplit}
              >
                ⚡ Simulate Split Writes (A ‖ B)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleVcReset}
              >
                ↺ Reset Clocks
              </Button>
            </div>
          </div>

          {/* Conflict Alert Banner */}
          {vcConflictNotice && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Causality Violation &amp; Concurrent Sibling Detected
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-bold">
                  NON-DOMINATING VECTORS
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {vcConflictNotice}
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleVcReconcile('CRDT_UNION')}
                >
                  ✓ Reconcile via CRDT Set Union (Zero Data Loss)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleVcReconcile('LWW_CLOCK')}
                >
                  ⚠️ Last-Write-Wins (Simulate LWW Clock Loss)
                </Button>
              </div>
            </div>
          )}

          {/* LWW Warning Banner */}
          {vcLwwWarning && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base">🚨</span>
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Data Loss Warning: Anti-Pattern Demonstrated
                </span>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                {vcLwwWarning}
              </p>
            </div>
          )}

          {/* 3-Node Interactive Cluster Topology Canvas */}
          <div className="bg-surface/50 border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text">
                Multi-Region Replica Cluster &amp; Live Vector Clocks
              </span>
              <span className="font-mono text-[11px] text-text-muted">
                Clock Format: [Node A, Node B, Node C]
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vcNodes.map((node, nodeIdx) => (
                <div
                  key={node.id}
                  className={`border-2 rounded-xl p-4 space-y-3 ${node.bgClass} ${node.borderClass} transition-all shadow-xs`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs"
                        style={{ backgroundColor: node.color }}
                      />
                      <span className="font-bold text-sm text-text">
                        {node.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-canvas px-2 py-0.5 rounded border border-border text-text-muted">
                      L = {node.lamportTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-text-muted">
                    {node.region}
                  </p>

                  {/* Vector Clock Component Pills */}
                  <div className="bg-canvas border border-border rounded-lg p-2.5 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Vector Clock ($V_{['A', 'B', 'C'][nodeIdx]}$):
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
                      <div className="bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 text-emerald-900 dark:text-emerald-200 rounded py-1 text-xs font-bold">
                        A: {node.vclock[0]}
                      </div>
                      <div className="bg-sky-100 dark:bg-sky-950/60 border border-sky-300 text-sky-900 dark:text-sky-200 rounded py-1 text-xs font-bold">
                        B: {node.vclock[1]}
                      </div>
                      <div className="bg-amber-100 dark:bg-amber-950/60 border border-amber-300 text-amber-900 dark:text-amber-200 rounded py-1 text-xs font-bold">
                        C: {node.vclock[2]}
                      </div>
                    </div>
                  </div>

                  {/* Current State Store */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Key-Value State:
                    </span>
                    <div className="bg-canvas border border-border rounded p-2 font-mono text-xs text-primary-700 font-semibold truncate">
                      {node.value}
                    </div>
                  </div>

                  {/* Sibling Values If Present */}
                  {node.siblings && node.siblings.length > 0 && (
                    <div className="space-y-1.5 bg-amber-100/50 dark:bg-amber-950/40 border border-amber-300 rounded p-2">
                      <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider block">
                        Conflicting Siblings ({node.siblings.length}):
                      </span>
                      {node.siblings.map((sib, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-canvas border border-amber-300/60 rounded px-2 py-1 text-[11px] font-mono flex items-center justify-between"
                        >
                          <span className="font-bold text-amber-800 dark:text-amber-300">
                            {sib.value}
                          </span>
                          <span className="text-text-muted text-[10px]">
                            [{sib.vclock.join(', ')}]
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Replication Trigger Buttons */}
                  <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-text-muted font-semibold">Replicate to:</span>
                    {([0, 1, 2] as const)
                      .filter((targetIdx) => targetIdx !== nodeIdx)
                      .map((targetIdx) => (
                        <button
                          key={targetIdx}
                          type="button"
                          onClick={() => handleVcReplicate(nodeIdx as 0 | 1 | 2, targetIdx)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface border border-border hover:bg-canvas transition-colors cursor-pointer text-text"
                        >
                          Node {['A', 'B', 'C'][targetIdx]} →
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Causality Comparison HUD & Space-Time Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Real-Time Event Audit Log */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text">
                  Vector Clock &amp; Causality Event History ({vcEvents.length})
                </span>
                <span className="text-[11px] text-text-muted font-mono">Most Recent First</span>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {vcEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-lg bg-canvas border border-border space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                            ev.type === 'LOCAL_WRITE'
                              ? 'bg-primary-100 text-primary-900 border border-primary-300'
                              : ev.type === 'CONCURRENT_SPLIT'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : ev.type === 'RECONCILE'
                              ? 'bg-purple-100 text-purple-900 border border-purple-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {ev.type}
                        </span>
                        <span className="font-bold text-text">
                          {ev.nodeId.toUpperCase().replace('-', ' ')}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-text-muted">
                        V=[{ev.vclock.join(', ')}] | L={ev.lamportTime}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      {ev.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Causality Pairwise Analysis Table */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-text">
                  Pairwise Causality Relation Matrix
                </span>
                <span className="text-[11px] font-mono text-primary-700 font-bold">
                  $V(a) \le V(b) \iff a \to b$
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { n1: 0, n2: 1, label: 'Node A vs Node B' },
                  { n1: 0, n2: 2, label: 'Node A vs Node C' },
                  { n1: 1, n2: 2, label: 'Node B vs Node C' },
                ].map(({ n1, n2, label }) => {
                  const node1 = vcNodes[n1];
                  const node2 = vcNodes[n2];
                  const rel = compareVectors(node1.vclock, node2.vclock);

                  let relText = 'Concurrent (a ‖ b)';
                  let relBadge = 'bg-amber-100 text-amber-900 border-amber-300';

                  if (rel === 'EQUAL') {
                    relText = 'Identical Clocks (=)';
                    relBadge = 'bg-slate-100 text-slate-800 border-slate-300';
                  } else if (rel === 'V1_DOMINATES') {
                    relText = `${node2.name} happened before ${node1.name} (b → a)`;
                    relBadge = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                  } else if (rel === 'V2_DOMINATES') {
                    relText = `${node1.name} happened before ${node2.name} (a → b)`;
                    relBadge = 'bg-indigo-100 text-indigo-900 border-indigo-300';
                  }

                  return (
                    <div
                      key={label}
                      className="p-3 rounded-lg bg-canvas border border-border space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text font-mono text-[11px]">
                          {label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${relBadge}`}>
                          {rel}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                        <span>{node1.name}: [{node1.vclock.join(', ')}]</span>
                        <span className="text-primary-600 font-bold">{rel === 'CONCURRENT' ? '‖' : rel === 'V1_DOMINATES' ? '≻' : rel === 'V2_DOMINATES' ? '≺' : '='}</span>
                        <span>{node2.name}: [{node2.vclock.join(', ')}]</span>
                      </div>

                      <p className="text-[11px] text-text-muted">
                        {relText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Socratic Mathematical Invariant Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                1. Vector Dominance Theorem
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                $V(a) \le V(b) \iff \forall k: V(a)[k] \le V(b)[k]$. Event $a$ causally precedes $b$ if and only if $V(a)$ is strictly dominated by $V(b)$.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. Lamport Clock Flaw
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                While $a \to b \implies L(a) &lt; L(b)$, the converse is false ($L(a) &lt; L(b) \centernot\implies a \to b$). Scalar Lamport clocks cannot detect concurrent independence!
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. Dynamo Sibling Resolution
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                When $V(a) \parallel V(b)$, distributed stores (Dynamo, Riak) retain both values as siblings, allowing CRDT merges rather than silent data loss.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. Clock Pruning &amp; Truncation
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Vector clocks grow linearly with active nodes ($O(N)$). Production systems prune oldest actor timestamps after predetermined thresholds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 6: TWO-PHASE COMMIT (2PC) VS DISTRIBUTED SAGA COORDINATOR */}
      {activeTab === 'TWO_PHASE_COMMIT_SAGA' && (
        <div className="p-6 space-y-6">
          {/* Module Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-700 font-mono">
                  Module 6: Distributed Transactions
                </span>
                <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
                  Consistency vs Availability
                </span>
              </div>
              <h3 className="text-lg font-bold text-text mt-1">
                Two-Phase Commit (2PC) vs Distributed Saga Coordinator Studio
              </h3>
              <p className="text-xs text-text-muted mt-0.5 max-w-3xl leading-relaxed">
                Contrast the strongly-consistent, synchronous locking of <strong>Two-Phase Commit (2PC)</strong> against the lock-free, eventually-consistent <strong>Distributed Saga Orchestration</strong> pattern. Simulate the classic 2PC coordinator crash blocking dilemma and observe Saga backward recovery with compensating transactions.
              </p>
            </div>

            {/* Architecture Toggle */}
            <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-lg border border-border shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setTxArchitecture('TWO_PHASE_COMMIT')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  txArchitecture === 'TWO_PHASE_COMMIT'
                    ? 'bg-primary-700 text-white shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Two-Phase Commit (2PC)
              </button>
              <button
                type="button"
                onClick={() => setTxArchitecture('DISTRIBUTED_SAGA')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  txArchitecture === 'DISTRIBUTED_SAGA'
                    ? 'bg-primary-700 text-white shadow-xs'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                Distributed Saga (Orchestrated)
              </button>
            </div>
          </div>

          {/* Architecture Comparison Top Banner */}
          <div className="bg-surface/60 border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text font-mono">
                {txArchitecture === 'TWO_PHASE_COMMIT' ? '2PC Model:' : 'Saga Model:'}
              </span>
              <span className="text-text-muted">
                {txArchitecture === 'TWO_PHASE_COMMIT'
                  ? 'Strict ACID Isolation | Global Locks Held | CP System | Blocking Vulnerability'
                  : 'BASE Eventual Consistency | Zero Global Locks | AP System | Backward Compensation'}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="bg-canvas border border-border px-2 py-0.5 rounded">
                Lock State: <strong className={txArchitecture === 'TWO_PHASE_COMMIT' && twoPhaseParticipants.some(p => p.locked) ? 'text-rose-600' : 'text-emerald-600'}>
                  {txArchitecture === 'TWO_PHASE_COMMIT' && twoPhaseParticipants.some(p => p.locked) ? 'LOCKED 🔒' : 'LOCK-FREE 🔓'}
                </strong>
              </span>
            </div>
          </div>

          {/* TWO-PHASE COMMIT STUDIO */}
          {txArchitecture === 'TWO_PHASE_COMMIT' && (
            <div className="space-y-6">
              {/* Coordinator Node */}
              <div className={`p-4 rounded-xl border transition-all space-y-2 ${
                twoPhaseCoordState === 'CRASHED_BLOCKING'
                  ? 'bg-rose-500/10 border-rose-500 ring-2 ring-rose-500/50'
                  : twoPhaseCoordState === 'COMMITTED'
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : twoPhaseCoordState === 'ABORTED'
                  ? 'bg-amber-500/10 border-amber-500'
                  : 'bg-surface border-border'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-canvas px-2 py-0.5 rounded border border-border">
                      Coordinator (C)
                    </span>
                    <span className="font-bold text-text text-sm">
                      Central 2PC Transaction Coordinator
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                    twoPhaseCoordState === 'CRASHED_BLOCKING'
                      ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                      : twoPhaseCoordState === 'COMMITTED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : twoPhaseCoordState === 'ABORTED'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-canvas text-text-muted border-border'
                  }`}>
                    STATE: {twoPhaseCoordState}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                  <span className="font-mono text-text-muted text-[11px]">
                    Disk Write-Ahead Log: <code className="text-primary-700 font-bold">{twoPhaseWal}</code>
                  </span>
                  {twoPhaseCoordState === 'CRASHED_BLOCKING' && (
                    <span className="text-rose-600 font-bold text-[11px] animate-pulse">
                      ⚠️ COORDINATOR OFFLINE — PARTICIPANTS LOCKED INDEFINITELY
                    </span>
                  )}
                </div>
              </div>

              {/* 3 Participants (Microservice Resource Managers) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {twoPhaseParticipants.map((p) => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border space-y-3 transition-all ${
                      p.locked
                        ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-400 ring-1 ring-rose-400'
                        : p.status === 'COMMITTED'
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400'
                        : p.status === 'ABORTED'
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-400'
                        : 'bg-surface border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text text-xs">{p.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          p.status === 'COMMITTED'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : p.status === 'ABORTED'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : p.status === 'PREPARED'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {p.status}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                          p.locked
                            ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          {p.locked ? 'LOCKED 🔒' : 'UNLOCKED 🔓'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-text-muted text-[11px] block">Resource: {p.resource}</span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] text-text-muted">Vote:</span>
                        <span className={`font-mono font-bold text-[11px] ${
                          p.vote === 'COMMIT' ? 'text-emerald-700' : p.vote === 'ABORT' ? 'text-rose-700' : 'text-text-muted'
                        }`}>
                          {p.vote ? `VOTE_${p.vote}` : 'NONE'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-canvas border border-border rounded-lg p-2 font-mono text-[11px] text-text-muted space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-text-muted block">Local DB State:</span>
                      <p className="text-text font-semibold">{p.dbState}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2PC Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  onClick={handle2pcCommitSuccess}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3.5 py-2 cursor-pointer"
                >
                  ✓ Run 2PC Success (All 3 Vote Commit)
                </Button>
                <Button
                  onClick={handle2pcParticipantFailure}
                  className="bg-amber-700 hover:bg-amber-800 text-white text-xs px-3.5 py-2 cursor-pointer"
                >
                  ⚠️ Run 2PC Failure (Inventory Votes Abort)
                </Button>
                <Button
                  onClick={handle2pcCoordinatorCrash}
                  className="bg-rose-700 hover:bg-rose-800 text-white text-xs px-3.5 py-2 cursor-pointer"
                >
                  💥 Simulate Coordinator Crash (Indefinite Blocking)
                </Button>
                <Button
                  onClick={handle2pcReset}
                  variant="secondary"
                  className="text-xs px-3.5 py-2 cursor-pointer"
                >
                  ↺ Reset 2PC State
                </Button>
              </div>
            </div>
          )}

          {/* DISTRIBUTED SAGA STUDIO */}
          {txArchitecture === 'DISTRIBUTED_SAGA' && (
            <div className="space-y-6">
              {/* Saga Orchestrator Card */}
              <div className={`p-4 rounded-xl border transition-all space-y-2 ${
                sagaOrchestratorState === 'COMPLETED'
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : sagaOrchestratorState === 'COMPENSATED_ABORT'
                  ? 'bg-purple-500/10 border-purple-500'
                  : 'bg-surface border-border'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-canvas px-2 py-0.5 rounded border border-border">
                      Saga Orchestrator
                    </span>
                    <span className="font-bold text-text text-sm">
                      Stateful Workflow Coordinator (Event-Driven)
                    </span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                    sagaOrchestratorState === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : sagaOrchestratorState === 'COMPENSATED_ABORT'
                      ? 'bg-purple-100 text-purple-900 border-purple-300'
                      : 'bg-canvas text-text-muted border-border'
                  }`}>
                    ORCHESTRATOR: {sagaOrchestratorState}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                  <span className="text-text-muted text-[11px]">
                    Lock Policy: <strong className="text-emerald-600 font-mono">0 Distributed Locks Held (Immediate Local DB Commits)</strong>
                  </span>
                  <span className="text-[11px] text-text-muted font-mono">
                    Recovery Strategy: Backward Compensation (C2 → C1)
                  </span>
                </div>
              </div>

              {/* Saga Steps (Microservices) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sagaSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border space-y-3 transition-all ${
                      step.status === 'COMMITTED'
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-400'
                        : step.status === 'COMPENSATED'
                        ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-400'
                        : step.status === 'FAILED'
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-400 ring-1 ring-rose-400'
                        : 'bg-surface border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text text-xs">
                        Step {step.stepNumber}: {step.serviceName}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        step.status === 'COMMITTED'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : step.status === 'COMPENSATED'
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : step.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-slate-100 text-slate-800 border-slate-300'
                      }`}>
                        {step.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-[11px]">
                      <div className="bg-canvas border border-border p-1.5 rounded">
                        <span className="text-emerald-700 font-bold block">{step.forwardTx}</span>
                        <span className="text-purple-700 block mt-0.5">{step.compensatingTx}</span>
                      </div>
                    </div>

                    <div className="bg-canvas border border-border rounded-lg p-2 font-mono text-[11px] space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-text-muted block">Local DB State:</span>
                      <p className="text-text font-semibold">{step.dbState}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Saga Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  onClick={handleSagaRunSuccess}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3.5 py-2 cursor-pointer"
                >
                  ✓ Run Saga Forward (T1 → T2 → T3 Commit)
                </Button>
                <Button
                  onClick={handleSagaRunFailureCompensate}
                  className="bg-purple-700 hover:bg-purple-800 text-white text-xs px-3.5 py-2 cursor-pointer"
                >
                  ↩ Simulate Failure &amp; Backward Recovery (T3 Fails → C2, C1)
                </Button>
                <Button
                  onClick={handleSagaReset}
                  variant="secondary"
                  className="text-xs px-3.5 py-2 cursor-pointer"
                >
                  ↺ Reset Saga State
                </Button>
              </div>
            </div>
          )}

          {/* Real-Time Transaction Audit Log */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text uppercase tracking-wider">
                Transaction Event Audit Log &amp; State Transitions:
              </span>
              <span className="text-text-muted font-mono text-[11px]">
                {txAuditLog.length} Recorded Events
              </span>
            </div>

            <div className="space-y-2">
              {txAuditLog.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-lg bg-canvas border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-muted text-[11px]">{ev.time}</span>
                    <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${ev.badgeClass}`}>
                      {ev.badge}
                    </span>
                    <span className="text-text font-medium">{ev.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Socratic Mathematical Invariant Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                1. 2PC Blocking &amp; FLP
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                2PC is a blocking protocol. If the coordinator fails after participants enter <code className="text-primary-600 font-mono">PREPARED</code>, participants cannot unilaterally commit or abort, locking resources indefinitely.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. Saga Lock-Free BASE
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Sagas abandon strict Isolation to achieve high Availability. Transactions commit immediately in local databases. If step T_i fails, backward compensations (C_prev ... C_1) restore semantic consistency.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. Idempotent Compensations
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                In unreliable networks, compensating requests may be retried repeatedly. Compensating actions ($C_i$) must be strictly idempotent ($f(f(x)) = f(x)$) and never fail.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. The Pivot Transaction
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                A Saga has a distinct Pivot Step: transactions before the pivot can be compensated; once the pivot commits, the Saga guarantees forward completion and cannot be rolled back.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* MODULE 7: DISTRIBUTED LOCK FENCING TOKENS & JEPSEN SPLIT-BRAIN STORAGE SIMULATION */}
      {activeTab === 'FENCING_TOKENS_JEPSEN' && (
        <div className="p-6 space-y-6">
          {/* Header Banner */}
          <div className="bg-canvas border border-border p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Distributed Concurrency &amp; Storage Safety
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                  Kleppmann Invariant
                </span>
              </div>
              <h3 className="font-bold text-base text-text">
                Distributed Lock Fencing Tokens &amp; Asynchronous Split-Brain Storage Simulation
              </h3>
              <p className="text-xs text-text-muted max-w-3xl leading-relaxed">
                Proves why distributed lock leases (TTL timeouts) cannot guarantee mutual exclusion in asynchronous distributed systems subject to Stop-the-World GC pauses, packet delays, or virtual machine stalls. Without monotonically increasing fencing tokens checked by the storage engine, split-brain overwrites and lost updates are mathematically inevitable.
              </p>
            </div>

            {/* Storage Gating Mode Selector */}
            <div className="bg-surface border border-border p-2.5 rounded-lg flex flex-col gap-1.5 min-w-[260px]">
              <span className="text-[11px] font-bold text-text uppercase tracking-wider">
                Storage Engine Gating Mode:
              </span>
              <div className="grid grid-cols-2 gap-1 bg-canvas p-1 rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setFencingStorageMode('UNFENCED_NAIVE');
                    handleFencingReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    fencingStorageMode === 'UNFENCED_NAIVE'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Naive (Unfenced)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFencingStorageMode('FENCING_TOKEN_GATED');
                    handleFencingReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    fencingStorageMode === 'FENCING_TOKEN_GATED'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Fencing Token Gated
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Workflow Controls */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text">
                Asynchronous Split-Brain Execution Steps:
              </span>
              <span className="text-xs font-mono text-text-muted">
                Current Step: <strong>{fencingStep} / 4</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 pt-1">
              <Button
                onClick={handleFencingStep1AcquireClient1}
                disabled={fencingStep !== 0}
                variant={fencingStep === 0 ? 'primary' : 'secondary'}
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                1. Client 1 Acquires Lock (Token 33)
              </Button>

              <Button
                onClick={handleFencingStep2InjectGCPause}
                disabled={fencingStep !== 1}
                variant={fencingStep === 1 ? 'accent' : 'secondary'}
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                2. Inject 15s STW GC Pause
              </Button>

              <Button
                onClick={handleFencingStep3AcquireClient2}
                disabled={fencingStep !== 2}
                variant={fencingStep === 2 ? 'primary' : 'secondary'}
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                3. Client 2 Acquires &amp; Writes (Token 34)
              </Button>

              <Button
                onClick={handleFencingStep4AwakenClient1}
                disabled={fencingStep !== 3}
                variant={fencingStep === 3 ? (fencingStorageMode === 'UNFENCED_NAIVE' ? 'destructive' : 'accent') : 'secondary'}
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                4. Client 1 Wakes &amp; Writes (Token 33)
              </Button>

              <Button
                onClick={handleFencingReset}
                variant="secondary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                ↺ Reset Cluster
              </Button>
            </div>
          </div>

          {/* Main Visual Topology: Lock Coordinator -> 2 Clients -> Shared Storage Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Top Tier / Left: Distributed Lock Coordinator */}
            <div className="lg:col-span-4 bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <h4 className="font-bold text-sm text-text">Distributed Lock Coordinator</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-canvas">
                  Lease TTL = 10s
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Current Lock Holder:</span>
                  <span className="font-mono font-bold">
                    {fencingLockManager.currentHolder ? (
                      <span className="text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded border border-primary-200">
                        {fencingLockManager.currentHolder === 'client-1' ? 'Client 1' : 'Client 2'}
                      </span>
                    ) : fencingLockManager.isExpired ? (
                      <span className="text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200">
                        LEASE EXPIRED (REVOKED)
                      </span>
                    ) : (
                      <span className="text-text-muted">NONE (FREE)</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Monotonic Fencing Counter:</span>
                  <span className="font-mono font-bold text-sm bg-canvas px-2.5 py-0.5 rounded border border-border text-amber-700 dark:text-amber-400">
                    Token #{fencingLockManager.currentToken}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span>Lease Expiry Timer:</span>
                    <span>{fencingLockManager.leaseSeconds}s remaining</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        fencingLockManager.leaseSeconds > 0 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${(fencingLockManager.leaseSeconds / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-canvas border border-border text-[11px] text-text-muted space-y-1">
                  <span className="font-bold text-text block">Lease Invariant:</span>
                  <p>
                    Every time a lock is acquired, coordinator increments integer epoch by +1. When 10s lease expires, coordinator permits new client acquisition regardless of whether previous client acknowledged release.
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Tier / Center: Client 1 & Client 2 Side-by-Side */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client 1 Box */}
              <div
                className={`bg-surface border rounded-xl p-4 space-y-3 relative overflow-hidden ${
                  fencingClient1.status === 'STW_PAUSED'
                    ? 'border-purple-400 bg-purple-50/20 dark:bg-purple-950/20'
                    : fencingClient1.status === 'WRITE_COMMITTED'
                    ? 'border-emerald-400'
                    : fencingClient1.status === 'WRITE_REJECTED'
                    ? 'border-rose-400'
                    : 'border-border'
                }`}
              >
                {fencingClient1.status === 'STW_PAUSED' && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white uppercase tracking-wider animate-pulse">
                    ❄️ Stop-The-World Freeze
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-text">Client 1</h4>
                    <span className="text-[11px] text-text-muted">Batch Invoice Settler</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      fencingClient1.status === 'STW_PAUSED'
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : fencingClient1.status === 'ACQUIRED_LOCK'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : fencingClient1.status === 'WRITE_REJECTED'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : 'bg-canvas text-text-muted border-border'
                    }`}
                  >
                    {fencingClient1.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Held Fencing Token:</span>
                    <span className="font-mono font-bold">
                      {fencingClient1.heldToken ? (
                        <span className="text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-300">
                          #{fencingClient1.heldToken}
                        </span>
                      ) : (
                        'None'
                      )}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-text-muted block text-[11px]">Write Buffer Payload:</span>
                    <pre className="font-mono text-[11px] p-2 rounded bg-canvas border border-border text-text overflow-x-auto">
                      {fencingClient1.dataPayload}
                    </pre>
                  </div>

                  <div className="p-2 rounded bg-canvas border border-border text-[11px] text-text leading-tight">
                    <span className="font-semibold block text-text-muted mb-0.5">Status:</span>
                    {fencingClient1.statusMessage}
                  </div>
                </div>
              </div>

              {/* Client 2 Box */}
              <div
                className={`bg-surface border rounded-xl p-4 space-y-3 relative overflow-hidden ${
                  fencingClient2.status === 'WRITE_COMMITTED'
                    ? 'border-sky-400 bg-sky-50/20 dark:bg-sky-950/20'
                    : fencingClient2.status === 'ACQUIRED_LOCK'
                    ? 'border-emerald-400'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-text">Client 2</h4>
                    <span className="text-[11px] text-text-muted">Dispute Revocation Worker</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      fencingClient2.status === 'WRITE_COMMITTED'
                        ? 'bg-sky-100 text-sky-900 border-sky-300'
                        : fencingClient2.status === 'ACQUIRED_LOCK'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-canvas text-text-muted border-border'
                    }`}
                  >
                    {fencingClient2.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Held Fencing Token:</span>
                    <span className="font-mono font-bold">
                      {fencingClient2.heldToken ? (
                        <span className="text-sky-700 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-300">
                          #{fencingClient2.heldToken}
                        </span>
                      ) : (
                        'None'
                      )}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-text-muted block text-[11px]">Write Buffer Payload:</span>
                    <pre className="font-mono text-[11px] p-2 rounded bg-canvas border border-border text-text overflow-x-auto">
                      {fencingClient2.dataPayload}
                    </pre>
                  </div>

                  <div className="p-2 rounded bg-canvas border border-border text-[11px] text-text leading-tight">
                    <span className="font-semibold block text-text-muted mb-0.5">Status:</span>
                    {fencingClient2.statusMessage}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Tier: Shared Persistent Storage Engine */}
          <div
            className={`bg-surface border-2 rounded-xl p-4 space-y-3 transition-colors ${
              fencingStorage.isCorrupted
                ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/30'
                : fencingStep === 4 && !fencingStorage.isCorrupted
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30'
                : 'border-border'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-text">Shared Persistent Storage Engine</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                    fencingStorageMode === 'UNFENCED_NAIVE'
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  Mode: {fencingStorageMode === 'UNFENCED_NAIVE' ? 'UNFENCED (NAIVE)' : 'FENCING TOKEN GATED'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-text-muted">Storage Token Watermark:</span>
                <span className="font-mono font-bold bg-canvas px-2 py-0.5 rounded border border-border text-primary-600">
                  maxToken = {fencingStorage.maxCommittedToken}
                </span>
              </div>
            </div>

            {/* Split-Brain Hazard or Protection Alert Banner */}
            {fencingStorage.isCorrupted ? (
              <div className="p-3 rounded-lg bg-rose-100 border border-rose-300 text-rose-950 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200 text-xs space-y-1">
                <span className="font-bold text-sm block">⚠️ CRITICAL SPLIT-BRAIN CORRUPTION DETECTED</span>
                <p>
                  Client 1 woke up after a 15-second Stop-the-World GC pause and executed its write with expired Token 33! Because the storage engine is UNFENCED, it blindly accepted the write, overwriting Client 2&apos;s dispute revocation! This is the classic Kleppmann Split-Brain Lost Update Anomaly.
                </p>
              </div>
            ) : fencingStep === 4 && !fencingStorage.isCorrupted ? (
              <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-950 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-200 text-xs space-y-1">
                <span className="font-bold text-sm block">🛡️ STORAGE INTEGRITY PRESERVED VIA FENCING TOKEN</span>
                <p>
                  Client 1 attempted to write with stale Token 33. The storage engine checked: <strong>Token 33 &lt; Watermark 34</strong> and rejected the write with HTTP 409 Conflict! Client 2&apos;s legitimate REVOKED state remains intact. Zero data loss!
                </p>
              </div>
            ) : null}

            {/* Storage Data Inspection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="space-y-1">
                <span className="text-text-muted block text-[11px] font-semibold">
                  Current Committed Disk Record:
                </span>
                <pre className="font-mono text-xs p-3 rounded bg-canvas border border-border text-text overflow-x-auto">
                  {fencingStorage.currentData}
                </pre>
              </div>

              <div className="space-y-2 bg-canvas p-3 rounded border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Last Written By:</span>
                  <span className="font-bold text-text">{fencingStorage.committedBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Monotonic Watermark:</span>
                  <span className="font-mono font-bold text-primary-600">
                    {fencingStorage.maxCommittedToken}
                  </span>
                </div>
                <div className="text-[11px] text-text-muted pt-1 border-t border-border">
                  <span className="font-semibold block text-text mb-0.5">Integrity State:</span>
                  {fencingStorage.integrityMessage}
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Benchmark Matrix */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-text">
              Comparative Analysis: Distributed Lock Leases vs Monotonic Fencing Tokens
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-canvas text-text font-bold">
                    <th className="p-2">Fault Vector</th>
                    <th className="p-2">Naive Distributed Lock (TTL Lease Only)</th>
                    <th className="p-2">Fencing Token Gated Storage Engine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-2 font-semibold text-text">Stop-the-World GC Pause (15s)</td>
                    <td className="p-2 text-rose-600 font-semibold">Vulnerable to Split-Brain Corruption</td>
                    <td className="p-2 text-emerald-600 font-semibold">Provably Safe (Stale token rejected)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-text">Asynchronous Network Latency / Stall</td>
                    <td className="p-2 text-rose-600 font-semibold">Vulnerable (Delayed packets arrive after lease expiry)</td>
                    <td className="p-2 text-emerald-600 font-semibold">Provably Safe (Arriving packet has lower token)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-text">Physical Clock Drift / NTP Jumps</td>
                    <td className="p-2 text-rose-600 font-semibold">Catastrophic (Clock jump prematurely expires lease)</td>
                    <td className="p-2 text-emerald-600 font-semibold">Immune (Relies on integer monotonicity, not time)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-text">Storage Engine Requirements</td>
                    <td className="p-2 text-text-muted">Blind key-value storage (no token verification)</td>
                    <td className="p-2 text-text-muted font-mono">Requires atomic check: writeToken &gt; maxToken</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Audit Log */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text uppercase tracking-wider">
                Fencing Token &amp; Cluster Event Audit Stream:
              </span>
              <span className="text-text-muted font-mono text-[11px]">
                {fencingAuditLog.length} Events Logged
              </span>
            </div>

            <div className="space-y-2">
              {fencingAuditLog.map((ev) => (
                <div
                  key={ev.id}
                  className="p-2.5 rounded-lg bg-canvas border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-muted text-[11px]">{ev.time}</span>
                    <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${ev.badgeClass}`}>
                      {ev.badge}
                    </span>
                    <span className="text-text font-medium">{ev.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Socratic Invariant Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                1. Kleppmann&apos;s Distributed Lock Flaw
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                In an asynchronous distributed system with unbounded network delays and Stop-the-World GC pauses, lock leases relying on physical time cannot guarantee mutual exclusion without storage cooperation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. Monotonic Fencing Epochs
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Every successful lock acquisition must return a strictly monotonically increasing integer token (token_k+1 &gt; token_k). The token acts as an epoch number for all storage mutations.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. The Asynchronous Pause Invariant
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                A client thread cannot know whether its lease has expired while it was paused. Checking lease validity before writing creates an unavoidable time-of-check to time-of-use (TOCTOU) race condition.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. Storage Engine Gating
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Mutual exclusion can only be finalized at the shared resource (storage engine). The storage layer must atomically reject any write where token_write &le; token_max.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* SUB-TAB 8: PAXOS & MULTI-PAXOS CONSENSUS */}
      {activeTab === 'PAXOS_CONSENSUS' && (
        <div className="p-6 space-y-6">
          {/* Header & Protocol Mode Selector */}
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Distributed Consensus Protocols &amp; Quorums
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-primary-200 bg-primary-50 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300">
                  Lamport 1998 / 2001 Invariant
                </span>
              </div>
              <h3 className="font-bold text-base text-text">
                Classic Paxos vs Multi-Paxos: 2-RTT Quorums, Dueling Proposer Livelock &amp; 1-RTT Fast Path
              </h3>
              <p className="text-xs text-text-muted max-w-3xl leading-relaxed">
                Analyze Leslie Lamport&apos;s Paxos consensus algorithm. Observe how Classic Single-Decree Paxos requires 2 RTTs per decision and can suffer from non-terminating <strong>Dueling Proposer Livelock</strong> under concurrent writes, whereas Multi-Paxos amortizes Phase 1 with a stable leader lease, streaming log writes directly via Phase 2 in 1 RTT.
              </p>
            </div>

            {/* Protocol Mode Selector */}
            <div className="bg-surface border border-border p-2.5 rounded-lg flex flex-col gap-1.5 min-w-[280px]">
              <span className="text-[11px] font-bold text-text uppercase tracking-wider">
                Paxos Protocol Architecture:
              </span>
              <div className="grid grid-cols-2 gap-1 bg-canvas p-1 rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setPaxosMode('CLASSIC_PAXOS');
                    handlePaxosReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    paxosMode === 'CLASSIC_PAXOS'
                      ? 'bg-primary-700 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Classic Paxos (2 RTT)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaxosMode('MULTI_PAXOS');
                    handlePaxosReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    paxosMode === 'MULTI_PAXOS'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Multi-Paxos (1 RTT)
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Operations Bar */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              Consensus Execution Scenarios (Cluster: 2 Proposers, 3 Acceptors, Majority Quorum Q=2):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <Button
                onClick={handleClassicPaxosRunCleanWrite}
                variant="primary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                1. Classic Paxos Clean 2-RTT Write
              </Button>
              <Button
                onClick={handleClassicPaxosTriggerLivelock}
                variant="destructive"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                2. Simulate Dueling Proposer Livelock
              </Button>
              <Button
                onClick={handleMultiPaxosStreamWrite}
                variant="accent"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                3. Multi-Paxos 1-RTT Stream Write
              </Button>
              <Button
                onClick={handlePaxosReset}
                variant="secondary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                ↺ Reset Paxos Lab
              </Button>
            </div>
          </div>

          {/* Critical Alerts Banner */}
          {paxosLivelockAlert && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-950 dark:bg-rose-950/40 dark:border-rose-400 dark:text-rose-100 flex items-start gap-3 animate-pulse">
              <span className="text-xl">⚠️</span>
              <div className="space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
                  Consensus Hazard: Dueling Proposer Livelock (FLP Impossibility)
                </span>
                <p className="text-xs font-mono leading-relaxed">{paxosLivelockAlert}</p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300">
                  Because neither proposer can complete Phase 2 before the other preempts Phase 1, the cluster is stuck in an infinite prepare-promise-reject loop. Multi-Paxos resolves this by using randomized backoff and electing a single stable leader with lease heartbeats.
                </p>
              </div>
            </div>
          )}

          {/* Architecture Visualization: Proposers -> Acceptors -> Replicated Log */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Proposers Panel */}
            <div className="lg:col-span-5 bg-surface border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h4 className="font-bold text-sm text-text">Proposer Nodes (Client Request Gateways)</h4>
                  <span className="text-xs text-text-muted">Proposers coordinate Phase 1 (Prepare) and Phase 2 (Accept).</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-canvas">
                  2 Nodes
                </span>
              </div>

              <div className="space-y-3">
                {Object.values(paxosProposers).map((p) => (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2 ${
                      p.phase === 'COMMITTED'
                        ? 'bg-emerald-50/30 border-emerald-400 dark:bg-emerald-950/20'
                        : p.phase === 'REJECTED_LIVELOCK'
                        ? 'bg-rose-50/40 border-rose-400 dark:bg-rose-950/20'
                        : 'bg-canvas border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-primary-100 text-primary-900 dark:bg-primary-950/60 dark:text-primary-300 px-2 py-0.5 rounded">
                          {p.id}
                        </span>
                        <span className="font-semibold text-xs text-text">{p.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        p.phase === 'COMMITTED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : p.phase === 'REJECTED_LIVELOCK'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                      }`}>
                        {p.phase}
                      </span>
                    </div>

                    <div className="text-xs font-mono space-y-1 text-text-muted">
                      <div>Proposal Number (n): <strong className="text-text">{p.proposalNum}</strong></div>
                      <div>Proposed Value: <code className="text-text">{p.proposedValue}</code></div>
                      <div>Promises Quorum: <strong className="text-text">{p.promisesReceived.length}/3 {p.promisesReceived.length >= 2 ? '✓ (Quorum)' : ''}</strong></div>
                      <div>Accept Quorum: <strong className="text-text">{p.acceptedReceived.length}/3 {p.acceptedReceived.length >= 2 ? '✓ (Quorum)' : ''}</strong></div>
                    </div>

                    <p className="text-[11px] text-text-muted leading-relaxed bg-surface p-2 rounded border border-border">
                      {p.statusMessage}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptors & State Panel */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-text">Acceptor Quorum Nodes (State Consensus Storage)</h4>
                    <span className="text-xs text-text-muted">
                      Acceptors persist minProposal and acceptedProposal/acceptedValue to survive crashes.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-canvas">
                    Majority Q = 2 of 3
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paxosAcceptors.map((a) => (
                    <div
                      key={a.id}
                      className={`p-3 rounded-xl border transition-all space-y-2 ${
                        a.stateBadge === 'ACCEPTED'
                          ? 'bg-emerald-50/40 border-emerald-400 dark:bg-emerald-950/20'
                          : a.stateBadge === 'PROMISED'
                          ? 'bg-amber-50/40 border-amber-400 dark:bg-amber-950/20'
                          : 'bg-canvas border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="font-bold text-text">{a.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          a.stateBadge === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : a.stateBadge === 'PROMISED'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                        }`}>
                          {a.stateBadge}
                        </span>
                      </div>

                      <div className="text-[11px] font-mono space-y-1 text-text-muted">
                        <div>minProposal: <strong className="text-primary-700 dark:text-primary-400">{a.minProposal}</strong></div>
                        <div>acceptedProposal: <strong className="text-text">{a.acceptedProposal ?? 'None'}</strong></div>
                        <div className="truncate">acceptedVal: <strong className="text-text">{a.acceptedValue ?? 'None'}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Replicated State Machine Log */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h4 className="font-bold text-sm text-text">Replicated Consensus Log (Committed Slots)</h4>
                  <span className="text-xs font-mono text-text-muted">{paxosLog.length} Committed Slot(s)</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto font-mono text-xs">
                  {paxosLog.map((entry) => (
                    <div
                      key={entry.slot}
                      className="p-2 rounded bg-canvas border border-border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold px-1.5 py-0.5 rounded bg-primary-100 text-primary-900 dark:bg-primary-950/60 dark:text-primary-300 text-[10px]">
                          Slot {entry.slot}
                        </span>
                        <span className="text-text">{entry.value}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <span>n={entry.proposalNum}</span>
                        <span className="text-emerald-600 font-bold">COMMITTED ✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RTT & Latency Comparison Table */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-text">
              Consensus Protocol Latency &amp; Message Complexity Matrix
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-canvas text-text font-bold">
                    <th className="p-2">Consensus Protocol</th>
                    <th className="p-2">Steady-State Latency</th>
                    <th className="p-2">Phase Breakdown</th>
                    <th className="p-2">Livelock Vulnerability</th>
                    <th className="p-2">Leader Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-2 font-semibold text-text">Classic Paxos (Single-Decree)</td>
                    <td className="p-2 text-rose-600 font-mono font-bold">2 RTTs per value</td>
                    <td className="p-2 text-text-muted font-mono">Phase 1 (Prepare) + Phase 2 (Accept)</td>
                    <td className="p-2 text-rose-600 font-semibold">HIGH (Dueling Proposers)</td>
                    <td className="p-2 text-text-muted">Leaderless (Any Proposer)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-text">Multi-Paxos</td>
                    <td className="p-2 text-emerald-600 font-mono font-bold">1 RTT (Fast Path)</td>
                    <td className="p-2 text-text-muted font-mono">Phase 1 once during election; Phase 2 streaming</td>
                    <td className="p-2 text-emerald-600 font-semibold">NONE (Leader Lease Protected)</td>
                    <td className="p-2 text-text-muted">Stable Leader with Heartbeats</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-text">Raft Consensus</td>
                    <td className="p-2 text-emerald-600 font-mono font-bold">1 RTT (AppendEntries)</td>
                    <td className="p-2 text-text-muted font-mono">Randomized election; 1-RTT log replication</td>
                    <td className="p-2 text-emerald-600 font-semibold">NONE (Term-based Preemption)</td>
                    <td className="p-2 text-text-muted">Strict Strong Leader</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Audit Log */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-text">
              Real-Time Paxos Consensus Protocol Audit Stream
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {paxosAuditLog.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded bg-canvas border border-border"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">{log.time}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${log.badgeClass}`}>
                      {log.badge}
                    </span>
                    <span className="text-text">{log.message}</span>
                  </div>
                  <span className="text-[10px] text-text-muted">{log.protocol}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Socratic Invariant Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                1. Lamport&apos;s Quorum Intersection
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Any two majorities of Acceptors must share at least one node in common ($Q_1 \cap Q_2 \neq \emptyset$). This geometric overlap guarantees that Phase 2 cannot commit a value contradictory to a completed Phase 1.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. Classic Paxos 2-RTT Cost
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                In Single-Decree Paxos, every write requires Phase 1 (Prepare/Promise) to discover prior accepted proposals, followed by Phase 2 (Accept/Accepted) to commit. This incurs 2 full RTTs per command.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. Dueling Proposer Livelock
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Without leader coordination, two proposers $P_1$ and $P_2$ can repeatedly issue higher proposal numbers before the other can complete Phase 2. FLP impossibility dictates that deterministic liveness is impossible without timeouts or leases.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. Multi-Paxos 1-RTT Stream
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Multi-Paxos elects a stable leader once using Phase 1. Subsequent log slots stream directly via Phase 2 in 1 RTT with leader lease heartbeats, resolving both the 2-RTT latency penalty and the dueling livelock hazard.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}