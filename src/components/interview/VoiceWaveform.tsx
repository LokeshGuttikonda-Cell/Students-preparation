'use client';

import React from 'react';

export type WaveformState = 'idle' | 'speaking' | 'listening';

export interface VoiceWaveformProps {
  state: WaveformState;
  className?: string;
}

export function VoiceWaveform({ state, className = '' }: VoiceWaveformProps) {
  // Height configurations for audio bars
  const getBarHeight = (index: number) => {
    if (state === 'speaking') {
      const heights = [36, 58, 85, 96, 64, 42, 75, 88, 52, 38];
      return heights[index % heights.length];
    }
    if (state === 'listening') {
      const heights = [28, 48, 70, 82, 60, 45, 68, 74, 50, 30];
      return heights[index % heights.length];
    }
    // Idle state
    const heights = [18, 22, 26, 30, 26, 22, 26, 30, 22, 18];
    return heights[index % heights.length];
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

  const getAnimationClass = (index: number) => {
    if (state === 'speaking') {
      const delays = [
        'animate-pulse',
        'animate-bounce',
        'animate-pulse',
        'animate-bounce',
        'animate-pulse',
      ];
      return delays[index % delays.length];
    }
    if (state === 'listening') {
      return 'animate-pulse';
    }
    return '';
  };

  return (
    <div
      className={`flex items-center justify-center gap-1.5 h-16 px-4 py-2 bg-canvas/60 rounded-xl border border-border select-none ${className}`}
      aria-label={`Voice audio visualizer: ${state}`}
    >
      {[...Array(10)].map((_, i) => (
        <span
          key={i}
          className={`w-1.5 rounded-full transition-all duration-300 ${getBarColor(
            i,
          )} ${getAnimationClass(i)}`}
          style={{
            height: `${getBarHeight(i)}%`,
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}
