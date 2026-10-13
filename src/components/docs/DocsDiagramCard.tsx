'use client';

import React, { useState } from 'react';

interface DocsDiagramCardProps {
  title?: string;
  diagramAscii: string;
  caption?: string;
}

export const DocsDiagramCard: React.FC<DocsDiagramCardProps> = ({
  title = 'System Architecture & Memory Layout Diagram',
  diagramAscii,
  caption,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(diagramAscii);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <figure className="my-6 rounded-xl border border-border bg-surface-subtle overflow-hidden shadow-xs">
      {/* Diagram Header */}
      <div className="px-4 py-2 bg-surface border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">📐</span>
          <figcaption className="text-xs font-bold text-text uppercase tracking-wide">
            {title}
          </figcaption>
        </div>
        <button
          onClick={handleCopy}
          className="text-[11px] font-mono text-text-muted hover:text-text transition-colors"
          aria-label="Copy diagram"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Monospace Diagram Area */}
      <div className="p-4 overflow-x-auto bg-neutral-900 text-primary-300 font-mono text-xs leading-tight">
        <pre className="m-0 p-0 whitespace-pre bg-transparent">
          {diagramAscii}
        </pre>
      </div>

      {caption && (
        <div className="p-2.5 text-[11px] text-text-muted bg-surface border-t border-border">
          <strong>Key Insight:</strong> {caption}
        </div>
      )}
    </figure>
  );
};
