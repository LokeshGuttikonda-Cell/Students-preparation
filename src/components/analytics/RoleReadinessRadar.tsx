'use client';

import React from 'react';

export interface CompetencyDimension {
  dimension: string;
  score: number;
  target: number;
  status?: 'MET' | 'NEEDS_PRACTICE';
}

export interface RoleReadinessRadarProps {
  dimensions: CompetencyDimension[];
  title?: string;
  subtitle?: string;
  size?: number;
}

export function RoleReadinessRadar({
  dimensions,
  title = 'Competency Readiness Spider Matrix',
  subtitle = 'Candidate verified diagnostic accuracy vs hiring benchmark cutoff (70%)',
  size = 360,
}: RoleReadinessRadarProps) {
  if (!dimensions || dimensions.length === 0) {
    return null;
  }

  // If fewer than 3 dimensions, radar polygon is degenerate -> fallback to clean comparative bars
  if (dimensions.length < 3) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 space-y-4 shadow-xs">
        <div>
          <h4 className="text-base font-bold text-text">{title}</h4>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="space-y-3">
          {dimensions.map((d) => (
            <div key={d.dimension} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-text">{d.dimension}</span>
                <span className={d.score >= d.target ? 'text-success-700' : 'text-accent-800'}>
                  {d.score}% / Benchmark {d.target}%
                </span>
              </div>
              <div className="w-full bg-border/40 h-2 rounded-full overflow-hidden relative">
                <div
                  className="bg-primary-700 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, d.score)}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-1 bg-amber-500"
                  style={{ left: `${d.target}%` }}
                  title={`Target: ${d.target}%`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const N = dimensions.length;
  const center = size / 2;
  const maxR = size * 0.35;
  const levels = [0.25, 0.5, 0.75, 1.0];

  // Helper to compute coordinates for index and normalized value (0..1)
  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (2 * Math.PI * index) / N - Math.PI / 2;
    const r = Math.max(0, Math.min(1, valueRatio)) * maxR;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build concentric grid polygon points
  const gridPolygons = levels.map((lvl) => {
    return dimensions
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  // Candidate Polygon
  const candidatePoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.score / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Benchmark Polygon
  const benchmarkPoints = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.target / 100);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-xs flex flex-col justify-between">
      <div className="border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-text">{title}</h4>
          <span className="text-[11px] font-semibold text-primary-800 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200">
            Multi-Competency Radar
          </span>
        </div>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>

      {/* SVG Radar */}
      <div className="flex justify-center items-center py-4">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[340px] sm:max-w-[380px] h-auto overflow-visible select-none"
        >
          {/* Concentric Grid Polygons */}
          {gridPolygons.map((pts, idx) => (
            <polygon
              key={`grid-${idx}`}
              points={pts}
              fill={idx % 2 === 0 ? 'currentColor' : 'none'}
              className={idx % 2 === 0 ? 'text-canvas' : ''}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Grid percentage labels on 12 o'clock axis */}
          {levels.map((lvl) => {
            const y = center - lvl * maxR;
            return (
              <text
                key={`lvl-${lvl}`}
                x={center + 4}
                y={y - 2}
                fontSize="9"
                fill="#94a3b8"
                fontWeight="500"
              >
                {Math.round(lvl * 100)}%
              </text>
            );
          })}

          {/* Radial Spokes */}
          {dimensions.map((_, i) => {
            const { x, y } = getCoordinates(i, 1.0);
            return (
              <line
                key={`spoke-${i}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}

          {/* Benchmark Target Polygon (Dashed outline, soft fill) */}
          <polygon
            points={benchmarkPoints}
            fill="#f59e0b"
            fillOpacity="0.1"
            stroke="#d97706"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Candidate Accuracy Polygon (Solid primary fill) */}
          <polygon
            points={candidatePoints}
            fill="#1e3a8a"
            fillOpacity="0.25"
            stroke="#1e3a8a"
            strokeWidth="2.5"
          />

          {/* Candidate Vertices Markers */}
          {dimensions.map((d, i) => {
            const { x, y } = getCoordinates(i, d.score / 100);
            const isPassing = d.score >= d.target;
            return (
              <circle
                key={`pt-${i}`}
                cx={x}
                cy={y}
                r="4.5"
                fill={isPassing ? '#10b981' : '#f59e0b'}
                stroke="#ffffff"
                strokeWidth="2"
              />
            );
          })}

          {/* Axis Labels */}
          {dimensions.map((d, i) => {
            const angle = (2 * Math.PI * i) / N - Math.PI / 2;
            const labelR = maxR + 24;
            const lx = center + labelR * Math.cos(angle);
            const ly = center + labelR * Math.sin(angle);

            // Anchor alignment based on quadrant
            let anchor: 'start' | 'middle' | 'end' = 'middle';
            if (Math.cos(angle) > 0.3) anchor = 'start';
            else if (Math.cos(angle) < -0.3) anchor = 'end';

            return (
              <text
                key={`label-${i}`}
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="central"
                fontSize="10"
                fontWeight="600"
                fill="#334155"
              >
                {d.dimension.length > 18 ? `${d.dimension.substring(0, 16)}...` : d.dimension}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend & Summary Pills */}
      <div className="pt-3 border-t border-border space-y-3">
        <div className="flex items-center justify-center gap-6 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-900 border border-primary-950" />
            <span className="text-text">Candidate Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 bg-amber-600 border-t border-dashed border-amber-600" />
            <span className="text-text-muted">Role Benchmark Target</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {dimensions.map((d) => {
            const isMet = d.score >= d.target;
            return (
              <div
                key={d.dimension}
                className="p-2 rounded-lg bg-canvas border border-border flex items-center justify-between text-xs"
              >
                <span className="font-medium text-text truncate max-w-[110px]">
                  {d.dimension}
                </span>
                <span
                  className={`font-bold tabular-nums ${
                    isMet ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {d.score}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
