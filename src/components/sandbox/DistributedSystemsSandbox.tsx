'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export type DistributedMode = 'CONSISTENT_HASHING' | 'RATE_LIMITER' | 'CIRCUIT_BREAKER';

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
  const [swPrevCount, setSwPrevCount] = useState(6);
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

        <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-lg border border-border">
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
              <p className="text-xs text-text-muted">
                Add nodes or increase virtual replicas to distribute keys uniformly across the 32-bit hash continuum.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={includeNodeD ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setIncludeNodeD((prev) => !prev)}
              >
                {includeNodeD ? '✓ Node D Active (Scale Out)' : '+ Scale Out: Add Node D'}
              </Button>

              <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border text-xs">
                <span className="text-text-muted px-1.5">VNodes:</span>
                {[1, 2, 3].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVnodesMultiplier(v as 1 | 2 | 3)}
                    className={`px-2 py-0.5 rounded font-mono font-bold cursor-pointer ${
                      vnodesMultiplier === v
                        ? 'bg-primary-700 text-white'
                        : 'text-text-muted hover:text-text'
                    }`}
                  >
                    {v}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visualization Stage & Routing Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SVG Circular Ring */}
            <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col items-center justify-center relative">
              <div className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Circular Hash Space (0&deg; to 360&deg; / 2&sup3;&sup2; - 1)
              </div>

              <svg viewBox="0 0 360 360" className="w-72 h-72">
                {/* Outer Ring */}
                <circle cx="180" cy="180" r="130" fill="none" stroke="currentColor" className="text-border" strokeWidth="4" />
                <circle cx="180" cy="180" r="130" fill="none" stroke="currentColor" className="text-primary-400/40" strokeWidth="1" strokeDasharray="4 4" />

                {/* Ring Degree Markers */}
                <text x="180" y="38" textAnchor="middle" className="text-[10px] fill-text-muted font-mono">0&deg; / 2&sup3;&sup2;</text>
                <text x="325" y="184" textAnchor="start" className="text-[10px] fill-text-muted font-mono">90&deg;</text>
                <text x="180" y="330" textAnchor="middle" className="text-[10px] fill-text-muted font-mono">180&deg;</text>
                <text x="35" y="184" textAnchor="end" className="text-[10px] fill-text-muted font-mono">270&deg;</text>

                {/* Nodes on Ring */}
                {ringPoints.map((node) => {
                  const rad = (node.angle - 90) * (Math.PI / 180);
                  const nx = 180 + 130 * Math.cos(rad);
                  const ny = 180 + 130 * Math.sin(rad);

                  return (
                    <g key={node.id} className="cursor-pointer">
                      <circle
                        cx={nx}
                        cy={ny}
                        r={node.isVirtual ? '8' : '12'}
                        fill={node.color}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all"
                      />
                      <text
                        x={nx}
                        y={ny + (node.angle > 90 && node.angle < 270 ? 20 : -14)}
                        textAnchor="middle"
                        className="text-[10px] font-bold font-mono fill-text"
                      >
                        {node.name} ({node.angle}&deg;)
                      </text>
                    </g>
                  );
                })}

                {/* Cache Keys on Ring */}
                {keyAssignments.map((k) => {
                  const rad = (k.angle - 90) * (Math.PI / 180);
                  const kx = 180 + 130 * Math.cos(rad);
                  const ky = 180 + 130 * Math.sin(rad);

                  return (
                    <g key={k.id}>
                      <circle
                        cx={kx}
                        cy={ky}
                        r="5"
                        fill="#4f46e5"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={kx}
                        y={ky + 14}
                        textAnchor="middle"
                        className="text-[8px] font-mono fill-primary-700 font-semibold"
                      >
                        {k.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="text-[11px] text-text-muted text-center mt-2">
                Clockwise Traversal: Keys route to the first node encountered with angle &ge; key angle.
              </div>
            </div>

            {/* Key Partition Routing Table */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text">
                  Key Ownership &amp; Relocation Table
                </span>
                <span className="text-[10px] font-mono text-text-muted">
                  {keyAssignments.length} Keys Partitioned
                </span>
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {keyAssignments.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-canvas border border-border text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary-600" />
                      <span className="font-bold text-text">{k.label}</span>
                      <span className="text-[10px] text-text-muted">({k.angle}&deg;)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-text-muted">&rarr;</span>
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
                  <div className="space-y-1.5">
                    {tbLog.map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-center justify-between p-2 rounded text-xs font-mono border ${
                          log.status === 'ALLOW'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <span className="font-bold">
                          {log.status === 'ALLOW' ? 'HTTP 200 OK — Request Processed' : 'HTTP 429 — Rate Limit Exceeded'}
                        </span>
                        <span className="text-[10px] opacity-75">{log.time}</span>
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
                      {idx < lbQueue.length ? `Req #${idx + 1}` : ''}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span>Queued: <strong className="text-sky-700 text-sm">{lbQueue.length} / {lbCapacity}</strong></span>
                  <span>Egress Leak: <strong className="text-primary-700">2 req / tick</strong></span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="primary" size="sm" onClick={() => handleLbRequest(1)}>
                    Enqueue 1 Request
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleLbRequest(4)}>
                    Burst: 4 Requests
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleLbLeak}>
                    Process Leak Tick (-2)
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setLbQueue([])}>
                    Clear Queue
                  </Button>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text">
                    Leaky Bucket Queue Stream
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">Smooth Constant Egress</span>
                </div>

                {lbLog.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-muted italic">
                    Queue requests to observe smooth constant leak rate.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {lbLog.map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-center justify-between p-2 rounded text-xs font-mono border ${
                          log.status === 'QUEUED'
                            ? 'bg-sky-50 border-sky-300 text-sky-900'
                            : 'bg-rose-50 border-rose-300 text-rose-900'
                        }`}
                      >
                        <span className="font-bold">
                          {log.status === 'QUEUED' ? '✓ Request Queued in Buffer' : '⚠️ HTTP 429 — Buffer Full (Dropped)'}
                        </span>
                        <span className="text-[10px] opacity-75">{log.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TYPE C: SLIDING WINDOW COUNTER */}
          {rateLimiterType === 'SLIDING_WINDOW' && (
            <div className="bg-canvas border border-border rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Sliding Window Approximation (Window: 60s, Limit: 10 Requests)
                </div>
                <div className="text-xs font-mono">
                  Elapsed: <strong className="text-primary-700">{swElapsedSeconds}s / 60s</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 bg-surface rounded-lg border border-border">
                  <div className="text-text-muted">Previous Window Requests:</div>
                  <div className="text-lg font-bold text-text mt-1">{swPrevCount}</div>
                </div>
                <div className="p-3 bg-surface rounded-lg border border-border">
                  <div className="text-text-muted">Current Window Requests:</div>
                  <div className="text-lg font-bold text-text mt-1">{swCurrentCount}</div>
                </div>
                <div className="p-3 bg-surface rounded-lg border border-border">
                  <div className="text-text-muted">Calculated Rolling Requests:</div>
                  <div className={`text-lg font-bold mt-1 ${swEstimatedCount >= swLimit ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {swEstimatedCount} / {swLimit}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-surface rounded-lg border border-border text-xs leading-relaxed space-y-2">
                <div className="font-bold text-text uppercase tracking-wider">Formula Execution:</div>
                <div className="font-mono bg-canvas p-2 rounded border border-border">
                  Estimated = {swCurrentCount} + ({swPrevCount} &times; (60 - {swElapsedSeconds})/60) = {swCurrentCount} + {(swPrevCount * swWeight).toFixed(1)} = <strong>{swEstimatedCount}</strong>
                </div>
                <p className="text-text-muted">
                  Unlike Fixed Window Counter which permits 2x traffic bursts across boundary borders (e.g. 10 at 00:59, 10 at 01:01 = 20 req in 2 seconds), Sliding Window Counter smooths burst windows with low memory overhead.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="primary" size="sm" onClick={handleSwRequest} disabled={swEstimatedCount >= swLimit}>
                  Send Request ({swEstimatedCount >= swLimit ? 'Throttled' : 'Allowed'})
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSwElapsedSeconds((prev) => (prev + 15 > 60 ? 15 : prev + 15))}
                >
                  Advance Time (+15s)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSwCurrentCount(0);
                    setSwPrevCount(4);
                    setSwElapsedSeconds(0);
                  }}
                >
                  Reset Window
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE 3: CIRCUIT BREAKER STATE MACHINE */}
      {activeTab === 'CIRCUIT_BREAKER' && (
        <div className="p-6 space-y-6">
          {/* State Visualization Nodes */}
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
                {cbState === 'OPEN' && <span className="animate-pulse">● ACTIVE</span>}
              </div>
              <p className="text-xs text-text-muted">
                Tripped! Upstream calls fast-fail immediately with cached fallback. Cooldown timer active.
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
                {cbState === 'HALF_OPEN' && <span className="animate-pulse">● ACTIVE</span>}
              </div>
              <p className="text-xs text-text-muted">
                Trial state. Probes allowed through. 2 consecutive successes reset circuit to CLOSED.
              </p>
            </div>
          </div>

          {/* Metrics & History Bar */}
          <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div>
                Rolling Failure Rate:{' '}
                <strong className={cbFailureRate >= 50 ? 'text-rose-600' : 'text-emerald-600'}>
                  {cbFailureRate}% ({cbFailureCount} / {cbHistory.length} errors)
                </strong>{' '}
                <span className="text-text-muted">[Threshold: 50%]</span>
              </div>

              {cbState === 'OPEN' && (
                <div className="text-rose-700 font-bold">
                  Cooldown Remaining: {cbCooldown} tick(s)
                </div>
              )}

              {cbState === 'HALF_OPEN' && (
                <div className="text-amber-700 font-bold">
                  Probe Successes: {cbProbeSuccesses} / 2 required
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-text-muted mr-2">History:</span>
              {cbHistory.map((res, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                    res === 'SUCCESS'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
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
    </div>
  );
}
