'use client';

import React, { useEffect, useState } from 'react';

export type WaveformState = 'idle' | 'speaking' | 'listening';

export interface VoiceWaveformProps {
  state: WaveformState;
  className?: string;
  showTelemetry?: boolean;
}

export function VoiceWaveform({
  state,
  className = '',
  showTelemetry = true,
}: VoiceWaveformProps) {
  const [frame, setFrame] = useState(0);

  // Dynamic harmonic oscillation when speaking or listening
  useEffect(() => {
    if (state === 'idle') return;

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 360);
    }, 80);

    return () => clearInterval(interval);
  }, [state]);

  // Formant / harmonic amplitude for 10 frequency channels
  const getDynamicHeight = (index: number) => {
    if (state === 'speaking') {
      const baseHeights = [35, 55, 80, 95, 85, 75, 90, 65, 50, 35];
      const sineMod = Math.sin((frame * 0.2) + (index * 0.6)) * 18;
      const cosineMod = Math.cos((frame * 0.15) + (index * 0.4)) * 10;
      return Math.min(100, Math.max(15, Math.round(baseHeights[index] + sineMod + cosineMod)));
    }
    if (state === 'listening') {
      const baseHeights = [25, 45, 65, 80, 70, 60, 75, 55, 40, 25];
      const sineMod = Math.sin((frame * 0.3) + (index * 0.8)) * 14;
      return Math.min(100, Math.max(12, Math.round(baseHeights[index] + sineMod)));
    }
    // Idle state
    const idleHeights = [18, 22, 26, 30, 26, 22, 26, 30, 22, 18];
    return idleHeights[index % idleHeights.length];
  };

  const getBarColor = (index: number) => {
    if (state === 'speaking') {
      return index % 2 === 0 ? 'bg-primary-600' : 'bg-primary-400';
    }
    if (state === 'listening') {
      return index % 2 === 0 ? 'bg-amber-500' : 'bg-emerald-500';
    }
    return 'bg-border';
  };

  const getDecibelLevel = () => {
    if (state === 'speaking') {
      const db = -16 + Math.round(Math.sin(frame * 0.25) * 4);
      return `${db} dBFS`;
    }
    if (state === 'listening') {
      const db = -34 + Math.round(Math.sin(frame * 0.4) * 6);
      return `${db} dBFS`;
    }
    return '-inf dBFS';
  };

  return (
    <div className={`space-y-2 select-none ${className}`}>
      {/* 10 Visualizer Bars */}
      <div
        className="flex items-center justify-center gap-1.5 h-16 px-4 py-2 bg-canvas/60 rounded-xl border border-border overflow-hidden"
        aria-label={`Voice audio visualizer: ${state}`}
      >
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className={`w-1.5 rounded-full transition-all duration-150 ${getBarColor(i)}`}
            style={{
              height: `${getDynamicHeight(i)}%`,
            }}
          />
        ))}
      </div>

      {/* Telemetry & Stream Status */}
      {showTelemetry && (
        <div className="flex items-center justify-between text-[10px] font-mono text-text-muted px-1">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                state === 'speaking'
                  ? 'bg-primary-600 animate-ping'
                  : state === 'listening'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-border'
              }`}
            />
            <div className="font-semibold uppercase tracking-wider text-text">
              {state === 'speaking'
                ? 'AI Vocalizing'
                : state === 'listening'
                ? 'Mic Capturing'
                : 'Standby'}
            </div>
          </div>
          <div className="tabular-nums font-semibold">
            {getDecibelLevel()}
          </div>
        </div>
      )}
    </div>
  );
}

