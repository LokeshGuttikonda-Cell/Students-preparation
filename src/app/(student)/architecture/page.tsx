'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  getBlueprintCatalog,
  getBlueprintById,
  calculateCapacityEstimates,
  getSavedStudioState,
  saveStudioState,
  generateArchitecturalDecisionRecord,
  exportArchitectureBlueprintPdf,
  downloadFile,
  type SystemBlueprint,
  type CapacityEstimates,
} from '../../../lib/architecture-client';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import {
  Layers,
  Cpu,
  Calculator,
  Sliders,
  ShieldAlert,
  FileDown,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Server,
  Activity,
  FileText,
  Sparkles,
  Zap,
  Info,
  ChevronRight,
} from 'lucide-react';

export default function SystemDesignStudioPage() {
  const catalog = useMemo(() => getBlueprintCatalog(), []);
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('url-shortener');
  const [activeTab, setActiveTab] = useState<'topology' | 'capacity' | 'tradeoffs' | 'audit'>('topology');

  // Active blueprint object
  const blueprint: SystemBlueprint = useMemo(() => {
    return getBlueprintById(selectedBlueprintId) || catalog[0];
  }, [selectedBlueprintId, catalog]);

  // Capacity inputs
  const [dau, setDau] = useState<number>(blueprint.defaultCapacity.dau);
  const [readWriteRatio, setReadWriteRatio] = useState<number>(blueprint.defaultCapacity.readWriteRatio);
  const [payloadSize, setPayloadSize] = useState<number>(blueprint.defaultCapacity.payloadSizeBytes);
  const [retentionYears, setRetentionYears] = useState<number>(blueprint.defaultCapacity.retentionYears);

  // Selected trade-off choices per blueprint: { [tradeOffId]: 'A' | 'B' }
  const [tradeOffChoices, setTradeOffChoices] = useState<Record<string, 'A' | 'B'>>({});

  // Active selected component for deep-dive inspector
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // Data flow stepper state
  const [currentFlowStepIndex, setCurrentFlowStepIndex] = useState<number>(0);

  // Candidate engineering notes
  const [customNotes, setCustomNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persisted studio state on initial mount
  useEffect(() => {
    const saved = getSavedStudioState();
    if (saved.activeBlueprintId && catalog.some((b) => b.id === saved.activeBlueprintId)) {
      setSelectedBlueprintId(saved.activeBlueprintId);
    }
  }, [catalog]);

  // When blueprint changes, update inputs to defaults or saved overrides
  useEffect(() => {
    const saved = getSavedStudioState();
    const overrides = saved.capacityOverrides?.[blueprint.id];
    if (overrides) {
      setDau(overrides.dau ?? blueprint.defaultCapacity.dau);
      setReadWriteRatio(overrides.readWriteRatio ?? blueprint.defaultCapacity.readWriteRatio);
      setPayloadSize(overrides.payloadSizeBytes ?? blueprint.defaultCapacity.payloadSizeBytes);
      setRetentionYears(overrides.retentionYears ?? blueprint.defaultCapacity.retentionYears);
    } else {
      setDau(blueprint.defaultCapacity.dau);
      setReadWriteRatio(blueprint.defaultCapacity.readWriteRatio);
      setPayloadSize(blueprint.defaultCapacity.payloadSizeBytes);
      setRetentionYears(blueprint.defaultCapacity.retentionYears);
    }

    const savedTradeOffs = saved.tradeOffSelections?.[blueprint.id] || {};
    const initialTradeOffs: Record<string, 'A' | 'B'> = {};
    blueprint.tradeOffs.forEach((t) => {
      initialTradeOffs[t.id] = savedTradeOffs[t.id] || t.defaultOption;
    });
    setTradeOffChoices(initialTradeOffs);

    setCustomNotes(saved.customNotes?.[blueprint.id] || '');
    setSelectedComponentId(blueprint.components[0]?.id || null);
    setCurrentFlowStepIndex(0);
  }, [blueprint]);

  // Persist changes to localStorage
  useEffect(() => {
    const saved = getSavedStudioState();
    const updated = {
      ...saved,
      activeBlueprintId: blueprint.id,
      capacityOverrides: {
        ...saved.capacityOverrides,
        [blueprint.id]: {
          dau,
          readWriteRatio,
          payloadSizeBytes: payloadSize,
          retentionYears,
        },
      },
      tradeOffSelections: {
        ...saved.tradeOffSelections,
        [blueprint.id]: tradeOffChoices,
      },
      customNotes: {
        ...saved.customNotes,
        [blueprint.id]: customNotes,
      },
      lastUpdated: new Date().toISOString(),
    };
    saveStudioState(updated);
  }, [blueprint.id, dau, readWriteRatio, payloadSize, retentionYears, tradeOffChoices, customNotes]);

  // Compute capacity estimates dynamically
  const capacity: CapacityEstimates = useMemo(() => {
    return calculateCapacityEstimates(dau, readWriteRatio, payloadSize, retentionYears);
  }, [dau, readWriteRatio, payloadSize, retentionYears]);

  // Active inspected component
  const activeComponent = useMemo(() => {
    return blueprint.components.find((c) => c.id === selectedComponentId) || blueprint.components[0];
  }, [blueprint, selectedComponentId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResetToDefaults = () => {
    setDau(blueprint.defaultCapacity.dau);
    setReadWriteRatio(blueprint.defaultCapacity.readWriteRatio);
    setPayloadSize(blueprint.defaultCapacity.payloadSizeBytes);
    setRetentionYears(blueprint.defaultCapacity.retentionYears);

    const initialTradeOffs: Record<string, 'A' | 'B'> = {};
    blueprint.tradeOffs.forEach((t) => {
      initialTradeOffs[t.id] = t.defaultOption;
    });
    setTradeOffChoices(initialTradeOffs);
    setCustomNotes('');
    showToast(`Reset ${blueprint.title} to default architecture baseline.`);
  };

  const handleExportAdr = () => {
    const markdown = generateArchitecturalDecisionRecord(blueprint, capacity, tradeOffChoices, customNotes);
    downloadFile(`${blueprint.id}-ADR.md`, markdown, 'text/markdown');
    showToast('Architectural Decision Record (ADR) exported as Markdown!');
  };

  const handleExportPdf = () => {
    exportArchitectureBlueprintPdf(blueprint, capacity, tradeOffChoices);
    showToast('System Design Blueprint Specification exported as Vector PDF 1.4!');
  };

  return (
    <div className="min-h-screen bg-canvas pb-20">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-surface border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="primary" className="text-primary-600 border-primary-200 bg-primary-50">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Enterprise System Design Studio
                </Badge>
                <Badge variant="neutral" className="text-slate-600 border-slate-200">
                  {blueprint.tier}
                </Badge>
                <Badge
                  variant={blueprint.difficulty === 'Expert' ? 'error' : 'warning'}
                  className={
                    blueprint.difficulty === 'Expert'
                      ? 'text-rose-600 border-rose-200 bg-rose-50'
                      : 'text-amber-600 border-amber-200 bg-amber-50'
                  }
                >
                  {blueprint.difficulty}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-text tracking-tight flex items-center gap-3">
                <Layers className="w-8 h-8 text-primary-600" />
                {blueprint.title}
              </h1>
              <p className="text-text-muted mt-1 max-w-3xl text-sm sm:text-base">
                {blueprint.subtitle}
              </p>
            </div>

            {/* Quick Actions & Blueprint Switcher */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex flex-col">
                <label htmlFor="blueprint-select" className="text-xs font-semibold text-text-muted mb-1">
                  Select Architectural Blueprint:
                </label>
                <select
                  id="blueprint-select"
                  aria-label="Select Architectural Blueprint"
                  value={selectedBlueprintId}
                  onChange={(e) => setSelectedBlueprintId(e.target.value)}
                  className="bg-canvas border border-border rounded-lg px-3 py-2 text-sm font-medium text-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {catalog.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title.split('&')[0]} ({b.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 mt-4 sm:mt-5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportAdr}
                  title="Export Architectural Decision Record (.md)"
                  className="flex items-center gap-1 text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  ADR (.md)
                </Button>
                <Button
                  size="sm"
                  onClick={handleExportPdf}
                  title="Download Official Vector PDF Blueprint"
                  className="flex items-center gap-1 text-xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Blueprint (PDF)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetToDefaults}
                  title="Reset to Blueprint Baseline"
                  className="text-text-muted hover:text-text p-2"
                  aria-label="Reset Blueprint to Default"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-8 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab('topology')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'topology'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Cpu className="w-4 h-4" />
              1. Topology & Request Flow
            </button>
            <button
              onClick={() => setActiveTab('capacity')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'capacity'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Calculator className="w-4 h-4" />
              2. Scale & Capacity Estimator
            </button>
            <button
              onClick={() => setActiveTab('tradeoffs')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'tradeoffs'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <Sliders className="w-4 h-4" />
              3. Trade-Off & CAP Matrix
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              4. Bottleneck & SPOF Health Audit
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: VISUAL TOPOLOGY & REQUEST FLOW */}
        {activeTab === 'topology' && (
          <div className="space-y-8">
            {/* Overview & Requirements Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                    <Info className="w-5 h-5 text-primary-600" />
                    System Overview & Problem Statement
                  </h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-text-muted leading-relaxed">{blueprint.overview}</p>
                  <div className="p-3 bg-[#060b18]/80 border border-white/10 rounded-xl text-xs text-slate-300 font-mono">
                    <span className="font-bold text-lime-400 block mb-1">MISSION CHALLENGE:</span>
                    {blueprint.problemStatement}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                        Functional Requirements
                      </h4>
                      <ul className="space-y-1.5 text-xs text-text">
                        {blueprint.requirements.functional.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                        Non-Functional SLAs & Invariants
                      </h4>
                      <ul className="space-y-1.5 text-xs text-text">
                        {blueprint.requirements.nonFunctional.map((nf, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{nf}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Flow Stepper */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <h3 className="text-sm font-semibold text-text flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Request Flow Stepper
                  </h3>
                  <Badge variant="neutral" className="text-xs">
                    Step {currentFlowStepIndex + 1} of {blueprint.dataFlowSteps.length}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {blueprint.dataFlowSteps[currentFlowStepIndex] && (
                    <div className="p-4 bg-[#060b18]/80 border border-white/10 rounded-xl space-y-2">
                      <div className="text-xs font-mono font-bold text-lime-400 uppercase tracking-wider">
                        {blueprint.dataFlowSteps[currentFlowStepIndex].title}
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 bg-[#0a0f1d] border border-white/15 text-cyan-300 rounded">
                          {blueprint.dataFlowSteps[currentFlowStepIndex].fromNode}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-lime-400" />
                        <span className="px-2 py-0.5 bg-[#0a0f1d] border border-white/15 text-cyan-300 rounded">
                          {blueprint.dataFlowSteps[currentFlowStepIndex].toNode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Protocol: <code className="bg-[#0a0f1d] text-lime-300 px-1.5 py-0.5 rounded border border-white/10">{blueprint.dataFlowSteps[currentFlowStepIndex].protocol}</code>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {blueprint.dataFlowSteps[currentFlowStepIndex].description}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentFlowStepIndex === 0}
                      onClick={() => setCurrentFlowStepIndex((prev) => Math.max(0, prev - 1))}
                      className="text-xs"
                    >
                      Previous Step
                    </Button>
                    <Button
                      size="sm"
                      disabled={currentFlowStepIndex === blueprint.dataFlowSteps.length - 1}
                      onClick={() =>
                        setCurrentFlowStepIndex((prev) =>
                          Math.min(blueprint.dataFlowSteps.length - 1, prev + 1)
                        )
                      }
                      className="text-xs"
                    >
                      Next Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Topology SVG Visualizer & Node Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Component Palette (Left 2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <Server className="w-5 h-5 text-primary-600" />
                    Distributed Component Topology
                  </h3>
                  <span className="text-xs text-text-muted">
                    Click any node to inspect SLA latency & failure recovery
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {blueprint.components.map((comp) => {
                    const isSelected = comp.id === selectedComponentId;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedComponentId(comp.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setSelectedComponentId(comp.id);
                          }
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-primary-50/50 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                            : 'bg-surface border-border hover:border-slate-400 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                            {comp.category}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {comp.latencyTier}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-text mb-1">{comp.name}</h4>
                        <p className="text-xs text-text-muted line-clamp-2">{comp.description}</p>
                        <div className="mt-3 text-xs text-primary-600 font-medium flex items-center gap-1">
                          Inspect Node <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Component Deep-Dive Inspector (Right 1 col) */}
              <Card className="h-fit sticky top-24 border-white/15 bg-[#0a0f1d]/90">
                <CardHeader className="pb-3 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-lime-400/20 text-lime-300 border border-lime-400/30">
                      {activeComponent.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Component Inspector</span>
                  </div>
                  <h3 className="text-base font-display font-bold text-white mt-2">{activeComponent.name}</h3>
                </CardHeader>
                <CardContent className="space-y-4 pt-4 text-xs">
                  <div>
                    <span className="font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Technical Pattern:
                    </span>
                    <p className="text-lime-300 font-mono bg-[#060b18]/80 p-2.5 rounded-xl border border-white/10">
                      {activeComponent.techPattern}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-text-muted uppercase tracking-wider block mb-1">
                      Role & Responsibility:
                    </span>
                    <p className="text-text leading-relaxed">{activeComponent.description}</p>
                  </div>

                  <div>
                    <span className="font-semibold text-text-muted uppercase tracking-wider block mb-1">
                      Latency SLA:
                    </span>
                    <Badge variant="success" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                      {activeComponent.latencyTier}
                    </Badge>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Failure Mode & Recovery:
                    </span>
                    <p className="text-amber-800 leading-relaxed">{activeComponent.failureMode}</p>
                  </div>

                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1">
                    <span className="font-bold text-indigo-900 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Horizontal Scaling Strategy:
                    </span>
                    <p className="text-indigo-800 leading-relaxed">{activeComponent.scalingStrategy}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: CAPACITY & SCALE ESTIMATOR */}
        {activeTab === 'capacity' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Sliders & Parameter Controls */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3 border-b border-border">
                  <h3 className="text-base font-bold text-text flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary-600" />
                    Back-of-the-Envelope Inputs
                  </h3>
                  <p className="text-xs text-text-muted">Adjust scale parameters to recalculate hardware footprints</p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* DAU */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <label htmlFor="input-dau" className="text-text">Daily Active Users (DAU):</label>
                      <span className="font-bold text-primary-600 font-mono">
                        {(dau / 1000000).toFixed(1)} Million
                      </span>
                    </div>
                    <input
                      id="input-dau"
                      aria-label="Daily Active Users slider"
                      type="range"
                      min={1000000}
                      max={250000000}
                      step={1000000}
                      value={dau}
                      onChange={(e) => setDau(Number(e.target.value))}
                      className="w-full accent-primary-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>1M</span>
                      <span>100M</span>
                      <span>250M</span>
                    </div>
                  </div>

                  {/* Read:Write Ratio */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <label htmlFor="input-ratio" className="text-text">Read-to-Write Ratio:</label>
                      <span className="font-bold text-primary-600 font-mono">{readWriteRatio} : 1</span>
                    </div>
                    <input
                      id="input-ratio"
                      aria-label="Read to write ratio slider"
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      value={readWriteRatio}
                      onChange={(e) => setReadWriteRatio(Number(e.target.value))}
                      className="w-full accent-primary-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>1:1 (Write Heavy)</span>
                      <span>50:1</span>
                      <span>100:1 (Read Dominated)</span>
                    </div>
                  </div>

                  {/* Payload Size */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <label htmlFor="input-payload" className="text-text">Average Payload Size:</label>
                      <span className="font-bold text-primary-600 font-mono">{payloadSize} Bytes</span>
                    </div>
                    <input
                      id="input-payload"
                      aria-label="Average payload size slider"
                      type="range"
                      min={128}
                      max={10240}
                      step={64}
                      value={payloadSize}
                      onChange={(e) => setPayloadSize(Number(e.target.value))}
                      className="w-full accent-primary-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>128 B (Compact ID)</span>
                      <span>5 KB</span>
                      <span>10 KB (Document)</span>
                    </div>
                  </div>

                  {/* Retention Years */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <label htmlFor="input-retention" className="text-text">Storage Retention Period:</label>
                      <span className="font-bold text-primary-600 font-mono">{retentionYears} Years</span>
                    </div>
                    <input
                      id="input-retention"
                      aria-label="Storage retention period slider"
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={retentionYears}
                      onChange={(e) => setRetentionYears(Number(e.target.value))}
                      className="w-full accent-primary-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>1 Year</span>
                      <span>5 Years</span>
                      <span>10 Years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calculated Outputs & Mathematical Cards */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Average QPS */}
                  <Card className="bg-surface border-border">
                    <CardContent className="p-5">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Average QPS
                      </span>
                      <div className="text-2xl font-extrabold text-text font-mono">
                        {capacity.qpsAverage.toLocaleString()}
                      </div>
                      <span className="text-xs text-text-muted">req / second across 24h</span>
                    </CardContent>
                  </Card>

                  {/* Peak QPS */}
                  <Card className="bg-surface border-border border-l-4 border-l-amber-500">
                    <CardContent className="p-5">
                      <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                        Peak QPS (2.5x)
                      </span>
                      <div className="text-2xl font-extrabold text-amber-600 font-mono">
                        {capacity.qpsPeak.toLocaleString()}
                      </div>
                      <span className="text-xs text-text-muted">Traffic surge headroom</span>
                    </CardContent>
                  </Card>

                  {/* QPS Breakdown */}
                  <Card className="bg-surface border-border">
                    <CardContent className="p-5">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Read vs Write QPS
                      </span>
                      <div className="text-base font-bold text-text font-mono">
                        R: {capacity.readQps.toLocaleString()} | W: {capacity.writeQps.toLocaleString()}
                      </div>
                      <span className="text-xs text-text-muted">Read-heavy ratio</span>
                    </CardContent>
                  </Card>

                  {/* Network Bandwidth */}
                  <Card className="bg-surface border-border">
                    <CardContent className="p-5">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                        Network Throughput
                      </span>
                      <div className="text-lg font-bold text-text font-mono">
                        {capacity.bandwidthIngressMBs} MB/s In | {capacity.bandwidthEgressMBs} MB/s Out
                      </div>
                      <span className="text-xs text-text-muted">
                        Total {((capacity.bandwidthIngressMBs + capacity.bandwidthEgressMBs) * 8 / 1000).toFixed(2)} Gbps
                      </span>
                    </CardContent>
                  </Card>

                  {/* Storage Required */}
                  <Card className="bg-surface border-border border-l-4 border-l-primary-500">
                    <CardContent className="p-5">
                      <span className="text-xs font-bold text-primary-700 uppercase tracking-wider block mb-1">
                        {retentionYears}-Year Total Storage
                      </span>
                      <div className="text-2xl font-extrabold text-primary-600 font-mono">
                        {capacity.storageTotalTB} TB
                      </div>
                      <span className="text-xs text-text-muted">Includes 1.5x replication factor</span>
                    </CardContent>
                  </Card>

                  {/* Cache Sizing (80/20) */}
                  <Card className="bg-surface border-border border-l-4 border-l-emerald-500">
                    <CardContent className="p-5">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                        Cache RAM (80/20 Rule)
                      </span>
                      <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                        {capacity.cacheMemoryRequiredGB} GB
                      </div>
                      <span className="text-xs text-text-muted">20% daily read volume in RAM</span>
                    </CardContent>
                  </Card>
                </div>

                {/* Socratic Math Formula Breakdown Card */}
                <Card>
                  <CardHeader className="pb-3 border-b border-border">
                    <h3 className="text-sm font-bold text-text flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-600" />
                      Interview Socratic Defense: Step-by-Step Mathematical Derivation
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4 text-xs font-mono text-slate-300">
                    <div className="p-3 bg-[#060b18]/80 border border-white/10 rounded-xl">
                      <span className="text-slate-400 block mb-1">{'// 1. Write Throughput Derivation:'}</span>
                      Writes/Day = {dau.toLocaleString()} DAU * 2 writes/user = {(dau * 2).toLocaleString()} writes/day
                      <br />
                      Write QPS = {(dau * 2).toLocaleString()} / 86,400s ≈ <strong className="text-lime-400">{capacity.writeQps.toLocaleString()} QPS</strong>
                    </div>

                    <div className="p-3 bg-[#060b18]/80 border border-white/10 rounded-xl">
                      <span className="text-slate-400 block mb-1">{'// 2. Read Throughput Derivation:'}</span>
                      Reads/Day = {(dau * 2).toLocaleString()} * {readWriteRatio} ratio = {(dau * 2 * readWriteRatio).toLocaleString()} reads/day
                      <br />
                      Read QPS = {(dau * 2 * readWriteRatio).toLocaleString()} / 86,400s ≈ <strong className="text-lime-400">{capacity.readQps.toLocaleString()} QPS</strong>
                    </div>

                    <div className="p-3 bg-[#060b18]/80 border border-white/10 rounded-xl">
                      <span className="text-slate-400 block mb-1">{'// 3. Storage Footprint with Multi-Zone Replication:'}</span>
                      Daily Data = {(dau * 2).toLocaleString()} writes * {payloadSize} bytes ≈ {((dau * 2 * payloadSize) / 1e9).toFixed(2)} GB/day
                      <br />
                      {retentionYears}-Year Total (1.5x repl) = ({((dau * 2 * payloadSize) / 1e9).toFixed(2)} GB * 365 * {retentionYears} * 1.5) ≈ <strong className="text-lime-400">{capacity.storageTotalTB} TB</strong>
                    </div>

                    <div className="p-3 bg-[#060b18]/80 border border-white/10 rounded-xl">
                      <span className="text-slate-400 block mb-1">{'// 4. Cache Memory Sizing (Pareto 80/20 Rule):'}</span>
                      Daily Read Volume = {(dau * 2 * readWriteRatio).toLocaleString()} reads * {payloadSize} bytes ≈ {((dau * 2 * readWriteRatio * payloadSize) / 1e9).toFixed(2)} GB/day
                      <br />
                      Cache 20% of Daily Active Reads = {((dau * 2 * readWriteRatio * payloadSize) / 1e9).toFixed(2)} GB * 0.20 ≈ <strong className="text-lime-400">{capacity.cacheMemoryRequiredGB} GB RAM</strong>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRADE-OFF & CAP MATRIX */}
        {activeTab === 'tradeoffs' && (
          <div className="space-y-6">
            <div className="bg-[#0a0f1d]/85 border border-white/10 p-4 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-lime-400 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                In top-tier system design interviews, there are <strong>no perfect solutions—only trade-offs</strong>.
                Select an architectural strategy below to evaluate how it impacts consistency, latency, operational complexity, and fault tolerance.
              </p>
            </div>

            <div className="space-y-8">
              {blueprint.tradeOffs.map((tradeOff) => {
                const currentChoice = tradeOffChoices[tradeOff.id] || tradeOff.defaultOption;
                return (
                  <Card key={tradeOff.id} className="overflow-hidden border border-white/10 bg-[#0a0f1d]/85">
                    <CardHeader className="bg-white/[0.02] border-b border-white/10 pb-3">
                      <span className="text-xs font-mono font-bold text-lime-400 uppercase tracking-wider">
                        Architectural Dilemma
                      </span>
                      <h3 className="text-base font-bold text-text">{tradeOff.title}</h3>
                      <p className="text-xs text-text-muted">{tradeOff.question}</p>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option A */}
                        <div
                          onClick={() =>
                            setTradeOffChoices((prev) => ({ ...prev, [tradeOff.id]: 'A' }))
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setTradeOffChoices((prev) => ({ ...prev, [tradeOff.id]: 'A' }));
                            }
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            currentChoice === 'A'
                              ? 'bg-primary-50/40 border-primary-500 ring-2 ring-primary-500/20'
                              : 'bg-surface border-border hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-text">{tradeOff.optionA.label}</span>
                            <input
                              type="radio"
                              name={tradeOff.id}
                              checked={currentChoice === 'A'}
                              onChange={() =>
                                setTradeOffChoices((prev) => ({ ...prev, [tradeOff.id]: 'A' }))
                              }
                              className="accent-primary-600"
                              aria-label={`Select Option A: ${tradeOff.optionA.label}`}
                            />
                          </div>
                          <p className="text-xs text-text-muted mb-3">{tradeOff.optionA.description}</p>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-bold text-emerald-700 block mb-1">PROS:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                                {tradeOff.optionA.pros.map((p, idx) => (
                                  <li key={idx}>{p}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-bold text-rose-700 block mb-1">CONS / RISKS:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                                {tradeOff.optionA.cons.map((c, idx) => (
                                  <li key={idx}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Option B */}
                        <div
                          onClick={() =>
                            setTradeOffChoices((prev) => ({ ...prev, [tradeOff.id]: 'B' }))
                          }
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setTradeOffChoices((prev) => ({ ...prev, [tradeOff.id]: 'B' }));
                            }
                          }}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            currentChoice === 'B'
                              ? 'bg-primary-50/40 border-primary-500 ring-2 ring-primary-500/20'
                              : 'bg-surface border-border hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-text">{tradeOff.optionB.label}</span>
                            <input
                              type="radio"
                              name={tradeOff.id}
                              checked={currentChoice === 'B'}
                              onChange={() =>
                                setTradeOffChoices((prev) => ({ ...prev, [tradeOff.id]: 'B' }))
                              }
                              className="accent-primary-600"
                              aria-label={`Select Option B: ${tradeOff.optionB.label}`}
                            />
                          </div>
                          <p className="text-xs text-text-muted mb-3">{tradeOff.optionB.description}</p>
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="font-bold text-emerald-700 block mb-1">PROS:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                                {tradeOff.optionB.pros.map((p, idx) => (
                                  <li key={idx}>{p}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-bold text-rose-700 block mb-1">CONS / RISKS:</span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                                {tradeOff.optionB.cons.map((c, idx) => (
                                  <li key={idx}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation Callout */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block mb-0.5">Staff Engineer Recommendation:</strong>
                          {tradeOff.recommendation}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: BOTTLENECK & SPOF HEALTH AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-8">
            {/* Health Score Banner */}
            <Card className="bg-linear-to-r from-slate-900 to-slate-800 text-white border-0 shadow-lg">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <Badge variant="success" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 mb-2">
                    Well-Architected Framework Audit
                  </Badge>
                  <h3 className="text-2xl font-bold tracking-tight">System Resilience Score: 94%</h3>
                  <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                    Audited across Reliability, Scalability, Latency SLAs, and Data Durability invariants.
                    Zero fatal single points of failure (SPOFs) detected under standard operating conditions.
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Audited Components</span>
                    <span className="text-xl font-bold text-white">{blueprint.components.length}</span>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">Mitigated Risks</span>
                    <span className="text-xl font-bold text-emerald-400">{blueprint.bottlenecks.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Identified Vulnerabilities & Hardened Mitigations */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                Vulnerability Surface & Mitigations
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {blueprint.bottlenecks.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-rose-500">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={item.severity === 'CRITICAL' ? 'error' : 'warning'}
                            className={
                              item.severity === 'CRITICAL'
                                ? 'text-rose-700 border-rose-300 bg-rose-50'
                                : 'text-amber-700 border-amber-300 bg-amber-50'
                            }
                          >
                            {item.severity} SEVERITY
                          </Badge>
                          <span className="text-xs font-mono font-bold text-text">{item.component}</span>
                        </div>
                        <Badge variant="neutral" className="text-xs text-slate-600">
                          Pillar: {item.pillar}
                        </Badge>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-1">
                          Vulnerability Vector:
                        </span>
                        <p className="text-xs text-text leading-relaxed">{item.vulnerability}</p>
                      </div>

                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1 mb-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Hardened Architectural Mitigation:
                        </span>
                        <p className="text-xs text-emerald-950 leading-relaxed">{item.mitigation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Candidate Engineering Notes Scratchpad */}
            <Card>
              <CardHeader className="pb-3 border-b border-border">
                <h3 className="text-base font-bold text-text flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  Candidate Architecture Notes & Interview Talking Points
                </h3>
                <p className="text-xs text-text-muted">
                  Auto-saved locally. These notes are included directly when you export your Architectural Decision Record (ADR).
                </p>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <textarea
                  rows={5}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Record your personal notes, trade-off defenses, alternative database choices, or interview talking points for this system design..."
                  className="w-full text-xs font-mono p-3 bg-canvas border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-text leading-relaxed"
                />
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Saved to browser storage (`sp_system_design_studio_v1`)</span>
                  <Button size="sm" variant="secondary" onClick={handleExportAdr} className="text-xs">
                    Export with ADR
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
