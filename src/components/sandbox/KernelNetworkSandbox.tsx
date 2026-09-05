'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export type KernelNetworkMode = 'CPU_SCHEDULING' | 'PAGE_REPLACEMENT' | 'TCP_CONGESTION';

interface ProcessDef {
  id: string;
  name: string;
  at: number; // arrival time
  bt: number; // burst time
  priority: number; // lower integer = higher priority
  color: string;
}

const PROCESSES: ProcessDef[] = [
  { id: 'p1', name: 'P1', at: 0, bt: 5, priority: 2, color: '#10b981' },
  { id: 'p2', name: 'P2', at: 1, bt: 3, priority: 1, color: '#0284c7' },
  { id: 'p3', name: 'P3', at: 2, bt: 8, priority: 4, color: '#d97706' },
  { id: 'p4', name: 'P4', at: 3, bt: 6, priority: 3, color: '#8b5cf6' },
];

interface GanttSlice {
  pid: string;
  name: string;
  start: number;
  end: number;
  color: string;
}

const SCHEDULING_DATA: Record<
  'RR' | 'SRTF' | 'PRIORITY',
  {
    name: string;
    quantum?: number;
    description: string;
    slices: GanttSlice[];
    metrics: Record<string, { ct: number; tat: number; wt: number }>;
  }
> = {
  RR: {
    name: 'Round Robin (Time Quantum q = 2)',
    quantum: 2,
    description: 'Preemptive, fair-share time slicing. Each active process in the FIFO ready queue receives up to 2 time units before being placed at the tail.',
    slices: [
      { pid: 'p1', name: 'P1', start: 0, end: 2, color: '#10b981' },
      { pid: 'p2', name: 'P2', start: 2, end: 4, color: '#0284c7' },
      { pid: 'p3', name: 'P3', start: 4, end: 6, color: '#d97706' },
      { pid: 'p4', name: 'P4', start: 6, end: 8, color: '#8b5cf6' },
      { pid: 'p1', name: 'P1', start: 8, end: 10, color: '#10b981' },
      { pid: 'p2', name: 'P2', start: 10, end: 11, color: '#0284c7' },
      { pid: 'p3', name: 'P3', start: 11, end: 13, color: '#d97706' },
      { pid: 'p4', name: 'P4', start: 13, end: 15, color: '#8b5cf6' },
      { pid: 'p1', name: 'P1', start: 15, end: 16, color: '#10b981' },
      { pid: 'p3', name: 'P3', start: 16, end: 18, color: '#d97706' },
      { pid: 'p4', name: 'P4', start: 18, end: 20, color: '#8b5cf6' },
      { pid: 'p3', name: 'P3', start: 20, end: 22, color: '#d97706' },
    ],
    metrics: {
      p1: { ct: 16, tat: 16, wt: 11 },
      p2: { ct: 11, tat: 10, wt: 7 },
      p3: { ct: 22, tat: 20, wt: 12 },
      p4: { ct: 20, tat: 17, wt: 11 },
    },
  },
  SRTF: {
    name: 'Shortest Remaining Time First (Preemptive SJF)',
    description: 'Preempts currently running process whenever a newly arrived process requires strictly less remaining CPU burst time. Minimizes average waiting time.',
    slices: [
      { pid: 'p1', name: 'P1', start: 0, end: 1, color: '#10b981' },
      { pid: 'p2', name: 'P2', start: 1, end: 4, color: '#0284c7' },
      { pid: 'p1', name: 'P1', start: 4, end: 8, color: '#10b981' },
      { pid: 'p4', name: 'P4', start: 8, end: 14, color: '#8b5cf6' },
      { pid: 'p3', name: 'P3', start: 14, end: 22, color: '#d97706' },
    ],
    metrics: {
      p1: { ct: 8, tat: 8, wt: 3 },
      p2: { ct: 4, tat: 3, wt: 0 },
      p3: { ct: 22, tat: 20, wt: 12 },
      p4: { ct: 14, tat: 11, wt: 5 },
    },
  },
  PRIORITY: {
    name: 'Preemptive Priority Scheduling (1 = Highest)',
    description: 'The CPU is always allocated to the ready process with the highest priority (lowest integer value). Preempts immediately when higher priority arrives.',
    slices: [
      { pid: 'p1', name: 'P1', start: 0, end: 1, color: '#10b981' },
      { pid: 'p2', name: 'P2', start: 1, end: 4, color: '#0284c7' },
      { pid: 'p1', name: 'P1', start: 4, end: 8, color: '#10b981' },
      { pid: 'p4', name: 'P4', start: 8, end: 14, color: '#8b5cf6' },
      { pid: 'p3', name: 'P3', start: 14, end: 22, color: '#d97706' },
    ],
    metrics: {
      p1: { ct: 8, tat: 8, wt: 3 },
      p2: { ct: 4, tat: 3, wt: 0 },
      p3: { ct: 22, tat: 20, wt: 12 },
      p4: { ct: 14, tat: 11, wt: 5 },
    },
  },
};

// Page replacement reference string
const REF_STRING = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];

export function KernelNetworkSandbox() {
  const [activeTab, setActiveTab] = useState<KernelNetworkMode>('CPU_SCHEDULING');

  // --- Module 1: CPU Scheduling State ---
  const [schedAlgo, setSchedAlgo] = useState<'RR' | 'SRTF' | 'PRIORITY'>('RR');
  const [currentSliceIndex, setCurrentSliceIndex] = useState(0);

  const currentSched = SCHEDULING_DATA[schedAlgo];
  const visibleSlices = currentSched.slices.slice(0, currentSliceIndex + 1);

  // Calculate average TAT & WT
  const metricsList = Object.values(currentSched.metrics);
  const avgTat = (metricsList.reduce((acc, m) => acc + m.tat, 0) / metricsList.length).toFixed(2);
  const avgWt = (metricsList.reduce((acc, m) => acc + m.wt, 0) / metricsList.length).toFixed(2);

  // --- Module 2: Page Replacement State ---
  const [pageAlgo, setPageAlgo] = useState<'FIFO' | 'LRU' | 'OPT'>('FIFO');
  const [frameCount, setFrameCount] = useState<3 | 4>(3);
  const [pageStep, setPageStep] = useState(REF_STRING.length);

  // Compute Page Replacement History
  const computePaging = () => {
    const stepsToRun = REF_STRING.slice(0, pageStep);
    const frames: Array<number | null> = Array(frameCount).fill(null);
    const history: Array<{
      page: number;
      frames: Array<number | null>;
      isFault: boolean;
      evicted: number | null;
    }> = [];

    // Auxiliary tracking for algorithms:
    const fifoQueue: number[] = []; // for FIFO: track insertion order
    const lruAccessTime = new Map<number, number>(); // for LRU: track last accessed index

    for (let i = 0; i < stepsToRun.length; i++) {
      const page = stepsToRun[i];
      const hitIndex = frames.indexOf(page);

      if (hitIndex !== -1) {
        // Page Hit!
        lruAccessTime.set(page, i);
        history.push({
          page,
          frames: [...frames],
          isFault: false,
          evicted: null,
        });
      } else {
        // Page Fault!
        let evicted: number | null = null;
        const emptySlot = frames.indexOf(null);

        if (emptySlot !== -1) {
          // Empty frame available
          frames[emptySlot] = page;
          fifoQueue.push(page);
          lruAccessTime.set(page, i);
        } else {
          // Must replace a victim
          let victimFrameIdx = 0;

          if (pageAlgo === 'FIFO') {
            const victimPage = fifoQueue.shift()!;
            evicted = victimPage;
            victimFrameIdx = frames.indexOf(victimPage);
            fifoQueue.push(page);
          } else if (pageAlgo === 'LRU') {
            // Find frame with minimum last access time
            let minTime = Infinity;
            frames.forEach((f, idx) => {
              if (f !== null) {
                const lastUsed = lruAccessTime.get(f) ?? -1;
                if (lastUsed < minTime) {
                  minTime = lastUsed;
                  victimFrameIdx = idx;
                }
              }
            });
            evicted = frames[victimFrameIdx];
          } else {
            // OPTIMAL: Find page not referenced for longest time in future
            let farthestFuture = -1;
            frames.forEach((f, idx) => {
              if (f !== null) {
                let nextRef = Infinity;
                for (let j = i + 1; j < REF_STRING.length; j++) {
                  if (REF_STRING[j] === f) {
                    nextRef = j;
                    break;
                  }
                }
                if (nextRef > farthestFuture) {
                  farthestFuture = nextRef;
                  victimFrameIdx = idx;
                }
              }
            });
            evicted = frames[victimFrameIdx];
          }

          frames[victimFrameIdx] = page;
          lruAccessTime.set(page, i);
        }

        history.push({
          page,
          frames: [...frames],
          isFault: true,
          evicted,
        });
      }
    }

    const totalFaults = history.filter((h) => h.isFault).length;
    return { history, totalFaults };
  };

  const pagingData = computePaging();

  // --- Module 3: TCP Congestion Control State ---
  const [tcpVariant, setTcpVariant] = useState<'RENO' | 'TAHOE'>('RENO');
  const [tcpRound, setTcpRound] = useState(9); // defaults to loss event round

  // Rounds 1 to 15 data:
  // ssthresh starts at 16. Loss at Round 9 (cwnd was 19).
  // ssthresh drops to floor(19/2) = 9.
  const TCP_SERIES = Array.from({ length: 15 }, (_, idx) => {
    const round = idx + 1;
    let cwnd = 1;
    let state = 'SLOW_START';

    if (round <= 5) {
      cwnd = Math.pow(2, round - 1);
      state = 'SLOW_START';
    } else if (round <= 8) {
      cwnd = 16 + (round - 5);
      state = 'CONGESTION_AVOIDANCE';
    } else if (round === 9) {
      cwnd = 19;
      state = 'LOSS_EVENT_3_DUP_ACK';
    } else {
      // After Loss Event
      if (tcpVariant === 'RENO') {
        // Fast Recovery: ssthresh = 9, cwnd begins linear growth from ssthresh + 1
        cwnd = 9 + (round - 9);
        state = 'CONGESTION_AVOIDANCE';
      } else {
        // Tahoe: Timeout collapse to cwnd = 1, ssthresh = 9
        const afterLossRound = round - 9;
        if (afterLossRound <= 3) {
          cwnd = Math.pow(2, afterLossRound - 1); // 1, 2, 4
          state = 'SLOW_START';
        } else {
          cwnd = 8 + (afterLossRound - 3); // 9, 10
          state = 'CONGESTION_AVOIDANCE';
        }
      }
    }

    return { round, cwnd, state };
  });

  const currentTcpPoint = TCP_SERIES[tcpRound - 1] || TCP_SERIES[0];

  return (
    <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden space-y-6">
      {/* Sub-Header Tabs */}
      <div className="bg-surface-hover/50 border-b border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
              Systems Engineering Studio
            </span>
            <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
              OS Kernel &amp; Networking Protocols
            </span>
          </div>
          <h2 className="text-lg font-bold text-text mt-0.5">
            CPU Scheduling Gantt, Virtual Memory Paging &amp; TCP Congestion Dynamics
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('CPU_SCHEDULING')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'CPU_SCHEDULING'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            CPU Gantt Scheduling
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PAGE_REPLACEMENT')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'PAGE_REPLACEMENT'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Virtual Memory Paging
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TCP_CONGESTION')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'TCP_CONGESTION'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            TCP Congestion (cwnd)
          </button>
        </div>
      </div>

      {/* MODULE 1: CPU GANTT SCHEDULING */}
      {activeTab === 'CPU_SCHEDULING' && (
        <div className="p-6 space-y-6">
          {/* Controls & Algorithm Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas border border-border p-4 rounded-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Scheduling Algorithm:
              </span>
              <h3 className="text-sm font-bold text-text mt-0.5">{currentSched.name}</h3>
              <p className="text-xs text-text-muted mt-0.5">{currentSched.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSchedAlgo('RR');
                  setCurrentSliceIndex(SCHEDULING_DATA.RR.slices.length - 1);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  schedAlgo === 'RR'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Round Robin (q = 2)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchedAlgo('SRTF');
                  setCurrentSliceIndex(SCHEDULING_DATA.SRTF.slices.length - 1);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  schedAlgo === 'SRTF'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                SRTF (Preemptive SJF)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchedAlgo('PRIORITY');
                  setCurrentSliceIndex(SCHEDULING_DATA.PRIORITY.slices.length - 1);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  schedAlgo === 'PRIORITY'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Priority Preemptive
              </button>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border">
            <div className="text-xs font-mono">
              Timeline Slice: <strong className="text-primary-700">{currentSliceIndex + 1} / {currentSched.slices.length}</strong>
              <span className="text-text-muted ml-3">
                Current Time: <strong className="text-text">{visibleSlices[visibleSlices.length - 1]?.end || 0} units</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentSliceIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSliceIndex === 0}
              >
                ← Prev Slice
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentSliceIndex((prev) => Math.min(currentSched.slices.length - 1, prev + 1))}
                disabled={currentSliceIndex >= currentSched.slices.length - 1}
              >
                Next Slice →
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentSliceIndex(currentSched.slices.length - 1)}
              >
                Full Timeline
              </Button>
            </div>
          </div>

          {/* Dynamic Gantt Chart */}
          <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                CPU Gantt Execution Timeline
              </span>
              <span className="text-xs font-mono text-text-muted">
                Total Horizon: 22 units
              </span>
            </div>

            <div className="overflow-x-auto p-2">
              <div className="min-w-[600px] flex flex-col space-y-1">
                {/* Timeline slices */}
                <div className="flex h-12 rounded-lg overflow-hidden border border-border bg-surface">
                  {visibleSlices.map((slice, sIdx) => {
                    const duration = slice.end - slice.start;
                    const widthPct = (duration / 22) * 100;

                    return (
                      <div
                        key={sIdx}
                        className="h-full flex flex-col items-center justify-center font-mono text-xs font-bold text-white transition-all border-r border-white/20 last:border-r-0 shadow-2xs"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: slice.color,
                        }}
                        title={`${slice.name} [${slice.start} - ${slice.end}]`}
                      >
                        <span>{slice.name}</span>
                        <span className="text-[9px] opacity-80">{duration}u</span>
                      </div>
                    );
                  })}
                </div>

                {/* Time Axis Ticks */}
                <div className="flex justify-between text-[10px] font-mono text-text-muted px-0.5">
                  <span>0</span>
                  {visibleSlices.map((slice, sIdx) => (
                    <span key={sIdx}>{slice.end}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Metrics & Calculations Table */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text">
                Process Scheduling Metric Breakdown
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span>Avg Turnaround: <strong className="text-primary-700">{avgTat}u</strong></span>
                <span>Avg Waiting: <strong className="text-accent-700">{avgWt}u</strong></span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-border text-text-muted uppercase text-[10px]">
                    <th className="py-2">Process</th>
                    <th>Arrival (AT)</th>
                    <th>Burst (BT)</th>
                    <th>Priority</th>
                    <th>Completion (CT)</th>
                    <th>Turnaround (TAT = CT - AT)</th>
                    <th>Waiting (WT = TAT - BT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {PROCESSES.map((p) => {
                    const m = currentSched.metrics[p.id];
                    return (
                      <tr key={p.id} className="hover:bg-canvas/50">
                        <td className="py-2.5 font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.name}
                        </td>
                        <td>{p.at}</td>
                        <td>{p.bt}</td>
                        <td>{p.priority}</td>
                        <td className="font-bold text-text">{m.ct}</td>
                        <td className="text-primary-800 font-semibold">{m.tat}</td>
                        <td className="text-accent-800 font-semibold">{m.wt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 2: VIRTUAL MEMORY PAGING & BÉLÁDY'S ANOMALY */}
      {activeTab === 'PAGE_REPLACEMENT' && (
        <div className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas border border-border p-4 rounded-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Page Replacement Policy &amp; Frame Allocation:
              </span>
              <p className="text-xs text-text-muted mt-0.5">
                Reference Sequence: <code>[{REF_STRING.join(', ')}]</code>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-1 bg-surface p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setPageAlgo('FIFO')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer ${
                    pageAlgo === 'FIFO' ? 'bg-primary-700 text-white' : 'text-text-muted hover:text-text'
                  }`}
                >
                  FIFO
                </button>
                <button
                  type="button"
                  onClick={() => setPageAlgo('LRU')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer ${
                    pageAlgo === 'LRU' ? 'bg-primary-700 text-white' : 'text-text-muted hover:text-text'
                  }`}
                >
                  LRU (Stack Optimal)
                </button>
                <button
                  type="button"
                  onClick={() => setPageAlgo('OPT')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer ${
                    pageAlgo === 'OPT' ? 'bg-primary-700 text-white' : 'text-text-muted hover:text-text'
                  }`}
                >
                  Optimal (MIN)
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono bg-surface px-2.5 py-1 rounded-lg border border-border">
                <span className="text-text-muted">Frames:</span>
                <button
                  type="button"
                  onClick={() => setFrameCount(3)}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                    frameCount === 3 ? 'bg-primary-700 text-white' : 'text-text-muted hover:text-text'
                  }`}
                >
                  3 Frames
                </button>
                <button
                  type="button"
                  onClick={() => setFrameCount(4)}
                  className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                    frameCount === 4 ? 'bg-primary-700 text-white' : 'text-text-muted hover:text-text'
                  }`}
                >
                  4 Frames
                </button>
              </div>
            </div>
          </div>

          {/* Bélády's Anomaly Callout Alert */}
          {pageAlgo === 'FIFO' && (
            <div className="p-4 rounded-xl border bg-amber-50 border-amber-300 text-amber-900 text-xs leading-relaxed space-y-1">
              <div className="font-bold uppercase tracking-wider flex items-center gap-2">
                <span>⚡ B&eacute;l&aacute;dy&apos;s Anomaly Demonstration</span>
              </div>
              <p>
                In FIFO page replacement, increasing physical frame allocation from <strong>3 frames</strong> to <strong>4 frames</strong> paradoxically INCREASES total page faults from <strong>9</strong> to <strong>10</strong>! FIFO is not a <em>stack algorithm</em>, meaning the set of pages in memory for $N$ frames is not strictly a subset of $N+1$ frames.
              </p>
            </div>
          )}

          {/* Stepper Controls & Fault Counter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-4 text-xs font-mono">
              <span>Steps Executed: <strong>{pageStep} / {REF_STRING.length}</strong></span>
              <span>Total Page Faults: <strong className="text-rose-600 text-sm">{pagingData.totalFaults}</strong></span>
              <span>Page Hits: <strong className="text-emerald-600">{pageStep - pagingData.totalFaults}</strong></span>
              <span>Fault Rate: <strong>{pageStep > 0 ? ((pagingData.totalFaults / pageStep) * 100).toFixed(1) : 0}%</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPageStep((prev) => Math.max(1, prev - 1))}
                disabled={pageStep <= 1}
              >
                ← Prev Page
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setPageStep((prev) => Math.min(REF_STRING.length, prev + 1))}
                disabled={pageStep >= REF_STRING.length}
              >
                Next Page →
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPageStep(REF_STRING.length)}
              >
                Complete Sequence
              </Button>
            </div>
          </div>

          {/* Memory Frame Table Grid */}
          <div className="bg-canvas border border-border rounded-xl p-4 overflow-x-auto space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Physical Memory Frame State Matrix
            </div>

            <div className="min-w-[700px]">
              <table className="w-full text-xs font-mono text-center border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface text-text-muted text-[11px]">
                    <th className="p-2 text-left">Ref String:</th>
                    {REF_STRING.map((p, idx) => (
                      <th
                        key={idx}
                        className={`p-2 ${idx < pageStep ? 'font-bold text-text bg-primary-50/40' : 'opacity-40'}`}
                      >
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {Array.from({ length: frameCount }).map((_, fIdx) => (
                    <tr key={fIdx}>
                      <td className="p-2 text-left font-semibold text-text-muted bg-surface/50">
                        Frame [{fIdx}]
                      </td>
                      {REF_STRING.map((_, sIdx) => {
                        const stepData = pagingData.history[sIdx];
                        const val = stepData?.frames[fIdx];
                        return (
                          <td
                            key={sIdx}
                            className={`p-2 border-r border-border/40 last:border-r-0 ${
                              sIdx < pageStep
                                ? val !== null && val !== undefined
                                  ? 'font-bold text-text bg-surface'
                                  : 'text-text-muted'
                                : 'opacity-30'
                            }`}
                          >
                            {sIdx < pageStep && val !== null && val !== undefined ? val : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Result row: Hit vs Fault */}
                  <tr className="bg-surface/80 font-bold">
                    <td className="p-2 text-left text-text-muted">Outcome:</td>
                    {REF_STRING.map((_, sIdx) => {
                      const stepData = pagingData.history[sIdx];
                      if (sIdx >= pageStep || !stepData) {
                        return <td key={sIdx} className="p-2 opacity-30">—</td>;
                      }

                      return (
                        <td
                          key={sIdx}
                          className={`p-2 ${
                            stepData.isFault
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {stepData.isFault ? 'F' : 'H'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: TCP CONGESTION CONTROL (CWND) */}
      {activeTab === 'TCP_CONGESTION' && (
        <div className="p-6 space-y-6">
          {/* Variant Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas border border-border p-4 rounded-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                TCP Congestion Recovery Variant:
              </span>
              <p className="text-xs text-text-muted mt-0.5">
                Compare TCP Reno (Fast Recovery after 3 Dup ACKs) vs TCP Tahoe (Timeout collapse to cwnd = 1).
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTcpVariant('RENO')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  tcpVariant === 'RENO'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                TCP Reno (Fast Recovery)
              </button>
              <button
                type="button"
                onClick={() => setTcpVariant('TAHOE')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  tcpVariant === 'TAHOE'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                TCP Tahoe (Full Timeout Reset)
              </button>
            </div>
          </div>

          {/* Stepper Controls & Current State */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-4 text-xs font-mono">
              <span>Active Round: <strong className="text-primary-700 text-sm">{tcpRound} / 15</strong></span>
              <span>cwnd: <strong className="text-emerald-700 text-sm">{currentTcpPoint.cwnd} MSS</strong></span>
              <span>
                State:{' '}
                <strong
                  className={`px-1.5 py-0.5 rounded ${
                    currentTcpPoint.state === 'LOSS_EVENT_3_DUP_ACK'
                      ? 'bg-rose-100 text-rose-800'
                      : currentTcpPoint.state === 'SLOW_START'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {currentTcpPoint.state}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTcpRound((prev) => Math.max(1, prev - 1))}
                disabled={tcpRound <= 1}
              >
                ← Prev Round
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setTcpRound((prev) => Math.min(15, prev + 1))}
                disabled={tcpRound >= 15}
              >
                Next Round →
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTcpRound(9)}
              >
                Jump to Loss Event (Round 9)
              </Button>
            </div>
          </div>

          {/* SVG Chart: cwnd vs Round */}
          <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Congestion Window Dynamics (cwnd in MSS vs Transmission Round)
              </span>
              <span className="text-xs font-mono text-text-muted">
                ssthresh initial: 16 MSS &rarr; loss reduction to 9 MSS
              </span>
            </div>

            <svg viewBox="0 0 540 220" className="w-full h-56 bg-surface rounded-lg border border-border p-2">
              {/* Grid Lines & Labels */}
              <line x1="40" y1="20" x2="520" y2="20" stroke="currentColor" className="text-border" strokeDasharray="3 3" />
              <line x1="40" y1="80" x2="520" y2="80" stroke="currentColor" className="text-border" strokeDasharray="3 3" />
              <line x1="40" y1="140" x2="520" y2="140" stroke="currentColor" className="text-border" strokeDasharray="3 3" />
              <line x1="40" y1="190" x2="520" y2="190" stroke="currentColor" className="text-border" />

              <text x="30" y="24" textAnchor="end" className="text-[9px] fill-text-muted font-mono">20</text>
              <text x="30" y="84" textAnchor="end" className="text-[9px] fill-text-muted font-mono">14</text>
              <text x="30" y="144" textAnchor="end" className="text-[9px] fill-text-muted font-mono">6</text>
              <text x="30" y="194" textAnchor="end" className="text-[9px] fill-text-muted font-mono">0</text>

              {/* ssthresh indicator line at 16 MSS */}
              <line x1="40" y1="60" x2="330" y2="60" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="335" y="63" className="text-[9px] fill-amber-700 font-mono">ssthresh = 16</text>

              {/* Data points & polyline */}
              {(() => {
                const points = TCP_SERIES.map((pt) => {
                  const x = 40 + (pt.round - 1) * 34;
                  const y = 190 - (pt.cwnd / 20) * 170;
                  return { x, y, ...pt };
                });

                const polyPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

                return (
                  <g>
                    <polyline
                      fill="none"
                      stroke={tcpVariant === 'RENO' ? '#10b981' : '#0284c7'}
                      strokeWidth="2.5"
                      points={polyPoints}
                    />
                    {points.map((p) => {
                      const isActive = p.round === tcpRound;
                      const isLoss = p.round === 9;

                      return (
                        <g key={p.round}>
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isActive ? 6 : isLoss ? 5 : 3.5}
                            fill={isLoss ? '#e11d48' : isActive ? '#4f46e5' : '#10b981'}
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                          <text
                            x={p.x}
                            y="205"
                            textAnchor="middle"
                            className={`text-[9px] font-mono ${isActive ? 'fill-primary-700 font-bold' : 'fill-text-muted'}`}
                          >
                            R{p.round}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </svg>

            {/* Explanation Breakdown Card */}
            <div className="p-4 rounded-xl border bg-surface border-border text-xs leading-relaxed space-y-2">
              <div className="font-bold text-text uppercase tracking-wider">
                Phase Dynamics Breakdown:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-2.5 bg-canvas rounded-lg border border-border">
                  <div className="font-bold text-blue-700">1. Slow Start (Rounds 1–5):</div>
                  <p className="text-text-muted mt-1">
                    cwnd doubles every RTT (2^(round - 1)) until it reaches ssthresh = 16. Exponential growth rapidly discovers channel capacity.
                  </p>
                </div>
                <div className="p-2.5 bg-canvas rounded-lg border border-border">
                  <div className="font-bold text-emerald-700">2. Congestion Avoidance:</div>
                  <p className="text-text-muted mt-1">
                    Additive Increase: $cwnd$ increases by $+1$ MSS per round to gently probe for available bandwidth without triggering packet drops.
                  </p>
                </div>
                <div className="p-2.5 bg-canvas rounded-lg border border-border">
                  <div className="font-bold text-rose-700">3. Loss &amp; Fast Recovery:</div>
                  <p className="text-text-muted mt-1">
                    Upon 3 duplicate ACKs, $ssthresh$ halves to $9$. TCP Reno performs Fast Recovery without dropping to $1$, whereas TCP Tahoe resets to $1$.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
