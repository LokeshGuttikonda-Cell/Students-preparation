import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RATE_LIMITER_SCENARIOS,
  simulateRateLimiterExperiment,
  generateRateLimiterMarkdown,
  exportRateLimiterPdf,
  saveRateLimiterRecord,
  loadSavedRateLimiterRecords,
  RATE_LIMITER_STORAGE_KEY,
  type RateLimiterConfig,
} from '../rate-limiter-client';

describe('Distributed Rate Limiting, Throttling & Token Bucket Client Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('contains 6 curated enterprise rate limiting scenarios with valid properties', () => {
    expect(RATE_LIMITER_SCENARIOS).toHaveLength(6);
    for (const s of RATE_LIMITER_SCENARIOS) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.domain).toBeTruthy();
      expect(s.trafficProfile.totalRequests).toBeGreaterThan(0);
      expect(s.trafficProfile.burstMultiplier).toBeGreaterThan(0);
      expect(s.trafficProfile.clientCount).toBeGreaterThan(0);
      expect(s.goldenConfig).toBeDefined();
      expect(s.goldenExplanation.length).toBeGreaterThan(20);
      expect(s.socraticHints.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('achieves Grade S and smooth boundary penetration on public search scenario with golden config', () => {
    const searchScenario = RATE_LIMITER_SCENARIOS.find((s) => s.id === 'public-search-api-burst')!;
    const result = simulateRateLimiterExperiment(searchScenario.goldenConfig, searchScenario);

    expect(result.grade).toBe('S');
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.boundaryBurstPenetrationPercent).toBeLessThanOrEqual(102.0);
    expect(result.earnedBadges).toContain('RATE_LIMIT_ARCHITECT');
    expect(result.earnedBadges).toContain('SLIDING_WINDOW_MASTER');
  });

  it('detects boundary burst vulnerability (>150%) under Fixed Window Counter during boundary burst traffic', () => {
    const searchScenario = RATE_LIMITER_SCENARIOS.find((s) => s.id === 'public-search-api-burst')!;
    const fixedWindowConfig: RateLimiterConfig = {
      ...searchScenario.goldenConfig,
      algorithm: 'FIXED_WINDOW_COUNTER',
      trafficDistribution: 'BURST_AT_BOUNDARY',
    };

    const result = simulateRateLimiterExperiment(fixedWindowConfig, searchScenario);

    expect(result.boundaryBurstPenetrationPercent).toBeGreaterThan(150.0);
    expect(result.grade).not.toBe('S');
    expect(result.feedback).toContain('CRITICAL VULNERABILITY');
  });

  it('validates memory footprint tradeoff: Sliding Window Log O(N) vs Token Bucket O(1)', () => {
    const searchScenario = RATE_LIMITER_SCENARIOS.find((s) => s.id === 'public-search-api-burst')!;

    const tokenBucketResult = simulateRateLimiterExperiment(
      {
        ...searchScenario.goldenConfig,
        algorithm: 'TOKEN_BUCKET',
      },
      searchScenario
    );

    const logResult = simulateRateLimiterExperiment(
      {
        ...searchScenario.goldenConfig,
        algorithm: 'SLIDING_WINDOW_LOG',
      },
      searchScenario
    );

    expect(tokenBucketResult.memoryUsagePerClientBytes).toBe(16);
    expect(logResult.memoryUsagePerClientBytes).toBeGreaterThanOrEqual(64);
    expect(logResult.memoryUsagePer100kClientsMb).toBeGreaterThan(tokenBucketResult.memoryUsagePer100kClientsMb);
  });

  it('validates Leaky Bucket constant output smoothing on third-party telecom SMS scenario', () => {
    const smsScenario = RATE_LIMITER_SCENARIOS.find((s) => s.id === 'third-party-sms-dispatcher')!;
    const goldenResult = simulateRateLimiterExperiment(smsScenario.goldenConfig, smsScenario);

    expect(goldenResult.grade).toBe('S');
    expect(goldenResult.score).toBeGreaterThanOrEqual(90);
    expect(goldenResult.feedback).toContain('Leaky Bucket ensures flat, constant-rate dispatch');

    // Token bucket burst violates carrier TPS
    const burstTokenConfig: RateLimiterConfig = {
      ...smsScenario.goldenConfig,
      algorithm: 'TOKEN_BUCKET',
    };
    const tokenResult = simulateRateLimiterExperiment(burstTokenConfig, smsScenario);
    expect(tokenResult.grade).not.toBe('S');
    expect(tokenResult.feedback).toContain('Burst-capable algorithm violated carrier TPS caps');
  });

  it('validates multi-tenant SaaS noisy neighbor isolation and Jain Fairness Index', () => {
    const saasScenario = RATE_LIMITER_SCENARIOS.find((s) => s.id === 'multi-tenant-saas-api')!;
    const goldenResult = simulateRateLimiterExperiment(saasScenario.goldenConfig, saasScenario);

    expect(goldenResult.grade).toBe('S');
    expect(goldenResult.fairnessIndex).toBeGreaterThanOrEqual(0.85);
    expect(goldenResult.earnedBadges).toContain('NOISY_NEIGHBOR_DEFENDER');

    // Free tier without isolation starves
    const unpartitionedConfig: RateLimiterConfig = {
      ...saasScenario.goldenConfig,
      tenantTier: 'FREE',
      trafficDistribution: 'NOISY_NEIGHBOR_ATTACK',
    };
    const unfairResult = simulateRateLimiterExperiment(unpartitionedConfig, saasScenario);
    expect(unfairResult.fairnessIndex).toBeLessThan(0.6);
  });

  it('generates simulated HTTP response headers matching IETF rate limiting conventions', () => {
    const scenario = RATE_LIMITER_SCENARIOS[0];
    const result = simulateRateLimiterExperiment(scenario.goldenConfig, scenario);

    expect(result.simulatedHeaders.limit).toBe(scenario.goldenConfig.rateLimitPerWindow);
    expect(result.simulatedHeaders.remaining).toBeGreaterThanOrEqual(0);
    expect(result.simulatedHeaders.resetSeconds).toBeGreaterThan(0);
    expect(result.simulatedHeaders.policy).toContain('w=');
  });

  it('generates a clean markdown assessment report', () => {
    const scenario = RATE_LIMITER_SCENARIOS[0];
    const result = simulateRateLimiterExperiment(scenario.goldenConfig, scenario);
    const md = generateRateLimiterMarkdown(scenario, scenario.goldenConfig, result);

    expect(md).toContain('# Distributed Rate Limiting & Throttling Assessment Report');
    expect(md).toContain(scenario.title);
    expect(md).toContain('X-RateLimit-Limit');
    expect(md).toContain('Golden Reference Architecture');
  });

  it('exports valid PDF 1.4 byte stream without external dependencies', () => {
    const scenario = RATE_LIMITER_SCENARIOS[0];
    const result = simulateRateLimiterExperiment(scenario.goldenConfig, scenario);

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createObjectURLSpy = vi.fn().mockReturnValue('blob:test-rate-limiter-pdf-url');
    const revokeObjectURLSpy = vi.fn();

    window.URL.createObjectURL = createObjectURLSpy;
    window.URL.revokeObjectURL = revokeObjectURLSpy;

    expect(() => exportRateLimiterPdf(scenario, scenario.goldenConfig, result)).not.toThrow();

    expect(clickSpy).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('persists and retrieves simulation records via localStorage', () => {
    const scenario = RATE_LIMITER_SCENARIOS[1];
    const result = simulateRateLimiterExperiment(scenario.goldenConfig, scenario);

    saveRateLimiterRecord({
      scenarioId: scenario.id,
      config: scenario.goldenConfig,
      result,
      timestamp: new Date().toISOString(),
    });

    const records = loadSavedRateLimiterRecords();
    expect(records).toHaveLength(1);
    expect(records[0].scenarioId).toBe(scenario.id);
    expect(records[0].result.grade).toBe(result.grade);

    expect(localStorage.getItem(RATE_LIMITER_STORAGE_KEY)).toBeTruthy();
  });
});
