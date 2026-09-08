'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export type KernelNetworkMode = 'CPU_SCHEDULING' | 'PAGE_REPLACEMENT' | 'TCP_CONGESTION' | 'EPOLL_MULTIPLEXING';


// --- Module 4: Linux Kernel epoll & C10K I/O Multiplexing Types ---
export type EpollTriggerMode = 'LEVEL_TRIGGERED' | 'EDGE_TRIGGERED';

export interface EpollSocket {
  fd: number;
  name: string;
  ipPort: string;
  bufferBytesUnread: number;
  bufferCapacity: number;
  state: 'IDLE' | 'DATA_ARRIVED' | 'PARTIALLY_DRAINED' | 'DRAINED_EAGAIN';
  isOnReadyList: boolean;
  totalBytesReceived: number;
}

export interface EpollEventLog {
  id: number;
  time: string;
  badge: string;
  badgeClass: string;
  message: string;
}

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


  // --- Module 4: Epoll & C10K Multiplexing State ---
  const [epollMode, setEpollMode] = useState<EpollTriggerMode>('LEVEL_TRIGGERED');
  const [epollStallAlert, setEpollStallAlert] = useState<string | null>(null);

  const initialSockets: EpollSocket[] = [
    { fd: 3, name: 'Client 1 (Web Gateway)', ipPort: '10.0.1.12:44192', bufferBytesUnread: 0, bufferCapacity: 4096, state: 'IDLE', isOnReadyList: false, totalBytesReceived: 0 },
    { fd: 4, name: 'Client 2 (Heavy API Stream)', ipPort: '10.0.1.45:51280', bufferBytesUnread: 0, bufferCapacity: 4096, state: 'IDLE', isOnReadyList: false, totalBytesReceived: 0 },
    { fd: 5, name: 'Client 3 (Microservice RPC)', ipPort: '10.0.2.18:38914', bufferBytesUnread: 0, bufferCapacity: 4096, state: 'IDLE', isOnReadyList: false, totalBytesReceived: 0 },
    { fd: 6, name: 'Client 4 (Telemetry Sensor)', ipPort: '10.0.2.99:60210', bufferBytesUnread: 0, bufferCapacity: 4096, state: 'IDLE', isOnReadyList: false, totalBytesReceived: 0 },
  ];

  const [epollSockets, setEpollSockets] = useState<EpollSocket[]>(initialSockets);

  const [epollAuditLog, setEpollAuditLog] = useState<EpollEventLog[]>([
    {
      id: 1,
      time: '00:00:00',
      badge: 'EPOLL_CREATE',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
      message: 'epoll_create1(EPOLL_CLOEXEC) initialized. In-kernel Red-Black Tree registered 4 FDs (3..6). Mode: LEVEL_TRIGGERED.',
    },
  ]);

  const handleEpollInjectPacket = (targetFd: number = 4, bytes: number = 1024) => {
    setEpollStallAlert(null);
    setEpollSockets((prev) =>
      prev.map((s) => {
        if (s.fd === targetFd) {
          const newBytes = s.bufferBytesUnread + bytes;
          return {
            ...s,
            bufferBytesUnread: newBytes,
            state: 'DATA_ARRIVED',
            isOnReadyList: true, // Kernel interrupt places socket on rdllist
            totalBytesReceived: s.totalBytesReceived + bytes,
          };
        }
        return s;
      })
    );
    setEpollAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'NIC_PACKET',
        badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300',
        message: `NIC interrupt: +${bytes} bytes arrived on FD ${targetFd}. Kernel sock_def_readable() appended FD ${targetFd} to rdllist.`,
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleEpollWaitCall = () => {
    const readyFds = epollSockets.filter((s) => s.isOnReadyList);
    setEpollWaitAwake(true);

    if (epollMode === 'EDGE_TRIGGERED') {
      // In Edge-Triggered mode, epoll_wait returns events and removes them from rdllist!
      setEpollSockets((prev) =>
        prev.map((s) => (s.isOnReadyList ? { ...s, isOnReadyList: false } : s))
      );
    }

    setEpollAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'EPOLL_WAIT',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
        message: `epoll_wait() returned ${readyFds.length} active event(s): [${readyFds.map((f) => 'FD ' + f.fd).join(', ') || 'none'}]. Thread unblocked.`,
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleEpollPartialRead = (targetFd: number = 4) => {
    const target = epollSockets.find((s) => s.fd === targetFd);
    if (!target || target.bufferBytesUnread === 0) return;

    const readBytes = 256;
    const remaining = Math.max(0, target.bufferBytesUnread - readBytes);

    if (epollMode === 'LEVEL_TRIGGERED') {
      // Level-Triggered: Because unread bytes remain, socket remains on rdllist!
      setEpollSockets((prev) =>
        prev.map((s) =>
          s.fd === targetFd
            ? {
                ...s,
                bufferBytesUnread: remaining,
                state: 'PARTIALLY_DRAINED',
                isOnReadyList: remaining > 0, // Remains ready!
              }
            : s
        )
      );
      setEpollStallAlert(null);
      setEpollAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          badge: 'LT_PARTIAL_READ',
          badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300',
          message: `read(FD ${targetFd}, buf, ${readBytes}) completed. ${remaining} bytes remain. Level-Triggered: FD ${targetFd} REMAINS on rdllist!`,
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      // Edge-Triggered: Socket is NOT on rdllist, and buffer is not empty!
      // This triggers the classic Edge-Triggered Stall Hazard!
      setEpollSockets((prev) =>
        prev.map((s) =>
          s.fd === targetFd
            ? {
                ...s,
                bufferBytesUnread: remaining,
                state: 'PARTIALLY_DRAINED',
                isOnReadyList: false, // NOT on ready list!
              }
            : s
        )
      );
      if (remaining > 0) {
        setEpollStallAlert(`CRITICAL EDGE-TRIGGERED STALL: read() consumed only ${readBytes}B of data leaving ${remaining}B unread in FD ${targetFd}! In Edge-Triggered mode, epoll_wait() will NEVER notify again until new bytes arrive at the NIC! Application must drain until EAGAIN!`);
      }
      setEpollAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          badge: 'ET_STALL_HAZARD',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 animate-pulse',
          message: `ET PARTIAL READ HAZARD: FD ${targetFd} has ${remaining}B buffered, but was removed from rdllist! epoll_wait() will stall indefinitely!`,
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const handleEpollDrainToEagain = (targetFd: number = 4) => {
    setEpollStallAlert(null);
    setEpollSockets((prev) =>
      prev.map((s) =>
        s.fd === targetFd
          ? {
              ...s,
              bufferBytesUnread: 0,
              state: 'DRAINED_EAGAIN',
              isOnReadyList: false,
            }
          : s
      )
    );
    setEpollAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'DRAIN_EAGAIN',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
        message: `while((n=read(FD ${targetFd}))>0)... errno=EAGAIN. Entire socket buffer drained. Edge-Triggered contract satisfied!`,
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleEpollReset = () => {
    setEpollSockets(initialSockets);
    setEpollWaitAwake(false);
    setEpollStallAlert(null);
    setEpollAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
        message: 'epoll subsystem reset. Sockets drained and rdllist cleared.',
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
          <button
            type="button"
            onClick={() => setActiveTab('EPOLL_MULTIPLEXING')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'EPOLL_MULTIPLEXING'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            epoll &amp; C10K I/O
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
      {/* MODULE 4: LINUX KERNEL EPOLL & C10K I/O MULTIPLEXING */}
      {activeTab === 'EPOLL_MULTIPLEXING' && (
        <div className="p-6 space-y-6">
          {/* Header Banner */}
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Linux Kernel Subsystem &amp; Asynchronous I/O
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-primary-200 bg-primary-50 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300">
                  Dan Kegel C10K Invariant
                </span>
              </div>
              <h3 className="font-bold text-base text-text">
                Linux Kernel epoll Architecture: Level-Triggered (LT) vs Edge-Triggered (ET) &amp; C10K Scaling
              </h3>
              <p className="text-xs text-text-muted max-w-3xl leading-relaxed">
                Contrast the $O(N)$ linear memory copy bottlenecks of legacy `select()` and `poll()` against the Linux kernel&apos;s $O(1)$ `epoll` subsystem. Explore how the in-kernel Red-Black Tree and interrupt-driven Ready List (`rdllist`) operate, and observe the critical differences between state-driven Level-Triggered (LT) and edge-driven Edge-Triggered (ET / `EPOLLET`) modes.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="bg-surface border border-border p-2.5 rounded-lg flex flex-col gap-1.5 min-w-[280px]">
              <span className="text-[11px] font-bold text-text uppercase tracking-wider">
                epoll Trigger Semantics:
              </span>
              <div className="grid grid-cols-2 gap-1 bg-canvas p-1 rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setEpollMode('LEVEL_TRIGGERED');
                    handleEpollReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    epollMode === 'LEVEL_TRIGGERED'
                      ? 'bg-primary-700 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Level-Triggered (LT)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEpollMode('EDGE_TRIGGERED');
                    handleEpollReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    epollMode === 'EDGE_TRIGGERED'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Edge-Triggered (ET)
                </button>
              </div>
            </div>
          </div>

          {/* Edge-Triggered Stall Alert Banner (if triggered) */}
          {epollStallAlert && (
            <div className="p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-950 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200 text-xs space-y-1 animate-pulse">
              <span className="font-bold text-sm block">⚠️ CRITICAL EDGE-TRIGGERED STALL DETECTED</span>
              <p>{epollStallAlert}</p>
            </div>
          )}

          {/* Interactive Operational Controls */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              Kernel Event Simulation Operations:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              <Button
                onClick={() => handleEpollInjectPacket(4, 1024)}
                variant="primary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                1. Inject Packet (+1024B on FD 4)
              </Button>
              <Button
                onClick={handleEpollWaitCall}
                variant="accent"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                2. Call epoll_wait()
              </Button>
              <Button
                onClick={() => handleEpollPartialRead(4)}
                variant={epollMode === 'EDGE_TRIGGERED' ? 'destructive' : 'secondary'}
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                3. Partial Read (256B)
              </Button>
              <Button
                onClick={() => handleEpollDrainToEagain(4)}
                variant="primary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                4. Drain to EAGAIN (O_NONBLOCK)
              </Button>
              <Button
                onClick={handleEpollReset}
                variant="secondary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                ↺ Reset epoll Lab
              </Button>
            </div>
          </div>

          {/* Architecture Visualization: User Space -> Kernel epoll (RB-Tree + Ready List) -> Socket Buffers */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Kernel Ready List (rdllist) & RB-Tree Inspector */}
            <div className="lg:col-span-5 bg-surface border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary-600 animate-pulse" />
                  <h4 className="font-bold text-sm text-text">Linux Kernel epoll Subsystem</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-canvas">
                  O(1) Event Delivery
                </span>
              </div>

              {/* Ready List (rdllist) Box */}
              <div className="p-3 rounded-xl bg-canvas border-2 border-primary-500/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text flex items-center gap-1.5">
                    <span>⚡ Ready List (rdllist):</span>
                    <span className="text-[10px] text-text-muted font-normal">Doubly-Linked List</span>
                  </span>
                  <span className="font-mono text-[11px] font-bold text-primary-600">
                    {epollSockets.filter((s) => s.isOnReadyList).length} Socket(s) Ready
                  </span>
                </div>

                <div className="min-h-[48px] p-2 rounded-lg bg-surface border border-border flex flex-wrap items-center gap-2">
                  {epollSockets.filter((s) => s.isOnReadyList).length === 0 ? (
                    <span className="text-xs text-text-muted italic">
                      rdllist is empty (Kernel sleeping; epoll_wait will block)
                    </span>
                  ) : (
                    epollSockets
                      .filter((s) => s.isOnReadyList)
                      .map((s) => (
                        <span
                          key={s.fd}
                          className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono font-bold text-xs flex items-center gap-1.5 animate-bounce"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                          FD {s.fd} ({s.bufferBytesUnread}B ready)
                        </span>
                      ))
                  )}
                </div>
              </div>

              {/* Red-Black Tree Registration */}
              <div className="p-3 rounded-xl bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text">In-Kernel Monitored RB-Tree (rbr):</span>
                  <span className="font-mono text-[10px] text-text-muted">epoll_ctl(EPOLL_CTL_ADD)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  {epollSockets.map((s) => (
                    <div
                      key={s.fd}
                      className={`p-2 rounded border transition-colors ${
                        s.isOnReadyList
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
                          : 'bg-surface border-border text-text'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>FD {s.fd}</span>
                        <span className="text-[10px] text-text-muted">{epollMode === 'EDGE_TRIGGERED' ? 'EPOLLET' : 'EPOLLLT'}</span>
                      </div>
                      <div className="text-[10px] text-text-muted truncate mt-0.5">{s.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Socket Receive Buffers (Hardware/Kernel Interface) */}
            <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h4 className="font-bold text-sm text-text">Kernel Socket Receive Buffers (sk_receive_queue)</h4>
                  <span className="text-xs text-text-muted">
                    Simulates non-blocking TCP socket buffers in Linux kernel memory.
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  epollMode === 'EDGE_TRIGGERED'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-primary-100 text-primary-900 border-primary-300'
                }`}>
                  Mode: {epollMode}
                </span>
              </div>

              <div className="space-y-3">
                {epollSockets.map((s) => (
                  <div
                    key={s.fd}
                    className={`p-3 rounded-xl border transition-all space-y-2 ${
                      s.bufferBytesUnread > 0 && !s.isOnReadyList && epollMode === 'EDGE_TRIGGERED'
                        ? 'bg-rose-50/40 border-rose-400 dark:bg-rose-950/20'
                        : s.isOnReadyList
                        ? 'bg-emerald-50/30 border-emerald-400 dark:bg-emerald-950/20'
                        : 'bg-canvas border-border'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-text bg-surface px-2 py-0.5 rounded border border-border">
                          FD {s.fd}
                        </span>
                        <span className="font-semibold text-text">{s.name}</span>
                        <span className="font-mono text-[10px] text-text-muted">{s.ipPort}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-text-muted">Unread:</span>
                        <span className={`font-bold ${s.bufferBytesUnread > 0 ? 'text-primary-700 dark:text-primary-400' : 'text-text-muted'}`}>
                          {s.bufferBytesUnread} / {s.bufferCapacity} Bytes
                        </span>
                      </div>
                    </div>

                    {/* Buffer Fill Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          s.bufferBytesUnread > 0 && !s.isOnReadyList && epollMode === 'EDGE_TRIGGERED'
                            ? 'bg-rose-500'
                            : 'bg-primary-600'
                        }`}
                        style={{ width: `${(s.bufferBytesUnread / s.bufferCapacity) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted">
                      <span>State: <strong className="text-text">{s.state}</strong></span>
                      <span>Ready List: <strong className={s.isOnReadyList ? 'text-emerald-600' : 'text-text-muted'}>
                        {s.isOnReadyList ? 'YES (In rdllist)' : 'NO (Not in rdllist)'}
                      </strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* C10K Performance Benchmark Comparison Table */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-text">
              The C10K Problem: select() vs poll() vs epoll (LT &amp; ET)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-canvas text-text font-bold">
                    <th className="p-2">I/O Multiplexing Mechanism</th>
                    <th className="p-2">Cost per Syscall (10,000 FDs)</th>
                    <th className="p-2">Kernel Data Structure</th>
                    <th className="p-2">Trigger Semantics</th>
                    <th className="p-2">Application Drain Requirement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="p-2 font-semibold text-text">select()</td>
                    <td className="p-2 text-rose-600 font-mono">O(N) copy 1024-bit bitmap</td>
                    <td className="p-2 text-text-muted font-mono">Fixed-size bitset</td>
                    <td className="p-2 text-text-muted">Level-Triggered</td>
                    <td className="p-2 text-text-muted">Optional (re-notifies)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-text">poll()</td>
                    <td className="p-2 text-rose-600 font-mono">O(N) copy pollfd array</td>
                    <td className="p-2 text-text-muted font-mono">Linear pollfd array</td>
                    <td className="p-2 text-text-muted">Level-Triggered</td>
                    <td className="p-2 text-text-muted">Optional (re-notifies)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-text">epoll (Level-Triggered)</td>
                    <td className="p-2 text-emerald-600 font-mono">O(K) where K = ready FDs</td>
                    <td className="p-2 text-text-muted font-mono">RB-Tree + Ready List (rdllist)</td>
                    <td className="p-2 text-text-muted">State-based (buffer &gt; 0)</td>
                    <td className="p-2 text-text-muted">Optional (safe, high syscall rate)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-semibold text-text">epoll (Edge-Triggered / EPOLLET)</td>
                    <td className="p-2 text-emerald-600 font-mono">O(K) minimal wakeups</td>
                    <td className="p-2 text-text-muted font-mono">RB-Tree + Ready List (rdllist)</td>
                    <td className="p-2 text-amber-600 font-semibold">Transition-based (0 → N bytes)</td>
                    <td className="p-2 text-rose-600 font-semibold font-mono">MANDATORY drain to EAGAIN</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Audit Log */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text uppercase tracking-wider">
                epoll Kernel &amp; Syscall Audit Stream:
              </span>
              <span className="text-text-muted font-mono text-[11px]">
                {epollAuditLog.length} Events Logged
              </span>
            </div>

            <div className="space-y-2">
              {epollAuditLog.map((ev) => (
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
                1. The C10K Decoupling Invariant
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                epoll decouples FD registration from event waiting. Interest registration (`epoll_ctl`) occurs once into an in-kernel Red-Black Tree, eliminating repeated $O(N)$ memory copies between user and kernel space.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. Level-Triggered Semantics
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Level-Triggered (LT) notifies user space as long as unread bytes remain in the socket buffer. If an application reads only 256B of 1024B, `epoll_wait()` will immediately wake up again on the next call.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. Edge-Triggered Semantics
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Edge-Triggered (ET / `EPOLLET`) notifies only upon state transitions (e.g. rising edge when new data arrives). Once `epoll_wait()` returns, the socket is removed from the Ready List and will not fire again.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. The EAGAIN Draining Rule
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Under ET, non-blocking sockets must be read in a loop until `read()` returns -1 with `errno == EAGAIN`. Partial reads leave data trapped in the kernel buffer with zero subsequent wakeups!
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}