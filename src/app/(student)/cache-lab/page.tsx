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
  CACHE_SCENARIOS,
  simulateCacheExperiment,
  generateCacheLabMarkdown,
  exportCacheLabPdf,
  downloadFile,
  loadSavedCacheLabRecords,
  saveCacheLabRecord,
  type CacheSimulationScenario,
  type CacheSimulationConfig,
  type CacheSimulationResult,
  type CacheTopology,
  type CacheReadStrategy,
  type CacheWriteStrategy,
  type EvictionPolicy,
  type StampedeProtection,
} from '../../../lib/cache-lab-client';

export default function CacheLabPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    CACHE_SCENARIOS[0].id
  );
  const [activeTab, setActiveTab] = useState<'tuning' | 'telemetry' | 'scorecard'>(
    'tuning'
  );

  // Current Scenario
  const currentScenario = useMemo<CacheSimulationScenario>(() => {
    return (
      CACHE_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
      CACHE_SCENARIOS[0]
    );
  }, [selectedScenarioId]);

  // Tunable configuration state
  const [topology, setTopology] = useState<CacheTopology>(
    currentScenario.goldenConfig.topology
  );
  const [readStrategy, setReadStrategy] = useState<CacheReadStrategy>(
    currentScenario.goldenConfig.readStrategy
  );
  const [writeStrategy, setWriteStrategy] = useState<CacheWriteStrategy>(
    currentScenario.goldenConfig.writeStrategy
  );
  const [evictionPolicy, setEvictionPolicy] = useState<EvictionPolicy>(
    currentScenario.goldenConfig.evictionPolicy
  );
  const [stampedeProtection, setStampedeProtection] = useState<StampedeProtection>(
    currentScenario.goldenConfig.stampedeProtection
  );
  const [memoryLimitMb, setMemoryLimitMb] = useState<number>(
    currentScenario.goldenConfig.memoryLimitMb
  );
  const [baseTtlSeconds, setBaseTtlSeconds] = useState<number>(
    currentScenario.goldenConfig.baseTtlSeconds
  );
  const [jitterPercent, setJitterPercent] = useState<number>(
    currentScenario.goldenConfig.jitterPercent
  );
  const [trafficRps, setTrafficRps] = useState<number>(
    currentScenario.trafficPattern.rps
  );

  // Result state
  const [simulationResult, setSimulationResult] =
    useState<CacheSimulationResult | null>(null);

  // Socratic guidance hints
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1);

  // Load saved state or set unoptimized defaults on scenario change
  useEffect(() => {
    const saved = loadSavedCacheLabRecords();
    const existing = saved.find((r) => r.scenarioId === currentScenario.id);

    if (existing) {
      setTopology(existing.config.topology);
      setReadStrategy(existing.config.readStrategy);
      setWriteStrategy(existing.config.writeStrategy);
      setEvictionPolicy(existing.config.evictionPolicy);
      setStampedeProtection(existing.config.stampedeProtection);
      setMemoryLimitMb(existing.config.memoryLimitMb);
      setBaseTtlSeconds(existing.config.baseTtlSeconds);
      setJitterPercent(existing.config.jitterPercent);
      setTrafficRps(existing.config.trafficRps);
      setSimulationResult(existing.result);
    } else {
      // Default to an educational unoptimized state
      setTopology('DISTRIBUTED_CLUSTERED');
      setReadStrategy('CACHE_ASIDE');
      setWriteStrategy('WRITE_THROUGH');
      setEvictionPolicy('FIFO');
      setStampedeProtection('NONE');
      setMemoryLimitMb(Math.max(64, Math.round(currentScenario.goldenConfig.memoryLimitMb / 2)));
      setBaseTtlSeconds(currentScenario.goldenConfig.baseTtlSeconds);
      setJitterPercent(0);
      setTrafficRps(currentScenario.trafficPattern.rps);
      setSimulationResult(null);
    }

    setRevealedHintIndex(-1);
    setActiveTab('tuning');
  }, [currentScenario]);

  // Execute simulation
  const handleRunSimulation = () => {
    const config: CacheSimulationConfig = {
      scenarioId: currentScenario.id,
      topology,
      readStrategy,
      writeStrategy,
      evictionPolicy,
      stampedeProtection,
      memoryLimitMb,
      baseTtlSeconds,
      jitterPercent,
      trafficRps,
    };

    const res = simulateCacheExperiment(currentScenario, config);
    setSimulationResult(res);

    saveCacheLabRecord({
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
    setTopology(golden.topology);
    setReadStrategy(golden.readStrategy);
    setWriteStrategy(golden.writeStrategy);
    setEvictionPolicy(golden.evictionPolicy);
    setStampedeProtection(golden.stampedeProtection);
    setMemoryLimitMb(golden.memoryLimitMb);
    setBaseTtlSeconds(golden.baseTtlSeconds);
    setJitterPercent(golden.jitterPercent);
    setTrafficRps(golden.trafficRps);
  };

  // Export handlers
  const handleExportPdf = () => {
    if (!simulationResult) return;
    const config: CacheSimulationConfig = {
      scenarioId: currentScenario.id,
      topology,
      readStrategy,
      writeStrategy,
      evictionPolicy,
      stampedeProtection,
      memoryLimitMb,
      baseTtlSeconds,
      jitterPercent,
      trafficRps,
    };
    exportCacheLabPdf(currentScenario, config, simulationResult);
  };

  const handleExportMarkdown = () => {
    if (!simulationResult) return;
    const config: CacheSimulationConfig = {
      scenarioId: currentScenario.id,
      topology,
      readStrategy,
      writeStrategy,
      evictionPolicy,
      stampedeProtection,
      memoryLimitMb,
      baseTtlSeconds,
      jitterPercent,
      trafficRps,
    };
    const md = generateCacheLabMarkdown(currentScenario, config, simulationResult);
    downloadFile(
      `cache-lab-${currentScenario.id}-report.md`,
      md,
      'text/markdown;charset=utf-8'
    );
  };

  const currentConfig: CacheSimulationConfig = {
    scenarioId: currentScenario.id,
    topology,
    readStrategy,
    writeStrategy,
    evictionPolicy,
    stampedeProtection,
    memoryLimitMb,
    baseTtlSeconds,
    jitterPercent,
    trafficRps,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              Distributed Caching & Invalidation Lab
            </h1>
            <Badge variant="primary">Industrial Sim</Badge>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Simulate high-throughput caching topologies, eliminate thundering herd stampedes, and tune memory eviction under real traffic loads.
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
            {CACHE_SCENARIOS.map((s) => (
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
              Target SLA: <strong className="text-primary-700">&le; {currentScenario.targetSlaMs} ms</strong>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-1">{currentScenario.description}</p>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 p-3 rounded-md border border-border">
            <div>
              <span className="text-text-muted block">Traffic Load:</span>
              <strong className="text-text font-semibold">
                {currentScenario.trafficPattern.rps.toLocaleString()} req/sec
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Read / Write Ratio:</span>
              <strong className="text-text font-semibold">
                {Math.round(currentScenario.trafficPattern.readRatio * 100)}% R /{' '}
                {Math.round(currentScenario.trafficPattern.writeRatio * 100)}% W
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Key Space Cardinality:</span>
              <strong className="text-text font-semibold">
                {currentScenario.trafficPattern.keyCardinality.toLocaleString()} keys
              </strong>
            </div>
            <div>
              <span className="text-text-muted block">Average Item Size:</span>
              <strong className="text-text font-semibold">
                {currentScenario.trafficPattern.avgItemSizeBytes.toLocaleString()} bytes
              </strong>
            </div>
          </div>

          <div className="bg-error-50/50 border border-error-200 p-3 rounded-md text-xs text-error-800">
            <strong className="font-semibold block mb-0.5">Known Vulnerability / Anti-Pattern:</strong>
            {currentScenario.antiPatternSummary}
          </div>

          {/* Socratic Hints Drawer */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text">Socratic Progressive Guidance:</span>
              {revealedHintIndex < currentScenario.socraticHints.length - 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary-700"
                  onClick={() => setRevealedHintIndex((prev) => prev + 1)}
                >
                  Reveal Hint {revealedHintIndex + 2} of {currentScenario.socraticHints.length}
                </Button>
              ) : (
                <span className="text-xs text-text-muted italic">All hints revealed</span>
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
          onClick={() => setActiveTab('tuning')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'tuning'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          1. Topology & Tuning Console
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'telemetry'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          2. Live Telemetry & Metrics
        </button>
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'scorecard'
              ? 'border-primary-600 text-primary-700'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          3. Performance Scorecard & Blueprint
        </button>
      </div>

      {/* TAB 1: TUNING CONSOLE */}
      {activeTab === 'tuning' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topologies & Strategies */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-text">
                  Topology & Caching Pattern
                </CardTitle>
                <p className="text-xs text-text-muted mt-1">
                  Configure system layout and read/write consistency mechanisms.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Cache Topology
                  </label>
                  <select
                    value={topology}
                    onChange={(e) => setTopology(e.target.value as CacheTopology)}
                    className="w-full text-xs bg-canvas border border-border rounded p-2 focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="LOCAL_IN_MEMORY">Local Process Memory (Sub-0.1ms, Single Instance)</option>
                    <option value="DISTRIBUTED_CLUSTERED">Distributed Clustered Cache (~1.2ms, Sharded Hash)</option>
                    <option value="MULTI_TIER_TWO_LEVEL">Multi-Tier Two-Level (L1 Local In-Memory + L2 Clustered)</option>
                    <option value="EDGE_CDN">Edge CDN (~0.8ms, Global Edge PoPs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Read Strategy
                  </label>
                  <select
                    value={readStrategy}
                    onChange={(e) => setReadStrategy(e.target.value as CacheReadStrategy)}
                    className="w-full text-xs bg-canvas border border-border rounded p-2 focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="CACHE_ASIDE">Cache-Aside (Lazy Loading on Miss)</option>
                    <option value="READ_THROUGH">Read-Through (Transparent Cache Loader)</option>
                    <option value="REFRESH_AHEAD">Refresh-Ahead (Proactive Pre-Expiry Fetching)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Write Strategy
                  </label>
                  <select
                    value={writeStrategy}
                    onChange={(e) => setWriteStrategy(e.target.value as CacheWriteStrategy)}
                    className="w-full text-xs bg-canvas border border-border rounded p-2 focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="WRITE_THROUGH">Write-Through (Synchronous Cache + DB Write)</option>
                    <option value="WRITE_BEHIND">Write-Behind / Write-Back (Async Batched Write Buffer)</option>
                    <option value="WRITE_AROUND">Write-Around (Write Directly to DB, Invalidate Cache)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Eviction & Stampede Protection */}
            <Card className="bg-surface border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-text">
                  Resilience & Invalidation Policies
                </CardTitle>
                <p className="text-xs text-text-muted mt-1">
                  Govern key lifecycle, memory limits, and thundering herd mitigation.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Eviction Policy (Under Memory Contention)
                  </label>
                  <select
                    value={evictionPolicy}
                    onChange={(e) => setEvictionPolicy(e.target.value as EvictionPolicy)}
                    className="w-full text-xs bg-canvas border border-border rounded p-2 focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="LRU">LRU (Least Recently Used - Optimal for Recency Bias)</option>
                    <option value="LFU">LFU (Least Frequently Used - Optimal for Long-Term Hot Keys)</option>
                    <option value="FIFO">FIFO (First-In First-Out - Queue Based)</option>
                    <option value="RANDOM">Random Eviction (Zero Overhead, High Churn)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Cache Stampede / Thundering Herd Defense
                  </label>
                  <select
                    value={stampedeProtection}
                    onChange={(e) => setStampedeProtection(e.target.value as StampedeProtection)}
                    className="w-full text-xs bg-canvas border border-border rounded p-2 focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="NONE">None (Unprotected - High Thundering Herd Risk)</option>
                    <option value="MUTEX_LOCK">Distributed Mutex / Single-Flight Lock</option>
                    <option value="PROBABILISTIC_XFETCH">Probabilistic Early Expiration (Optimal XFetch)</option>
                    <option value="STALE_WHILE_REVALIDATE">Stale-While-Revalidate (SWR Immediate Return)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      Base TTL (seconds): <span className="font-bold text-primary-700">{baseTtlSeconds}s</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="1800"
                      step="5"
                      value={baseTtlSeconds}
                      onChange={(e) => setBaseTtlSeconds(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-text block mb-1">
                      TTL Jitter: <span className="font-bold text-primary-700">&plusmn;{jitterPercent}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={jitterPercent}
                      onChange={(e) => setJitterPercent(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Traffic Load & Memory Sizing */}
          <Card className="bg-surface border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-text">
                Runtime Traffic Load & Resource Allocation
              </CardTitle>
              <p className="text-xs text-text-muted mt-1">
                Stress-test the configured cache topology under production load.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-text">
                      Simulated Traffic Load:
                    </label>
                    <span className="text-xs font-bold text-primary-700">
                      {trafficRps.toLocaleString()} requests/sec
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={trafficRps}
                    onChange={(e) => setTrafficRps(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-[11px] text-text-muted block mt-1">
                    Benchmark injects {trafficRps.toLocaleString()} requests across the key space.
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-text">
                      Memory Allocation Limit:
                    </label>
                    <span className="text-xs font-bold text-primary-700">
                      {memoryLimitMb.toLocaleString()} MB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="64"
                    max="4096"
                    step="64"
                    value={memoryLimitMb}
                    onChange={(e) => setMemoryLimitMb(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-[11px] text-text-muted block mt-1">
                    Working set for this scenario is ~
                    {(
                      (currentScenario.trafficPattern.keyCardinality *
                        currentScenario.trafficPattern.avgItemSizeBytes) /
                      (1024 * 1024)
                    ).toFixed(1)}{' '}
                    MB.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <Button variant="secondary" size="sm" onClick={handleApplyGolden}>
                  Apply Golden Reference Architecture
                </Button>
                <Button variant="primary" onClick={handleRunSimulation}>
                  Run 10,000 Request Benchmark Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: LIVE TELEMETRY */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {!simulationResult ? (
            <div className="text-center py-12 bg-surface rounded-lg border border-border">
              <p className="text-sm font-medium text-text-muted mb-4">
                No simulation data yet for this session.
              </p>
              <Button variant="primary" onClick={handleRunSimulation}>
                Execute Benchmark Simulation
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alert for Stampedes / OOM */}
              {simulationResult.stampedeSpikeCount > 0 && (
                <div className="bg-error-50 border border-error-300 p-4 rounded-md text-xs text-error-800 flex items-start gap-3">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <strong className="font-semibold block">
                      Thundering Herd Stampede Detected! ({simulationResult.stampedeSpikeCount} Spikes)
                    </strong>
                    When keys expired without a Mutex or XFetch early refresh, thousands of concurrent requests missed the cache simultaneously and hammered the database.
                  </div>
                </div>
              )}

              {simulationResult.isOomViolated && (
                <div className="bg-error-50 border border-error-300 p-4 rounded-md text-xs text-error-800 flex items-start gap-3">
                  <span className="text-lg">🛑</span>
                  <div>
                    <strong className="font-semibold block">
                      Out of Memory (OOM) Violation!
                    </strong>
                    The working set ({simulationResult.workingSetMb} MB) exceeded 150% of the allocated memory budget ({memoryLimitMb} MB), causing node restarts and cache thrashing.
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-surface border-border">
                  <CardHeader className="pb-2">
                    <span className="text-xs text-text-muted font-medium">Cache Hit Rate</span>
                    <CardTitle className="text-2xl font-bold text-text">
                      {simulationResult.hitRatePercent}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-text-muted">
                    {simulationResult.hitRatePercent >= 95 ? (
                      <span className="text-success-700 font-semibold">Optimal Hit Efficiency</span>
                    ) : (
                      <span className="text-warning-700 font-semibold">Elevated Miss Rate</span>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-surface border-border">
                  <CardHeader className="pb-2">
                    <span className="text-xs text-text-muted font-medium">Average Latency</span>
                    <CardTitle className="text-2xl font-bold text-text">
                      {simulationResult.avgLatencyMs} ms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-text-muted">
                    SLA Target: &le; {currentScenario.targetSlaMs} ms (
                    {simulationResult.avgLatencyMs <= currentScenario.targetSlaMs ? (
                      <span className="text-success-700 font-semibold">Passed</span>
                    ) : (
                      <span className="text-error-700 font-semibold">SLA Breach</span>
                    )}
                    )
                  </CardContent>
                </Card>

                <Card className="bg-surface border-border">
                  <CardHeader className="pb-2">
                    <span className="text-xs text-text-muted font-medium">Tail Latency (P99)</span>
                    <CardTitle className="text-2xl font-bold text-text">
                      {simulationResult.p99LatencyMs} ms
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-text-muted">
                    {simulationResult.stampedeSpikeCount === 0 ? (
                      <span className="text-success-700 font-semibold">Smooth Distribution</span>
                    ) : (
                      <span className="text-error-700 font-semibold">Degraded by Stampedes</span>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-surface border-border">
                  <CardHeader className="pb-2">
                    <span className="text-xs text-text-muted font-medium">Database Offload</span>
                    <CardTitle className="text-2xl font-bold text-text">
                      {simulationResult.dbLoadReductionPercent}%
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-text-muted">
                    DB Reads: {simulationResult.dbReadIops.toLocaleString()} IOPS
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Breakdown Card */}
              <Card className="bg-surface border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-text">
                    Database & Memory Stress Telemetry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Hit Rate Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-text">Cache Hit Ratio</span>
                      <span className="font-bold text-primary-700">{simulationResult.hitRatePercent}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-primary-600 h-full transition-all duration-500"
                        style={{ width: `${simulationResult.hitRatePercent}%` }}
                      />
                      <div
                        className="bg-error-500 h-full transition-all duration-500"
                        style={{ width: `${100 - simulationResult.hitRatePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Memory Usage Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-text">
                        Memory Consumption ({simulationResult.memoryUsageMb} MB / {memoryLimitMb} MB)
                      </span>
                      <span className="font-bold text-primary-700">{simulationResult.memoryUsagePercent}%</span>
                    </div>
                    <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          simulationResult.isOomViolated
                            ? 'bg-error-600'
                            : simulationResult.memoryUsagePercent > 85
                              ? 'bg-warning-500'
                              : 'bg-success-600'
                        }`}
                        style={{ width: `${Math.min(100, simulationResult.memoryUsagePercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 p-3 rounded border border-border">
                    <div>
                      <span className="text-text-muted block">DB Read IOPS:</span>
                      <strong className="text-text">{simulationResult.dbReadIops.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted block">DB Write IOPS:</span>
                      <strong className="text-text">{simulationResult.dbWriteIops.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-text-muted block">Data Freshness:</span>
                      <strong className="text-text">{simulationResult.dataFreshnessPercent}%</strong>
                    </div>
                    <div>
                      <span className="text-text-muted block">Thundering Spikes:</span>
                      <strong className="text-text">{simulationResult.stampedeSpikeCount}</strong>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" size="sm" onClick={() => setActiveTab('tuning')}>
                      Adjust Parameters
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
                    Tested Architecture vs. Golden Reference
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
                          <td className="py-2 px-3 font-medium text-text">Topology</td>
                          <td className="py-2 px-3 text-text-muted font-mono">{currentConfig.topology}</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.topology}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.topology === currentScenario.goldenConfig.topology ? (
                              <span className="text-success-700 font-bold">&check; Match</span>
                            ) : (
                              <span className="text-warning-700 font-medium">Sub-optimal</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">Read Strategy</td>
                          <td className="py-2 px-3 text-text-muted font-mono">{currentConfig.readStrategy}</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.readStrategy}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.readStrategy === currentScenario.goldenConfig.readStrategy ? (
                              <span className="text-success-700 font-bold">&check; Match</span>
                            ) : (
                              <span className="text-warning-700 font-medium">Sub-optimal</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">Write Strategy</td>
                          <td className="py-2 px-3 text-text-muted font-mono">{currentConfig.writeStrategy}</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.writeStrategy}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.writeStrategy === currentScenario.goldenConfig.writeStrategy ? (
                              <span className="text-success-700 font-bold">&check; Match</span>
                            ) : (
                              <span className="text-warning-700 font-medium">Sub-optimal</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">Eviction Policy</td>
                          <td className="py-2 px-3 text-text-muted font-mono">{currentConfig.evictionPolicy}</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.evictionPolicy}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.evictionPolicy === currentScenario.goldenConfig.evictionPolicy ? (
                              <span className="text-success-700 font-bold">&check; Match</span>
                            ) : (
                              <span className="text-warning-700 font-medium">Sub-optimal</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">Stampede Defense</td>
                          <td className="py-2 px-3 text-text-muted font-mono">{currentConfig.stampedeProtection}</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            {currentScenario.goldenConfig.stampedeProtection}
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.stampedeProtection === currentScenario.goldenConfig.stampedeProtection ? (
                              <span className="text-success-700 font-bold">&check; Match</span>
                            ) : (
                              <span className="text-error-700 font-bold">&cross; Bottleneck</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 font-medium text-text">TTL Jitter</td>
                          <td className="py-2 px-3 text-text-muted font-mono">&plusmn;{currentConfig.jitterPercent}%</td>
                          <td className="py-2 px-3 text-primary-700 font-mono font-semibold">
                            &plusmn;{currentScenario.goldenConfig.jitterPercent}%
                          </td>
                          <td className="py-2 px-3">
                            {currentConfig.jitterPercent >= currentScenario.goldenConfig.jitterPercent ? (
                              <span className="text-success-700 font-bold">&check; Desynchronized</span>
                            ) : (
                              <span className="text-warning-700 font-medium">Wave Risk</span>
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
                    <span className="font-semibold">Ready to test the optimal setup?</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        handleApplyGolden();
                        setActiveTab('tuning');
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
