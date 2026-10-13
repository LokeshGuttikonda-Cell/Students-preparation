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
  STREAM_SCENARIOS,
  simulateStreamExperiment,
  generateStreamLabMarkdown,
  exportStreamLabPdf,
  downloadFile,
  loadSavedStreamLabRecords,
  saveStreamLabRecord,
  type StreamSimulationScenario,
  type StreamSimulationConfig,
  type StreamSimulationResult,
  type PartitioningStrategy,
  type DeliverySemantics,
  type RebalanceProtocol,
  type AckMode,
} from '../../../lib/stream-lab-client';

export default function StreamLabPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    STREAM_SCENARIOS[0].id
  );
  const [activeTab, setActiveTab] = useState<'topology' | 'telemetry' | 'scorecard'>(
    'topology'
  );

  // Current Scenario
  const currentScenario = useMemo<StreamSimulationScenario>(() => {
    return (
      STREAM_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
      STREAM_SCENARIOS[0]
    );
  }, [selectedScenarioId]);

  // Tunable configuration state
  const [partitionCount, setPartitionCount] = useState<number>(
    currentScenario.goldenConfig.partitionCount
  );
  const [consumerCount, setConsumerCount] = useState<number>(
    currentScenario.goldenConfig.consumerCount
  );
  const [partitioningStrategy, setPartitioningStrategy] = useState<PartitioningStrategy>(
    currentScenario.goldenConfig.partitioningStrategy
  );
  const [deliverySemantics, setDeliverySemantics] = useState<DeliverySemantics>(
    currentScenario.goldenConfig.deliverySemantics
  );
  const [rebalanceProtocol, setRebalanceProtocol] = useState<RebalanceProtocol>(
    currentScenario.goldenConfig.rebalanceProtocol
  );
  const [ackMode, setAckMode] = useState<AckMode>(
    currentScenario.goldenConfig.ackMode
  );
  const [consumerBatchSize, setConsumerBatchSize] = useState<number>(
    currentScenario.goldenConfig.consumerBatchSize
  );
  const [consumerProcessingTimeMs, setConsumerProcessingTimeMs] = useState<number>(
    currentScenario.goldenConfig.consumerProcessingTimeMs
  );
  const [hasDeadLetterQueue, setHasDeadLetterQueue] = useState<boolean>(
    currentScenario.goldenConfig.hasDeadLetterQueue
  );
  const [retryAttempts, setRetryAttempts] = useState<number>(
    currentScenario.goldenConfig.retryAttempts
  );
  const [trafficMps, setTrafficMps] = useState<number>(
    currentScenario.trafficProfile.mps
  );

  // Result state
  const [simulationResult, setSimulationResult] =
    useState<StreamSimulationResult | null>(null);

  // Socratic guidance hints
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1);

  // Load saved state or set unoptimized defaults on scenario change
  useEffect(() => {
    const saved = loadSavedStreamLabRecords();
    const existing = saved.find((r) => r.scenarioId === currentScenario.id);

    if (existing) {
      setPartitionCount(existing.config.partitionCount);
      setConsumerCount(existing.config.consumerCount);
      setPartitioningStrategy(existing.config.partitioningStrategy);
      setDeliverySemantics(existing.config.deliverySemantics);
      setRebalanceProtocol(existing.config.rebalanceProtocol);
      setAckMode(existing.config.ackMode);
      setConsumerBatchSize(existing.config.consumerBatchSize);
      setConsumerProcessingTimeMs(existing.config.consumerProcessingTimeMs);
      setHasDeadLetterQueue(existing.config.hasDeadLetterQueue);
      setRetryAttempts(existing.config.retryAttempts);
      setTrafficMps(existing.config.trafficMps);
      setSimulationResult(existing.result);
    } else {
      // Default to an educational unoptimized state
      setPartitionCount(Math.max(2, Math.round(currentScenario.goldenConfig.partitionCount / 3)));
      setConsumerCount(currentScenario.goldenConfig.consumerCount);
      setPartitioningStrategy('ROUND_ROBIN');
      setDeliverySemantics('AT_LEAST_ONCE');
      setRebalanceProtocol('EAGER_STOP_THE_WORLD');
      setAckMode('LEADER_ONLY_ACK');
      setConsumerBatchSize(10);
      setConsumerProcessingTimeMs(currentScenario.goldenConfig.consumerProcessingTimeMs);
      setHasDeadLetterQueue(false);
      setRetryAttempts(currentScenario.goldenConfig.retryAttempts);
      setTrafficMps(currentScenario.trafficProfile.mps);
      setSimulationResult(null);
    }

    setRevealedHintIndex(-1);
    setActiveTab('topology');
  }, [currentScenario]);

  // Execute simulation
  const handleRunSimulation = () => {
    const config: StreamSimulationConfig = {
      scenarioId: currentScenario.id,
      partitionCount,
      consumerCount,
      partitioningStrategy,
      deliverySemantics,
      rebalanceProtocol,
      ackMode,
      consumerBatchSize,
      consumerProcessingTimeMs,
      hasDeadLetterQueue,
      retryAttempts,
      trafficMps,
    };

    const res = simulateStreamExperiment(currentScenario, config);
    setSimulationResult(res);

    saveStreamLabRecord({
      scenarioId: currentScenario.id,
      lastRunAt: res.simulatedAt,
      config,
      result: res,
    });

    setActiveTab('telemetry');
  };

  // Apply Golden Configuration
  const handleApplyGolden = () => {
    const golden = currentScenario.goldenConfig;
    setPartitionCount(golden.partitionCount);
    setConsumerCount(golden.consumerCount);
    setPartitioningStrategy(golden.partitioningStrategy);
    setDeliverySemantics(golden.deliverySemantics);
    setRebalanceProtocol(golden.rebalanceProtocol);
    setAckMode(golden.ackMode);
    setConsumerBatchSize(golden.consumerBatchSize);
    setConsumerProcessingTimeMs(golden.consumerProcessingTimeMs);
    setHasDeadLetterQueue(golden.hasDeadLetterQueue);
    setRetryAttempts(golden.retryAttempts);
    setTrafficMps(golden.trafficMps);
  };

  // Export handlers
  const handleExportPdf = () => {
    if (!simulationResult) return;
    const config: StreamSimulationConfig = {
      scenarioId: currentScenario.id,
      partitionCount,
      consumerCount,
      partitioningStrategy,
      deliverySemantics,
      rebalanceProtocol,
      ackMode,
      consumerBatchSize,
      consumerProcessingTimeMs,
      hasDeadLetterQueue,
      retryAttempts,
      trafficMps,
    };
    exportStreamLabPdf(currentScenario, config, simulationResult);
  };

  const handleExportMarkdown = () => {
    if (!simulationResult) return;
    const config: StreamSimulationConfig = {
      scenarioId: currentScenario.id,
      partitionCount,
      consumerCount,
      partitioningStrategy,
      deliverySemantics,
      rebalanceProtocol,
      ackMode,
      consumerBatchSize,
      consumerProcessingTimeMs,
      hasDeadLetterQueue,
      retryAttempts,
      trafficMps,
    };
    const md = generateStreamLabMarkdown(currentScenario, config, simulationResult);
    downloadFile(
      `stream-lab-${currentScenario.id}-report.md`,
      md,
      'text/markdown;charset=utf-8'
    );
  };

  const currentConfig: StreamSimulationConfig = {
    scenarioId: currentScenario.id,
    partitionCount,
    consumerCount,
    partitioningStrategy,
    deliverySemantics,
    rebalanceProtocol,
    ackMode,
    consumerBatchSize,
    consumerProcessingTimeMs,
    hasDeadLetterQueue,
    retryAttempts,
    trafficMps,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Message Streaming & Partitioning Lab
            </h1>
            <Badge variant="primary">Stream Studio</Badge>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Master distributed commit logs, consumer group rebalancing, poison pill isolation, and exactly-once delivery semantics.
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-3">
          <label htmlFor="scenario-select" className="text-xs font-medium text-text-muted">
            Scenario:
          </label>
          <select
            id="scenario-select"
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="text-sm bg-surface border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-text"
          >
            {STREAM_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario Brief & Socratic Hints */}
      <Card className="bg-surface border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-text">
                {currentScenario.title}
              </CardTitle>
              <Badge
                variant={
                  currentScenario.difficulty === 'Expert'
                    ? 'error'
                    : currentScenario.difficulty === 'Advanced'
                      ? 'warning'
                      : 'neutral'
                }
              >
                {currentScenario.difficulty}
              </Badge>
              <span className="text-xs text-text-muted font-medium">
                Domain: {currentScenario.domain}
              </span>
            </div>
            <div className="text-xs text-text-muted">
              Target Lag Limit: <strong className="text-primary-700">&le; {currentScenario.targetLagThreshold} msgs</strong>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-1">{currentScenario.description}</p>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 p-3 rounded-md border border-border">
            <div>
              <span className="text-text-muted block">Base Traffic:</span>
              <strong className="text-text font-semibold">
                {currentScenario.trafficProfile.mps.toLocaleString()} msgs/sec
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Burst Factor:</span>
              <strong className="text-text font-semibold">
                {currentScenario.trafficProfile.burstMultiplier}x peak
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Key Cardinality:</span>
              <strong className="text-text font-semibold">
                {currentScenario.trafficProfile.keyCardinality.toLocaleString()} keys
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Payload Size:</span>
              <strong className="text-text font-semibold">
                {currentScenario.trafficProfile.avgPayloadBytes.toLocaleString()} bytes
              </strong>
            </div>
          </div>

          <div className="bg-error-50/50 border border-error-200 p-3 rounded-md text-xs text-error-800">
            <strong className="font-semibold block mb-0.5">Known Architectural Bottleneck:</strong>
            {currentScenario.antiPatternSummary}
          </div>

          {/* Socratic Hints Drawer */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text">Socratic Streaming Clues:</span>
              {revealedHintIndex < currentScenario.socraticHints.length - 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary-700"
                  onClick={() => setRevealedHintIndex((prev) => prev + 1)}
                >
                  Reveal Clue {revealedHintIndex + 2} of {currentScenario.socraticHints.length}
                </Button>
              ) : (
                <span className="text-xs text-text-muted italic">All clues revealed</span>
              )}
            </div>
            {revealedHintIndex >= 0 && (
              <div className="mt-2 space-y-1.5">
                {currentScenario.socraticHints.slice(0, revealedHintIndex + 1).map((hint, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-primary-50/60 border border-primary-200 text-primary-900 p-2.5 rounded-md"
                  >
                    <strong>Clue {idx + 1}:</strong> {hint}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab('topology')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'topology'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          1. Partitioning & Consumer Topology
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'telemetry'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          2. Stream Telemetry & Partition Heatmap
        </button>
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'scorecard'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          3. Architecture Scorecard & Blueprint
        </button>
      </div>

      {/* TAB 1: TOPOLOGY & TUNING */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partitions & Concurrency */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-text">
                  Log Partitions & Consumer Concurrency
                </CardTitle>
                <p className="text-xs text-text-muted mt-1">
                  Control degree of parallelism and consumer group member balance.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-text">
                      Log Partition Count:
                    </label>
                    <span className="text-xs font-bold text-primary-700">{partitionCount} partitions</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="32"
                    value={partitionCount}
                    onChange={(e) => setPartitionCount(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-[11px] text-text-muted block mt-1">
                    Defines unit of parallelism. Max active consumers in a group equals partition count.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-text">
                      Consumer Group Worker Count:
                    </label>
                    <span className="text-xs font-bold text-primary-700">{consumerCount} workers</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="32"
                    value={consumerCount}
                    onChange={(e) => setConsumerCount(Number(e.target.value))}
                    className="w-full"
                  />
                  {consumerCount > partitionCount && (
                    <span className="text-[11px] text-warning-700 font-medium block mt-1">
                      ⚠️ {consumerCount - partitionCount} consumers will sit idle (workers exceed partitions).
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Partitioning Strategy
                  </label>
                  <select
                    value={partitioningStrategy}
                    onChange={(e) => setPartitioningStrategy(e.target.value as PartitioningStrategy)}
                    className="w-full text-xs bg-canvas border border-border rounded p-2 focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="KEY_HASH">Key-Hash Partitioning (Strict Ordering Per Entity Key)</option>
                    <option value="ROUND_ROBIN">Round-Robin (Uniform Load Distribution, No Key Order)</option>
                    <option value="CUSTOM_RANGE">Custom Range Partitioning (Region/Tier Based)</option>
                    <option value="BROADCAST_ALL">Broadcast to All Partitions</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Semantics & Fault Isolation */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-text">
                  Delivery Guarantees & Fault Isolation
                </CardTitle>
                <p className="text-xs text-text-muted mt-1">
                  Configure acknowledgment durability, deduplication, and poison-pill defense.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Delivery Semantics
                  </label>
                  <select
                    value={deliverySemantics}
                    onChange={(e) => setDeliverySemantics(e.target.value as DeliverySemantics)}
                    className="w-full text-xs bg-canvas border border-border rounded p-2 focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="EXACTLY_ONCE">Exactly-Once (Idempotency Key + Two-Phase Commit)</option>
                    <option value="AT_LEAST_ONCE">At-Least-Once (Consumer Offset Commit After Processing)</option>
                    <option value="AT_MOST_ONCE">At-Most-Once (Offset Committed Before Processing)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Rebalance Protocol
                  </label>
                  <select
                    value={rebalanceProtocol}
                    onChange={(e) => setRebalanceProtocol(e.target.value as RebalanceProtocol)}
                    className="w-full text-xs bg-canvas border border-border rounded p-2 focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="COOPERATIVE_STICKY">Cooperative Sticky Protocol (~45ms pause, zero stop-the-world)</option>
                    <option value="EAGER_STOP_THE_WORLD">Eager Protocol (~2,800ms full stop-the-world stall)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Replication ACK Durability
                  </label>
                  <select
                    value={ackMode}
                    onChange={(e) => setAckMode(e.target.value as AckMode)}
                    className="w-full text-xs bg-canvas border border-border rounded p-2 focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="ALL_IN_SYNC_REPLICAS">All In-Sync Replicas (Zero Data Loss Guarantee)</option>
                    <option value="LEADER_ONLY_ACK">Leader-Only ACK (Fast, Vulnerable to Leader Crash)</option>
                    <option value="NO_ACK_FIRE_FORGET">No ACK / Fire-and-Forget (Maximum Speed, High Loss Risk)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <div>
                    <span className="text-xs font-semibold text-text block">Dead-Letter Queue (DLQ)</span>
                    <span className="text-[11px] text-text-muted">Quarantines poison pills after max retries</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasDeadLetterQueue}
                    onChange={(e) => setHasDeadLetterQueue(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Batch Size & Traffic Load */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-text">
                Batching & Stream Throughput Tuning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-text">
                      Consumer Batch Size:
                    </label>
                    <span className="text-xs font-bold text-primary-700">{consumerBatchSize} msgs/poll</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="10"
                    value={consumerBatchSize}
                    onChange={(e) => setConsumerBatchSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-[11px] text-text-muted block mt-1">
                    Micro-batching amortizes network I/O and transaction commit overhead.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-text">
                      Simulated Ingestion Load:
                    </label>
                    <span className="text-xs font-bold text-primary-700">{trafficMps.toLocaleString()} msgs/sec</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={trafficMps}
                    onChange={(e) => setTrafficMps(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <Button variant="secondary" size="sm" onClick={handleApplyGolden}>
                  Apply Golden Reference Architecture
                </Button>
                <Button variant="primary" onClick={handleRunSimulation}>
                  Run 10,000 Message Streaming Benchmark
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: LIVE STREAM TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {!simulationResult ? (
            <div className="text-center py-12 bg-surface rounded-lg border border-border">
              <p className="text-sm font-medium text-text-muted mb-4">
                No stream execution data yet for this session.
              </p>
              <Button variant="primary" onClick={handleRunSimulation}>
                Execute Streaming Benchmark
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alert for Poison Pill or Rebalance Downtime */}
              {!simulationResult.poisonPillHandled && (
                <div className="bg-error-50 border border-error-300 p-4 rounded-md text-xs text-error-800 flex items-start gap-3">
                  <span className="text-lg">🛑</span>
                  <div>
                    <strong className="font-semibold block">
                      Pipeline Stalled: Unhandled Poison Pill Message!
                    </strong>
                    A corrupted message repeatedly crashed consumer workers. Without a Dead-Letter Queue (DLQ), partition offset was blocked, halting downstream consumers.
                  </div>
                </div>
              )}

              {simulationResult.rebalanceDowntimeMs > 1000 && (
                <div className="bg-warning-50 border border-warning-300 p-4 rounded-md text-xs text-warning-800 flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <strong className="font-semibold block">
                      Eager Rebalance Stop-The-World Pause ({simulationResult.rebalanceDowntimeMs} ms)
                    </strong>
                    All active consumers were revoked and stopped processing during group rebalance, creating an immediate lag spike.
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-surface border-border">
                  <CardHeader className="pb-2">
                    <span className="text-xs text-text-muted font-medium">Pipeline Throughput</span>
                    <CardTitle className="text-2xl font-bold text-text">
                      {simulationResult.throughputMps.toLocaleString()} MPS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-text-muted">
                    Messages Processed / sec
                  </CardContent>
                </Card>

                <Card className="bg-surface border-border">
                  <CardHeader className="pb-2">
                    <span className="text-xs text-text-muted font-medium">Consumer Group Lag</span>
                    <CardTitle className="text-2xl font-bold text-text">
                      {simulationResult.maxConsumerLag.toLocaleString()} msgs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-text-muted">
                    Threshold: &le; {currentScenario.targetLagThreshold} msgs (
                    {simulationResult.maxConsumerLag <= currentScenario.targetLagThreshold ? (
                      <span className="text-success-700 font-semibold">Healthy</span>
                    ) : (
                      <span className="text-error-700 font-semibold">Backlog Alert</span>
                    )}
                    )
                  </CardContent>
                </Card>

                <Card className="bg-surface border-border">
                  <CardHeader className="pb-2">
                    <span className="text-xs text-text-muted font-medium">P99 End-to-End Latency</span>
                    <CardTitle className="text-2xl font-bold text-text">
                      {simulationResult.p99LatencyMs} ms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-text-muted">
                    Average: {simulationResult.avgProcessingLatencyMs} ms
                  </CardContent>
                </Card>

                <Card className="bg-surface border-border">
                  <CardHeader className="pb-2">
                    <span className="text-xs text-text-muted font-medium">Delivery Integrity</span>
                    <CardTitle className="text-2xl font-bold text-text">
                      {simulationResult.duplicateRatePercent}% Dups
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-text-muted">
                    Data Loss: {simulationResult.dataLossCount} messages
                  </CardContent>
                </Card>
              </div>

              {/* Partition Heatmap Card */}
              <Card className="bg-surface border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-text">
                    Partition Lag & Traffic Distribution Heatmap ({partitionCount} Partitions)
                  </CardTitle>
                  <p className="text-xs text-text-muted mt-1">
                    Visualizes message distribution and consumer assignments across each log partition.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {simulationResult.partitionMetrics.map((p) => (
                      <div
                        key={p.partitionId}
                        className={`p-3 rounded-md border text-xs ${
                          p.isHotspot
                            ? 'bg-error-50 border-error-300 text-error-900'
                            : p.assignedConsumerId === null
                              ? 'bg-neutral-100 border-neutral-300 text-neutral-600'
                              : 'bg-surface border-border text-text'
                        }`}
                      >
                        <div className="flex justify-between font-semibold mb-1">
                          <span>Partition #{p.partitionId}</span>
                          <span
                            className={
                              p.isHotspot ? 'text-error-700 font-bold' : 'text-primary-700'
                            }
                          >
                            {p.messageSharePercent}% share
                          </span>
                        </div>
                        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full ${
                              p.isHotspot
                                ? 'bg-error-600'
                                : p.assignedConsumerId === null
                                  ? 'bg-neutral-400'
                                  : 'bg-primary-600'
                            }`}
                            style={{ width: `${Math.min(100, p.messageSharePercent * 2.5)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-text-muted">
                          <span>
                            {p.assignedConsumerId !== null
                              ? `Worker #${p.assignedConsumerId}`
                              : 'Unassigned (Starved)'}
                          </span>
                          <span className="font-semibold text-text">Lag: {p.lagCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="secondary" size="sm" onClick={() => setActiveTab('topology')}>
                      Adjust Partitioning
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setActiveTab('scorecard')}>
                      View Architecture Scorecard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCORECARD & BLUEPRINT */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          {!simulationResult ? (
            <div className="text-center py-12 bg-surface rounded-lg border border-border">
              <p className="text-sm font-medium text-text-muted mb-4">
                Execute a benchmark simulation to generate an engineering scorecard.
              </p>
              <Button variant="primary" onClick={handleRunSimulation}>
                Run Simulation Now
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Scorecard Header */}
              <Card className="bg-surface border-border">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black text-white ${
                          simulationResult.grade === 'S'
                            ? 'bg-success-600'
                            : simulationResult.grade === 'A'
                              ? 'bg-primary-600'
                              : simulationResult.grade === 'B'
                                ? 'bg-primary-700'
                                : simulationResult.grade === 'C'
                                  ? 'bg-warning-500'
                                  : 'bg-error-600'
                        }`}
                      >
                        {simulationResult.grade}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold text-text">
                          Architecture Grade: {simulationResult.grade} ({simulationResult.score}/100)
                        </CardTitle>
                        <p className="text-xs text-text-muted mt-0.5">
                          Simulated at {new Date(simulationResult.simulatedAt).toLocaleTimeString()} | Zero-AI Local Compute
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={handleExportMarkdown}>
                        Export Markdown
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleExportPdf}>
                        Download Report (PDF)
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs bg-neutral-50 p-3 rounded-md border border-border text-text">
                    {simulationResult.feedback}
                  </div>

                  {/* Badges */}
                  <div>
                    <span className="text-xs font-semibold text-text block mb-2">
                      Earned Competency Badges:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {simulationResult.earnedBadges.length > 0 ? (
                        simulationResult.earnedBadges.map((badge) => (
                          <span
                            key={badge}
                            className="bg-primary-50 text-primary-800 border border-primary-200 text-xs px-2.5 py-1 rounded-full font-semibold"
                          >
                            🏅 {badge.replace(/_/g, ' ')}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-text-muted italic">
                          No badges awarded for this run. Tune the architecture to achieve Grade A or S.
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison Table */}
              <Card className="bg-surface border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-text">
                    Tested Pipeline vs. Golden Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-neutral-50">
                          <th className="py-2.5 px-3 font-semibold text-text">Parameter</th>
                          <th className="py-2.5 px-3 font-semibold text-text">Tested Configuration</th>
                          <th className="py-2.5 px-3 font-semibold text-text">Golden Reference</th>
                          <th className="py-2.5 px-3 font-semibold text-text">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">Partitions</td>
                          <td className="py-2 px-3 text-text-muted font-mono">{currentConfig.partitionCount}</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.partitionCount}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.partitionCount >= currentScenario.goldenConfig.partitionCount ? (
                              <span className="text-success-700 font-bold">&check; Adequate</span>
                            ) : (
                              <span className="text-warning-700 font-medium">Under-partitioned</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">Strategy</td>
                          <td className="py-2 px-3 text-text-muted font-mono">{currentConfig.partitioningStrategy}</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.partitioningStrategy}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.partitioningStrategy === currentScenario.goldenConfig.partitioningStrategy ? (
                              <span className="text-success-700 font-bold">&check; Match</span>
                            ) : (
                              <span className="text-warning-700 font-medium">Sub-optimal</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">Delivery Semantics</td>
                          <td className="py-2 px-3 text-text-muted font-mono">{currentConfig.deliverySemantics}</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.deliverySemantics}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.deliverySemantics === currentScenario.goldenConfig.deliverySemantics ? (
                              <span className="text-success-700 font-bold">&check; Match</span>
                            ) : (
                              <span className="text-warning-700 font-medium">Risk of Dups/Loss</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">Rebalance Protocol</td>
                          <td className="py-2 px-3 text-text-muted font-mono">{currentConfig.rebalanceProtocol}</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.rebalanceProtocol}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.rebalanceProtocol === 'COOPERATIVE_STICKY' ? (
                              <span className="text-success-700 font-bold">&check; Cooperative</span>
                            ) : (
                              <span className="text-error-700 font-bold">&cross; Stop-The-World</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">Dead-Letter Queue</td>
                          <td className="py-2 px-3 text-text-muted font-mono">
                            {currentConfig.hasDeadLetterQueue ? 'Enabled' : 'Disabled'}
                          </td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.hasDeadLetterQueue ? 'Enabled' : 'Disabled'}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.hasDeadLetterQueue === currentScenario.goldenConfig.hasDeadLetterQueue ? (
                              <span className="text-success-700 font-bold">&check; Protected</span>
                            ) : (
                              <span className="text-error-700 font-bold">&cross; Vulnerable</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Golden Architecture Explanation */}
              <Card className="bg-primary-50/40 border-primary-200">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-primary-950">
                    Industrial Best Practice Blueprint
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-primary-900 leading-relaxed space-y-2">
                  <p>{currentScenario.goldenExplanation}</p>
                  <div className="border-t border-primary-200/80 pt-2 flex justify-between items-center">
                    <span className="font-semibold">Ready to deploy the optimal streaming setup?</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleApplyGolden();
                        setActiveTab('topology');
                      }}
                    >
                      Load Golden Settings & Retest
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
