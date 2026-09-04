'use client';

import React, { useState } from 'react';
import {
  runSqlQuery,
  validateSqlQuery,
  DEFAULT_SQL_SCHEMA,
  DEFAULT_SQL_SEED,
  type SqlExecutionResult,
  type SqlValidationResult,
} from '../../lib/sandbox-client';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface SqlQuerySandboxProps {
  initialQuery?: string;
  schemaDdl?: string;
  seedDataSql?: string;
  expectedQuery?: string;
  title?: string;
  taskDescription?: string;
  onSuccess?: () => void;
}

export function SqlQuerySandbox({
  initialQuery = 'SELECT d.name AS department, COUNT(e.id) AS total_employees, AVG(e.salary) AS avg_salary\nFROM departments d\nJOIN employees e ON d.id = e.department_id\nGROUP BY d.name\nORDER BY avg_salary DESC;',
  schemaDdl = DEFAULT_SQL_SCHEMA,
  seedDataSql = DEFAULT_SQL_SEED,
  expectedQuery,
  title = 'Interactive SQL Query Sandbox',
  taskDescription,
  onSuccess,
}: SqlQuerySandboxProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isRunning, setIsRunning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<SqlExecutionResult | null>(null);
  const [validationResult, setValidationResult] = useState<SqlValidationResult | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRun = async () => {
    if (!query.trim()) return;
    setIsRunning(true);
    setErrorMessage(null);
    try {
      const res = await runSqlQuery(query, schemaDdl, seedDataSql);
      setResult(res);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleValidate = async () => {
    if (!query.trim() || !expectedQuery) return;
    setIsValidating(true);
    setErrorMessage(null);
    try {
      const val = await validateSqlQuery(query, schemaDdl, seedDataSql, expectedQuery);
      setValidationResult(val);
      if (val.passed && onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      void handleRun();
    }
  };

  return (
    <Card className="p-5 sm:p-7 border-border shadow-xs space-y-5">
      {/* Header & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
            SQL Query Engine (In-Memory SQLite)
          </span>
          <h3 className="text-xl font-bold text-text">
            {title}
          </h3>
          {taskDescription && (
            <p className="text-sm text-text-muted mt-1">
              {taskDescription}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowSchema(!showSchema)}
          className="text-xs font-semibold text-primary-700 hover:text-primary-800 underline min-h-[44px] flex items-center shrink-0"
        >
          {showSchema ? 'Hide Database Schema' : 'View Database Schema Reference'}
        </button>
      </div>

      {/* Schema Reference Accordion */}
      {showSchema && (
        <div className="bg-canvas border border-border rounded-lg p-4 text-xs font-mono text-text space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-primary-800">Database Schema (DDL)</span>
            <span className="text-text-muted">Pre-seeded with sample records</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre leading-relaxed text-text-muted">
            {schemaDdl}
          </pre>
        </div>
      )}

      {/* Query Code Editor Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="sql-editor" className="text-xs font-bold text-text-muted uppercase tracking-wider">
            SQL Statement:
          </label>
          <span className="text-[11px] text-text-muted">
            Press <kbd className="bg-canvas px-1.5 py-0.5 rounded border border-border font-mono">Ctrl+Enter</kbd> to execute
          </span>
        </div>

        <div className="relative rounded-lg border border-border overflow-hidden focus-within:ring-2 focus-within:ring-focus focus-within:border-transparent">
          <textarea
            id="sql-editor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={7}
            className="w-full p-4 font-mono text-sm bg-canvas text-text resize-y focus:outline-hidden leading-relaxed"
            placeholder="Write your SQL SELECT query here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleRun}
            disabled={isRunning || !query.trim()}
            variant="primary"
            size="md"
            className="min-h-[44px]"
          >
            {isRunning ? 'Running Query...' : 'Run Query (Ctrl+Enter)'}
          </Button>

          {expectedQuery && (
            <Button
              type="button"
              onClick={handleValidate}
              disabled={isValidating || !query.trim()}
              variant="secondary"
              size="md"
              className="min-h-[44px]"
            >
              {isValidating ? 'Validating...' : 'Validate Solution →'}
            </Button>
          )}
        </div>

        {result && result.success && (
          <div className="text-xs font-semibold text-text-muted tabular">
            Returned {result.rowCount} {result.rowCount === 1 ? 'row' : 'rows'} in {result.executionTimeMs}ms
          </div>
        )}
      </div>

      {/* Error Feedback */}
      {errorMessage && (
        <div className="p-4 bg-error-50 border border-error-500/30 text-error-700 rounded-lg text-sm font-mono space-y-1">
          <div className="font-bold flex items-center gap-2">
            <span>✗</span> SQL Execution Error
          </div>
          <div className="text-xs whitespace-pre-wrap">{errorMessage}</div>
        </div>
      )}

      {/* Validation Pass / Fail Feedback */}
      {validationResult && (
        <div
          className={`p-4 rounded-lg border text-sm flex items-center justify-between gap-4 ${
            validationResult.passed
              ? 'bg-success-50 border-success-200 text-success-700'
              : 'bg-accent-50 border-accent-200 text-accent-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">{validationResult.passed ? '✓' : '⚡'}</span>
            <span>{validationResult.message}</span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-current">
            {validationResult.passed ? 'Solution Passed' : 'Needs Correction'}
          </span>
        </div>
      )}

      {/* Results Table */}
      {result && result.success && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Query Results:
          </span>

          {result.rows.length === 0 ? (
            <div className="p-6 bg-canvas border border-border rounded-lg text-center text-sm text-text-muted">
              Query executed successfully, but returned 0 rows.
            </div>
          ) : (
            <div className="border border-border rounded-lg overflow-x-auto bg-surface max-h-72">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-canvas border-b border-border font-semibold text-text sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 text-text-muted w-10">#</th>
                    {result.columns.map((col) => (
                      <th key={col} className="px-4 py-2.5">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-text">
                  {result.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-canvas/50">
                      <td className="px-4 py-2 text-text-muted tabular">{idx + 1}</td>
                      {result.columns.map((col) => (
                        <td key={col} className="px-4 py-2 tabular whitespace-nowrap">
                          {row[col] !== null && row[col] !== undefined
                            ? String(row[col])
                            : <span className="text-text-muted italic">NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
