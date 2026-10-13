/**
 * Asynchronous Event Loop & Concurrency Models Simulation Engine
 *
 * Provides pure mathematical & stateful models for:
 * 1. Node.js (libuv / V8): Microtasks (process.nextTick > Promises) & Phase-based Macrotasks (Timers, Poll, Check)
 * 2. Go Runtime (GMP): Goroutines, Logical Processors (P), OS Threads (M), Runqueues & Work-Stealing
 * 3. Python (asyncio): Cooperative Event Loop, Coroutine Tasks & Yield Points
 *
 * Strictly textbook-grade, deterministic, and 100% signal.
 */

export type ConcurrencyModelType = 'nodejs' | 'go_gmp' | 'python_asyncio';

export interface TaskItem {
  id: string;
  name: string;
  type: 'sync' | 'nextTick' | 'microtask' | 'timer' | 'io_poll' | 'check_immediate' | 'goroutine' | 'coroutine';
  sourceCode: string;
  durationMs: number;
  priority: number;
}

export interface NodejsLoopState {
  currentPhase: 'callstack' | 'nextTick' | 'microtasks' | 'timers' | 'poll' | 'check' | 'idle';
  callStack: TaskItem[];
  nextTickQueue: TaskItem[];
  microtaskQueue: TaskItem[];
  timersQueue: TaskItem[];
  pollQueue: TaskItem[];
  checkQueue: TaskItem[];
  executionLog: string[];
  isStarving: boolean;
  starvationReason?: string;
}

export interface GoProcessorState {
  id: number;
  activeGoroutine: TaskItem | null;
  localRunQueue: TaskItem[];
}

export interface GoGmpState {
  processors: [GoProcessorState, GoProcessorState]; // P0, P1
  globalRunQueue: TaskItem[];
  networkPoller: TaskItem[];
  executionLog: string[];
  lastStolenFromP?: number;
}

export interface PythonAsyncioState {
  activeCoroutine: TaskItem | null;
  readyQueue: TaskItem[];
  sleepingFutures: Array<{ task: TaskItem; resumeTick: number }>;
  currentTick: number;
  executionLog: string[];
}

export interface SimulatorPreset {
  id: string;
  name: string;
  model: ConcurrencyModelType;
  description: string;
  codeSnippet: string;
}

export const SIMULATOR_PRESETS: SimulatorPreset[] = [
  {
    id: 'node-microtask-priority',
    name: 'Node.js: nextTick vs Promise vs setImmediate',
    model: 'nodejs',
    description: 'Demonstrates why process.nextTick drains completely before Promise microtasks, and why microtasks drain before any macrotask phase.',
    codeSnippet: `console.log('1. Synchronous script start');

setTimeout(() => {
  console.log('6. setTimeout (Timers Phase)');
}, 0);

setImmediate(() => {
  console.log('7. setImmediate (Check Phase)');
});

Promise.resolve().then(() => {
  console.log('4. Promise.then (Microtask Queue)');
});

process.nextTick(() => {
  console.log('2. process.nextTick (Tick Queue)');
  process.nextTick(() => {
    console.log('3. Nested nextTick (Drained First!)');
  });
});

Promise.resolve().then(() => {
  console.log('5. Secondary Promise microtask');
});`,
  },
  {
    id: 'node-starvation-hazard',
    name: 'Node.js: NextTick Recursive Starvation',
    model: 'nodejs',
    description: 'Recursively enqueuing process.nextTick starves the event loop, completely blocking timers and I/O polling indefinitely.',
    codeSnippet: `function recursiveTick(depth) {
  if (depth >= 4) return;
  process.nextTick(() => {
    console.log(\`nextTick depth: \${depth}\`);
    recursiveTick(depth + 1);
  });
}

setTimeout(() => {
  console.log('STARVED: This timer will never fire while nextTick drains!');
}, 0);

recursiveTick(1);`,
  },
  {
    id: 'go-work-stealing',
    name: 'Go Runtime: GMP Work-Stealing Across P0 & P1',
    model: 'go_gmp',
    description: 'When P0 finishes its local runqueue, it steals half of P1\'s runqueue to maintain 100% multi-core CPU utilization.',
    codeSnippet: `func main() {
    // P0 has 0 goroutines, P1 has 4 goroutines in local queue
    // P0 checks local queue (empty) -> checks global queue -> steals half of P1
    for i := 0; i < 4; i++ {
        go worker(i) // Enqueued to local P1
    }
    // Runtime scheduler triggers work-stealing algorithm
}`,
  },
  {
    id: 'python-asyncio-interleaving',
    name: 'Python asyncio: Cooperative Task Interleaving',
    model: 'python_asyncio',
    description: 'Coroutines yield control back to the event loop via await asyncio.sleep(0), interleaving execution on a single thread.',
    codeSnippet: `async def worker_a():
    print("Worker A: Step 1")
    await asyncio.sleep(0) # Cooperative yield
    print("Worker A: Step 2")

async def worker_b():
    print("Worker B: Step 1")
    await asyncio.sleep(0) # Cooperative yield
    print("Worker B: Step 2")

asyncio.gather(worker_a(), worker_b())`,
  },
];

export function createInitialNodejsState(presetId: string): NodejsLoopState {
  if (presetId === 'node-starvation-hazard') {
    return {
      currentPhase: 'callstack',
      callStack: [
        { id: 'sync-1', name: 'main() bootstrap', type: 'sync', sourceCode: 'recursiveTick(1)', durationMs: 1, priority: 0 },
      ],
      nextTickQueue: [
        { id: 'nt-1', name: 'nextTick (depth 1)', type: 'nextTick', sourceCode: 'recursiveTick(1)', durationMs: 1, priority: 1 },
        { id: 'nt-2', name: 'nextTick (depth 2)', type: 'nextTick', sourceCode: 'recursiveTick(2)', durationMs: 1, priority: 1 },
        { id: 'nt-3', name: 'nextTick (depth 3)', type: 'nextTick', sourceCode: 'recursiveTick(3)', durationMs: 1, priority: 1 },
      ],
      microtaskQueue: [],
      timersQueue: [
        { id: 't-1', name: 'setTimeout(0) [Starved]', type: 'timer', sourceCode: "console.log('timer fired')", durationMs: 2, priority: 3 },
      ],
      pollQueue: [],
      checkQueue: [],
      executionLog: ['Bootstrap main execution initiated'],
      isStarving: true,
      starvationReason: 'Recursive process.nextTick chain starves timers and I/O polling',
    };
  }

  // Default: node-microtask-priority
  return {
    currentPhase: 'callstack',
    callStack: [
      { id: 'sync-1', name: 'main() script', type: 'sync', sourceCode: "console.log('1. Synchronous script start')", durationMs: 1, priority: 0 },
    ],
    nextTickQueue: [
      { id: 'nt-1', name: 'process.nextTick (1)', type: 'nextTick', sourceCode: "console.log('2. process.nextTick')", durationMs: 1, priority: 1 },
      { id: 'nt-2', name: 'process.nextTick (nested)', type: 'nextTick', sourceCode: "console.log('3. Nested nextTick')", durationMs: 1, priority: 1 },
    ],
    microtaskQueue: [
      { id: 'mt-1', name: 'Promise.then (Alpha)', type: 'microtask', sourceCode: "console.log('4. Promise.then')", durationMs: 1, priority: 2 },
      { id: 'mt-2', name: 'Promise.then (Beta)', type: 'microtask', sourceCode: "console.log('5. Secondary Promise')", durationMs: 1, priority: 2 },
    ],
    timersQueue: [
      { id: 't-1', name: 'setTimeout(0) callback', type: 'timer', sourceCode: "console.log('6. setTimeout')", durationMs: 1, priority: 3 },
    ],
    pollQueue: [],
    checkQueue: [
      { id: 'c-1', name: 'setImmediate callback', type: 'check_immediate', sourceCode: "console.log('7. setImmediate')", durationMs: 1, priority: 4 },
    ],
    executionLog: ['Script started -> Synchronous frame on Call Stack'],
    isStarving: false,
  };
}

export function createInitialGoGmpState(): GoGmpState {
  return {
    processors: [
      {
        id: 0,
        activeGoroutine: null,
        localRunQueue: [], // P0 is empty -> triggers work-stealing!
      },
      {
        id: 1,
        activeGoroutine: { id: 'g-1', name: 'G1: worker(0)', type: 'goroutine', sourceCode: 'doWork(0)', durationMs: 2, priority: 0 },
        localRunQueue: [
          { id: 'g-2', name: 'G2: worker(1)', type: 'goroutine', sourceCode: 'doWork(1)', durationMs: 2, priority: 0 },
          { id: 'g-3', name: 'G3: worker(2)', type: 'goroutine', sourceCode: 'doWork(2)', durationMs: 2, priority: 0 },
          { id: 'g-4', name: 'G4: worker(3)', type: 'goroutine', sourceCode: 'doWork(3)', durationMs: 2, priority: 0 },
        ],
      },
    ],
    globalRunQueue: [
      { id: 'g-sys', name: 'G_sys: runtime.scavenger', type: 'goroutine', sourceCode: 'scavenge()', durationMs: 1, priority: 5 },
    ],
    networkPoller: [],
    executionLog: ['P0 has 0 goroutines. P1 running G1 with 3 goroutines in local queue.'],
  };
}

export function createInitialPythonAsyncioState(): PythonAsyncioState {
  return {
    activeCoroutine: {
      id: 'co-a',
      name: 'Task A (worker_a)',
      type: 'coroutine',
      sourceCode: 'print("Worker A: Step 1"); await asyncio.sleep(0)',
      durationMs: 1,
      priority: 0,
    },
    readyQueue: [
      {
        id: 'co-b',
        name: 'Task B (worker_b)',
        type: 'coroutine',
        sourceCode: 'print("Worker B: Step 1"); await asyncio.sleep(0)',
        durationMs: 1,
        priority: 0,
      },
    ],
    sleepingFutures: [],
    currentTick: 0,
    executionLog: ['Event loop started. Task A scheduled as active coroutine.'],
  };
}

/**
 * Steps Node.js Event Loop by 1 discrete atomic action
 */
export function stepNodejsLoop(state: NodejsLoopState): NodejsLoopState {
  const next = { ...state, executionLog: [...state.executionLog] };

  // 1. Drain Call Stack first (synchronous execution)
  if (next.callStack.length > 0) {
    const executed = next.callStack.shift()!;
    next.currentPhase = 'callstack';
    next.executionLog.unshift(`[CallStack] Executed synchronous: ${executed.name}`);
    return next;
  }

  // 2. Priority Queue: process.nextTick Queue drains completely
  if (next.nextTickQueue.length > 0) {
    const executed = next.nextTickQueue.shift()!;
    next.currentPhase = 'nextTick';
    next.executionLog.unshift(`[NextTickQueue] Drained process.nextTick: ${executed.name}`);
    return next;
  }

  // 3. Microtask Queue: Promise reactions drain completely before any macrotasks
  if (next.microtaskQueue.length > 0) {
    const executed = next.microtaskQueue.shift()!;
    next.currentPhase = 'microtasks';
    next.executionLog.unshift(`[Microtasks] Executed Promise microtask: ${executed.name}`);
    return next;
  }

  // 4. Timers Phase: expired setTimeout callbacks
  if (next.timersQueue.length > 0) {
    const executed = next.timersQueue.shift()!;
    next.currentPhase = 'timers';
    next.executionLog.unshift(`[Timers Phase] Executed timer: ${executed.name}`);
    return next;
  }

  // 5. Poll Phase: I/O callbacks
  if (next.pollQueue.length > 0) {
    const executed = next.pollQueue.shift()!;
    next.currentPhase = 'poll';
    next.executionLog.unshift(`[Poll Phase] Executed I/O callback: ${executed.name}`);
    return next;
  }

  // 6. Check Phase: setImmediate callbacks
  if (next.checkQueue.length > 0) {
    const executed = next.checkQueue.shift()!;
    next.currentPhase = 'check';
    next.executionLog.unshift(`[Check Phase] Executed setImmediate: ${executed.name}`);
    return next;
  }

  // Event loop tick complete
  next.currentPhase = 'idle';
  next.executionLog.unshift('[EventLoop] All queues empty. Waiting for external I/O or timers.');
  return next;
}

/**
 * Steps Go GMP Work-Stealing Runtime by 1 discrete atomic action
 */
export function stepGoGmp(state: GoGmpState): GoGmpState {
  const next: GoGmpState = {
    processors: [
      { id: 0, activeGoroutine: state.processors[0].activeGoroutine, localRunQueue: [...state.processors[0].localRunQueue] },
      { id: 1, activeGoroutine: state.processors[1].activeGoroutine, localRunQueue: [...state.processors[1].localRunQueue] },
    ],
    globalRunQueue: [...state.globalRunQueue],
    networkPoller: [...state.networkPoller],
    executionLog: [...state.executionLog],
  };

  const p0 = next.processors[0];
  const p1 = next.processors[1];

  // If P0 is idle and has empty local queue -> Execute Work-Stealing Algorithm
  if (!p0.activeGoroutine && p0.localRunQueue.length === 0) {
    if (p1.localRunQueue.length > 1) {
      // Steal half of P1's local runqueue (rounded up)
      const stealCount = Math.ceil(p1.localRunQueue.length / 2);
      const stolen = p1.localRunQueue.splice(0, stealCount);
      p0.activeGoroutine = stolen.shift() || null;
      p0.localRunQueue.push(...stolen);
      next.lastStolenFromP = 1;
      next.executionLog.unshift(`[Work-Stealing] P0 was idle! Stole ${stealCount} goroutine(s) from P1 to balance CPU cores.`);
      return next;
    } else if (next.globalRunQueue.length > 0) {
      // Steal from global runqueue
      p0.activeGoroutine = next.globalRunQueue.shift() || null;
      next.executionLog.unshift(`[Global Queue] P0 grabbed ${p0.activeGoroutine?.name} from global runqueue.`);
      return next;
    }
  }

  // Progress execution on active processors
  if (p0.activeGoroutine) {
    const done = p0.activeGoroutine;
    p0.activeGoroutine = p0.localRunQueue.shift() || null;
    next.executionLog.unshift(`[P0 Core] Completed ${done.name}`);
    return next;
  }

  if (p1.activeGoroutine) {
    const done = p1.activeGoroutine;
    p1.activeGoroutine = p1.localRunQueue.shift() || null;
    next.executionLog.unshift(`[P1 Core] Completed ${done.name}`);
    return next;
  }

  next.executionLog.unshift('[GMP Scheduler] All processors idle. Goroutines completed.');
  return next;
}

/**
 * Steps Python Asyncio Cooperative Loop by 1 discrete atomic action
 */
export function stepPythonAsyncio(state: PythonAsyncioState): PythonAsyncioState {
  const next: PythonAsyncioState = {
    activeCoroutine: state.activeCoroutine,
    readyQueue: [...state.readyQueue],
    sleepingFutures: [...state.sleepingFutures],
    currentTick: state.currentTick + 1,
    executionLog: [...state.executionLog],
  };

  if (next.activeCoroutine) {
    const yielded = next.activeCoroutine;
    next.executionLog.unshift(`[Asyncio] ${yielded.name} yielded via 'await asyncio.sleep(0)'`);
    
    // Switch to next ready coroutine in round-robin fashion
    if (next.readyQueue.length > 0) {
      next.activeCoroutine = next.readyQueue.shift()!;
      // Re-enqueue the yielded coroutine to the back of ready queue
      next.readyQueue.push({
        ...yielded,
        name: yielded.name.includes('Step 1') ? yielded.name.replace('Step 1', 'Step 2') : `${yielded.name} (resumed)`,
      });
    } else {
      next.executionLog.unshift(`[Asyncio] ${yielded.name} completed.`);
      next.activeCoroutine = null;
    }
    return next;
  }

  if (next.readyQueue.length > 0) {
    next.activeCoroutine = next.readyQueue.shift()!;
    next.executionLog.unshift(`[Asyncio] Scheduled ${next.activeCoroutine.name} onto event loop.`);
    return next;
  }

  next.executionLog.unshift('[Asyncio] Event loop finished all tasks.');
  return next;
}
