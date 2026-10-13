'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/Card';
import {
  calculateQuorumTradeoff,
  calculateStorageEngineTradeoff,
  calculateDataLayoutTradeoff,
  QuorumSimulationInput,
  StorageEngineInput,
  DataLayoutInput,
} from '../../lib/tradeoff-calculator-data';

export type TradeoffModule = 'QUORUM' | 'STORAGE_ENGINE' | 'DATA_LAYOUT';

export function ArchitectureTradeoffSandbox() {
  const [activeModule, setActiveModule] = useState<TradeoffModule>('QUORUM');

  // Module 1: Quorum State
  const [quorumInput, setQuorumInput] = useState<QuorumSimulationInput>({
    totalNodes: 5,
    readQuorum: 3,
    writeQuorum: 3,
    networkLatencyMs: 15,
    packetLossPct: 1,
  });

  // Module 2: Storage Engine State
  const [storageInput, setStorageInput] = useState<StorageEngineInput>({
    writeIops: 25000,
    readToWriteRatio: 2.0,
    recordSizeBytes: 512,
    bufferPoolMb: 256,
  });

  // Module 3: Data Layout State
  const [layoutInput, setLayoutInput] = useState<DataLayoutInput>({
    totalRows: 5000000,
    totalColumns: 40,
    queriedColumns: 4,
    storageBandwidthMBps: 2500,
    avgBytesPerColumn: 8,
  });

  // Calculated Results
  const quorumResult = useMemo(
    () => calculateQuorumTradeoff(quorumInput),
    [quorumInput],
  );

  const storageResult = useMemo(
    () => calculateStorageEngineTradeoff(storageInput),
    [storageInput],
  );

  const layoutResult = useMemo(
    () => calculateDataLayoutTradeoff(layoutInput),
    [layoutInput],
  );

  return (
    <Card className="border border-border bg-surface shadow-xs">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2.5 py-0.5 rounded border border-accent-200">
                ⚖️ Architecture &amp; Storage
              </span>
              <span className="text-xs font-mono bg-surface-muted text-text-muted px-2 py-0.5 rounded border border-border">
                {activeModule === 'QUORUM'
                  ? 'Quorum & Consistency (CAP / PACELC)'
                  : activeModule === 'STORAGE_ENGINE'
                  ? 'Storage Engine Internals (B+ Tree vs LSM)'
                  : 'Analytical Data Layout (OLTP vs OLAP)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary-900 tracking-tight">
              Systems Architecture &amp; Storage Trade-Off Laboratory
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-3xl leading-relaxed">
              Evaluate real physical and algorithmic trade-offs: compute quorum overlap and stale read probabilities,
              calculate B+ Tree dirty page amplification vs LSM compaction debt, and quantify columnar I/O bandwidth savings.
            </p>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-muted p-1.5 rounded-xl border border-border shrink-0 self-start sm:self-auto">
            {[
              { id: 'QUORUM' as TradeoffModule, label: '1. Quorum & Consistency' },
              { id: 'STORAGE_ENGINE' as TradeoffModule, label: '2. B+ Tree vs LSM' },
              { id: 'DATA_LAYOUT' as TradeoffModule, label: '3. Row vs Columnar' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveModule(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeModule === tab.id
                    ? 'bg-primary-900 text-white shadow-xs'
                    : 'text-text-muted hover:text-text hover:bg-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ----------------- MODULE 1: QUORUM & CONSISTENCY ----------------- */}
        {activeModule === 'QUORUM' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Controls */}
              <div className="lg:col-span-5 bg-surface-muted border border-border rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                  Quorum Parameters (N, R, W)
                </h3>

                {/* Total Nodes N */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Total Replica Nodes (N):</span>
                    <span className="font-mono font-bold text-primary-800">{quorumInput.totalNodes} Nodes</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 7, 9].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          setQuorumInput((prev) => ({
                            ...prev,
                            totalNodes: n,
                            readQuorum: Math.min(prev.readQuorum, n),
                            writeQuorum: Math.min(prev.writeQuorum, n),
                          }))
                        }
                        className={`py-1.5 rounded text-xs font-bold border transition-colors ${
                          quorumInput.totalNodes === n
                            ? 'bg-primary-900 text-white border-primary-900 shadow-xs'
                            : 'bg-surface border-border text-text-muted hover:text-text'
                        }`}
                      >
                        N = {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Read Quorum R */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Read Quorum Acknowledgements (R):</span>
                    <span className="font-mono font-bold text-sky-800">R = {quorumInput.readQuorum}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={quorumInput.totalNodes}
                    value={quorumInput.readQuorum}
                    onChange={(e) =>
                      setQuorumInput((prev) => ({ ...prev, readQuorum: Number(e.target.value) }))
                    }
                    className="w-full accent-sky-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>1 (Fast, Stale)</span>
                    <span>Majority ({Math.floor(quorumInput.totalNodes / 2) + 1})</span>
                    <span>All ({quorumInput.totalNodes})</span>
                  </div>
                </div>

                {/* Write Quorum W */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Write Quorum Acknowledgements (W):</span>
                    <span className="font-mono font-bold text-emerald-800">W = {quorumInput.writeQuorum}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={quorumInput.totalNodes}
                    value={quorumInput.writeQuorum}
                    onChange={(e) =>
                      setQuorumInput((prev) => ({ ...prev, writeQuorum: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>1 (Async, Fragile)</span>
                    <span>Majority ({Math.floor(quorumInput.totalNodes / 2) + 1})</span>
                    <span>All ({quorumInput.totalNodes})</span>
                  </div>
                </div>

                {/* Network Latency */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">One-Way Network Latency:</span>
                    <span className="font-mono font-bold text-text">{quorumInput.networkLatencyMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={quorumInput.networkLatencyMs}
                    onChange={(e) =>
                      setQuorumInput((prev) => ({ ...prev, networkLatencyMs: Number(e.target.value) }))
                    }
                    className="w-full accent-primary-700 cursor-pointer"
                  />
                </div>

                {/* Packet Loss */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Network Packet Loss:</span>
                    <span className="font-mono font-bold text-rose-700">{quorumInput.packetLossPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={0.5}
                    value={quorumInput.packetLossPct}
                    onChange={(e) =>
                      setQuorumInput((prev) => ({ ...prev, packetLossPct: Number(e.target.value) }))
                    }
                    className="w-full accent-rose-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Evaluation & Metrics */}
              <div className="lg:col-span-7 space-y-4">
                {/* Overlap Equation Banner */}
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    quorumResult.isStrongConsistency
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Overlap Condition: R + W &gt; N
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded font-mono ${
                        quorumResult.isStrongConsistency
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {quorumResult.isStrongConsistency ? '✓ Strict Quorum' : '✗ Weak / Eventual Quorum'}
                    </span>
                  </div>
                  <div className="font-mono text-base font-bold">
                    {quorumInput.readQuorum} (R) + {quorumInput.writeQuorum} (W) ={' '}
                    {quorumInput.readQuorum + quorumInput.writeQuorum}{' '}
                    {quorumResult.isStrongConsistency ? '>' : '<='} {quorumInput.totalNodes} (N)
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    {quorumResult.isStrongConsistency
                      ? 'Guaranteed intersection of read and write sets. At least one replica in any read quorum is guaranteed to contain the latest committed write.'
                      : `Deficit detected (${quorumInput.totalNodes - (quorumInput.readQuorum + quorumInput.writeQuorum) + 1} node overlap gap). A read quorum may entirely miss the node holding the newest mutation.`}
                  </p>
                </div>

                {/* Telemetry Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-surface border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Consistency
                    </span>
                    <span className="text-xs font-bold text-primary-900 block leading-tight">
                      {quorumResult.consistencyLevel.split(' ')[0]}
                    </span>
                  </div>

                  <div className="p-3 bg-surface border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Read Latency
                    </span>
                    <span className="text-sm font-bold font-mono text-sky-800">
                      {quorumResult.readLatencyMs} ms
                    </span>
                  </div>

                  <div className="p-3 bg-surface border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Write Latency
                    </span>
                    <span className="text-sm font-bold font-mono text-emerald-800">
                      {quorumResult.writeLatencyMs} ms
                    </span>
                  </div>

                  <div className="p-3 bg-surface border border-border rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Tolerable Node Crashes
                    </span>
                    <span className="text-sm font-bold font-mono text-text">
                      {quorumResult.tolerableNodeFailures} Nodes
                    </span>
                  </div>
                </div>

                {/* Stale Read Probability (if weak) */}
                {!quorumResult.isStrongConsistency && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-950">
                    <strong className="block">Stale Read Probability: ~{quorumResult.staleReadProbabilityPct}%</strong>
                    <p className="leading-relaxed text-rose-900">
                      Without anti-entropy read-repair or active background gossip, client requests risk reading stale data until full convergence.
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                <div className="p-4 bg-surface rounded-xl border border-border space-y-2 text-xs">
                  <strong className="text-text block font-bold">Senior Architectural Recommendation:</strong>
                  <p className="text-text-muted leading-relaxed">{quorumResult.recommendation}</p>
                  <div className="pt-2 border-t border-border/60 text-amber-800 font-medium">
                    ⚠️ <strong>Primary Bottleneck:</strong> {quorumResult.bottleneck}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MODULE 2: B+ TREE VS LSM-TREE ----------------- */}
        {activeModule === 'STORAGE_ENGINE' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Controls */}
              <div className="lg:col-span-5 bg-surface-muted border border-border rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                  Workload &amp; Buffer Pool Inputs
                </h3>

                {/* Write IOPS */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Write Throughput (IOPS):</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {storageInput.writeIops.toLocaleString()} writes/sec
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={80000}
                    step={1000}
                    value={storageInput.writeIops}
                    onChange={(e) =>
                      setStorageInput((prev) => ({ ...prev, writeIops: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                </div>

                {/* Read to Write Ratio */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Read-to-Write Ratio (R:W):</span>
                    <span className="font-mono font-bold text-primary-800">
                      {storageInput.readToWriteRatio}:1
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={10.0}
                    step={0.2}
                    value={storageInput.readToWriteRatio}
                    onChange={(e) =>
                      setStorageInput((prev) => ({ ...prev, readToWriteRatio: Number(e.target.value) }))
                    }
                    className="w-full accent-primary-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>0.2:1 (Write Heavy)</span>
                    <span>2:1 (Balanced)</span>
                    <span>10:1 (Read Heavy)</span>
                  </div>
                </div>

                {/* Record Size */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Average Record Size:</span>
                    <span className="font-mono font-bold text-text">{storageInput.recordSizeBytes} Bytes</span>
                  </div>
                  <input
                    type="range"
                    min={128}
                    max={4096}
                    step={128}
                    value={storageInput.recordSizeBytes}
                    onChange={(e) =>
                      setStorageInput((prev) => ({ ...prev, recordSizeBytes: Number(e.target.value) }))
                    }
                    className="w-full accent-text cursor-pointer"
                  />
                </div>

                {/* Buffer Pool RAM */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">RAM Buffer Pool / MemTable:</span>
                    <span className="font-mono font-bold text-text">{storageInput.bufferPoolMb} MB</span>
                  </div>
                  <input
                    type="range"
                    min={64}
                    max={1024}
                    step={64}
                    value={storageInput.bufferPoolMb}
                    onChange={(e) =>
                      setStorageInput((prev) => ({ ...prev, bufferPoolMb: Number(e.target.value) }))
                    }
                    className="w-full accent-text cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Evaluation & Engine Comparison */}
              <div className="lg:col-span-7 space-y-4">
                {/* Engine Recommendation Pill */}
                <div className="p-4 rounded-xl border bg-primary-50/70 border-primary-200 text-primary-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-800">
                      Recommended Storage Engine Architecture
                    </span>
                    <span className="text-xs font-extrabold px-3 py-1 rounded bg-primary-900 text-white">
                      {storageResult.preferredEngine} Preferred
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{storageResult.rationale}</p>
                </div>

                {/* Side-by-Side WAF & RAF Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* B+ Tree Card */}
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-bold text-sm text-text">B+ Tree (In-Place Updates)</span>
                      <span className="text-[10px] font-mono text-text-muted">PostgreSQL / InnoDB</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Write Amplification (WAF):</span>
                        <span className="font-mono font-bold text-rose-700">{storageResult.bTreeWaf}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Read Amplification (RAF):</span>
                        <span className="font-mono font-bold text-emerald-700">{storageResult.bTreeRaf}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Disk Write Bandwidth:</span>
                        <span className="font-mono font-bold text-text">
                          {storageResult.bTreeDiskWriteThroughputMBps} MB/s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* LSM-Tree Card */}
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-bold text-sm text-text">LSM-Tree (Append-Only)</span>
                      <span className="text-[10px] font-mono text-text-muted">RocksDB / Cassandra</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Write Amplification (WAF):</span>
                        <span className="font-mono font-bold text-emerald-700">{storageResult.lsmWaf}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Read Amplification (RAF):</span>
                        <span className="font-mono font-bold text-amber-700">{storageResult.lsmRaf}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Disk Write Bandwidth:</span>
                        <span className="font-mono font-bold text-text">
                          {storageResult.lsmDiskWriteThroughputMBps} MB/s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compaction Warning Callout */}
                {storageResult.compactionOverheadWarning && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1">
                    <strong>⚠️ High Compaction Debt Warning:</strong>
                    <p className="leading-relaxed text-amber-900">
                      Heavy write bandwidth ({storageResult.lsmDiskWriteThroughputMBps} MB/s) may induce LSM background compaction stalls, causing write throughput jitter. Ensure tiered leveling with rate-limited compactions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MODULE 3: ROW VS COLUMNAR DATA LAYOUT ----------------- */}
        {activeModule === 'DATA_LAYOUT' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Controls */}
              <div className="lg:col-span-5 bg-surface-muted border border-border rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text">
                  Analytical Query &amp; Schema Width
                </h3>

                {/* Total Rows */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Total Table Rows:</span>
                    <span className="font-mono font-bold text-primary-800">
                      {(layoutInput.totalRows / 1000000).toFixed(1)} Million Rows
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000000}
                    max={30000000}
                    step={1000000}
                    value={layoutInput.totalRows}
                    onChange={(e) =>
                      setLayoutInput((prev) => ({ ...prev, totalRows: Number(e.target.value) }))
                    }
                    className="w-full accent-primary-700 cursor-pointer"
                  />
                </div>

                {/* Total Columns */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Total Columns in Table:</span>
                    <span className="font-mono font-bold text-text">{layoutInput.totalColumns} Columns</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={80}
                    step={5}
                    value={layoutInput.totalColumns}
                    onChange={(e) =>
                      setLayoutInput((prev) => ({
                        ...prev,
                        totalColumns: Number(e.target.value),
                        queriedColumns: Math.min(prev.queriedColumns, Number(e.target.value)),
                      }))
                    }
                    className="w-full accent-text cursor-pointer"
                  />
                </div>

                {/* Queried Columns (Projection) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Queried Columns in Projection:</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {layoutInput.queriedColumns} of {layoutInput.totalColumns} Columns
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={layoutInput.totalColumns}
                    value={layoutInput.queriedColumns}
                    onChange={(e) =>
                      setLayoutInput((prev) => ({ ...prev, queriedColumns: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-text-muted">
                    Projection Ratio: {Math.round((layoutInput.queriedColumns / layoutInput.totalColumns) * 100)}% of row width
                  </div>
                </div>

                {/* Storage NVMe Bandwidth */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">NVMe Storage Bandwidth:</span>
                    <span className="font-mono font-bold text-text">
                      {layoutInput.storageBandwidthMBps} MB/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={7000}
                    step={500}
                    value={layoutInput.storageBandwidthMBps}
                    onChange={(e) =>
                      setLayoutInput((prev) => ({ ...prev, storageBandwidthMBps: Number(e.target.value) }))
                    }
                    className="w-full accent-text cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Evaluation & Scan Comparisons */}
              <div className="lg:col-span-7 space-y-4">
                {/* Speedup Callout */}
                <div className="p-4 rounded-xl border bg-emerald-50/80 border-emerald-300 text-emerald-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Columnar Vectorized Speedup
                    </span>
                    <span className="text-sm font-extrabold font-mono bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded">
                      {layoutResult.speedupFactor}x Faster I/O Scan
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed">{layoutResult.verdict}</p>
                </div>

                {/* Scan Metrics Comparison Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Row Store */}
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                    <div className="border-b border-border pb-2">
                      <span className="font-bold text-sm text-text block">Row-Oriented (OLTP)</span>
                      <span className="text-[11px] text-text-muted">Full tuple row deserialization</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Data Scanned:</span>
                        <span className="font-mono font-bold text-rose-700">
                          {layoutResult.rowScanBytesMB} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Scan Duration:</span>
                        <span className="font-mono font-bold text-rose-700">
                          {layoutResult.rowScanDurationMs} ms
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Columnar Store */}
                  <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                    <div className="border-b border-border pb-2">
                      <span className="font-bold text-sm text-text block">Columnar (OLAP)</span>
                      <span className="text-[11px] text-text-muted">Parquet / ClickHouse / DuckDB</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Data Scanned:</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {layoutResult.columnarScanBytesMB} MB
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Scan Duration:</span>
                        <span className="font-mono font-bold text-emerald-700">
                          {layoutResult.columnarScanDurationMs} ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
