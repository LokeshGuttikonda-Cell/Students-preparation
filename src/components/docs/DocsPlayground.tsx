'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { DocPlayground } from '../../lib/docs-catalog';
import { Button } from '../ui/Button';

interface DocsPlaygroundProps {
  playground: DocPlayground;
}

export const DocsPlayground: React.FC<DocsPlaygroundProps> = ({ playground }) => {
  const [code, setCode] = useState<string>(playground.initialCode);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleRun = () => {
    setIsRunning(true);
    setOutput(null);

    // Simulate compiling and running code in a secure sandbox
    setTimeout(() => {
      setIsRunning(false);
      setOutput(playground.expectedOutput);
      setExecutionTime(Math.floor(Math.random() * 25) + 12);
    }, 450);
  };

  const handleReset = () => {
    setCode(playground.initialCode);
    setOutput(null);
    setExecutionTime(null);
  };

  return (
    <div
      id="sec-playground"
      className="my-8 rounded-2xl border-2 border-primary-200/80 bg-surface shadow-md overflow-hidden"
    >
      {/* Playground Header */}
      <div className="px-5 py-3.5 bg-primary-950 text-white flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">▶️</span>
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Interactive Code Playground</span>
              <span className="text-[10px] font-mono uppercase bg-primary-800 text-primary-200 px-2 py-0.5 rounded border border-primary-700">
                {playground.language}
              </span>
            </h3>
            <p className="text-[11px] text-primary-300">
              Run and modify this code snippet in-situ to test execution behavior.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={isRunning}
            className="text-xs bg-primary-900/60 border-primary-700 text-primary-200 hover:bg-primary-800"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            {isRunning ? (
              <>
                <span className="inline-block animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                <span>Compiling...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Run Code</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor & Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border bg-neutral-950">
        {/* Code Input */}
        <div className="flex flex-col">
          <div className="px-4 py-1.5 bg-neutral-900 text-[11px] font-mono text-neutral-400 border-b border-neutral-800 flex items-center justify-between">
            <span>Editor (Source Code)</span>
            <span>UTF-8</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 font-mono text-xs bg-neutral-950 text-neutral-100 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500 leading-relaxed"
            spellCheck={false}
            aria-label="Code editor input"
          />
        </div>

        {/* Terminal Output */}
        <div className="flex flex-col bg-neutral-950">
          <div className="px-4 py-1.5 bg-neutral-900 text-[11px] font-mono text-neutral-400 border-b border-neutral-800 flex items-center justify-between">
            <span>Standard Output (stdout)</span>
            {executionTime && (
              <span className="text-success-400 font-mono text-[10px]">
                Done in {executionTime}ms (exit 0)
              </span>
            )}
          </div>
          <div className="p-4 h-64 overflow-y-auto font-mono text-xs text-neutral-200">
            {isRunning ? (
              <div className="flex items-center gap-2 text-neutral-400 italic">
                <span className="animate-pulse">●</span>
                <span>Executing bytecode in sandbox environment...</span>
              </div>
            ) : output ? (
              <pre className="text-emerald-400 whitespace-pre-wrap font-mono m-0 p-0 bg-transparent">
                {output}
              </pre>
            ) : (
              <div className="text-neutral-600 italic">
                Click &ldquo;Run Code&rdquo; above to compile and execute this program.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info & Sandbox Deep-Link */}
      <div className="p-3 bg-surface-muted border-t border-border flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="text-text-muted text-[11px]">
          {playground.explanation}
        </span>
        <Link href={'/sandbox' as Route}>
          <Button variant="secondary" size="sm" className="text-xs">
            Open in Full Multi-File Sandbox &rarr;
          </Button>
        </Link>
      </div>
    </div>
  );
};
