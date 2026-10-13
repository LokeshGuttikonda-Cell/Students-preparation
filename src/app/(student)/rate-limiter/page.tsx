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
  RATE_LIMITER_SCENARIOS,
  simulateRateLimiterExperiment,
  generateRateLimiterMarkdown,
  exportRateLimiterPdf,
  downloadFile,
  loadSavedRateLimiterRecords,
  saveRateLimiterRecord,
  type RateLimiterScenario,
  type RateLimiterConfig,
  type RateLimiterResult,
  type RateLimitAlgorithm,
  type SyncArchitecture,
  type TenantTier,
  type TrafficDistribution,
} from '../../../lib/rate-limiter-client';

export default function RateLimiterPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    RATE_LIMITER_SCENARIOS[0].id
  );
  const [activeTab, setActiveTab] = useState<'console' | 'telemetry' | 'scorecard'>('console');

  // Current Scenario
  const currentScenario = useMemo<RateLimiterScenario>(() => {
    return (
      RATE_LIMITER_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
      RATE_LIMITER_SCENARIOS[0]
    );
  }, [selectedScenarioId]);

  // Tunable configuration state
  const [algorithm, setAlgorithm] = useState<RateLimitAlgorithm>(
    currentScenario.goldenConfig.algorithm
  );
  const [syncArchitecture, setSyncArchitecture] = useState<SyncArchitecture>(
    currentScenario.goldenConfig.syncArchitecture
  );
  const [rateLimitPerWindow, setRateLimitPerWindow] = useState<number>(
    currentScenario.goldenConfig.rateLimitPerWindow
  );
  const [windowSeconds, setWindowSeconds] = useState<number>(
    currentScenario.goldenConfig.windowSeconds
  );
  const [burstCapacity, setBurstCapacity] = useState<number>(
    currentScenario.goldenConfig.burstCapacity
  );
  const [tenantTier, setTenantTier] = useState<TenantTier>(
    currentScenario.goldenConfig.tenantTier
  );
  const [gatewayNodeCount, setGatewayNodeCount] = useState<number>(
    currentScenario.goldenConfig.gatewayNodeCount
  );
  const [trafficDistribution, setTrafficDistribution] = useState<TrafficDistribution>(
    currentScenario.goldenConfig.trafficDistribution
  );
  const [hasDeductionLocking, setHasDeductionLocking] = useState<boolean>(
    currentScenario.goldenConfig.hasDeductionLocking
  );

  // Simulation result state
  const [simulationResult, setSimulationResult] = useState<RateLimiterResult | null>(null);

  // Socratic guidance hints
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1);

  // Load saved state or set default on scenario change
  useEffect(() => {
    const saved = loadSavedRateLimiterRecords();
    const existing = saved.find((r) => r.scenarioId === currentScenario.id);

    if (existing) {
      setAlgorithm(existing.config.algorithm);
      setSyncArchitecture(existing.config.syncArchitecture);
      setRateLimitPerWindow(existing.config.rateLimitPerWindow);
      setWindowSeconds(existing.config.windowSeconds);
      setBurstCapacity(existing.config.burstCapacity);
      setTenantTier(existing.config.tenantTier);
      setGatewayNodeCount(existing.config.gatewayNodeCount);
      setTrafficDistribution(existing.config.trafficDistribution);
      setHasDeductionLocking(existing.config.hasDeductionLocking);
      setSimulationResult(existing.result);
    } else {
      // Default to slightly sub-optimal or naive configuration so students learn by optimizing
      setAlgorithm(
        currentScenario.id === 'public-search-api-burst'
          ? 'FIXED_WINDOW_COUNTER'
          : currentScenario.goldenConfig.algorithm
      );
      setSyncArchitecture(
        currentScenario.id === 'payment-checkout-gateway'
          ? 'LOCAL_IN_MEMORY'
          : currentScenario.goldenConfig.syncArchitecture
      );
      setRateLimitPerWindow(currentScenario.goldenConfig.rateLimitPerWindow);
      setWindowSeconds(currentScenario.goldenConfig.windowSeconds);
      setBurstCapacity(currentScenario.goldenConfig.burstCapacity);
      setTenantTier(currentScenario.goldenConfig.tenantTier);
      setGatewayNodeCount(currentScenario.goldenConfig.gatewayNodeCount);
      setTrafficDistribution(currentScenario.goldenConfig.trafficDistribution);
      setHasDeductionLocking(false);
      setSimulationResult(null);
    }
    setRevealedHintIndex(-1);
  }, [currentScenario]);

  // Run simulation handler
  const handleRunSimulation = () => {
    const currentConfig: RateLimiterConfig = {
      scenarioId: currentScenario.id,
      algorithm,
      syncArchitecture,
      rateLimitPerWindow,
      windowSeconds,
      burstCapacity,
      tenantTier,
      gatewayNodeCount,
      trafficDistribution,
      hasDeductionLocking,
    };

    const result = simulateRateLimiterExperiment(currentConfig, currentScenario);
    setSimulationResult(result);

    saveRateLimiterRecord({
      scenarioId: currentScenario.id,
      config: currentConfig,
      result,
      timestamp: new Date().toISOString(),
    });

    setActiveTab('telemetry');
  };

  // Apply Golden Architecture
  const handleApplyGolden = () => {
    const g = currentScenario.goldenConfig;
    setAlgorithm(g.algorithm);
    setSyncArchitecture(g.syncArchitecture);
    setRateLimitPerWindow(g.rateLimitPerWindow);
    setWindowSeconds(g.windowSeconds);
    setBurstCapacity(g.burstCapacity);
    setTenantTier(g.tenantTier);
    setGatewayNodeCount(g.gatewayNodeCount);
    setTrafficDistribution(g.trafficDistribution);
    setHasDeductionLocking(g.hasDeductionLocking);

    const result = simulateRateLimiterExperiment(g, currentScenario);
    setSimulationResult(result);

    saveRateLimiterRecord({
      scenarioId: currentScenario.id,
      config: g,
      result,
      timestamp: new Date().toISOString(),
    });

    setActiveTab('scorecard');
  };

  const handleExportPdf = () => {
    if (!simulationResult) return;
    const currentConfig: RateLimiterConfig = {
      scenarioId: currentScenario.id,
      algorithm,
      syncArchitecture,
      rateLimitPerWindow,
      windowSeconds,
      burstCapacity,
      tenantTier,
      gatewayNodeCount,
      trafficDistribution,
      hasDeductionLocking,
    };
    exportRateLimiterPdf(currentScenario, currentConfig, simulationResult);
  };

  const handleExportMarkdown = () => {
    if (!simulationResult) return;
    const currentConfig: RateLimiterConfig = {
      scenarioId: currentScenario.id,
      algorithm,
      syncArchitecture,
      rateLimitPerWindow,
      windowSeconds,
      burstCapacity,
      tenantTier,
      gatewayNodeCount,
      trafficDistribution,
      hasDeductionLocking,
    };
    const md = generateRateLimiterMarkdown(currentScenario, currentConfig, simulationResult);
    downloadFile(`rate-limiter-${currentScenario.id}-report.md`, md, 'text/markdown');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900/40 via-cyan-900/30 to-blue-900/40 border border-teal-500/30 rounded-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" className="bg-teal-500/20 text-teal-300 border-teal-500/40 font-mono text-xs">
                SYSTEM DESIGN & DISTRIBUTED SYSTEMS
              </Badge>
              <Badge variant="neutral" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-mono text-xs">
                100% LOCAL COMPUTE ($0.00 SPEND)
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Distributed Rate Limiting & Throttling Studio
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Design, stress-test, and benchmark high-throughput API rate limiters and traffic-shaping algorithms.
              Master Token Bucket, Leaky Bucket, Sliding Window Log, and Sliding Window Counter against boundary burst
              spikes, noisy neighbor starvation, and multi-node cluster drift.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button
              variant="secondary"
              onClick={handleApplyGolden}
              className="border-teal-500/50 hover:bg-teal-500/20 text-teal-200"
            >
              Apply Golden Reference
            </Button>
            <Button
              variant="primary"
              onClick={handleRunSimulation}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold shadow-lg shadow-teal-900/50"
            >
              Run Rate Limit Simulation
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
          <span className="text-xs text-teal-400 font-mono">
            {RATE_LIMITER_SCENARIOS.length} Production Scenarios Available
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RATE_LIMITER_SCENARIOS.map((s) => {
            const isSelected = s.id === selectedScenarioId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedScenarioId(s.id)}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-teal-950/50 border-teal-400 ring-1 ring-teal-400 shadow-md shadow-teal-950/50'
                    : 'bg-card/40 border-border/60 hover:border-teal-500/40 hover:bg-card/70'
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
                  <span>Target Allow: &gt;{s.targetAllowedRatePercent}%</span>
                  <span>{s.trafficProfile.concurrencyRPS.toLocaleString()} RPS</span>
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
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <span>⚙️</span>
          <span>Algorithm &amp; Synchronization Console</span>
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'telemetry'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <span>📊</span>
          <span>Live Telemetry &amp; Burst Waterfall</span>
          {simulationResult && (
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                simulationResult.boundaryBurstPenetrationPercent <= 105
                  ? 'bg-teal-900 text-teal-300'
                  : 'bg-rose-900 text-rose-300'
              }`}
            >
              {simulationResult.boundaryBurstPenetrationPercent}% Burst
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'scorecard'
              ? 'border-teal-400 text-teal-300'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <span>🏆</span>
          <span>Scorecard &amp; Reference Blueprint</span>
          {simulationResult && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-teal-900 text-teal-300 font-bold">
              Grade {simulationResult.grade}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CONSOLE */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rate Limiting Algorithm Selection */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <span>🧮</span>
                <span>Rate Limiting Algorithm</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Algorithm Class</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'TOKEN_BUCKET',
                      label: 'Token Bucket',
                      desc: 'O(1) Memory | Bursts up to capacity, constant refill rate',
                    },
                    {
                      id: 'LEAKY_BUCKET',
                      label: 'Leaky Bucket',
                      desc: 'O(1) Memory | Constant output flow, strictly smooths bursts',
                    },
                    {
                      id: 'FIXED_WINDOW_COUNTER',
                      label: 'Fixed Window Counter',
                      desc: 'O(1) Memory | Vulnerable to 2x boundary spikes',
                    },
                    {
                      id: 'SLIDING_WINDOW_LOG',
                      label: 'Sliding Window Log',
                      desc: 'O(N) Memory | 100% exact timestamps, high memory overhead',
                    },
                    {
                      id: 'SLIDING_WINDOW_COUNTER',
                      label: 'Sliding Window Counter',
                      desc: 'O(1) Memory | Weighted boundary counter, eliminates spikes',
                    },
                  ].map((alg) => (
                    <button
                      key={alg.id}
                      onClick={() => setAlgorithm(alg.id as RateLimitAlgorithm)}
                      className={`p-3 rounded-lg text-left border transition-all text-xs ${
                        algorithm === alg.id
                          ? 'bg-teal-950/60 border-teal-400 text-white shadow-sm'
                          : 'bg-surface/50 border-border/60 text-gray-400 hover:border-teal-500/30 hover:text-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-white">{alg.label}</div>
                      <div className="text-[11px] text-gray-400 mt-1 leading-snug">{alg.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Quota & Burst */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>Rate Limit Quota (reqs / window)</span>
                    <span className="font-mono text-teal-400">{rateLimitPerWindow.toLocaleString()} reqs</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={10000}
                    step={50}
                    value={rateLimitPerWindow}
                    onChange={(e) => setRateLimitPerWindow(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>Window Duration (seconds)</span>
                    <span className="font-mono text-teal-400">{windowSeconds}s</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={120}
                    step={1}
                    value={windowSeconds}
                    onChange={(e) => setWindowSeconds(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>Burst Capacity (tokens / queue depth)</span>
                    <span className="font-mono text-teal-400">{burstCapacity.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={1000}
                    step={10}
                    value={burstCapacity}
                    onChange={(e) => setBurstCapacity(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distributed Synchronization & Traffic Controls */}
          <Card className="border-border/60 bg-card/60">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <span>🌐</span>
                <span>Distributed Synchronization &amp; Scale</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300">Synchronization Architecture</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      id: 'CENTRALIZED_DISTRIBUTED',
                      label: 'Centralized Distributed',
                      desc: 'Global in-memory cache cluster | Strong consistency, +1.8ms network hop',
                    },
                    {
                      id: 'LOCAL_IN_MEMORY',
                      label: 'Local In-Memory Slice',
                      desc: 'Zero network overhead (<0.05ms) | Prone to LB skew and burst leakage',
                    },
                    {
                      id: 'TWO_TIER_HIERARCHICAL',
                      label: 'Two-Tier Hierarchical',
                      desc: 'Local token leases + Central sync | Sub-0.2ms latency, bounded overage',
                    },
                    {
                      id: 'EDGE_GATEWAY',
                      label: 'Edge Gateway Intercept',
                      desc: 'CDN / Reverse Proxy POP | Drops DDoS at edge before origin ingress',
                    },
                  ].map((arch) => (
                    <button
                      key={arch.id}
                      onClick={() => setSyncArchitecture(arch.id as SyncArchitecture)}
                      className={`p-3 rounded-lg text-left border transition-all text-xs ${
                        syncArchitecture === arch.id
                          ? 'bg-teal-950/60 border-teal-400 text-white shadow-sm'
                          : 'bg-surface/50 border-border/60 text-gray-400 hover:border-teal-500/30 hover:text-gray-200'
                      }`}
                    >
                      <div className="font-semibold text-white">{arch.label}</div>
                      <div className="text-[11px] text-gray-400 mt-1 leading-snug">{arch.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Traffic Pattern & Tenant Tier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Traffic Distribution Pattern</label>
                  <select
                    value={trafficDistribution}
                    onChange={(e) => setTrafficDistribution(e.target.value as TrafficDistribution)}
                    className="w-full bg-surface/80 border border-border/60 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="UNIFORM_POISSON">Uniform Poisson Traffic</option>
                    <option value="BURST_AT_BOUNDARY">Boundary Burst Surge (00:59 - 01:01)</option>
                    <option value="NOISY_NEIGHBOR_ATTACK">Noisy Neighbor (85% Rogue Traffic)</option>
                    <option value="PERSISTENT_DDOS">Persistent High-Volume DDoS</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">Customer Tenant Tier</label>
                  <select
                    value={tenantTier}
                    onChange={(e) => setTenantTier(e.target.value as TenantTier)}
                    className="w-full bg-surface/80 border border-border/60 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="FREE">Free Tier (0.5x Standard Limit)</option>
                    <option value="PRO">Pro Tier (1.0x Standard Limit)</option>
                    <option value="ENTERPRISE">Enterprise Tier (2.0x Quota + Isolation)</option>
                  </select>
                </div>
              </div>

              {/* Node Count & Concurrency Check */}
              <div className="space-y-4 pt-2 border-t border-border/40">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                    <span>Gateway Cluster Nodes</span>
                    <span className="font-mono text-teal-400">{gatewayNodeCount} nodes</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={64}
                    step={1}
                    value={gatewayNodeCount}
                    onChange={(e) => setGatewayNodeCount(Number(e.target.value))}
                    className="w-full accent-teal-500"
                  />
                </div>

                <div className="flex items-center gap-3 bg-surface/40 p-3 rounded-lg border border-border/50">
                  <input
                    type="checkbox"
                    id="deductionLocking"
                    checked={hasDeductionLocking}
                    onChange={(e) => setHasDeductionLocking(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 accent-teal-500"
                  />
                  <label htmlFor="deductionLocking" className="text-xs text-gray-300 cursor-pointer">
                    <span className="font-semibold text-white">Atomic Deduction Scripting</span>
                    <span className="block text-gray-400 text-[11px]">
                      Execute token check and deduction via atomic in-store scripts to eliminate race conditions.
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: TELEMETRY & BURST WATERFALL */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {!simulationResult ? (
            <div className="text-center py-16 bg-card/40 rounded-xl border border-border/60 space-y-3">
              <span className="text-4xl">🚀</span>
              <h3 className="text-lg font-bold text-white">No Simulation Run Yet</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Configure your rate limiting algorithm parameters in the Console tab and click &quot;Run Rate Limit Simulation&quot;.
              </p>
              <Button variant="primary" onClick={handleRunSimulation} className="bg-teal-600 hover:bg-teal-500 text-white">
                Run Simulation Now
              </Button>
            </div>
          ) : (
            <>
              {/* Boundary Burst Alert Banner */}
              {simulationResult.boundaryBurstPenetrationPercent > 105 && (
                <div className="p-4 bg-rose-950/40 border border-rose-600/50 rounded-xl flex items-start gap-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">
                      Window Boundary Burst Penetration Detected ({simulationResult.boundaryBurstPenetrationPercent}%)
                    </h4>
                    <p className="text-xs text-rose-200 mt-1">
                      Fixed Window Reset allowed traffic to burst past the nominal limit during the window rollover
                      (00:59 - 01:01). Downstream services received up to 2x expected load. Switch to Sliding Window
                      Counter or Leaky Bucket to smooth boundary traffic.
                    </p>
                  </div>
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/60 bg-card/60">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-gray-400 font-medium">Request Throughput</span>
                    <div className="text-2xl font-black text-white font-mono">
                      {simulationResult.allowedRequests.toLocaleString()}
                      <span className="text-xs text-teal-400 ml-1.5 font-normal">
                        ({(100 - simulationResult.dropRatePercent).toFixed(1)}% OK)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Dropped: {simulationResult.droppedRequests.toLocaleString()} (429 Too Many)
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/60">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-gray-400 font-medium">Boundary Burst Penetration</span>
                    <div
                      className={`text-2xl font-black font-mono ${
                        simulationResult.boundaryBurstPenetrationPercent <= 105
                          ? 'text-teal-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {simulationResult.boundaryBurstPenetrationPercent}%
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Target: &lt;= 102% across rollover
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/60">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-gray-400 font-medium">Gateway Latency Overhead</span>
                    <div className="text-2xl font-black text-white font-mono">
                      {simulationResult.avgGatewayLatencyMs} ms
                    </div>
                    <p className="text-[11px] text-gray-400">
                      p99 Latency: {simulationResult.p99LatencyMs} ms
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/60">
                  <CardContent className="p-4 space-y-1">
                    <span className="text-xs text-gray-400 font-medium">Memory Footprint (100k Keys)</span>
                    <div className="text-2xl font-black text-cyan-300 font-mono">
                      {simulationResult.memoryUsagePer100kClientsMb} MB
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {simulationResult.memoryUsagePerClientBytes} bytes / tracked client
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* HTTP Response Headers Preview & Fairness Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Simulated HTTP Response Headers */}
                <Card className="border-border/60 bg-card/60">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>📋</span>
                        <span>Live Simulated HTTP Response Headers</span>
                      </span>
                      <span className="text-xs font-mono text-teal-400">IETF RFC 6585 &amp; Draft 7</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-canvas border border-border/80 rounded-xl p-4 font-mono text-xs text-teal-300 space-y-1.5 shadow-inner">
                      <div className="text-gray-400">
                        {simulationResult.droppedRequests > 0
                          ? 'HTTP/1.1 429 Too Many Requests'
                          : 'HTTP/1.1 200 OK'}
                      </div>
                      <div className="text-white">Content-Type: application/json</div>
                      <div>
                        <span className="text-cyan-400">X-RateLimit-Limit:</span>{' '}
                        {simulationResult.simulatedHeaders.limit}
                      </div>
                      <div>
                        <span className="text-cyan-400">X-RateLimit-Remaining:</span>{' '}
                        {simulationResult.simulatedHeaders.remaining}
                      </div>
                      <div>
                        <span className="text-cyan-400">X-RateLimit-Reset:</span>{' '}
                        {simulationResult.simulatedHeaders.resetSeconds}s
                      </div>
                      {simulationResult.simulatedHeaders.retryAfterSeconds && (
                        <div className="text-amber-400">
                          <span className="text-amber-400">Retry-After:</span>{' '}
                          {simulationResult.simulatedHeaders.retryAfterSeconds}s
                        </div>
                      )}
                      <div className="text-gray-400">
                        <span className="text-gray-300">RateLimit-Policy:</span> &quot;
                        {simulationResult.simulatedHeaders.policy}&quot;
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fairness & Cluster Integrity */}
                <Card className="border-border/60 bg-card/60">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>⚖️</span>
                      <span>Tenant Isolation &amp; Cluster Integrity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                        <span>Jain&apos;s Fairness Index (J)</span>
                        <span className="font-mono text-teal-400">{simulationResult.fairnessIndex}</span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/60">
                        <div
                          className={`h-full transition-all duration-300 ${
                            simulationResult.fairnessIndex >= 0.85 ? 'bg-teal-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, simulationResult.fairnessIndex * 100)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {simulationResult.fairnessIndex >= 0.85
                          ? 'High fairness: Tenant quotas effectively partitioned without starvation.'
                          : 'Poor fairness: Rogue or high-volume tenant is starving legitimate clients.'}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-gray-300 mb-1">
                        <span>Cluster Sync Skew</span>
                        <span className="font-mono text-teal-400">{simulationResult.clusterSyncSkewPercent}%</span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2 overflow-hidden border border-border/60">
                        <div
                          className={`h-full transition-all duration-300 ${
                            simulationResult.clusterSyncSkewPercent <= 5.0 ? 'bg-teal-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, simulationResult.clusterSyncSkewPercent * 2)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {simulationResult.clusterSyncSkewPercent <= 5.0
                          ? 'Consistent rate limit quotas across all gateway nodes.'
                          : 'Severe drift: Independent node counters allow clients to exceed quota.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                Run the simulation or apply the golden reference architecture to view your candidate scorecard.
              </p>
              <Button variant="primary" onClick={handleApplyGolden} className="bg-teal-600 hover:bg-teal-500 text-white">
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
                        ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-white ring-4 ring-cyan-400/40'
                        : simulationResult.grade === 'C'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white ring-4 ring-amber-500/40'
                        : 'bg-gradient-to-br from-rose-500 to-red-700 text-white ring-4 ring-rose-500/40'
                    }`}
                  >
                    {simulationResult.grade}
                  </div>
                  <div>
                    <span className="text-xs uppercase font-mono tracking-widest text-teal-400 font-bold">
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
                    className="text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold"
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
                      className="bg-teal-950/60 border-teal-500/40 text-teal-300 font-mono text-xs px-2.5 py-1"
                    >
                      🏆 {badge}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Feedback Callout */}
              <Card className="border-teal-500/30 bg-teal-950/20">
                <CardContent className="p-5 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400">
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
                          <td className="py-2.5 px-3 font-sans text-gray-300 font-semibold">Algorithm</td>
                          <td className="py-2.5 px-3 text-teal-300">{algorithm}</td>
                          <td className="py-2.5 px-3 text-white">{currentScenario.goldenConfig.algorithm}</td>
                          <td className="py-2.5 px-3">
                            {algorithm === currentScenario.goldenConfig.algorithm ? (
                              <span className="text-teal-400">MATCH ✅</span>
                            ) : (
                              <span className="text-amber-400">MISMATCH ⚠️</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-gray-300 font-semibold">Sync Architecture</td>
                          <td className="py-2.5 px-3 text-teal-300">{syncArchitecture}</td>
                          <td className="py-2.5 px-3 text-white">{currentScenario.goldenConfig.syncArchitecture}</td>
                          <td className="py-2.5 px-3">
                            {syncArchitecture === currentScenario.goldenConfig.syncArchitecture ? (
                              <span className="text-teal-400">MATCH ✅</span>
                            ) : (
                              <span className="text-amber-400">MISMATCH ⚠️</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-gray-300 font-semibold">Boundary Burst</td>
                          <td className="py-2.5 px-3 text-teal-300">{simulationResult.boundaryBurstPenetrationPercent}%</td>
                          <td className="py-2.5 px-3 text-white">&lt;= 102.0%</td>
                          <td className="py-2.5 px-3">
                            {simulationResult.boundaryBurstPenetrationPercent <= 105 ? (
                              <span className="text-teal-400">SMOOTH ✅</span>
                            ) : (
                              <span className="text-rose-400">PENETRATION 🚨</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-gray-300 font-semibold">Gateway Latency</td>
                          <td className="py-2.5 px-3 text-teal-300">{simulationResult.avgGatewayLatencyMs} ms</td>
                          <td className="py-2.5 px-3 text-white">&lt; 2.0 ms</td>
                          <td className="py-2.5 px-3">
                            {simulationResult.avgGatewayLatencyMs < 2.0 ? (
                              <span className="text-teal-400">ACCEPTABLE ✅</span>
                            ) : (
                              <span className="text-amber-400">HIGH ⚠️</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-sans text-gray-300 font-semibold">Memory (100k Keys)</td>
                          <td className="py-2.5 px-3 text-teal-300">{simulationResult.memoryUsagePer100kClientsMb} MB</td>
                          <td className="py-2.5 px-3 text-white">&lt; 50 MB</td>
                          <td className="py-2.5 px-3">
                            {simulationResult.memoryUsagePer100kClientsMb < 50 ? (
                              <span className="text-teal-400">EFFICIENT ✅</span>
                            ) : (
                              <span className="text-rose-400">HEAVY ⚠️</span>
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
                    <strong className="text-white">Why Sliding Window Counter Dominates Production:</strong> While Sliding
                    Window Log provides 100% exact boundary tracking, storing raw timestamps consumes $O(N)$ memory
                    per client key. Under a 100,000-client distributed botnet flood, this can crash cache servers.
                    Sliding Window Counter achieves $&lt; 0.05\%$ boundary variance while maintaining an immutable $O(1)$
                    memory footprint (approx. 24 bytes per client).
                  </p>
                  <p>
                    <strong className="text-white">Solving the Centralized Cache Latency Bottleneck:</strong> In deep
                    microservice call graphs, querying a centralized cache synchronously adds 1.8ms per RPC hop.
                    Engineering architectures solve this via <em>Two-Tier Token Leases</em>: local nodes reserve tranches
                    of 50-100 tokens asynchronously from the central cluster and evaluate rate checks against in-memory
                    CPU registers in sub-50 microseconds.
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
