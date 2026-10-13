import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  BLUEPRINT_CATALOG,
  getBlueprintCatalog,
  getBlueprintById,
  calculateCapacityEstimates,
  getSavedStudioState,
  saveStudioState,
  generateArchitecturalDecisionRecord,
  exportArchitectureBlueprintPdf,
} from '../architecture-client';

describe('architecture-client engine', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('contains 6 canonical enterprise system design blueprints', () => {
    const catalog = getBlueprintCatalog();
    expect(catalog.length).toBe(6);

    const ids = catalog.map((b) => b.id);
    expect(ids).toContain('url-shortener');
    expect(ids).toContain('distributed-kv');
    expect(ids).toContain('payment-ledger');
    expect(ids).toContain('notification-fanout');
    expect(ids).toContain('collaborative-doc');
    expect(ids).toContain('distributed-rate-limiter');
  });

  it('retrieves blueprint by ID or returns default fallback', () => {
    const kv = getBlueprintById('distributed-kv');
    expect(kv?.title).toContain('Distributed Key-Value Store');

    const fallback = getBlueprintById('unknown-xyz');
    expect(fallback?.id).toBe('url-shortener');
  });

  it('calculates back-of-the-envelope capacity estimates deterministically', () => {
    // 50 Million DAU, 100:1 read:write, 500 bytes payload, 5 years retention
    const estimates = calculateCapacityEstimates(50000000, 100, 500, 5);

    expect(estimates.dau).toBe(50000000);
    expect(estimates.readWriteRatio).toBe(100);
    expect(estimates.payloadSizeBytes).toBe(500);
    expect(estimates.retentionYears).toBe(5);

    // QPS checks
    expect(estimates.writeQps).toBeGreaterThan(1000); // 100M writes / 86400 ≈ 1157
    expect(estimates.readQps).toBeGreaterThan(100000); // 10B reads / 86400 ≈ 115740
    expect(estimates.qpsPeak).toBeGreaterThan(estimates.qpsAverage);

    // Bandwidth checks
    expect(estimates.bandwidthIngressMBs).toBeGreaterThan(0);
    expect(estimates.bandwidthEgressMBs).toBeGreaterThan(0);

    // Storage & Cache checks
    expect(estimates.storageTotalTB).toBeGreaterThan(100); // multi-TB storage
    expect(estimates.cacheMemoryRequiredGB).toBeGreaterThan(100); // multi-GB RAM
  });

  it('handles boundary inputs gracefully in capacity calculations', () => {
    const zeroEstimates = calculateCapacityEstimates(0, 0, 0, 0);
    expect(zeroEstimates.dau).toBe(1);
    expect(zeroEstimates.readWriteRatio).toBe(1);
    expect(zeroEstimates.payloadSizeBytes).toBe(1);
    expect(zeroEstimates.retentionYears).toBe(1);
  });

  it('manages localStorage persistence for studio state', () => {
    const initialState = getSavedStudioState();
    expect(initialState.activeBlueprintId).toBe('url-shortener');

    saveStudioState({
      activeBlueprintId: 'payment-ledger',
      capacityOverrides: {},
      tradeOffSelections: { 'payment-ledger': { 'distributed-tx': 'A' } },
      customNotes: { 'payment-ledger': 'Two-Phase Commit strictly required for regulatory compliance.' },
      lastUpdated: new Date().toISOString(),
    });

    const updatedState = getSavedStudioState();
    expect(updatedState.activeBlueprintId).toBe('payment-ledger');
    expect(updatedState.tradeOffSelections['payment-ledger']['distributed-tx']).toBe('A');
    expect(updatedState.customNotes['payment-ledger']).toContain('Two-Phase Commit');
  });

  it('generates an Architectural Decision Record (ADR) markdown document', () => {
    const bp = BLUEPRINT_CATALOG[0];
    const capacity = calculateCapacityEstimates(10000000, 50, 500, 3);
    const adr = generateArchitecturalDecisionRecord(
      bp,
      capacity,
      { 'redirect-code': 'A', 'id-generation': 'B' },
      'Evaluated Range Counter vs Snowflake.'
    );

    expect(adr).toContain('# Architectural Decision Record (ADR):');
    expect(adr).toContain('url-shortener');
    expect(adr).toContain('## 1. Context & Problem Statement');
    expect(adr).toContain('## 2. Back-of-the-Envelope Capacity Estimations');
    expect(adr).toContain('## 3. High-Level Component Topology');
    expect(adr).toContain('## 4. Key Architectural Trade-Off Decisions');
    expect(adr).toContain('## 5. Failure Mode & Single Point of Failure (SPOF) Analysis');
    expect(adr).toContain('Evaluated Range Counter vs Snowflake.');
  });

  it('triggers vector PDF blueprint generation', () => {
    const bp = BLUEPRINT_CATALOG[1];
    const capacity = calculateCapacityEstimates(20000000, 3, 2048, 3);

    // Mock URL
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test');
    global.URL.revokeObjectURL = vi.fn();

    const clickMock = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(clickMock);

    exportArchitectureBlueprintPdf(bp, capacity, {});

    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });
});
