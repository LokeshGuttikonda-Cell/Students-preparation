'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export type KernelNetworkMode = 'CPU_SCHEDULING' | 'PAGE_REPLACEMENT' | 'TCP_CONGESTION' | 'EPOLL_MULTIPLEXING' | 'ZERO_COPY_IO_URING' | 'VIRTUAL_MEMORY_PAGE_TABLES_TLB' | 'TCP_BBR_BUFFERBLOAT';




// --- Module 7: Linux Kernel TCP BBR Congestion Control & Bufferbloat Types ---
export type TcpCongestionAlgorithm = 'BBR_CARDWELL' | 'RENO_LOSS_BASED' | 'CUBIC_LOSS_BASED';
export type BbrState = 'STARTUP' | 'DRAIN' | 'PROBE_BW' | 'PROBE_RTT';

export interface BbrStepSnapshot {
  stepIndex: number;
  title: string;
  explanation: string;
  algorithm: TcpCongestionAlgorithm;
  bbrState: BbrState;
  pacingGain: number;
  cwndGain: number;
  cwndPackets: number;
  inflightPackets: number;
  bdpPackets: number;
  routerQueuePackets: number;
  routerQueueCapacity: number;
  bottleneckBwMbps: number;
  rtPropMs: number;
  measuredRttMs: number;
  deliveryRateMbps: number;
  pacingRateMbps: number;
  droppedPacketsCount: number;
  phaseCycleIndex: number;
  socketStats: {
    skPacingRate: string;
    bbrBw: string;
    minRttUs: string;
    sndCwnd: number;
    packetsOut: number;
    pacingGainVal: string;
    cwndGainVal: string;
  };
  banner: {
    type: 'OPTIMAL' | 'BLOAT_ALERT' | 'LOSS_EVENT' | 'STARTUP' | 'DRAIN' | 'PROBING';
    title: string;
    description: string;
  };
}

// --- Module 6: Linux Kernel Virtual Memory, Page Tables & TLB Types ---
export type PagingPageSize = '4KB_STANDARD' | '2MB_HUGE_PAGE';
export type TlbLookupResult = 'TLB_HIT' | 'TLB_MISS_PAGE_WALK' | 'PAGE_FAULT_COW' | 'PAGE_FAULT_DEMAND_ZERO';

export interface VirtualAddressDecomposition {
  rawHex: string;
  segmentName: string;
  pgdIndex: number;
  pudIndex: number;
  pmdIndex: number;
  pteIndex: number;
  offset: number;
  isHugePage: boolean;
}

export interface TlbEntry {
  vpn: string;
  pfn: string;
  pageSize: PagingPageSize;
  permissions: string;
  valid: boolean;
  hits: number;
}

export interface PageWalkStep {
  level: 'CR3' | 'PGD' | 'PUD' | 'PMD' | 'PTE' | 'PHYSICAL_FRAME';
  tableName: string;
  index: number;
  entryValue: string;
  flags: string[];
  latencyCycles: number;
}

export interface VmMetrics {
  tlbHits: number;
  tlbMisses: number;
  pageWalks: number;
  pageFaults: number;
  avgLatencyCycles: number;
}

export interface VmAuditEvent {
  id: number;
  time: string;
  badge: string;
  badgeClass: string;
  message: string;
}

// --- Module 5: Zero-Copy I/O & io_uring Types ---
export type IOArchitectureMode = 'TRADITIONAL_READ_WRITE' | 'SENDFILE_ZERO_COPY' | 'IO_URING_RING_BUFFER';

export interface ZeroCopyMetrics {
  contextSwitches: number;
  cpuCopies: number;
  dmaCopies: number;
  syscallCount: number;
  latencyUs: number;
  cpuOverheadPct: number;
}

export interface RingBufferEntry {
  index: number;
  opcode: string;
  fd: number;
  bufferAddr: string;
  bytes: number;
  status: 'QUEUED' | 'PROCESSED' | 'COMPLETED';
  resCode?: number;
}

export interface ZeroCopyAuditEvent {
  id: number;
  time: string;
  mode: string;
  badge: string;
  badgeClass: string;
  message: string;
}

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
  // --- Module 7: Linux Kernel TCP BBR & Bufferbloat State ---
  const [bbrSelectedAlgo, setBbrSelectedAlgo] = useState<TcpCongestionAlgorithm>('BBR_CARDWELL');
  const [bbrStepIndex, setBbrStepIndex] = useState<number>(0);
  const [bbrQueueCapacity, setBbrQueueCapacity] = useState<number>(100);
  const [bbrBottleneckBw, setBbrBottleneckBw] = useState<number>(50); // Mbps
  const [bbrInjectedBurst, setBbrInjectedBurst] = useState<boolean>(false);

    // --- Module 6: Virtual Memory & TLB State ---
  const [vmAddressInput, setVmAddressInput] = useState('0x7fff_cafe_4000');
  const [vmPageSize, setVmPageSize] = useState<PagingPageSize>('4KB_STANDARD');
  const [vmLastResult, setVmLastResult] = useState<TlbLookupResult>('TLB_HIT');
  const [vmActiveDecomp, setVmActiveDecomp] = useState<VirtualAddressDecomposition>({
    rawHex: '0x7fff_cafe_4000',
    segmentName: 'Application Stack (Hot User Memory)',
    pgdIndex: 255,
    pudIndex: 511,
    pmdIndex: 479,
    pteIndex: 254,
    offset: 0,
    isHugePage: false,
  });

  const [tlbEntries, setTlbEntries] = useState<TlbEntry[]>([
    { vpn: '0x7fff_cafe_4', pfn: '0x10a2_4', pageSize: '4KB_STANDARD', permissions: 'RW-', valid: true, hits: 42 },
    { vpn: '0x0000_7f80_1', pfn: '0x20b4_1', pageSize: '4KB_STANDARD', permissions: 'R-X', valid: true, hits: 88 },
    { vpn: '0x0000_6000_0', pfn: '0x30c0_0', pageSize: '2MB_HUGE_PAGE', permissions: 'RW-', valid: true, hits: 14 },
    { vpn: '0x0000_0000_0', pfn: '0x0000_0', pageSize: '4KB_STANDARD', permissions: '---', valid: false, hits: 0 },
  ]);

  const [vmPageWalkSteps] = useState<PageWalkStep[]>([
    { level: 'CR3', tableName: 'Control Register 3 (%cr3)', index: 0, entryValue: '0x8000_1000 (Base PGD PhysAddr)', flags: ['Present'], latencyCycles: 0 },
    { level: 'PGD', tableName: 'Page Global Directory (Level 4)', index: 255, entryValue: '0x8000_2000 (Points to PUD)', flags: ['Present', 'User', 'Writable'], latencyCycles: 60 },
    { level: 'PUD', tableName: 'Page Upper Directory (Level 3)', index: 511, entryValue: '0x8000_3000 (Points to PMD)', flags: ['Present', 'User', 'Writable'], latencyCycles: 60 },
    { level: 'PMD', tableName: 'Page Middle Directory (Level 2)', index: 479, entryValue: '0x8000_4000 (Points to PTE)', flags: ['Present', 'User', 'Writable'], latencyCycles: 60 },
    { level: 'PTE', tableName: 'Page Table Entry (Level 1)', index: 254, entryValue: '0x10a2_4000 (Physical Frame)', flags: ['Present', 'User', 'Writable', 'Accessed', 'Dirty'], latencyCycles: 60 },
    { level: 'PHYSICAL_FRAME', tableName: 'Target Physical RAM Address', index: 0, entryValue: '0x10a2_4000 (0x10a2_4000 + Offset 0)', flags: ['Cached'], latencyCycles: 1 },
  ]);

  const [vmMetrics, setVmMetrics] = useState<VmMetrics>({
    tlbHits: 130,
    tlbMisses: 12,
    pageWalks: 12,
    pageFaults: 1,
    avgLatencyCycles: 18,
  });

  const [vmAuditLog, setVmAuditLog] = useState<VmAuditEvent[]>([
    {
      id: 1,
      time: '14:30:00',
      badge: 'MMU_INIT',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
      message: 'MMU hardware initialized with 4-level paging (PGD -> PUD -> PMD -> PTE) and L1/L2 data TLB cache.',
    },
  ]);

  const handleTranslateAddress = (presetHex?: string) => {
    const targetHex = presetHex || vmAddressInput;
    setVmAddressInput(targetHex);

    let decomp: VirtualAddressDecomposition;
    let result: TlbLookupResult = 'TLB_HIT';
    let cycles = 1;

    if (targetHex === '0x7fff_cafe_4000') {
      decomp = { rawHex: targetHex, segmentName: 'Application Stack (Hot Stack Pointer)', pgdIndex: 255, pudIndex: 511, pmdIndex: 479, pteIndex: 254, offset: 0, isHugePage: false };
      result = 'TLB_HIT';
      cycles = 1;
    } else if (targetHex === '0x0000_7f80_1000') {
      decomp = { rawHex: targetHex, segmentName: 'Code Segment (.text Read-Only Executable)', pgdIndex: 0, pudIndex: 127, pmdIndex: 64, pteIndex: 1, offset: 0, isHugePage: false };
      result = 'TLB_HIT';
      cycles = 1;
    } else if (targetHex === '0x0000_55aa_0000') {
      decomp = { rawHex: targetHex, segmentName: 'Heap Segment (Cold malloc() Uncached Page)', pgdIndex: 0, pudIndex: 85, pmdIndex: 170, pteIndex: 0, offset: 0, isHugePage: false };
      result = 'TLB_MISS_PAGE_WALK';
      cycles = 241;
    } else if (targetHex === '0x0000_6000_0000') {
      decomp = { rawHex: targetHex, segmentName: 'Transparent Huge Page (2MB Database Buffer)', pgdIndex: 0, pudIndex: 96, pmdIndex: 0, pteIndex: 0, offset: 0, isHugePage: true };
      result = vmPageSize === '2MB_HUGE_PAGE' ? 'TLB_HIT' : 'TLB_MISS_PAGE_WALK';
      cycles = vmPageSize === '2MB_HUGE_PAGE' ? 1 : 180;
    } else if (targetHex === '0x0000_1000_0000') {
      decomp = { rawHex: targetHex, segmentName: 'Forked Child Process Page (Copy-on-Write)', pgdIndex: 0, pudIndex: 16, pmdIndex: 0, pteIndex: 0, offset: 0, isHugePage: false };
      result = 'PAGE_FAULT_COW';
      cycles = 1200;
    } else {
      decomp = { rawHex: targetHex, segmentName: 'Custom Virtual Memory Address', pgdIndex: 128, pudIndex: 64, pmdIndex: 32, pteIndex: 16, offset: 0, isHugePage: false };
      result = 'TLB_MISS_PAGE_WALK';
      cycles = 241;
    }

    setVmActiveDecomp(decomp);
    setVmLastResult(result);

    if (result === 'TLB_HIT') {
      setVmMetrics((prev) => ({
        ...prev,
        tlbHits: prev.tlbHits + 1,
        avgLatencyCycles: Math.round((prev.avgLatencyCycles * 9 + 1) / 10),
      }));
      setVmAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          badge: 'TLB_HIT',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
          message: `TLB Hit on VPN ${decomp.rawHex.slice(0, 13)}! Resolved in 1 CPU cycle with 0 memory bus references.`,
        },
        ...prev.slice(0, 8),
      ]);
    } else if (result === 'TLB_MISS_PAGE_WALK') {
      setVmMetrics((prev) => ({
        ...prev,
        tlbMisses: prev.tlbMisses + 1,
        pageWalks: prev.pageWalks + 1,
        avgLatencyCycles: Math.round((prev.avgLatencyCycles * 9 + cycles) / 10),
      }));
      setVmAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          badge: 'TLB_MISS_WALK',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300',
          message: `TLB Miss on ${targetHex}! MMU initiated 4-level page table walk (CR3 -> PGD[${decomp.pgdIndex}] -> PUD[${decomp.pudIndex}] -> PMD[${decomp.pmdIndex}] -> PTE[${decomp.pteIndex}]). Latency: ${cycles} cycles.`,
        },
        ...prev.slice(0, 8),
      ]);
    } else if (result === 'PAGE_FAULT_COW') {
      setVmMetrics((prev) => ({
        ...prev,
        pageFaults: prev.pageFaults + 1,
        tlbMisses: prev.tlbMisses + 1,
        avgLatencyCycles: Math.round((prev.avgLatencyCycles * 9 + cycles) / 10),
      }));
      setVmAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          badge: 'PAGE_FAULT_COW',
          badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300',
          message: `Soft Page Fault (Copy-on-Write): Child attempted write to shared frame. Kernel allocated private physical frame, copied 4KB, updated PTE to RW=1, and resumed thread. Latency: ${cycles} cycles.`,
        },
        ...prev.slice(0, 8),
      ]);
    }
  };

  const handleFlushTLB = () => {
    setTlbEntries((prev) => prev.map((e) => ({ ...e, valid: false })));
    setVmAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'INVLPG_SHOOTDOWN',
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300',
        message: 'INVLPG instruction executed / %cr3 reload. All TLB entries invalidated. Next access will incur full 4-level page walk penalty!',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleToggleHugePages = () => {
    const nextSize = vmPageSize === '4KB_STANDARD' ? '2MB_HUGE_PAGE' : '4KB_STANDARD';
    setVmPageSize(nextSize);
    setVmAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: nextSize === '2MB_HUGE_PAGE' ? 'THP_ENABLED' : 'THP_DISABLED',
        badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300',
        message: nextSize === '2MB_HUGE_PAGE'
          ? 'Transparent Huge Pages (THP 2MB) enabled! PMD acts as direct leaf pointer, bypassing Level 1 PTE and increasing TLB reach by 512x.'
          : 'Standard 4KB paging enabled. Full 4-level page table walk active.',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleResetVM = () => {
    setVmPageSize('4KB_STANDARD');
    setVmLastResult('TLB_HIT');
    setVmMetrics({
      tlbHits: 130,
      tlbMisses: 12,
      pageWalks: 12,
      pageFaults: 1,
      avgLatencyCycles: 18,
    });
    setTlbEntries([
      { vpn: '0x7fff_cafe_4', pfn: '0x10a2_4', pageSize: '4KB_STANDARD', permissions: 'RW-', valid: true, hits: 42 },
      { vpn: '0x0000_7f80_1', pfn: '0x20b4_1', pageSize: '4KB_STANDARD', permissions: 'R-X', valid: true, hits: 88 },
      { vpn: '0x0000_6000_0', pfn: '0x30c0_0', pageSize: '2MB_HUGE_PAGE', permissions: 'RW-', valid: true, hits: 14 },
      { vpn: '0x0000_0000_0', pfn: '0x0000_0', pageSize: '4KB_STANDARD', permissions: '---', valid: false, hits: 0 },
    ]);
    setVmAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        badge: 'RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
        message: 'Virtual memory state, page tables, and TLB cache reset to initial state.',
      },
      ...prev.slice(0, 8),
    ]);
  };

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


  // --- Module 5: Zero-Copy & io_uring State ---
  const [ioMode, setIoMode] = useState<IOArchitectureMode>('TRADITIONAL_READ_WRITE');
  const [ioStep, setIoStep] = useState<number>(0);

  const initialMetrics: Record<IOArchitectureMode, ZeroCopyMetrics> = {
    TRADITIONAL_READ_WRITE: {
      contextSwitches: 4,
      cpuCopies: 2,
      dmaCopies: 2,
      syscallCount: 2,
      latencyUs: 120,
      cpuOverheadPct: 78,
    },
    SENDFILE_ZERO_COPY: {
      contextSwitches: 2,
      cpuCopies: 0,
      dmaCopies: 2,
      syscallCount: 1,
      latencyUs: 35,
      cpuOverheadPct: 18,
    },
    IO_URING_RING_BUFFER: {
      contextSwitches: 0,
      cpuCopies: 0,
      dmaCopies: 2,
      syscallCount: 0,
      latencyUs: 12,
      cpuOverheadPct: 4,
    },
  };

  const [ioMetrics, setIoMetrics] = useState<ZeroCopyMetrics>(initialMetrics.TRADITIONAL_READ_WRITE);

  const [sqEntries, setSqEntries] = useState<RingBufferEntry[]>([
    { index: 0, opcode: 'IORING_OP_READ', fd: 3, bufferAddr: '0x7fff_1000', bytes: 65536, status: 'QUEUED' },
    { index: 1, opcode: 'IORING_OP_WRITE', fd: 4, bufferAddr: '0x7fff_2000', bytes: 65536, status: 'QUEUED' },
  ]);

  const [cqEntries, setCqEntries] = useState<RingBufferEntry[]>([]);

  const [ioAuditLog, setIoAuditLog] = useState<ZeroCopyAuditEvent[]>([
    {
      id: 1,
      time: '00:00:00',
      mode: 'TRADITIONAL_READ_WRITE',
      badge: 'IO_INIT',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
      message: 'Kernel I/O Subsystem initialized. Testing 64KB file transfer over 10GbE network socket.',
    },
  ]);

  const handleRunIOTransfer = () => {
    setIoStep(1);

    if (ioMode === 'TRADITIONAL_READ_WRITE') {
      setIoMetrics(initialMetrics.TRADITIONAL_READ_WRITE);
      setIoAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          mode: 'TRADITIONAL_READ_WRITE',
          badge: 'READ_WRITE_TRANSFER',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300',
          message: 'Traditional I/O: 4 Context Switches (read sysenter/sysexit + write sysenter/sysexit) & 4 Copies (Disk -> PageCache [DMA], PageCache -> UserBuf [CPU Copy 1], UserBuf -> SocketBuf [CPU Copy 2], SocketBuf -> NIC [DMA]). High CPU cache pollution.',
        },
        ...prev.slice(0, 8),
      ]);
    } else if (ioMode === 'SENDFILE_ZERO_COPY') {
      setIoMetrics(initialMetrics.SENDFILE_ZERO_COPY);
      setIoAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          mode: 'SENDFILE_ZERO_COPY',
          badge: 'SENDFILE_ZERO_COPY',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300',
          message: 'sendfile() Zero-Copy: User space completely bypassed! 2 Context Switches (1 syscall). CPU Copies: 0! Kernel passes descriptor pointers directly to socket buffer; NIC performs DMA gather. 70% latency reduction.',
        },
        ...prev.slice(0, 8),
      ]);
    } else {
      setIoMetrics(initialMetrics.IO_URING_RING_BUFFER);
      setSqEntries((prev) => prev.map((e) => ({ ...e, status: 'PROCESSED' })));
      setCqEntries([
        { index: 0, opcode: 'IORING_OP_READ', fd: 3, bufferAddr: '0x7fff_1000', bytes: 65536, status: 'COMPLETED', resCode: 65536 },
        { index: 1, opcode: 'IORING_OP_WRITE', fd: 4, bufferAddr: '0x7fff_2000', bytes: 65536, status: 'COMPLETED', resCode: 65536 },
      ]);
      setIoAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          mode: 'IO_URING_RING_BUFFER',
          badge: 'IO_URING_ASYNC',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
          message: 'io_uring Lockless Ring Buffer: User posted 2 SQEs to submission queue via mmap. Kernel SQPOLL worker consumed SQEs and posted CQEs to completion queue. 0 Syscalls! 0 Context Switches! 90% latency reduction.',
        },
        ...prev.slice(0, 8),
      ]);
    }
  };

  const handleZeroCopyReset = () => {
    setIoStep(0);
    setIoMetrics(initialMetrics[ioMode]);
    setSqEntries([
      { index: 0, opcode: 'IORING_OP_READ', fd: 3, bufferAddr: '0x7fff_1000', bytes: 65536, status: 'QUEUED' },
      { index: 1, opcode: 'IORING_OP_WRITE', fd: 4, bufferAddr: '0x7fff_2000', bytes: 65536, status: 'QUEUED' },
    ]);
    setCqEntries([]);
    setIoAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        mode: ioMode,
        badge: 'RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
        message: 'I/O pipeline and ring buffer counters reset to initial state.',
      },
      ...prev.slice(0, 8),
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
          <button
            type="button"
            onClick={() => setActiveTab('VIRTUAL_MEMORY_PAGE_TABLES_TLB')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'VIRTUAL_MEMORY_PAGE_TABLES_TLB'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Virtual Memory &amp; TLB
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ZERO_COPY_IO_URING')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'ZERO_COPY_IO_URING'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Zero-Copy &amp; io_uring
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TCP_BBR_BUFFERBLOAT')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'TCP_BBR_BUFFERBLOAT'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            BBR &amp; Bufferbloat
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


      {/* MODULE 5: ZERO-COPY & IO_URING */}
      {activeTab === 'ZERO_COPY_IO_URING' && (
        <div className="p-6 space-y-6">
          {/* Header & Mode Switcher */}
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Linux Kernel Asynchronous I/O &amp; Memory Subsystem
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-primary-200 bg-primary-50 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300">
                  Axboe 2019 / Linux 5.1 Invariant
                </span>
              </div>
              <h3 className="font-bold text-base text-text">
                Zero-Copy Linux Kernel I/O: Traditional read()/write() vs sendfile() &amp; io_uring
              </h3>
              <p className="text-xs text-text-muted max-w-3xl leading-relaxed">
                Contrast the 4 context switches and 4 data copies of traditional POSIX <code>read()</code>/<code>write()</code> against zero-copy <code>sendfile()</code> and Jens Axboe&apos;s breakthrough <code>io_uring</code> lockless circular ring buffers, which eliminate syscall overhead entirely via shared memory and asynchronous kernel polling (<code>SQPOLL</code>).
              </p>
            </div>

            {/* Architecture Selector */}
            <div className="bg-surface border border-border p-2.5 rounded-lg flex flex-col gap-1.5 min-w-[320px]">
              <span className="text-[11px] font-bold text-text uppercase tracking-wider">
                I/O Transmission Architecture:
              </span>
              <div className="grid grid-cols-3 gap-1 bg-canvas p-1 rounded-md border border-border text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIoMode('TRADITIONAL_READ_WRITE');
                    setIoStep(0);
                    setIoMetrics(initialMetrics.TRADITIONAL_READ_WRITE);
                  }}
                  className={`px-2 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    ioMode === 'TRADITIONAL_READ_WRITE'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  read()/write()
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIoMode('SENDFILE_ZERO_COPY');
                    setIoStep(0);
                    setIoMetrics(initialMetrics.SENDFILE_ZERO_COPY);
                  }}
                  className={`px-2 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    ioMode === 'SENDFILE_ZERO_COPY'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  sendfile()
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIoMode('IO_URING_RING_BUFFER');
                    setIoStep(0);
                    setIoMetrics(initialMetrics.IO_URING_RING_BUFFER);
                  }}
                  className={`px-2 py-1.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    ioMode === 'IO_URING_RING_BUFFER'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  io_uring
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Operations Bar */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              Kernel I/O Data Transmission Control:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <Button
                onClick={handleRunIOTransfer}
                variant="primary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                1. Execute 64KB I/O Transfer
              </Button>
              <Button
                onClick={handleZeroCopyReset}
                variant="secondary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                ↺ Reset I/O Pipeline
              </Button>
              <div className="flex items-center justify-center p-2 rounded-lg bg-canvas border border-border text-xs font-mono">
                <span className="text-text-muted mr-1.5">Status:</span>
                <span className={`font-bold ${ioStep > 0 ? 'text-emerald-600' : 'text-text-muted'}`}>
                  {ioStep > 0 ? 'TRANSFER_COMPLETED' : 'AWAITING_EXECUTION'}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Metrics Matrix Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Context Switches</span>
              <span className={`text-lg font-mono font-bold ${
                ioMetrics.contextSwitches === 0
                  ? 'text-emerald-600'
                  : ioMetrics.contextSwitches === 2
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}>
                {ioMetrics.contextSwitches}
              </span>
              <span className="text-[10px] text-text-muted block">User &harr; Kernel</span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted block">CPU Data Copies</span>
              <span className={`text-lg font-mono font-bold ${
                ioMetrics.cpuCopies === 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {ioMetrics.cpuCopies}
              </span>
              <span className="text-[10px] text-text-muted block">RAM &harr; RAM buffer</span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted block">DMA Transfers</span>
              <span className="text-lg font-mono font-bold text-emerald-600">
                {ioMetrics.dmaCopies}
              </span>
              <span className="text-[10px] text-text-muted block">Disk &amp; NIC direct</span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Syscalls</span>
              <span className={`text-lg font-mono font-bold ${
                ioMetrics.syscallCount === 0 ? 'text-emerald-600' : 'text-primary-700 dark:text-primary-400'
              }`}>
                {ioMetrics.syscallCount}
              </span>
              <span className="text-[10px] text-text-muted block">Per batch transfer</span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted block">Transfer Latency</span>
              <span className="text-lg font-mono font-bold text-text">
                {ioMetrics.latencyUs} &mu;s
              </span>
              <span className="text-[10px] text-text-muted block">Total wall time</span>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted block">CPU Overhead</span>
              <span className={`text-lg font-mono font-bold ${
                ioMetrics.cpuOverheadPct < 10
                  ? 'text-emerald-600'
                  : ioMetrics.cpuOverheadPct < 30
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}>
                {ioMetrics.cpuOverheadPct}%
              </span>
              <span className="text-[10px] text-text-muted block">Core cycles spent</span>
            </div>
          </div>

          {/* Interactive Memory Buffer Flow Pipeline */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h4 className="font-bold text-sm text-text">Kernel Space vs User Space Buffer Pipeline</h4>
                <span className="text-xs text-text-muted">
                  Traces data movement from persistent disk storage to hardware network interface card.
                </span>
              </div>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                ioMode === 'IO_URING_RING_BUFFER'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : ioMode === 'SENDFILE_ZERO_COPY'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300'
              }`}>
                Active: {ioMode}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Stage 1: Hardware Disk */}
              <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-2 text-center">
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase">1. Storage Media</span>
                <div className="text-xs font-bold text-text">Persistent NVMe / SSD</div>
                <div className="p-2 rounded bg-surface border border-border font-mono text-[11px]">
                  [File: data.bin]
                </div>
                <span className="text-[10px] text-emerald-600 font-bold block">DMA Controller</span>
              </div>

              {/* Stage 2: Kernel Page Cache */}
              <div className={`p-3.5 rounded-xl border space-y-2 text-center transition-all ${
                ioStep > 0
                  ? 'bg-emerald-50/40 border-emerald-400 dark:bg-emerald-950/20'
                  : 'bg-canvas border-border'
              }`}>
                <span className="text-[10px] font-mono font-bold text-primary-600 uppercase">2. Kernel Space</span>
                <div className="text-xs font-bold text-text">OS Page Cache Buffer</div>
                <div className="p-2 rounded bg-surface border border-border font-mono text-[11px] truncate">
                  {ioStep > 0 ? '0x8000_1000 (64KB)' : 'Empty Page'}
                </div>
                <span className="text-[10px] text-text-muted block">
                  {ioMode === 'TRADITIONAL_READ_WRITE' ? 'CPU Copy &rarr; User' : 'Zero-Copy Direct Pipe'}
                </span>
              </div>

              {/* Stage 3: User Space Buffer */}
              <div className={`p-3.5 rounded-xl border space-y-2 text-center transition-all ${
                ioMode === 'TRADITIONAL_READ_WRITE' && ioStep > 0
                  ? 'bg-rose-50/40 border-rose-400 dark:bg-rose-950/20'
                  : 'bg-canvas border-dashed border-border opacity-60'
              }`}>
                <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">3. User Space</span>
                <div className="text-xs font-bold text-text">App char buf[]</div>
                <div className="p-2 rounded bg-surface border border-border font-mono text-[11px] truncate">
                  {ioMode === 'TRADITIONAL_READ_WRITE' && ioStep > 0 ? '0x7fff_cafe (64KB)' : 'BYPASSED (0 COPIES)'}
                </div>
                <span className="text-[10px] text-text-muted block">
                  {ioMode === 'TRADITIONAL_READ_WRITE' ? '2 Syscalls + 2 Copies' : 'User space untouched ✓'}
                </span>
              </div>

              {/* Stage 4: Kernel Socket Buffer */}
              <div className={`p-3.5 rounded-xl border space-y-2 text-center transition-all ${
                ioStep > 0
                  ? 'bg-emerald-50/40 border-emerald-400 dark:bg-emerald-950/20'
                  : 'bg-canvas border-border'
              }`}>
                <span className="text-[10px] font-mono font-bold text-primary-600 uppercase">4. Kernel Space</span>
                <div className="text-xs font-bold text-text">Socket Buffer (sk_buff)</div>
                <div className="p-2 rounded bg-surface border border-border font-mono text-[11px] truncate">
                  {ioStep > 0 ? 'skb->data (64KB)' : 'Quiescent'}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold block">DMA Gather Ring</span>
              </div>

              {/* Stage 5: Hardware NIC */}
              <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-2 text-center">
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase">5. Network Media</span>
                <div className="text-xs font-bold text-text">10GbE Hardware NIC</div>
                <div className="p-2 rounded bg-surface border border-border font-mono text-[11px]">
                  [Wire: TCP Tx Frame]
                </div>
                <span className="text-[10px] text-emerald-600 font-bold block">Wire Emission ✓</span>
              </div>
            </div>
          </div>

          {/* io_uring Ring Buffer Inspector (Interactive in all modes) */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse" />
                <h4 className="font-bold text-sm text-text">io_uring Lockless Shared-Memory Ring Buffer Inspector</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-canvas">
                IORING_SETUP_SQPOLL
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Submission Queue (SQ) */}
              <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-text">
                  <span>Submission Queue Ring (sq): User Writes, Kernel Reads</span>
                  <span className="font-mono text-[10px] text-primary-600">head=0, tail=2</span>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  {sqEntries.map((sqe) => (
                    <div
                      key={sqe.index}
                      className="p-2 rounded bg-surface border border-border flex items-center justify-between text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text">SQE #{sqe.index}</span>
                        <span className="px-1.5 py-0.5 rounded bg-primary-50 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300 font-bold text-[10px]">
                          {sqe.opcode}
                        </span>
                        <span className="text-text-muted">fd={sqe.fd}, addr={sqe.bufferAddr}</span>
                      </div>
                      <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded border ${
                        sqe.status === 'PROCESSED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                      }`}>
                        {sqe.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Queue (CQ) */}
              <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-text">
                  <span>Completion Queue Ring (cq): Kernel Writes, User Reads</span>
                  <span className="font-mono text-[10px] text-emerald-600">
                    head={cqEntries.length > 0 ? 0 : 0}, tail={cqEntries.length}
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-xs">
                  {cqEntries.length === 0 ? (
                    <div className="p-4 text-center text-text-muted text-xs italic">
                      Completion queue empty. Execute I/O transfer in io_uring mode to populate CQEs.
                    </div>
                  ) : (
                    cqEntries.map((cqe) => (
                      <div
                        key={cqe.index}
                        className="p-2 rounded bg-emerald-50/40 border border-emerald-400 dark:bg-emerald-950/20 flex items-center justify-between text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text">CQE #{cqe.index}</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                            res = {cqe.resCode} Bytes OK
                          </span>
                        </div>
                        <span className="font-bold text-[10px] px-1.5 py-0.5 rounded border bg-emerald-100 text-emerald-800 border-emerald-300">
                          {cqe.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Audit Log */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-text">
              Real-Time Kernel I/O Execution Audit Stream
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {ioAuditLog.map((log) => (
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
                  <span className="text-[10px] text-text-muted">{log.mode}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Socratic Invariant Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                1. Context Switch Tax
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Every syscall requires CPU trap transition (sysenter/sysexit), flushing TLB entries and dirtying L1/L2 CPU caches. Standard read() + write() costs 4 context switches per packet batch.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. DMA vs CPU Memory Copies
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Direct Memory Access (DMA) transfers bytes asynchronously between hardware controllers and RAM. But copying bytes between Kernel Page Cache and User Space buffers requires CPU cycles and saturates memory bus bandwidth.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. sendfile() Zero-Copy
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                sendfile() keeps data strictly inside kernel memory. It passes file page descriptors directly to the socket queue, allowing the hardware NIC to perform DMA scatter-gather directly from Page Cache.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. io_uring Lockless Rings
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Jens Axboe&apos;s io_uring shares Submission and Completion circular queues via mmap(). With SQPOLL, a kernel thread polls submissions locklessly, achieving asynchronous I/O with 0 syscalls and 0 context switches.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 6: LINUX KERNEL VIRTUAL MEMORY, PAGE TABLES & TLB STUDIO */}
      {activeTab === 'VIRTUAL_MEMORY_PAGE_TABLES_TLB' && (
        <div className="p-6 space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-canvas border border-border p-5 rounded-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                  x86-64 Hardware MMU &amp; Linux Kernel Subsystem
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary-100 text-primary-900 border border-primary-300 font-bold">
                  Mode: 48-Bit Virtual Address Space
                </span>
              </div>
              <h3 className="text-base font-bold text-text">
                Virtual Memory, Multi-Level Page Tables &amp; Translation Lookaside Buffer (TLB)
              </h3>
              <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
                Translating a 48-bit virtual address requires traversing 4 hierarchical directory levels (PGD &rarr; PUD &rarr; PMD &rarr; PTE) rooted at the %cr3 register. Hardware TLBs cache translations to avoid 4 memory bus round trips per memory reference.
              </p>
              <div className="flex flex-wrap items-center gap-3 bg-surface border border-border px-3 py-1.5 rounded-lg text-xs font-mono mt-2">
                <span>TLB Hits: <strong className="text-emerald-700">{vmMetrics.tlbHits}</strong></span>
                <span>Misses: <strong className="text-amber-700">{vmMetrics.tlbMisses}</strong></span>
                <span>Page Walks: <strong className="text-indigo-700">{vmMetrics.pageWalks}</strong></span>
                <span>Page Faults: <strong className="text-purple-700">{vmMetrics.pageFaults}</strong></span>
                <span>Avg Latency: <strong className="text-text">{vmMetrics.avgLatencyCycles} cycles</strong></span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleHugePages}
                className="text-xs font-semibold"
              >
                {vmPageSize === '2MB_HUGE_PAGE' ? '✓ THP 2MB Active' : 'Switch to 2MB Huge Pages'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleFlushTLB}
                className="text-xs font-semibold text-rose-700 border-rose-300 hover:bg-rose-50"
              >
                Flush TLB (INVLPG)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetVM}
                className="text-xs font-semibold"
              >
                ↺ Reset MMU Lab
              </Button>
            </div>
          </div>

          {/* Preset Address Selector */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                Select Test Virtual Memory Address:
              </span>
              <span className="text-[11px] font-mono text-text-muted">
                Active: {vmActiveDecomp.segmentName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {[
                { hex: '0x7fff_cafe_4000', label: '1. Stack Pointer', desc: 'Hot stack (TLB Hit, 4KB)' },
                { hex: '0x0000_7f80_1000', label: '2. .text Segment', desc: 'Code (TLB Hit, R-X)' },
                { hex: '0x0000_55aa_0000', label: '3. Heap Allocation', desc: 'Cold page (TLB Miss, Walk)' },
                { hex: '0x0000_6000_0000', label: '4. Huge Page 2MB', desc: 'THP (PMD Leaf, 3 levels)' },
                { hex: '0x0000_1000_0000', label: '5. Fork COW Page', desc: 'Copy-on-Write (Soft Fault)' },
              ].map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => handleTranslateAddress(preset.hex)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    vmAddressInput === preset.hex
                      ? 'bg-primary-50 border-primary-400 text-primary-950 shadow-xs'
                      : 'bg-canvas border-border text-text hover:border-border-hover'
                  }`}
                >
                  <div className="text-xs font-bold">{preset.label}</div>
                  <div className="text-[11px] font-mono text-primary-800">{preset.hex}</div>
                  <div className="text-[10px] text-text-muted truncate mt-0.5">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 48-Bit Virtual Address Breakdown */}
          <div className="bg-canvas border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                48-Bit Canonical Virtual Address Decomposition
              </span>
              <span className="text-[11px] font-mono bg-surface border border-border px-2 py-0.5 rounded font-bold text-text">
                {vmActiveDecomp.rawHex}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2 text-center font-mono text-xs">
              <div className="bg-surface border border-border p-2 rounded-lg">
                <div className="text-[10px] text-text-muted font-bold">Sign Extension</div>
                <div className="text-sm font-bold text-text mt-1">16 Bits</div>
                <div className="text-[10px] text-text-muted">Canonical Guard</div>
              </div>
              <div className="bg-primary-50 border border-primary-300 p-2 rounded-lg">
                <div className="text-[10px] text-primary-800 font-bold">PGD Index (L4)</div>
                <div className="text-sm font-bold text-primary-950 mt-1">#{vmActiveDecomp.pgdIndex}</div>
                <div className="text-[10px] text-primary-700">Bits [47:39] (9b)</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-300 p-2 rounded-lg">
                <div className="text-[10px] text-indigo-800 font-bold">PUD Index (L3)</div>
                <div className="text-sm font-bold text-indigo-950 mt-1">#{vmActiveDecomp.pudIndex}</div>
                <div className="text-[10px] text-indigo-700">Bits [38:30] (9b)</div>
              </div>
              <div className="bg-purple-50 border border-purple-300 p-2 rounded-lg">
                <div className="text-[10px] text-purple-800 font-bold">PMD Index (L2)</div>
                <div className="text-sm font-bold text-purple-950 mt-1">#{vmActiveDecomp.pmdIndex}</div>
                <div className="text-[10px] text-purple-700">Bits [29:21] (9b)</div>
              </div>
              <div className="bg-amber-50 border border-amber-300 p-2 rounded-lg">
                <div className="text-[10px] text-amber-800 font-bold">PTE Index (L1)</div>
                <div className="text-sm font-bold text-amber-950 mt-1">#{vmActiveDecomp.pteIndex}</div>
                <div className="text-[10px] text-amber-700">Bits [20:12] (9b)</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-300 p-2 rounded-lg">
                <div className="text-[10px] text-emerald-800 font-bold">Page Offset</div>
                <div className="text-sm font-bold text-emerald-950 mt-1">{vmActiveDecomp.offset} B</div>
                <div className="text-[10px] text-emerald-700">Bits [11:0] (12b)</div>
              </div>
            </div>
          </div>

          {/* Translation Result Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              vmLastResult === 'TLB_HIT'
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : vmLastResult === 'PAGE_FAULT_COW'
                ? 'bg-purple-50/80 border-purple-300 text-purple-950'
                : 'bg-amber-50/80 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {vmLastResult === 'TLB_HIT' ? '⚡' : vmLastResult === 'PAGE_FAULT_COW' ? '🛡️' : '🔍'}
              </span>
              <div>
                <div className="text-sm font-bold">
                  {vmLastResult === 'TLB_HIT'
                    ? 'TLB Hit: Instant 1-Cycle MMU Translation'
                    : vmLastResult === 'PAGE_FAULT_COW'
                    ? 'Soft Page Fault: Copy-on-Write (COW) Frame Duplicate'
                    : 'TLB Miss: Full 4-Level Page Table Walk Initiated'}
                </div>
                <div className="text-xs text-text-muted mt-0.5">
                  {vmLastResult === 'TLB_HIT'
                    ? 'Virtual Page Number found in hardware TLB cache. Zero main-memory page table references required.'
                    : vmLastResult === 'PAGE_FAULT_COW'
                    ? 'Child thread attempted write to shared copy-on-write frame. Kernel cloned 4KB and cleared write-protection.'
                    : 'Address not in TLB. MMU initiated 4 sequential DRAM reads to traverse PGD, PUD, PMD, and PTE.'}
                </div>
              </div>
            </div>

            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white/80 border border-border text-text">
              {vmLastResult === 'TLB_HIT' ? '1 Cycle' : vmLastResult === 'PAGE_FAULT_COW' ? '1,200 Cycles' : '241 Cycles'}
            </span>
          </div>

          {/* TLB Cache Inspector & Multi-Level Page Walk Pathway */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TLB Cache Table */}
            <div className="bg-canvas border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                  Translation Lookaside Buffer (L1 D-TLB Cache)
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Fully Associative / Tag Indexed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-text-muted font-mono">
                      <th className="py-1.5 pr-2">VPN Tag</th>
                      <th className="py-1.5 px-2">PFN Frame</th>
                      <th className="py-1.5 px-2">Page Size</th>
                      <th className="py-1.5 px-2">Perms</th>
                      <th className="py-1.5 pl-2 text-right">Hits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-[11px]">
                    {tlbEntries.map((tlb) => (
                      <tr
                        key={tlb.vpn}
                        className={`${tlb.valid ? 'text-text' : 'text-text-muted opacity-40 line-through'}`}
                      >
                        <td className="py-2 pr-2 font-bold text-primary-900">{tlb.vpn}</td>
                        <td className="py-2 px-2 text-emerald-800 font-semibold">{tlb.pfn}</td>
                        <td className="py-2 px-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            tlb.pageSize === '2MB_HUGE_PAGE' ? 'bg-indigo-100 text-indigo-900' : 'bg-surface border border-border'
                          }`}>
                            {tlb.pageSize === '2MB_HUGE_PAGE' ? '2MB THP' : '4KB'}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-semibold">{tlb.permissions}</td>
                        <td className="py-2 pl-2 text-right font-bold text-accent-700">{tlb.hits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Multi-Level Page Walk Pathway */}
            <div className="bg-canvas border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                  Multi-Level Page Walk Pathway (MMU State Machine)
                </span>
                <span className="text-[11px] font-mono text-amber-800 font-semibold">
                  {vmPageSize === '2MB_HUGE_PAGE' ? '3 Levels (Bypasses PTE)' : '4 Levels (PGD &rarr; PTE)'}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {vmPageWalkSteps.map((step, sIdx) => {
                  const isSkipped = vmPageSize === '2MB_HUGE_PAGE' && step.level === 'PTE';
                  return (
                    <div
                      key={step.level}
                      className={`p-2 rounded border flex items-center justify-between ${
                        isSkipped
                          ? 'bg-neutral-50 border-neutral-200 text-neutral-400 opacity-40 line-through'
                          : step.level === 'PHYSICAL_FRAME'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-surface border-border text-text'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-900 flex items-center justify-center text-[10px] font-bold">
                          {sIdx + 1}
                        </span>
                        <span className="font-bold">{step.level}:</span>
                        <span className="text-[11px] text-text-muted truncate max-w-[200px]">{step.tableName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-primary-800 font-semibold truncate max-w-[140px]">
                          {step.entryValue}
                        </span>
                        <span className="text-[10px] bg-canvas px-1.5 py-0.5 rounded border border-border text-text-muted">
                          +{step.latencyCycles}c
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quantitative Performance Benchmark Matrix */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-xs font-bold text-text uppercase tracking-wider">
                Virtual Memory Architecture KPI Matrix: 4KB Standard vs 2MB Transparent Huge Pages (THP)
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                512x TLB Coverage Reach
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="py-1.5 pr-4 font-semibold">MMU Performance Characteristic</th>
                    <th className="py-1.5 px-4 font-semibold">4KB Standard Paging</th>
                    <th className="py-1.5 px-4 font-semibold">2MB Transparent Huge Pages</th>
                    <th className="py-1.5 pl-4 font-semibold text-right">Advantage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-[11px]">
                  <tr>
                    <td className="py-2 pr-4 font-sans font-medium text-text">64-Entry TLB Coverage Reach</td>
                    <td className="py-2 px-4 text-amber-700">256 KB (64 × 4KB)</td>
                    <td className="py-2 px-4 text-emerald-700 font-bold">128 MB (64 × 2MB)</td>
                    <td className="py-2 pl-4 text-right text-emerald-700 font-bold">512x Greater Reach</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-sans font-medium text-text">Page Table Walk Depth</td>
                    <td className="py-2 px-4 text-amber-700">4 Levels (PGD &rarr; PTE)</td>
                    <td className="py-2 px-4 text-emerald-700 font-bold">3 Levels (PMD Direct Leaf)</td>
                    <td className="py-2 pl-4 text-right text-emerald-700 font-bold">25% Fewer DRAM Cycles</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-sans font-medium text-text">DRAM Accesses per TLB Miss</td>
                    <td className="py-2 px-4 text-amber-700">4 DRAM Memory Reads</td>
                    <td className="py-2 px-4 text-emerald-700 font-bold">3 DRAM Memory Reads</td>
                    <td className="py-2 pl-4 text-right text-emerald-700 font-bold">1 Bus Roundtrip Saved</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-sans font-medium text-text">Internal Memory Fragmentation</td>
                    <td className="py-2 px-4 text-emerald-700 font-bold">Low (Avg 2KB / allocation)</td>
                    <td className="py-2 px-4 text-amber-700">High (Up to 2MB wasted if sparse)</td>
                    <td className="py-2 pl-4 text-right text-text-muted">4KB Wins for Small Heaps</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Kernel MMU Audit Log */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-text">
              Real-Time Kernel MMU &amp; Page Fault Execution Audit Stream
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {vmAuditLog.map((log) => (
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
                </div>
              ))}
            </div>
          </div>

          {/* 4 Socratic Invariant Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                1. Multi-Level Page Efficiency
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                A flat 48-bit page table requires 512 GB of RAM per process. Hierarchical multi-level page tables allocate directory pages on demand, keeping memory overhead under 2MB for typical process working sets.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. TLB Reach &amp; Memory Wall
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                TLB Reach is Entries &times; PageSize. With 4KB pages, 64 TLB entries covers only 256KB. Modern high-throughput databases suffer severe TLB thrashing unless Transparent Huge Pages (2MB) are deployed.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. Copy-on-Write (COW) Fork
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Linux fork() duplicates page tables in O(1) without copying RAM, marking all PTEs read-only. The first write triggers a benign Soft Page Fault, allocating a private physical frame on demand.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. TLB Shootdown Overhead
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                When a thread unmaps shared memory or changes permissions, the kernel must send Inter-Processor Interrupts (IPI) to all other CPU cores to invalidate their local TLBs (TLB Shootdown), stalling execution.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODULE 7: TCP BBR CONGESTION CONTROL & BUFFERBLOAT STUDIO */}
      {/* ======================================================== */}
      {activeTab === 'TCP_BBR_BUFFERBLOAT' && (() => {
        // Compute active snapshot based on parameters
        const baseBdp = Math.round((bbrBottleneckBw * 20) / 40); // 25 pkts for 50 Mbps
        const burstOffset = bbrInjectedBurst ? 30 : 0;

        const snapshots: BbrStepSnapshot[] = [
          // Step 1: System Baseline & The Kleinrock Operating Point
          {
            stepIndex: 1,
            title: 'System Baseline & The Kleinrock Operating Point',
            explanation:
              'Leonard Kleinrock (1979) established that the optimal congestion control operating point occurs where inflight data exactly equals the Bandwidth-Delay Product (BDP = BtlBw × RTprop). At this inflection point, bottleneck bandwidth is 100% saturated while packet queuing delay is exactly zero. Traditional loss-based algorithms cannot operate here because they require buffer overflow to detect congestion.',
            algorithm: 'BBR_CARDWELL',
            bbrState: 'PROBE_BW',
            pacingGain: 1.0,
            cwndGain: 2.0,
            cwndPackets: baseBdp,
            inflightPackets: baseBdp,
            bdpPackets: baseBdp,
            routerQueuePackets: 0,
            routerQueueCapacity: bbrQueueCapacity,
            bottleneckBwMbps: bbrBottleneckBw,
            rtPropMs: 20,
            measuredRttMs: 20,
            deliveryRateMbps: bbrBottleneckBw,
            pacingRateMbps: bbrBottleneckBw,
            droppedPacketsCount: 0,
            phaseCycleIndex: 2,
            socketStats: {
              skPacingRate: String(bbrBottleneckBw) + '.0 Mbps',
              bbrBw: String(bbrBottleneckBw) + '.0 Mbps (Max Filter)',
              minRttUs: '20,000 us (20.0 ms)',
              sndCwnd: baseBdp,
              packetsOut: baseBdp,
              pacingGainVal: '1.0x (Cruise)',
              cwndGainVal: '2.0x',
            },
            banner: {
              type: 'OPTIMAL',
              title: 'Kleinrock Optimal Point: Zero Queuing Delay & 100% Wire Saturation',
              description:
                'Inflight packets (' + String(baseBdp) + ') exactly match physical BDP. The ' + String(bbrBottleneckBw) + ' Mbps bottleneck link runs at 100% capacity with 0 queued packets in the router buffer. RTT is 20 ms.',
            },
          },

          // Step 2: Loss-Based Reno/CUBIC Additive Increase: The Bufferbloat Trap
          {
            stepIndex: 2,
            title: 'Loss-Based Reno/CUBIC Additive Increase: The Bufferbloat Trap',
            explanation:
              'Bufferbloat is the latency inflation caused by over-sized router buffers. Loss-based congestion algorithms (Reno, CUBIC) blindly increase their congestion window (AIMD: +1 packet per RTT) as long as ACKs arrive without loss. Because the bottleneck wire can only transmit at BtlBw, excess packets pile up in the deep router FIFO buffer, bloating RTT from 20ms to 60ms with zero throughput gain.',
            algorithm: 'RENO_LOSS_BASED',
            bbrState: 'STARTUP',
            pacingGain: 1.0,
            cwndGain: 1.0,
            cwndPackets: baseBdp * 3,
            inflightPackets: baseBdp * 3 + burstOffset,
            bdpPackets: baseBdp,
            routerQueuePackets: Math.min(bbrQueueCapacity, baseBdp * 2 + burstOffset),
            routerQueueCapacity: bbrQueueCapacity,
            bottleneckBwMbps: bbrBottleneckBw,
            rtPropMs: 20,
            measuredRttMs: 20 + Math.round(((baseBdp * 2 + burstOffset) / (baseBdp / 20))),
            deliveryRateMbps: bbrBottleneckBw,
            pacingRateMbps: bbrBottleneckBw * 2,
            droppedPacketsCount: 0,
            phaseCycleIndex: 0,
            socketStats: {
              skPacingRate: 'Unpaced (Line Rate Burst)',
              bbrBw: 'N/A (Loss-Based)',
              minRttUs: '20,000 us',
              sndCwnd: baseBdp * 3,
              packetsOut: baseBdp * 3 + burstOffset,
              pacingGainVal: 'N/A',
              cwndGainVal: 'N/A',
            },
            banner: {
              type: 'BLOAT_ALERT',
              title: '⚠️ Bufferbloat Hazard: Standing Queue Inflates Latency by 300%',
              description:
                'Reno pumps ' + String(baseBdp * 2 + burstOffset) + ' excess packets into the router buffer. RTT surges from 20 ms to ' + String(20 + Math.round(((baseBdp * 2 + burstOffset) / (baseBdp / 20)))) + ' ms. Memory bus and router switch buffers are clogged with zero extra throughput.',
            },
          },

          // Step 3: Buffer Overflow & Tail Drop: Packet Loss and Window Halving
          {
            stepIndex: 3,
            title: 'Buffer Overflow & Tail Drop: Packet Loss and Halving Collapse',
            explanation:
              'Once the deep router buffer fills to 100% capacity, arriving packets are tail dropped. Reno interprets this loss as the first signal to slow down, cutting cwnd in half. However, while cwnd collapses, the standing queue takes hundreds of milliseconds to drain, keeping latency bloated while throughput plummets due to retransmission stalls.',
            algorithm: 'RENO_LOSS_BASED',
            bbrState: 'STARTUP',
            pacingGain: 1.0,
            cwndGain: 1.0,
            cwndPackets: Math.round(bbrQueueCapacity / 2),
            inflightPackets: bbrQueueCapacity,
            bdpPackets: baseBdp,
            routerQueuePackets: bbrQueueCapacity,
            routerQueueCapacity: bbrQueueCapacity,
            bottleneckBwMbps: bbrBottleneckBw,
            rtPropMs: 20,
            measuredRttMs: 20 + Math.round((bbrQueueCapacity / (baseBdp / 20))),
            deliveryRateMbps: Math.round(bbrBottleneckBw * 0.64),
            pacingRateMbps: bbrBottleneckBw,
            droppedPacketsCount: 8,
            phaseCycleIndex: 0,
            socketStats: {
              skPacingRate: 'Unpaced (Tail Drop)',
              bbrBw: 'N/A',
              minRttUs: '20,000 us',
              sndCwnd: Math.round(bbrQueueCapacity / 2),
              packetsOut: bbrQueueCapacity,
              pacingGainVal: 'N/A',
              cwndGainVal: 'N/A',
            },
            banner: {
              type: 'LOSS_EVENT',
              title: '💥 Tail Drop Event: Buffer Saturated & Multiplicative cwnd Collapse',
              description:
                'Router buffer at 100% capacity (' + String(bbrQueueCapacity) + ' pkts). 8 packets dropped. Reno cuts cwnd to ' + String(Math.round(bbrQueueCapacity / 2)) + ', triggering retransmission stalls while latency remains pinned at ' + String(20 + Math.round((bbrQueueCapacity / (baseBdp / 20)))) + ' ms.',
            },
          },

          // Step 4: BBR State Machine Phase 1: STARTUP (Bandwidth Discovery)
          {
            stepIndex: 4,
            title: 'BBR State Machine Phase 1: STARTUP (Bottleneck Bandwidth Search)',
            explanation:
              'Rather than probing until loss occurs, BBR STARTUP doubles sending rate each RTT using a pacing gain of 2/ln(2) ≈ 2.89. BBR monitors delivery rate: as long as sending faster increases throughput, the pipe has capacity. Once delivery rate plateaus (<25% gain across 3 rounds), BBR records the detected bottleneck capacity (50 Mbps) and transitions immediately to DRAIN.',
            algorithm: 'BBR_CARDWELL',
            bbrState: 'STARTUP',
            pacingGain: 2.89,
            cwndGain: 2.89,
            cwndPackets: baseBdp * 2,
            inflightPackets: baseBdp * 2,
            bdpPackets: baseBdp,
            routerQueuePackets: baseBdp,
            routerQueueCapacity: bbrQueueCapacity,
            bottleneckBwMbps: bbrBottleneckBw,
            rtPropMs: 20,
            measuredRttMs: 40,
            deliveryRateMbps: bbrBottleneckBw,
            pacingRateMbps: Math.round(bbrBottleneckBw * 2.89),
            droppedPacketsCount: 0,
            phaseCycleIndex: 0,
            socketStats: {
              skPacingRate: String(Math.round(bbrBottleneckBw * 2.89)) + '.0 Mbps',
              bbrBw: String(bbrBottleneckBw) + '.0 Mbps (Detected BtlBw)',
              minRttUs: '20,000 us',
              sndCwnd: baseBdp * 2,
              packetsOut: baseBdp * 2,
              pacingGainVal: '2.89x (2/ln2)',
              cwndGainVal: '2.89x',
            },
            banner: {
              type: 'STARTUP',
              title: 'BBR STARTUP: Exponential Search Discovers Bottleneck at 50 Mbps',
              description:
                'Pacing gain 2.89 doubles rate every RTT. Throughput plateau detected at ' + String(bbrBottleneckBw) + ' Mbps. BBR halts expansion without overflowing the buffer or causing packet loss.',
            },
          },

          // Step 5: BBR State Machine Phase 2: DRAIN (Purging the Startup Queue)
          {
            stepIndex: 5,
            title: 'BBR State Machine Phase 2: DRAIN (Purging the Startup Queue)',
            explanation:
              'STARTUP creates a temporary queue equal to one BDP. BBR enters DRAIN with pacing gain 1/2.89 ≈ 0.35, deliberately sending below the bottleneck rate. This under-pacing allows the router buffer to completely drain its excess packets into the receiver, returning router queue depth to 0 and restoring RTT to the physical minimum of 20 ms.',
            algorithm: 'BBR_CARDWELL',
            bbrState: 'DRAIN',
            pacingGain: 0.35,
            cwndGain: 2.0,
            cwndPackets: baseBdp,
            inflightPackets: baseBdp,
            bdpPackets: baseBdp,
            routerQueuePackets: 0,
            routerQueueCapacity: bbrQueueCapacity,
            bottleneckBwMbps: bbrBottleneckBw,
            rtPropMs: 20,
            measuredRttMs: 20,
            deliveryRateMbps: bbrBottleneckBw,
            pacingRateMbps: Math.round(bbrBottleneckBw * 0.35),
            droppedPacketsCount: 0,
            phaseCycleIndex: 0,
            socketStats: {
              skPacingRate: String(Math.round(bbrBottleneckBw * 0.35)) + '.0 Mbps',
              bbrBw: String(bbrBottleneckBw) + '.0 Mbps',
              minRttUs: '20,000 us',
              sndCwnd: baseBdp,
              packetsOut: baseBdp,
              pacingGainVal: '0.35x (1/2.89)',
              cwndGainVal: '2.0x',
            },
            banner: {
              type: 'DRAIN',
              title: 'BBR DRAIN: Queue Drained to Zero via Under-Pacing (0.35x Gain)',
              description:
                'BBR paces below link capacity until inflight equals BDP. Standing queue is purged back to 0 packets, restoring speed-of-light 20 ms latency.',
            },
          },

          // Step 6: BBR State Machine Phase 3: PROBE_BW (Cyclic Pacing Gain Cycling)
          {
            stepIndex: 6,
            title: 'BBR State Machine Phase 3: PROBE_BW (Cyclic Pacing Gain Cycling)',
            explanation:
              'To adapt to dynamic network conditions, BBR cycles through an 8-phase pacing gain array: [1.25, 0.75, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]. Phase 0 (1.25x) injects 25% extra data to probe for newly available bandwidth; Phase 1 (0.75x) immediately drains the queue created by Phase 0; Phases 2-7 (1.0x) cruise at 100% link utilization with zero standing queue.',
            algorithm: 'BBR_CARDWELL',
            bbrState: 'PROBE_BW',
            pacingGain: 1.25,
            cwndGain: 2.0,
            cwndPackets: Math.round(baseBdp * 1.25),
            inflightPackets: baseBdp,
            bdpPackets: baseBdp,
            routerQueuePackets: 0,
            routerQueueCapacity: bbrQueueCapacity,
            bottleneckBwMbps: bbrBottleneckBw,
            rtPropMs: 20,
            measuredRttMs: 20,
            deliveryRateMbps: bbrBottleneckBw,
            pacingRateMbps: Math.round(bbrBottleneckBw * 1.25),
            droppedPacketsCount: 0,
            phaseCycleIndex: 0,
            socketStats: {
              skPacingRate: String(Math.round(bbrBottleneckBw * 1.25)) + '.0 Mbps (Probe) / ' + String(bbrBottleneckBw) + ' Mbps (Cruise)',
              bbrBw: String(bbrBottleneckBw) + '.0 Mbps',
              minRttUs: '20,000 us',
              sndCwnd: Math.round(baseBdp * 1.25),
              packetsOut: baseBdp,
              pacingGainVal: '[1.25, 0.75, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]',
              cwndGainVal: '2.0x',
            },
            banner: {
              type: 'PROBING',
              title: 'BBR PROBE_BW: 8-Phase Gain Modulation Probes Bandwidth Without Bloat',
              description:
                'Pacing alternates between 1.25x (bandwidth probe), 0.75x (queue drain), and 1.0x (steady-state cruise). Zero persistent queues accumulate.',
            },
          },

          // Step 7: BBR State Machine Phase 4: PROBE_RTT (Min-RTT Unmasking)
          {
            stepIndex: 7,
            title: 'BBR State Machine Phase 4: PROBE_RTT (Min-RTT Unmasking)',
            explanation:
              'Because network routing and queue states evolve, BBR must periodically re-measure true physical RTprop. Every 10 seconds, if min_rtt has not been refreshed, BBR enters PROBE_RTT, clamping cwnd to 4 packets for 200 ms. With only 4 packets inflight, queues across every intermediary router drain to zero, enabling accurate sampling of speed-of-light fiber propagation delay.',
            algorithm: 'BBR_CARDWELL',
            bbrState: 'PROBE_RTT',
            pacingGain: 1.0,
            cwndGain: 1.0,
            cwndPackets: 4,
            inflightPackets: 4,
            bdpPackets: baseBdp,
            routerQueuePackets: 0,
            routerQueueCapacity: bbrQueueCapacity,
            bottleneckBwMbps: bbrBottleneckBw,
            rtPropMs: 20,
            measuredRttMs: 20,
            deliveryRateMbps: bbrBottleneckBw,
            pacingRateMbps: bbrBottleneckBw,
            droppedPacketsCount: 0,
            phaseCycleIndex: 0,
            socketStats: {
              skPacingRate: String(bbrBottleneckBw) + '.0 Mbps',
              bbrBw: String(bbrBottleneckBw) + '.0 Mbps',
              minRttUs: '20,000 us (RTprop Refreshed)',
              sndCwnd: 4,
              packetsOut: 4,
              pacingGainVal: '1.0x (Probe-RTT Clamp)',
              cwndGainVal: '1.0x',
            },
            banner: {
              type: 'OPTIMAL',
              title: 'BBR PROBE_RTT: cwnd Clamped to 4 Packets to Measure True RTprop',
              description:
                'Inflight is clamped to 4 packets for 200 ms. All queues along the internet path drain, unmasking true physical fiber propagation delay (20 ms).',
            },
          },

          // Step 8: Quantitative Bufferbloat & Latency Benchmark Table
          {
            stepIndex: 8,
            title: 'Quantitative Bufferbloat Benchmark: BBR vs Reno/CUBIC Invariants',
            explanation:
              'BBR decouples congestion control from packet loss. By continuously pacing data at bottleneck bandwidth and holding inflight at BDP, BBR eliminates bufferbloat, slashes latency by up to 5x-25x, avoids loss-induced throughput collapses, and operates right at Kleinrock’s optimal performance point.',
            algorithm: 'BBR_CARDWELL',
            bbrState: 'PROBE_BW',
            pacingGain: 1.0,
            cwndGain: 2.0,
            cwndPackets: baseBdp,
            inflightPackets: baseBdp,
            bdpPackets: baseBdp,
            routerQueuePackets: 0,
            routerQueueCapacity: bbrQueueCapacity,
            bottleneckBwMbps: bbrBottleneckBw,
            rtPropMs: 20,
            measuredRttMs: 20,
            deliveryRateMbps: bbrBottleneckBw,
            pacingRateMbps: bbrBottleneckBw,
            droppedPacketsCount: 0,
            phaseCycleIndex: 2,
            socketStats: {
              skPacingRate: String(bbrBottleneckBw) + '.0 Mbps',
              bbrBw: String(bbrBottleneckBw) + '.0 Mbps',
              minRttUs: '20,000 us',
              sndCwnd: baseBdp,
              packetsOut: baseBdp,
              pacingGainVal: '1.0x',
              cwndGainVal: '2.0x',
            },
            banner: {
              type: 'OPTIMAL',
              title: '✓ TCP BBR Congestion Control Verified: 5x Lower Latency & 0% Packet Loss',
              description:
                'BBR maintains zero standing queue, continuous line-rate saturation, and immunity to shallow random packet loss on wireless and modern networks.',
            },
          },
        ];

        const currentSnap = snapshots[bbrStepIndex] || snapshots[0];

        return (
          <div className="p-6 space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-canvas border border-border p-5 rounded-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-800">
                    Linux Kernel Network Stack • net/ipv4/tcp_bbr.c
                  </span>
                  <span className="text-[10px] font-mono bg-primary-100 text-primary-800 font-semibold px-2 py-0.5 rounded">
                    Cardwell &amp; Cheng (ACM Queue 2016)
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text">
                  TCP BBR Congestion Control vs Loss-Based Reno/CUBIC &amp; Bufferbloat Studio
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Model-based congestion control that decouples throughput from packet loss. BBR regulates sending rates via physical Bandwidth-Delay Product (BDP) pacing, eliminating standing router queues and crushing bufferbloat latency.
                </p>
              </div>

              {/* Step Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary"
                  size="sm"
                  onClick={() => setBbrStepIndex((prev) => Math.max(0, prev - 1))}
                  disabled={bbrStepIndex === 0}
                  className="cursor-pointer"
                >
                  Previous Step
                </Button>
                <span className="text-xs font-mono font-bold px-3 py-1 bg-surface border border-border rounded-md">
                  Step {bbrStepIndex + 1} of {snapshots.length}
                </span>
                <Button variant="secondary"
                  size="sm"
                  onClick={() => setBbrStepIndex((prev) => Math.min(snapshots.length - 1, prev + 1))}
                  disabled={bbrStepIndex === snapshots.length - 1}
                  className="cursor-pointer"
                >
                  Next Step
                </Button>
                <Button variant="secondary"
                  size="sm"
                  onClick={() => {
                    setBbrStepIndex(0);
                    setBbrSelectedAlgo('BBR_CARDWELL');
                    setBbrInjectedBurst(false);
                  }}
                  className="cursor-pointer text-xs"
                >
                  Reset Studio
                </Button>
              </div>
            </div>

            {/* Status Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                currentSnap.banner.type === 'OPTIMAL'
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : currentSnap.banner.type === 'BLOAT_ALERT'
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                  : currentSnap.banner.type === 'LOSS_EVENT'
                  ? 'bg-red-50/80 border-red-300 text-red-950'
                  : currentSnap.banner.type === 'STARTUP'
                  ? 'bg-purple-50/80 border-purple-300 text-purple-950'
                  : 'bg-primary-50/80 border-primary-300 text-primary-950'
              }`}
            >
              <div className="text-lg">
                {currentSnap.banner.type === 'OPTIMAL'
                  ? '✓'
                  : currentSnap.banner.type === 'BLOAT_ALERT'
                  ? '⚠️'
                  : currentSnap.banner.type === 'LOSS_EVENT'
                  ? '💥'
                  : currentSnap.banner.type === 'STARTUP'
                  ? '🚀'
                  : '🔄'}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold">{currentSnap.banner.title}</div>
                <div className="text-xs text-text-muted leading-relaxed">
                  {currentSnap.banner.description}
                </div>
              </div>
            </div>

            {/* Interactive Protocol & Physical Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Algorithm Switcher */}
              <div className="bg-canvas border border-border rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                  Congestion Control Algorithm:
                </span>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {(['BBR_CARDWELL', 'RENO_LOSS_BASED', 'CUBIC_LOSS_BASED'] as TcpCongestionAlgorithm[]).map((alg) => (
                    <button
                      key={alg}
                      type="button"
                      onClick={() => {
                        setBbrSelectedAlgo(alg);
                        if (alg === 'RENO_LOSS_BASED') setBbrStepIndex(1);
                        else if (alg === 'BBR_CARDWELL') setBbrStepIndex(0);
                        else setBbrStepIndex(1);
                      }}
                      className={`text-xs font-semibold py-1.5 px-2 rounded-lg border transition-all cursor-pointer text-center ${
                        bbrSelectedAlgo === alg
                          ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                          : 'bg-surface border-border text-text-muted hover:text-text'
                      }`}
                    >
                      {alg === 'BBR_CARDWELL' ? 'BBR' : alg === 'RENO_LOSS_BASED' ? 'Reno' : 'CUBIC'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Router Buffer Capacity Selector */}
              <div className="bg-canvas border border-border rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                  Bottleneck Router Buffer Depth:
                </span>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[50, 100, 200].map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setBbrQueueCapacity(cap)}
                      className={`text-xs font-mono font-semibold py-1.5 px-2 rounded-lg border transition-all cursor-pointer text-center ${
                        bbrQueueCapacity === cap
                          ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                          : 'bg-surface border-border text-text-muted hover:text-text'
                      }`}
                    >
                      {cap} pkts
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottleneck Bandwidth Selector & Burst Trigger */}
              <div className="bg-canvas border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Bottleneck Bandwidth:
                  </span>
                  <button
                    type="button"
                    onClick={() => setBbrInjectedBurst(!bbrInjectedBurst)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      bbrInjectedBurst
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {bbrInjectedBurst ? 'Burst Active (+30 pkts)' : '+ Inject Burst'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {[25, 50, 100].map((bw) => (
                    <button
                      key={bw}
                      type="button"
                      onClick={() => setBbrBottleneckBw(bw)}
                      className={`text-xs font-mono font-semibold py-1.5 px-2 rounded-lg border transition-all cursor-pointer text-center ${
                        bbrBottleneckBw === bw
                          ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                          : 'bg-surface border-border text-text-muted hover:text-text'
                      }`}
                    >
                      {bw} Mbps
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Oscilloscope: Bottleneck Router Queue & Bufferbloat Display */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-800">
                    Bottleneck Router Queue Oscilloscope
                  </span>
                  <div className="text-xs text-text-muted">
                    Buffer Fill: <strong className="text-text font-mono">{currentSnap.routerQueuePackets} / {currentSnap.routerQueueCapacity} packets</strong> ({Math.round((currentSnap.routerQueuePackets / currentSnap.routerQueueCapacity) * 100)}% capacity)
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className={`px-2.5 py-1 rounded font-bold ${
                    currentSnap.routerQueuePackets === 0
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : currentSnap.routerQueuePackets >= currentSnap.routerQueueCapacity
                      ? 'bg-red-100 text-red-900 border border-red-300 animate-pulse'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    Queuing Delay: +{currentSnap.measuredRttMs - currentSnap.rtPropMs} ms
                  </span>
                  <span className="bg-canvas border border-border px-2.5 py-1 rounded text-text-muted">
                    Total RTT: <strong className="text-text">{currentSnap.measuredRttMs} ms</strong>
                  </span>
                </div>
              </div>

              {/* Visual Buffer Bar */}
              <div className="space-y-2">
                <div className="w-full bg-canvas border border-border rounded-lg h-10 p-1 flex items-center gap-1 overflow-hidden relative">
                  {/* Inflight wire packets */}
                  <div
                    style={{ width: String(Math.min(100, (currentSnap.bdpPackets / currentSnap.routerQueueCapacity) * 100)) + '%' }}
                    className="h-full bg-emerald-500/80 rounded flex items-center justify-center text-[10px] font-bold text-white transition-all overflow-hidden"
                    title="Inflight on Wire (BDP)"
                  >
                    BDP Wire ({currentSnap.bdpPackets} pkts)
                  </div>

                  {/* Queued standing packets (Bufferbloat) */}
                  {currentSnap.routerQueuePackets > 0 && (
                    <div
                      style={{
                        width: String(Math.min(
                          100 - (currentSnap.bdpPackets / currentSnap.routerQueueCapacity) * 100,
                          (currentSnap.routerQueuePackets / currentSnap.routerQueueCapacity) * 100
                        )) + '%',
                      }}
                      className={`h-full rounded flex items-center justify-center text-[10px] font-bold text-white transition-all overflow-hidden ${
                        currentSnap.routerQueuePackets >= currentSnap.routerQueueCapacity
                          ? 'bg-red-600 animate-pulse'
                          : 'bg-amber-500'
                      }`}
                      title="Queued Packets (Bufferbloat)"
                    >
                      Queue Bloat ({currentSnap.routerQueuePackets} pkts)
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted font-mono pt-1">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-emerald-500 rounded-xs inline-block" />
                      Inflight Wire (BDP = {currentSnap.bdpPackets} pkts)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-amber-500 rounded-xs inline-block" />
                      Standing Queue (Bufferbloat = {currentSnap.routerQueuePackets} pkts)
                    </span>
                    {currentSnap.droppedPacketsCount > 0 && (
                      <span className="flex items-center gap-1.5 text-red-700 font-bold">
                        <span className="w-3 h-3 bg-red-600 rounded-xs inline-block" />
                        Tail Dropped ({currentSnap.droppedPacketsCount} pkts)
                      </span>
                    )}
                  </div>
                  <span>Buffer Capacity: {currentSnap.routerQueueCapacity} packets</span>
                </div>
              </div>
            </div>

            {/* Kleinrock Latency-Throughput Phase Diagram & Kernel Socket Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Kleinrock Operating Curve */}
              <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text">
                    Kleinrock Congestion Operating Curve
                  </span>
                  <span className="text-[10px] font-mono text-primary-700 bg-primary-50 px-2 py-0.5 rounded font-bold">
                    Inflight vs Throughput &amp; Latency
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Delivery Rate Curve */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Delivery Rate (Throughput):</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {currentSnap.deliveryRateMbps}.0 Mbps (Capacity: {bbrBottleneckBw} Mbps)
                      </span>
                    </div>
                    <div className="w-full bg-surface border border-border h-3 rounded-full overflow-hidden">
                      <div
                        style={{ width: String((currentSnap.deliveryRateMbps / bbrBottleneckBw) * 100) + '%' }}
                        className="h-full bg-emerald-600 rounded-full transition-all"
                      />
                    </div>
                  </div>

                  {/* RTT Latency Curve */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-text-muted">Round-Trip Time (RTT Latency):</span>
                      <span className={`font-mono font-bold ${
                        currentSnap.measuredRttMs === 20 ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {currentSnap.measuredRttMs} ms (Physical RTprop: 20 ms)
                      </span>
                    </div>
                    <div className="w-full bg-surface border border-border h-3 rounded-full overflow-hidden">
                      <div
                        style={{ width: String(Math.min(100, (currentSnap.measuredRttMs / 100) * 100)) + '%' }}
                        className={`h-full rounded-full transition-all ${
                          currentSnap.measuredRttMs === 20 ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Kleinrock Invariant Explainer */}
                  <div className="p-3 bg-surface border border-border rounded-lg text-[11px] text-text-muted leading-relaxed">
                    <strong className="text-text block mb-0.5">The Kleinrock Dilemma:</strong>
                    Operating below BDP starves the wire; operating above BDP inflates queuing delay without increasing delivery rate. Loss-based TCP operates far to the right in the bufferbloat zone; BBR clamps inflight precisely at the knee (BDP).
                  </div>
                </div>
              </div>

              {/* Linux Kernel Socket State Inspector (net/ipv4/tcp_bbr.c) */}
              <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text">
                    Kernel Socket State: struct tcp_sock &amp; tcp_bbr
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    State: {currentSnap.bbrState}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-surface border border-border rounded-lg space-y-0.5">
                    <span className="text-text-muted text-[10px] block">sk-&gt;sk_pacing_rate:</span>
                    <span className="font-bold text-text text-[11px]">{currentSnap.socketStats.skPacingRate}</span>
                  </div>
                  <div className="p-2.5 bg-surface border border-border rounded-lg space-y-0.5">
                    <span className="text-text-muted text-[10px] block">bbr-&gt;bw (Bottleneck Bw):</span>
                    <span className="font-bold text-emerald-700 text-[11px]">{currentSnap.socketStats.bbrBw}</span>
                  </div>
                  <div className="p-2.5 bg-surface border border-border rounded-lg space-y-0.5">
                    <span className="text-text-muted text-[10px] block">bbr-&gt;min_rtt_us (RTprop):</span>
                    <span className="font-bold text-sky-700 text-[11px]">{currentSnap.socketStats.minRttUs}</span>
                  </div>
                  <div className="p-2.5 bg-surface border border-border rounded-lg space-y-0.5">
                    <span className="text-text-muted text-[10px] block">tp-&gt;snd_cwnd (Packets):</span>
                    <span className="font-bold text-purple-700 text-[11px]">{currentSnap.socketStats.sndCwnd} pkts</span>
                  </div>
                  <div className="p-2.5 bg-surface border border-border rounded-lg space-y-0.5">
                    <span className="text-text-muted text-[10px] block">bbr-&gt;pacing_gain:</span>
                    <span className="font-bold text-primary-700 text-[11px]">{currentSnap.socketStats.pacingGainVal}</span>
                  </div>
                  <div className="p-2.5 bg-surface border border-border rounded-lg space-y-0.5">
                    <span className="text-text-muted text-[10px] block">tp-&gt;packets_out (Inflight):</span>
                    <span className="font-bold text-text text-[11px]">{currentSnap.socketStats.packetsOut} pkts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Socratic Step Description Card */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-800 font-mono">
                  Step {bbrStepIndex + 1} of {snapshots.length}
                </span>
                <h4 className="text-sm font-bold text-text">{currentSnap.title}</h4>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {currentSnap.explanation}
              </p>
            </div>

            {/* Quantitative Architectural Comparison Table */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text">
                  Quantitative Congestion Control &amp; Bufferbloat Benchmark
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  BBR Advantage: 5x Lower Latency &amp; Zero Tail Drops
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-border text-text-muted">
                      <th className="py-1.5 pr-4 font-semibold">Architectural Metric</th>
                      <th className="py-1.5 px-4 font-semibold">Loss-Based TCP Reno</th>
                      <th className="py-1.5 px-4 font-semibold">Loss-Based TCP CUBIC</th>
                      <th className="py-1.5 px-4 font-semibold">Model-Based TCP BBR</th>
                      <th className="py-1.5 pl-4 font-semibold text-right">BBR Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-[11px]">
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Congestion Signal</td>
                      <td className="py-2 px-4 text-red-700">Packet Loss (Tail Drop)</td>
                      <td className="py-2 px-4 text-amber-700">Packet Loss (Tail Drop)</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">Max Delivery Rate &amp; Min RTT</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">Loss Independent</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Inflight Equilibrium</td>
                      <td className="py-2 px-4 text-red-700">Buffer Limit (100 pkts)</td>
                      <td className="py-2 px-4 text-amber-700">Buffer Limit (100 pkts)</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">BDP = 25 pkts</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">75% Lower Inflight</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Router Queue Delay</td>
                      <td className="py-2 px-4 text-red-700">+80 ms (Bloated)</td>
                      <td className="py-2 px-4 text-amber-700">+75 ms (Bloated)</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">0 ms (Clean Buffer)</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">100% Queue Bloat Eliminated</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Total Latency (RTT)</td>
                      <td className="py-2 px-4 text-red-700">100 ms (5x Spike)</td>
                      <td className="py-2 px-4 text-amber-700">95 ms (4.7x Spike)</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">20 ms (Speed of Light)</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">5x Lower Latency</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Packet Drop Rate</td>
                      <td className="py-2 px-4 text-red-700">8% - 15% periodic drops</td>
                      <td className="py-2 px-4 text-amber-700">5% - 10% drops</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">0% (Zero loss required)</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">Zero Loss Tolerance</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-sans font-medium text-text">Throughput Stability</td>
                      <td className="py-2 px-4 text-red-700">Sawtooth Halving</td>
                      <td className="py-2 px-4 text-amber-700">Cubic Curve Halving</td>
                      <td className="py-2 px-4 text-emerald-700 font-bold">Constant 50.0 Mbps Saturation</td>
                      <td className="py-2 pl-4 text-right text-emerald-700 font-bold">100% Continuous Saturation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4 Socratic Invariant Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
                <span className="text-xs font-bold text-text block">
                  1. Kleinrock Optimal Operating Point
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  The ideal operating state sits at Inflight = BDP. Maximizing bandwidth and minimizing delay simultaneously is mathematically impossible with loss signals alone because loss requires buffer overflow.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
                <span className="text-xs font-bold text-text block">
                  2. Bufferbloat &amp; Standing Queues
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Deep FIFO router buffers do not increase bottleneck throughput; they merely transform transient bursts into persistent standing queues, destroying interactive VoIP, web, and gaming traffic.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
                <span className="text-xs font-bold text-text block">
                  3. Cyclic Pacing Gain Modulation
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  BBR cycles through [1.25, 0.75, 1.0x6]: 1.25x probes for higher link capacity; 0.75x immediately drains the transient queue; 1.0x cruises at 100% capacity with 0 standing queue.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
                <span className="text-xs font-bold text-text block">
                  4. Probe-RTT Min-Latency Sampling
                </span>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Because active queuing delays contaminate RTT measurements, BBR clamps cwnd to 4 packets every 10 seconds, draining all network hops to sample true physical propagation delay RTprop.
                </p>
              </div>
            </div>
          </div>
        );
      })()}



    </div>
  );
}