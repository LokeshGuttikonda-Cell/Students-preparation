'use client';

import React, { useState, useEffect } from 'react';
import {
  runCodeLogic,
  type CodeTestCase,
  type CodeExecutionResult,
} from '../../lib/sandbox-client';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface CodeLogicSandboxProps {
  challengeId?: string;
  initialCode?: string;
  functionName?: string;
  testCases?: CodeTestCase[];
  title?: string;
  problemDescription?: string;
  onSuccess?: () => void;
}

const DEFAULT_CODE = `function findTargetSum(nums, target) {
  const seen = new Set();
  for (const n of nums) {
    if (seen.has(target - n)) return true;
    seen.add(n);
  }
  return false;
}`;

const DEFAULT_TEST_CASES: CodeTestCase[] = [
  {
    id: 'tc_1',
    description: 'Finds complementary pair summing to target',
    input: [[10, 15, 3, 7], 17],
    expectedOutput: true,
  },
  {
    id: 'tc_2',
    description: 'No two numbers sum to target',
    input: [[1, 2, 3, 4], 20],
    expectedOutput: false,
  },
  {
    id: 'tc_3',
    description: 'Empty list returns false',
    input: [[], 5],
    expectedOutput: false,
  },
];

export function CodeLogicSandbox({
  challengeId,
  initialCode = DEFAULT_CODE,
  functionName = 'findTargetSum',
  testCases = DEFAULT_TEST_CASES,
  title = 'Algorithmic Code Logic Sandbox',
  problemDescription = 'Implement and test your algorithmic logic against deterministic unit test cases.',
  onSuccess,
}: CodeLogicSandboxProps) {
  const storageKey = challengeId
    ? `studentsprep_code_${challengeId}`
    : `studentsprep_code_${functionName}`;

  const [code, setCode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) return saved;
      } catch {}
    }
    return initialCode;
  });

  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CodeExecutionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
          setCode(saved);
          setResult(null);
          setErrorMessage(null);
          return;
        }
      } catch {}
    }
    setCode(initialCode);
    setResult(null);
    setErrorMessage(null);
  }, [initialCode, storageKey]);

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, val);
      } catch {}
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    }
    setResult(null);
    setErrorMessage(null);
  };

  const handleRun = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setErrorMessage(null);
    try {
      const res = await runCodeLogic(code, functionName, testCases);
      setResult(res);
      if (res.allPassed && onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-5 sm:p-7 border-border shadow-xs space-y-5">
      {/* Header */}
      <div className="border-b border-border pb-4 space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
          Algorithmic Logic Runner (Sandboxed VM)
        </span>
        <h3 className="text-xl font-bold text-text">
          {title}
        </h3>
        {problemDescription && (
          <p className="text-sm text-text-muted leading-relaxed">
            {problemDescription}
          </p>
        )}
      </div>

      {/* Code Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="code-editor" className="text-xs font-bold text-text-muted uppercase tracking-wider">
            JavaScript Function Solution:
          </label>
          <span className="text-[11px] text-text-muted">
            Entry Function: <code className="font-mono text-primary-800">{functionName}</code>
          </span>
        </div>

        <div className="relative rounded-lg border border-border overflow-hidden focus-within:ring-2 focus-within:ring-focus focus-within:border-transparent">
          <textarea
            id="code-editor"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            rows={8}
            className="w-full p-4 font-mono text-sm bg-canvas text-text resize-y focus:outline-hidden leading-relaxed"
            placeholder="Write your function implementation here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Controls & Runner Status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleRun}
            disabled={isRunning || !code.trim()}
            variant="primary"
            size="md"
            className="min-h-[44px]"
          >
            {isRunning ? 'Evaluating Test Cases...' : 'Run Code Logic →'}
          </Button>

          <Button
            type="button"
            onClick={handleReset}
            disabled={isRunning || code === initialCode}
            variant="ghost"
            size="md"
            className="min-h-[44px] text-xs text-text-muted hover:text-text cursor-pointer"
          >
            ↺ Reset Code
          </Button>
        </div>

        {result && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                result.allPassed
                  ? 'bg-success-50 text-success-700 border-success-200'
                  : 'bg-error-50 text-error-700 border-error-200'
              }`}
            >
              {result.allPassed
                ? '✓ All Test Cases Passed'
                : `⚡ Passed ${result.passedTests} of ${result.totalTests} Tests`}
            </span>
            <span className="text-xs text-text-muted tabular">
              ({result.executionTimeMs}ms)
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-error-50 border border-error-500/30 text-error-700 rounded-lg text-sm font-mono">
          <div className="font-bold mb-1">Execution Failure:</div>
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Test Cases Output Matrix */}
      <div className="space-y-3 pt-1">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
          Evaluation Test Cases:
        </span>

        <div className="grid grid-cols-1 gap-3">
          {testCases.map((tc, index) => {
            const caseResult = result?.results.find((r) => r.testCaseId === tc.id);
            const isEvaluated = Boolean(caseResult);
            const isPassed = caseResult?.passed ?? false;

            return (
              <div
                key={tc.id}
                className="bg-canvas border border-border rounded-lg p-3.5 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text">
                      Case {index + 1}:
                    </span>
                    <span className="text-text-muted">
                      {tc.description}
                    </span>
                  </div>

                  {isEvaluated && (
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                        isPassed
                          ? 'bg-success-50 text-success-700 border border-success-200'
                          : 'bg-error-50 text-error-700 border border-error-200'
                      }`}
                    >
                      {isPassed ? 'Passed' : 'Failed'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-text-muted pt-1">
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase tracking-wider">
                      Input Arguments:
                    </span>
                    <span className="text-text font-semibold">
                      {JSON.stringify(tc.input)}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-[10px] uppercase tracking-wider">
                      Expected Output:
                    </span>
                    <span className="text-text font-semibold">
                      {JSON.stringify(tc.expectedOutput)}
                    </span>
                  </div>

                  {isEvaluated && !isPassed && (
                    <div className="sm:col-span-2 text-error-600 bg-error-50/50 p-2 rounded border border-error-200">
                      <span className="block text-[10px] uppercase tracking-wider font-bold">
                        Actual Output / Error:
                      </span>
                      <span>
                        {caseResult?.error
                          ? caseResult.error
                          : JSON.stringify(caseResult?.actualOutput)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
