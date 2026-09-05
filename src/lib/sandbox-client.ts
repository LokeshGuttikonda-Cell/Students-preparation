export interface SqlExecutionResult {
  success: boolean;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export interface SqlValidationResult {
  passed: boolean;
  message: string;
  expectedRowCount?: number;
  actualRowCount?: number;
  candidateRows: Record<string, unknown>[];
  expectedRows?: Record<string, unknown>[];
  executionTimeMs: number;
}

export interface CodeTestCase {
  id: string;
  description: string;
  input: unknown[];
  expectedOutput: unknown;
}

export interface CodeTestCaseResult {
  testCaseId: string;
  description: string;
  passed: boolean;
  actualOutput?: unknown;
  expectedOutput: unknown;
  error?: string;
  executionTimeMs: number;
}

export interface CodeExecutionResult {
  success: boolean;
  allPassed: boolean;
  totalTests: number;
  passedTests: number;
  results: CodeTestCaseResult[];
  runtimeError?: string;
  executionTimeMs: number;
}

export const DEFAULT_SQL_SCHEMA = `CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER,
  salary INTEGER NOT NULL,
  hire_date TEXT NOT NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);`;

export const DEFAULT_SQL_SEED = `INSERT INTO departments (id, name) VALUES
  (1, 'Engineering'),
  (2, 'DevOps & Cloud'),
  (3, 'Data Platform'),
  (4, 'Quality Assurance');

INSERT INTO employees (id, name, department_id, salary, hire_date) VALUES
  (101, 'Aarav Sharma', 1, 95000, '2024-01-15'),
  (102, 'Priya Patel', 1, 110000, '2023-03-20'),
  (103, 'Rohan Iyer', 2, 105000, '2023-08-10'),
  (104, 'Sneha Reddy', 2, 90000, '2024-05-01'),
  (105, 'Vikram Nair', 3, 115000, '2022-11-12'),
  (106, 'Ananya Gupta', 3, 98000, '2024-02-18'),
  (107, 'Karthik Rao', 4, 85000, '2024-06-25'),
  (108, 'Meera Joshi', 1, 125000, '2022-04-14');`;

import { apiUrl } from './env';
import { executeSqlQueryLocally, validateSqlQueryLocally } from './in-memory-sql';

export { executeSqlQueryLocally, validateSqlQueryLocally };

export async function runSqlQuery(
  query: string,
  schemaDdl?: string,
  seedDataSql?: string,
): Promise<SqlExecutionResult> {
  try {
    const res = await fetch(apiUrl('sandbox/sql/run'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query, schemaDdl, seedDataSql }),
    });

    if (res.ok) {
      return (await res.json()) as SqlExecutionResult;
    }
  } catch {
    // Graceful offline fallback to local in-memory SQL engine
  }

  return executeSqlQueryLocally(query, schemaDdl, seedDataSql);
}

export async function validateSqlQuery(
  userQuery: string,
  schemaDdl: string,
  seedDataSql: string,
  expectedQuery?: string,
  expectedRows?: Record<string, unknown>[],
): Promise<SqlValidationResult> {
  try {
    const res = await fetch(apiUrl('sandbox/sql/validate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        userQuery,
        schemaDdl,
        seedDataSql,
        expectedQuery,
        expectedRows,
      }),
    });

    if (res.ok) {
      return (await res.json()) as SqlValidationResult;
    }
  } catch {
    // Graceful offline fallback to local in-memory SQL engine
  }

  return validateSqlQueryLocally(userQuery, schemaDdl, seedDataSql, expectedQuery, expectedRows);
}

export function executeCodeLogicLocally(
  code: string,
  functionName: string,
  testCases: CodeTestCase[],
): CodeExecutionResult {
  const startTime = Date.now();
  const results: CodeTestCaseResult[] = [];
  let allPassed = true;
  let runtimeError: string | undefined;

  for (const tc of testCases) {
    const tcStartTime = Date.now();
    try {
      const runner = new Function(
        `"use strict";
        ${code}
        if (typeof ${functionName} !== 'function') {
          throw new Error("${functionName} is not defined or not a function");
        }
        return ${functionName}(...arguments[0]);`,
      );

      const actualOutput = runner(tc.input);
      const passed = JSON.stringify(actualOutput) === JSON.stringify(tc.expectedOutput);
      if (!passed) allPassed = false;

      results.push({
        testCaseId: tc.id,
        description: tc.description,
        passed,
        actualOutput,
        expectedOutput: tc.expectedOutput,
        executionTimeMs: Math.max(1, Date.now() - tcStartTime),
      });
    } catch (err: unknown) {
      allPassed = false;
      const msg = err instanceof Error ? err.message : 'Runtime execution error';
      runtimeError = msg;
      results.push({
        testCaseId: tc.id,
        description: tc.description,
        passed: false,
        error: msg,
        expectedOutput: tc.expectedOutput,
        executionTimeMs: Math.max(1, Date.now() - tcStartTime),
      });
    }
  }

  const passedTests = results.filter((r) => r.passed).length;
  return {
    success: true,
    allPassed,
    totalTests: testCases.length,
    passedTests,
    results,
    runtimeError,
    executionTimeMs: Math.max(1, Date.now() - startTime),
  };
}

/**
 * Safely executes algorithmic JavaScript logic using an isolated Web Worker with strict timeout
 * protection (default 2000ms) to ensure infinite loops or runaway recursion never freeze the browser main thread.
 * Falls back seamlessly to in-memory evaluation in environments where Web Workers are unavailable.
 */
export async function executeCodeLogicSafely(
  code: string,
  functionName: string,
  testCases: CodeTestCase[],
  timeoutMs = 2000,
): Promise<CodeExecutionResult> {
  const startTime = Date.now();

  const hasWorkerSupport =
    typeof globalThis !== 'undefined' &&
    typeof globalThis.Worker !== 'undefined' &&
    typeof globalThis.Blob !== 'undefined' &&
    typeof globalThis.URL !== 'undefined' &&
    typeof globalThis.URL.createObjectURL === 'function';

  if (hasWorkerSupport) {
    return new Promise<CodeExecutionResult>((resolve) => {
      let worker: Worker | null = null;
      let timer: ReturnType<typeof setTimeout> | null = null;
      let objectUrl: string | null = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        if (worker) {
          worker.terminate();
          worker = null;
        }
        if (objectUrl && typeof globalThis.URL?.revokeObjectURL === 'function') {
          try {
            globalThis.URL.revokeObjectURL(objectUrl);
          } catch {
            // ignore revocation errors
          }
          objectUrl = null;
        }
      };

      try {
        const workerScript = `
          self.onmessage = function(e) {
            var data = e.data;
            var code = data.code;
            var functionName = data.functionName;
            var testCases = data.testCases;
            var results = [];
            var allPassed = true;
            var runtimeError;

            try {
              var runner = new Function(
                '"use strict";\\n' +
                code +
                '\\nif (typeof ' + functionName + ' !== "function") {' +
                '  throw new Error("' + functionName + ' is not defined or not a function");' +
                '}\\n' +
                'return ' + functionName + '(...arguments[0]);'
              );

              for (var i = 0; i < testCases.length; i++) {
                var tc = testCases[i];
                var tcStart = Date.now();
                try {
                  var actualOutput = runner(tc.input);
                  var passed = JSON.stringify(actualOutput) === JSON.stringify(tc.expectedOutput);
                  if (!passed) allPassed = false;
                  results.push({
                    testCaseId: tc.id,
                    description: tc.description,
                    passed: passed,
                    actualOutput: actualOutput,
                    expectedOutput: tc.expectedOutput,
                    executionTimeMs: Math.max(1, Date.now() - tcStart)
                  });
                } catch(tcErr) {
                  allPassed = false;
                  var msg = tcErr ? (tcErr.message || String(tcErr)) : 'Runtime error';
                  runtimeError = msg;
                  results.push({
                    testCaseId: tc.id,
                    description: tc.description,
                    passed: false,
                    error: msg,
                    expectedOutput: tc.expectedOutput,
                    executionTimeMs: Math.max(1, Date.now() - tcStart)
                  });
                }
              }
            } catch(err) {
              allPassed = false;
              runtimeError = err ? (err.message || String(err)) : 'Compilation error';
              for (var j = 0; j < testCases.length; j++) {
                results.push({
                  testCaseId: testCases[j].id,
                  description: testCases[j].description,
                  passed: false,
                  error: runtimeError,
                  expectedOutput: testCases[j].expectedOutput,
                  executionTimeMs: 1
                });
              }
            }

            self.postMessage({
              success: true,
              allPassed: allPassed,
              totalTests: testCases.length,
              passedTests: results.filter(function(r) { return r.passed; }).length,
              results: results,
              runtimeError: runtimeError
            });
          };
        `;

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        objectUrl = globalThis.URL.createObjectURL(blob);
        worker = new Worker(objectUrl);

        timer = setTimeout(() => {
          cleanup();
          const timeoutResults: CodeTestCaseResult[] = testCases.map((tc) => ({
            testCaseId: tc.id,
            description: tc.description,
            passed: false,
            error: `Execution timed out (${timeoutMs}ms limit exceeded). Infinite loop or deep recursion detected.`,
            expectedOutput: tc.expectedOutput,
            executionTimeMs: timeoutMs,
          }));

          resolve({
            success: true,
            allPassed: false,
            totalTests: testCases.length,
            passedTests: 0,
            results: timeoutResults,
            runtimeError: `Execution timed out (${timeoutMs}ms limit exceeded). Infinite loop or deep recursion detected.`,
            executionTimeMs: Math.max(1, Date.now() - startTime),
          });
        }, timeoutMs);

        worker.onmessage = (e: MessageEvent) => {
          const payload = e.data as Omit<CodeExecutionResult, 'executionTimeMs'>;
          cleanup();
          resolve({
            ...payload,
            executionTimeMs: Math.max(1, Date.now() - startTime),
          });
        };

        worker.onerror = (err: ErrorEvent) => {
          const errMsg = err.message || 'Worker runtime error';
          cleanup();
          const errorResults: CodeTestCaseResult[] = testCases.map((tc) => ({
            testCaseId: tc.id,
            description: tc.description,
            passed: false,
            error: errMsg,
            expectedOutput: tc.expectedOutput,
            executionTimeMs: 1,
          }));
          resolve({
            success: true,
            allPassed: false,
            totalTests: testCases.length,
            passedTests: 0,
            results: errorResults,
            runtimeError: errMsg,
            executionTimeMs: Math.max(1, Date.now() - startTime),
          });
        };

        worker.postMessage({ code, functionName, testCases });
      } catch {
        cleanup();
        resolve(executeCodeLogicLocally(code, functionName, testCases));
      }
    });
  }

  return Promise.resolve(executeCodeLogicLocally(code, functionName, testCases));
}

export async function runCodeLogic(
  code: string,
  functionName: string,
  testCases: CodeTestCase[],
): Promise<CodeExecutionResult> {
  try {
    const res = await fetch(apiUrl('sandbox/code/run'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code, functionName, testCases }),
    });

    if (res.ok) {
      return (await res.json()) as CodeExecutionResult;
    }
  } catch {
    // Graceful offline fallback to in-browser sandboxed execution with timeout protection
  }

  return executeCodeLogicSafely(code, functionName, testCases);
}


