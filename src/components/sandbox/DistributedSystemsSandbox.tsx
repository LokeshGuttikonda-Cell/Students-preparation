'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export type DistributedMode =
  | 'CONSISTENT_HASHING'
  | 'RATE_LIMITER'
  | 'CIRCUIT_BREAKER'
  | 'RAFT_CONSENSUS';

interface HashNode {
  id: string;
  name: string;
  baseAngle: number;
  color: string;
  badgeBg: string;
}

interface CacheKey {
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

  // --- Module 1: Consistent Hashing State ---
  const [includeNodeD, setIncludeNodeD] = useState(false);
  const [vnodesMultiplier, setVnodesMultiplier] = useState<1 | 2 | 3>(1);

  // Generate active node positions (with virtual nodes if multiplier > 1)
  const activeNodes = includeNodeD ? [...BASE_NODES, NODE_D] : BASE_NODES;
  const ringPoints: Array<{ id: string; name: string; angle: number; color: string; isVirtual: boolean }> = [];

  for (const node of activeNodes) {
    for (let v = 0; v < vnodesMultiplier; v++) {
      // Offset virtual nodes evenly around ring: angle + v * (360 / (activeNodes.length * vnodesMultiplier))
      const offset = (v * (360 / (activeNodes.length * vnodesMultiplier * 1.5))) % 360;
      const ringAngle = (node.baseAngle + offset) % 360;
      ringPoints.push({
        id: `${node.id}-v${v}`,
        name: v === 0 ? node.name : `${node.name}#${v + 1}`,
        angle: Math.round(ringAngle),
        color: node.color,
        isVirtual: v > 0,
      });
    }
  }
  ringPoints.sort((a, b) => a.angle - b.angle);

  // Map each key clockwise to first node with angle >= key.angle (or wrap to ringPoints[0])
  const keyAssignments = CACHE_KEYS.map((k) => {
    let assigned = ringPoints[0];
    for (const p of ringPoints) {
      if (p.angle >= k.angle) {
        assigned = p;
        break;
      }
    }
    return { ...k, assignedNode: assigned };
  });

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
        </div>
      </div>

      {/* MODULE 1: CONSISTENT HASH RING */}
      {activeTab === 'CONSISTENT_HASHING' && (
        <div className="p-6 space-y-6">
          {/* Controls & Invariant Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas border border-border p-4 rounded-xl">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Topology Controls:
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
              </div>
            </div>

            <div className="text-right sm:max-w-xs text-xs text-text-muted">
              <span className="font-semibold text-text block">Circular Hash Space: 0° → 360°</span>
              Keys map clockwise to the nearest active physical or virtual node token.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual SVG Hash Ring */}
            <div className="lg:col-span-7 bg-canvas border border-border rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
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

                  {/* Active Node Tokens on Ring */}
                  {ringPoints.map((pt) => {
                    const rad = ((pt.angle - 90) * Math.PI) / 180;
                    const cx = 200 + 140 * Math.cos(rad);
                    const cy = 200 + 140 * Math.sin(rad);

                    return (
                      <g key={pt.id} className="cursor-pointer group">
                        <circle
                          cx={cx}
                          cy={cy}
                          r={pt.isVirtual ? '8' : '14'}
                          fill={pt.color}
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          className="shadow-sm"
                        />
                        <text
                          x={cx}
                          y={cy + 3}
                          fontSize={pt.isVirtual ? '7' : '9'}
                          fill="#ffffff"
                          fontWeight="bold"
                          textAnchor="middle"
                          pointerEvents="none"
                        >
                          {pt.isVirtual ? 'V' : pt.name.slice(5, 6)}
                        </text>
                        {/* Tooltip on hover */}
                        <title>{`${pt.name} at ${pt.angle}°`}</title>
                      </g>
                    );
                  })}

                  {/* Cache Keys inside / outside ring */}
                  {keyAssignments.map((k) => {
                    const rad = ((k.angle - 90) * Math.PI) / 180;
                    const kx = 200 + 105 * Math.cos(rad);
                    const ky = 200 + 105 * Math.sin(rad);
                    const nx = 200 + 140 * Math.cos(((k.assignedNode.angle - 90) * Math.PI) / 180);
                    const ny = 200 + 140 * Math.sin(((k.assignedNode.angle - 90) * Math.PI) / 180);

                    return (
                      <g key={k.id}>
                        {/* Assignment vector line */}
                        <line
                          x1={kx}
                          y1={ky}
                          x2={nx}
                          y2={ny}
                          stroke={k.assignedNode.color}
                          strokeWidth="1.5"
                          strokeDasharray="2 3"
                          opacity="0.6"
                        />
                        <circle
                          cx={kx}
                          cy={ky}
                          r="5"
                          fill="#475569"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x={kx}
                          y={ky - 8}
                          fontSize="9"
                          fill="#334155"
                          className="dark:fill-zinc-300 font-mono font-bold"
                          textAnchor="middle"
                        >
                          {k.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {activeNodes.map((n) => (
                  <span
                    key={n.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${n.badgeBg}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: n.color }}
                    />
                    {n.name} ({n.baseAngle}°)
                  </span>
                ))}
              </div>
            </div>

            {/* Key Ownership & Relocation Table */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-sm text-text">
                    Key Ownership &amp; Relocation Table
                  </h3>
                  <span className="text-[11px] text-text-muted font-mono">8 Sample Keys</span>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {keyAssignments.map((k) => (
                    <div
                      key={k.id}
                      className="p-2.5 rounded-lg bg-canvas border border-border flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-text">{k.label}</span>
                        <span className="text-[10px] text-text-muted">({k.angle}°)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted text-[10px]">Routed Clockwise →</span>
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: k.assignedNode.color }}
                        >
                          {k.assignedNode.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg text-xs text-primary-900 leading-relaxed">
                  <strong>Architectural Invariant:</strong> In naive modulo hashing ($hash(k) \pmod N$), adding or removing a node relocates nearly <strong>100%</strong> of cached keys, causing catastrophic cache avalanches. In Consistent Hashing, adding Node D only relocates <strong>$k / N$</strong> keys ($\approx 25\%$), leaving the remaining <strong>$75\%$</strong> of cache entries undisturbed!
                </div>
              </div>
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
    </div>
  );
}
