'use client';

import React, { useState } from 'react';
import type { DocCodeSnippet, DocMultiLanguageSnippet } from '../../lib/docs-catalog';

interface DocsCodeTabsProps {
  primarySnippet?: DocCodeSnippet;
  multiSnippets?: DocMultiLanguageSnippet[];
}

interface TabSnippet {
  language: string;
  label: string;
  code: string;
}

export const DocsCodeTabs: React.FC<DocsCodeTabsProps> = ({
  primarySnippet,
  multiSnippets = [],
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const tabs: TabSnippet[] = multiSnippets.length > 0
    ? multiSnippets
    : primarySnippet
    ? [{ language: primarySnippet.language, label: primarySnippet.language.toUpperCase(), code: primarySnippet.code }]
    : [];

  if (tabs.length === 0) return null;

  const currentTab = tabs[activeTab] || tabs[0];

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentTab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = currentTab.code.trim().split('\n');

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-lg my-5">
      {/* Code Header & Language Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab, idx) => {
            const isActive = idx === activeTab;
            return (
              <button
                key={tab.label}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1 rounded-md text-xs font-semibold font-mono transition-all ${
                  isActive
                    ? 'bg-neutral-800 text-primary-300 shadow-xs border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 text-xs font-mono font-medium rounded border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors flex items-center gap-1 shrink-0"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <span className="text-success-400">✓</span>
              <span className="text-success-400">Copied!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed flex">
        <div className="select-none text-neutral-600 text-right pr-4 border-r border-neutral-800 space-y-0.5">
          {lines.map((_, i) => (
            <div key={i} className="h-5">
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="pl-4 text-neutral-100 overflow-x-auto whitespace-pre space-y-0.5 flex-1 m-0 p-0 bg-transparent">
          {lines.map((line, i) => (
            <div key={i} className="h-5">
              {line}
            </div>
          ))}
        </pre>
      </div>

      {primarySnippet?.explanation && tabs.length === 1 && (
        <div className="px-4 py-2.5 bg-neutral-900/90 border-t border-neutral-800/80 text-[11px] text-neutral-400 leading-normal">
          <strong className="text-neutral-200">Execution Note:</strong> {primarySnippet.explanation}
        </div>
      )}
    </div>
  );
};
