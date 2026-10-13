'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
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

export function ConcurrencyEventLoopSandbox() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SIMULATOR_PRESETS[0].id);
  const [activeModel, setActiveModel] = useState<ConcurrencyModelType>('nodejs');

  // State per model
  const [nodeState, setNodeState] = useState<NodejsLoopState>(() =>
    createInitialNodejsState('node-microtask-priority'),
  );
  const [goState, setGoState] = useState<GoGmpState>(() => createInitialGoGmpState());
  const [pyState, setPyState] = useState<PythonAsyncioState>(() =>
    createInitialPythonAsyncioState(),
  );

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activePreset =
    SIMULATOR_PRESETS.find((p) => p.id === selectedPresetId) || SIMULATOR_PRESETS[0];

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

  const copyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activePreset.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <Card className="border border-border bg-surface shadow-xs">
      <CardContent className="p-6 sm:p-8 space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-50 px-2.5 py-0.5 rounded border border-accent-200">
                ⚡ Concurrency &amp; Event Loop
              </span>
              <span className="text-xs font-mono bg-surface-muted text-text-muted px-2 py-0.5 rounded border border-border">
                {activeModel === 'nodejs'
                  ? 'Node.js (libuv / V8)'
                  : activeModel === 'go_gmp'
                  ? 'Go Runtime (GMP Work-Stealing)'
                  : 'Python (asyncio Event Loop)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary-900 tracking-tight">
              Runtime Concurrency &amp; Event Loop Simulator
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-3xl leading-relaxed">
              Step through first-principles execution models: inspect microtask draining priority over macrotask phases,
              diagnose starvation traps, simulate Go GMP goroutine work-stealing across logical processors, and trace Python asyncio cooperative task yields.
            </p>
          </div>

          {/* Model Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-surface-muted p-1.5 rounded-xl border border-border shrink-0 self-start sm:self-auto">
            {(
              [
                { id: 'nodejs', label: 'Node.js (libuv)' },
                { id: 'go_gmp', label: 'Go (GMP)' },
                { id: 'python_asyncio', label: 'Python (asyncio)' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  const defaultPreset =
                    SIMULATOR_PRESETS.find((p) => p.model === m.id) || SIMULATOR_PRESETS[0];
                  handlePresetSelect(defaultPreset.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeModel === m.id
                    ? 'bg-primary-900 text-white shadow-xs'
                    : 'text-text-muted hover:text-text hover:bg-surface'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Selector Chips */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Select Concurrency Scenario:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SIMULATOR_PRESETS.filter((p) => p.model === activeModel).map((p) => {
              const isSelected = p.id === selectedPresetId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-primary-50/70 border-primary-600 ring-2 ring-primary-500/20'
                      : 'bg-canvas border-border hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-text">{p.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded">
                        Active ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Playback Controls & Speed Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-surface-muted border border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleStep}
              className="text-xs gap-1.5 cursor-pointer font-bold"
            >
              <span>⚡</span> Step Forward
            </Button>
            <Button
              variant={isPlaying ? 'destructive' : 'secondary'}
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs cursor-pointer font-bold"
            >
              {isPlaying ? '⏸ Pause' : '▶ Auto Play'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs cursor-pointer"
            >
              🔄 Reset
            </Button>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-text-muted font-medium">Clock Speed:</span>
            {[
              { label: '1x', ms: 1000 },
              { label: '2x', ms: 500 },
              { label: '5x', ms: 200 },
            ].map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setPlaybackSpeed(s.ms)}
                className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer transition-colors ${
                  playbackSpeed === s.ms
                    ? 'bg-primary-900 text-white font-bold shadow-xs'
                    : 'bg-surface border border-border text-text-muted hover:text-text'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippet & Simulator State Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Deterministic Code Preview */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Source Script
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="text-[11px] font-medium text-primary-700 hover:underline cursor-pointer"
              >
                {copiedCode ? '✓ Copied' : '📋 Copy Code'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800 leading-relaxed max-h-[420px]">
              <code>{activePreset.codeSnippet}</code>
            </pre>
          </div>

          {/* Right: Stateful Architecture Inspection Stage */}
          <div className="lg:col-span-8 space-y-4">
            {/* 1. NODE.JS EVENT LOOP STAGE */}
            {activeModel === 'nodejs' && (
              <div className="space-y-4">
                {nodeState.isStarving && (
                  <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 text-xs">
                    <span className="font-bold">⚠️ Starvation Hazard Detected:</span>{' '}
                    {nodeState.starvationReason}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Call Stack */}
                  <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                      <span>Call Stack (LIFO)</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900 font-bold">
                        {nodeState.callStack.length}
                      </span>
                    </div>
                    <div className="space-y-1.5 min-h-[70px]">
                      {nodeState.callStack.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-2 text-center">
                          Empty (Ready for Queue Drain)
                        </div>
                      ) : (
                        nodeState.callStack.map((t) => (
                          <div
                            key={t.id}
                            className="p-2 rounded bg-surface border border-indigo-300 text-xs font-mono text-indigo-950 shadow-xs"
                          >
                            {t.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Priority NextTick Queue */}
                  <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                      <span>process.nextTick Queue</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 font-bold">
                        {nodeState.nextTickQueue.length}
                      </span>
                    </div>
                    <div className="space-y-1.5 min-h-[70px]">
                      {nodeState.nextTickQueue.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-2 text-center">Empty</div>
                      ) : (
                        nodeState.nextTickQueue.map((t) => (
                          <div
                            key={t.id}
                            className="p-2 rounded bg-surface border border-rose-300 text-xs font-mono text-rose-950 shadow-xs"
                          >
                            {t.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Microtask Queue (Promises) */}
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>Promise Microtasks</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                        {nodeState.microtaskQueue.length}
                      </span>
                    </div>
                    <div className="space-y-1.5 min-h-[70px]">
                      {nodeState.microtaskQueue.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-2 text-center">Empty</div>
                      ) : (
                        nodeState.microtaskQueue.map((t) => (
                          <div
                            key={t.id}
                            className="p-2 rounded bg-surface border border-amber-300 text-xs font-mono text-amber-950 shadow-xs"
                          >
                            {t.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Macrotask Phases */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Timers Phase */}
                  <div className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-sky-900">
                      <span>1. Timers Phase (setTimeout)</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-200 text-sky-900 font-bold">
                        {nodeState.timersQueue.length}
                      </span>
                    </div>
                    <div className="space-y-1 min-h-[55px]">
                      {nodeState.timersQueue.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-1 text-center">Empty</div>
                      ) : (
                        nodeState.timersQueue.map((t) => (
                          <div
                            key={t.id}
                            className="p-1.5 rounded bg-surface border border-sky-300 text-xs font-mono text-sky-950"
                          >
                            {t.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Poll Phase */}
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>2. Poll Phase (I/O Callbacks)</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                        {nodeState.pollQueue.length}
                      </span>
                    </div>
                    <div className="space-y-1 min-h-[55px]">
                      {nodeState.pollQueue.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-1 text-center">Empty</div>
                      ) : (
                        nodeState.pollQueue.map((t) => (
                          <div
                            key={t.id}
                            className="p-1.5 rounded bg-surface border border-emerald-300 text-xs font-mono text-emerald-950"
                          >
                            {t.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Check Phase */}
                  <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                      <span>3. Check Phase (setImmediate)</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 font-bold">
                        {nodeState.checkQueue.length}
                      </span>
                    </div>
                    <div className="space-y-1 min-h-[55px]">
                      {nodeState.checkQueue.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-1 text-center">Empty</div>
                      ) : (
                        nodeState.checkQueue.map((t) => (
                          <div
                            key={t.id}
                            className="p-1.5 rounded bg-surface border border-purple-300 text-xs font-mono text-purple-950"
                          >
                            {t.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. GO GMP STAGE */}
            {activeModel === 'go_gmp' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goState.processors.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-sky-950 uppercase tracking-wider">
                          Logical Processor P{p.id}
                        </span>
                        <span className="text-[11px] font-mono text-sky-900 bg-sky-200/80 px-2 py-0.5 rounded font-bold">
                          Local Queue: {p.localRunQueue.length}/256
                        </span>
                      </div>

                      {/* Active Goroutine (M) */}
                      <div className="p-3 rounded-lg bg-surface border border-sky-300 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 block">
                          Executing on OS Thread (M)
                        </span>
                        {p.activeGoroutine ? (
                          <div className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{p.activeGoroutine.name}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-text-muted italic">Idle (Searching for Work)</div>
                        )}
                      </div>

                      {/* Local Runqueue Items */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Local Runqueue (Lock-Free)
                        </span>
                        <div className="space-y-1 min-h-[60px]">
                          {p.localRunQueue.length === 0 ? (
                            <div className="text-xs text-text-muted italic py-1 text-center">
                              Queue Empty
                            </div>
                          ) : (
                            p.localRunQueue.map((g) => (
                              <div
                                key={g.id}
                                className="p-1.5 rounded bg-surface border border-border text-xs font-mono text-text"
                              >
                                {g.name}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Global Runqueue & Network Poller */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>Global Runqueue (Mutex Locked)</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                        {goState.globalRunQueue.length}
                      </span>
                    </div>
                    <div className="space-y-1 min-h-[40px]">
                      {goState.globalRunQueue.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-1 text-center">Empty</div>
                      ) : (
                        goState.globalRunQueue.map((g) => (
                          <div
                            key={g.id}
                            className="p-1.5 rounded bg-surface border border-amber-300 text-xs font-mono text-amber-950"
                          >
                            {g.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>Network Poller (epoll / kqueue)</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                        {goState.networkPoller.length}
                      </span>
                    </div>
                    <div className="space-y-1 min-h-[40px]">
                      {goState.networkPoller.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-1 text-center">Empty</div>
                      ) : (
                        goState.networkPoller.map((g) => (
                          <div
                            key={g.id}
                            className="p-1.5 rounded bg-surface border border-emerald-300 text-xs font-mono text-emerald-950"
                          >
                            {g.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PYTHON ASYNCIO STAGE */}
            {activeModel === 'python_asyncio' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      Active Running Coroutine Task
                    </span>
                    <span className="text-[11px] font-mono text-indigo-900 bg-indigo-200 px-2 py-0.5 rounded font-bold">
                      Loop Tick #{pyState.currentTick}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-indigo-300">
                    {pyState.activeCoroutine ? (
                      <div className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{pyState.activeCoroutine.name}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-text-muted italic">Event Loop Idle (Awaiting Tasks)</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ready Queue */}
                  <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>Ready Queue (Runnable Tasks)</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-bold">
                        {pyState.readyQueue.length}
                      </span>
                    </div>
                    <div className="space-y-1 min-h-[60px]">
                      {pyState.readyQueue.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-2 text-center">Queue Empty</div>
                      ) : (
                        pyState.readyQueue.map((t) => (
                          <div
                            key={t.id}
                            className="p-1.5 rounded bg-surface border border-amber-300 text-xs font-mono text-amber-950"
                          >
                            {t.name}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Sleeping Futures */}
                  <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                      <span>Sleeping Futures (asyncio.sleep)</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 font-bold">
                        {pyState.sleepingFutures.length}
                      </span>
                    </div>
                    <div className="space-y-1 min-h-[60px]">
                      {pyState.sleepingFutures.length === 0 ? (
                        <div className="text-xs text-text-muted italic py-2 text-center">No Paused Tasks</div>
                      ) : (
                        pyState.sleepingFutures.map((f, i) => (
                          <div
                            key={i}
                            className="p-1.5 rounded bg-surface border border-purple-300 text-xs font-mono text-purple-950 flex items-center justify-between"
                          >
                            <span>{f.task.name}</span>
                            <span className="text-[10px] text-purple-700 font-bold">
                              Wake @ Tick #{f.resumeTick}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Execution Telemetry Log */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Runtime Execution Log &amp; Phase Trace
              </span>
              <div className="p-3 rounded-xl bg-neutral-950 text-neutral-300 font-mono text-xs overflow-y-auto max-h-[140px] border border-neutral-800 space-y-1">
                {(() => {
                  const log =
                    activeModel === 'nodejs'
                      ? nodeState.executionLog
                      : activeModel === 'go_gmp'
                      ? goState.executionLog
                      : pyState.executionLog;

                  if (log.length === 0) {
                    return (
                      <div className="text-neutral-500 italic py-1">
                        Click &quot;Step Forward&quot; or &quot;Auto Play&quot; to initialize execution trace...
                      </div>
                    );
                  }

                  return log.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-neutral-500 select-none">[{idx + 1}]</span>
                      <span className="text-emerald-400 font-medium">{entry}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
