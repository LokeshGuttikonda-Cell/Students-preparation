'use client';

import React, { useState, useEffect, useId, useCallback, useRef } from 'react';
import { Button } from '../ui/Button';
import {
  ConcurrencyModelType,
  SIMULATOR_PRESETS,
  NodejsLoopState,
  GoGmpState,
  PythonAsyncioState,
  createInitialNodejsState,
  createInitialGoGmpState,
  createInitialPythonAsyncioState,
  stepNodejsLoop,
  stepGoGmp,
  stepPythonAsyncio,
} from '../../lib/event-loop-data';

interface EventLoopSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EventLoopSimulator: React.FC<EventLoopSimulatorProps> = ({ isOpen, onClose }) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SIMULATOR_PRESETS[0].id);
  const [activeModel, setActiveModel] = useState<ConcurrencyModelType>('nodejs');
  
  // State per model
  const [nodeState, setNodeState] = useState<NodejsLoopState>(() => createInitialNodejsState('node-microtask-priority'));
  const [goState, setGoState] = useState<GoGmpState>(() => createInitialGoGmpState());
  const [pyState, setPyState] = useState<PythonAsyncioState>(() => createInitialPythonAsyncioState());
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const titleId = useId();

  const activePreset = SIMULATOR_PRESETS.find((p) => p.id === selectedPresetId) || SIMULATOR_PRESETS[0];

  // Reset states
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    if (activeModel === 'nodejs') {
      setNodeState(createInitialNodejsState(selectedPresetId));
    } else if (activeModel === 'go_gmp') {
      setGoState(createInitialGoGmpState());
    } else {
      setPyState(createInitialPythonAsyncioState());
    }
  }, [activeModel, selectedPresetId]);

  // Handle Preset Select
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = SIMULATOR_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setActiveModel(preset.model);
      setIsPlaying(false);
      if (preset.model === 'nodejs') {
        setNodeState(createInitialNodejsState(presetId));
      } else if (preset.model === 'go_gmp') {
        setGoState(createInitialGoGmpState());
      } else {
        setPyState(createInitialPythonAsyncioState());
      }
    }
  };

  // Step function
  const handleStep = useCallback(() => {
    if (activeModel === 'nodejs') {
      setNodeState((prev) => stepNodejsLoop(prev));
    } else if (activeModel === 'go_gmp') {
      setGoState((prev) => stepGoGmp(prev));
    } else {
      setPyState((prev) => stepPythonAsyncio(prev));
    }
  }, [activeModel]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        handleStep();
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, handleStep]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(activePreset.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  };

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
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" aria-hidden="true">🌀</span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-white tracking-tight">
                Asynchronous Event Loop &amp; Concurrency Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Interactive discrete stepping across Node.js (libuv), Go (GMP Work-Stealing), and Python (asyncio)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close event loop simulator"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Model Tabs & Presets Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-950/50 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">Model:</span>
            <div className="flex items-center space-x-1">
              {(
                [
                  { key: 'nodejs', label: 'Node.js (libuv / V8)' },
                  { key: 'go_gmp', label: 'Go (GMP Work-Stealing)' },
                  { key: 'python_asyncio', label: 'Python (asyncio)' },
                ] as const
              ).map((m) => (
                <button
                  key={m.key}
                  onClick={() => {
                    setActiveModel(m.key);
                    const matchingPreset = SIMULATOR_PRESETS.find((p) => p.model === m.key);
                    if (matchingPreset) handlePresetSelect(matchingPreset.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeModel === m.key
                      ? 'bg-cyan-900/60 border border-cyan-400 text-cyan-200 font-bold'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">Presets:</span>
            <div className="flex flex-wrap gap-1">
              {SIMULATOR_PRESETS.filter((p) => p.model === activeModel).map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedPresetId === p.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* Controls & Telemetry Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center space-x-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleStep}
                className="text-xs gap-1.5 cursor-pointer"
              >
                ⚡ Step Forward
              </Button>
              <Button
                variant={isPlaying ? 'destructive' : 'secondary'}
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-xs cursor-pointer"
              >
                {isPlaying ? '⏸ Pause' : '▶ Auto Play'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs cursor-pointer">
                🔄 Reset
              </Button>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400">Speed:</span>
              {[
                { label: '1x', ms: 1000 },
                { label: '2x', ms: 500 },
                { label: '5x', ms: 200 },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setPlaybackSpeed(s.ms)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                    playbackSpeed === s.ms ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Node.js Visual Queues */}
          {activeModel === 'nodejs' && (
            <div className="space-y-4">
              {nodeState.isStarving && (
                <div className="p-3.5 rounded-xl border border-rose-500/50 bg-rose-950/40 text-rose-200 text-xs">
                  <span className="font-bold">⚠️ Starvation Hazard:</span> {nodeState.starvationReason}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Call Stack */}
                <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                    <span>Call Stack (LIFO)</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60">
                      {nodeState.callStack.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 min-h-[70px]">
                    {nodeState.callStack.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2 text-center">Empty (Ready for Macrotask)</div>
                    ) : (
                      nodeState.callStack.map((t) => (
                        <div key={t.id} className="p-2 rounded bg-indigo-900/40 border border-indigo-500/40 text-xs font-mono text-indigo-100">
                          {t.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Priority NextTick Queue */}
                <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                    <span>process.nextTick Queue</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-900/60">
                      {nodeState.nextTickQueue.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 min-h-[70px]">
                    {nodeState.nextTickQueue.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2 text-center">Empty</div>
                    ) : (
                      nodeState.nextTickQueue.map((t) => (
                        <div key={t.id} className="p-2 rounded bg-rose-900/40 border border-rose-500/40 text-xs font-mono text-rose-100">
                          {t.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Microtask Queue (Promises) */}
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>Promise Microtasks</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60">
                      {nodeState.microtaskQueue.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 min-h-[70px]">
                    {nodeState.microtaskQueue.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2 text-center">Empty</div>
                    ) : (
                      nodeState.microtaskQueue.map((t) => (
                        <div key={t.id} className="p-2 rounded bg-amber-900/40 border border-amber-500/40 text-xs font-mono text-amber-100">
                          {t.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Macrotask Phases */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                {/* Timers Phase */}
                <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span>1. Timers Phase (setTimeout)</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60">
                      {nodeState.timersQueue.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 min-h-[60px]">
                    {nodeState.timersQueue.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2 text-center">Empty</div>
                    ) : (
                      nodeState.timersQueue.map((t) => (
                        <div key={t.id} className="p-2 rounded bg-cyan-900/40 border border-cyan-500/40 text-xs font-mono text-cyan-100">
                          {t.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Poll Phase */}
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                    <span>2. Poll Phase (I/O Callbacks)</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60">
                      {nodeState.pollQueue.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 min-h-[60px]">
                    {nodeState.pollQueue.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2 text-center">Empty</div>
                    ) : (
                      nodeState.pollQueue.map((t) => (
                        <div key={t.id} className="p-2 rounded bg-emerald-900/40 border border-emerald-500/40 text-xs font-mono text-emerald-100">
                          {t.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Check Phase */}
                <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-950/20 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                    <span>3. Check Phase (setImmediate)</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60">
                      {nodeState.checkQueue.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 min-h-[60px]">
                    {nodeState.checkQueue.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-2 text-center">Empty</div>
                    ) : (
                      nodeState.checkQueue.map((t) => (
                        <div key={t.id} className="p-2 rounded bg-purple-900/40 border border-purple-500/40 text-xs font-mono text-purple-100">
                          {t.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Go GMP Visual Queues */}
          {activeModel === 'go_gmp' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Processor P0 */}
                <div className="p-4 rounded-xl border border-cyan-500/40 bg-slate-950/70 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span>Processor P0 (Thread M0)</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[10px] border border-cyan-500/30">
                      Local Queue: {goState.processors[0].localRunQueue.length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Goroutine (Running on CPU):</span>
                    <span className="font-mono text-cyan-200 font-semibold mt-0.5 block">
                      {goState.processors[0].activeGoroutine ? goState.processors[0].activeGoroutine.name : 'Idle (Triggers Steal)'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Local Runqueue:</span>
                    {goState.processors[0].localRunQueue.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-1">No pending local goroutines</div>
                    ) : (
                      goState.processors[0].localRunQueue.map((g) => (
                        <div key={g.id} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                          {g.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Processor P1 */}
                <div className="p-4 rounded-xl border border-indigo-500/40 bg-slate-950/70 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                    <span>Processor P1 (Thread M1)</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 font-mono text-[10px] border border-indigo-500/30">
                      Local Queue: {goState.processors[1].localRunQueue.length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Goroutine (Running on CPU):</span>
                    <span className="font-mono text-indigo-200 font-semibold mt-0.5 block">
                      {goState.processors[1].activeGoroutine ? goState.processors[1].activeGoroutine.name : 'Idle'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400">Local Runqueue:</span>
                    {goState.processors[1].localRunQueue.length === 0 ? (
                      <div className="text-xs text-slate-500 italic py-1">No pending local goroutines</div>
                    ) : (
                      goState.processors[1].localRunQueue.map((g) => (
                        <div key={g.id} className="p-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                          {g.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Global Queue */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/50 flex items-center justify-between text-xs">
                <span className="text-slate-400">Global Runqueue (Checked every 61 ticks to prevent starvation):</span>
                <span className="font-mono font-bold text-amber-400">
                  {goState.globalRunQueue.length > 0 ? goState.globalRunQueue.map((g) => g.name).join(', ') : 'Empty'}
                </span>
              </div>
            </div>
          )}

          {/* Python Asyncio Visual Queues */}
          {activeModel === 'python_asyncio' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-sky-500/40 bg-slate-950/70 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                  <span>Single-Threaded Event Loop</span>
                  <span className="font-mono text-sky-400">Tick: {pyState.currentTick}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Currently Executing Coroutine:</span>
                  <span className="font-mono text-sky-200 font-semibold mt-1 block">
                    {pyState.activeCoroutine ? pyState.activeCoroutine.name : 'None (Loop Waiting)'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 space-y-2">
                <div className="text-xs font-bold text-slate-300">Ready Queue (FIFO):</div>
                <div className="flex flex-wrap gap-2">
                  {pyState.readyQueue.length === 0 ? (
                    <div className="text-xs text-slate-500 italic py-1">No coroutines queued</div>
                  ) : (
                    pyState.readyQueue.map((c) => (
                      <div key={c.id} className="p-2 rounded bg-slate-900 border border-sky-500/30 text-xs font-mono text-sky-200">
                        {c.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Execution Log & Code Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Live Execution Trace */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">Execution Trace</h3>
                <span className="text-[10px] text-slate-500 font-mono">Latest at top</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-300 h-[150px] overflow-y-auto space-y-1">
                {activeModel === 'nodejs' &&
                  nodeState.executionLog.map((log, i) => (
                    <div key={i} className="text-[11px] leading-relaxed border-b border-slate-900/80 pb-0.5">
                      {log}
                    </div>
                  ))}
                {activeModel === 'go_gmp' &&
                  goState.executionLog.map((log, i) => (
                    <div key={i} className="text-[11px] leading-relaxed border-b border-slate-900/80 pb-0.5">
                      {log}
                    </div>
                  ))}
                {activeModel === 'python_asyncio' &&
                  pyState.executionLog.map((log, i) => (
                    <div key={i} className="text-[11px] leading-relaxed border-b border-slate-900/80 pb-0.5">
                      {log}
                    </div>
                  ))}
              </div>
            </div>

            {/* Code Snippet Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">Code Scenario</h3>
                <button
                  onClick={handleCopyCode}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedCode ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 h-[150px] overflow-y-auto">
                <pre>{activePreset.codeSnippet}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400">
            Phase Guarantee: Synchronous Stack $	o$ Microtasks $	o$ Event Loop Macrotask Tick
          </div>
          <Button variant="primary" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
