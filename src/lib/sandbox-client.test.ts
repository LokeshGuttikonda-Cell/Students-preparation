import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  runSqlQuery,
  validateSqlQuery,
  runCodeLogic,
  executeCodeLogicLocally,
  executeCodeLogicSafely,
  type CodeTestCase,
} from './sandbox-client';
import { apiUrl } from './env';

describe('sandbox-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runSqlQuery sends POST to /api/v1/sandbox/sql/run', async () => {
    const mockResponse = {
      success: true,
      columns: ['id', 'name'],
      rows: [{ id: 1, name: 'Engineering' }],
      rowCount: 1,
      executionTimeMs: 3,
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await runSqlQuery('SELECT * FROM departments;');
    expect(fetch).toHaveBeenCalledWith(apiUrl('sandbox/sql/run'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query: 'SELECT * FROM departments;', schemaDdl: undefined, seedDataSql: undefined }),
    });
    expect(result.success).toBe(true);
    expect(result.rowCount).toBe(1);
  });

  it('validateSqlQuery sends POST to /api/v1/sandbox/sql/validate', async () => {
    const mockResponse = {
      passed: true,
      message: 'Query output matches expected solution criteria.',
      candidateRows: [{ id: 1 }],
      executionTimeMs: 4,
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await validateSqlQuery('SELECT id FROM departments;', 'SCHEMA', 'SEED', 'EXPECTED');
    expect(fetch).toHaveBeenCalledWith(apiUrl('sandbox/sql/validate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userQuery: 'SELECT id FROM departments;',
        schemaDdl: 'SCHEMA',
        seedDataSql: 'SEED',
        expectedQuery: 'EXPECTED',
        expectedRows: undefined,
      }),
    });
    expect(result.passed).toBe(true);
  });

  it('executeCodeLogicLocally evaluates algorithmic JavaScript logic correctly in browser', () => {
    const code = `
      function twoSum(nums, target) {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
          const diff = target - nums[i];
          if (map.has(diff)) return [map.get(diff), i];
          map.set(nums[i], i);
        }
        return [];
      }
    `;
    const testCases: CodeTestCase[] = [
      { id: 'tc1', description: 'Finds pair', input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { id: 'tc2', description: 'No pair', input: [[1, 2], 5], expectedOutput: [] },
    ];

    const result = executeCodeLogicLocally(code, 'twoSum', testCases);
    expect(result.success).toBe(true);
    expect(result.allPassed).toBe(true);
    expect(result.totalTests).toBe(2);
    expect(result.passedTests).toBe(2);
  });

  it('executeCodeLogicLocally catches runtime syntax/execution errors safely without crashing', () => {
    const invalidCode = `function brokenFn() { throw new Error('Simulated runtime exception'); }`;
    const testCases: CodeTestCase[] = [
      { id: 'tc1', description: 'Fails gracefully', input: [], expectedOutput: 10 },
    ];

    const result = executeCodeLogicLocally(invalidCode, 'brokenFn', testCases);
    expect(result.success).toBe(true);
    expect(result.allPassed).toBe(false);
    expect(result.results[0].passed).toBe(false);
    expect(result.results[0].error).toContain('Simulated runtime exception');
  });

  it('runCodeLogic uses backend API when available and falls back to local execution on network failure', async () => {
    // 1. Success with backend API
    const mockBackend = {
      success: true,
      allPassed: true,
      totalTests: 1,
      passedTests: 1,
      results: [],
      executionTimeMs: 5,
    };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockBackend,
    } as Response);

    const testCases: CodeTestCase[] = [
      { id: 'tc1', description: 'Passes', input: [5], expectedOutput: 10 },
    ];
    const res1 = await runCodeLogic('function double(x) { return x * 2; }', 'double', testCases);
    expect(res1.executionTimeMs).toBe(5);

    // 2. Network error triggers graceful local execution fallback
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error: connection refused'));
    const res2 = await runCodeLogic('function double(x) { return x * 2; }', 'double', testCases);
    expect(res2.success).toBe(true);
    expect(res2.allPassed).toBe(true);
    expect(res2.passedTests).toBe(1);
  });

  it('executeCodeLogicSafely executes logic asynchronously with accurate test results', async () => {
    const code = `function isEven(n) { return n % 2 === 0; }`;
    const testCases: CodeTestCase[] = [
      { id: 'tc1', description: 'Even number', input: [4], expectedOutput: true },
      { id: 'tc2', description: 'Odd number', input: [7], expectedOutput: false },
    ];

    const result = await executeCodeLogicSafely(code, 'isEven', testCases);
    expect(result.success).toBe(true);
    expect(result.allPassed).toBe(true);
    expect(result.totalTests).toBe(2);
    expect(result.passedTests).toBe(2);
    expect(result.results[0].passed).toBe(true);
  });

  it('executeCodeLogicSafely handles simulated worker timeout cleanly', async () => {
    // Stub global Worker with a mock that triggers the timeout branch
    const originalWorker = globalThis.Worker;
    const originalBlob = globalThis.Blob;
    const originalUrl = globalThis.URL;

    class MockHangingWorker {
      onmessage: ((e: MessageEvent) => void) | null = null;
      onerror: ((e: ErrorEvent) => void) | null = null;
      postMessage() {
        // Deliberately do not reply to trigger timeout
      }
      terminate = vi.fn();
    }

    try {
      // @ts-expect-error Mocking Worker
      globalThis.Worker = MockHangingWorker;
      globalThis.Blob = class { constructor() {} } as unknown as typeof Blob;
      globalThis.URL = {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn(),
      } as unknown as typeof URL;

      const testCases: CodeTestCase[] = [
        { id: 'tc_hang', description: 'Hangs', input: [], expectedOutput: null },
      ];

      const res = await executeCodeLogicSafely('while(true){}', 'hang', testCases, 50);
      expect(res.success).toBe(true);
      expect(res.allPassed).toBe(false);
      expect(res.runtimeError).toContain('Execution timed out');
      expect(res.results[0].error).toContain('Execution timed out');
    } finally {
      globalThis.Worker = originalWorker;
      globalThis.Blob = originalBlob;
      globalThis.URL = originalUrl;
    }
  });
});

