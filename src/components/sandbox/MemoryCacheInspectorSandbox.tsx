'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

export type InspectorMode = 'STACK_HEAP' | 'CACHE_LINE' | 'HASH_TABLE';

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

  const hashState = computeHashTable();

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
    </div>
  );
}
