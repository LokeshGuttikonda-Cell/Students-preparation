'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/Card';
import {
  TRANSACTION_SCENARIOS,
  simulateTransactionExperiment,
  generateTransactionLabMarkdown,
  exportTransactionLabPdf,
  downloadFile,
  loadSavedTransactionLabRecords,
  saveTransactionLabRecord,
  type TransactionScenario,
  type TransactionSimulationConfig,
  type TransactionSimulationResult,
  type CoordinationProtocol,
  type IsolationLevel,
  type FailureInjection,
} from '../../../lib/transaction-lab-client';

export default function TransactionLabPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    TRANSACTION_SCENARIOS[0].id
  );
  const [activeTab, setActiveTab] = useState<'console' | 'waterfall' | 'scorecard'>('console');

  // Current Scenario
  const currentScenario = useMemo<TransactionScenario>(() => {
    return (
      TRANSACTION_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
      TRANSACTION_SCENARIOS[0]
    );
  }, [selectedScenarioId]);

  // Tunable configuration state
  const [protocol, setProtocol] = useState<CoordinationProtocol>(
    currentScenario.goldenConfig.protocol
  );
  const [isolationLevel, setIsolationLevel] = useState<IsolationLevel>(
    currentScenario.goldenConfig.isolationLevel
  );
  const [timeoutMs, setTimeoutMs] = useState<number>(
    currentScenario.goldenConfig.timeoutMs
  );
  const [retryLimit, setRetryLimit] = useState<number>(
    currentScenario.goldenConfig.retryLimit
  );
  const [hasIdempotencyKey, setHasIdempotencyKey] = useState<boolean>(
    currentScenario.goldenConfig.hasIdempotencyKey
  );
  const [hasTransactionalOutbox, setHasTransactionalOutbox] = useState<boolean>(
    currentScenario.goldenConfig.hasTransactionalOutbox
  );
  const [failureInjection, setFailureInjection] = useState<FailureInjection>(
    currentScenario.goldenConfig.failureInjection
  );

  // Simulation result state
  const [simulationResult, setSimulationResult] = useState<TransactionSimulationResult | null>(null);

  // Socratic guidance hints
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1);

  // Load saved state or set default on scenario change
  useEffect(() => {
    const saved = loadSavedTransactionLabRecords();
    const existing = saved.find((r) => r.scenarioId === currentScenario.id);

    if (existing) {
      setProtocol(existing.config.protocol);
      setIsolationLevel(existing.config.isolationLevel);
      setTimeoutMs(existing.config.timeoutMs);
      setRetryLimit(existing.config.retryLimit);
      setHasIdempotencyKey(existing.config.hasIdempotencyKey);
      setHasTransactionalOutbox(existing.config.hasTransactionalOutbox);
      setFailureInjection(existing.config.failureInjection);
      setSimulationResult(existing.result);
    } else {
      // Default to slightly unoptimized setup so candidates learn by optimizing
      setProtocol(
        currentScenario.id === 'ecommerce-order-checkout'
          ? 'TWO_PHASE_COMMIT'
          : currentScenario.id === 'cross-border-wire-transfer'
          ? 'CHOREOGRAPHED_SAGA'
          : currentScenario.goldenConfig.protocol
      );
      setIsolationLevel(currentScenario.goldenConfig.isolationLevel);
      setTimeoutMs(currentScenario.goldenConfig.timeoutMs);
      setRetryLimit(currentScenario.goldenConfig.retryLimit);
      setHasIdempotencyKey(currentScenario.id !== 'cross-border-wire-transfer');
      setHasTransactionalOutbox(false);
      setFailureInjection(currentScenario.goldenConfig.failureInjection);
      setSimulationResult(null);
    }
    setRevealedHintIndex(-1);
  }, [currentScenario]);

  // Run simulation handler
  const handleExecuteTransaction = () => {
    const currentConfig: TransactionSimulationConfig = {
      scenarioId: currentScenario.id,
      protocol,
      isolationLevel,
      timeoutMs,
      retryLimit,
      hasIdempotencyKey,
      hasTransactionalOutbox,
      failureInjection,
    };

    const result = simulateTransactionExperiment(currentConfig, currentScenario);
    setSimulationResult(result);

    saveTransactionLabRecord({
      scenarioId: currentScenario.id,
      config: currentConfig,
      result,
      timestamp: new Date().toISOString(),
    });

    setActiveTab('waterfall');
  };

  // Apply Golden Architecture
  const handleApplyGolden = () => {
    const g = currentScenario.goldenConfig;
    setProtocol(g.protocol);
    setIsolationLevel(g.isolationLevel);
    setTimeoutMs(g.timeoutMs);
    setRetryLimit(g.retryLimit);
    setHasIdempotencyKey(g.hasIdempotencyKey);
    setHasTransactionalOutbox(g.hasTransactionalOutbox);
    setFailureInjection(g.failureInjection);

    const result = simulateTransactionExperiment(g, currentScenario);
    setSimulationResult(result);

    saveTransactionLabRecord({
      scenarioId: currentScenario.id,
      config: g,
      result,
      timestamp: new Date().toISOString(),
    });

    setActiveTab('scorecard');
  };

  const handleExportPdf = () => {
    if (!simulationResult) return;
    const currentConfig: TransactionSimulationConfig = {
      scenarioId: currentScenario.id,
      protocol,
      isolationLevel,
      timeoutMs,
      retryLimit,
      hasIdempotencyKey,
      hasTransactionalOutbox,
      failureInjection,
    };
    exportTransactionLabPdf(currentScenario, currentConfig, simulationResult);
  };

  const handleExportMarkdown = () => {
    if (!simulationResult) return;
    const currentConfig: TransactionSimulationConfig = {
      scenarioId: currentScenario.id,
      protocol,
      isolationLevel,
      timeoutMs,
      retryLimit,
      hasIdempotencyKey,
      hasTransactionalOutbox,
      failureInjection,
    };
    const md = generateTransactionLabMarkdown(currentScenario, currentConfig, simulationResult);
    downloadFile(`transaction-lab-${currentScenario.id}-report.md`, md, 'text/markdown');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-blue-900/40 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-mono text-xs">
                DISTRIBUTED TRANSACTIONS &amp; SAGA PATTERNS
              </Badge>
              <Badge variant="neutral" className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-mono text-xs">
                100% LOCAL COMPUTE ($0.00 SPEND)
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Distributed Transactions &amp; Saga Orchestrator Studio
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Master distributed data consistency across microservices without distributed locks. Compare Two-Phase Commit (2PC),
              Three-Phase Commit (3PC), Choreographed Sagas, Orchestrated Sagas with compensating rollbacks, and the Transactional Outbox pattern.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              variant="secondary"
              onClick={handleApplyGolden}
              className="border-indigo-500/50 hover:bg-indigo-500/20 text-indigo-200"
            >
              Apply Golden Reference
            </Button>
            <Button
              variant="primary"
              onClick={handleExecuteTransaction}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-900/50"
            >
              Execute Distributed Transaction
            </Button>
          </div>
        </div>
      </div>

      {/* Scenario Selector Ribbon */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Select Placement Lab Scenario
          </span>
          <span className="text-xs text-indigo-400 font-mono">
            {TRANSACTION_SCENARIOS.length} Production Scenarios Available
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TRANSACTION_SCENARIOS.map((s) => {
            const isSelected = s.id === selectedScenarioId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedScenarioId(s.id)}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-indigo-950/50 border-indigo-400 ring-1 ring-indigo-400 shadow-md shadow-indigo-950/50'
                    : 'bg-card/40 border-border/60 hover:border-indigo-500/40 hover:bg-card/70'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface/80 border border-border text-gray-300">
                    {s.domain}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full ${
                      s.difficulty === 'Expert'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-700/50'
                        : s.difficulty === 'Advanced'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                    }`}
                  >
                    {s.difficulty}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{s.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-2 mt-1">{s.description}</p>
                </div>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>{s.stepCount} Participant Services</span>
                  <span>Golden: {s.goldenConfig.protocol.replace(/_/g, ' ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Socratic Guidance & Anti-Pattern Alert */}
      <Card className="border-amber-500/30 bg-amber-950/10">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-amber-300">Production Architectural Anti-Pattern</h4>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {currentScenario.antiPatternSummary}
              </p>
            </div>
          </div>

          <div className="border-t border-amber-500/20 pt-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="text-xs text-amber-400 font-mono">
              💡 Need guidance? Reveal Socratic interview hints:
            </div>
            <div className="flex gap-2">
              {currentScenario.socraticHints.map((_, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setRevealedHintIndex((prev) => (prev === idx ? prev - 1 : idx))
                  }
                  className={`text-xs px-2.5 py-1 ${
                    revealedHintIndex >= idx
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'border-border/60 text-gray-400 hover:text-white'
                  }`}
                >
                  Hint {idx + 1}
                </Button>
              ))}
            </div>
          </div>

          {revealedHintIndex >= 0 && (
            <div className="p-3 bg-surface/90 border border-amber-500/30 rounded-lg space-y-2">
              {currentScenario.socraticHints.slice(0, revealedHintIndex + 1).map((hint, i) => (
                <div key={i} className="text-xs sm:text-sm text-amber-200 flex items-start gap-2">
                  <span className="font-bold text-amber-400">Q{i + 1}:</span>
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Studio Navigation Tabs */}
      <div className="flex border-b border-border/60 space-x-2">
        <button
          onClick={() => setActiveTab('console')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'console'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <span>⚙️</span>
          <span>Protocol &amp; Coordination Console</span>
        </button>
        <button
          onClick={() => setActiveTab('waterfall')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'waterfall'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <span>🔄</span>
          <span>Saga State Machine &amp; Step Waterfall</span>
          {simulationResult && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                !simulationResult.inconsistencyDetected
                  ? 'bg-indigo-900 text-indigo-300'
                  : 'bg-rose-900 text-rose-300'
              }`}
            >
              {simulationResult.inconsistencyDetected ? 'Inconsistency Alert' : 'Consistent'}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'scorecard'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <span>🏆</span>
          <span>Scorecard &amp; Reference Blueprint</span>
          {simulationResult && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-900 text-indigo-300 font-bold">
              Grade {simulationResult.grade}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CONSOLE */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coordination Protocol Selection */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <span>🔗</span>
                <span>Coordination Protocol</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Distributed Protocol</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'TWO_PHASE_COMMIT',
                      label: 'Two-Phase Commit (2PC)',
                      desc: 'Strict ACID | Blocking row locks, coordinator SPOF vulnerability',
                    },
                    {
                      id: 'THREE_PHASE_COMMIT',
                      label: 'Three-Phase Commit (3PC)',
                      desc: 'Non-blocking timeouts | Vulnerable to network split-brain',
                    },
                    {
                      id: 'CHOREOGRAPHED_SAGA',
                      label: 'Choreographed Saga',
                      desc: 'Decentralized events | Lightweight, prone to cyclic cascades',
                    },
                    {
                      id: 'ORCHESTRATED_SAGA',
                      label: 'Orchestrated Saga',
                      desc: 'Central workflow state machine | Explicit rollback compensations',
                    },
                    {
                      id: 'TRANSACTIONAL_OUTBOX',
                      label: 'Transactional Outbox',
                      desc: 'Atomic DB + Event log | Eliminates dual-write money loss',
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProtocol(p.id as CoordinationProtocol)}
                      className={`p-3 rounded-lg text-left border transition-all text-xs ${
                        protocol === p.id
                          ? 'bg-indigo-950/60 border-indigo-400 text-white shadow-sm'
                          : 'bg-surface/50 border-border/60 text-gray-400 hover:border-indigo-500/30 hover:text-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-white">{p.label}</div>
                      <div className="text-[11px] text-gray-400 mt-1 leading-snug">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Isolation Level & Failure Injection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Isolation Guarantee</label>
                  <select
                    value={isolationLevel}
                    onChange={(e) => setIsolationLevel(e.target.value as IsolationLevel)}
                    className="w-full bg-surface/80 border border-border/60 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="EVENTUAL_CONSISTENCY">Eventual Consistency (Saga Standard)</option>
                    <option value="READ_COMMITTED">Read Committed</option>
                    <option value="REPEATABLE_READ">Repeatable Read</option>
                    <option value="SERIALIZABLE">Serializable (Strict ACID)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Failure Injection</label>
                  <select
                    value={failureInjection}
                    onChange={(e) => setFailureInjection(e.target.value as FailureInjection)}
                    className="w-full bg-surface/80 border border-border/60 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="NONE">None (Happy Path Execution)</option>
                    <option value="PARTICIPANT_CRASH">Participant Service Crash</option>
                    <option value="COORDINATOR_CRASH">Coordinator Crash Mid-Flight</option>
                    <option value="NETWORK_PARTITION">Cross-Datacenter Network Partition</option>
                    <option value="DUAL_WRITE_OUTAGE">Dual-Write Broker Disconnect</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reliability & Fault-Tolerance Controls */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <span>🛡️</span>
                <span>Reliability &amp; Fault Tolerance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>Transaction Timeout (ms)</span>
                    <span className="font-mono text-indigo-400">{timeoutMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={500}
                    value={timeoutMs}
                    onChange={(e) => setTimeoutMs(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>Retry Limit (Exponential Backoff)</span>
                    <span className="font-mono text-indigo-400">{retryLimit} retries</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={retryLimit}
                    onChange={(e) => setRetryLimit(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <div className="flex items-center gap-3 bg-surface/40 p-3 rounded-lg border border-border/50">
                  <input
                    type="checkbox"
                    id="idempotencyKey"
                    checked={hasIdempotencyKey}
                    onChange={(e) => setHasIdempotencyKey(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 accent-indigo-500"
                  />
                  <label htmlFor="idempotencyKey" className="text-xs text-gray-300 cursor-pointer">
                    <span className="font-semibold text-white">Idempotency Key Deduplication</span>
                    <span className="block text-gray-400 text-[11px]">
                      Pass unique transaction request IDs to guarantee safe retries without double-charging.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 bg-surface/40 p-3 rounded-lg border border-border/50">
                  <input
                    type="checkbox"
                    id="transactionalOutbox"
                    checked={hasTransactionalOutbox}
                    onChange={(e) => setHasTransactionalOutbox(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 accent-indigo-500"
                  />
                  <label htmlFor="transactionalOutbox" className="text-xs text-gray-300 cursor-pointer">
                    <span className="font-semibold text-white">Transactional Outbox Pattern</span>
                    <span className="block text-gray-400 text-[11px]">
                      Atomically persist outbound events into a local database table before asynchronous relay.
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: SAGA STATE MACHINE & STEP WATERFALL */}
      {activeTab === 'waterfall' && (
        <div className="space-y-6">
          {!simulationResult ? (
            <div className="text-center py-16 bg-card/40 rounded-xl border border-border/60 space-y-3">
              <span className="text-4xl">⚡</span>
              <h3 className="text-lg font-bold text-white">No Transaction Executed Yet</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Configure your coordination protocol in the Console tab and click &quot;Execute Distributed Transaction&quot;.
              </p>
              <Button variant="primary" onClick={handleExecuteTransaction} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Execute Transaction Now
              </Button>
            </div>
          ) : (
            <>
              {/* Inconsistency Alert Banner */}
              {simulationResult.inconsistencyDetected && (
                <div className="p-4 bg-rose-950/40 border border-rose-600/50 rounded-xl flex items-start gap-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">
                      Cross-Service Data Inconsistency Detected!
                    </h4>
                    <p className="text-xs text-rose-200 mt-1">
                      A distributed failure occurred without an atomic outbox or compensating rollback. State across
                      participant microservices is now corrupted (e.g. sender account debited without recipient credited).
                    </p>
                  </div>
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/60 bg-card/60">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-gray-400 font-medium">Transaction Outcome</span>
                    <div className="text-2xl font-black font-mono">
                      {simulationResult.success ? (
                        <span className="text-emerald-400">COMMITTED ✅</span>
                      ) : (
                        <span className="text-amber-400">ROLLED BACK ⚠️</span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Duration: {simulationResult.totalDurationMs} ms
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/60">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-gray-400 font-medium">Distributed Lock Holding Time</span>
                    <div
                      className={`text-2xl font-black font-mono ${
                        simulationResult.resourceLockDurationMs <= 50 ? 'text-indigo-400' : 'text-rose-400'
                      }`}
                    >
                      {simulationResult.resourceLockDurationMs} ms
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {simulationResult.resourceLockDurationMs <= 50
                        ? 'Non-blocking local ACID locks'
                        : 'Severe 2PC distributed row lock contention'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/60">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-gray-400 font-medium">Compensations Executed</span>
                    <div className="text-2xl font-black text-white font-mono">
                      {simulationResult.compensationsTriggered} steps
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Reverse rollback actions
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/60">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-gray-400 font-medium">Network Messages</span>
                    <div className="text-2xl font-black text-cyan-300 font-mono">
                      {simulationResult.networkMessagesExchanged} msgs
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Cross-service RPC &amp; Event dispatches
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Step Waterfall Visual Timeline */}
              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
                    <span>Saga Execution Step Waterfall</span>
                    <span className="text-xs font-mono text-indigo-400">{protocol.replace(/_/g, ' ')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                    {simulationResult.steps.map((step, idx) => (
                      <div key={step.stepId} className="relative space-y-1">
                        <div
                          className={`absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 ${
                            step.status === 'COMMITTED'
                              ? 'bg-emerald-500 border-emerald-400'
                              : step.status === 'COMPENSATED'
                              ? 'bg-amber-500 border-amber-400'
                              : step.status === 'FAILED'
                              ? 'bg-rose-500 border-rose-400'
                              : 'bg-surface border-border'
                          }`}
                        />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface/50 p-3 rounded-lg border border-border/50">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                Step {idx + 1}: {step.serviceName}
                              </span>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                  step.status === 'COMMITTED'
                                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50'
                                    : step.status === 'COMPENSATED'
                                    ? 'bg-amber-950/60 text-amber-300 border border-amber-700/50'
                                    : step.status === 'FAILED'
                                    ? 'bg-rose-950/60 text-rose-300 border border-rose-700/50'
                                    : 'bg-surface text-gray-400 border border-border'
                                }`}
                              >
                                {step.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-300 mt-1">
                              Action: <span className="font-mono text-indigo-300">{step.actionName}</span>
                            </div>
                            {step.status === 'COMPENSATED' && (
                              <div className="text-[11px] text-amber-400 mt-0.5 font-mono">
                                ↺ Compensated via: {step.compensateName}
                              </div>
                            )}
                            {step.errorDetails && (
                              <div className="text-[11px] text-rose-400 mt-0.5">
                                ⚠️ Error: {step.errorDetails}
                              </div>
                            )}
                          </div>
                          <div className="text-right text-xs font-mono text-gray-400">
                            <div>{step.executionTimeMs} ms</div>
                            {step.retryCount > 0 && <div>{step.retryCount} retry</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* TAB 3: SCORECARD & BLUEPRINT */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          {!simulationResult ? (
            <div className="text-center py-16 bg-card/40 rounded-xl border border-border/60 space-y-3">
              <span className="text-4xl">🏅</span>
              <h3 className="text-lg font-bold text-white">No Evaluation Recorded</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Execute the transaction or apply the golden reference architecture to view your candidate scorecard.
              </p>
              <Button variant="primary" onClick={handleApplyGolden} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Apply Golden Reference
              </Button>
            </div>
          ) : (
            <>
              {/* Composite Grade Header Card */}
              <div className="bg-card/70 border border-border/70 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-5">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-lg ${
                      simulationResult.grade === 'S'
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-gray-950 ring-4 ring-amber-400/40'
                        : simulationResult.grade === 'A'
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white ring-4 ring-emerald-400/40'
                        : simulationResult.grade === 'B'
                        ? 'bg-gradient-to-br from-indigo-400 to-indigo-600 text-white ring-4 ring-indigo-400/40'
                        : simulationResult.grade === 'C'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white ring-4 ring-amber-500/40'
                        : 'bg-gradient-to-br from-rose-500 to-red-700 text-white ring-4 ring-rose-500/40'
                    }`}
                  >
                    {simulationResult.grade}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold">
                      ARCHITECTURAL SCORECARD
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      Score: {simulationResult.score} / 100
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 max-w-lg">
                      Evaluated against {currentScenario.title} placement requirements.
                    </p>
                  </div>
                </div>

                {/* Exporter Buttons */}
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="secondary"
                    onClick={handleExportMarkdown}
                    className="text-xs border-border/80 hover:bg-surface text-gray-200"
                  >
                    Export Markdown
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleExportPdf}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                  >
                    Download Report (PDF)
                  </Button>
                </div>
              </div>

              {/* Earned Badges */}
              {simulationResult.earnedBadges.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-1">
                    Industry Badges Earned:
                  </span>
                  {simulationResult.earnedBadges.map((badge) => (
                    <Badge
                      key={badge}
                      variant="neutral"
                      className="bg-indigo-950/60 border-indigo-500/40 text-indigo-300 font-mono text-xs px-2.5 py-1"
                    >
                      🏆 {badge}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Feedback Callout */}
              <Card className="border-indigo-500/30 bg-indigo-950/20">
                <CardContent className="p-5 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                    Lead Systems Evaluator Critique
                  </h4>
                  <p className="text-sm text-gray-200 leading-relaxed font-sans">
                    {simulationResult.feedback}
                  </p>
                </CardContent>
              </Card>

              {/* Tested vs Golden Architecture Comparison Table */}
              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white">
                    Candidate vs Golden Reference Architecture Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="border-b border-border/60 text-gray-400">
                        <tr>
                          <th className="py-2.5 px-3">Architecture Parameter</th>
                          <th className="py-2.5 px-3">Candidate Configuration</th>
                          <th className="py-2.5 px-3">Golden Reference</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 text-gray-200">
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-gray-300 font-semibold">Protocol</td>
                          <td className="py-2.5 px-3 text-indigo-300">{protocol}</td>
                          <td className="py-2.5 px-3 text-white">{currentScenario.goldenConfig.protocol}</td>
                          <td className="py-2.5 px-3">
                            {protocol === currentScenario.goldenConfig.protocol ? (
                              <span className="text-indigo-400">MATCH ✅</span>
                            ) : (
                              <span className="text-amber-400">MISMATCH ⚠️</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-gray-300 font-semibold">Lock Holding Duration</td>
                          <td className="py-2.5 px-3 text-indigo-300">{simulationResult.resourceLockDurationMs} ms</td>
                          <td className="py-2.5 px-3 text-white">&lt;= 50 ms</td>
                          <td className="py-2.5 px-3">
                            {simulationResult.resourceLockDurationMs <= 50 ? (
                              <span className="text-indigo-400">NON-BLOCKING ✅</span>
                            ) : (
                              <span className="text-rose-400">BLOCKING LOCKS 🚨</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-gray-300 font-semibold">Transactional Outbox</td>
                          <td className="py-2.5 px-3 text-indigo-300">{hasTransactionalOutbox ? 'Enabled' : 'Disabled'}</td>
                          <td className="py-2.5 px-3 text-white">
                            {currentScenario.goldenConfig.hasTransactionalOutbox ? 'Enabled' : 'Disabled'}
                          </td>
                          <td className="py-2.5 px-3">
                            {hasTransactionalOutbox === currentScenario.goldenConfig.hasTransactionalOutbox ? (
                              <span className="text-indigo-400">MATCH ✅</span>
                            ) : (
                              <span className="text-amber-400">MISMATCH ⚠️</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-gray-300 font-semibold">Data Consistency</td>
                          <td className="py-2.5 px-3 text-indigo-300">
                            {simulationResult.inconsistencyDetected ? 'Corrupted State' : 'Consistent State'}
                          </td>
                          <td className="py-2.5 px-3 text-white">Consistent State</td>
                          <td className="py-2.5 px-3">
                            {!simulationResult.inconsistencyDetected ? (
                              <span className="text-indigo-400">CONSISTENT ✅</span>
                            ) : (
                              <span className="text-rose-400">INCONSISTENCY 🚨</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Industrial Best Practice Blueprint */}
              <Card className="border-border/60 bg-card/60">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>💡</span>
                    <span>Industrial Best Practices &amp; Interview Blueprint</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                  <p>
                    <strong className="text-white">Why 2PC Fails in Microservices:</strong> Two-Phase Commit requires
                    holding exclusive database locks on participant rows from phase 1 (Prepare) until phase 2 (Commit).
                    If a participant delays or the coordinator crashes, all row locks remain frozen. In high-traffic services,
                    this quickly exhausts connection pools and causes cascade outages.
                  </p>
                  <p>
                    <strong className="text-white">Orchestrated Sagas vs Choreography:</strong> While Choreographed Sagas
                    avoid a central coordinator, they suffer from cyclic event cascades and high cognitive load when tracing
                    rollback sequences. Orchestrated Sagas centralize the state machine in a single durable coordinator,
                    making backward compensating rollbacks predictable, testable, and observable.
                  </p>
                  <p>
                    <strong className="text-white">Dual-Write Defense with Transactional Outbox:</strong> Updating a database
                    and publishing an event to a message broker in two separate network calls is vulnerable to server crashes
                    between them. The Transactional Outbox pattern writes the event payload into an Outbox table in the same
                    local ACID transaction as the state update, guaranteeing at-least-once dispatch without split-brain loss.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
}
