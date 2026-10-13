'use client';

import React from 'react';
import type { DocInterviewerGotcha } from '../../lib/docs-catalog';

interface DocsInterviewGotchasProps {
  gotchas: DocInterviewerGotcha[];
}

export const DocsInterviewGotchas: React.FC<DocsInterviewGotchasProps> = ({ gotchas }) => {
  if (!gotchas || gotchas.length === 0) return null;

  return (
    <section id="sec-gotchas" className="my-8 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <span className="text-xl">⚠️</span>
        <h3 className="text-lg font-bold text-text tracking-tight">
          Senior Interview Traps &amp; Production Pitfalls
        </h3>
      </div>

      <div className="space-y-4">
        {gotchas.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/50 space-y-2 shadow-xs"
          >
            <div className="flex items-start gap-2">
              <span className="text-amber-800 font-bold text-sm">#{idx + 1} Trap:</span>
              <h4 className="font-bold text-text text-sm">{item.trap}</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-red-50/80 border border-red-200 text-red-900 space-y-1">
                <span className="font-bold text-[11px] uppercase tracking-wide text-red-700 block">
                  ❌ Candidate Misconception
                </span>
                <p className="leading-relaxed">{item.misconception}</p>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-bold text-[11px] uppercase tracking-wide text-emerald-700 block">
                  ✓ Production Countermeasure
                </span>
                <p className="leading-relaxed">{item.counterMeasure}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
