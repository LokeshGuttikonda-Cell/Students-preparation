'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export type DistributedMode =
  | 'CONSISTENT_HASHING'
  | 'RATE_LIMITER'
  | 'CIRCUIT_BREAKER'
  | 'RAFT_CONSENSUS'
  | 'VECTOR_CLOCKS'
  | 'TWO_PHASE_COMMIT_SAGA';

export type TxArchitecture = 'TWO_PHASE_COMMIT' | 'DISTRIBUTED_SAGA';

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
    </div>
  );
}
