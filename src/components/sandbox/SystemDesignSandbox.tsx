'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Scale,
  Cpu,
  Zap,
  Radio,
  Database,
  Server,
  AlertTriangle,
  Layers,
  Flame,
  Lightbulb,
  Network,
  Puzzle,
  ShieldCheck,
  Sliders,
} from 'lucide-react';

type FailurePreset = 'NONE' | 'CACHE_STAMPEDE' | 'SYNC_RPC_CASCADE' | 'OPTIMAL_RESILIENT';
type ShardingStrategy = 'UNIFORM_HASH' | 'RANGE_HOTSPOT' | 'CELEBRITY_HOTSPOT' | 'SALTED_COMPOSITE';

export function SystemDesignSandbox() {
  // Simulator State
  const [trafficQps, setTrafficQps] = useState<number>(25000);
  const [readPercent, setReadPercent] = useState<number>(85);
  const [cacheHitRate, setCacheHitRate] = useState<number>(85);
  const [serviceInstances, setServiceInstances] = useState<number>(4);
  const [readReplicas, setReadReplicas] = useState<number>(2);
  const [asyncQueueEnabled, setAsyncQueueEnabled] = useState<boolean>(true);
  const [activePreset, setActivePreset] = useState<FailurePreset>('NONE');

  // Sharding Analyzer State
  const [shardingStrategy, setShardingStrategy] = useState<ShardingStrategy>('UNIFORM_HASH');

  // Real-time Calculated Architecture Metrics
  const metrics = useMemo(() => {
    const totalQps = trafficQps;
    const writePercent = 100 - readPercent;
    const readQps = Math.round(totalQps * (readPercent / 100));
    const writeQps = Math.round(totalQps * (writePercent / 100));

    // Cache Tier Calculations
    const cacheHitQps = Math.round(readQps * (cacheHitRate / 100));
    const cacheMissQps = readQps - cacheHitQps;

    // Database Tier Calculations
    const dbReadQps = cacheMissQps;
    const readLoadPerReplica = readReplicas > 0 ? Math.round(dbReadQps / readReplicas) : dbReadQps;
    const primaryWriteLoad = writeQps;
    const primaryTotalLoad = readReplicas === 0 ? primaryWriteLoad + dbReadQps : primaryWriteLoad;

    // Microservice Fleet Utilization
    const fleetCapacity = serviceInstances * 12500; // ~12,500 QPS max per production multi-core container
    const serviceCpuUtil = Math.min(100, Math.round((totalQps / fleetCapacity) * 100));

    // Database Primary IOPS Utilization (Max ~9,000 IOPS capacity)
    const primaryDbCapacity = 9000;
    const primaryDbUtil = Math.min(100, Math.round((primaryTotalLoad / primaryDbCapacity) * 100));

    // Latency Modeling
    const baseCacheLatency = 1.5; // ms
    const baseDbReadLatency = 14; // ms
    const dbSaturationMultiplier = primaryDbUtil > 70 ? Math.pow(primaryDbUtil / 70, 2.2) : 1;
    const effectiveDbReadLatency = Math.round(baseDbReadLatency * dbSaturationMultiplier);

    const effectiveWriteLatency = asyncQueueEnabled
      ? 4 // Instant 4ms queue ack
      : Math.round(22 * dbSaturationMultiplier); // Synchronous disk commit

    const weightedReadLatency = (cacheHitRate / 100) * baseCacheLatency + (1 - cacheHitRate / 100) * effectiveDbReadLatency;
    const cpuLatencyPenalty = serviceCpuUtil > 80 ? (serviceCpuUtil - 80) * 3.5 : 0;

    const p50Latency = Math.round((readPercent / 100) * weightedReadLatency + (writePercent / 100) * effectiveWriteLatency + cpuLatencyPenalty);
    const p99Multiplier = primaryDbUtil > 85 || serviceCpuUtil > 85 ? 5.8 : 3.2;
    const p99Latency = Math.round(p50Latency * p99Multiplier + (primaryDbUtil > 90 ? (primaryDbUtil - 90) * 45 : 0));

    // Error Rate / Dropped Requests (%)
    let errorRate = 0;
    if (serviceCpuUtil >= 95) {
      errorRate += Math.round((serviceCpuUtil - 92) * 3);
    }
    if (primaryDbUtil >= 95) {
      errorRate += Math.round((primaryDbUtil - 92) * 3.5);
    }
    errorRate = Math.min(65, errorRate);

    // System Health Status
    let status: 'OPTIMAL' | 'STRESSED' | 'OUTAGE' = 'OPTIMAL';
    if (errorRate > 5 || p99Latency > 900 || serviceCpuUtil >= 98 || primaryDbUtil >= 98) {
      status = 'OUTAGE';
    } else if (serviceCpuUtil > 75 || primaryDbUtil > 75 || p99Latency > 220) {
      status = 'STRESSED';
    }

    return {
      totalQps,
      readQps,
      writeQps,
      cacheHitQps,
      cacheMissQps,
      primaryTotalLoad,
      readLoadPerReplica,
      serviceCpuUtil,
      primaryDbUtil,
      p50Latency,
      p99Latency,
      errorRate,
      status,
    };
  }, [trafficQps, readPercent, cacheHitRate, serviceInstances, readReplicas, asyncQueueEnabled]);

  // Failure Mode Preset Handler
  const applyPreset = (preset: FailurePreset) => {
    setActivePreset(preset);
    if (preset === 'CACHE_STAMPEDE') {
      setTrafficQps(55000);
      setReadPercent(95);
      setCacheHitRate(0); // 100% cache miss stampede
      setServiceInstances(4);
      setReadReplicas(0); // No read replicas to absorb reads
      setAsyncQueueEnabled(false);
    } else if (preset === 'SYNC_RPC_CASCADE') {
      setTrafficQps(75000);
      setReadPercent(40);
      setCacheHitRate(80);
      setServiceInstances(2); // Under-provisioned app fleet
      setReadReplicas(1);
      setAsyncQueueEnabled(false); // Synchronous blocking RPC
    } else if (preset === 'OPTIMAL_RESILIENT') {
      setTrafficQps(45000);
      setReadPercent(85);
      setCacheHitRate(92);
      setServiceInstances(6);
      setReadReplicas(3);
      setAsyncQueueEnabled(true);
    }
  };

  // Sharding Distribution Data
  const shardingData = useMemo(() => {
    switch (shardingStrategy) {
      case 'UNIFORM_HASH':
        return [
          { shard: 'Shard 0', range: 'hash: 0x00..0x3F', count: 25120, pct: 25.1, isHotspot: false },
          { shard: 'Shard 1', range: 'hash: 0x40..0x7F', count: 24890, pct: 24.9, isHotspot: false },
          { shard: 'Shard 2', range: 'hash: 0x80..0xBF', count: 25040, pct: 25.0, isHotspot: false },
          { shard: 'Shard 3', range: 'hash: 0xC0..0xFF', count: 24950, pct: 25.0, isHotspot: false },
        ];
      case 'RANGE_HOTSPOT':
        return [
          { shard: 'Shard 0', range: 'created_at: Q1', count: 7200, pct: 7.2, isHotspot: false },
          { shard: 'Shard 1', range: 'created_at: Q2', count: 11400, pct: 11.4, isHotspot: false },
          { shard: 'Shard 2', range: 'created_at: Q3', count: 18400, pct: 18.4, isHotspot: false },
          { shard: 'Shard 3', range: 'created_at: Current Q4', count: 63000, pct: 63.0, isHotspot: true },
        ];
      case 'CELEBRITY_HOTSPOT':
        return [
          { shard: 'Shard 0', range: 'tenant_id: 1..250', count: 6500, pct: 6.5, isHotspot: false },
          { shard: 'Shard 1', range: 'tenant_id: 251..500 (VIP)', count: 82400, pct: 82.4, isHotspot: true },
          { shard: 'Shard 2', range: 'tenant_id: 501..750', count: 5800, pct: 5.8, isHotspot: false },
          { shard: 'Shard 3', range: 'tenant_id: 751..1000', count: 5300, pct: 5.3, isHotspot: false },
        ];
      case 'SALTED_COMPOSITE':
        return [
          { shard: 'Shard 0', range: 'tenant_id#salt0', count: 24700, pct: 24.7, isHotspot: false },
          { shard: 'Shard 1', range: 'tenant_id#salt1', count: 25800, pct: 25.8, isHotspot: false },
          { shard: 'Shard 2', range: 'tenant_id#salt2', count: 24900, pct: 24.9, isHotspot: false },
          { shard: 'Shard 3', range: 'tenant_id#salt3', count: 24600, pct: 24.6, isHotspot: false },
        ];
    }
  }, [shardingStrategy]);

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                Studio Lab 7
              </span>
              <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
                High-Level Distributed System Design
              </span>
            </div>
            <h2 className="text-xl font-bold text-text mt-1">
              System Design Architecture Studio &amp; Traffic Bottleneck Simulator
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Simulate high-concurrency request propagation across Load Balancers, API Gateways, Microservices,
              In-Memory Distributed Caches, Asynchronous Message Queues, and Sharded Relational Databases.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-text-muted mr-1">Failure Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('CACHE_STAMPEDE')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activePreset === 'CACHE_STAMPEDE'
                  ? 'bg-rose-50 text-rose-800 border-rose-400 font-bold'
                  : 'bg-canvas text-text hover:bg-surface-hover border-border'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Cache Stampede</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('SYNC_RPC_CASCADE')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activePreset === 'SYNC_RPC_CASCADE'
                  ? 'bg-amber-50 text-amber-800 border-amber-400 font-bold'
                  : 'bg-canvas text-text hover:bg-surface-hover border-border'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Cascading RPC Lock</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('OPTIMAL_RESILIENT')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                activePreset === 'OPTIMAL_RESILIENT'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold'
                  : 'bg-canvas text-text hover:bg-surface-hover border-border'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Resilient Scaled</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Real-Time Health & KPI Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-surface border border-border rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Total Ingress</div>
          <div className="text-lg font-bold text-text">
            {metrics.totalQps.toLocaleString()} <span className="text-xs font-normal text-text-muted">QPS</span>
          </div>
          <div className="text-[11px] text-text-muted">
            {metrics.readQps.toLocaleString()} read / {metrics.writeQps.toLocaleString()} write
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">p50 Latency</div>
          <div className="text-lg font-bold text-text">
            {metrics.p50Latency} <span className="text-xs font-normal text-text-muted">ms</span>
          </div>
          <div className="text-[11px] text-text-muted">Target: &lt; 25 ms</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">p99 Tail Latency</div>
          <div className={`text-lg font-bold ${metrics.p99Latency > 300 ? 'text-rose-600' : 'text-text'}`}>
            {metrics.p99Latency} <span className="text-xs font-normal text-text-muted">ms</span>
          </div>
          <div className="text-[11px] text-text-muted">SLA Limit: &lt; 200 ms</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">App Fleet CPU</div>
          <div className={`text-lg font-bold ${metrics.serviceCpuUtil > 85 ? 'text-rose-600' : 'text-text'}`}>
            {metrics.serviceCpuUtil}%
          </div>
          <div className="text-[11px] text-text-muted">{serviceInstances} instance(s)</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Primary DB IOPS</div>
          <div className={`text-lg font-bold ${metrics.primaryDbUtil > 85 ? 'text-rose-600' : 'text-text'}`}>
            {metrics.primaryDbUtil}%
          </div>
          <div className="text-[11px] text-text-muted">{metrics.primaryTotalLoad.toLocaleString()} QPS load</div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-3.5 space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Cluster Status</div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                metrics.status === 'OPTIMAL'
                  ? 'bg-emerald-500 animate-pulse'
                  : metrics.status === 'STRESSED'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-rose-500 animate-ping'
              }`}
            />
            <span
              className={`text-xs font-bold ${
                metrics.status === 'OPTIMAL'
                  ? 'text-emerald-700'
                  : metrics.status === 'STRESSED'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {metrics.status}
            </span>
          </div>
          <div className="text-[11px] text-text-muted">
            {metrics.errorRate > 0 ? `${metrics.errorRate}% Dropped (504/429)` : '0% Error Rate'}
          </div>
        </div>
      </div>

      {/* Module 1: Architecture Topology & Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-surface border border-border rounded-xl p-5 space-y-5">
          <h3 className="text-sm font-bold text-text flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary-600 shrink-0" />
            <span>Capacity &amp; Scaling Parameters</span>
          </h3>

          {/* Traffic Ingress Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-text">Ingress Traffic Volume:</span>
              <span className="font-bold text-primary-700">{trafficQps.toLocaleString()} QPS</span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={trafficQps}
              onChange={(e) => {
                setActivePreset('NONE');
                setTrafficQps(Number(e.target.value));
              }}
              className="w-full accent-primary-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>1k (Idle)</span>
              <span>50k (Peak)</span>
              <span>100k (Surge)</span>
            </div>
          </div>

          {/* Read vs Write Ratio Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-text">Traffic Ratio (Read / Write):</span>
              <span className="font-bold text-primary-700">{readPercent}% / {100 - readPercent}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={readPercent}
              onChange={(e) => {
                setActivePreset('NONE');
                setReadPercent(Number(e.target.value));
              }}
              className="w-full accent-primary-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>Write-heavy (10/90)</span>
              <span>Balanced (50/50)</span>
              <span>Read-heavy (95/5)</span>
            </div>
          </div>

          {/* Cache Hit Ratio Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-text">Distributed Cache Hit Ratio (η):</span>
              <span className={`font-bold ${cacheHitRate < 50 ? 'text-rose-600' : 'text-primary-700'}`}>
                {cacheHitRate}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="98"
              step="2"
              value={cacheHitRate}
              onChange={(e) => {
                setActivePreset('NONE');
                setCacheHitRate(Number(e.target.value));
              }}
              className="w-full accent-primary-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted">
              <span>0% (Cold / Down)</span>
              <span>80% (Average)</span>
              <span>98% (Hot L1/L2)</span>
            </div>
          </div>

          {/* Microservice Instances */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-text">Microservice Fleet Instances:</span>
              <span className="font-bold text-primary-700">{serviceInstances} Nodes</span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 4, 6, 8].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setActivePreset('NONE');
                    setServiceInstances(count);
                  }}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                    serviceInstances === count
                      ? 'bg-primary-700 text-white border-primary-700'
                      : 'bg-canvas text-text border-border hover:bg-surface-hover'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* DB Read Replicas */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-text">Database Read Replicas:</span>
              <span className="font-bold text-primary-700">{readReplicas} Replicas</span>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setActivePreset('NONE');
                    setReadReplicas(count);
                  }}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                    readReplicas === count
                      ? 'bg-primary-700 text-white border-primary-700'
                      : 'bg-canvas text-text border-border hover:bg-surface-hover'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Write Pipeline Paradigm */}
          <div className="space-y-1.5 pt-1 border-t border-border">
            <span className="text-xs font-semibold text-text block">Write Persistence Pipeline:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActivePreset('NONE');
                  setAsyncQueueEnabled(false);
                }}
                className={`p-2 text-left rounded-lg border transition-colors cursor-pointer ${
                  !asyncQueueEnabled
                    ? 'bg-amber-50 border-amber-400 text-amber-900'
                    : 'bg-canvas border-border text-text-muted hover:text-text'
                }`}
              >
                <div className="text-xs font-bold">Synchronous RPC</div>
                <div className="text-[10px] mt-0.5">Direct blocking write to database disk</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActivePreset('NONE');
                  setAsyncQueueEnabled(true);
                }}
                className={`p-2 text-left rounded-lg border transition-colors cursor-pointer ${
                  asyncQueueEnabled
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                    : 'bg-canvas border-border text-text-muted hover:text-text'
                }`}
              >
                <div className="text-xs font-bold">Async Message Queue</div>
                <div className="text-[10px] mt-0.5">Partitioned topic buffer + consumer workers</div>
              </button>
            </div>
          </div>
        </div>

        {/* Live Topology Canvas */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Network className="w-4 h-4 text-primary-600 shrink-0" />
              <span>Distributed Architecture Request Propagation Topology</span>
            </h3>
            <span className="text-xs font-mono text-text-muted">
              Little&apos;s Law: L = λ · W
            </span>
          </div>

          {/* Topology Node Map */}
          <div className="space-y-4 py-2">
            {/* Row 1: Ingress Edge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-canvas border border-border rounded-lg p-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <span>Client Ingress Tier</span>
                  </span>
                  <span className="text-[10px] font-mono bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded">DNS / CDN</span>
                </div>
                <div className="text-xs text-text-muted mt-1">
                  Ingress Rate: <strong className="text-text">{trafficQps.toLocaleString()} QPS</strong>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mt-2">
                  <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="bg-canvas border border-border rounded-lg p-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Layer-7 Load Balancer</span>
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Least Connections</span>
                </div>
                <div className="text-xs text-text-muted mt-1">
                  Dispatched per Node: <strong className="text-text">{Math.round(trafficQps / serviceInstances).toLocaleString()} QPS</strong>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mt-2">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Row 2: Microservice Fleet */}
            <div className="bg-canvas border border-border rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <span>Application Microservice Cluster</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  metrics.serviceCpuUtil > 85 ? 'bg-rose-100 text-rose-800' : 'bg-primary-100 text-primary-800'
                }`}>
                  Fleet CPU: {metrics.serviceCpuUtil}%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {Array.from({ length: serviceInstances }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded border text-center transition-all ${
                      metrics.serviceCpuUtil > 85
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : metrics.serviceCpuUtil > 70
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'bg-surface border-border text-text'
                    }`}
                  >
                    <div className="text-[11px] font-mono font-bold">Pod #{idx + 1}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      {Math.round(trafficQps / serviceInstances).toLocaleString()} req/s
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3: Cache and Queue Decoupling Layer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Distributed Cache */}
              <div className="bg-canvas border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Distributed Cache (In-Memory)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">Cache-Aside</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-700 font-semibold">Hits: {metrics.cacheHitQps.toLocaleString()} QPS (1.5ms)</span>
                  <span className="text-rose-700 font-semibold">Misses: {metrics.cacheMissQps.toLocaleString()} QPS</span>
                </div>
                <div className="w-full bg-border rounded-full h-2 overflow-hidden flex">
                  <div className="bg-emerald-500 h-2" style={{ width: `${cacheHitRate}%` }} />
                  <div className="bg-rose-400 h-2" style={{ width: `${100 - cacheHitRate}%` }} />
                </div>
              </div>

              {/* Message Broker / Async Queue */}
              <div className="bg-canvas border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Message Broker / Write Queue</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    asyncQueueEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {asyncQueueEnabled ? 'Buffered (Decoupled)' : 'Bypassed (Direct)'}
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  {asyncQueueEnabled ? (
                    <span>Buffer Depth: <strong className="text-emerald-700">0 ms latency spike</strong> (Lag: 24 msgs)</span>
                  ) : (
                    <span className="text-rose-600 font-semibold">Synchronous I/O: blocking callers during DB commits</span>
                  )}
                </div>
                <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 transition-all ${asyncQueueEnabled ? 'bg-emerald-500 w-1/4' : 'bg-rose-500 w-full'}`}
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Database Storage Cluster */}
            <div className="bg-canvas border border-border rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <span>Relational Database Cluster (Primary &amp; Replicas)</span>
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  metrics.primaryDbUtil > 85 ? 'bg-rose-100 text-rose-800' : 'bg-primary-100 text-primary-800'
                }`}>
                  Primary IOPS: {metrics.primaryDbUtil}%
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                {/* Primary */}
                <div className={`p-2 rounded border col-span-1 sm:col-span-1 ${
                  metrics.primaryDbUtil > 85
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-surface border-border text-text'
                }`}>
                  <div className="text-[11px] font-mono font-bold flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Server className="w-3 h-3 text-primary-600 shrink-0" />
                      <span>Primary DB</span>
                    </span>
                    <span className="text-[9px] bg-primary-100 text-primary-800 px-1 rounded">R/W</span>
                  </div>
                  <div className="text-[10px] text-text-muted mt-1">
                    Load: <strong>{metrics.primaryTotalLoad.toLocaleString()} QPS</strong>
                  </div>
                </div>

                {/* Replicas */}
                {readReplicas === 0 ? (
                  <div className="col-span-1 sm:col-span-3 p-2 rounded border border-dashed border-amber-300 bg-amber-50/50 flex items-center justify-center text-xs text-amber-800 gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Zero Read Replicas configured: 100% of cache misses hit the primary database!</span>
                  </div>
                ) : (
                  Array.from({ length: readReplicas }).map((_, idx) => (
                    <div key={idx} className="p-2 rounded border bg-surface border-border text-text">
                      <div className="text-[11px] font-mono font-bold flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Read Replica #{idx + 1}</span>
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">RO</span>
                      </div>
                      <div className="text-[10px] text-text-muted mt-1">
                        Load: <strong>{metrics.readLoadPerReplica.toLocaleString()} QPS</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Diagnostic Failure Analysis Box */}
          <div className={`p-3 rounded-lg border text-xs ${
            metrics.status === 'OUTAGE'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : metrics.status === 'STRESSED'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}>
            <div className="font-bold mb-0.5">
              {metrics.status === 'OUTAGE'
                ? 'CRITICAL SYSTEM BOTTLE-NECK DETECTED'
                : metrics.status === 'STRESSED'
                ? 'SYSTEM DEGRADED UNDER HEAVY LOAD'
                : 'SYSTEM OPERATING WITHIN PRODUCTION SLA'}
            </div>
            {metrics.status === 'OUTAGE' ? (
              <p>
                Database connection pools and CPU saturation exceeded 95%. Little&apos;s Law latency amplification
                caused p99 latency to reach {metrics.p99Latency}ms. Upstream API Gateways are dropping {metrics.errorRate}% of
                requests with HTTP 504 Gateway Timeout. Remediate by scaling read replicas or increasing cache hit ratio.
              </p>
            ) : metrics.status === 'STRESSED' ? (
              <p>
                Tail latency has increased to {metrics.p99Latency}ms due to queue delays. One or more components
                are operating above 75% capacity. Consider scaling out worker pods or enabling async message queuing.
              </p>
            ) : (
              <p>
                All tiers balanced. Cache hit ratio ({cacheHitRate}%) shields storage layer from {metrics.cacheHitQps.toLocaleString()} QPS.
                p50 latency is {metrics.p50Latency}ms and p99 is {metrics.p99Latency}ms with 0% dropped transactions.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Module 2: Database Sharding & Partition Key Distribution Analyzer */}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-base font-bold text-text flex items-center gap-2">
              <Puzzle className="w-4 h-4 text-primary-600 shrink-0" />
              <span>Database Sharding &amp; Partition Key Distribution Analyzer</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Analyze how partition keys distribute 100,000 writes across physical database shards.
              Observe hot-key bottlenecks and remediate with composite salting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-text-muted mr-1">Sharding Strategy:</span>
            {[
              { id: 'UNIFORM_HASH', label: 'Uniform Hash (MD5 % 4)' },
              { id: 'RANGE_HOTSPOT', label: 'Range-Based (Timestamp)' },
              { id: 'CELEBRITY_HOTSPOT', label: 'Celebrity Key Trap' },
              { id: 'SALTED_COMPOSITE', label: 'Salted Composite Key' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setShardingStrategy(st.id as ShardingStrategy)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors cursor-pointer ${
                  shardingStrategy === st.id
                    ? 'bg-primary-700 text-white border-primary-700 font-bold'
                    : 'bg-canvas text-text hover:bg-surface-hover border-border'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shard Load Distribution Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {shardingData.map((shard) => (
            <div
              key={shard.shard}
              className={`p-4 rounded-xl border transition-all ${
                shard.isHotspot
                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
                  : 'bg-canvas border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text">{shard.shard}</span>
                {shard.isHotspot ? (
                  <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded animate-pulse flex items-center gap-1">
                    <Flame className="w-3 h-3 text-rose-600 shrink-0" />
                    <span>HOTSPOT</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Healthy
                  </span>
                )}
              </div>

              <div className="text-[11px] font-mono text-text-muted mt-1 truncate">
                {shard.range}
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xl font-bold text-text">{shard.count.toLocaleString()}</span>
                <span className={`text-xs font-bold ${shard.isHotspot ? 'text-rose-700' : 'text-text-muted'}`}>
                  {shard.pct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-border rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    shard.isHotspot
                      ? 'bg-rose-600'
                      : shard.pct > 30
                      ? 'bg-amber-500'
                      : 'bg-primary-600'
                  }`}
                  style={{ width: `${Math.min(100, (shard.count / 85000) * 100)}%` }}
                />
              </div>

              <div className="text-[10px] text-text-muted mt-1.5 flex justify-between">
                <span>IOPS Cap: 40k</span>
                <span className={shard.count > 40000 ? 'text-rose-600 font-bold flex items-center gap-1' : ''}>
                  {shard.count > 40000 ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>OVER CAPACITY</span>
                    </>
                  ) : 'OK'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Sharding Strategy Pedagogical Callout */}
        <div className="bg-canvas border border-border rounded-lg p-4 text-xs text-text space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-text">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Architectural Trade-off Analysis:</span>
          </div>
          {shardingStrategy === 'UNIFORM_HASH' && (
            <p className="text-text-muted leading-relaxed">
              <strong>Uniform Hash Partitioning:</strong> By computing <code className="bg-surface px-1 py-0.5 rounded border border-border">hash(entity_id) % num_shards</code>,
              writes and reads distribute with near-zero variance ($\sigma \approx 82$ across 100k records).
              <strong>Trade-off:</strong> Range queries (<code className="bg-surface px-1 py-0.5 rounded border border-border">WHERE age BETWEEN 20 AND 30</code>) require a
              scatter-gather fan-out across all 4 shards, increasing network overhead.
            </p>
          )}
          {shardingStrategy === 'RANGE_HOTSPOT' && (
            <p className="text-rose-900 leading-relaxed">
              <strong>Range-Based Partitioning Hotspot:</strong> When sharding by monotonically increasing timestamps (<code className="bg-surface px-1 py-0.5 rounded border border-border">created_at</code>),
              all contemporary incoming writes route exclusively to the current time partition (Shard 3 receiving 63% of load).
              <strong>Failure Mode:</strong> Shard 3 exhausts write IOPS and disk bandwidth while historical shards (0, 1, 2) sit idle.
            </p>
          )}
          {shardingStrategy === 'CELEBRITY_HOTSPOT' && (
            <p className="text-rose-900 leading-relaxed">
              <strong>The Celebrity / Heavy-Hitter Key Problem:</strong> Even under hash partitioning, if an individual tenant (e.g. an account with 10M followers)
              generates 82% of all platform activity, hashing on <code className="bg-surface px-1 py-0.5 rounded border border-border">tenant_id</code> channels all that traffic
              to Shard 1.
              <strong>Remediation:</strong> Do not partition solely on tenant ID for power users; implement key salting or dedicated VIP tables.
            </p>
          )}
          {shardingStrategy === 'SALTED_COMPOSITE' && (
            <p className="text-emerald-900 leading-relaxed">
              <strong>Salted Composite Partitioning:</strong> For hot entities, append a pseudo-random salt suffix:
              <code className="bg-surface px-1 py-0.5 rounded border border-border">partition_key = tenant_id + &apos;#&apos; + random(0, 3)</code>.
              Writes are uniformly fanned across all 4 shards (24.7% to 25.8%). Reads query all 4 shards in parallel and merge results in the API gateway.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
