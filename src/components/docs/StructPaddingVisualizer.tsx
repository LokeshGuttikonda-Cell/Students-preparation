'use client';

import React, { useState, useEffect, useId, useCallback } from 'react';
import {
  computeStructLayout,
  optimizeStructLayout,
  generateCodeDefinition,
  PRESET_STRUCTS,
  PRIMITIVE_TYPES,
  PrimitiveTypeKey,
  StructFieldDefinition,
} from '../../lib/memory-layout-data';
import { Button } from '../ui/Button';

interface StructPaddingVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StructPaddingVisualizer: React.FC<StructPaddingVisualizerProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('unoptimized-packet');
  const [fields, setFields] = useState<StructFieldDefinition[]>(PRESET_STRUCTS[0].fields);
  const [newFieldName, setNewFieldName] = useState<string>('extra_data');
  const [newFieldType, setNewFieldType] = useState<PrimitiveTypeKey>('i32');
  const [codeLang, setCodeLang] = useState<'c' | 'rust' | 'go' | 'cpp'>('c');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [savingsMessage, setSavingsMessage] = useState<string | null>(null);
  const titleId = useId();

  // Reset when preset changes
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = PRESET_STRUCTS.find((p) => p.id === presetId);
    if (preset) {
      setFields([...preset.fields]);
      setSavingsMessage(null);
    }
  };

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const layout = computeStructLayout(fields);

  const handleAutoOptimize = () => {
    const beforeSize = layout.totalSize;
    const beforePadding = layout.paddingBytes;
    const optimized = optimizeStructLayout(fields);
    setFields(optimized);
    const afterLayout = computeStructLayout(optimized);
    const bytesSaved = beforeSize - afterLayout.totalSize;
    const padSaved = beforePadding - afterLayout.paddingBytes;

    if (bytesSaved > 0) {
      setSavingsMessage(
        `Optimized! Reordered fields saved ${bytesSaved} bytes (from ${beforeSize}B down to ${afterLayout.totalSize}B) and eliminated ${padSaved} padding bytes.`
      );
    } else {
      setSavingsMessage('Struct is already optimal for natural alignment packing.');
    }
  };

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    const newField: StructFieldDefinition = {
      id: 'field_' + Date.now(),
      name: newFieldName.trim().replace(/\s+/g, '_').toLowerCase(),
      type: newFieldType,
    };
    setFields([...fields, newField]);
    setNewFieldName('var_' + (fields.length + 1));
    setSavingsMessage(null);
  };

  const handleRemoveField = (idOrName: string) => {
    setFields(fields.filter((f) => f.id !== idOrName && f.name !== idOrName));
    setSavingsMessage(null);
  };

  const handleCopyCode = useCallback(async () => {
    const code = generateCodeDefinition(fields, codeLang);
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // ignore
    }
  }, [fields, codeLang]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" aria-hidden="true">🧱</span>
            <div>
              <h2 id={titleId} className="text-lg font-bold text-white tracking-tight">
                Struct Memory Layout &amp; Padding Inspector
              </h2>
              <p className="text-xs text-slate-400">
                Visual byte-level alignment, compiler padding holes, 64-byte cache line borders, and false sharing analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close memory inspector"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Preset Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-950/50 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_STRUCTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedPresetId === p.id
                      ? 'bg-cyan-900/60 border border-cyan-400 text-cyan-200 font-bold'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAutoOptimize}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
            >
              ⚡ Auto-Optimize Layout
            </Button>
          </div>
        </div>

        {/* Savings Alert */}
        {savingsMessage && (
          <div className="px-6 py-2.5 bg-emerald-950/40 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <span>{savingsMessage}</span>
            <button
              onClick={() => setSavingsMessage(null)}
              className="text-emerald-400 hover:text-white ml-3"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* Telemetry KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-medium">Total Struct Size</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">
                {layout.totalSize} <span className="text-xs text-slate-400">bytes</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-medium">Data Payload</div>
              <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">
                {layout.dataBytes} <span className="text-xs text-slate-400">bytes</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-medium">Padding Holes</div>
              <div
                className={`text-xl font-bold font-mono mt-0.5 ${
                  layout.paddingBytes === 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {layout.paddingBytes} <span className="text-xs text-slate-400">bytes ({layout.paddingPercentage}%)</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
              <div className="text-[11px] text-slate-400 font-medium">Max Natural Align</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {layout.maxAlignment} <span className="text-xs text-slate-400">bytes</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-400 font-medium">L1 Cache Lines</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {layout.cacheLinesSpanned} <span className="text-xs text-slate-400">(64B each)</span>
              </div>
            </div>
          </div>

          {/* False Sharing Alert if detected */}
          {layout.hasFalseSharingRisk && (
            <div className="p-3.5 rounded-xl border border-rose-500/50 bg-rose-950/30 text-rose-200 text-xs space-y-1">
              <div className="font-bold flex items-center space-x-1.5 text-rose-300">
                <span>⚠️</span>
                <span>False Sharing Vulnerability Detected:</span>
              </div>
              <p className="leading-relaxed">{layout.falseSharingDetails}</p>
              <p className="text-[11px] text-rose-300/80 pt-0.5">
                Countermeasure: In C/C++, use <code>alignas(64)</code> or in Rust <code>#[repr(align(64))]</code> between concurrently mutated variables to force them onto separate cache lines.
              </p>
            </div>
          )}

          {/* Byte-by-Byte Visual Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">
                Memory Byte Map (64-Bit Architecture Alignment)
              </h3>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-cyan-500 inline-block" />
                  <span>Data Bytes</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-800 inline-block" />
                  <span>Padding Byte</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 border-r-2 border-amber-400 inline-block" />
                  <span>64B Boundary</span>
                </span>
              </div>
            </div>

            {/* Visual Grid Container */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 overflow-x-auto">
              {layout.byteGrid.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-6">No fields defined in struct.</div>
              ) : (
                <div className="space-y-3">
                  {Array.from({ length: layout.cacheLinesSpanned }).map((_, lineIdx) => {
                    const lineBytes = layout.byteGrid.slice(lineIdx * 64, (lineIdx + 1) * 64);
                    return (
                      <div key={lineIdx} className="space-y-1">
                        <div className="text-[10px] font-mono text-slate-500 font-bold uppercase">
                          L1 Cache Line #{lineIdx} (Bytes {lineIdx * 64} to {Math.min(layout.totalSize - 1, (lineIdx + 1) * 64 - 1)})
                        </div>
                        <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 font-mono text-[10px]">
                          {lineBytes.map((cell) => (
                            <div
                              key={cell.byteIndex}
                              title={
                                cell.isPadding
                                  ? `Byte ${cell.byteIndex}: COMPILER PADDING HOLE`
                                  : `Byte ${cell.byteIndex}: Field "${cell.fieldName}" (${cell.type})`
                              }
                              className={`h-7 rounded flex items-center justify-center font-bold transition-all select-none ${
                                cell.isPadding
                                  ? 'bg-rose-950/80 border border-rose-700/60 text-rose-400 hover:bg-rose-900'
                                  : 'bg-cyan-900/60 border border-cyan-500/50 text-cyan-200 hover:bg-cyan-800'
                              } ${cell.isCacheLineBoundary ? 'border-r-2 border-r-amber-400' : ''}`}
                            >
                              {cell.isPadding ? '·' : cell.byteIndex}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Field Table & Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Field Breakdown Table */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-white text-sm">Struct Fields &amp; Offsets</h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-semibold">
                      <th className="p-2.5">Field Name</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5 font-mono">Offset</th>
                      <th className="p-2.5 font-mono">Size</th>
                      <th className="p-2.5 font-mono">Align</th>
                      <th className="p-2.5 font-mono">Padding</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {layout.fields.map((f) => (
                      <tr key={f.name} className="hover:bg-slate-900/40">
                        <td className="p-2.5 font-semibold text-white">
                          {f.name}
                          {f.isAtomicOrFrequentlyMutated && (
                            <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                              CONCURRENT
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-mono text-cyan-300">{f.type}</td>
                        <td className="p-2.5 font-mono text-slate-300">+{f.offset}</td>
                        <td className="p-2.5 font-mono text-slate-300">{f.size}B</td>
                        <td className="p-2.5 font-mono text-slate-300">{f.alignment}B</td>
                        <td className="p-2.5 font-mono">
                          {f.paddingBefore > 0 ? (
                            <span className="text-rose-400">+{f.paddingBefore}B pre</span>
                          ) : (
                            <span className="text-slate-600">0B</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleRemoveField(f.name)}
                            className="text-slate-400 hover:text-rose-400 text-xs px-1 cursor-pointer"
                            aria-label={`Remove field ${f.name}`}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Custom Field Form */}
              <div className="flex flex-wrap items-center gap-2 pt-1 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                <input
                  type="text"
                  placeholder="Field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as PrimitiveTypeKey)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  {Object.entries(PRIMITIVE_TYPES).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name} ({info.size}B)
                    </option>
                  ))}
                </select>
                <Button variant="secondary" size="sm" onClick={handleAddField} className="text-xs cursor-pointer">
                  + Add Field
                </Button>
              </div>
            </div>

            {/* Generated Code Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">Generated Code</h3>
                <div className="flex items-center space-x-1">
                  {(['c', 'rust', 'go'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCodeLang(lang)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                        codeLang === lang
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white bg-slate-800'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs text-slate-300 overflow-x-auto min-h-[160px]">
                <pre>{generateCodeDefinition(fields, codeLang)}</pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-semibold border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedCode ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400">
            Natural Alignment Rule: <code>offset % sizeof(T) == 0</code>
          </div>
          <Button variant="primary" size="sm" onClick={onClose} className="text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
