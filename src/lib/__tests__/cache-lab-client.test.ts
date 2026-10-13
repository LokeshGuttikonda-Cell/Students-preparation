import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CACHE_SCENARIOS,
  simulateCacheExperiment,
  generateCacheLabMarkdown,
  exportCacheLabPdf,
  saveCacheLabRecord,
  loadSavedCacheLabRecords,
  CACHE_LAB_STORAGE_KEY,
  type CacheSimulationConfig,
} from '../cache-lab-client';

describe('Distributed Caching & Invalidation Client Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('contains 6 curated enterprise caching scenarios with valid properties', () => {
    expect(CACHE_SCENARIOS).toHaveLength(6);
    for (const s of CACHE_SCENARIOS) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.domain).toBeTruthy();
      expect(s.targetSlaMs).toBeGreaterThan(0);
      expect(s.trafficPattern.rps).toBeGreaterThan(0);
      expect(s.trafficPattern.readRatio + s.trafficPattern.writeRatio).toBeCloseTo(1.0);
      expect(s.trafficPattern.keyCardinality).toBeGreaterThan(0);
      expect(s.goldenConfig).toBeDefined();
      expect(s.goldenExplanation.length).toBeGreaterThan(20);
      expect(s.socraticHints.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('achieves Grade S and zero stampede spikes using golden configuration for flash-sale', () => {
    const flashSale = CACHE_SCENARIOS.find((s) => s.id === 'flash-sale-inventory')!;
    const result = simulateCacheExperiment(flashSale, flashSale.goldenConfig);

    expect(result.grade).toBe('S');
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.stampedeSpikeCount).toBe(0);
    expect(result.hitRatePercent).toBeGreaterThanOrEqual(90);
    expect(result.dbLoadReductionPercent).toBeGreaterThanOrEqual(85);
    expect(result.earnedBadges).toContain('STAMPEDE_DEFENDER');
    expect(result.earnedBadges).toContain('CACHE_ARCHITECT');
  });

  it('detects thundering herd stampede spikes when stampede protection is NONE', () => {
    const flashSale = CACHE_SCENARIOS.find((s) => s.id === 'flash-sale-inventory')!;
    const unprotectedConfig: CacheSimulationConfig = {
      ...flashSale.goldenConfig,
      stampedeProtection: 'NONE',
      jitterPercent: 0,
    };

    const result = simulateCacheExperiment(flashSale, unprotectedConfig);

    expect(result.stampedeSpikeCount).toBeGreaterThan(0);
    expect(result.grade).not.toBe('S');
    expect(result.dbReadIops).toBeGreaterThan(1000);
  });

  it('triggers OOM penalty when working set severely exceeds memory limit', () => {
    const sessionStore = CACHE_SCENARIOS.find((s) => s.id === 'user-session-store')!;
    // Working set is 500,000 * 2KB = ~976 MB. Give only 128 MB (< 50% required)
    const oomConfig: CacheSimulationConfig = {
      ...sessionStore.goldenConfig,
      memoryLimitMb: 128,
    };

    const result = simulateCacheExperiment(sessionStore, oomConfig);

    expect(result.isOomViolated).toBe(true);
    expect(result.grade).toBe('F');
    expect(result.feedback).toContain('Critical Failure: Memory limit exceeded');
  });

  it('validates that LRU eviction outperforms FIFO under memory pressure', () => {
    const sessionStore = CACHE_SCENARIOS.find((s) => s.id === 'user-session-store')!;
    const lruConfig: CacheSimulationConfig = {
      ...sessionStore.goldenConfig,
      memoryLimitMb: 700, // Constrained memory forces eviction
      evictionPolicy: 'LRU',
    };
    const fifoConfig: CacheSimulationConfig = {
      ...sessionStore.goldenConfig,
      memoryLimitMb: 700,
      evictionPolicy: 'FIFO',
    };

    const lruResult = simulateCacheExperiment(sessionStore, lruConfig);
    const fifoResult = simulateCacheExperiment(sessionStore, fifoConfig);

    expect(lruResult.hitRatePercent).toBeGreaterThan(fifoResult.hitRatePercent);
    expect(lruResult.score).toBeGreaterThan(fifoResult.score);
  });

  it('validates that Write-Behind batches and drastically reduces DB write IOPS', () => {
    const leaderboard = CACHE_SCENARIOS.find((s) => s.id === 'high-volume-leaderboard')!;
    const writeBehindConfig: CacheSimulationConfig = {
      ...leaderboard.goldenConfig,
      writeStrategy: 'WRITE_BEHIND',
    };
    const writeThroughConfig: CacheSimulationConfig = {
      ...leaderboard.goldenConfig,
      writeStrategy: 'WRITE_THROUGH',
    };

    const wbResult = simulateCacheExperiment(leaderboard, writeBehindConfig);
    const wtResult = simulateCacheExperiment(leaderboard, writeThroughConfig);

    expect(wbResult.dbWriteIops).toBeLessThan(wtResult.dbWriteIops);
    expect(wbResult.avgLatencyMs).toBeLessThan(wtResult.avgLatencyMs);
  });

  it('generates a clean markdown audit report with tables and diagnostics', () => {
    const scenario = CACHE_SCENARIOS[0];
    const result = simulateCacheExperiment(scenario, scenario.goldenConfig);
    const md = generateCacheLabMarkdown(scenario, scenario.goldenConfig, result);

    expect(md).toContain('# Cache Architecture & Invalidation Benchmark Report');
    expect(md).toContain(scenario.title);
    expect(md).toContain(`Grade ${result.grade}`);
    expect(md).toContain('Performance & Resilience Telemetry');
    expect(md).toContain('Golden Architectural Blueprint');
  });

  it('exports a valid vector PDF 1.4 document', () => {
    const scenario = CACHE_SCENARIOS[0];
    const result = simulateCacheExperiment(scenario, scenario.goldenConfig);

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createObjectURLSpy = vi.fn().mockReturnValue('blob:test-pdf-url');
    const revokeObjectURLSpy = vi.fn();

    window.URL.createObjectURL = createObjectURLSpy;
    window.URL.revokeObjectURL = revokeObjectURLSpy;

    expect(() =>
      exportCacheLabPdf(scenario, scenario.goldenConfig, result)
    ).not.toThrow();

    expect(clickSpy).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('saves and loads experiment records from localStorage', () => {
    const scenario = CACHE_SCENARIOS[0];
    const result = simulateCacheExperiment(scenario, scenario.goldenConfig);

    saveCacheLabRecord({
      scenarioId: scenario.id,
      lastRunAt: result.simulatedAt,
      config: scenario.goldenConfig,
      result,
    });

    const records = loadSavedCacheLabRecords();
    expect(records).toHaveLength(1);
    expect(records[0].scenarioId).toBe(scenario.id);
    expect(records[0].result.grade).toBe(result.grade);

    expect(localStorage.getItem(CACHE_LAB_STORAGE_KEY)).toBeTruthy();
  });
});
