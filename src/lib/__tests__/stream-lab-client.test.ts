import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STREAM_SCENARIOS,
  simulateStreamExperiment,
  generateStreamLabMarkdown,
  exportStreamLabPdf,
  saveStreamLabRecord,
  loadSavedStreamLabRecords,
  STREAM_LAB_STORAGE_KEY,
  type StreamSimulationConfig,
} from '../stream-lab-client';

describe('Event-Driven Message Streaming & Partitioning Client Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('contains 6 curated enterprise streaming scenarios with valid properties', () => {
    expect(STREAM_SCENARIOS).toHaveLength(6);
    for (const s of STREAM_SCENARIOS) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.domain).toBeTruthy();
      expect(s.targetLagThreshold).toBeGreaterThan(0);
      expect(s.trafficProfile.mps).toBeGreaterThan(0);
      expect(s.trafficProfile.avgPayloadBytes).toBeGreaterThan(0);
      expect(s.goldenConfig).toBeDefined();
      expect(s.goldenExplanation.length).toBeGreaterThan(20);
      expect(s.socraticHints.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('achieves Grade S and zero lag spikes using golden configuration for payment webhook pipeline', () => {
    const paymentScenario = STREAM_SCENARIOS.find((s) => s.id === 'payment-webhook-ingestion')!;
    const result = simulateStreamExperiment(paymentScenario, paymentScenario.goldenConfig);

    expect(result.grade).toBe('S');
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.maxConsumerLag).toBeLessThanOrEqual(paymentScenario.targetLagThreshold);
    expect(result.duplicateRatePercent).toBe(0);
    expect(result.dataLossCount).toBe(0);
    expect(result.earnedBadges).toContain('STREAM_ARCHITECT');
    expect(result.earnedBadges).toContain('EXACTLY_ONCE_MASTER');
  });

  it('detects poison pill failure and stalled partition when Dead-Letter Queue is disabled', () => {
    const sagaScenario = STREAM_SCENARIOS.find((s) => s.id === 'order-fulfillment-saga')!;
    const noDlqConfig: StreamSimulationConfig = {
      ...sagaScenario.goldenConfig,
      hasDeadLetterQueue: false,
    };

    const result = simulateStreamExperiment(sagaScenario, noDlqConfig);

    expect(result.poisonPillHandled).toBe(false);
    expect(result.maxConsumerLag).toBeGreaterThan(8000);
    expect(result.grade).not.toBe('S');
    expect(result.feedback).toContain('Poison pill message crashed consumer worker without a Dead-Letter Queue');
  });

  it('detects key skew hotspot bottleneck in IoT fleet scenario under naive Key-Hash', () => {
    const iotScenario = STREAM_SCENARIOS.find((s) => s.id === 'iot-sensor-telemetry-fleet')!;
    const skewedConfig: StreamSimulationConfig = {
      ...iotScenario.goldenConfig,
      partitioningStrategy: 'KEY_HASH', // Coarse key causes 70% of traffic to hit partition 0
    };

    const result = simulateStreamExperiment(iotScenario, skewedConfig);

    expect(result.partitionMetrics[0].isHotspot).toBe(true);
    expect(result.partitionMetrics[0].messageSharePercent).toBe(70.0);
    expect(result.grade).not.toBe('S');
  });

  it('validates that Exactly-Once eliminates duplicates while At-Most-Once risks data loss', () => {
    const paymentScenario = STREAM_SCENARIOS.find((s) => s.id === 'payment-webhook-ingestion')!;

    const exactlyOnceResult = simulateStreamExperiment(paymentScenario, {
      ...paymentScenario.goldenConfig,
      deliverySemantics: 'EXACTLY_ONCE',
    });

    const atMostOnceResult = simulateStreamExperiment(paymentScenario, {
      ...paymentScenario.goldenConfig,
      deliverySemantics: 'AT_MOST_ONCE',
    });

    expect(exactlyOnceResult.duplicateRatePercent).toBe(0);
    expect(exactlyOnceResult.dataLossCount).toBe(0);

    expect(atMostOnceResult.dataLossCount).toBeGreaterThan(0);
  });

  it('generates a clean markdown report with telemetry and diagnostics', () => {
    const scenario = STREAM_SCENARIOS[0];
    const result = simulateStreamExperiment(scenario, scenario.goldenConfig);
    const md = generateStreamLabMarkdown(scenario, scenario.goldenConfig, result);

    expect(md).toContain('# Event-Driven Message Streaming & Partitioning Report');
    expect(md).toContain(scenario.title);
    expect(md).toContain(`Grade ${result.grade}`);
    expect(md).toContain('Performance & Consumer Lag Telemetry');
    expect(md).toContain('Golden Architectural Blueprint');
  });

  it('exports a valid vector PDF 1.4 document', () => {
    const scenario = STREAM_SCENARIOS[0];
    const result = simulateStreamExperiment(scenario, scenario.goldenConfig);

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createObjectURLSpy = vi.fn().mockReturnValue('blob:test-stream-pdf-url');
    const revokeObjectURLSpy = vi.fn();

    window.URL.createObjectURL = createObjectURLSpy;
    window.URL.revokeObjectURL = revokeObjectURLSpy;

    expect(() =>
      exportStreamLabPdf(scenario, scenario.goldenConfig, result)
    ).not.toThrow();

    expect(clickSpy).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('saves and loads experiment records from localStorage', () => {
    const scenario = STREAM_SCENARIOS[0];
    const result = simulateStreamExperiment(scenario, scenario.goldenConfig);

    saveStreamLabRecord({
      scenarioId: scenario.id,
      lastRunAt: result.simulatedAt,
      config: scenario.goldenConfig,
      result,
    });

    const records = loadSavedStreamLabRecords();
    expect(records).toHaveLength(1);
    expect(records[0].scenarioId).toBe(scenario.id);
    expect(records[0].result.grade).toBe(result.grade);

    expect(localStorage.getItem(STREAM_LAB_STORAGE_KEY)).toBeTruthy();
  });
});
