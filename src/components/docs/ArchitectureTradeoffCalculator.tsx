'use client';

import React, { useState, useEffect, useId, useCallback } from 'react';
import {
  calculateQuorumTradeoff,
  calculateStorageEngineTradeoff,
  calculateDataLayoutTradeoff,
  QuorumSimulationInput,
  StorageEngineInput,
  DataLayoutInput,
} from '../../lib/tradeoff-calculator-data';
import { Button } from '../ui/Button';

interface ArchitectureTradeoffCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'quorum' | 'storage' | 'layout';
}

export const ArchitectureTradeoffCalculator: React.FC<ArchitectureTradeoffCalculatorProps> = ({
  isOpen,
  onClose,
  initialTab = 'quorum',
}) => {
  const [activeTab, setActiveTab] = useState<'quorum' | 'storage' | 'layout'>(initialTab);
  const [copied, setCopied] = useState<boolean>(false);
  const titleId = useId();

  // Tab 1: Quorum State
  const [quorumInput, setQuorumInput] = useState<QuorumSimulationInput>({
    totalNodes: 5,
    readQuorum: 3,
    writeQuorum: 3,
    networkLatencyMs: 15,
    packetLossPct: 1,
  });

  // Tab 2: Storage Engine State
  const [storageInput, setStorageInput] = useState<StorageEngineInput>({
    writeIops: 25000,
    readToWriteRatio: 2.0,
    recordSizeBytes: 512,
    bufferPoolMb: 256,
  });

  // Tab 3: Data Layout State
  const [layoutInput, setLayoutInput] = useState<DataLayoutInput>({
    totalRows: 5000000,
    totalColumns: 40,
    queriedColumns: 4,
    storageBandwidthMBps: 2500,
    avgBytesPerColumn: 8,
  });

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculations
  const quorumResult = calculateQuorumTradeoff(quorumInput);
  const storageResult = calculateStorageEngineTradeoff(storageInput);
  const layoutResult = calculateDataLayoutTradeoff(layoutInput);

  const handleCopySummary = useCallback(async () => {
    let summaryText = '';
    if (activeTab === 'quorum') {
      summaryText = `### Distributed Quorum Analysis
- Total Replicas (N): ${quorumInput.totalNodes} | Read Quorum (R): ${quorumInput.readQuorum} | Write Quorum (W): ${quorumInput.writeQuorum}
- Consistency: ${quorumResult.consistencyLevel} (R + W = ${quorumInput.readQuorum + quorumInput.writeQuorum} vs N = ${quorumInput.totalNodes})
- Read Latency: ${quorumResult.readLatencyMs} ms | Write Latency: ${quorumResult.writeLatencyMs} ms
- Tolerable Failures: ${quorumResult.tolerableNodeFailures} nodes | Stale Read Risk: ${quorumResult.staleReadProbabilityPct}%
- Recommendation: ${quorumResult.recommendation}`;
    } else if (activeTab === 'storage') {
      summaryText = `### Storage Engine Trade-Off Analysis (LSM vs B+ Tree)
- Workload: ${storageInput.writeIops.toLocaleString()} Write IOPS, R:W Ratio ${storageInput.readToWriteRatio}:1, Record Size ${storageInput.recordSizeBytes}B, RAM Buffer ${storageInput.bufferPoolMb}MB
- Preferred Engine: ${storageResult.preferredEngine}
- LSM-Tree: WAF ${storageResult.lsmWaf}x, RAF ${storageResult.lsmRaf}x, Disk Write ${storageResult.lsmDiskWriteThroughputMBps} MB/s
- B+ Tree: WAF ${storageResult.bTreeWaf}x, RAF ${storageResult.bTreeRaf}x, Disk Write ${storageResult.bTreeDiskWriteThroughputMBps} MB/s
- Architecture Rationale: ${storageResult.rationale}`;
    } else {
      summaryText = `### Data Layout Scan Analysis (Columnar vs Row)
- Dataset: ${layoutInput.totalRows.toLocaleString()} rows, ${layoutInput.totalColumns} total columns, ${layoutInput.queriedColumns} queried columns
- Row-Oriented Scan: ${layoutResult.rowScanBytesMB.toLocaleString()} MB scanned in ${layoutResult.rowScanDurationMs} ms
- Columnar Vector Scan: ${layoutResult.columnarScanBytesMB.toLocaleString()} MB scanned in ${layoutResult.columnarScanDurationMs} ms
- Analytical Speedup: ${layoutResult.speedupFactor}x (${layoutResult.ioReductionPct}% I/O reduced)
- Architectural Verdict: ${layoutResult.verdict}`;
    }

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [activeTab, quorumInput, quorumResult, storageInput, storageResult, layoutInput, layoutResult]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" aria-hidden="true">⚖️</span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-white tracking-tight">
                Architecture Decision Visualizer
              </h2>
              <p className="text-xs text-slate-400">
                Interactive trade-off mathematical calculators for high-scale distributed systems & storage engines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close trade-off calculator"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 pt-3 space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('quorum')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'quorum'
                ? 'border-cyan-400 text-cyan-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span>🌐</span>
            <span>Replication Quorum (R + W &gt; N)</span>
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'storage'
                ? 'border-indigo-400 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span>💾</span>
            <span>Storage Engine (LSM vs B+ Tree)</span>
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-colors border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'layout'
                ? 'border-emerald-400 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <span>📊</span>
            <span>Data Layout (Columnar vs Row)</span>
          </button>
        </div>

        {/* Main Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* TAB 1: REPLICATION QUORUM */}
          {activeTab === 'quorum' && (
            <div className="space-y-6">
              {/* Formula & Status Header */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  quorumResult.isStrongConsistency
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                }`}
              >
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
                    Consistency Guarantee Formula
                  </div>
                  <div className="text-base font-bold font-mono mt-0.5">
                    R + W = {quorumInput.readQuorum} + {quorumInput.writeQuorum} ={' '}
                    <span className="underline decoration-2">
                      {quorumInput.readQuorum + quorumInput.writeQuorum}
                    </span>{' '}
                    {quorumResult.isStrongConsistency ? '>' : '≤'} N ({quorumInput.totalNodes})
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      quorumResult.isStrongConsistency
                        ? 'bg-emerald-900/50 border-emerald-500 text-emerald-200'
                        : 'bg-amber-900/50 border-amber-500 text-amber-200'
                    }`}
                  >
                    {quorumResult.consistencyLevel}
                  </span>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
                {/* Total Nodes N */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="quorum-total-nodes">Total Replica Nodes (N)</label>
                    <span className="font-mono text-cyan-400">{quorumInput.totalNodes}</span>
                  </div>
                  <input
                    id="quorum-total-nodes"
                    type="range"
                    min={3}
                    max={9}
                    step={2}
                    value={quorumInput.totalNodes}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      setQuorumInput((prev) => ({
                        ...prev,
                        totalNodes: n,
                        readQuorum: Math.min(prev.readQuorum, n),
                        writeQuorum: Math.min(prev.writeQuorum, n),
                      }));
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>3 nodes</span>
                    <span>5 nodes</span>
                    <span>7 nodes</span>
                    <span>9 nodes</span>
                  </div>
                </div>

                {/* Read Quorum R */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="quorum-read-nodes">Read Quorum (R)</label>
                    <span className="font-mono text-cyan-400">{quorumInput.readQuorum}</span>
                  </div>
                  <input
                    id="quorum-read-nodes"
                    type="range"
                    min={1}
                    max={quorumInput.totalNodes}
                    step={1}
                    value={quorumInput.readQuorum}
                    onChange={(e) =>
                      setQuorumInput((prev) => ({
                        ...prev,
                        readQuorum: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1</span>
                    <span>{Math.ceil(quorumInput.totalNodes / 2)} (Majority)</span>
                    <span>{quorumInput.totalNodes} (All)</span>
                  </div>
                </div>

                {/* Write Quorum W */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="quorum-write-nodes">Write Quorum (W)</label>
                    <span className="font-mono text-cyan-400">{quorumInput.writeQuorum}</span>
                  </div>
                  <input
                    id="quorum-write-nodes"
                    type="range"
                    min={1}
                    max={quorumInput.totalNodes}
                    step={1}
                    value={quorumInput.writeQuorum}
                    onChange={(e) =>
                      setQuorumInput((prev) => ({
                        ...prev,
                        writeQuorum: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1</span>
                    <span>{Math.ceil(quorumInput.totalNodes / 2)} (Majority)</span>
                    <span>{quorumInput.totalNodes} (All)</span>
                  </div>
                </div>

                {/* Network One-Way Latency */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="quorum-latency">Network Latency (One-Way)</label>
                    <span className="font-mono text-cyan-400">{quorumInput.networkLatencyMs} ms</span>
                  </div>
                  <input
                    id="quorum-latency"
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={quorumInput.networkLatencyMs}
                    onChange={(e) =>
                      setQuorumInput((prev) => ({
                        ...prev,
                        networkLatencyMs: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>5 ms (LAN)</span>
                    <span>30 ms (Cross-Zone)</span>
                    <span>100 ms (Cross-Region)</span>
                  </div>
                </div>
              </div>

              {/* Telemetry Output Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium">Read Latency (RTT)</div>
                  <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                    {quorumResult.readLatencyMs} <span className="text-xs text-slate-400">ms</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Waits for {quorumInput.readQuorum} replica ACK</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium">Write Latency (RTT)</div>
                  <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                    {quorumResult.writeLatencyMs} <span className="text-xs text-slate-400">ms</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Waits for {quorumInput.writeQuorum} replica ACK</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium">Fault Tolerance</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {quorumResult.tolerableNodeFailures} <span className="text-xs text-slate-400">nodes</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Nodes can crash safely</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-[11px] text-slate-400 font-medium">Stale Read Risk</div>
                  <div
                    className={`text-xl font-bold font-mono mt-1 ${
                      quorumResult.staleReadProbabilityPct === 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {quorumResult.staleReadProbabilityPct}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {quorumResult.staleReadProbabilityPct === 0 ? 'Zero stale reads' : 'Split-brain window'}
                  </div>
                </div>
              </div>

              {/* Architectural Recommendation & Bottleneck */}
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Architectural Assessment:
                  </span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{quorumResult.recommendation}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
                    Primary Operational Bottleneck:
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{quorumResult.bottleneck}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORAGE ENGINE (LSM vs B+ TREE) */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              {/* Preferred Engine Banner */}
              <div className="p-4 rounded-xl border border-indigo-500/40 bg-indigo-950/30 text-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-indigo-400">
                    Engine Recommendation
                  </div>
                  <div className="text-lg font-bold mt-0.5 text-white">
                    Optimal Architecture: <span className="text-indigo-400">{storageResult.preferredEngine}</span>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-900/60 border border-indigo-400 text-indigo-200">
                  {storageInput.readToWriteRatio < 3.0 ? 'Write-Heavy Workload' : 'Read-Heavy Workload'}
                </span>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
                {/* Write IOPS */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="storage-write-iops">Target Write IOPS</label>
                    <span className="font-mono text-indigo-400">{storageInput.writeIops.toLocaleString()} ops/s</span>
                  </div>
                  <input
                    id="storage-write-iops"
                    type="range"
                    min={1000}
                    max={100000}
                    step={1000}
                    value={storageInput.writeIops}
                    onChange={(e) =>
                      setStorageInput((prev) => ({
                        ...prev,
                        writeIops: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1,000</span>
                    <span>50,000</span>
                    <span>100,000</span>
                  </div>
                </div>

                {/* Read to Write Ratio */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="storage-rw-ratio">Read-to-Write Ratio</label>
                    <span className="font-mono text-indigo-400">{storageInput.readToWriteRatio}:1</span>
                  </div>
                  <input
                    id="storage-rw-ratio"
                    type="range"
                    min={0.1}
                    max={15.0}
                    step={0.1}
                    value={storageInput.readToWriteRatio}
                    onChange={(e) =>
                      setStorageInput((prev) => ({
                        ...prev,
                        readToWriteRatio: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.1:1 (Write heavy)</span>
                    <span>2.0:1 (Balanced)</span>
                    <span>15.0:1 (Read heavy)</span>
                  </div>
                </div>

                {/* Record Size */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="storage-record-size">Record Size</label>
                    <span className="font-mono text-indigo-400">{storageInput.recordSizeBytes} bytes</span>
                  </div>
                  <input
                    id="storage-record-size"
                    type="range"
                    min={128}
                    max={4096}
                    step={128}
                    value={storageInput.recordSizeBytes}
                    onChange={(e) =>
                      setStorageInput((prev) => ({
                        ...prev,
                        recordSizeBytes: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>128B (Metrics)</span>
                    <span>512B (Standard)</span>
                    <span>4096B (Document)</span>
                  </div>
                </div>

                {/* Buffer Pool / RAM */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="storage-ram-buffer">RAM Buffer Size</label>
                    <span className="font-mono text-indigo-400">{storageInput.bufferPoolMb} MB</span>
                  </div>
                  <input
                    id="storage-ram-buffer"
                    type="range"
                    min={64}
                    max={2048}
                    step={64}
                    value={storageInput.bufferPoolMb}
                    onChange={(e) =>
                      setStorageInput((prev) => ({
                        ...prev,
                        bufferPoolMb: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>64 MB</span>
                    <span>512 MB</span>
                    <span>2048 MB</span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LSM Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    storageResult.preferredEngine === 'LSM-Tree'
                      ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">LSM-Tree (Log-Structured Merge)</h3>
                    {storageResult.preferredEngine === 'LSM-Tree' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        WINNER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Append-only WAL + immutable SSTables with tiered compactions</p>

                  <div className="mt-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Write Amplification (WAF):</span>
                      <span className="font-bold text-indigo-300">{storageResult.lsmWaf}x</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Read Amplification (RAF):</span>
                      <span className="font-bold text-amber-300">{storageResult.lsmRaf}x (Bloom Filtered)</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Disk Write Throughput:</span>
                      <span className="font-bold text-cyan-300">{storageResult.lsmDiskWriteThroughputMBps} MB/s</span>
                    </div>
                  </div>
                </div>

                {/* B+ Tree Card */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    storageResult.preferredEngine === 'B+ Tree'
                      ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">B+ Tree (In-Place Updates)</h3>
                    {storageResult.preferredEngine === 'B+ Tree' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        WINNER
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Balanced multi-way search tree with slotted disk pages & buffer cache</p>

                  <div className="mt-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Write Amplification (WAF):</span>
                      <span className="font-bold text-rose-300">{storageResult.bTreeWaf}x (Random Pages)</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Read Amplification (RAF):</span>
                      <span className="font-bold text-emerald-300">{storageResult.bTreeRaf}x (O(1) Cached)</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Disk Write Throughput:</span>
                      <span className="font-bold text-cyan-300">{storageResult.bTreeDiskWriteThroughputMBps} MB/s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Workload Sizing Rationale:
                </span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{storageResult.rationale}</p>
                {storageResult.compactionOverheadWarning && (
                  <p className="text-xs text-amber-300 mt-2 flex items-center space-x-1.5">
                    <span>⚠️</span>
                    <span>Compaction write stalls may occur at current throughput without background thread isolation.</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DATA LAYOUT (COLUMNAR VS ROW) */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              {/* Speedup Banner */}
              <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-emerald-400">
                    Analytical Scan Speedup
                  </div>
                  <div className="text-2xl font-bold mt-0.5 text-white">
                    <span className="text-emerald-400">{layoutResult.speedupFactor}x Faster</span> Scan Throughput
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-900/60 border border-emerald-400 text-emerald-200">
                  {layoutResult.ioReductionPct}% I/O Eliminated
                </span>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/40 p-5 rounded-xl border border-slate-800">
                {/* Total Rows */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="layout-rows">Total Dataset Rows</label>
                    <span className="font-mono text-emerald-400">{layoutInput.totalRows.toLocaleString()}</span>
                  </div>
                  <input
                    id="layout-rows"
                    type="range"
                    min={500000}
                    max={20000000}
                    step={500000}
                    value={layoutInput.totalRows}
                    onChange={(e) =>
                      setLayoutInput((prev) => ({
                        ...prev,
                        totalRows: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>500k rows</span>
                    <span>10M rows</span>
                    <span>20M rows</span>
                  </div>
                </div>

                {/* Total Table Columns */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="layout-total-cols">Total Schema Columns</label>
                    <span className="font-mono text-emerald-400">{layoutInput.totalColumns} columns</span>
                  </div>
                  <input
                    id="layout-total-cols"
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={layoutInput.totalColumns}
                    onChange={(e) => {
                      const total = parseInt(e.target.value, 10);
                      setLayoutInput((prev) => ({
                        ...prev,
                        totalColumns: total,
                        queriedColumns: Math.min(prev.queriedColumns, total),
                      }));
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>5 cols</span>
                    <span>50 cols</span>
                    <span>100 cols</span>
                  </div>
                </div>

                {/* Queried Columns */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="layout-queried-cols">Queried / Projected Columns</label>
                    <span className="font-mono text-emerald-400">{layoutInput.queriedColumns} columns</span>
                  </div>
                  <input
                    id="layout-queried-cols"
                    type="range"
                    min={1}
                    max={layoutInput.totalColumns}
                    step={1}
                    value={layoutInput.queriedColumns}
                    onChange={(e) =>
                      setLayoutInput((prev) => ({
                        ...prev,
                        queriedColumns: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 column (Agg)</span>
                    <span>{Math.round(layoutInput.totalColumns / 2)} cols</span>
                    <span>{layoutInput.totalColumns} (Full scan)</span>
                  </div>
                </div>

                {/* Storage NVMe Bandwidth */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <label htmlFor="layout-bandwidth">Storage Read Bandwidth</label>
                    <span className="font-mono text-emerald-400">{layoutInput.storageBandwidthMBps} MB/s</span>
                  </div>
                  <input
                    id="layout-bandwidth"
                    type="range"
                    min={500}
                    max={5000}
                    step={250}
                    value={layoutInput.storageBandwidthMBps}
                    onChange={(e) =>
                      setLayoutInput((prev) => ({
                        ...prev,
                        storageBandwidthMBps: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>500 MB/s (SATA)</span>
                    <span>2500 MB/s (NVMe)</span>
                    <span>5000 MB/s (PCIe 4.0)</span>
                  </div>
                </div>
              </div>

              {/* Data Layout Metrics Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">Row-Oriented (Slotted Page)</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      OLTP Default
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Reads full records (all {layoutInput.totalColumns} columns) sequentially</p>

                  <div className="mt-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Total I/O Scanned:</span>
                      <span className="font-bold text-rose-300">{layoutResult.rowScanBytesMB.toLocaleString()} MB</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Scan Duration:</span>
                      <span className="font-bold text-amber-300">{layoutResult.rowScanDurationMs} ms</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500 ring-1 ring-emerald-500/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base">Columnar (Parquet / Arrow)</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      OLAP WINNER
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Reads only {layoutInput.queriedColumns} projected column vectors + Dictionary compression</p>

                  <div className="mt-4 space-y-2 font-mono text-xs">
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Total I/O Scanned:</span>
                      <span className="font-bold text-emerald-300">{layoutResult.columnarScanBytesMB.toLocaleString()} MB</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-slate-950/60">
                      <span className="text-slate-400">Scan Duration:</span>
                      <span className="font-bold text-cyan-300">{layoutResult.columnarScanDurationMs} ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout Verdict */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                  Hardware Bus Transfer Verdict:
                </span>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{layoutResult.verdict}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400">
            {activeTab === 'quorum' && 'Replication Quorum Model'}
            {activeTab === 'storage' && 'Storage Engine WAF/RAF Model'}
            {activeTab === 'layout' && 'Vectorized Columnar Model'}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopySummary}
              className="text-xs"
            >
              {copied ? '✓ Copied Markdown' : '📋 Copy Analysis'}
            </Button>
            <Button variant="primary" size="sm" onClick={onClose} className="text-xs">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
