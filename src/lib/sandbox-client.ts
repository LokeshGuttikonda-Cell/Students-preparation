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

export async function runSqlQuery(
  query: string,
  schemaDdl?: string,
  seedDataSql?: string,
): Promise<SqlExecutionResult> {
  const res = await fetch(apiUrl('sandbox/sql/run'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query, schemaDdl, seedDataSql }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to execute SQL query');
  }

  return (await res.json()) as SqlExecutionResult;
}

export async function validateSqlQuery(
  userQuery: string,
  schemaDdl: string,
  seedDataSql: string,
  expectedQuery?: string,
  expectedRows?: Record<string, unknown>[],
): Promise<SqlValidationResult> {
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to validate SQL query');
  }

  return (await res.json()) as SqlValidationResult;
}

export async function runCodeLogic(
  code: string,
  functionName: string,
  testCases: CodeTestCase[],
): Promise<CodeExecutionResult> {
  const res = await fetch(apiUrl('sandbox/code/run'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code, functionName, testCases }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || 'Failed to execute code logic');
  }

  return (await res.json()) as CodeExecutionResult;
}

