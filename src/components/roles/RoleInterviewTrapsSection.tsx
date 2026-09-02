'use client';

import React, { useEffect, useState } from 'react';
import { getRoleInterviewTraps, type RoleTrapItem } from '../../lib/remediation-client';
import { Card, CardContent } from '../ui/Card';

export interface RoleInterviewTrapsSectionProps {
  roleSlug: string;
}

export function RoleInterviewTrapsSection({ roleSlug }: RoleInterviewTrapsSectionProps) {
  const [traps, setTraps] = useState<RoleTrapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRoleInterviewTraps(roleSlug)
      .then((data) => {
        setTraps(data);
      })
      .catch(() => {
        setTraps([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [roleSlug]);

  if (isLoading || traps.length === 0) {
    return null;
  }

  return (
    <section aria-label="Role Interview Traps" className="space-y-4 pt-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
              Recruiter Insight
            </span>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200">
              Trap Alert
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-text">
            Classic Interview Traps &amp; Anti-Patterns
          </h2>
          <p className="text-xs text-text-muted">
            High-frequency distractor patterns technical recruiters use to test real-world depth for this role.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {traps.map((trap) => (
          <Card key={trap.id} className="border-border hover:border-amber-300 transition-colors shadow-xs">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text">
                  {trap.title}
                </h3>
                <span className="text-[10px] font-mono text-text-muted bg-canvas px-2 py-0.5 rounded border border-border">
                  {trap.topicName}
                </span>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {trap.trapDescription}
              </p>

              <div className="space-y-2 pt-1 font-mono text-[11px]">
                <div className="p-2.5 bg-error-50/50 border border-error-200 rounded text-error-800">
                  <span className="block font-bold text-[10px] uppercase tracking-wider mb-1">
                    ✗ Anti-Pattern:
                  </span>
                  <code>{trap.antiPatternExample}</code>
                </div>

                <div className="p-2.5 bg-success-50/50 border border-success-200 rounded text-success-800">
                  <span className="block font-bold text-[10px] uppercase tracking-wider mb-1">
                    ✓ Recommended Solution:
                  </span>
                  <code>{trap.correctPatternExample}</code>
                </div>
              </div>

              <div className="text-xs text-primary-900 bg-primary-50/50 p-2.5 rounded border border-primary-200">
                <strong className="block text-[10px] uppercase tracking-wider font-bold mb-0.5">
                  Interview Strategy Tip:
                </strong>
                <span>{trap.interviewTip}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
