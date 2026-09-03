'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SqlQuerySandbox } from '../../../components/sandbox/SqlQuerySandbox';
import { CodeLogicSandbox } from '../../../components/sandbox/CodeLogicSandbox';
import { Button } from '../../../components/ui/Button';

export default function SandboxPage() {
  const [activeTab, setActiveTab] = useState<'SQL' | 'CODE'>('SQL');

  return (
    <div className="min-h-dvh bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-700">
                Applied Technical Lab
              </span>
              <span className="text-[11px] font-semibold bg-primary-50 text-primary-800 px-2 py-0.5 rounded-full border border-primary-200">
                Interactive Code &amp; SQL Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">
              SQL &amp; Code Logic Validation Sandbox
            </h1>
            <p className="text-sm text-text-muted max-w-2xl">
              Real engineering screening tests your applied execution. Practice running SQL queries
              and algorithmic code against live test scenarios with sub-millisecond in-memory verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="secondary" size="md">
                ← Back to Career Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-border gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('SQL')}
            className={`min-h-[44px] px-5 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'SQL'
                ? 'border-primary-700 text-primary-800'
                : 'border-transparent text-text-muted hover:text-text hover:border-border'
            }`}
          >
            <span>🗄️</span>
            <span>Relational SQL Query Lab</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CODE')}
            className={`min-h-[44px] px-5 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'CODE'
                ? 'border-primary-700 text-primary-800'
                : 'border-transparent text-text-muted hover:text-text hover:border-border'
            }`}
          >
            <span>💻</span>
            <span>Algorithmic Code Logic Lab</span>
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'SQL' ? (
          <div className="space-y-6">
            <SqlQuerySandbox
              title="Employee Directory & Department Aggregations"
              taskDescription="Practice queries like finding average salary per department, highest earners, or hiring dates using the pre-seeded schema."
              expectedQuery="SELECT d.name AS department, COUNT(e.id) AS total_employees, AVG(e.salary) AS avg_salary FROM departments d JOIN employees e ON d.id = e.department_id GROUP BY d.name ORDER BY avg_salary DESC;"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <CodeLogicSandbox
              title="Two-Sum Algorithmic Problem"
              problemDescription="Given an array of numbers and a target value, determine if any two elements add up to exactly the target value in O(n) linear time."
            />
          </div>
        )}
      </div>
    </div>
  );
}
