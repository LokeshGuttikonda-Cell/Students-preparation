'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export type InspectorMode =
  | 'STACK_HEAP'
  | 'CACHE_LINE'
  | 'HASH_TABLE'
  | 'LSM_TREE_SSTABLE'
  | 'ARIES_RECOVERY'
  | 'CACHE_STAMPEDE_XFETCH'
  | 'BTREE_LOCK_CRABBING'
  | 'MVCC_SNAPSHOT_ISOLATION';



// --- Module 8: MVCC, Snapshot Isolation & Write Skew Types ---
export type MvccIsolationLevel = 'SNAPSHOT_ISOLATION' | 'SERIALIZABLE_SNAPSHOT_ISOLATION';

export interface MvccTupleVersion {
  versionId: string;
  doctorName: string;
  onCall: boolean;
  xmin: number;
  xmax: number; // 0 if currently active
  createdAtTx: string;
  expiredAtTx?: string;
}

export interface MvccTransaction {
  txId: number;
  label: string;
  doctorTarget: string;
  snapshotDescriptor: string;
  observedOnCallCount: number | null;
  status: 'IDLE' | 'ACTIVE_READ' | 'ROW_MODIFIED' | 'COMMITTED' | 'ABORTED_SSI_CYCLE';
  statusMessage: string;
}

export interface MvccAuditEvent {
  id: number;
  time: string;
  isolation: string;
  badge: string;
  badgeClass: string;
  message: string;
}

// --- Module 7: B-Tree Concurrency & Optimistic Lock Coupling (OLC) Types ---
export type BTreeConcurrencyMode = 'PESSIMISTIC_CRABBING' | 'OPTIMISTIC_LOCK_COUPLING';
export type BTreeNodeLock = 'UNLOCKED' | 'S_LOCKED' | 'X_LOCKED';

export interface BTreeNode {
  id: string;
  name: string;
  level: 'ROOT' | 'INTERNAL' | 'LEAF';
  keys: number[];
  capacity: number;
  childrenIds?: string[];
  lockState: BTreeNodeLock;
  lockedByThread?: string;
  version: number;
}

export interface BTreeThread {
  id: string;
  name: string;
  type: 'READER' | 'WRITER';
  currentNodeId: string | null;
  targetKey: number;
  heldLocks: string[];
  status: 'IDLE' | 'TRAVERSING' | 'VERIFYING' | 'COMMITTED' | 'RESTARTED_COLLISION' | 'BLOCKED_LOCK';
  statusMessage: string;
}

export interface BTreeAuditEvent {
  id: number;
  time: string;
  strategy: string;
  badge: string;
  badgeClass: string;
  message: string;
}

export type CacheStampedeStrategy = 'NAIVE_TTL' | 'MUTEX_LOCK' | 'XFETCH_PROBABILISTIC';

export interface StampedeCacheKey {
  key: string;
  title: string;
  value: string;
  version: number;
  createdAtSec: number;
  ttlSec: number;
  elapsedSec: number;
  remainingTtlSec: number;
  deltaComputeMs: number;
  isExpired: boolean;
  isLocked: boolean;
  lockedBy?: string;
  isBackgroundRefreshing: boolean;
}

export interface StampedeTrafficResult {
  timestamp: string;
  strategy: CacheStampedeStrategy;
  concurrency: number;
  cacheHits: number;
  cacheMisses: number;
  dbQueriesDispatched: number;
  dbPoolPeak: number;
  dbPoolCapacity: number;
  failedRequests: number;
  p50LatencyMs: number;
  p99LatencyMs: number;
  summary: string;
}

export interface StampedeAuditEvent {
  id: number;
  time: string;
  strategy: string;
  badge: string;
  badgeClass: string;
  message: string;
}

export type AriesLogType =
  | 'BEGIN'
  | 'UPDATE'
  | 'COMMIT'
  | 'ABORT'
  | 'CLR'
  | 'CHECKPOINT_BEGIN'
  | 'CHECKPOINT_END';

export interface AriesLogRecord {
  lsn: number;
  prevLsn: number | null;
  transId?: string;
  type: AriesLogType;
  pageId?: string;
  oldVal?: string;
  newVal?: string;
  undoNextLsn?: number | null;
  description: string;
}

export interface AriesTransaction {
  transId: string;
  status: 'RUNNING' | 'COMMITTED' | 'ABORTED';
  lastLsn: number;
}

export interface AriesDirtyPage {
  pageId: string;
  recLsn: number;
  pageLsn: number;
  data: string;
}

export interface AriesPage {
  pageId: string;
  data: string;
  pageLsn: number;
  isDirty?: boolean;
}

export type AriesRecoveryPhase =
  | 'IDLE'
  | 'CRASHED'
  | 'ANALYSIS_COMPLETE'
  | 'REDO_COMPLETE'
  | 'UNDO_COMPLETE';

export interface AriesAuditEvent {
  id: number;
  time: string;
  phase: string;
  badge: string;
  badgeClass: string;
  message: string;
}

export interface WALRecord {
  id: number;
  op: 'PUT' | 'DELETE';
  key: string;
  value: string;
}

export interface LSMEntry {
  key: string;
  value: string;
  version: number;
  isTombstone?: boolean;
}

export interface SSTable {
  id: string;
  level: 0 | 1;
  minKey: string;
  maxKey: string;
  entries: LSMEntry[];
  bloomFilterBits: number[]; // 8-bit array
  sizeBytes: number;
}

export interface ReadTraceStep {
  stage: string;
  target: string;
  result: 'HIT' | 'MISS' | 'BLOOM_FILTER_NEGATIVE_SKIP';
  detail: string;
}

export interface LSMAuditEvent {
  id: number;
  time: string;
  op: string;
  badge: string;
  badgeClass: string;
  message: string;
}

export interface StackHeapStep {
  step: number;
  title: string;
  code: string;
  explanation: string;
  registers: { rsp: string; rbp: string; rip: string };
  stackFrames: Array<{
    name: string;
    address: string;
    variables: Array<{ name: string; type: string; value: string; isPointer?: boolean }>;
    isActive: boolean;
  }>;
  heapBlocks: Array<{
    address: string;
    size: string;
    payload: Record<string, string>;
    state: 'ALLOCATED' | 'FREED' | 'LEAKED' | 'DANGLING';
  }>;
  callout: { type: 'info' | 'warning' | 'error' | 'success'; text: string };
}

const STACK_HEAP_SCENARIOS: Record<string, { name: string; description: string; steps: StackHeapStep[] }> = {
  clean: {
    name: 'Safe Lifecycle: Allocation, Pointer Dereference & Clean Free',
    description: 'Demonstrates standard heap allocation via malloc/new, pointer dereference across stack frames, and explicit deallocation with pointer nullification.',
    steps: [
      {
        step: 0,
        title: 'Initial Program Entry: main() Stack Frame Allocated',
        code: 'int main() {\n  int userId = 101;\n  User* userPtr = nullptr;\n  userPtr = createUser(userId);\n  ...',
        explanation: 'The OS loader allocates the stack frame for main(). High memory addresses (0x7FFF_E040) house activation records containing return addresses and local primitives.',
        registers: { rsp: '0x7FFF_E030', rbp: '0x7FFF_E040', rip: '0x0040_1000' },
        stackFrames: [
          {
            name: 'main() [Frame: 0x7FFF_E040]',
            address: '0x7FFF_E030',
            variables: [
              { name: 'userId', type: 'int32 (4B)', value: '101' },
              { name: 'userPtr', type: 'User* (8B)', value: 'nullptr (0x0)', isPointer: true },
            ],
            isActive: true,
          },
        ],
        heapBlocks: [],
        callout: {
          type: 'info',
          text: 'Stack memory allocation is instantaneous (adjusting %rsp). No system call or heap metadata overhead occurs yet.',
        },
      },
      {
        step: 1,
        title: 'Function Call: createUser() Stack Frame Pushed',
        code: 'User* createUser(int id) {\n  User* u = (User*)malloc(sizeof(User));\n  ...',
        explanation: 'CPU pushes the return address onto the stack, updates %rbp, and decrements %rsp to create createUser() frame with parameter copy id=101.',
        registers: { rsp: '0x7FFF_E010', rbp: '0x7FFF_E028', rip: '0x0040_1050' },
        stackFrames: [
          {
            name: 'createUser(id=101) [Frame: 0x7FFF_E028]',
            address: '0x7FFF_E010',
            variables: [
              { name: 'id (arg)', type: 'int32 (4B)', value: '101' },
              { name: 'u', type: 'User* (8B)', value: 'uninitialized', isPointer: true },
            ],
            isActive: true,
          },
          {
            name: 'main() [Caller Frame]',
            address: '0x7FFF_E030',
            variables: [
              { name: 'userId', type: 'int32 (4B)', value: '101' },
              { name: 'userPtr', type: 'User* (8B)', value: 'nullptr (0x0)', isPointer: true },
            ],
            isActive: false,
          },
        ],
        heapBlocks: [],
        callout: {
          type: 'info',
          text: 'Each function invocation allocates a contiguous activation record. Arguments and saved frame pointers reside here.',
        },
      },
      {
        step: 2,
        title: 'Heap Allocation: malloc(sizeof(User))',
        code: '  u = (User*)malloc(sizeof(User));\n  u->id = id;\n  u->score = 98.5;',
        explanation: 'glibc ptmalloc/jemalloc queries the heap arena or triggers brk/mmap syscall to reserve a 32-byte chunk at virtual address 0x0040_A100.',
        registers: { rsp: '0x7FFF_E010', rbp: '0x7FFF_E028', rip: '0x0040_1064' },
        stackFrames: [
          {
            name: 'createUser(id=101) [Frame: 0x7FFF_E028]',
            address: '0x7FFF_E010',
            variables: [
              { name: 'id (arg)', type: 'int32 (4B)', value: '101' },
              { name: 'u', type: 'User* (8B)', value: '0x0040_A100', isPointer: true },
            ],
            isActive: true,
          },
          {
            name: 'main() [Caller Frame]',
            address: '0x7FFF_E030',
            variables: [
              { name: 'userId', type: 'int32 (4B)', value: '101' },
              { name: 'userPtr', type: 'User* (8B)', value: 'nullptr (0x0)', isPointer: true },
            ],
            isActive: false,
          },
        ],
        heapBlocks: [
          {
            address: '0x0040_A100',
            size: '32 Bytes',
            payload: { id: '101', score: '98.5', flags: '0x01' },
            state: 'ALLOCATED',
          },
        ],
        callout: {
          type: 'success',
          text: 'Heap chunk allocated! Pointer variable `u` on the stack now holds the 64-bit virtual memory address of the heap chunk.',
        },
      },
      {
        step: 3,
        title: 'Return from Function: createUser() Frame Popped',
        code: '  return u;\n}\n// In main:\nuserPtr = createUser(userId);',
        explanation: 'createUser() completes. Its stack frame is discarded as %rsp moves back up to 0x7FFF_E030. The heap address is returned in register %rax and stored in main\'s userPtr.',
        registers: { rsp: '0x7FFF_E030', rbp: '0x7FFF_E040', rip: '0x0040_1018' },
        stackFrames: [
          {
            name: 'main() [Active Frame]',
            address: '0x7FFF_E030',
            variables: [
              { name: 'userId', type: 'int32 (4B)', value: '101' },
              { name: 'userPtr', type: 'User* (8B)', value: '0x0040_A100', isPointer: true },
            ],
            isActive: true,
          },
        ],
        heapBlocks: [
          {
            address: '0x0040_A100',
            size: '32 Bytes',
            payload: { id: '101', score: '98.5', flags: '0x01' },
            state: 'ALLOCATED',
          },
        ],
        callout: {
          type: 'info',
          text: 'Stack memory for createUser() was destroyed, but heap memory at 0x0040_A100 remains fully intact and accessible through userPtr.',
        },
      },
      {
        step: 4,
        title: 'Pointer Dereferencing: Read Heap Data',
        code: 'double s = userPtr->score;\nprintf("User %d: %.1f\\n", userPtr->id, s);',
        explanation: 'The CPU reads the pointer address stored in userPtr (0x0040_A100), adds the struct offset for `score` (+8 bytes), and fetches the double value from RAM/L1 cache.',
        registers: { rsp: '0x7FFF_E030', rbp: '0x7FFF_E040', rip: '0x0040_102C' },
        stackFrames: [
          {
            name: 'main() [Active Frame]',
            address: '0x7FFF_E030',
            variables: [
              { name: 'userId', type: 'int32 (4B)', value: '101' },
              { name: 'userPtr', type: 'User* (8B)', value: '0x0040_A100', isPointer: true },
              { name: 's', type: 'double (8B)', value: '98.5' },
            ],
            isActive: true,
          },
        ],
        heapBlocks: [
          {
            address: '0x0040_A100',
            size: '32 Bytes',
            payload: { id: '101', score: '98.5', flags: '0x01' },
            state: 'ALLOCATED',
          },
        ],
        callout: {
          type: 'success',
          text: 'Pointer dereference successful: memory translation followed stack pointer (0x7FFF_E038) -> heap address (0x0040_A100).',
        },
      },
      {
        step: 5,
        title: 'Explicit Deallocation & Nullification',
        code: 'free(userPtr);\nuserPtr = nullptr; // Crucial: prevents dangling pointer',
        explanation: 'free() returns the chunk to the memory allocator bin list. Immediately assigning userPtr = nullptr ensures any subsequent accidental access triggers an immediate, debuggable SIGSEGV rather than silent corruption.',
        registers: { rsp: '0x7FFF_E030', rbp: '0x7FFF_E040', rip: '0x0040_1040' },
        stackFrames: [
          {
            name: 'main() [Active Frame]',
            address: '0x7FFF_E030',
            variables: [
              { name: 'userId', type: 'int32 (4B)', value: '101' },
              { name: 'userPtr', type: 'User* (8B)', value: 'nullptr (0x0)', isPointer: true },
              { name: 's', type: 'double (8B)', value: '98.5' },
            ],
            isActive: true,
          },
        ],
        heapBlocks: [
          {
            address: '0x0040_A100',
            size: '32 Bytes (Returned to Freelist)',
            payload: { id: '[free]', score: '[free]', flags: '[free]' },
            state: 'FREED',
          },
        ],
        callout: {
          type: 'success',
          text: 'Zero memory leaks, zero dangling pointers. Heap memory recycled for future allocations.',
        },
      },
    ],
  },
  leak: {
    name: 'Memory Leak: Orphaned Heap Allocation',
    description: 'Demonstrates what happens when a pointer is overwritten or falls out of scope without calling free(), causing unrecoverable heap fragmentation.',
    steps: [
      {
        step: 0,
        title: 'Heap Chunk Allocated & Initialized',
        code: 'void processBatch() {\n  User* temp = (User*)malloc(sizeof(User));\n  temp->id = 505;\n  ...',
        explanation: 'processBatch() allocates 32 bytes on the heap at 0x0040_B200. The pointer variable `temp` lives in the processBatch stack frame.',
        registers: { rsp: '0x7FFF_E018', rbp: '0x7FFF_E028', rip: '0x0040_2004' },
        stackFrames: [
          {
            name: 'processBatch() [Frame]',
            address: '0x7FFF_E018',
            variables: [{ name: 'temp', type: 'User* (8B)', value: '0x0040_B200', isPointer: true }],
            isActive: true,
          },
        ],
        heapBlocks: [
          {
            address: '0x0040_B200',
            size: '32 Bytes',
            payload: { id: '505', status: 'ACTIVE' },
            state: 'ALLOCATED',
          },
        ],
        callout: {
          type: 'info',
          text: 'Heap block 0x0040_B200 is currently referenced by 1 stack pointer.',
        },
      },
      {
        step: 1,
        title: 'Function Exits Without Calling free(temp)',
        code: '  // BUG: Missing free(temp) before return!\n  return;\n}\nint main() { processBatch(); ... }',
        explanation: 'processBatch() exits and its activation record is popped off the stack. The pointer `temp` is destroyed, but the memory at 0x0040_B200 remains allocated in the heap arena!',
        registers: { rsp: '0x7FFF_E038', rbp: '0x7FFF_E048', rip: '0x0040_2050' },
        stackFrames: [
          {
            name: 'main() [Active Frame]',
            address: '0x7FFF_E038',
            variables: [{ name: 'iteration', type: 'int32 (4B)', value: '1' }],
            isActive: true,
          },
        ],
        heapBlocks: [
          {
            address: '0x0040_B200',
            size: '32 Bytes (ORPHANED)',
            payload: { id: '505', status: 'ACTIVE' },
            state: 'LEAKED',
          },
        ],
        callout: {
          type: 'error',
          text: 'CRITICAL MEMORY LEAK: Reference count to 0x0040_B200 dropped to 0! No active pointer exists to free this memory. Repeated calls will exhaust RAM (OOM-killer).',
        },
      },
    ],
  },
  uaf: {
    name: 'Use-After-Free (UAF) & Dangling Pointer Hazard',
    description: 'Demonstrates the catastrophic security vulnerability where memory is freed but the pointer continues to dereference the now-reallocated memory.',
    steps: [
      {
        step: 0,
        title: 'Object Allocated and Freed Without Nullifying Pointer',
        code: 'User* admin = (User*)malloc(sizeof(User));\nadmin->role = ADMIN_ROLE;\nfree(admin);\n// BUG: admin pointer not set to nullptr!',
        explanation: 'The memory block at 0x0040_C500 is returned to the allocator. However, the pointer `admin` on the stack still holds the memory address 0x0040_C500.',
        registers: { rsp: '0x7FFF_E030', rbp: '0x7FFF_E040', rip: '0x0040_3010' },
        stackFrames: [
          {
            name: 'main() [Frame]',
            address: '0x7FFF_E030',
            variables: [{ name: 'admin (DANGLING)', type: 'User* (8B)', value: '0x0040_C500', isPointer: true }],
            isActive: true,
          },
        ],
        heapBlocks: [
          {
            address: '0x0040_C500',
            size: '32 Bytes (FREED)',
            payload: { role: '[freed]' },
            state: 'FREED',
          },
        ],
        callout: {
          type: 'warning',
          text: 'Dangling pointer hazard: `admin` still points to 0x0040_C500 even though the OS allocator considers it free.',
        },
      },
      {
        step: 1,
        title: 'Heap Reallocation Overwrites Same Chunk',
        code: 'Comment* comment = (Comment*)malloc(sizeof(Comment));\n// Allocator reuses recycled block 0x0040_C500!\ncomment->text = "Hello world";',
        explanation: 'Because 0x0040_C500 was at the top of the allocator\'s fastbin, the subsequent malloc for Comment reuses the EXACT SAME memory chunk.',
        registers: { rsp: '0x7FFF_E030', rbp: '0x7FFF_E040', rip: '0x0040_3035' },
        stackFrames: [
          {
            name: 'main() [Frame]',
            address: '0x7FFF_E030',
            variables: [
              { name: 'admin (DANGLING)', type: 'User* (8B)', value: '0x0040_C500', isPointer: true },
              { name: 'comment', type: 'Comment* (8B)', value: '0x0040_C500', isPointer: true },
            ],
            isActive: true,
          },
        ],
        heapBlocks: [
          {
            address: '0x0040_C500',
            size: '32 Bytes (REALLOCATED)',
            payload: { text: '"Hello world"', authorId: '999' },
            state: 'DANGLING',
          },
        ],
        callout: {
          type: 'warning',
          text: 'Both `admin` and `comment` now point to identical heap bytes! Data alias vulnerability created.',
        },
      },
      {
        step: 2,
        title: 'Use-After-Free Exploitation: Stale Dereference',
        code: 'if (admin->role == ADMIN_ROLE) {\n  // Catastrophic: reads comment text as security permissions!\n  grantSystemAccess();\n}',
        explanation: 'Executing admin->role reads memory offset +0 of the Comment struct. This can cause privilege escalation, crash via SIGSEGV, or arbitrary code execution.',
        registers: { rsp: '0x7FFF_E030', rbp: '0x7FFF_E040', rip: '0x0040_3050' },
        stackFrames: [
          {
            name: 'main() [Frame]',
            address: '0x7FFF_E030',
            variables: [
              { name: 'admin (STALE ACCESS)', type: 'User* (8B)', value: '0x0040_C500', isPointer: true },
              { name: 'comment', type: 'Comment* (8B)', value: '0x0040_C500', isPointer: true },
            ],
            isActive: true,
          },
        ],
        heapBlocks: [
          {
            address: '0x0040_C500',
            size: '32 Bytes (CORRUPTED ALIAS)',
            payload: { 'role (corrupted)': '0x6C6C6548 ("Hell")', text: '"Hello world"' },
            state: 'DANGLING',
          },
        ],
        callout: {
          type: 'error',
          text: 'EXPLOITATION OCCURRED: Use-After-Free dereferenced foreign struct memory. Mitigation: Always set `ptr = nullptr` immediately after `free(ptr)`.',
        },
      },
    ],
  },
};

export function MemoryCacheInspectorSandbox() {
  const [activeSubTab, setActiveSubTab] = useState<InspectorMode>('STACK_HEAP');

  // --- Module 5: Database WAL & ARIES Recovery State ---
  const INITIAL_ARIES_LOGS: AriesLogRecord[] = [
    { lsn: 10, prevLsn: null, transId: 'T1', type: 'BEGIN', description: 'Transaction T1 begins' },
    { lsn: 20, prevLsn: 10, transId: 'T1', type: 'UPDATE', pageId: 'Page A', oldVal: 'val: 100', newVal: 'val: 150', description: 'T1 updates Page A (100 -> 150)' },
    { lsn: 30, prevLsn: 20, transId: 'T1', type: 'COMMIT', description: 'T1 commits successfully' },
    { lsn: 35, prevLsn: null, type: 'CHECKPOINT_BEGIN', description: 'Fuzzy Checkpoint begins (snapshot active state)' },
    { lsn: 36, prevLsn: null, type: 'CHECKPOINT_END', description: 'Fuzzy Checkpoint ends: TT=[T1:COMMITTED], DPT=[Page A: recLSN=20]' },
    { lsn: 38, prevLsn: null, transId: 'T2', type: 'BEGIN', description: 'Transaction T2 begins' },
    { lsn: 40, prevLsn: 38, transId: 'T2', type: 'UPDATE', pageId: 'Page B', oldVal: 'val: 50', newVal: 'val: 80', description: 'T2 updates Page B (50 -> 80)' },
    { lsn: 45, prevLsn: null, transId: 'T3', type: 'BEGIN', description: 'Transaction T3 begins' },
    { lsn: 50, prevLsn: 45, transId: 'T3', type: 'UPDATE', pageId: 'Page A', oldVal: 'val: 150', newVal: 'val: 200', description: 'T3 updates Page A (150 -> 200)' },
  ];

  const INITIAL_DISK_PAGES: Record<string, AriesPage> = {
    'Page A': { pageId: 'Page A', data: 'val: 200', pageLsn: 50 }, // Steal policy: flushed to disk before crash!
    'Page B': { pageId: 'Page B', data: 'val: 50', pageLsn: 0 },   // No-force policy: not yet flushed to disk
  };

  const INITIAL_BUFFER_PAGES: Record<string, AriesPage> = {
    'Page A': { pageId: 'Page A', data: 'val: 200', pageLsn: 50, isDirty: true },
    'Page B': { pageId: 'Page B', data: 'val: 80', pageLsn: 40, isDirty: true },
  };

  const INITIAL_TRANS_TABLE: Record<string, AriesTransaction> = {
    T2: { transId: 'T2', status: 'RUNNING', lastLsn: 40 },
    T3: { transId: 'T3', status: 'RUNNING', lastLsn: 50 },
  };

  const INITIAL_DIRTY_PAGE_TABLE: Record<string, AriesDirtyPage> = {
    'Page A': { pageId: 'Page A', recLsn: 20, pageLsn: 50, data: 'val: 200' },
    'Page B': { pageId: 'Page B', recLsn: 40, pageLsn: 40, data: 'val: 80' },
  };

  const [ariesPhase, setAriesPhase] = useState<AriesRecoveryPhase>('IDLE');
  const [ariesLogs, setAriesLogs] = useState<AriesLogRecord[]>(INITIAL_ARIES_LOGS);
  const [diskPages, setDiskPages] = useState<Record<string, AriesPage>>(INITIAL_DISK_PAGES);
  const [bufferPages, setBufferPages] = useState<Record<string, AriesPage>>(INITIAL_BUFFER_PAGES);
  const [transTable, setTransTable] = useState<Record<string, AriesTransaction>>(INITIAL_TRANS_TABLE);
  const [dirtyPageTable, setDirtyPageTable] = useState<Record<string, AriesDirtyPage>>(INITIAL_DIRTY_PAGE_TABLE);
  const [analysisLosers, setAnalysisLosers] = useState<string[]>([]);
  const [redoStartLsn, setRedoStartLsn] = useState<number | null>(null);
  const [clrRecords, setClrRecords] = useState<AriesLogRecord[]>([]);
  const [ariesAuditLog, setAriesAuditLog] = useState<AriesAuditEvent[]>([
    {
      id: 1,
      time: '12:00:00',
      phase: 'STEADY_STATE',
      badge: 'NORMAL_OPERATION',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      message: 'Database operating normally under STEAL and NO-FORCE policies. Buffer Pool and WAL synchronized (FlushedLSN=50).',
    },
  ]);

  const handleTriggerCrash = () => {
    setAriesPhase('CRASHED');
    // Volatile RAM wiped completely
    setBufferPages({});
    setTransTable({});
    setDirtyPageTable({});
    setAnalysisLosers([]);
    setRedoStartLsn(null);
    setClrRecords([]);

    setAriesAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        phase: 'CRASH',
        badge: 'POWER_FAILURE',
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
        message: 'CRITICAL CRASH: Unscheduled power loss! Volatile RAM (Buffer Pool, Transaction Table, Dirty Page Table) obliterated. Persistent disk retains Page A (val: 200, pageLSN: 50 via STEAL) and Page B (val: 50, pageLSN: 0 via NO-FORCE).',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleRunAnalysisPass = () => {
    // Scans log forward from checkpoint (LSN 35)
    const reconstructedTT: Record<string, AriesTransaction> = {};
    const reconstructedDPT: Record<string, AriesDirtyPage> = {
      'Page A': { pageId: 'Page A', recLsn: 20, pageLsn: 20, data: 'val: 150' }, // from checkpoint
    };

    // Scan forward from LSN 35
    for (const log of ariesLogs) {
      if (log.lsn < 35) continue;
      if (log.type === 'BEGIN' && log.transId) {
        reconstructedTT[log.transId] = { transId: log.transId, status: 'RUNNING', lastLsn: log.lsn };
      }
      if (log.type === 'UPDATE' && log.transId && log.pageId) {
        if (reconstructedTT[log.transId]) {
          reconstructedTT[log.transId].lastLsn = log.lsn;
        }
        if (!reconstructedDPT[log.pageId]) {
          reconstructedDPT[log.pageId] = {
            pageId: log.pageId,
            recLsn: log.lsn,
            pageLsn: log.lsn,
            data: log.newVal || '',
          };
        } else {
          reconstructedDPT[log.pageId].pageLsn = log.lsn;
          reconstructedDPT[log.pageId].data = log.newVal || '';
        }
      }
      if (log.type === 'COMMIT' && log.transId && reconstructedTT[log.transId]) {
        reconstructedTT[log.transId].status = 'COMMITTED';
      }
    }

    const losers = Object.values(reconstructedTT)
      .filter((t) => t.status === 'RUNNING')
      .map((t) => t.transId);

    const recLsns = Object.values(reconstructedDPT).map((p) => p.recLsn);
    const minRecLsn = recLsns.length > 0 ? Math.min(...recLsns) : 35;

    setTransTable(reconstructedTT);
    setDirtyPageTable(reconstructedDPT);
    setAnalysisLosers(losers);
    setRedoStartLsn(minRecLsn);
    setAriesPhase('ANALYSIS_COMPLETE');

    setAriesAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        phase: 'ANALYSIS_PASS',
        badge: 'ANALYSIS_DONE',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
        message: `Analysis Pass Complete: Scanned log forward from Checkpoint (LSN 35). Identified Loser transactions: [${losers.join(', ')}]. Rebuilt Dirty Page Table (Page A recLSN=20, Page B recLSN=40). Minimum recLSN = ${minRecLsn} marks Redo start point.`,
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleRunRedoPass = () => {
    // Replay log forward from redoStartLsn (20) to end of log (50)
    // Redo repeating history: re-applies all logged changes if disk pageLSN < log.lsn
    const nextBuffer: Record<string, AriesPage> = {
      'Page A': { pageId: 'Page A', data: 'val: 200', pageLsn: 50, isDirty: true },
      'Page B': { pageId: 'Page B', data: 'val: 80', pageLsn: 40, isDirty: true }, // Reapplied from LSN 40!
    };

    setBufferPages(nextBuffer);
    setAriesPhase('REDO_COMPLETE');

    setAriesAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        phase: 'REDO_PASS',
        badge: 'REPEATING_HISTORY',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
        message: 'Redo Pass Complete: Scanned forward from LSN 20 to 50. Replayed LSN 40 (T2 update to Page B: 50 -> 80) into Buffer Pool because disk pageLSN (0) < log LSN (40). LSN 20 & 50 were already on disk. Buffer Pool state at moment of crash 100% restored!',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleRunUndoPass = () => {
    // Rollback loser transactions T3 and T2 in reverse LSN order
    const clr1: AriesLogRecord = {
      lsn: 60,
      prevLsn: 50,
      transId: 'T3',
      type: 'CLR',
      pageId: 'Page A',
      newVal: 'val: 150',
      undoNextLsn: 45,
      description: 'CLR: Undo T3 update at LSN 50 (restores Page A val: 150). Next undo LSN: 45',
    };
    const abortT3: AriesLogRecord = {
      lsn: 61,
      prevLsn: 60,
      transId: 'T3',
      type: 'ABORT',
      description: 'T3 rollback complete (ABORT logged)',
    };
    const clr2: AriesLogRecord = {
      lsn: 62,
      prevLsn: 40,
      transId: 'T2',
      type: 'CLR',
      pageId: 'Page B',
      newVal: 'val: 50',
      undoNextLsn: 38,
      description: 'CLR: Undo T2 update at LSN 40 (restores Page B val: 50). Next undo LSN: 38',
    };
    const abortT2: AriesLogRecord = {
      lsn: 63,
      prevLsn: 62,
      transId: 'T2',
      type: 'ABORT',
      description: 'T2 rollback complete (ABORT logged)',
    };

    const emittedCLRs = [clr1, abortT3, clr2, abortT2];
    setClrRecords(emittedCLRs);
    setAriesLogs((prev) => [...prev, ...emittedCLRs]);

    // Update TT
    setTransTable((prev) => ({
      ...prev,
      T2: { transId: 'T2', status: 'ABORTED', lastLsn: 63 },
      T3: { transId: 'T3', status: 'ABORTED', lastLsn: 61 },
    }));

    // Clean restored pages
    const recoveredDisk: Record<string, AriesPage> = {
      'Page A': { pageId: 'Page A', data: 'val: 150', pageLsn: 60 },
      'Page B': { pageId: 'Page B', data: 'val: 50', pageLsn: 62 },
    };

    setDiskPages(recoveredDisk);
    setBufferPages(recoveredDisk);
    setDirtyPageTable({});
    setAriesPhase('UNDO_COMPLETE');

    setAriesAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        phase: 'UNDO_PASS',
        badge: 'ROLLBACK_DONE',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        message: 'Undo Pass Complete! Scanned backward from LSN 50. Undid uncommitted changes of T3 on Page A (restored 150) and T2 on Page B (restored 50). Emitted Compensation Log Records (CLRs) with undoNextLSN pointers. Database fully restored to durable ACID consistency!',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleResetAries = () => {
    setAriesPhase('IDLE');
    setAriesLogs(INITIAL_ARIES_LOGS);
    setDiskPages(INITIAL_DISK_PAGES);
    setBufferPages(INITIAL_BUFFER_PAGES);
    setTransTable(INITIAL_TRANS_TABLE);
    setDirtyPageTable(INITIAL_DIRTY_PAGE_TABLE);
    setAnalysisLosers([]);
    setRedoStartLsn(null);
    setClrRecords([]);
    setAriesAuditLog([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        phase: 'RESET',
        badge: 'ENGINE_RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        message: 'ARIES Recovery Engine reset to initial pre-crash baseline state.',
      },
    ]);
  };

  // --- Module 6: Cache Stampede & XFetch State ---
  const INITIAL_STAMPEDE_KEY: StampedeCacheKey = {
    key: 'leaderboard:realtime:top100',
    title: 'Global High-Score Leaderboard (Aggregated Partition Table)',
    value: '{"topUser": "alex_99", "score": 98450, "totalRanked": 142000}',
    version: 1,
    createdAtSec: 0,
    ttlSec: 10,
    elapsedSec: 8.5,
    remainingTtlSec: 1.5,
    deltaComputeMs: 120,
    isExpired: false,
    isLocked: false,
    isBackgroundRefreshing: false,
  };

  const [stampedeStrategy, setStampedeStrategy] = useState<CacheStampedeStrategy>('XFETCH_PROBABILISTIC');
  const [stampedeKey, setStampedeKey] = useState<StampedeCacheKey>(INITIAL_STAMPEDE_KEY);
  const [xfetchBeta, setXfetchBeta] = useState<number>(1.0);
  const [xfetchDeltaMs, setXfetchDeltaMs] = useState<number>(120);
  const [lastBurstResult, setLastBurstResult] = useState<StampedeTrafficResult | null>(null);
  const [lastRandomU, setLastRandomU] = useState<number>(0.38);
  const [isMutexDeadlocked, setIsMutexDeadlocked] = useState<boolean>(false);
  const [stampedeAuditLog, setStampedeAuditLog] = useState<StampedeAuditEvent[]>([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      strategy: 'XFETCH_PROBABILISTIC',
      badge: 'TOPOLOGY_ONLINE',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      message: '3-Tier Cache Topology online. L1 In-Process (0.1ms), L2 Distributed Cache (1.5ms, TTL 10s), L3 Relational DB (120ms compute, pool capacity 10).',
    },
    {
      id: 2,
      time: new Date().toLocaleTimeString(),
      strategy: 'XFETCH_PROBABILISTIC',
      badge: 'STEADY_STATE',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      message: 'Key "leaderboard:realtime:top100" active with remaining TTL = 1.5s. XFetch probabilistic sampling active (β=1.0, δ=120ms).',
    },
  ]);

  const stampedeRemainingMs = Math.max(0, Math.round(stampedeKey.remainingTtlSec * 1000));
  const stampedeDenominator = Math.max(1, xfetchBeta * xfetchDeltaMs);
  const xfetchProb = stampedeKey.isExpired
    ? 1.0
    : Math.min(1.0, Math.exp(-stampedeRemainingMs / stampedeDenominator));
  const calculatedExpTerm = Math.round(-xfetchBeta * xfetchDeltaMs * Math.log(Math.max(0.0001, lastRandomU)));
  const xfetchConditionMet = calculatedExpTerm > stampedeRemainingMs || stampedeKey.isExpired;

  const handleAdvanceStampedeTime = (seconds: number) => {
    setStampedeKey(prev => {
      const newElapsed = Number((prev.elapsedSec + seconds).toFixed(1));
      const newRemaining = Number(Math.max(0, prev.ttlSec - newElapsed).toFixed(1));
      const expired = newRemaining <= 0;
      return {
        ...prev,
        elapsedSec: newElapsed,
        remainingTtlSec: newRemaining,
        isExpired: expired,
      };
    });
    setStampedeAuditLog(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        strategy: stampedeStrategy,
        badge: 'TIME_STEP',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        message: `Advanced virtual clock by +${seconds}s. Elapsed: ${(stampedeKey.elapsedSec + seconds).toFixed(1)}s / ${stampedeKey.ttlSec}s.`,
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleJumpNearExpiry = () => {
    setStampedeKey(prev => ({
      ...prev,
      elapsedSec: 9.8,
      remainingTtlSec: 0.2,
      isExpired: false,
    }));
    setStampedeAuditLog(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        strategy: stampedeStrategy,
        badge: 'NEAR_EXPIRY_JUMP',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        message: 'Clock jumped to near-expiry: 9.8s elapsed, 200ms remaining TTL. XFetch probability accelerates.',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleForceExpireStampedeKey = () => {
    setStampedeKey(prev => ({
      ...prev,
      elapsedSec: prev.ttlSec,
      remainingTtlSec: 0,
      isExpired: true,
    }));
    setStampedeAuditLog(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        strategy: stampedeStrategy,
        badge: 'TTL_EXPIRED',
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        message: 'TTL reached 0s. Key is stale and expired across L1 and L2 caches.',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleDispatchTrafficBurst = (concurrency: number) => {
    const timestamp = new Date().toLocaleTimeString();
    const DB_POOL_CAPACITY = 10;
    const computeMs = xfetchDeltaMs;

    if (stampedeStrategy === 'NAIVE_TTL') {
      if (!stampedeKey.isExpired) {
        const result: StampedeTrafficResult = {
          timestamp,
          strategy: 'NAIVE_TTL',
          concurrency,
          cacheHits: concurrency,
          cacheMisses: 0,
          dbQueriesDispatched: 0,
          dbPoolPeak: 0,
          dbPoolCapacity: DB_POOL_CAPACITY,
          failedRequests: 0,
          p50LatencyMs: 0.1,
          p99LatencyMs: 0.8,
          summary: `Clean Hit: All ${concurrency} requests served from L1/L2 cache before expiration. 0 DB load.`,
        };
        setLastBurstResult(result);
        setStampedeAuditLog(prev => [
          {
            id: Date.now(),
            time: timestamp,
            strategy: 'NAIVE_TTL',
            badge: 'CACHE_HIT_BURST',
            badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            message: `Burst of ${concurrency} requests served from cache in 0.1ms. 0 DB connections requested.`,
          },
          ...prev.slice(0, 8),
        ]);
      } else {
        const poolActive = Math.min(concurrency, DB_POOL_CAPACITY);
        const failed = Math.max(0, concurrency - DB_POOL_CAPACITY);
        const result: StampedeTrafficResult = {
          timestamp,
          strategy: 'NAIVE_TTL',
          concurrency,
          cacheHits: 0,
          cacheMisses: concurrency,
          dbQueriesDispatched: concurrency,
          dbPoolPeak: poolActive,
          dbPoolCapacity: DB_POOL_CAPACITY,
          failedRequests: failed,
          p50LatencyMs: computeMs,
          p99LatencyMs: failed > 0 ? 2500 : computeMs + 15,
          summary: `CATASTROPHIC STAMPEDE: ${concurrency} simultaneous cache misses. DB connection pool exhausted (${poolActive}/${DB_POOL_CAPACITY}). ${failed} requests dropped with 503 Pool Exhaustion!`,
        };
        setLastBurstResult(result);
        setStampedeKey(prev => ({
          ...prev,
          elapsedSec: 0,
          remainingTtlSec: prev.ttlSec,
          isExpired: false,
          version: prev.version + 1,
        }));
        setStampedeAuditLog(prev => [
          {
            id: Date.now(),
            time: timestamp,
            strategy: 'NAIVE_TTL',
            badge: 'STAMPEDE_OUTAGE',
            badgeClass: 'bg-red-100 text-red-800 border-red-300',
            message: `CRITICAL: ${concurrency} concurrent misses overwhelmed database. Connection pool saturated (10/10). ${failed} requests dropped with 503 Pool Exhaustion.`,
          },
          ...prev.slice(0, 8),
        ]);
      }
    } else if (stampedeStrategy === 'MUTEX_LOCK') {
      if (isMutexDeadlocked) {
        const result: StampedeTrafficResult = {
          timestamp,
          strategy: 'MUTEX_LOCK',
          concurrency,
          cacheHits: 0,
          cacheMisses: concurrency,
          dbQueriesDispatched: 0,
          dbPoolPeak: 0,
          dbPoolCapacity: DB_POOL_CAPACITY,
          failedRequests: concurrency,
          p50LatencyMs: 5000,
          p99LatencyMs: 5000,
          summary: `DEADLOCK COLLAPSE: Worker holding mutex crashed abruptly. All ${concurrency} requests blocked until 5000ms timeout!`,
        };
        setLastBurstResult(result);
        setStampedeAuditLog(prev => [
          {
            id: Date.now(),
            time: timestamp,
            strategy: 'MUTEX_LOCK',
            badge: 'MUTEX_DEADLOCK',
            badgeClass: 'bg-red-100 text-red-800 border-red-300',
            message: `FATAL: Mutex owner terminated. ${concurrency} client threads starved waiting on mutex until 5000ms timeout.`,
          },
          ...prev.slice(0, 8),
        ]);
        return;
      }

      if (!stampedeKey.isExpired) {
        const result: StampedeTrafficResult = {
          timestamp,
          strategy: 'MUTEX_LOCK',
          concurrency,
          cacheHits: concurrency,
          cacheMisses: 0,
          dbQueriesDispatched: 0,
          dbPoolPeak: 0,
          dbPoolCapacity: DB_POOL_CAPACITY,
          failedRequests: 0,
          p50LatencyMs: 0.1,
          p99LatencyMs: 0.8,
          summary: `All ${concurrency} requests served from valid cache. 0 mutex contention.`,
        };
        setLastBurstResult(result);
        setStampedeAuditLog(prev => [
          {
            id: Date.now(),
            time: timestamp,
            strategy: 'MUTEX_LOCK',
            badge: 'CACHE_HIT_BURST',
            badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            message: `Burst of ${concurrency} requests served from cache in 0.1ms.`,
          },
          ...prev.slice(0, 8),
        ]);
      } else {
        const result: StampedeTrafficResult = {
          timestamp,
          strategy: 'MUTEX_LOCK',
          concurrency,
          cacheHits: 0,
          cacheMisses: concurrency,
          dbQueriesDispatched: 1,
          dbPoolPeak: 1,
          dbPoolCapacity: DB_POOL_CAPACITY,
          failedRequests: 0,
          p50LatencyMs: computeMs,
          p99LatencyMs: computeMs + 25,
          summary: `MUTEX SINGLEFLIGHT: Worker 1 acquired lock and dispatched 1 DB query (1/10 pool). ${concurrency - 1} threads blocked waiting for lock release. p99 latency spiked to ${computeMs + 25}ms.`,
        };
        setLastBurstResult(result);
        setStampedeKey(prev => ({
          ...prev,
          elapsedSec: 0,
          remainingTtlSec: prev.ttlSec,
          isExpired: false,
          version: prev.version + 1,
        }));
        setStampedeAuditLog(prev => [
          {
            id: Date.now(),
            time: timestamp,
            strategy: 'MUTEX_LOCK',
            badge: 'SINGLEFLIGHT_PROTECT',
            badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
            message: `Database protected: 1 query sent to DB (1/10 pool). But ${concurrency - 1} threads stalled for ${computeMs}ms awaiting mutex release.`,
          },
          ...prev.slice(0, 8),
        ]);
      }
    } else {
      // XFETCH_PROBABILISTIC (VLDB 2015)
      const remMs = Math.max(0, Math.round(stampedeKey.remainingTtlSec * 1000));
      let shouldTrigger = stampedeKey.isExpired;
      let winningU = 0.5;
      let winningExpTerm = 0;

      for (let i = 0; i < concurrency; i++) {
        const u = Number((0.001 + Math.random() * 0.998).toFixed(4));
        const exp = Math.round(-xfetchBeta * xfetchDeltaMs * Math.log(u));
        if (exp > remMs) {
          shouldTrigger = true;
          winningU = u;
          winningExpTerm = exp;
          break;
        }
      }

      if (!shouldTrigger) {
        winningU = Number((0.05 + Math.random() * 0.9).toFixed(3));
        winningExpTerm = Math.round(-xfetchBeta * xfetchDeltaMs * Math.log(winningU));
      }
      setLastRandomU(winningU);
      const expTerm = winningExpTerm;

      if (shouldTrigger) {
        const result: StampedeTrafficResult = {
          timestamp,
          strategy: 'XFETCH_PROBABILISTIC',
          concurrency,
          cacheHits: concurrency,
          cacheMisses: 0,
          dbQueriesDispatched: 1,
          dbPoolPeak: 1,
          dbPoolCapacity: DB_POOL_CAPACITY,
          failedRequests: 0,
          p50LatencyMs: 0.1,
          p99LatencyMs: 0.8,
          summary: `OPTIMAL PROBABILISTIC REFRESH: Condition [-βδ ln u (${expTerm}ms) > TTL_rem (${remMs}ms)] met. Background recomputation refreshed key. All ${concurrency} clients received cached value in 0.1ms with 0 wait!`,
        };
        setLastBurstResult(result);
        setStampedeKey(prev => ({
          ...prev,
          elapsedSec: 0,
          remainingTtlSec: prev.ttlSec,
          isExpired: false,
          version: prev.version + 1,
          isBackgroundRefreshing: false,
        }));
        setStampedeAuditLog(prev => [
          {
            id: Date.now(),
            time: timestamp,
            strategy: 'XFETCH_PROBABILISTIC',
            badge: 'XFETCH_EARLY_REFRESH',
            badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
            message: `SUCCESS: XFetch early refresh fired at ${remMs}ms remaining (-βδ ln u = ${expTerm}ms). Key refreshed in background with 0 client latency penalty.`,
          },
          ...prev.slice(0, 8),
        ]);
      } else {
        const result: StampedeTrafficResult = {
          timestamp,
          strategy: 'XFETCH_PROBABILISTIC',
          concurrency,
          cacheHits: concurrency,
          cacheMisses: 0,
          dbQueriesDispatched: 0,
          dbPoolPeak: 0,
          dbPoolCapacity: DB_POOL_CAPACITY,
          failedRequests: 0,
          p50LatencyMs: 0.1,
          p99LatencyMs: 0.8,
          summary: `All ${concurrency} requests hit valid cache. Condition [-βδ ln u (${expTerm}ms) > ${remMs}ms] was false; early refresh deferred.`,
        };
        setLastBurstResult(result);
        setStampedeAuditLog(prev => [
          {
            id: Date.now(),
            time: timestamp,
            strategy: 'XFETCH_PROBABILISTIC',
            badge: 'CACHE_HIT_FAR_TTL',
            badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
            message: `Cache Hit (${concurrency} reqs). Condition [-βδ ln u (${expTerm}ms) > TTL_rem (${remMs}ms)] was false. Freshness preserved.`,
          },
          ...prev.slice(0, 8),
        ]);
      }
    }
  };

  const handleSimulateWorkerCrash = () => {
    setIsMutexDeadlocked(true);
    setStampedeAuditLog(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        strategy: 'MUTEX_LOCK',
        badge: 'LOCK_CRASH_INJECTED',
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        message: 'FAULT INJECTED: Worker holding distributed mutex killed abruptly. Next burst will experience complete thread starvation deadlock.',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleResetStampede = () => {
    setStampedeKey(INITIAL_STAMPEDE_KEY);
    setStampedeStrategy('XFETCH_PROBABILISTIC');
    setXfetchBeta(1.0);
    setXfetchDeltaMs(120);
    setIsMutexDeadlocked(false);
    setLastBurstResult(null);
    setLastRandomU(0.38);
    setStampedeAuditLog([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        strategy: 'XFETCH_PROBABILISTIC',
        badge: 'STUDIO_RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        message: 'Cache Stampede & XFetch Studio reset to baseline (remaining TTL = 1.5s, β=1.0, δ=120ms).',
      },
    ]);
  };

  // Module 1: Stack vs Heap State
  const [shScenarioKey, setShScenarioKey] = useState<keyof typeof STACK_HEAP_SCENARIOS>('clean');
  const [shStepIndex, setShStepIndex] = useState(0);

  const currentShScenario = STACK_HEAP_SCENARIOS[shScenarioKey];
  const currentShStep = currentShScenario.steps[shStepIndex] || currentShScenario.steps[0];

  // Module 2: Cache Line State
  const [cacheMode, setCacheMode] = useState<'STRUCT_PADDING' | 'FALSE_SHARING'>('STRUCT_PADDING');
  const [structVariant, setStructVariant] = useState<'UNALIGNED' | 'OPTIMAL'>('UNALIGNED');
  const [sharingVariant, setSharingVariant] = useState<'UNPADDED' | 'PADDED'>('UNPADDED');
  const [sharingStep, setSharingStep] = useState(0);

  // Module 3: Hash Table State
  const [hashStrategy, setHashStrategy] = useState<'CHAINING' | 'LINEAR_PROBING' | 'QUADRATIC_PROBING'>('LINEAR_PROBING');
  const [hashStep, setHashStep] = useState(0);

  const HASH_KEYS = [15, 25, 35, 42, 52, 92, 18, 28];
  const TABLE_SIZE = 10;

  // Compute Hash Table state up to hashStep
  const computeHashTable = () => {
    const tableSize = TABLE_SIZE;
    const insertedKeys = HASH_KEYS.slice(0, hashStep);
    let totalProbes = 0;

    if (hashStrategy === 'CHAINING') {
      const buckets: Array<number[]> = Array.from({ length: tableSize }, () => []);
      for (const k of insertedKeys) {
        const h = k % tableSize;
        buckets[h].push(k);
        totalProbes += 1;
      }
      return { buckets, totalProbes, type: 'chaining' as const };
    }

    // Open Addressing
    const slots: Array<{ key: number | null; probesNeeded: number }> = Array.from(
      { length: tableSize },
      () => ({ key: null, probesNeeded: 0 })
    );

    for (const k of insertedKeys) {
      let i = 0;
      let placed = false;
      while (i < tableSize && !placed) {
        let idx = 0;
        if (hashStrategy === 'LINEAR_PROBING') {
          idx = (k + i) % tableSize;
        } else {
          // Quadratic Probing: (k + i^2) % tableSize
          idx = (k + i * i) % tableSize;
        }

        if (slots[idx].key === null) {
          slots[idx] = { key: k, probesNeeded: i + 1 };
          totalProbes += (i + 1);
          placed = true;
        } else {
          i++;
        }
      }
    }

    return { slots, totalProbes, type: 'open_addressing' as const };
  };

  // --- Module 4: LSM-Tree & SSTable Compaction State ---
  const computeBloomFilterBits = (keys: string[]): number[] => {
    const bits = [0, 0, 0, 0, 0, 0, 0, 0];
    keys.forEach((k) => {
      let h1 = 0;
      let h2 = 0;
      for (let i = 0; i < k.length; i++) {
        h1 = (h1 * 31 + k.charCodeAt(i)) % 8;
        h2 = (h2 * 17 + k.charCodeAt(i)) % 8;
      }
      bits[h1] = 1;
      bits[h2] = 1;
    });
    return bits;
  };

  const checkBloomFilter = (bits: number[], key: string): boolean => {
    let h1 = 0;
    let h2 = 0;
    for (let i = 0; i < key.length; i++) {
      h1 = (h1 * 31 + key.charCodeAt(i)) % 8;
      h2 = (h2 * 17 + key.charCodeAt(i)) % 8;
    }
    return bits[h1] === 1 && bits[h2] === 1;
  };

  const INITIAL_WAL: WALRecord[] = [
    { id: 1, op: 'PUT', key: 'user:088', value: 'RootAdmin' },
  ];

  const INITIAL_MEMTABLE: LSMEntry[] = [
    { key: 'user:088', value: 'RootAdmin', version: 1 },
  ];

  const INITIAL_L0_TABLES: SSTable[] = [
    {
      id: 'SSTable-L0-1',
      level: 0,
      minKey: 'user:010',
      maxKey: 'user:075',
      entries: [
        { key: 'user:010', value: 'SystemGuest', version: 1 },
        { key: 'user:075', value: 'Operator', version: 1 },
      ],
      bloomFilterBits: computeBloomFilterBits(['user:010', 'user:075']),
      sizeBytes: 256,
    },
  ];

  const INITIAL_L1_TABLES: SSTable[] = [
    {
      id: 'SSTable-L1-1',
      level: 1,
      minKey: 'user:001',
      maxKey: 'user:050',
      entries: [
        { key: 'user:001', value: 'Genesis', version: 1 },
        { key: 'user:045', value: 'Auditor', version: 1 },
      ],
      bloomFilterBits: computeBloomFilterBits(['user:001', 'user:045']),
      sizeBytes: 512,
    },
    {
      id: 'SSTable-L1-2',
      level: 1,
      minKey: 'user:051',
      maxKey: 'user:099',
      entries: [
        { key: 'user:060', value: 'Reviewer', version: 1 },
        { key: 'user:095', value: 'ArchivedUser', version: 1, isTombstone: true },
      ],
      bloomFilterBits: computeBloomFilterBits(['user:060', 'user:095']),
      sizeBytes: 512,
    },
  ];

  const [walEntries, setWalEntries] = useState<WALRecord[]>(INITIAL_WAL);
  const [memTable, setMemTable] = useState<LSMEntry[]>(INITIAL_MEMTABLE);
  const [l0Tables, setL0Tables] = useState<SSTable[]>(INITIAL_L0_TABLES);
  const [l1Tables, setL1Tables] = useState<SSTable[]>(INITIAL_L1_TABLES);
  const [readTrace, setReadTrace] = useState<ReadTraceStep[] | null>(null);
  const [lsmCustomKey, setLsmCustomKey] = useState('');
  const [lsmCustomVal, setLsmCustomVal] = useState('');
  const [lsmAuditLog, setLsmAuditLog] = useState<LSMAuditEvent[]>([
    {
      id: 1,
      time: '12:00:00',
      op: 'INIT',
      badge: 'STORAGE_INIT',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
      message: 'LSM-Tree storage engine initialized: MemTable active (capacity 4), WAL linked, L0 and L1 SSTables loaded.',
    },
  ]);

  const handleLsmPut = (kToPut?: string, vToPut?: string) => {
    const key = (kToPut || lsmCustomKey).trim();
    const val = (vToPut || lsmCustomVal).trim();
    if (!key || !val) return;

    // Append to WAL
    setWalEntries((prev) => [
      ...prev,
      { id: Date.now(), op: 'PUT', key, value: val },
    ]);

    // Insert sorted into MemTable
    const nextMem = [...memTable.filter((e) => e.key !== key), { key, value: val, version: Date.now() }].sort((a, b) =>
      a.key.localeCompare(b.key)
    );

    if (nextMem.length >= 4) {
      // Auto-flush to L0 SSTable
      const newL0: SSTable = {
        id: 'SSTable-L0-' + (l0Tables.length + 1),
        level: 0,
        minKey: nextMem[0].key,
        maxKey: nextMem[nextMem.length - 1].key,
        entries: nextMem,
        bloomFilterBits: computeBloomFilterBits(nextMem.map((e) => e.key)),
        sizeBytes: nextMem.length * 128,
      };

      setL0Tables((prev) => [newL0, ...prev]);
      setMemTable([]);
      setWalEntries([]);

      setLsmAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          op: 'FLUSH_L0',
          badge: 'FLUSH_L0',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
          message: 'MemTable reached capacity threshold (4 entries)! Flushed to disk as ' + newL0.id + ' (Range: [' + newL0.minKey + '..' + newL0.maxKey + ']). WAL truncated.',
        },
        ...prev.slice(0, 8),
      ]);
    } else {
      setMemTable(nextMem);
      setLsmAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          op: 'PUT',
          badge: 'MEMTABLE_PUT',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          message: 'Appended to disk WAL. Inserted "' + key + '=' + val + '" sorted into in-memory MemTable (Skiplist). 0 disk seeks executed.',
        },
        ...prev.slice(0, 8),
      ]);
    }

    setLsmCustomKey('');
    setLsmCustomVal('');
  };

  const handleLsmDelete = (keyToDelete: string) => {
    const key = keyToDelete.trim();
    if (!key) return;

    setWalEntries((prev) => [
      ...prev,
      { id: Date.now(), op: 'DELETE', key, value: '✝ DELETED' },
    ]);

    const nextMem = [
      ...memTable.filter((e) => e.key !== key),
      { key, value: '✝ DELETED', version: Date.now(), isTombstone: true },
    ].sort((a, b) => a.key.localeCompare(b.key));

    if (nextMem.length >= 4) {
      const newL0: SSTable = {
        id: 'SSTable-L0-' + (l0Tables.length + 1),
        level: 0,
        minKey: nextMem[0].key,
        maxKey: nextMem[nextMem.length - 1].key,
        entries: nextMem,
        bloomFilterBits: computeBloomFilterBits(nextMem.map((e) => e.key)),
        sizeBytes: nextMem.length * 128,
      };

      setL0Tables((prev) => [newL0, ...prev]);
      setMemTable([]);
      setWalEntries([]);

      setLsmAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          op: 'TOMBSTONE_FLUSH',
          badge: 'TOMBSTONE_FLUSH',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
          message: 'Tombstone marker for "' + key + '" triggered L0 flush. Deleted keys are written sequentially without reading disk!',
        },
        ...prev.slice(0, 8),
      ]);
    } else {
      setMemTable(nextMem);
      setLsmAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          op: 'TOMBSTONE',
          badge: 'TOMBSTONE_APPEND',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
          message: 'Tombstone marker appended for "' + key + '". In LSM-Trees, deletes are instantaneous sequential writes without reading disk!',
        },
        ...prev.slice(0, 8),
      ]);
    }
  };

  const handleLsmPointRead = (targetKey: string) => {
    const key = targetKey.trim();
    const trace: ReadTraceStep[] = [];
    let found = false;

    // 1. Check RAM MemTable
    const memMatch = memTable.find((e) => e.key === key);
    if (memMatch) {
      if (memMatch.isTombstone) {
        trace.push({
          stage: '1. In-Memory MemTable (RAM)',
          target: 'MemTable (Skiplist)',
          result: 'HIT',
          detail: 'Found Tombstone marker for "' + key + '". Key was deleted! Returned NOT_FOUND with 0 disk seeks.',
        });
      } else {
        trace.push({
          stage: '1. In-Memory MemTable (RAM)',
          target: 'MemTable (Skiplist)',
          result: 'HIT',
          detail: 'Instant RAM Hit! Value: "' + memMatch.value + '". Returned in sub-microsecond latency with 0 disk seeks.',
        });
      }
      found = true;
    } else {
      trace.push({
        stage: '1. In-Memory MemTable (RAM)',
        target: 'MemTable (Skiplist)',
        result: 'MISS',
        detail: 'Key "' + key + '" not present in active RAM MemTable. Escalating to Persistent Storage Tier...',
      });
    }

    // 2. Check Level 0 SSTables (if not found in MemTable)
    if (!found) {
      for (const table of l0Tables) {
        const bloomHit = checkBloomFilter(table.bloomFilterBits, key);
        if (!bloomHit) {
          trace.push({
            stage: '2. Disk Level 0 SSTable',
            target: table.id,
            result: 'BLOOM_FILTER_NEGATIVE_SKIP',
            detail: 'Bloom Filter returned DEFINITE NEGATIVE for ' + table.id + '. Guaranteed key is absent. Skipped disk I/O entirely!',
          });
        } else {
          // Bloom positive: check entries
          const entry = table.entries.find((e) => e.key === key);
          if (entry) {
            if (entry.isTombstone) {
              trace.push({
                stage: '2. Disk Level 0 SSTable',
                target: table.id,
                result: 'HIT',
                detail: 'Bloom Filter positive -> Read block from ' + table.id + ' -> Found Tombstone marker! Key was deleted.',
              });
            } else {
              trace.push({
                stage: '2. Disk Level 0 SSTable',
                target: table.id,
                result: 'HIT',
                detail: 'Bloom Filter positive -> Read block from ' + table.id + ' -> Value: "' + entry.value + '".',
              });
            }
            found = true;
            break;
          } else {
            trace.push({
              stage: '2. Disk Level 0 SSTable',
              target: table.id,
              result: 'MISS',
              detail: 'Bloom Filter FALSE POSITIVE on ' + table.id + '! Read disk block but key was not present.',
            });
          }
        }
      }
    }

    // 3. Check Level 1 SSTables (if still not found)
    if (!found) {
      for (const table of l1Tables) {
        if (key >= table.minKey && key <= table.maxKey) {
          const bloomHit = checkBloomFilter(table.bloomFilterBits, key);
          if (!bloomHit) {
            trace.push({
              stage: '3. Disk Level 1 SSTable',
              target: table.id,
              result: 'BLOOM_FILTER_NEGATIVE_SKIP',
              detail: 'Key within range [' + table.minKey + '..' + table.maxKey + '], but Bloom filter was negative. Skipped disk read on ' + table.id + '.',
            });
          } else {
            const entry = table.entries.find((e) => e.key === key);
            if (entry) {
              if (entry.isTombstone) {
                trace.push({
                  stage: '3. Disk Level 1 SSTable',
                  target: table.id,
                  result: 'HIT',
                  detail: 'Found Tombstone in partitioned ' + table.id + '. Key is deleted.',
                });
              } else {
                trace.push({
                  stage: '3. Disk Level 1 SSTable',
                  target: table.id,
                  result: 'HIT',
                  detail: 'Found in partitioned ' + table.id + '! Binary searched block index -> Value: "' + entry.value + '".',
                });
              }
              found = true;
              break;
            } else {
              trace.push({
                stage: '3. Disk Level 1 SSTable',
                target: table.id,
                result: 'MISS',
                detail: 'Key not found in block index of ' + table.id + '.',
              });
            }
          }
        }
      }
    }

    if (!found) {
      trace.push({
        stage: '4. Pipeline Result',
        target: 'Corpus Exhausted',
        result: 'MISS',
        detail: 'Key "' + key + '" does not exist in active MemTable, L0, or L1 SSTables. Returned NULL.',
      });
    }

    setReadTrace(trace);
    setLsmAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        op: 'POINT_READ',
        badge: found ? 'READ_HIT' : 'READ_MISS',
        badgeClass: found ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-100 text-slate-800 border-slate-300',
        message: 'Point Read query for "' + key + '": Evaluated ' + trace.length + ' stages across RAM and Storage tiers.',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleLsmCompaction = () => {
    const allEntries: LSMEntry[] = [];
    l0Tables.forEach((t) => allEntries.push(...t.entries));
    l1Tables.forEach((t) => allEntries.push(...t.entries));

    allEntries.sort((a, b) => {
      const cmp = a.key.localeCompare(b.key);
      if (cmp !== 0) return cmp;
      return b.version - a.version;
    });

    const compactedMap = new Map<string, LSMEntry>();
    allEntries.forEach((e) => {
      if (!compactedMap.has(e.key)) {
        compactedMap.set(e.key, e);
      }
    });

    const activeEntries = Array.from(compactedMap.values()).filter((e) => !e.isTombstone);

    const mid = Math.ceil(activeEntries.length / 2);
    const part1 = activeEntries.slice(0, mid);
    const part2 = activeEntries.slice(mid);

    const nextL1: SSTable[] = [];
    if (part1.length > 0) {
      nextL1.push({
        id: 'SSTable-L1-A',
        level: 1,
        minKey: part1[0].key,
        maxKey: part1[part1.length - 1].key,
        entries: part1,
        bloomFilterBits: computeBloomFilterBits(part1.map((e) => e.key)),
        sizeBytes: part1.length * 256,
      });
    }
    if (part2.length > 0) {
      nextL1.push({
        id: 'SSTable-L1-B',
        level: 1,
        minKey: part2[0].key,
        maxKey: part2[part2.length - 1].key,
        entries: part2,
        bloomFilterBits: computeBloomFilterBits(part2.map((e) => e.key)),
        sizeBytes: part2.length * 256,
      });
    }

    setL0Tables([]);
    setL1Tables(nextL1);

    setLsmAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        op: 'COMPACTION',
        badge: 'LEVELED_COMPACTION',
        badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
        message: 'Leveled Compaction Complete! Overlapping L0 SSTables merged into strictly partitioned, non-overlapping L1 SSTables. Older versions eliminated and tombstones permanently garbage collected.',
      },
      ...prev.slice(0, 8),
    ]);
  };

  const handleLsmReset = () => {
    setWalEntries(INITIAL_WAL);
    setMemTable(INITIAL_MEMTABLE);
    setL0Tables(INITIAL_L0_TABLES);
    setL1Tables(INITIAL_L1_TABLES);
    setReadTrace(null);
    setLsmAuditLog([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        op: 'RESET',
        badge: 'ENGINE_RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        message: 'LSM-Tree storage engine reset to initial clean baseline state.',
      },
    ]);
  };

  const hashState = computeHashTable();


  // --- Module 7: B-Tree Concurrency State ---
  const [bTreeStrategy, setBTreeStrategy] = useState<BTreeConcurrencyMode>('OPTIMISTIC_LOCK_COUPLING');

  const initialBTreeNodes: Record<string, BTreeNode> = {
    root: { id: 'root', name: 'Root Node', level: 'ROOT', keys: [50], capacity: 3, childrenIds: ['int-1', 'int-2'], lockState: 'UNLOCKED', version: 10 },
    'int-1': { id: 'int-1', name: 'Internal I1', level: 'INTERNAL', keys: [25], capacity: 3, childrenIds: ['leaf-1', 'leaf-2'], lockState: 'UNLOCKED', version: 20 },
    'int-2': { id: 'int-2', name: 'Internal I2', level: 'INTERNAL', keys: [75], capacity: 3, childrenIds: ['leaf-3', 'leaf-4'], lockState: 'UNLOCKED', version: 30 },
    'leaf-1': { id: 'leaf-1', name: 'Leaf L1 [10-24]', level: 'LEAF', keys: [10, 20], capacity: 3, lockState: 'UNLOCKED', version: 100 },
    'leaf-2': { id: 'leaf-2', name: 'Leaf L2 [25-49]', level: 'LEAF', keys: [30, 40], capacity: 3, lockState: 'UNLOCKED', version: 102 },
    'leaf-3': { id: 'leaf-3', name: 'Leaf L3 [50-74]', level: 'LEAF', keys: [60, 70], capacity: 3, lockState: 'UNLOCKED', version: 104 },
    'leaf-4': { id: 'leaf-4', name: 'Leaf L4 [75-99]', level: 'LEAF', keys: [80, 90], capacity: 3, lockState: 'UNLOCKED', version: 106 },
  };

  const [bTreeNodes, setBTreeNodes] = useState<Record<string, BTreeNode>>(initialBTreeNodes);

  const [bTreeThreadReader, setBTreeThreadReader] = useState<BTreeThread>({
    id: 't-reader',
    name: 'Reader 1 (Search Key 40)',
    type: 'READER',
    currentNodeId: null,
    targetKey: 40,
    heldLocks: [],
    status: 'IDLE',
    statusMessage: 'Thread idle. Ready to traverse tree to locate Key 40.',
  });

  const [bTreeThreadWriter, setBTreeThreadWriter] = useState<BTreeThread>({
    id: 't-writer',
    name: 'Writer 1 (Insert Key 45)',
    type: 'WRITER',
    currentNodeId: null,
    targetKey: 45,
    heldLocks: [],
    status: 'IDLE',
    statusMessage: 'Thread idle. Ready to insert Key 45 into Leaf L2.',
  });

  const [bTreeRootContentionAlert, setBTreeRootContentionAlert] = useState<string | null>(null);

  const [bTreeAuditLog, setBTreeAuditLog] = useState<BTreeAuditEvent[]>([
    {
      id: 1,
      time: '00:00:00',
      strategy: 'INIT',
      badge: 'INIT',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
      message: '3-level B+ Tree initialized (Root -> 2 Internal -> 4 Leaves). Strategy: OPTIMISTIC_LOCK_COUPLING.',
    },
  ]);

  const handleBTreeRunReaderTraversal = () => {
    setBTreeRootContentionAlert(null);
    if (bTreeStrategy === 'PESSIMISTIC_CRABBING') {
      // Pessimistic Lock Crabbing:
      // S-lock root -> S-lock I1, release root -> S-lock L2, release I1 -> Read key 40 -> Release L2
      setBTreeNodes((prev) => ({
        ...prev,
        root: { ...prev.root, lockState: 'UNLOCKED' },
        'int-1': { ...prev['int-1'], lockState: 'UNLOCKED' },
        'leaf-2': { ...prev['leaf-2'], lockState: 'UNLOCKED' },
      }));
      setBTreeThreadReader({
        id: 't-reader',
        name: 'Reader 1 (Search Key 40)',
        type: 'READER',
        currentNodeId: 'leaf-2',
        targetKey: 40,
        heldLocks: [],
        status: 'COMMITTED',
        statusMessage: 'Success: S-lock Root -> S-lock I1 (unlocked Root) -> S-lock L2 (unlocked I1). Read Key 40 successfully. All locks released.',
      });
      setBTreeAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          strategy: 'CRABBING',
          badge: 'S_LOCK_CRAB',
          badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300',
          message: 'Reader traversed Root -> I1 -> L2 with shared lock crabbing. 3 atomic lock acquisitions/releases executed.',
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      // Optimistic Lock Coupling:
      // Read v_root (10) -> Read v_I1 (20) -> Verify v_root (10) -> Read v_L2 (102) -> Verify v_I1 (20) -> Read key 40 -> Verify v_L2 (102)
      setBTreeThreadReader({
        id: 't-reader',
        name: 'Reader 1 (Search Key 40)',
        type: 'READER',
        currentNodeId: 'leaf-2',
        targetKey: 40,
        heldLocks: [],
        status: 'COMMITTED',
        statusMessage: 'Success: Traversed Root(v:10) -> I1(v:20) -> L2(v:102) with zero locks! Re-verified versions match and lock bit is 0. Key 40 read cleanly.',
      });
      setBTreeAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          strategy: 'OLC',
          badge: 'OLC_READ_LOCK_FREE',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
          message: 'Reader completed traversal lock-free: 0 locks held, 0 atomic writes executed. Linear multi-core scaling preserved!',
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const handleBTreeRunWriterMutation = () => {
    setBTreeRootContentionAlert(null);
    if (bTreeStrategy === 'PESSIMISTIC_CRABBING') {
      // Writer crabs with X-locks down to L2, inserts 45
      setBTreeNodes((prev) => ({
        ...prev,
        'leaf-2': {
          ...prev['leaf-2'],
          keys: [30, 40, 45],
          lockState: 'UNLOCKED',
        },
      }));
      setBTreeThreadWriter({
        id: 't-writer',
        name: 'Writer 1 (Insert Key 45)',
        type: 'WRITER',
        currentNodeId: 'leaf-2',
        targetKey: 45,
        heldLocks: [],
        status: 'COMMITTED',
        statusMessage: 'Writer acquired X-lock on Root -> X-lock on I1 (Root safe, released) -> X-lock on L2 (I1 released) -> Inserted 45 -> Released L2.',
      });
      setBTreeAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          strategy: 'CRABBING',
          badge: 'X_LOCK_WRITE',
          badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300',
          message: 'Writer inserted Key 45 into L2 using X-lock crabbing. Keys: [30, 40, 45].',
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      // OLC: Optimistic traversal to L2 -> atomic lock L2 (v=103) -> mutate -> unlock L2 (v=104)
      setBTreeNodes((prev) => ({
        ...prev,
        'leaf-2': {
          ...prev['leaf-2'],
          keys: [30, 40, 45],
          version: prev['leaf-2'].version + 2, // 102 -> 104
        },
      }));
      setBTreeThreadWriter({
        id: 't-writer',
        name: 'Writer 1 (Insert Key 45)',
        type: 'WRITER',
        currentNodeId: 'leaf-2',
        targetKey: 45,
        heldLocks: [],
        status: 'COMMITTED',
        statusMessage: 'Writer traversed optimistically without root/internal locks. Acquired lock bit on L2 (103), inserted 45, incremented version to 104 (unlocked).',
      });
      setBTreeAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          strategy: 'OLC',
          badge: 'OLC_WRITE_VERSION_BUMP',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
          message: 'Writer inserted Key 45 with localized leaf version bump (102 -> 104). Zero contention on Root and Internal nodes!',
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const handleBTreeSimulateSplitContention = () => {
    if (bTreeStrategy === 'PESSIMISTIC_CRABBING') {
      // Unsafe split: child L2 is full ([30, 40, 45], capacity 3). Writer MUST hold X-lock on Root and I1!
      setBTreeNodes((prev) => ({
        ...prev,
        root: { ...prev.root, lockState: 'X_LOCKED', lockedByThread: 'Writer (Split)' },
        'int-1': { ...prev['int-1'], lockState: 'X_LOCKED', lockedByThread: 'Writer (Split)' },
        'leaf-2': { ...prev['leaf-2'], lockState: 'X_LOCKED', lockedByThread: 'Writer (Split)' },
      }));
      setBTreeThreadReader({
        id: 't-reader',
        name: 'Reader 1 (Search Key 40)',
        type: 'READER',
        currentNodeId: 'root',
        targetKey: 40,
        heldLocks: [],
        status: 'BLOCKED_LOCK',
        statusMessage: 'BLOCKED: Reader attempted to acquire S-lock on Root, but Root is held under Exclusive X-lock by Writer! Reader stalled!',
      });
      setBTreeRootContentionAlert('ROOT CONTENTION COLLAPSE: In Pessimistic Lock Crabbing, splitting an unsafe child forces the writer to retain Exclusive X-locks on Root and Internal nodes! All parallel readers across all cores are blocked!');
      setBTreeAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          strategy: 'CRABBING',
          badge: 'ROOT_X_LOCK_BLOCKING',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 animate-pulse',
          message: 'CRITICAL CONTENTION: Writer locked Root and I1 for split! Reader 1 blocked at Root. Multicore throughput collapses to 0.',
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      // OLC Split: Writer locks only I1 and L2. Root is NEVER locked!
      setBTreeNodes((prev) => ({
        ...prev,
        'int-1': { ...prev['int-1'], keys: [25, 40], version: prev['int-1'].version + 2 },
        'leaf-2': { ...prev['leaf-2'], keys: [30, 35], version: prev['leaf-2'].version + 2 },
      }));
      setBTreeRootContentionAlert(null);
      setBTreeThreadReader({
        id: 't-reader',
        name: 'Reader 1 (Search Key 40)',
        type: 'READER',
        currentNodeId: 'leaf-2',
        targetKey: 40,
        heldLocks: [],
        status: 'COMMITTED',
        statusMessage: 'Reader traversed cleanly during split! Root was never locked. Reader validated versions and completed unhindered.',
      });
      setBTreeAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          strategy: 'OLC',
          badge: 'OLC_SPLIT_UNBLOCKED',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
          message: 'OLC Node Split completed with localized version increments. Root remained 100% unlocked and available for concurrent readers!',
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const handleBTreeSimulateReaderCollision = () => {
    setBTreeRootContentionAlert(null);
    if (bTreeStrategy === 'OPTIMISTIC_LOCK_COUPLING') {
      // Reader observed version 102 at start; writer bumped to 104; reader detects 104 != 102 and restarts from root!
      setBTreeNodes((prev) => ({
        ...prev,
        'leaf-2': {
          ...prev['leaf-2'],
          keys: [30, 40, 48],
          version: 104,
        },
      }));
      setBTreeThreadReader({
        id: 't-reader',
        name: 'Reader 1 (Search Key 40)',
        type: 'READER',
        currentNodeId: 'root',
        targetKey: 40,
        heldLocks: [],
        status: 'RESTARTED_COLLISION',
        statusMessage: 'OPTIMISTIC RESTART: Reader observed v_start = 102, but post-read check detected version = 104! Stale read discarded. Restarted traversal from Root.',
      });
      setBTreeAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          strategy: 'OLC',
          badge: 'OPTIMISTIC_RESTART',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
          message: 'Reader detected concurrent write collision (v_start 102 != v_end 104). Safely aborted dirty read and restarted from Root.',
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      handleBTreeRunReaderTraversal();
    }
  };

  const handleBTreeReset = () => {
    setBTreeNodes(initialBTreeNodes);
    setBTreeRootContentionAlert(null);
    setBTreeThreadReader({
      id: 't-reader',
      name: 'Reader 1 (Search Key 40)',
      type: 'READER',
      currentNodeId: null,
      targetKey: 40,
      heldLocks: [],
      status: 'IDLE',
      statusMessage: 'Thread idle. Ready to traverse tree to locate Key 40.',
    });
    setBTreeThreadWriter({
      id: 't-writer',
      name: 'Writer 1 (Insert Key 45)',
      type: 'WRITER',
      currentNodeId: null,
      targetKey: 45,
      heldLocks: [],
      status: 'IDLE',
      statusMessage: 'Thread idle. Ready to insert Key 45 into Leaf L2.',
    });
    setBTreeAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        strategy: 'RESET',
        badge: 'RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
        message: 'B-Tree structure, locks, versions, and thread states reset to clean baseline.',
      },
      ...prev.slice(0, 9),
    ]);
  };


  // --- Module 8: MVCC & Snapshot Isolation State ---
  const [mvccIsolation, setMvccIsolation] = useState<MvccIsolationLevel>('SNAPSHOT_ISOLATION');
  const [mvccStep, setMvccStep] = useState<number>(0);
  const [mvccWriteSkewAlert, setMvccWriteSkewAlert] = useState<string | null>(null);

  const initialMvccTuples: MvccTupleVersion[] = [
    { versionId: 'Alice-v1', doctorName: 'Alice', onCall: true, xmin: 90, xmax: 0, createdAtTx: 'T_init (txid 90)' },
    { versionId: 'Bob-v1', doctorName: 'Bob', onCall: true, xmin: 90, xmax: 0, createdAtTx: 'T_init (txid 90)' },
    { versionId: 'Carol-v1', doctorName: 'Carol', onCall: false, xmin: 85, xmax: 0, createdAtTx: 'T_init (txid 85)' },
  ];

  const initialMvccT1: MvccTransaction = {
    txId: 101,
    label: 'T1: Dr. Alice Leave Request',
    doctorTarget: 'Alice',
    snapshotDescriptor: '100:100:[]',
    observedOnCallCount: null,
    status: 'IDLE',
    statusMessage: 'Transaction T1 idle (txid 101). Invariant rule: At least 1 doctor must remain on call.',
  };

  const initialMvccT2: MvccTransaction = {
    txId: 102,
    label: 'T2: Dr. Bob Leave Request',
    doctorTarget: 'Bob',
    snapshotDescriptor: '100:100:[101]',
    observedOnCallCount: null,
    status: 'IDLE',
    statusMessage: 'Transaction T2 idle (txid 102). Invariant rule: At least 1 doctor must remain on call.',
  };

  const [mvccTuples, setMvccTuples] = useState<MvccTupleVersion[]>(initialMvccTuples);
  const [mvccT1, setMvccT1] = useState<MvccTransaction>(initialMvccT1);
  const [mvccT2, setMvccT2] = useState<MvccTransaction>(initialMvccT2);
  const [mvccAuditLog, setMvccAuditLog] = useState<MvccAuditEvent[]>([
    {
      id: 1,
      time: '12:00:00',
      isolation: 'SNAPSHOT_ISOLATION',
      badge: 'MVCC_BOOT',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
      message: 'MVCC Engine initialized with 3 tuples (Alice=true, Bob=true, Carol=false). Active on-call count = 2.',
    },
  ]);

  const handleMvccStep1ConcurrentReads = () => {
    setMvccStep(1);
    setMvccWriteSkewAlert(null);

    // T1 takes snapshot [100:100:[]] at t1.
    // Visible tuples: Alice-v1 (xmin 90), Bob-v1 (xmin 90). On-call count = 2.
    // T2 takes snapshot [100:100:[101]] at t2.
    // Visible tuples: Alice-v1 (xmin 90), Bob-v1 (xmin 90). On-call count = 2.
    setMvccT1({
      ...initialMvccT1,
      observedOnCallCount: 2,
      status: 'ACTIVE_READ',
      statusMessage: 'T1 executed "SELECT count(*) FROM doctors WHERE on_call=true" -> Count: 2. Evaluated condition: (2 - 1 >= 1) is TRUE. Proceeding to take leave.',
    });

    setMvccT2({
      ...initialMvccT2,
      observedOnCallCount: 2,
      status: 'ACTIVE_READ',
      statusMessage: 'T2 executed "SELECT count(*) FROM doctors WHERE on_call=true" -> Count: 2. Evaluated condition: (2 - 1 >= 1) is TRUE. Proceeding to take leave.',
    });

    setMvccAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        isolation: mvccIsolation,
        badge: 'CONCURRENT_SNAPSHOT_READ',
        badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300',
        message: 'Concurrent Snapshot Reads: Both T1 (txid 101) and T2 (txid 102) read on_call count = 2 simultaneously. Neither transaction acquired read locks; readers never block writers under MVCC.',
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleMvccStep2T1Commit = () => {
    setMvccStep(2);

    // T1 marks Alice-v1 as expired (xmax = 101) and inserts Alice-v2 (xmin = 101, xmax = 0, onCall = false)
    setMvccTuples((prev) => [
      ...prev.map((t) => (t.versionId === 'Alice-v1' ? { ...t, xmax: 101, expiredAtTx: 'T1 (txid 101)' } : t)),
      {
        versionId: 'Alice-v2',
        doctorName: 'Alice',
        onCall: false,
        xmin: 101,
        xmax: 0,
        createdAtTx: 'T1 (txid 101)',
      },
    ]);

    setMvccT1((prev) => ({
      ...prev,
      status: 'COMMITTED',
      statusMessage: 'T1 updated Alice.on_call = false (created Alice-v2 with xmin:101, set Alice-v1 xmax:101) and COMMITTED successfully.',
    }));

    setMvccAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        isolation: mvccIsolation,
        badge: 'T1_COMMITTED',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300',
        message: 'Transaction T1 committed: Alice is now off-call. In SI, Bob (T2) cannot see this commit because T1 committed AFTER T2 snapshot was created.',
      },
      ...prev.slice(0, 9),
    ]);
  };

  const handleMvccStep3T2Commit = () => {
    setMvccStep(3);

    if (mvccIsolation === 'SNAPSHOT_ISOLATION') {
      // First-Committer-Wins (FCW) Check:
      // T2 is updating Bob. Did any concurrent tx modify Bob? No, T1 modified Alice!
      // Row sets are disjoint: Write sets W(T1) = {Alice}, W(T2) = {Bob}. Disjoint!
      // Therefore, FCW passes without conflict, causing WRITE SKEW!
      setMvccTuples((prev) => [
        ...prev.map((t) => (t.versionId === 'Bob-v1' ? { ...t, xmax: 102, expiredAtTx: 'T2 (txid 102)' } : t)),
        {
          versionId: 'Bob-v2',
          doctorName: 'Bob',
          onCall: false,
          xmin: 102,
          xmax: 0,
          createdAtTx: 'T2 (txid 102)',
        },
      ]);

      setMvccT2((prev) => ({
        ...prev,
        status: 'COMMITTED',
        statusMessage: 'T2 updated Bob.on_call = false and COMMITTED! First-Committer-Wins passed because T1 and T2 updated disjoint rows.',
      }));

      setMvccWriteSkewAlert(
        'CRITICAL WRITE SKEW (G_skew / Berenson A5B) ANOMALY DETECTED: Constraint violated! 0 doctors remain on call! Both T1 and T2 successfully committed because Snapshot Isolation only detects write-write row conflicts on identical rows, failing to detect cross-row predicate dependencies.'
      );

      setMvccAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          isolation: 'SNAPSHOT_ISOLATION',
          badge: 'WRITE_SKEW_HAZARD',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300',
          message: 'WRITE SKEW ANOMALY: Total on-call count collapsed to 0! Neither serial schedule (T1 then T2, or T2 then T1) could produce this outcome. Snapshot Isolation is NOT equivalent to Serializability!',
        },
        ...prev.slice(0, 9),
      ]);
    } else {
      // SERIALIZABLE_SNAPSHOT_ISOLATION (SSI / Cahill SIGMOD 2008):
      // Tracks rw-antidependencies in the Serialization Graph:
      // T2 read Alice-v1, which T1 wrote -> rw-edge: T2 -> T1
      // T1 read Bob-v1, which T2 wants to write -> rw-edge: T1 -> T2
      // Two consecutive rw-edges: T1 -> T2 -> T1 (Cycle detected!)
      // SSI Engine aborts T2 with SQLSTATE 40001 (serialization_failure)!
      setMvccT2((prev) => ({
        ...prev,
        status: 'ABORTED_SSI_CYCLE',
        statusMessage: 'ABORTED (SQLSTATE 40001: serialization_failure): SSI detected dangerous rw-antidependency cycle (T1 -> T2 -> T1). T2 rolled back to protect serializability invariant.',
      }));

      setMvccWriteSkewAlert(null);

      setMvccAuditLog((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          isolation: 'SERIALIZABLE_SNAPSHOT_ISOLATION',
          badge: 'SSI_CYCLE_ABORT',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300',
          message: 'SSI SAFETY INTERVENTION: Cahill SSI engine detected rw-antidependency cycle between T1 and T2. Aborted T2 with SQLSTATE 40001. Bob remains on-call (count = 1). Invariant strictly preserved with zero locking!',
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const handleMvccReset = () => {
    setMvccStep(0);
    setMvccWriteSkewAlert(null);
    setMvccTuples(initialMvccTuples);
    setMvccT1(initialMvccT1);
    setMvccT2(initialMvccT2);
    setMvccAuditLog((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        isolation: mvccIsolation,
        badge: 'MVCC_RESET',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-zinc-800 dark:text-zinc-200',
        message: 'MVCC engine reset to initial state: Alice=true, Bob=true, Carol=false (2 on-call doctors).',
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
              Low-Level Systems Studio
            </span>
            <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
              Memory &amp; Hardware Layout
            </span>
          </div>
          <h2 className="text-lg font-bold text-text mt-0.5">
            Process Virtual Memory &amp; CPU Cache Coherence Simulator
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-canvas p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setActiveSubTab('STACK_HEAP')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'STACK_HEAP'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Stack vs Heap
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('CACHE_LINE')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'CACHE_LINE'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            L1/L2 Cache Lines &amp; False Sharing
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('HASH_TABLE')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'HASH_TABLE'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Hash Table Collision Probing
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('LSM_TREE_SSTABLE')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'LSM_TREE_SSTABLE'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            LSM-Tree &amp; SSTables
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('ARIES_RECOVERY')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'ARIES_RECOVERY'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            ARIES Database Recovery
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('CACHE_STAMPEDE_XFETCH')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'CACHE_STAMPEDE_XFETCH'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Cache Stampede &amp; XFetch
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('BTREE_LOCK_CRABBING')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'BTREE_LOCK_CRABBING'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            B-Tree Concurrency &amp; OLC
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('MVCC_SNAPSHOT_ISOLATION')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeSubTab === 'MVCC_SNAPSHOT_ISOLATION'
                ? 'bg-primary-700 text-white shadow-xs'
                : 'text-text-muted hover:text-text'
            }`}
          >
            MVCC &amp; Snapshot Isolation
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: STACK VS HEAP */}
      {activeSubTab === 'STACK_HEAP' && (
        <div className="p-6 space-y-6">
          {/* Scenario Selector */}
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Select Memory Execution Scenario:
              </span>
              <p className="text-xs text-text-muted">
                {currentShScenario.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setShScenarioKey('clean');
                  setShStepIndex(0);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                  shScenarioKey === 'clean'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Safe Allocation &amp; Free
              </button>
              <button
                type="button"
                onClick={() => {
                  setShScenarioKey('leak');
                  setShStepIndex(0);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                  shScenarioKey === 'leak'
                    ? 'bg-rose-50 text-rose-900 border-rose-400 font-bold'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Memory Leak (Orphaned)
              </button>
              <button
                type="button"
                onClick={() => {
                  setShScenarioKey('uaf');
                  setShStepIndex(0);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                  shScenarioKey === 'uaf'
                    ? 'bg-amber-50 text-amber-900 border-amber-400 font-bold'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Use-After-Free (UAF) Hazard
              </button>
            </div>
          </div>

          {/* Stepper Controls & Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-primary-100 text-primary-900 px-2 py-0.5 rounded">
                  STEP {shStepIndex + 1} / {currentShScenario.steps.length}
                </span>
                <h3 className="text-sm font-bold text-text">{currentShStep.title}</h3>
              </div>
              <p className="text-xs text-text-muted mt-1 max-w-xl">{currentShStep.explanation}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={shStepIndex === 0}
              >
                ← Previous Step
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShStepIndex((prev) => Math.min(currentShScenario.steps.length - 1, prev + 1))}
                disabled={shStepIndex >= currentShScenario.steps.length - 1}
              >
                Next Step →
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShStepIndex(0)}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Code & Callout Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-canvas border border-border rounded-xl p-3 font-mono text-xs overflow-x-auto">
              <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-bold font-sans">
                Executed C / Assembly Segment:
              </div>
              <pre className="text-primary-800 leading-relaxed">{currentShStep.code}</pre>
            </div>

            <div
              className={`rounded-xl p-4 border flex flex-col justify-center ${
                currentShStep.callout.type === 'error'
                  ? 'bg-rose-50/70 border-rose-300 text-rose-900'
                  : currentShStep.callout.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                  : currentShStep.callout.type === 'success'
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                  : 'bg-primary-50/70 border-primary-300 text-primary-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                <span>
                  {currentShStep.callout.type === 'error'
                    ? '⚠️ Critical Hazard'
                    : currentShStep.callout.type === 'warning'
                    ? '⚡ Architectural Warning'
                    : currentShStep.callout.type === 'success'
                    ? '✓ Invariant Verified'
                    : 'ℹ️ Systems Invariant'}
                </span>
              </div>
              <p className="text-xs mt-1.5 leading-relaxed">{currentShStep.callout.text}</p>
            </div>
          </div>

          {/* Architecture Stage: Process Virtual Memory Layout */}
          <div className="border border-border rounded-xl p-4 bg-canvas space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Process Virtual Address Space (x86-64 Linux Architecture)
              </span>
              <div className="flex items-center gap-3 font-mono text-[11px] text-text-muted">
                <span>%rsp: <strong className="text-primary-700">{currentShStep.registers.rsp}</strong></span>
                <span>%rbp: <strong className="text-primary-700">{currentShStep.registers.rbp}</strong></span>
                <span>%rip: <strong className="text-accent-700">{currentShStep.registers.rip}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stack Side */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📚</span>
                    <span className="text-xs font-bold text-text uppercase">
                      Call Stack (Grows Downwards ↓)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">High Memory: ~0x7FFF_FFFF</span>
                </div>

                <div className="space-y-3">
                  {currentShStep.stackFrames.map((frame, fIdx) => (
                    <div
                      key={fIdx}
                      className={`p-3 rounded-lg border transition-all ${
                        frame.isActive
                          ? 'bg-primary-50/40 border-primary-400 ring-1 ring-primary-300'
                          : 'bg-canvas border-border opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className={frame.isActive ? 'text-primary-900' : 'text-text-muted'}>
                          {frame.name}
                        </span>
                        <span className="text-[10px] font-mono text-text-muted">{frame.address}</span>
                      </div>

                      <div className="space-y-1.5">
                        {frame.variables.map((v, vIdx) => (
                          <div
                            key={vIdx}
                            className={`flex items-center justify-between text-xs p-1.5 rounded font-mono ${
                              v.isPointer
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-surface text-text'
                            }`}
                          >
                            <span>
                              {v.name} <span className="text-[10px] text-text-muted">({v.type})</span>
                            </span>
                            <span className="font-bold">
                              {v.isPointer ? `🔗 ${v.value}` : v.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Heap Side */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏗️</span>
                    <span className="text-xs font-bold text-text uppercase">
                      Dynamic Heap Arena (Grows Upwards ↑)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">Low Memory: ~0x0040_0000</span>
                </div>

                {currentShStep.heapBlocks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-muted border border-dashed border-border rounded-lg">
                    No active heap chunks allocated in this execution step.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentShStep.heapBlocks.map((block, bIdx) => (
                      <div
                        key={bIdx}
                        className={`p-3 rounded-lg border transition-all ${
                          block.state === 'ALLOCATED'
                            ? 'bg-emerald-50/50 border-emerald-400'
                            : block.state === 'FREED'
                            ? 'bg-canvas border-dashed border-border text-text-muted opacity-60'
                            : block.state === 'LEAKED'
                            ? 'bg-rose-50/70 border-rose-400'
                            : 'bg-amber-50/70 border-amber-400'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold mb-2">
                          <span className="font-mono text-primary-800 font-bold">
                            Addr: {block.address}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                              block.state === 'ALLOCATED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : block.state === 'FREED'
                                ? 'bg-zinc-200 text-zinc-700'
                                : block.state === 'LEAKED'
                                ? 'bg-rose-100 text-rose-800 animate-pulse'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {block.state} ({block.size})
                          </span>
                        </div>

                        <div className="bg-canvas p-2 rounded text-xs font-mono grid grid-cols-2 gap-2">
                          {Object.entries(block.payload).map(([k, val]) => (
                            <div key={k} className="flex justify-between border-b border-border/50 pb-0.5">
                              <span className="text-text-muted">{k}:</span>
                              <span className="font-semibold text-text">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CPU L1/L2 CACHE LINES & FALSE SHARING */}
      {activeSubTab === 'CACHE_LINE' && (
        <div className="p-6 space-y-6">
          {/* Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas border border-border p-4 rounded-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Select Cache Subsystem Focus:
              </span>
              <p className="text-xs text-text-muted mt-0.5">
                Analyze struct alignment padding waste or simulate multi-core MESI cache-line ping-pong invalidation storms.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCacheMode('STRUCT_PADDING')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                  cacheMode === 'STRUCT_PADDING'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Struct Packing &amp; Alignment
              </button>
              <button
                type="button"
                onClick={() => setCacheMode('FALSE_SHARING')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all ${
                  cacheMode === 'FALSE_SHARING'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Multi-Core False Sharing
              </button>
            </div>
          </div>

          {/* MODE A: STRUCT PADDING */}
          {cacheMode === 'STRUCT_PADDING' ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStructVariant('UNALIGNED')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                      structVariant === 'UNALIGNED'
                        ? 'bg-rose-50 text-rose-900 border-rose-400 font-bold'
                        : 'bg-canvas text-text-muted border-border hover:text-text'
                    }`}
                  >
                    Naive Struct Order (24 Bytes — 50% Padding Waste)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStructVariant('OPTIMAL')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                      structVariant === 'OPTIMAL'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold'
                        : 'bg-canvas text-text-muted border-border hover:text-text'
                    }`}
                  >
                    Optimal Reordered Struct (16 Bytes — Minimal Padding)
                  </button>
                </div>

                <div className="text-xs font-mono text-text-muted">
                  Standard x86-64 Cache Line: <strong className="text-primary-700">64 Bytes (8 Words)</strong>
                </div>
              </div>

              {/* Struct Code & Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-canvas border border-border rounded-xl p-4 font-mono text-xs">
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-bold font-sans">
                    {structVariant === 'UNALIGNED' ? 'Inefficient Declaration:' : 'Optimally Packed Declaration:'}
                  </div>
                  <pre className="text-text leading-relaxed">
                    {structVariant === 'UNALIGNED'
                      ? `struct InefficientRecord {
  char   status;     // 1 byte  (+ 3 bytes padding!)
  int    id;         // 4 bytes (aligned to 4-byte boundary)
  char   flag;       // 1 byte  (+ 7 bytes padding!)
  double timestamp;  // 8 bytes (aligned to 8-byte boundary)
}; // sizeof = 24 bytes! (33% data, 67% overhead)`
                      : `struct OptimalRecord {
  double timestamp;  // 8 bytes (offset 0)
  int    id;         // 4 bytes (offset 8)
  char   status;     // 1 byte  (offset 12)
  char   flag;       // 1 byte  (offset 13 + 2 bytes trailing pad)
}; // sizeof = 16 bytes! (33% memory saved, 2x cache density)`}
                  </pre>
                </div>

                <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-center space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Hardware Alignment Law
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Hardware memory controllers require primitive types of size $K$ to align at physical memory addresses that are multiples of $K$. When fields are placed naively, the compiler must insert idle padding bytes.
                  </p>
                  <div className="text-xs p-2.5 bg-primary-50 text-primary-900 rounded-lg border border-primary-200">
                    {structVariant === 'UNALIGNED'
                      ? '⚠️ In an array of 1,000,000 structs, 8 MB of RAM and cache capacity is wasted purely on dead padding bytes!'
                      : '✓ By sorting struct members in descending order of size (8B → 4B → 2B → 1B), internal padding is completely eliminated.'}
                  </div>
                </div>
              </div>

              {/* 64-Byte Cache Line Byte-Map */}
              <div className="bg-canvas border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    64-Byte L1 Data Cache Line Byte Visualization (Offsets 0x00 to 0x3F)
                  </span>
                  <span className="text-[11px] font-mono text-text-muted">
                    Capacity: {structVariant === 'UNALIGNED' ? '2.6 structs per line' : 'Exactly 4.0 structs per line'}
                  </span>
                </div>

                {/* Grid of 64 bytes */}
                <div className="grid grid-cols-16 gap-1 p-2 bg-surface rounded-lg border border-border">
                  {Array.from({ length: 64 }).map((_, idx) => {
                    let cellColor = 'bg-zinc-100 text-zinc-400';
                    let label = `${idx}`;

                    if (structVariant === 'UNALIGNED') {
                      const mod = idx % 24;
                      if (mod === 0) {
                        cellColor = 'bg-blue-200 text-blue-900 font-bold';
                        label = 'c';
                      } else if (mod >= 1 && mod <= 3) {
                        cellColor = 'bg-rose-100 text-rose-600';
                        label = 'pad';
                      } else if (mod >= 4 && mod <= 7) {
                        cellColor = 'bg-emerald-200 text-emerald-900 font-bold';
                        label = 'int';
                      } else if (mod === 8) {
                        cellColor = 'bg-blue-200 text-blue-900 font-bold';
                        label = 'c';
                      } else if (mod >= 9 && mod <= 15) {
                        cellColor = 'bg-rose-100 text-rose-600';
                        label = 'pad';
                      } else {
                        cellColor = 'bg-amber-200 text-amber-900 font-bold';
                        label = 'dbl';
                      }
                    } else {
                      const mod = idx % 16;
                      if (mod < 8) {
                        cellColor = 'bg-amber-200 text-amber-900 font-bold';
                        label = 'dbl';
                      } else if (mod < 12) {
                        cellColor = 'bg-emerald-200 text-emerald-900 font-bold';
                        label = 'int';
                      } else if (mod === 12 || mod === 13) {
                        cellColor = 'bg-blue-200 text-blue-900 font-bold';
                        label = 'c';
                      } else {
                        cellColor = 'bg-rose-100 text-rose-600';
                        label = 'pad';
                      }
                    }

                    return (
                      <div
                        key={idx}
                        className={`h-9 flex flex-col items-center justify-center rounded text-[9px] border border-border/60 ${cellColor}`}
                        title={`Byte Offset: 0x${idx.toString(16).padStart(2, '0').toUpperCase()}`}
                      >
                        <span className="font-mono">{label}</span>
                        <span className="text-[8px] opacity-60">+{idx}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-200 border border-amber-300" />
                    <span>8-Byte Double</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300" />
                    <span>4-Byte Integer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-200 border border-blue-300" />
                    <span>1-Byte Char</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
                    <span className="text-rose-700 font-bold">Unused Alignment Padding</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MODE B: FALSE SHARING */
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSharingVariant('UNPADDED');
                      setSharingStep(0);
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                      sharingVariant === 'UNPADDED'
                        ? 'bg-rose-50 text-rose-900 border-rose-400 font-bold'
                        : 'bg-canvas text-text-muted border-border hover:text-text'
                    }`}
                  >
                    Unpadded (False Sharing Conflict)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSharingVariant('PADDED');
                      setSharingStep(0);
                    }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                      sharingVariant === 'PADDED'
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-400 font-bold'
                        : 'bg-canvas text-text-muted border-border hover:text-text'
                    }`}
                  >
                    Cache-Line Padded: alignas(64)
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSharingStep((prev) => Math.max(0, prev - 1))}
                    disabled={sharingStep === 0}
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSharingStep((prev) => Math.min(3, prev + 1))}
                    disabled={sharingStep >= 3}
                  >
                    Next Step ({sharingStep + 1}/4) →
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSharingStep(0)}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* Interactive Core & Cache Line Diagram */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-canvas border border-border rounded-xl p-6">
                {/* Core 0 */}
                <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⚡</span>
                      <span className="text-xs font-bold text-text uppercase">CPU Core 0 (Thread 0)</span>
                    </div>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Writing counter_A
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-text-muted">
                      L1 Cache Line Status:{' '}
                      <strong
                        className={`px-1.5 py-0.5 rounded ${
                          sharingVariant === 'UNPADDED' && sharingStep === 2
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sharingVariant === 'UNPADDED'
                          ? sharingStep === 0
                            ? 'SHARED (S)'
                            : sharingStep === 1
                            ? 'MODIFIED (M)'
                            : sharingStep === 2
                            ? 'INVALID (I) ❌'
                            : 'MODIFIED (M)'
                          : 'MODIFIED (M) [Dedicated Line 0]'}
                      </strong>
                    </div>

                    <div className="p-3 bg-canvas rounded-lg border border-border font-mono text-xs">
                      <div>counter_A = {sharingStep >= 1 ? '42' : '0'}</div>
                      <div className="text-[10px] text-text-muted mt-1">
                        Memory Addr: 0x1000_{sharingVariant === 'UNPADDED' ? '0000' : '0000'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core 1 */}
                <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">⚡</span>
                      <span className="text-xs font-bold text-text uppercase">CPU Core 1 (Thread 1)</span>
                    </div>
                    <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      Writing counter_B
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-mono text-text-muted">
                      L1 Cache Line Status:{' '}
                      <strong
                        className={`px-1.5 py-0.5 rounded ${
                          sharingVariant === 'UNPADDED' && sharingStep === 1
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sharingVariant === 'UNPADDED'
                          ? sharingStep === 0
                            ? 'SHARED (S)'
                            : sharingStep === 1
                            ? 'INVALID (I) ❌'
                            : sharingStep === 2
                            ? 'MODIFIED (M)'
                            : 'INVALID (I) ❌'
                          : 'MODIFIED (M) [Dedicated Line 1]'}
                      </strong>
                    </div>

                    <div className="p-3 bg-canvas rounded-lg border border-border font-mono text-xs">
                      <div>counter_B = {sharingStep >= 2 ? '99' : '0'}</div>
                      <div className="text-[10px] text-text-muted mt-1">
                        Memory Addr: 0x1000_{sharingVariant === 'UNPADDED' ? '0008' : '0040'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bus Explanation Banner */}
              <div
                className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  sharingVariant === 'UNPADDED'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span>{sharingVariant === 'UNPADDED' ? '⚡ MESI Protocol Ping-Pong Storm' : '✓ Zero Cache Coherence Contention'}</span>
                </div>
                {sharingVariant === 'UNPADDED' ? (
                  <p>
                    Because <code>counter_A</code> and <code>counter_B</code> reside in the same 64-byte chunk, whenever Core 0 writes, hardware sends a <strong>BusRdX (Read Invalidate)</strong> broadcast that invalidates Core 1&apos;s cache line. When Core 1 attempts to write, it suffers a cache miss, stalls execution, pulls the modified line over the QPI/UPI interconnect, and invalidates Core 0. This false sharing penalty degrades multi-core throughput by up to <strong>40x</strong>!
                  </p>
                ) : (
                  <p>
                    By declaring <code>alignas(64) uint64_t counter_A; alignas(64) uint64_t counter_B;</code>, each variable starts on a distinct 64-byte boundary. Both CPU cores write concurrently in their private L1 caches with <strong>zero bus invalidations</strong> and zero thread stalls!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: HASH TABLE COLLISION PROBING */}
      {activeSubTab === 'HASH_TABLE' && (
        <div className="p-6 space-y-6">
          {/* Strategy Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-canvas border border-border p-4 rounded-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Collision Resolution Strategy:
              </span>
              <p className="text-xs text-text-muted mt-0.5">
                Compare Separate Chaining vs Open Addressing Linear Probing vs Quadratic Probing.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setHashStrategy('CHAINING');
                  setHashStep(HASH_KEYS.length);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  hashStrategy === 'CHAINING'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Separate Chaining
              </button>
              <button
                type="button"
                onClick={() => {
                  setHashStrategy('LINEAR_PROBING');
                  setHashStep(HASH_KEYS.length);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  hashStrategy === 'LINEAR_PROBING'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Linear Probing (h + i)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHashStrategy('QUADRATIC_PROBING');
                  setHashStep(HASH_KEYS.length);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer ${
                  hashStrategy === 'QUADRATIC_PROBING'
                    ? 'bg-primary-700 text-white border-primary-700 shadow-xs'
                    : 'bg-surface text-text-muted border-border hover:text-text'
                }`}
              >
                Quadratic Probing (h + i²)
              </button>
            </div>
          </div>

          {/* Stepper Controls & Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-primary-100 text-primary-900 px-2 py-0.5 rounded">
                  {hashStep} / {HASH_KEYS.length} Keys Inserted
                </span>
                <span className="text-xs text-text-muted">
                  Load Factor &alpha; = N/M: <strong className="text-primary-700">{(hashStep / TABLE_SIZE).toFixed(2)}</strong>
                </span>
                <span className="text-xs text-text-muted">
                  Total Memory Probes: <strong className="text-accent-700">{hashState.totalProbes}</strong>
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Hash Function: <code>h(k) = k mod 10</code>. Keys to insert: <code>[{HASH_KEYS.join(', ')}]</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setHashStep((prev) => Math.max(0, prev - 1))}
                disabled={hashStep === 0}
              >
                ← Prev Key
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setHashStep((prev) => Math.min(HASH_KEYS.length, prev + 1))}
                disabled={hashStep >= HASH_KEYS.length}
              >
                Insert Next Key →
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setHashStep(0)}
              >
                Clear Table
              </Button>
            </div>
          </div>

          {/* Hash Table Visual Layout */}
          <div className="bg-canvas border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Bucket Array Representation (M = 10 Buckets)
              </span>
              <span className="text-xs font-mono text-text-muted">
                {hashStrategy === 'CHAINING'
                  ? 'LinkedList Node Pointers'
                  : hashStrategy === 'LINEAR_PROBING'
                  ? 'Contiguous Slot Traversal'
                  : 'Quadratic Jump Offsets (+1, +4, +9...)'}
              </span>
            </div>

            {hashStrategy === 'CHAINING' && hashState.type === 'chaining' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {hashState.buckets.map((chain, bIdx) => (
                  <div key={bIdx} className="bg-surface border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono border-b border-border pb-1">
                      <span className="font-bold text-primary-800">Bucket [{bIdx}]</span>
                      <span className="text-[10px] text-text-muted">{chain.length} nodes</span>
                    </div>

                    {chain.length === 0 ? (
                      <div className="text-[11px] text-text-muted italic py-1">null</div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {chain.map((val, nIdx) => (
                          <span
                            key={nIdx}
                            className="text-xs font-mono bg-primary-50 text-primary-900 border border-primary-300 px-2 py-0.5 rounded font-bold"
                          >
                            {val} {nIdx < chain.length - 1 && '→'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : hashState.type === 'open_addressing' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                  {hashState.slots.map((slot, sIdx) => (
                    <div
                      key={sIdx}
                      className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all ${
                        slot.key !== null
                          ? slot.probesNeeded > 1
                            ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                            : 'bg-emerald-50 border-emerald-400 text-emerald-900'
                          : 'bg-surface border-border text-text-muted'
                      }`}
                    >
                      <div className="text-[10px] text-text-muted">Slot [{sIdx}]</div>
                      <div className="text-sm font-bold my-1">
                        {slot.key !== null ? slot.key : '—'}
                      </div>
                      <div className="text-[9px] text-text-muted">
                        {slot.key !== null ? `${slot.probesNeeded} probe(s)` : 'empty'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Primary Clustering Alert */}
                {hashStrategy === 'LINEAR_PROBING' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                    <strong>Primary Clustering Observation:</strong> Keys with the same hash modulo (15, 25, 35 all map to bucket 5) form a contiguous block of occupied slots [5, 6, 7]. Any new key hashing to this region must traverse the entire cluster, degrading average lookup time toward O(N) as load factor &alpha; &rarr; 1.
                  </div>
                )}

                {hashStrategy === 'QUADRATIC_PROBING' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 leading-relaxed">
                    <strong>Quadratic Invariant:</strong> By probing at h + 1&sup2;, h + 2&sup2;, h + 3&sup2;, keys disperse across non-adjacent indices, preventing primary clustering buildup and keeping probe lengths bounded.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: LOG-STRUCTURED MERGE-TREE (LSM-TREE) & SSTABLES */}
      {activeSubTab === 'LSM_TREE_SSTABLE' && (
        <div className="p-6 space-y-6">
          {/* Module Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-accent-700 font-mono">
                  Module 4: Storage Engine Architecture
                </span>
                <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
                  Sequential vs Random I/O
                </span>
              </div>
              <h3 className="text-lg font-bold text-text mt-1">
                Log-Structured Merge-Tree (LSM-Tree) &amp; SSTable Compaction Studio
              </h3>
              <p className="text-xs text-text-muted mt-0.5 max-w-3xl leading-relaxed">
                Explore the write-optimized storage architecture powering <strong>RocksDB, Apache Cassandra, and Google Bigtable</strong>. Observe sequential Write-Ahead Log (WAL) appends, RAM MemTable skiplist insertion, auto-flush to disk Level 0 (L0) SSTables, Bloom filter read skipping, tombstone deletions, and multi-way merge Leveled Compaction.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto font-mono text-[11px]">
              <span className="bg-canvas border border-border px-2.5 py-1 rounded-md text-text-muted">
                MemTable: <strong className="text-primary-700">{memTable.length} / 4 Entries</strong>
              </span>
              <span className="bg-canvas border border-border px-2.5 py-1 rounded-md text-text-muted">
                Disk L0: <strong className="text-amber-700">{l0Tables.length} Tables</strong>
              </span>
              <span className="bg-canvas border border-border px-2.5 py-1 rounded-md text-text-muted">
                Disk L1: <strong className="text-emerald-700">{l1Tables.length} Tables</strong>
              </span>
            </div>
          </div>

          {/* Action Control Toolbar */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
              Storage Engine Operations (Write, Read, Delete &amp; Compact):
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleLsmPut('user:101', 'Alice')}
                className="text-xs cursor-pointer"
              >
                + Put &quot;user:101=Alice&quot;
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleLsmPut('user:204', 'Bob')}
                className="text-xs cursor-pointer"
              >
                + Put &quot;user:204=Bob&quot;
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleLsmPut('user:309', 'Charlie')}
                className="text-xs cursor-pointer"
              >
                + Put &quot;user:309=Charlie&quot;
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleLsmPut('user:412', 'David')}
                className="text-xs cursor-pointer"
              >
                ⚡ Put &quot;user:412=David&quot; (Triggers Auto-Flush)
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleLsmDelete('user:101')}
                className="text-xs cursor-pointer"
              >
                ✝ Delete &quot;user:101&quot; (Tombstone)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleLsmPointRead('user:204')}
                className="text-xs cursor-pointer"
              >
                🔍 Query &quot;user:204&quot;
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleLsmPointRead('user:999')}
                className="text-xs cursor-pointer"
              >
                🔍 Query Missing &quot;user:999&quot; (Bloom Skip)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleLsmCompaction}
                className="bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100 text-xs cursor-pointer font-bold"
              >
                ⚡ Trigger Leveled Compaction (L0 → L1)
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleLsmReset}
                className="text-xs cursor-pointer ml-auto"
              >
                ↺ Reset Engine
              </Button>
            </div>
          </div>

          {/* Read Pipeline Trace HUD (if active) */}
          {readTrace && (
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-indigo-900 dark:text-indigo-200">
                <span>Multi-Tier Read Pipeline Execution Trace:</span>
                <span className="font-mono text-[11px]">{readTrace.length} Evaluation Stages</span>
              </div>

              <div className="space-y-1.5 pt-1">
                {readTrace.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-canvas border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-text-muted font-bold">{step.stage}:</span>
                      <span className="font-mono text-primary-700 bg-surface px-1.5 py-0.5 rounded border border-border font-bold">
                        {step.target}
                      </span>
                      <span className="text-text font-medium">{step.detail}</span>
                    </div>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border self-start sm:self-center shrink-0 ${
                      step.result === 'HIT'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : step.result === 'BLOOM_FILTER_NEGATIVE_SKIP'
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}>
                      {step.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Split-Pane: Memory Tier (RAM) vs Persistent Storage Tier (Disk/SSD) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: RAM TIER */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-700 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span>
                  In-Memory Tier (RAM)
                </span>
                <span className="text-[11px] font-mono text-text-muted">Sub-Microsecond Latency</span>
              </div>

              {/* Write-Ahead Log (WAL) */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text font-mono">Sequential Write-Ahead Log (WAL)</span>
                  <span className="text-[10px] font-mono text-text-muted">Append-Only Sequential I/O</span>
                </div>
                <div className="bg-canvas border border-border rounded-lg p-2.5 font-mono text-xs max-h-32 overflow-y-auto space-y-1">
                  {walEntries.length > 0 ? (
                    walEntries.map((w) => (
                      <div key={w.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-primary-700 font-bold">APPEND: [{w.op}] {w.key}</span>
                        <span className="text-text-muted">{w.value}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-text-muted italic text-[11px]">WAL truncated after MemTable flush to disk</span>
                  )}
                </div>
              </div>

              {/* Active MemTable (Skiplist) */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-text font-mono block">Active MemTable (SkipList in RAM)</span>
                    <span className="text-[10px] text-text-muted">O(log N) Sorted Lookups &amp; Inserts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                      Capacity: {memTable.length} / 4
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="w-full bg-canvas rounded-full h-1.5 border border-border overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      memTable.length >= 3 ? 'bg-amber-500' : 'bg-primary-600'
                    }`}
                    style={{ width: `${(memTable.length / 4) * 100}%` }}
                  />
                </div>

                <div className="space-y-1.5 pt-1">
                  {memTable.length > 0 ? (
                    memTable.map((entry) => (
                      <div
                        key={entry.key}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono ${
                          entry.isTombstone
                            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300'
                            : 'bg-canvas border-border'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text">{entry.key}</span>
                          <span className="text-text-muted">→</span>
                          <span className={`font-semibold ${entry.isTombstone ? 'text-rose-700' : 'text-primary-700'}`}>
                            {entry.value}
                          </span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          entry.isTombstone ? 'bg-rose-100 text-rose-900' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {entry.isTombstone ? 'TOMBSTONE' : `v${entry.version % 1000}`}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-text-muted italic bg-canvas rounded-lg border border-border">
                      MemTable is empty (flushed to disk)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: PERSISTENT STORAGE TIER (DISK / SSD) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  Persistent Storage Tier (Disk / SSD)
                </span>
                <span className="text-[11px] font-mono text-text-muted">Immutable Sorted String Tables</span>
              </div>

              {/* Level 0 SSTables (Overlapping) */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-text font-mono block">Level 0 (L0) SSTables (Overlapping Keys)</span>
                    <span className="text-[10px] text-text-muted">Flushed directly from RAM without merge compaction</span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-bold">
                    {l0Tables.length} Tables
                  </span>
                </div>

                <div className="space-y-2">
                  {l0Tables.length > 0 ? (
                    l0Tables.map((tbl) => (
                      <div
                        key={tbl.id}
                        className="p-3 rounded-lg bg-canvas border border-border space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-text text-xs">{tbl.id}</span>
                          <span className="font-mono text-[10px] bg-surface px-1.5 py-0.5 rounded border border-border text-text-muted">
                            Range: [{tbl.minKey} .. {tbl.maxKey}]
                          </span>
                        </div>

                        {/* Bloom Filter Bit Array */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-0.5">
                          <span>8-Bit Bloom Filter:</span>
                          <div className="flex items-center gap-1">
                            {tbl.bloomFilterBits.map((b, bIdx) => (
                              <span
                                key={bIdx}
                                className={`w-4 h-4 rounded flex items-center justify-center font-bold ${
                                  b === 1 ? 'bg-primary-600 text-white' : 'bg-surface text-text-muted border border-border'
                                }`}
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Stored Key Entries */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {tbl.entries.map((e) => (
                            <span
                              key={e.key}
                              className={`px-1.5 py-0.5 rounded border font-mono text-[10px] ${
                                e.isTombstone
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-surface text-text border-border'
                              }`}
                            >
                              {e.key}={e.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-3 text-xs text-text-muted italic bg-canvas rounded-lg border border-border">
                      No L0 tables on disk (compacted into L1)
                    </div>
                  )}
                </div>
              </div>

              {/* Level 1 SSTables (Compacted & Partitioned) */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-text font-mono block">Level 1 (L1) SSTables (Partitioned &amp; Non-Overlapping)</span>
                    <span className="text-[10px] text-text-muted">Strictly ordered key partitions with 1 disk seek maximum</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-bold">
                    {l1Tables.length} Tables
                  </span>
                </div>

                <div className="space-y-2">
                  {l1Tables.map((tbl) => (
                    <div
                      key={tbl.id}
                      className="p-3 rounded-lg bg-canvas border border-border space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-text text-xs">{tbl.id}</span>
                        <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
                          Partition: [{tbl.minKey} .. {tbl.maxKey}]
                        </span>
                      </div>

                      {/* Bloom Filter */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-0.5">
                        <span>8-Bit Bloom Filter:</span>
                        <div className="flex items-center gap-1">
                          {tbl.bloomFilterBits.map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className={`w-4 h-4 rounded flex items-center justify-center font-bold ${
                                b === 1 ? 'bg-emerald-600 text-white' : 'bg-surface text-text-muted border border-border'
                              }`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Entries */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tbl.entries.map((e) => (
                          <span
                            key={e.key}
                            className={`px-1.5 py-0.5 rounded border font-mono text-[10px] ${
                              e.isTombstone
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-surface text-text border-border'
                            }`}
                          >
                            {e.key}={e.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Storage Engine Audit Log */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text uppercase tracking-wider">
                Storage Engine I/O Audit Log &amp; Event Stream:
              </span>
              <span className="text-text-muted font-mono text-[11px]">
                {lsmAuditLog.length} Recorded Operations
              </span>
            </div>

            <div className="space-y-2">
              {lsmAuditLog.map((ev) => (
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
                1. Sequential vs Random I/O
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                By appending to a Write-Ahead Log and writing to in-memory skiplists, LSM-Trees convert random writes into sequential disk I/O, achieving 100x write throughput over in-place B+ Trees.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. Write Amplification (WA)
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Write Amplification is the ratio of bytes written to storage vs bytes requested by user: WA = Bytes_disk / Bytes_user. Leveled compaction bounds WA while minimizing space amplification.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. Bloom Filter Short-Circuit
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Bloom filters provide O(1) definite negative short-circuits. If a key is absent, the bloom filter skips the SSTable without performing expensive random disk seeks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. Tombstone Deletion GC
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Deletes are written as tombstone markers. Reclaiming disk space and purging tombstones occurs only during background merge compaction when merging into the oldest storage level.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ARIES DATABASE CRASH RECOVERY STUDIO */}
      {activeSubTab === 'ARIES_RECOVERY' && (
        <div className="p-6 space-y-6">
          {/* Recovery State Control & Execution Toolbar */}
          <div className="space-y-4 bg-canvas border border-border p-4 rounded-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    ARIES 3-Pass Recovery Stepper:
                  </span>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                      ariesPhase === 'IDLE'
                        ? 'bg-slate-100 text-slate-800 border-slate-300'
                        : ariesPhase === 'CRASHED'
                        ? 'bg-rose-100 text-rose-900 border-rose-300'
                        : ariesPhase === 'ANALYSIS_COMPLETE'
                        ? 'bg-blue-100 text-blue-900 border-blue-300'
                        : ariesPhase === 'REDO_COMPLETE'
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    STATUS: {ariesPhase}
                  </span>
                </div>
                <p className="text-xs text-text-muted">
                  Model C. Mohan&apos;s ARIES crash recovery under STEAL (uncommitted updates on disk) and NO-FORCE (committed updates not yet flushed).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleTriggerCrash}
                  disabled={ariesPhase !== 'IDLE'}
                >
                  ⚡ Trigger Database Crash
                </Button>

                <Button
                  variant={ariesPhase === 'CRASHED' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleRunAnalysisPass}
                  disabled={ariesPhase !== 'CRASHED'}
                >
                  Pass 1: Analysis
                </Button>

                <Button
                  variant={ariesPhase === 'ANALYSIS_COMPLETE' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleRunRedoPass}
                  disabled={ariesPhase !== 'ANALYSIS_COMPLETE'}
                >
                  Pass 2: Redo (Repeat History)
                </Button>

                <Button
                  variant={ariesPhase === 'REDO_COMPLETE' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={handleRunUndoPass}
                  disabled={ariesPhase !== 'REDO_COMPLETE'}
                >
                  Pass 3: Undo (Rollback Losers)
                </Button>

                <Button variant="secondary" size="sm" onClick={handleResetAries}>
                  Reset Engine
                </Button>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-xs">
              <div
                className={`p-2.5 rounded-lg border text-center transition-colors ${
                  ariesPhase === 'CRASHED'
                    ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                    : 'bg-surface border-border text-text-muted'
                }`}
              >
                <span className="text-[10px] uppercase block">Step 0</span>
                <span>Crash Event (RAM Wiped)</span>
              </div>
              <div
                className={`p-2.5 rounded-lg border text-center transition-colors ${
                  ariesPhase === 'ANALYSIS_COMPLETE'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold'
                    : 'bg-surface border-border text-text-muted'
                }`}
              >
                <span className="text-[10px] uppercase block">Pass 1</span>
                <span>Analysis (Find Losers &amp; recLSN)</span>
              </div>
              <div
                className={`p-2.5 rounded-lg border text-center transition-colors ${
                  ariesPhase === 'REDO_COMPLETE'
                    ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold'
                    : 'bg-surface border-border text-text-muted'
                }`}
              >
                <span className="text-[10px] uppercase block">Pass 2</span>
                <span>Redo (Repeating History)</span>
              </div>
              <div
                className={`p-2.5 rounded-lg border text-center transition-colors ${
                  ariesPhase === 'UNDO_COMPLETE'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                    : 'bg-surface border-border text-text-muted'
                }`}
              >
                <span className="text-[10px] uppercase block">Pass 3</span>
                <span>Undo (CLRs &amp; Rollback)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Storage Tier & RAM Tier */}
            <div className="lg:col-span-7 space-y-4">
              {/* Physiological Disk Log Stream */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-text">
                      Durable Disk Write-Ahead Log (WAL Stream)
                    </h3>
                    <p className="text-[11px] text-text-muted">
                      Append-only log containing forward actions, checkpoints, and compensation log records (CLRs).
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-text-muted">
                    FlushedLSN: <strong>50</strong>
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {ariesLogs.map((log) => {
                    const isCheckpoint = log.type.startsWith('CHECKPOINT');
                    const isClr = log.type === 'CLR';
                    const isCommit = log.type === 'COMMIT';
                    const isAbort = log.type === 'ABORT';

                    return (
                      <div
                        key={log.lsn}
                        className={`p-2 rounded border text-xs flex items-center justify-between font-mono ${
                          isClr
                            ? 'bg-purple-50 border-purple-300 text-purple-950 dark:bg-purple-950/20'
                            : isCheckpoint
                            ? 'bg-amber-50 border-amber-300 text-amber-950 dark:bg-amber-950/20'
                            : isCommit
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/20'
                            : isAbort
                            ? 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/20'
                            : 'bg-canvas border-border text-text'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-muted">LSN {log.lsn}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                              isClr
                                ? 'bg-purple-200 text-purple-900 border-purple-400'
                                : isCheckpoint
                                ? 'bg-amber-200 text-amber-900 border-amber-400'
                                : isCommit
                                ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                                : isAbort
                                ? 'bg-rose-200 text-rose-900 border-rose-400'
                                : 'bg-slate-200 text-slate-800 border-slate-300'
                            }`}
                          >
                            {log.type}
                          </span>
                          {log.transId && <span className="font-bold text-text">[{log.transId}]</span>}
                          <span className="text-[11px] text-text font-sans">{log.description}</span>
                        </div>
                        <div className="text-[10px] text-text-muted flex items-center gap-2">
                          {log.prevLsn !== null && <span>prevLSN: {log.prevLsn}</span>}
                          {log.undoNextLsn !== undefined && log.undoNextLsn !== null && (
                            <span className="text-purple-700 font-bold">undoNext: {log.undoNextLsn}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Buffer Pool vs Persistent Disk Pages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Volatile RAM Buffer Pool */}
                <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-bold text-xs text-text">
                      Volatile Buffer Pool (RAM)
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ariesPhase === 'CRASHED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {ariesPhase === 'CRASHED' ? 'WIPED ON CRASH ✕' : 'ACTIVE IN RAM ✓'}
                    </span>
                  </div>

                  {Object.keys(bufferPages).length === 0 ? (
                    <div className="p-4 rounded-lg bg-canvas border border-dashed border-border text-center text-xs text-text-muted">
                      Buffer Pool is completely empty (RAM lost during crash).
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {Object.values(bufferPages).map((p) => (
                        <div
                          key={p.pageId}
                          className="p-2.5 rounded-lg bg-canvas border border-border flex items-center justify-between text-xs font-mono"
                        >
                          <div>
                            <span className="font-bold text-text block">{p.pageId}</span>
                            <span className="text-[11px] text-text-muted">Data: {p.data}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] bg-primary-100 text-primary-900 border border-primary-300 px-1.5 py-0.5 rounded font-bold block">
                              PageLSN: {p.pageLsn}
                            </span>
                            {p.isDirty && <span className="text-[10px] text-amber-600 font-bold">DIRTY</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Persistent Disk Pages */}
                <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-bold text-xs text-text">
                      Persistent Disk Pages (Non-Volatile)
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">
                      DURABLE DISK
                    </span>
                  </div>

                  <div className="space-y-2">
                    {Object.values(diskPages).map((p) => (
                      <div
                        key={p.pageId}
                        className="p-2.5 rounded-lg bg-canvas border border-border flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <span className="font-bold text-text block">{p.pageId}</span>
                          <span className="text-[11px] text-text-muted">Data: {p.data}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] bg-slate-200 text-slate-900 border border-slate-300 px-1.5 py-0.5 rounded font-bold block">
                            PageLSN: {p.pageLsn}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {p.pageLsn === 50 && '(Stolen by T3)'}
                            {p.pageLsn === 0 && '(Unwritten by T2)'}
                            {p.pageLsn > 50 && '(Recovered)'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: In-Memory Tables & Recovery HUD */}
            <div className="lg:col-span-5 space-y-4">
              {/* In-Memory Transaction Table & Dirty Page Table */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-sm text-text">
                    In-Memory Metadata Tables
                  </h3>
                  <span className="text-[11px] font-mono text-text-muted">
                    {ariesPhase === 'CRASHED' ? 'Lost on Crash' : 'Reconstructed in RAM'}
                  </span>
                </div>

                {/* Transaction Table */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-text-muted">
                    <span>Transaction Table (TT)</span>
                    {analysisLosers.length > 0 && (
                      <span className="text-rose-600 font-bold">Losers: [{analysisLosers.join(', ')}]</span>
                    )}
                  </div>

                  {Object.keys(transTable).length === 0 ? (
                    <div className="p-2.5 rounded bg-canvas border border-dashed border-border text-center text-xs text-text-muted">
                      No active transactions (wiped or pre-analysis).
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {Object.values(transTable).map((t) => (
                        <div
                          key={t.transId}
                          className="p-2 rounded bg-canvas border border-border flex items-center justify-between text-xs font-mono"
                        >
                          <span className="font-bold text-text">{t.transId}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                              t.status === 'RUNNING'
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : t.status === 'COMMITTED'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-slate-100 text-slate-800 border-slate-300'
                            }`}
                          >
                            {t.status}
                          </span>
                          <span className="text-text-muted text-[11px]">lastLSN: {t.lastLsn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dirty Page Table */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs font-bold text-text-muted">
                    <span>Dirty Page Table (DPT)</span>
                    {redoStartLsn !== null && (
                      <span className="text-purple-600 font-bold font-mono">RedoStartLSN: {redoStartLsn}</span>
                    )}
                  </div>

                  {Object.keys(dirtyPageTable).length === 0 ? (
                    <div className="p-2.5 rounded bg-canvas border border-dashed border-border text-center text-xs text-text-muted">
                      Dirty Page Table is empty (all pages clean).
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {Object.values(dirtyPageTable).map((d) => (
                        <div
                          key={d.pageId}
                          className="p-2 rounded bg-canvas border border-border flex items-center justify-between text-xs font-mono"
                        >
                          <span className="font-bold text-text">{d.pageId}</span>
                          <span className="text-[11px] text-amber-700 font-bold">recLSN: {d.recLsn}</span>
                          <span className="text-text-muted text-[11px]">pageLSN: {d.pageLsn}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Compensation Log Records (CLRs) Inspector */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-sm text-text">
                    Compensation Log Records (CLRs)
                  </h3>
                  <span className="text-[11px] font-mono text-purple-700 font-bold">
                    {clrRecords.length} CLRs Emitted
                  </span>
                </div>

                {clrRecords.length === 0 ? (
                  <p className="text-xs text-text-muted">
                    No CLRs emitted yet. During Pass 3 (Undo), every rolled-back update writes a CLR with an undoNextLSN pointer to guarantee crash-during-recovery idempotency.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {clrRecords.map((clr) => (
                      <div
                        key={clr.lsn}
                        className="p-2 rounded bg-purple-50 border border-purple-200 text-xs font-mono space-y-0.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-purple-900">LSN {clr.lsn} · {clr.type}</span>
                          <span className="text-purple-700 font-bold">undoNextLSN: {clr.undoNextLsn}</span>
                        </div>
                        <p className="text-[11px] text-text font-sans leading-tight">{clr.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recovery Event Audit Log */}
              <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-sm text-text">
                    Recovery Pipeline Audit Log
                  </h3>
                  <span className="text-[11px] text-text-muted font-mono">Live Timeline</span>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {ariesAuditLog.map((ev) => (
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

          {/* Socratic Invariant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Core WAL Invariant
              </span>
              <h4 className="font-bold text-sm text-text">PageLSN ≤ FlushedLSN</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                A dirty buffer pool page P can never be written to non-volatile disk until all log records describing modifications up to PageLSN(P) have been flushed to persistent storage. This guarantees that uncommitted changes on disk can always be rolled back.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Redo Invariant
              </span>
              <h4 className="font-bold text-sm text-text">Repeating History</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Under STEAL/NO-FORCE policies, ARIES Redo reapplies ALL logged changes forward from min(recLSN) up to the crash point, including uncommitted loser transactions. This restores the database to the exact state at the crash moment before undoing losers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Idempotency Invariant
              </span>
              <h4 className="font-bold text-sm text-text">Compensation Log Records (CLRs)</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                When undoing an operation, ARIES writes a CLR containing an undoNextLSN pointer to the previous record that needs rolling back. Because CLRs are never undone, if the system crashes again during recovery, work is never repeated.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Checkpoint Invariant
              </span>
              <h4 className="font-bold text-sm text-text">Fuzzy Checkpointing</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Fuzzy checkpointing does not flush dirty data pages or freeze active transactions. It simply records a snapshot of the Transaction Table and Dirty Page Table into the log, bounding how far back Pass 1 (Analysis) and Pass 2 (Redo) must scan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: CACHE STAMPEDE & PROBABILISTIC EARLY RECOMPUTATION (XFETCH) */}
      {activeSubTab === 'CACHE_STAMPEDE_XFETCH' && (
        <div className="p-6 space-y-6">
          {/* Header & Strategy Selector */}
          <div className="bg-canvas border border-border rounded-xl p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                    Module 6: High-Concurrency Caching
                  </span>
                  <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
                    VLDB 2015 Standard
                  </span>
                </div>
                <h3 className="text-base font-bold text-text mt-1">
                  Two-Tier Cache Stampede &amp; Probabilistic Early Recomputation (XFetch)
                </h3>
                <p className="text-xs text-text-muted mt-0.5 max-w-3xl">
                  Simulate the catastrophic Thundering Herd when hot cache keys expire under concurrent load, and evaluate how the optimal probabilistic XFetch algorithm prevents database connection pool exhaustion without mutex locks.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleResetStampede}
                  className="text-xs font-semibold"
                >
                  Reset Studio
                </Button>
              </div>
            </div>

            {/* Strategy Pill Switcher */}
            <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setStampedeStrategy('NAIVE_TTL');
                    setIsMutexDeadlocked(false);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    stampedeStrategy === 'NAIVE_TTL'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  1. Naive TTL Expiry (Zero Defense)
                </button>
                <button
                  type="button"
                  onClick={() => setStampedeStrategy('MUTEX_LOCK')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    stampedeStrategy === 'MUTEX_LOCK'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  2. Distributed Mutex (Singleflight)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStampedeStrategy('XFETCH_PROBABILISTIC');
                    setIsMutexDeadlocked(false);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    stampedeStrategy === 'XFETCH_PROBABILISTIC'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  3. XFetch Probabilistic (VLDB 2015)
                </button>
              </div>

              <div className="flex items-center gap-2">
                {stampedeStrategy === 'MUTEX_LOCK' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleSimulateWorkerCrash}
                    className="text-xs font-semibold text-rose-700 border-rose-300 hover:bg-rose-50"
                  >
                    ⚠ Crash Mutex Worker
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Control Toolbar */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Traffic Burst Launcher */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Simulate Concurrent Traffic:
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDispatchTrafficBurst(10)}
                    className="text-xs font-bold flex-1"
                  >
                    ⚡ 10 Reqs
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDispatchTrafficBurst(50)}
                    className="text-xs font-bold flex-1"
                  >
                    ⚡ 50 Reqs
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleDispatchTrafficBurst(100)}
                    className="text-xs font-bold flex-1"
                  >
                    ⚡ 100 Reqs
                  </Button>
                </div>
                <p className="text-[11px] text-text-muted">
                  Dispatches simultaneous read burst hitting cache key
                </p>
              </div>

              {/* Virtual Clock Steppers */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Virtual Clock Controls:
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleAdvanceStampedeTime(1)}
                    className="text-xs font-semibold flex-1"
                  >
                    +1.0s Time
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleJumpNearExpiry}
                    className="text-xs font-semibold flex-1"
                  >
                    Near Expiry (9.8s)
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleForceExpireStampedeKey}
                    className="text-xs font-semibold flex-1 text-red-700"
                  >
                    Expire (10s)
                  </Button>
                </div>
                <p className="text-[11px] text-text-muted">
                  Elapsed: {stampedeKey.elapsedSec}s / {stampedeKey.ttlSec}s ({stampedeKey.remainingTtlSec}s remaining)
                </p>
              </div>

              {/* XFetch Beta Parameter Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="uppercase tracking-wider text-text-muted">
                    Aggressiveness Multiplier (β):
                  </span>
                  <span className="font-mono text-primary-800">{xfetchBeta.toFixed(1)}×</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  aria-label="XFetch Beta Multiplier"
                  value={xfetchBeta}
                  onChange={(e) => setXfetchBeta(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-700"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>0.5× (Conservative)</span>
                  <span>1.0× (Standard)</span>
                  <span>2.0× (Aggressive)</span>
                </div>
              </div>

              {/* DB Query Latency Delta Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="uppercase tracking-wider text-text-muted">
                    DB Computation Time (δ):
                  </span>
                  <span className="font-mono text-primary-800">{xfetchDeltaMs}ms</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  step="10"
                  aria-label="Database Computation Latency Delta"
                  value={xfetchDeltaMs}
                  onChange={(e) => setXfetchDeltaMs(parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-700"
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>50ms (Indexed)</span>
                  <span>120ms (Standard)</span>
                  <span>250ms (Heavy Agg)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Tier Cache Topology Architecture Visual */}
          <div className="bg-canvas border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                3-Tier Cache Hierarchy Architecture:
              </span>
              <span className="text-xs text-text-muted font-mono">
                Key: “{stampedeKey.key}” (v{stampedeKey.version})
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tier 1: L1 In-Process Cache */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                    Tier 1: L1 In-Process Cache
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    RAM (0.1ms)
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-text-muted">
                    <span>Structure:</span>
                    <span className="font-mono text-text">Process LRU Map</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Read Latency:</span>
                    <span className="font-mono text-emerald-700 font-semibold">0.1 ms</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Cache State:</span>
                    <span className={`font-bold ${stampedeKey.isExpired ? 'text-red-700' : 'text-emerald-700'}`}>
                      {stampedeKey.isExpired ? 'STALE / EXPIRED' : 'VALID HIT'}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border text-[11px] text-text-muted">
                  Serves immediate reads without serialization or network round-trips.
                </div>
              </div>

              {/* Tier 2: L2 Distributed Shared Cache */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent-700 uppercase tracking-wider">
                    Tier 2: L2 Distributed Cache
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    Cluster (1.5ms)
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-text-muted">
                    <span>Time-to-Live (TTL):</span>
                    <span className="font-mono font-bold text-text">
                      {stampedeKey.remainingTtlSec}s / {stampedeKey.ttlSec}s
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        stampedeKey.remainingTtlSec > 3
                          ? 'bg-emerald-500'
                          : stampedeKey.remainingTtlSec > 0.5
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${(stampedeKey.remainingTtlSec / stampedeKey.ttlSec) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-text-muted pt-1">
                    <span>Lock Status:</span>
                    <span className={`font-mono font-bold ${isMutexDeadlocked ? 'text-red-700' : stampedeStrategy === 'MUTEX_LOCK' ? 'text-amber-700' : 'text-slate-500'}`}>
                      {isMutexDeadlocked ? 'DEADLOCKED (5000ms)' : stampedeStrategy === 'MUTEX_LOCK' ? 'ACTIVE SINGLEFLIGHT' : 'LOCK-FREE'}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border text-[11px] text-text-muted">
                  Shared across application nodes with atomic TTL expiration and key leasing.
                </div>
              </div>

              {/* Tier 3: L3 Relational Persistent Database */}
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                    Tier 3: Relational Database
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    Disk ({xfetchDeltaMs}ms)
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between text-text-muted">
                    <span>Connection Pool Capacity:</span>
                    <span className="font-mono font-bold text-text">10 Connections</span>
                  </div>
                  <div className="flex justify-between text-text-muted">
                    <span>Active Usage:</span>
                    <span className={`font-mono font-bold ${
                      lastBurstResult && lastBurstResult.dbPoolPeak >= 10
                        ? 'text-red-700'
                        : lastBurstResult && lastBurstResult.dbPoolPeak > 0
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}>
                      {lastBurstResult ? `${lastBurstResult.dbPoolPeak} / 10` : '0 / 10'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        lastBurstResult && lastBurstResult.dbPoolPeak >= 10
                          ? 'bg-rose-600'
                          : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${lastBurstResult ? (lastBurstResult.dbPoolPeak / 10) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-border text-[11px] text-text-muted">
                  Canonical data source. Heavy aggregations require {xfetchDeltaMs}ms compute per query.
                </div>
              </div>
            </div>
          </div>

          {/* Mathematical Proof & XFetch Probability HUD */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                  Mathematical Formulation &amp; Probability HUD
                </span>
                <h4 className="font-bold text-sm text-text mt-0.5">
                  The XFetch Optimal Early Recomputation Invariant (VLDB 2015)
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200">
                  P(Early Refresh) = {(xfetchProb * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              {/* SVG Probability Curve */}
              <div className="bg-canvas border border-border rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-text-muted">
                  <span>Probability Curve: P(Refresh) vs Remaining TTL</span>
                  <span className="font-mono">P = exp(-remaining / (β×δ))</span>
                </div>
                <svg viewBox="0 0 400 160" className="w-full h-40 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="70" x2="380" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="120" x2="380" y2="120" stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1="40" y1="20" x2="40" y2="120" stroke="#CBD5E1" strokeWidth="1.5" />

                  {/* Axis Labels */}
                  <text x="35" y="24" textAnchor="end" className="text-[9px] fill-slate-400 font-mono">1.0</text>
                  <text x="35" y="74" textAnchor="end" className="text-[9px] fill-slate-400 font-mono">0.5</text>
                  <text x="35" y="124" textAnchor="end" className="text-[9px] fill-slate-400 font-mono">0.0</text>

                  <text x="40" y="136" textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">0s (Expiry)</text>
                  <text x="125" y="136" textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">2.5s</text>
                  <text x="210" y="136" textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">5.0s</text>
                  <text x="295" y="136" textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">7.5s</text>
                  <text x="380" y="136" textAnchor="middle" className="text-[9px] fill-slate-500 font-mono">10s</text>

                  {/* Exponential Curve: x from 40 (0s) to 380 (10s) */}
                  <path
                    d={Array.from({ length: 50 }, (_, i) => {
                      const tSec = (i / 49) * 10;
                      const x = 40 + (tSec / 10) * 340;
                      const p = Math.exp(-(tSec * 1000) / stampedeDenominator);
                      const y = 120 - p * 100;
                      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="2.5"
                  />

                  {/* Current Position Marker */}
                  {(() => {
                    const currentX = 40 + (stampedeKey.remainingTtlSec / 10) * 340;
                    const currentY = 120 - xfetchProb * 100;
                    return (
                      <g>
                        <line
                          x1={currentX}
                          y1="20"
                          x2={currentX}
                          y2="120"
                          stroke="#EF4444"
                          strokeDasharray="2 2"
                          strokeWidth="1.5"
                        />
                        <circle
                          cx={currentX}
                          cy={currentY}
                          r="5"
                          fill="#EF4444"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text
                          x={Math.min(350, Math.max(70, currentX))}
                          y={Math.max(30, currentY - 8)}
                          textAnchor="middle"
                          className="text-[10px] font-mono font-bold fill-red-700"
                        >
                          t={stampedeKey.remainingTtlSec}s ({(xfetchProb * 100).toFixed(0)}%)
                        </text>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Mathematical Equation & Evaluation Breakdown */}
              <div className="p-4 rounded-xl bg-canvas border border-border space-y-3">
                <div className="text-xs font-mono font-bold text-primary-900 bg-primary-50 p-2.5 rounded-lg border border-primary-200">
                  Condition: [-β × δ × ln(u) &gt; TTL_remaining]
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Uniform Random Deviate (u ∼ U(0,1)):</span>
                    <span className="font-mono font-bold text-text">{lastRandomU.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Exponential Deviation Term (-βδ ln u):</span>
                    <span className="font-mono font-bold text-indigo-700">{calculatedExpTerm} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Remaining Time-To-Live (TTL_rem):</span>
                    <span className="font-mono font-bold text-text">{stampedeRemainingMs} ms</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-bold text-text">Evaluation Result:</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                      xfetchConditionMet
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {xfetchConditionMet ? 'TRUE → PROACTIVE REFRESH TRIGGERED' : 'FALSE → CACHE HIT DEFERRED'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  As remaining TTL approaches 0, the probability of drawing an exponential deviate greater than the remaining time approaches 1.0. With λ_r requests arriving per second, at least one worker triggers recomputation before expiration with high probability.
                </p>
              </div>
            </div>
          </div>

          {/* Traffic Burst Result & Comparative Benchmark Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Last Burst Telemetry Card */}
            <div className="lg:col-span-1 p-5 rounded-xl bg-surface border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Last Burst Telemetry:
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {lastBurstResult ? lastBurstResult.timestamp : 'Awaiting Burst'}
                </span>
              </div>

              {!lastBurstResult ? (
                <div className="p-8 text-center text-text-muted text-xs">
                  Click “⚡ 50 Reqs” or “⚡ 100 Reqs” in the toolbar to simulate concurrent reads hitting the cache hierarchy.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-canvas border border-border font-medium text-text leading-relaxed">
                    {lastBurstResult.summary}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-canvas border border-border">
                      <div className="text-[10px] uppercase tracking-wider text-text-muted">Cache Hit Rate</div>
                      <div className={`text-lg font-bold font-mono ${
                        lastBurstResult.cacheHits > 0 ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {((lastBurstResult.cacheHits / lastBurstResult.concurrency) * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-canvas border border-border">
                      <div className="text-[10px] uppercase tracking-wider text-text-muted">DB Connections</div>
                      <div className={`text-lg font-bold font-mono ${
                        lastBurstResult.dbPoolPeak >= 10 ? 'text-red-700' : 'text-indigo-700'
                      }`}>
                        {lastBurstResult.dbPoolPeak} / 10
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-canvas border border-border">
                      <div className="text-[10px] uppercase tracking-wider text-text-muted">p50 Latency</div>
                      <div className="text-lg font-bold font-mono text-text">
                        {lastBurstResult.p50LatencyMs} ms
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-canvas border border-border">
                      <div className="text-[10px] uppercase tracking-wider text-text-muted">p99 Latency</div>
                      <div className={`text-lg font-bold font-mono ${
                        lastBurstResult.p99LatencyMs > 200 ? 'text-red-700' : 'text-emerald-700'
                      }`}>
                        {lastBurstResult.p99LatencyMs} ms
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comparative Benchmark Matrix */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-surface border border-border space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                Architectural Benchmark Comparison
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-slate-50/50 text-text-muted uppercase text-[10px] tracking-wider">
                      <th className="p-2.5">Strategy</th>
                      <th className="p-2.5">Concurrent Misses</th>
                      <th className="p-2.5">DB Connection Load</th>
                      <th className="p-2.5">p99 Read Latency</th>
                      <th className="p-2.5">Worker Crash Resilience</th>
                      <th className="p-2.5">Implementation Complexity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className={stampedeStrategy === 'NAIVE_TTL' ? 'bg-rose-50/40 font-semibold' : ''}>
                      <td className="p-2.5 text-text">1. Naive TTL Expiry</td>
                      <td className="p-2.5 font-mono text-red-700">100% Stampede</td>
                      <td className="p-2.5 font-mono text-red-700">10/10 Exhaustion (503s)</td>
                      <td className="p-2.5 font-mono text-red-700">2,500ms (Timeout)</td>
                      <td className="p-2.5 text-slate-500">N/A (Crashes DB)</td>
                      <td className="p-2.5 text-slate-500">None (Naive default)</td>
                    </tr>
                    <tr className={stampedeStrategy === 'MUTEX_LOCK' ? 'bg-amber-50/40 font-semibold' : ''}>
                      <td className="p-2.5 text-text">2. Distributed Mutex</td>
                      <td className="p-2.5 font-mono text-emerald-700">0% (1 executes)</td>
                      <td className="p-2.5 font-mono text-emerald-700">1 / 10 (Protected)</td>
                      <td className="p-2.5 font-mono text-amber-700">135ms (Blocked Wait)</td>
                      <td className="p-2.5 font-mono text-red-700">Deadlock Vulnerable</td>
                      <td className="p-2.5 text-slate-500">High (Lease/TTL/Orphan)</td>
                    </tr>
                    <tr className={stampedeStrategy === 'XFETCH_PROBABILISTIC' ? 'bg-emerald-50/40 font-semibold' : ''}>
                      <td className="p-2.5 text-text">3. XFetch Probabilistic</td>
                      <td className="p-2.5 font-mono text-emerald-700">0% (Proactive Refresh)</td>
                      <td className="p-2.5 font-mono text-emerald-700">1 / 10 (Optimal)</td>
                      <td className="p-2.5 font-mono text-emerald-700">0.8ms (Zero Wait)</td>
                      <td className="p-2.5 font-mono text-emerald-700">100% Resilient</td>
                      <td className="p-2.5 text-emerald-700">Low (Read math only)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Audit Event Stream */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Stampede &amp; XFetch Operational Audit Stream:
              </span>
              <span className="text-[11px] text-text-muted font-mono">
                {stampedeAuditLog.length} events logged
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-xs">
              {stampedeAuditLog.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-canvas border border-border flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-[10px]">{log.time}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${log.badgeClass}`}>
                      {log.badge}
                    </span>
                  </div>
                  <span className="text-text text-left flex-1 text-xs">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Socratic Invariant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Failure Invariant
              </span>
              <h4 className="font-bold text-sm text-text">The Thundering Herd</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                When hot cache keys expire under heavy concurrency, N simultaneous cache misses trigger N duplicate database queries. This abruptly saturates database connection pools, causing cascading 503/504 outages across downstream services.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Pessimistic Invariant
              </span>
              <h4 className="font-bold text-sm text-text">The Latency Cost of Mutexes</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Singleflight distributed locks protect the database by permitting only one worker to query, but force all other requests to stall. This spikes tail p99 latency and introduces fatal deadlock vulnerabilities if the lock owner crashes.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Mathematical Invariant
              </span>
              <h4 className="font-bold text-sm text-text">Exponential Deviation Invariant</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                By drawing a uniform deviate u ∼ U(0,1), the term -βδ ln(u) follows an exponential distribution. The condition -βδ ln(u) &gt; TTL_remaining guarantees that probability smoothly approaches 1.0 as expiration nears.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent-700">
                Concurrency Invariant
              </span>
              <h4 className="font-bold text-sm text-text">Concurrency-Adaptive Refresh</h4>
              <p className="text-xs text-text-muted leading-relaxed">
                Under high read rates λ_r, the probability of at least one request refreshing early is 1 - exp(-λ_r β δ). Cold keys are never refreshed, while scorching hot keys are refreshed smoothly before any client can ever observe a cache miss!
              </p>
            </div>
          </div>
        </div>
      )}
      {/* SUB-TAB 7: B-TREE STORAGE ENGINE CONCURRENCY: LOCK CRABBING VS OPTIMISTIC LOCK COUPLING (OLC) */}
      {activeSubTab === 'BTREE_LOCK_CRABBING' && (
        <div className="p-6 space-y-6">
          {/* Header & Strategy Selector */}
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Storage Engine Concurrency &amp; Index Synchronization
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-primary-200 bg-primary-50 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300">
                  SIGMOD 2016
                </span>
              </div>
              <h3 className="font-bold text-base text-text">
                B-Tree Storage Engine Concurrency: Pessimistic Lock Crabbing vs Optimistic Lock Coupling (OLC)
              </h3>
              <p className="text-xs text-text-muted max-w-3xl leading-relaxed">
                Contrast traditional Pessimistic Lock Crabbing (Bayer &amp; Schkolnick 1977), where root and internal node locks bottleneck multi-core read concurrency, against state-of-the-art Optimistic Lock Coupling (Leis et al., SIGMOD 2016), which uses 64-bit atomic version counters to achieve 100% lock-free reader traversal and linear multicore scalability.
              </p>
            </div>

            {/* Strategy Pill Switcher */}
            <div className="bg-surface border border-border p-2.5 rounded-lg flex flex-col gap-1.5 min-w-[280px]">
              <span className="text-[11px] font-bold text-text uppercase tracking-wider">
                Concurrency Protocol:
              </span>
              <div className="grid grid-cols-2 gap-1 bg-canvas p-1 rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setBTreeStrategy('PESSIMISTIC_CRABBING');
                    handleBTreeReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    bTreeStrategy === 'PESSIMISTIC_CRABBING'
                      ? 'bg-sky-700 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Pessimistic Crabbing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBTreeStrategy('OPTIMISTIC_LOCK_COUPLING');
                    handleBTreeReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    bTreeStrategy === 'OPTIMISTIC_LOCK_COUPLING'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Optimistic Coupling (OLC)
                </button>
              </div>
            </div>
          </div>

          {/* Root Contention Alert (if triggered) */}
          {bTreeRootContentionAlert && (
            <div className="p-3.5 rounded-xl bg-rose-100 border border-rose-300 text-rose-950 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-200 text-xs space-y-1 animate-pulse">
              <span className="font-bold text-sm block">⚠️ CRITICAL ROOT LOCK CONTENTION COLLAPSE</span>
              <p>{bTreeRootContentionAlert}</p>
            </div>
          )}

          {/* Interactive Operational Controls */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              Interactive Concurrency Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              <Button
                onClick={handleBTreeRunReaderTraversal}
                variant="primary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                1. Run Clean Read (Key 40)
              </Button>
              <Button
                onClick={handleBTreeRunWriterMutation}
                variant="accent"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                2. Run Writer Mutation (Insert 45)
              </Button>
              <Button
                onClick={handleBTreeSimulateSplitContention}
                variant={bTreeStrategy === 'PESSIMISTIC_CRABBING' ? 'destructive' : 'primary'}
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                3. Simulate Node Split Hazard
              </Button>
              <Button
                onClick={handleBTreeSimulateReaderCollision}
                variant="secondary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                4. Simulate OLC Collision &amp; Restart
              </Button>
              <Button
                onClick={handleBTreeReset}
                variant="secondary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                ↺ Reset B-Tree
              </Button>
            </div>
          </div>

          {/* 3-Level B+ Tree Visualization Canvas */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h4 className="font-bold text-sm text-text">B+ Tree Hierarchical Index Topology</h4>
                <span className="text-xs text-text-muted">
                  Order M = 4 (Max 3 keys per node). Green = Unlocked/Even Version, Blue = Shared Lock, Red = Exclusive Lock / Odd Version.
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-text-muted">Active Protocol:</span>
                <span className={`px-2 py-0.5 rounded font-bold border ${
                  bTreeStrategy === 'OPTIMISTIC_LOCK_COUPLING'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-sky-100 text-sky-900 border-sky-300'
                }`}>
                  {bTreeStrategy === 'OPTIMISTIC_LOCK_COUPLING' ? 'OPTIMISTIC LOCK COUPLING (OLC)' : 'PESSIMISTIC LOCK CRABBING'}
                </span>
              </div>
            </div>

            {/* Level 1: ROOT */}
            <div className="flex justify-center">
              <div
                className={`w-64 p-3.5 rounded-xl border-2 transition-all space-y-2 ${
                  bTreeNodes.root.lockState === 'X_LOCKED'
                    ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/30 ring-2 ring-rose-500/50'
                    : bTreeNodes.root.lockState === 'S_LOCKED'
                    ? 'border-sky-500 bg-sky-50/30 dark:bg-sky-950/30'
                    : 'border-border bg-canvas'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text">ROOT NODE</span>
                  <span className="font-mono text-[11px] text-text-muted">ID: root</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {bTreeNodes.root.keys.map((k) => (
                    <span key={k} className="px-3 py-1 rounded bg-surface border border-border font-mono font-bold text-sm text-text">
                      {k}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono border-t border-border pt-1.5">
                  <span className="text-text-muted">
                    {bTreeStrategy === 'PESSIMISTIC_CRABBING' ? 'Lock:' : 'Version (v):'}
                  </span>
                  <span className={`font-bold ${
                    bTreeNodes.root.lockState === 'X_LOCKED'
                      ? 'text-rose-600'
                      : bTreeNodes.root.lockState === 'S_LOCKED'
                      ? 'text-sky-600'
                      : 'text-emerald-600'
                  }`}>
                    {bTreeStrategy === 'PESSIMISTIC_CRABBING'
                      ? bTreeNodes.root.lockState
                      : `v: ${bTreeNodes.root.version} (Lock: ${bTreeNodes.root.version % 2 === 1 ? '1 LOCKED' : '0 FREE'})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Arrows Level 1 -> Level 2 */}
            <div className="text-center font-mono text-xs text-text-muted">
              ↓ Child Pointer Branching (Keys &lt; 50 → I1, Keys &ge; 50 → I2) ↓
            </div>

            {/* Level 2: INTERNAL NODES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {['int-1', 'int-2'].map((nodeId) => {
                const node = bTreeNodes[nodeId];
                return (
                  <div
                    key={nodeId}
                    className={`p-3.5 rounded-xl border-2 transition-all space-y-2 ${
                      node.lockState === 'X_LOCKED'
                        ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/30'
                        : node.lockState === 'S_LOCKED'
                        ? 'border-sky-500 bg-sky-50/30 dark:bg-sky-950/30'
                        : 'border-border bg-canvas'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text">{node.name}</span>
                      <span className="font-mono text-[11px] text-text-muted">Level: Internal</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      {node.keys.map((k) => (
                        <span key={k} className="px-2.5 py-0.5 rounded bg-surface border border-border font-mono font-bold text-xs text-text">
                          {k}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono border-t border-border pt-1.5">
                      <span className="text-text-muted">
                        {bTreeStrategy === 'PESSIMISTIC_CRABBING' ? 'Lock:' : 'Version:'}
                      </span>
                      <span className={`font-bold ${
                        node.lockState === 'X_LOCKED' ? 'text-rose-600' : node.lockState === 'S_LOCKED' ? 'text-sky-600' : 'text-emerald-600'
                      }`}>
                        {bTreeStrategy === 'PESSIMISTIC_CRABBING'
                          ? node.lockState
                          : `v: ${node.version} (Lock: ${node.version % 2 === 1 ? '1' : '0'})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Connection Arrows Level 2 -> Level 3 */}
            <div className="text-center font-mono text-xs text-text-muted">
              ↓ Leaf Sibling Chain (Continuous Ordered Doubly-Linked Sequence) ↓
            </div>

            {/* Level 3: LEAF NODES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {['leaf-1', 'leaf-2', 'leaf-3', 'leaf-4'].map((nodeId) => {
                const node = bTreeNodes[nodeId];
                return (
                  <div
                    key={nodeId}
                    className={`p-3.5 rounded-xl border-2 transition-all space-y-2 ${
                      node.lockState === 'X_LOCKED'
                        ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/30'
                        : node.lockState === 'S_LOCKED'
                        ? 'border-sky-500 bg-sky-50/30 dark:bg-sky-950/30'
                        : node.keys.length >= node.capacity
                        ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20'
                        : 'border-border bg-canvas'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text">{node.name}</span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {node.keys.length}/{node.capacity} keys
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-1">
                      {node.keys.map((k) => (
                        <span
                          key={k}
                          className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${
                            k === 40
                              ? 'bg-primary-100 text-primary-900 border-primary-300 dark:bg-primary-950/60 dark:text-primary-300'
                              : k === 45 || k === 48
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-surface text-text border-border'
                          }`}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono border-t border-border pt-1.5">
                      <span className="text-text-muted">
                        {bTreeStrategy === 'PESSIMISTIC_CRABBING' ? 'Lock:' : 'Version:'}
                      </span>
                      <span className={`font-bold ${
                        node.lockState === 'X_LOCKED' ? 'text-rose-600' : node.lockState === 'S_LOCKED' ? 'text-sky-600' : 'text-emerald-600'
                      }`}>
                        {bTreeStrategy === 'PESSIMISTIC_CRABBING'
                          ? node.lockState
                          : `v: ${node.version} (Lock: ${node.version % 2 === 1 ? '1' : '0'})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thread Activity Monitor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Reader Thread Card */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <h5 className="font-bold text-xs text-text">{bTreeThreadReader.name}</h5>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    bTreeThreadReader.status === 'COMMITTED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : bTreeThreadReader.status === 'BLOCKED_LOCK'
                      ? 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse'
                      : bTreeThreadReader.status === 'RESTARTED_COLLISION'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-canvas text-text-muted border-border'
                  }`}
                >
                  {bTreeThreadReader.status}
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {bTreeThreadReader.statusMessage}
              </p>
            </div>

            {/* Writer Thread Card */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h5 className="font-bold text-xs text-text">{bTreeThreadWriter.name}</h5>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    bTreeThreadWriter.status === 'COMMITTED'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-canvas text-text-muted border-border'
                  }`}
                >
                  {bTreeThreadWriter.status}
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {bTreeThreadWriter.statusMessage}
              </p>
            </div>
          </div>

          {/* Multi-Core Scaling Benchmark Matrix */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-text">
                Multi-Core Scaling &amp; Cache Line Invalidation Benchmark (32 Threads)
              </h4>
              <span className="text-xs font-mono text-text-muted">Throughput (k ops/sec)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-canvas text-text font-bold">
                    <th className="p-2">CPU Cores</th>
                    <th className="p-2">Pessimistic Lock Crabbing (ops/sec)</th>
                    <th className="p-2">Optimistic Lock Coupling OLC (ops/sec)</th>
                    <th className="p-2">Throughput Speedup Gain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  <tr>
                    <td className="p-2 font-bold text-text">1 Core</td>
                    <td className="p-2">45,000 ops/s</td>
                    <td className="p-2 text-emerald-600 font-bold">58,000 ops/s</td>
                    <td className="p-2 text-text-muted">1.29× (Lock-free fast-path)</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-text">4 Cores</td>
                    <td className="p-2">120,000 ops/s</td>
                    <td className="p-2 text-emerald-600 font-bold">230,000 ops/s</td>
                    <td className="p-2 text-emerald-600 font-bold">1.92×</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-text">8 Cores</td>
                    <td className="p-2">140,000 ops/s</td>
                    <td className="p-2 text-emerald-600 font-bold">460,000 ops/s</td>
                    <td className="p-2 text-emerald-600 font-bold">3.28×</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-text">16 Cores</td>
                    <td className="p-2 text-rose-600 font-semibold">145,000 ops/s (Root Contention)</td>
                    <td className="p-2 text-emerald-600 font-bold">915,000 ops/s</td>
                    <td className="p-2 text-emerald-600 font-bold">6.31×</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold text-text">32 Cores</td>
                    <td className="p-2 text-rose-600 font-bold">130,000 ops/s (Scaling Collapse)</td>
                    <td className="p-2 text-emerald-600 font-bold">1,820,000 ops/s (Linear Scaling)</td>
                    <td className="p-2 text-emerald-600 font-bold">14.0× Multi-Core Advantage</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-Time Concurrency Audit Log */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text uppercase tracking-wider">
                B-Tree Synchronization Audit Log:
              </span>
              <span className="text-text-muted font-mono text-[11px]">
                {bTreeAuditLog.length} Events
              </span>
            </div>
            <div className="space-y-2">
              {bTreeAuditLog.map((ev) => (
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
                1. Lock Crabbing Invariant
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Pessimistic lock coupling (Bayer &amp; Schkolnick 1977) holds a lock on the parent until the child lock is acquired. While safe, every reader must write to memory to acquire locks, dirtying shared CPU cache lines.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. The Root Bottleneck
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Every B-Tree query traverses the Root node. In lock crabbing, if an insertion causes a node split, the writer must hold an Exclusive X-lock on the Root, halting all concurrent readers across all CPU cores.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. Atomic 64-Bit Version Counter
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Optimistic Lock Coupling (Leis SIGMOD 2016) assigns each node a 64-bit atomic integer. The lowest bit indicates lock state (1 = locked, 0 = free), while the upper 63 bits track node modification epochs.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. Zero-Lock Reader Traversal
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Readers in OLC execute zero atomic writes: they read node pointers, re-verify that the version counter has not changed, and complete. If a writer mutates a node concurrently, readers safely restart from the Root.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* SUB-TAB 8: MVCC & SNAPSHOT ISOLATION */}
      {activeSubTab === 'MVCC_SNAPSHOT_ISOLATION' && (
        <div className="p-6 space-y-6">
          {/* Header & Isolation Mode Selector */}
          <div className="bg-canvas border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                  Database Concurrency &amp; Multi-Version Storage
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-primary-200 bg-primary-50 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300">
                  Berenson 1995 / Cahill 2008 Invariant
                </span>
              </div>
              <h3 className="font-bold text-base text-text">
                MVCC Tuple Visibility, Snapshot Isolation &amp; Write Skew Anomalies
              </h3>
              <p className="text-xs text-text-muted max-w-3xl leading-relaxed">
                Explore how relational database engines implement multi-version concurrency control without read locks. Compare standard Snapshot Isolation (SI) &mdash; which exhibits the catastrophic <strong>Write Skew (G_skew)</strong> anomaly on predicate constraints &mdash; against Serializable Snapshot Isolation (SSI), which tracks read-write antidependencies in real time.
              </p>
            </div>

            {/* Isolation Selector */}
            <div className="bg-surface border border-border p-2.5 rounded-lg flex flex-col gap-1.5 min-w-[300px]">
              <span className="text-[11px] font-bold text-text uppercase tracking-wider">
                Concurrency Isolation Level:
              </span>
              <div className="grid grid-cols-2 gap-1 bg-canvas p-1 rounded-md border border-border">
                <button
                  type="button"
                  onClick={() => {
                    setMvccIsolation('SNAPSHOT_ISOLATION');
                    handleMvccReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    mvccIsolation === 'SNAPSHOT_ISOLATION'
                      ? 'bg-primary-700 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Snapshot Isolation (SI)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMvccIsolation('SERIALIZABLE_SNAPSHOT_ISOLATION');
                    handleMvccReset();
                  }}
                  className={`px-2 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    mvccIsolation === 'SERIALIZABLE_SNAPSHOT_ISOLATION'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  Serializable SSI
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Operations Bar */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text block">
              The Classic On-Call Hospital Doctors Scenario (Invariant: active_doctors &gt;= 1):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <Button
                onClick={handleMvccStep1ConcurrentReads}
                variant="primary"
                disabled={mvccStep !== 0}
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                1. T1 &amp; T2 Snapshot &amp; Read Count
              </Button>
              <Button
                onClick={handleMvccStep2T1Commit}
                variant="primary"
                disabled={mvccStep !== 1}
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                2. T1 Off-Call Alice &amp; Commit
              </Button>
              <Button
                onClick={handleMvccStep3T2Commit}
                variant={mvccIsolation === 'SNAPSHOT_ISOLATION' ? 'destructive' : 'accent'}
                disabled={mvccStep !== 2}
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                3. T2 Off-Call Bob &amp; Attempt Commit
              </Button>
              <Button
                onClick={handleMvccReset}
                variant="secondary"
                className="text-xs px-2.5 py-2 cursor-pointer w-full text-center"
              >
                ↺ Reset MVCC Lab
              </Button>
            </div>
          </div>

          {/* Critical Alerts Banner */}
          {mvccWriteSkewAlert && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-950 dark:bg-rose-950/40 dark:border-rose-400 dark:text-rose-100 flex items-start gap-3 animate-pulse">
              <span className="text-xl">⚠️</span>
              <div className="space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider text-rose-800 dark:text-rose-300 block">
                  Catastrophic Concurrency Anomaly: Write Skew (G_skew)
                </span>
                <p className="text-xs font-mono leading-relaxed">{mvccWriteSkewAlert}</p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300">
                  Notice that First-Committer-Wins (FCW) only checks for collisions on identical tuples. Because T1 mutated Alice and T2 mutated Bob, FCW allowed both to commit.
                </p>
              </div>
            </div>
          )}

          {mvccStep === 3 && mvccIsolation === 'SERIALIZABLE_SNAPSHOT_ISOLATION' && mvccT2.status === 'ABORTED_SSI_CYCLE' && (
            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-400 dark:text-emerald-100 flex items-start gap-3">
              <span className="text-xl">🛡️</span>
              <div className="space-y-1">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                  SSI Serializability Safety Verified: Cycle Blocked
                </span>
                <p className="text-xs font-mono leading-relaxed">
                  Cahill SSI tracked rw-antidependencies (T1 &rarr; T2 &rarr; T1) and aborted T2 with SQLSTATE 40001 serialization_failure before commit!
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Dr. Bob was denied leave. 1 doctor remains on call at all times. Serializable consistency preserved with 0 lock contention.
                </p>
              </div>
            </div>
          )}

          {/* Main Grid: Tuple Versions Table + Concurrent Transactions Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Tuple Versions Storage Table (Heap / Page representation) */}
            <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div>
                  <h4 className="font-bold text-sm text-text">MVCC Physical Tuple Heap &amp; Version Chain</h4>
                  <span className="text-xs text-text-muted">
                    Tuples are never mutated in place. Updates insert a new tuple version and set xmax.
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-canvas">
                  Table: doctors
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-border bg-canvas text-text font-bold">
                      <th className="p-2">Tuple Version</th>
                      <th className="p-2">Doctor Name</th>
                      <th className="p-2">on_call</th>
                      <th className="p-2">xmin</th>
                      <th className="p-2">xmax</th>
                      <th className="p-2">Tuple Status</th>
                      <th className="p-2">T1 Vis</th>
                      <th className="p-2">T2 Vis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mvccTuples.map((tuple) => {
                      const isAlive = tuple.xmax === 0;
                      // T1 snapshot: 100:100:[]
                      const t1CanSee = tuple.xmin < 100 && (tuple.xmax === 0 || tuple.xmax >= 100);
                      // T2 snapshot: 100:100:[101]
                      const t2CanSee = tuple.xmin < 100 && (tuple.xmax === 0 || tuple.xmax >= 100 || tuple.xmax === 101);

                      return (
                        <tr
                          key={tuple.versionId}
                          className={`transition-colors ${
                            isAlive
                              ? tuple.onCall
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                                : 'bg-slate-50/50 dark:bg-zinc-800/30'
                              : 'opacity-60 bg-rose-50/20 dark:bg-rose-950/10'
                          }`}
                        >
                          <td className="p-2 font-bold text-text">{tuple.versionId}</td>
                          <td className="p-2 font-semibold text-text">{tuple.doctorName}</td>
                          <td className="p-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                tuple.onCall
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                              }`}
                            >
                              {tuple.onCall ? 'TRUE (ON CALL)' : 'FALSE (OFF)'}
                            </span>
                          </td>
                          <td className="p-2 text-primary-700 dark:text-primary-400">{tuple.xmin}</td>
                          <td className="p-2 text-rose-600">{tuple.xmax === 0 ? '0 (live)' : tuple.xmax}</td>
                          <td className="p-2">
                            {isAlive ? (
                              <span className="text-emerald-600 font-bold">CURRENT LIVE</span>
                            ) : (
                              <span className="text-text-muted italic">EXPIRED (xmax={tuple.xmax})</span>
                            )}
                          </td>
                          <td className="p-2 font-bold">{t1CanSee ? '👁️ YES' : '❌ NO'}</td>
                          <td className="p-2 font-bold">{t2CanSee ? '👁️ YES' : '❌ NO'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Current Live Count Summary */}
              <div className="p-2.5 rounded-lg bg-canvas border border-border flex items-center justify-between text-xs font-mono">
                <span className="text-text-muted">Current Live Doctors On-Call (xmax = 0 &amp; on_call = true):</span>
                <span className={`font-bold px-2 py-0.5 rounded ${
                  mvccTuples.filter((t) => t.xmax === 0 && t.onCall).length >= 1
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-400 animate-pulse'
                }`}>
                  {mvccTuples.filter((t) => t.xmax === 0 && t.onCall).length} Active Doctor(s)
                </span>
              </div>
            </div>

            {/* Concurrent Transactions Inspector */}
            <div className="lg:col-span-5 space-y-4">
              {/* Transaction 1 Card */}
              <div className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                mvccT1.status === 'COMMITTED'
                  ? 'bg-emerald-50/30 border-emerald-400 dark:bg-emerald-950/20'
                  : 'bg-surface border-border'
              }`}>
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-primary-100 text-primary-900 dark:bg-primary-950/60 dark:text-primary-300 px-2 py-0.5 rounded">
                      txid {mvccT1.txId}
                    </span>
                    <span className="font-bold text-xs text-text">{mvccT1.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">
                    Snapshot: {mvccT1.snapshotDescriptor}
                  </span>
                </div>
                <div className="text-xs space-y-1 font-mono">
                  <div className="text-text-muted">
                    Observed On-Call: <strong className="text-text">{mvccT1.observedOnCallCount !== null ? mvccT1.observedOnCallCount : 'Pending read'}</strong>
                  </div>
                  <div className="text-text-muted">
                    Query: <code className="text-text">UPDATE doctors SET on_call=false WHERE name=&apos;Alice&apos;;</code>
                  </div>
                  <div className="text-text-muted">
                    Status: <strong className={mvccT1.status === 'COMMITTED' ? 'text-emerald-600' : 'text-primary-600'}>{mvccT1.status}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed bg-canvas p-2 rounded border border-border">
                  {mvccT1.statusMessage}
                </p>
              </div>

              {/* Transaction 2 Card */}
              <div className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                mvccT2.status === 'ABORTED_SSI_CYCLE'
                  ? 'bg-amber-50/40 border-amber-400 dark:bg-amber-950/20'
                  : mvccT2.status === 'COMMITTED'
                  ? 'bg-rose-50/40 border-rose-400 dark:bg-rose-950/20'
                  : 'bg-surface border-border'
              }`}>
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded">
                      txid {mvccT2.txId}
                    </span>
                    <span className="font-bold text-xs text-text">{mvccT2.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted">
                    Snapshot: {mvccT2.snapshotDescriptor}
                  </span>
                </div>
                <div className="text-xs space-y-1 font-mono">
                  <div className="text-text-muted">
                    Observed On-Call: <strong className="text-text">{mvccT2.observedOnCallCount !== null ? mvccT2.observedOnCallCount : 'Pending read'}</strong>
                  </div>
                  <div className="text-text-muted">
                    Query: <code className="text-text">UPDATE doctors SET on_call=false WHERE name=&apos;Bob&apos;;</code>
                  </div>
                  <div className="text-text-muted">
                    Status: <strong className={
                      mvccT2.status === 'ABORTED_SSI_CYCLE'
                        ? 'text-amber-600'
                        : mvccT2.status === 'COMMITTED'
                        ? 'text-rose-600'
                        : 'text-primary-600'
                    }>{mvccT2.status}</strong>
                  </div>
                </div>
                <p className="text-[11px] text-text-muted leading-relaxed bg-canvas p-2 rounded border border-border">
                  {mvccT2.statusMessage}
                </p>
              </div>

              {/* Serialization Graph rw-Antidependency Visualization */}
              <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-text">
                  <span>Serialization Graph Dependency Tracker (SSN / SIREAD):</span>
                  <span className="font-mono text-[10px] text-text-muted">Cahill SIGMOD 2008</span>
                </div>
                <div className="p-2.5 rounded bg-surface border border-border text-[11px] font-mono space-y-1 text-text-muted">
                  <div>1. T2 read Alice-v1 &rarr; T1 supersedes Alice-v1 &rArr; <strong className="text-text">T2 &rarr;rw T1</strong></div>
                  <div>2. T1 read Bob-v1 &rarr; T2 supersedes Bob-v1 &rArr; <strong className="text-text">T1 &rarr;rw T2</strong></div>
                  <div className="pt-1 border-t border-border flex items-center justify-between">
                    <span>Cycle Detection:</span>
                    <span className={`font-bold ${mvccStep >= 2 ? 'text-amber-600' : 'text-text-muted'}`}>
                      {mvccStep >= 2 ? 'DANGEROUS STRUCTURE: T1 ↔rw T2 (CYCLE)' : 'No conflict yet'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Audit Log */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-sm text-text">
              Real-Time MVCC &amp; Concurrency Engine Audit Stream
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs">
              {mvccAuditLog.map((log) => (
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
                  <span className="text-[10px] text-text-muted">{log.isolation}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Socratic Invariant Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                1. Berenson 1995 Critique
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                ANSI SQL-92 defined isolation via Dirty Reads, Non-repeatable Reads, and Phantoms. Berenson et al. proved that Snapshot Isolation prevents all three yet fails Serializability due to Write Skew (G_skew).
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                2. Non-Blocking MVCC Tuple Visibility
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Each tuple version stores $xmin$ (creator tx) and $xmax$ (destroyer tx). Readers compare these IDs against their active snapshot array: readers never acquire shared locks, and writers never block readers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                3. First-Committer-Wins Flaw
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Standard SI only checks for write-write conflicts on identical rows. When concurrent transactions update disjoint rows constrained by a shared predicate, both commit cleanly, violating application invariants.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas border border-border space-y-1">
              <span className="text-xs font-bold text-text block">
                4. Serializable SSI (Cahill 2008)
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Serializable Snapshot Isolation tracks rw-antidependency edges in real time. When two consecutive rw-edges form a potential cycle (T1 &rarr; T2 &rarr; T1), SSI aborts the dangerous transaction with SQLSTATE 40001.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}