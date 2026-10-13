'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../components/ui/Card';
import {
  CURATED_SQL_SCENARIOS,
  simulateOptimization,
  generateSqlOptimizationMarkdown,
  exportSqlOptimizationPdf,
  downloadFile,
  loadSavedSqlOptimizationState,
  saveSqlOptimizationRecord,
  type QueryScenario,
  type TableIndex,
  type OptimizationResult,
  type ExecutionPlanNode,
} from '../../../lib/sql-optimizer-client';

export default function SqlOptimizerPage() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    CURATED_SQL_SCENARIOS[0].id,
  );
  const [activeTab, setActiveTab] = useState<'plan' | 'tuning' | 'scorecard'>(
    'plan',
  );

  // Proposed indexes & query rewrite state
  const [proposedIndexes, setProposedIndexes] = useState<TableIndex[]>([]);
  const [rewrittenQuery, setRewrittenQuery] = useState<string>('');
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);

  // New index builder form state
  const [newIndexTable, setNewIndexTable] = useState<string>('');
  const [newIndexName, setNewIndexName] = useState<string>('');
  const [newIndexColumns, setNewIndexColumns] = useState<string>('');
  const [newIndexInclude, setNewIndexInclude] = useState<string>('');
  const [newIndexFilter, setNewIndexFilter] = useState<string>('');

  // Socratic guidance hints
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1);

  // Current Scenario
  const currentScenario = useMemo<QueryScenario>(() => {
    return (
      CURATED_SQL_SCENARIOS.find((s) => s.id === selectedScenarioId) ||
      CURATED_SQL_SCENARIOS[0]
    );
  }, [selectedScenarioId]);

  // Load saved state on scenario switch
  useEffect(() => {
    const saved = loadSavedSqlOptimizationState();
    const scenarioRecord = saved[currentScenario.id];

    if (scenarioRecord) {
      setProposedIndexes(scenarioRecord.proposedIndexes || []);
      setRewrittenQuery(scenarioRecord.rewrittenQuery || currentScenario.originalQuery);
      setOptimizationResult(scenarioRecord.result || null);
    } else {
      setProposedIndexes([]);
      setRewrittenQuery(currentScenario.originalQuery);
      setOptimizationResult(null);
    }

    setNewIndexTable(currentScenario.tables[0]?.name || '');
    setNewIndexName('');
    setNewIndexColumns('');
    setNewIndexInclude('');
    setNewIndexFilter('');
    setRevealedHintIndex(-1);
    setActiveTab('plan');
  }, [currentScenario]);

  // Add a candidate index
  const handleAddIndex = () => {
    if (!newIndexTable || !newIndexColumns.trim()) return;

    const cols = newIndexColumns
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const incCols = newIndexInclude
      ? newIndexInclude
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : undefined;

    const autoName =
      newIndexName.trim() ||
      `idx_${newIndexTable}_${cols.join('_')}`.slice(0, 63);

    const newIndex: TableIndex = {
      name: autoName,
      tableName: newIndexTable,
      columns: cols,
      includeColumns: incCols && incCols.length > 0 ? incCols : undefined,
      isPartial: Boolean(newIndexFilter.trim()),
      filterCondition: newIndexFilter.trim() || undefined,
    };

    const updated = [...proposedIndexes, newIndex];
    setProposedIndexes(updated);

    saveSqlOptimizationRecord({
      scenarioId: currentScenario.id,
      proposedIndexes: updated,
      rewrittenQuery,
      result: optimizationResult || undefined,
      lastUpdated: new Date().toISOString(),
    });

    setNewIndexName('');
    setNewIndexColumns('');
    setNewIndexInclude('');
    setNewIndexFilter('');
  };

  // Remove a candidate index
  const handleRemoveIndex = (indexName: string) => {
    const updated = proposedIndexes.filter((idx) => idx.name !== indexName);
    setProposedIndexes(updated);

    saveSqlOptimizationRecord({
      scenarioId: currentScenario.id,
      proposedIndexes: updated,
      rewrittenQuery,
      result: optimizationResult || undefined,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Run simulation & benchmark
  const handleRunSimulation = () => {
    const result = simulateOptimization(
      currentScenario,
      proposedIndexes,
      rewrittenQuery,
    );
    setOptimizationResult(result);
    setActiveTab('scorecard');

    saveSqlOptimizationRecord({
      scenarioId: currentScenario.id,
      proposedIndexes,
      rewrittenQuery,
      result,
      lastUpdated: new Date().toISOString(),
    });
  };

  // Exporters
  const handleExportMarkdown = () => {
    if (!optimizationResult) return;
    const md = generateSqlOptimizationMarkdown(
      currentScenario,
      optimizationResult,
      proposedIndexes,
      rewrittenQuery,
    );
    downloadFile(
      `sql-optimization-${currentScenario.id}-report.md`,
      md,
      'text/markdown',
    );
  };

  const handleExportPdf = () => {
    if (!optimizationResult) return;
    exportSqlOptimizationPdf(
      currentScenario,
      optimizationResult,
      proposedIndexes,
      rewrittenQuery,
    );
  };

  // Difficulty badge variant mapping
  const getDifficultyBadgeVariant = (diff: string) => {
    switch (diff) {
      case 'Expert':
        return 'error';
      case 'Advanced':
        return 'primary';
      default:
        return 'warning';
    }
  };

  // Render plan tree node recursively
  const renderPlanNode = (node: ExecutionPlanNode, depth = 0) => {
    return (
      <div
        key={node.id}
        style={{ marginLeft: `${depth * 24}px` }}
        className="my-2"
      >
        <div
          className={`p-3.5 rounded-lg border text-xs transition-all ${
            node.isBottleneck
              ? 'border-error-300 bg-error-50/50 shadow-xs'
              : 'border-border bg-surface'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text text-sm">
                {depth > 0 ? '↳ ' : ''}
                {node.nodeType}
              </span>
              {node.relationName && (
                <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded font-mono text-[11px]">
                  on {node.relationName}
                </span>
              )}
              {node.indexName && (
                <span className="bg-primary-50 text-primary-800 px-2 py-0.5 rounded font-mono text-[11px] border border-primary-200">
                  using {node.indexName}
                </span>
              )}
              {node.isBottleneck && (
                <Badge variant="error">PERFORMANCE BOTTLENECK</Badge>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-text-muted font-mono">
              <span>
                Cost: {node.startupCost}..{node.totalCost.toLocaleString()}
              </span>
              <span>Rows: {node.actualRows.toLocaleString()}</span>
              <span>Time: {node.actualTimeMs} ms</span>
            </div>
          </div>

          {node.isBottleneck && node.bottleneckReason && (
            <p className="text-error-800 font-semibold mt-1.5 text-xs">
              ⚠️ Root Cause: {node.bottleneckReason}
            </p>
          )}

          {node.filterCondition && (
            <div className="mt-2 text-[11px] font-mono text-neutral-700 bg-neutral-50 p-1.5 rounded border border-neutral-200">
              Filter: {node.filterCondition}
            </div>
          )}

          {node.indexCond && (
            <div className="mt-2 text-[11px] font-mono text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200">
              Index Cond: {node.indexCond}
            </div>
          )}

          {node.sortKey && (
            <div className="mt-2 text-[11px] font-mono text-text-muted bg-neutral-50 p-1.5 rounded border border-neutral-200">
              Sort Key: {node.sortKey}
            </div>
          )}
        </div>

        {node.children &&
          node.children.map((child) => renderPlanNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Scenario Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-text">
              SQL Execution Plan & Index Tuning Studio
            </h1>
            <Badge variant="primary">Industrial Mode</Badge>
            <Badge variant="neutral">$0.00 Local Compute</Badge>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Diagnose full table scans, Cartesian joins, and non-SARGable
            predicates on multi-million row enterprise databases.
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="scenario-select"
            className="text-xs font-semibold text-text-muted uppercase tracking-wider"
          >
            Scenario:
          </label>
          <select
            id="scenario-select"
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="px-3 py-1.5 text-sm font-medium bg-surface border border-border rounded-md shadow-xs focus:ring-2 focus:ring-primary-500 focus:outline-hidden text-text"
          >
            {CURATED_SQL_SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.domain} | {sc.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario Metadata & Scale Banner */}
      <Card className="bg-surface border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-text-muted">
                  #{currentScenario.id}
                </span>
                <h2 className="text-lg font-bold text-text">
                  {currentScenario.title}
                </h2>
                <Badge variant={getDifficultyBadgeVariant(currentScenario.difficulty)}>
                  {currentScenario.difficulty}
                </Badge>
                <Badge variant="neutral">{currentScenario.domain}</Badge>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {currentScenario.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                <span>
                  <strong>Target Service:</strong> {currentScenario.targetService}
                </span>
                <span>
                  <strong>Database Tables:</strong>{' '}
                  {currentScenario.tables
                    .map(
                      (t) =>
                        `${t.name} (${(t.rowCount / 1000000).toFixed(1)}M rows)`,
                    )
                    .join(', ')}
                </span>
              </div>
            </div>

            {/* Scale Chips */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <div className="px-3 py-2 bg-neutral-50 rounded-md border border-neutral-200 text-center">
                <span className="text-[10px] text-text-muted block uppercase font-bold">
                  Total Records
                </span>
                <span className="text-sm font-bold text-text">
                  {(
                    currentScenario.tables.reduce((acc, t) => acc + t.rowCount, 0) /
                    1000000
                  ).toFixed(1)}
                  M
                </span>
              </div>
              <div className="px-3 py-2 bg-error-50 rounded-md border border-error-200 text-center">
                <span className="text-[10px] text-error-700 block uppercase font-bold">
                  Original Latency
                </span>
                <span className="text-sm font-bold text-error-800">
                  {currentScenario.unoptimizedPlan.actualTimeMs} ms
                </span>
              </div>
              <div className="px-3 py-2 bg-emerald-50 rounded-md border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 block uppercase font-bold">
                  Target Latency
                </span>
                <span className="text-sm font-bold text-emerald-800">
                  &le; {currentScenario.goldenOptimizedPlan.actualTimeMs} ms
                </span>
              </div>
            </div>
          </div>

          {/* Socratic Hints Collapsible */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-warning-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Socratic Tuning Guidance
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary-700"
                onClick={() =>
                  setRevealedHintIndex((prev) =>
                    prev < currentScenario.socraticHints.length - 1
                      ? prev + 1
                      : prev,
                  )
                }
                disabled={
                  revealedHintIndex >= currentScenario.socraticHints.length - 1
                }
              >
                {revealedHintIndex < currentScenario.socraticHints.length - 1
                  ? `Reveal Hint (${revealedHintIndex + 2}/${currentScenario.socraticHints.length})`
                  : 'All Hints Revealed'}
              </Button>
            </div>

            {revealedHintIndex >= 0 && (
              <div className="mt-2 space-y-1.5">
                {currentScenario.socraticHints
                  .slice(0, revealedHintIndex + 1)
                  .map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-warning-50/70 border border-warning-200 rounded-md text-xs text-warning-900 flex items-start gap-2"
                    >
                      <span className="font-bold text-warning-800">
                        Hint {i + 1}:
                      </span>
                      <span>{h}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Studio Navigation Tabs */}
      <div className="flex border-b border-border space-x-4">
        <button
          onClick={() => setActiveTab('plan')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'plan'
              ? 'border-primary-600 text-primary-800'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          1. Execution Plan Visualizer
        </button>
        <button
          onClick={() => setActiveTab('tuning')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'tuning'
              ? 'border-primary-600 text-primary-800'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          2. Index Architect & Query Tuner
        </button>
        <button
          onClick={() => setActiveTab('scorecard')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'scorecard'
              ? 'border-primary-600 text-primary-800'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          3. Performance Benchmark & Scorecard
        </button>
      </div>

      {/* TAB 1: Execution Plan Visualizer */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Tree Column */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Simulated Query Execution Plan (EXPLAIN ANALYZE)
                    </CardTitle>
                    <Badge variant="error">
                      Cost: {currentScenario.unoptimizedPlan.totalCost.toLocaleString()}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted mt-1">
                    Visual hierarchy of execution nodes evaluated by the database planner.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {renderPlanNode(currentScenario.unoptimizedPlan)}
                </CardContent>
              </Card>

              {/* Original SQL Query Box */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    Current Execution Query
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="p-3 bg-neutral-900 text-emerald-400 rounded-md font-mono text-xs overflow-x-auto">
                    {currentScenario.originalQuery}
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Schema Inspector Column */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Database Schema Inspector</CardTitle>
                  <p className="text-xs text-text-muted mt-1">
                    Table definitions, column cardinalities, and existing index catalogs.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentScenario.tables.map((table) => (
                    <div
                      key={table.name}
                      className="p-3 border border-border rounded-lg bg-surface text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text font-mono text-sm">
                          {table.name}
                        </span>
                        <span className="text-text-muted text-[11px]">
                          {(table.rowCount / 1000000).toFixed(1)}M rows (~
                          {(table.sizeBytes / 1000000000).toFixed(2)} GB)
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-text-muted block">
                          Columns & Cardinality:
                        </span>
                        <div className="space-y-0.5">
                          {table.columns.map((col) => (
                            <div
                              key={col.name}
                              className="flex items-center justify-between text-[11px] font-mono text-text-muted"
                            >
                              <span>
                                {col.name}{' '}
                                <span className="text-neutral-400">
                                  ({col.type})
                                </span>
                              </span>
                              <span>
                                {col.cardinality.toLocaleString()} dist.
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <span className="text-[10px] uppercase font-bold text-text-muted block">
                          Existing Indexes:
                        </span>
                        {table.existingIndexes.map((idx) => (
                          <div
                            key={idx.name}
                            className="text-[11px] font-mono text-text flex items-center justify-between mt-1"
                          >
                            <span>{idx.name}</span>
                            <span className="text-text-muted">
                              ({idx.columns.join(', ')})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Diagnosis Alert */}
              <div className="p-4 bg-error-50/70 border border-error-200 rounded-lg text-xs space-y-2 text-error-900">
                <span className="font-bold flex items-center gap-1.5 text-error-800">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Bottleneck Summary:
                </span>
                <p className="leading-relaxed">
                  {currentScenario.antiPatternSummary}
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('tuning')}
                    className="w-full text-xs font-bold"
                  >
                    Proceed to Index Architect &rarr;
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Index Architect & Query Tuner */}
      {activeTab === 'tuning' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Index Architect */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Candidate Index Architect</CardTitle>
                <p className="text-xs text-text-muted mt-1">
                  Design composite B-Trees adhering to the Leading Column Rule and covering index clauses.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Index Builder Form */}
                <div className="p-4 bg-neutral-50 border border-border rounded-lg space-y-3">
                  <span className="text-xs font-bold text-text block">
                    + Design New Index
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block">
                        Target Table:
                      </label>
                      <select
                        value={newIndexTable}
                        onChange={(e) => setNewIndexTable(e.target.value)}
                        className="w-full text-xs p-1.5 border border-border rounded bg-surface text-text"
                      >
                        {currentScenario.tables.map((t) => (
                          <option key={t.name} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block">
                        Index Name:
                      </label>
                      <input
                        type="text"
                        value={newIndexName}
                        onChange={(e) => setNewIndexName(e.target.value)}
                        placeholder="e.g. idx_orders_cust_created"
                        className="w-full text-xs p-1.5 border border-border rounded bg-surface text-text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-text-muted block">
                      Indexed Columns (Ordered by Selectivity, comma-separated):
                    </label>
                    <input
                      type="text"
                      value={newIndexColumns}
                      onChange={(e) => setNewIndexColumns(e.target.value)}
                      placeholder="e.g. customer_id, status, created_at"
                      className="w-full text-xs p-1.5 border border-border rounded bg-surface text-text font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block">
                        Covering Columns (INCLUDE, comma-separated):
                      </label>
                      <input
                        type="text"
                        value={newIndexInclude}
                        onChange={(e) => setNewIndexInclude(e.target.value)}
                        placeholder="e.g. total_amount"
                        className="w-full text-xs p-1.5 border border-border rounded bg-surface text-text font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-text-muted block">
                        Partial Filter (WHERE clause):
                      </label>
                      <input
                        type="text"
                        value={newIndexFilter}
                        onChange={(e) => setNewIndexFilter(e.target.value)}
                        placeholder="e.g. status = 'ACTIVE'"
                        className="w-full text-xs p-1.5 border border-border rounded bg-surface text-text font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddIndex}
                      disabled={!newIndexColumns.trim()}
                      className="text-xs font-bold"
                    >
                      Add Index to Proposal
                    </Button>
                  </div>
                </div>

                {/* Proposed Indexes List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text block">
                    Proposed Indexes for Simulation ({proposedIndexes.length})
                  </span>

                  {proposedIndexes.length === 0 ? (
                    <p className="text-xs text-text-muted italic">
                      No indexes proposed yet. Use the architect form above to propose candidate indexes.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {proposedIndexes.map((idx) => (
                        <div
                          key={idx.name}
                          className="p-3 bg-surface border border-border rounded-lg flex items-center justify-between text-xs font-mono"
                        >
                          <div>
                            <span className="font-bold text-primary-900 block">
                              CREATE INDEX {idx.name} ON {idx.tableName} (
                              {idx.columns.join(', ')})
                            </span>
                            {idx.includeColumns && (
                              <span className="text-[11px] text-text-muted block">
                                INCLUDE ({idx.includeColumns.join(', ')})
                              </span>
                            )}
                            {idx.isPartial && (
                              <span className="text-[11px] text-accent-700 block">
                                WHERE {idx.filterCondition}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-error-700 hover:bg-error-50 h-7"
                            onClick={() => handleRemoveIndex(idx.name)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Column 2: Query Rewriter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SQL Query Rewriter</CardTitle>
                <p className="text-xs text-text-muted mt-1">
                  Eliminate non-SARGable clauses, replace OFFSET with Keyset cursors, or optimize JOIN topologies.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  value={rewrittenQuery}
                  onChange={(e) => setRewrittenQuery(e.target.value)}
                  rows={9}
                  className="w-full text-xs font-mono p-3 bg-neutral-900 text-emerald-400 rounded-md border border-neutral-700 focus:ring-2 focus:ring-primary-500 focus:outline-hidden"
                />

                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRewrittenQuery(currentScenario.originalQuery)}
                    className="text-xs"
                  >
                    Reset to Original Query
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleRunSimulation}
                    className="text-xs font-bold"
                  >
                    ⚡ Run Execution Plan Simulation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: Performance Benchmark & Scorecard */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          {!optimizationResult ? (
            <Card>
              <CardContent className="p-12 text-center space-y-3">
                <p className="text-sm text-text-muted">
                  No simulation executed yet. Head over to the Index Architect &amp; Query Tuner tab and click &quot;Run Execution Plan Simulation&quot;.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('tuning')}
                  className="text-xs"
                >
                  Open Index Architect
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Scorecard Hero Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-surface rounded-lg border border-border text-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">
                    Tuning Grade
                  </span>
                  <span
                    className={`text-3xl font-black ${
                      optimizationResult.grade === 'S' ||
                      optimizationResult.grade === 'A'
                        ? 'text-emerald-700'
                        : optimizationResult.grade === 'B'
                        ? 'text-primary-700'
                        : 'text-error-700'
                    }`}
                  >
                    {optimizationResult.grade}
                  </span>
                  <span className="text-[10px] text-text-muted block mt-1">
                    Grade {optimizationResult.grade} (
                    {optimizationResult.executionTimeReductionPercent}% Speedup)
                  </span>
                </div>

                <div className="p-4 bg-surface rounded-lg border border-border text-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">
                    Latency Drop
                  </span>
                  <span className="text-2xl font-bold text-text">
                    {optimizationResult.executionTimeReductionPercent}%
                  </span>
                  <span className="text-[10px] text-text-muted block mt-1">
                    {optimizationResult.originalTimeMs}ms &rarr;{' '}
                    {optimizationResult.optimizedTimeMs}ms
                  </span>
                </div>

                <div className="p-4 bg-surface rounded-lg border border-border text-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">
                    Cost Reduction
                  </span>
                  <span className="text-2xl font-bold text-text">
                    {optimizationResult.totalCostReductionPercent}%
                  </span>
                  <span className="text-[10px] text-text-muted block mt-1">
                    {optimizationResult.originalCost.toLocaleString()} &rarr;{' '}
                    {optimizationResult.optimizedCost.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 bg-surface rounded-lg border border-border text-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold block">
                    Buffer Hits
                  </span>
                  <span className="text-2xl font-bold text-text">
                    {optimizationResult.bufferHits.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-text-muted block mt-1">
                    {optimizationResult.bufferReads} physical reads
                  </span>
                </div>
              </div>

              {/* Badges Earned */}
              {optimizationResult.earnedBadges.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-text">
                    Milestones & Badges Earned:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {optimizationResult.earnedBadges.map((badge) => (
                      <Badge key={badge} variant="success">
                        🏆 {badge.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Summary */}
              <div className="p-4 bg-neutral-50 border border-border rounded-lg text-xs text-text leading-relaxed">
                <strong>Evaluation Feedback:</strong>{' '}
                {optimizationResult.evaluationFeedback}
              </div>

              {/* Simulated Optimized Plan Preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Simulated Resulting Plan Tree
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderPlanNode(optimizationResult.simulatedPlan)}
                </CardContent>
              </Card>

              {/* Golden Reference Reveal */}
              <Card className="border-primary-200 bg-primary-50/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary-900">
                    Industrial Golden Reference Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-text block mb-1">
                      Optimal Covering Index Definitions:
                    </span>
                    {currentScenario.goldenIndexes.map((g) => (
                      <pre
                        key={g.name}
                        className="p-2.5 bg-neutral-900 text-emerald-400 rounded font-mono text-[11px] overflow-x-auto my-1"
                      >
                        CREATE INDEX {g.name} ON {g.tableName} (
                        {g.columns.join(', ')})
                        {g.includeColumns
                          ? ` INCLUDE (${g.includeColumns.join(', ')})`
                          : ''}
                        {g.isPartial ? ` WHERE ${g.filterCondition}` : ''};
                      </pre>
                    ))}
                  </div>

                  <div>
                    <span className="font-bold text-text block mb-1">
                      Canonical SARGable Query:
                    </span>
                    <pre className="p-2.5 bg-neutral-900 text-emerald-400 rounded font-mono text-[11px] overflow-x-auto">
                      {currentScenario.goldenRewriteQuery}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Export Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportPdf}
                    className="text-xs"
                  >
                    Download Tuning Audit (PDF)
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportMarkdown}
                    className="text-xs"
                  >
                    Export Markdown
                  </Button>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('tuning')}
                  className="text-xs"
                >
                  Adjust Tuning Proposal
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
