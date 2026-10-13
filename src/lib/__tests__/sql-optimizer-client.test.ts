import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CURATED_SQL_SCENARIOS,
  simulateOptimization,
  generateSqlOptimizationMarkdown,
  exportSqlOptimizationPdf,
  downloadFile,
  loadSavedSqlOptimizationState,
  saveSqlOptimizationRecord,
  SQL_OPTIMIZER_STORAGE_KEY,
  type TableIndex,
  type SavedSqlOptimizationRecord,
} from '../sql-optimizer-client';

describe('sql-optimizer-client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Curated SQL Scenarios Catalog', () => {
    it('contains exactly 6 enterprise query scenarios with tables, indexes, and execution plans', () => {
      expect(CURATED_SQL_SCENARIOS).toHaveLength(6);

      for (const scenario of CURATED_SQL_SCENARIOS) {
        expect(scenario.id).toBeTruthy();
        expect(scenario.title).toBeTruthy();
        expect(scenario.domain).toBeTruthy();
        expect(scenario.targetService).toBeTruthy();
        expect(scenario.tables.length).toBeGreaterThan(0);
        expect(scenario.originalQuery).toBeTruthy();
        expect(scenario.goldenRewriteQuery).toBeTruthy();
        expect(scenario.goldenIndexes.length).toBeGreaterThan(0);
        expect(scenario.socraticHints.length).toBeGreaterThan(0);
        expect(scenario.unoptimizedPlan).toBeDefined();
        expect(scenario.goldenOptimizedPlan).toBeDefined();

        for (const table of scenario.tables) {
          expect(table.name).toBeTruthy();
          expect(table.rowCount).toBeGreaterThan(0);
          expect(table.columns.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('simulateOptimization', () => {
    const scenario = CURATED_SQL_SCENARIOS[0]; // ecommerce-orders-customer

    it('grades S (Staff DBA) when matching golden index and SARGable range query are provided', () => {
      const proposedIndexes: TableIndex[] = [
        {
          name: 'idx_orders_customer_status_created',
          tableName: 'orders',
          columns: ['customer_id', 'status', 'created_at'],
          includeColumns: ['total_amount'],
        },
      ];

      const result = simulateOptimization(
        scenario,
        proposedIndexes,
        scenario.goldenRewriteQuery,
      );

      expect(result.grade).toBe('S');
      expect(result.executionTimeReductionPercent).toBeGreaterThanOrEqual(95);
      expect(result.totalCostReductionPercent).toBeGreaterThanOrEqual(95);
      expect(result.earnedBadges).toContain('INDEX_ARCHITECT');
      expect(result.earnedBadges).toContain('SARGABLE_MASTER');
      expect(result.earnedBadges).toContain('LATENCY_CRUSHER');
      expect(result.earnedBadges).toContain('STAFF_DBA');
      expect(result.evaluationFeedback).toContain('Outstanding query tuning');
      expect(result.simulatedPlan.nodeType).toBe('Index Only Scan');
    });

    it('penalizes when no index is added and original unoptimized query is kept', () => {
      const result = simulateOptimization(scenario, [], scenario.originalQuery);

      expect(result.grade).toBe('F');
      expect(result.executionTimeReductionPercent).toBeLessThan(50);
      expect(result.evaluationFeedback).toContain('Insufficient optimization');
      expect(result.simulatedPlan.nodeType).toBe('Sort');
    });

    it('handles keyset pagination scenario correctly', () => {
      const feedScenario = CURATED_SQL_SCENARIOS[1]; // feed-events-pagination
      const proposedIndexes: TableIndex[] = [
        {
          name: 'idx_events_user_event',
          tableName: 'user_events',
          columns: ['user_id', 'event_id'],
        },
      ];

      const result = simulateOptimization(
        feedScenario,
        proposedIndexes,
        feedScenario.goldenRewriteQuery,
      );

      expect(result.grade).toBe('S');
      expect(result.earnedBadges).toContain('INDEX_ARCHITECT');
    });
  });

  describe('Exporters & Reporting', () => {
    const scenario = CURATED_SQL_SCENARIOS[0];
    const proposedIndexes: TableIndex[] = [
      {
        name: 'idx_test_orders',
        tableName: 'orders',
        columns: ['customer_id', 'status', 'created_at'],
      },
    ];
    const result = simulateOptimization(
      scenario,
      proposedIndexes,
      scenario.goldenRewriteQuery,
    );

    it('generates markdown report with performance scorecard, index list, and queries', () => {
      const md = generateSqlOptimizationMarkdown(
        scenario,
        result,
        proposedIndexes,
        scenario.goldenRewriteQuery,
      );

      expect(md).toContain('# SQL Query Execution Plan & Index Tuning Report');
      expect(md).toContain(scenario.title);
      expect(md).toContain('Performance Optimization Scorecard');
      expect(md).toContain('Anti-Pattern & Root Cause Diagnosis');
      expect(md).toContain('Tuned Index Architecture Proposals');
      expect(md).toContain('Rewritten SQL Query');
    });

    it('exports PDF report cleanly without throwing errors', () => {
      const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      const createObjectURLSpy = vi.fn().mockReturnValue('blob:test-pdf-url');
      const revokeObjectURLSpy = vi.fn();

      window.URL.createObjectURL = createObjectURLSpy;
      window.URL.revokeObjectURL = revokeObjectURLSpy;

      expect(() =>
        exportSqlOptimizationPdf(
          scenario,
          result,
          proposedIndexes,
          scenario.goldenRewriteQuery,
        ),
      ).not.toThrow();

      expect(clickSpy).toHaveBeenCalled();
      expect(createObjectURLSpy).toHaveBeenCalled();
    });

    it('safely handles downloadFile when createObjectURL is unavailable', () => {
      const originalCreate = window.URL.createObjectURL;
      // @ts-expect-error simulating missing function
      delete window.URL.createObjectURL;

      expect(() => downloadFile('sample.txt', 'hello', 'text/plain')).not.toThrow();

      window.URL.createObjectURL = originalCreate;
    });
  });

  describe('LocalStorage Persistence', () => {
    it('saves and loads SQL optimization records properly', () => {
      expect(loadSavedSqlOptimizationState()).toEqual({});

      const record: SavedSqlOptimizationRecord = {
        scenarioId: 'ecommerce-orders-customer',
        proposedIndexes: [
          {
            name: 'idx_cust',
            tableName: 'orders',
            columns: ['customer_id'],
          },
        ],
        rewrittenQuery: 'SELECT * FROM orders WHERE customer_id = 1;',
        lastUpdated: '2026-09-21T12:00:00.000Z',
      };

      saveSqlOptimizationRecord(record);

      const loaded = loadSavedSqlOptimizationState();
      expect(loaded['ecommerce-orders-customer']).toBeDefined();
      expect(loaded['ecommerce-orders-customer'].proposedIndexes).toHaveLength(1);
      expect(loaded['ecommerce-orders-customer'].rewrittenQuery).toContain('SELECT *');
    });

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem(SQL_OPTIMIZER_STORAGE_KEY, '{malformed json');
      expect(loadSavedSqlOptimizationState()).toEqual({});
    });
  });
});
