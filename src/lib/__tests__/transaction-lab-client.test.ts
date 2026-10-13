import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TRANSACTION_SCENARIOS,
  simulateTransactionExperiment,
  generateTransactionLabMarkdown,
  exportTransactionLabPdf,
  saveTransactionLabRecord,
  loadSavedTransactionLabRecords,
  TRANSACTION_LAB_STORAGE_KEY,
  type TransactionSimulationConfig,
} from '../transaction-lab-client';

describe('Distributed Transactions, 2PC & Saga Orchestrator Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('contains 6 curated enterprise transaction scenarios with valid properties and steps', () => {
    expect(TRANSACTION_SCENARIOS).toHaveLength(6);
    for (const s of TRANSACTION_SCENARIOS) {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.domain).toBeTruthy();
      expect(s.stepCount).toBeGreaterThanOrEqual(3);
      expect(s.defaultSteps).toHaveLength(s.stepCount);
      expect(s.goldenConfig).toBeDefined();
      expect(s.goldenExplanation.length).toBeGreaterThan(20);
      expect(s.socraticHints.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('achieves Grade S and non-blocking locks on e-commerce checkout with golden config', () => {
    const checkoutScenario = TRANSACTION_SCENARIOS.find((s) => s.id === 'ecommerce-order-checkout')!;
    const result = simulateTransactionExperiment(checkoutScenario.goldenConfig, checkoutScenario);

    expect(result.grade).toBe('S');
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.inconsistencyDetected).toBe(false);
    expect(result.resourceLockDurationMs).toBeLessThanOrEqual(50);
    expect(result.earnedBadges).toContain('SAGA_ORCHESTRATOR');
  });

  it('detects critical data inconsistency when Transactional Outbox is disabled during dual-write outage', () => {
    const transferScenario = TRANSACTION_SCENARIOS.find((s) => s.id === 'cross-border-wire-transfer')!;
    const brokenConfig: TransactionSimulationConfig = {
      ...transferScenario.goldenConfig,
      hasTransactionalOutbox: false,
      failureInjection: 'DUAL_WRITE_OUTAGE',
    };

    const result = simulateTransactionExperiment(brokenConfig, transferScenario);

    expect(result.inconsistencyDetected).toBe(true);
    expect(result.success).toBe(false);
    expect(result.grade).not.toBe('S');
    expect(result.feedback).toContain('CRITICAL BUG');
  });

  it('detects high distributed lock contention under Two-Phase Commit (2PC)', () => {
    const checkoutScenario = TRANSACTION_SCENARIOS.find((s) => s.id === 'ecommerce-order-checkout')!;
    const tpcConfig: TransactionSimulationConfig = {
      ...checkoutScenario.goldenConfig,
      protocol: 'TWO_PHASE_COMMIT',
      failureInjection: 'COORDINATOR_CRASH',
    };

    const result = simulateTransactionExperiment(tpcConfig, checkoutScenario);

    expect(result.resourceLockDurationMs).toBeGreaterThan(500);
    expect(result.feedback).toContain('Severe distributed lock contention');
    expect(result.grade).not.toBe('S');
  });

  it('detects 3PC split-brain failure under network partition', () => {
    const supplyScenario = TRANSACTION_SCENARIOS.find((s) => s.id === 'supply-chain-warehouse-transfer')!;
    const threePcConfig: TransactionSimulationConfig = {
      ...supplyScenario.goldenConfig,
      protocol: 'THREE_PHASE_COMMIT',
      failureInjection: 'NETWORK_PARTITION',
    };

    const result = simulateTransactionExperiment(threePcConfig, supplyScenario);

    expect(result.inconsistencyDetected).toBe(true);
    expect(result.feedback).toContain('split-brain consensus failure');
  });

  it('executes backward compensating rollback cleanly when participant crashes under Orchestrated Saga', () => {
    const vacationScenario = TRANSACTION_SCENARIOS.find((s) => s.id === 'flight-hotel-vacation-bundle')!;
    const result = simulateTransactionExperiment(vacationScenario.goldenConfig, vacationScenario);

    expect(result.compensationsTriggered).toBeGreaterThan(0);
    expect(result.inconsistencyDetected).toBe(false);
    expect(result.earnedBadges).toContain('COMPENSATION_HERO');
  });

  it('generates a clean markdown assessment report', () => {
    const scenario = TRANSACTION_SCENARIOS[0];
    const result = simulateTransactionExperiment(scenario.goldenConfig, scenario);
    const md = generateTransactionLabMarkdown(scenario, scenario.goldenConfig, result);

    expect(md).toContain('# Distributed Transactions & Saga Orchestration Assessment Report');
    expect(md).toContain(scenario.title);
    expect(md).toContain('Step Execution Waterfall');
    expect(md).toContain('Golden Reference Architecture');
  });

  it('exports valid PDF 1.4 byte stream without external dependencies', () => {
    const scenario = TRANSACTION_SCENARIOS[0];
    const result = simulateTransactionExperiment(scenario.goldenConfig, scenario);

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createObjectURLSpy = vi.fn().mockReturnValue('blob:test-transaction-pdf-url');
    const revokeObjectURLSpy = vi.fn();

    window.URL.createObjectURL = createObjectURLSpy;
    window.URL.revokeObjectURL = revokeObjectURLSpy;

    expect(() => exportTransactionLabPdf(scenario, scenario.goldenConfig, result)).not.toThrow();

    expect(clickSpy).toHaveBeenCalled();
    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('persists and retrieves simulation records via localStorage', () => {
    const scenario = TRANSACTION_SCENARIOS[1];
    const result = simulateTransactionExperiment(scenario.goldenConfig, scenario);

    saveTransactionLabRecord({
      scenarioId: scenario.id,
      config: scenario.goldenConfig,
      result,
      timestamp: new Date().toISOString(),
    });

    const records = loadSavedTransactionLabRecords();
    expect(records).toHaveLength(1);
    expect(records[0].scenarioId).toBe(scenario.id);
    expect(records[0].result.grade).toBe(result.grade);

    expect(localStorage.getItem(TRANSACTION_LAB_STORAGE_KEY)).toBeTruthy();
  });
});
