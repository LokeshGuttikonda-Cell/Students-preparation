'use client';

import React from 'react';

export interface TechIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  slug?: string;
  size?: number;
  className?: string;
}

export const TechIcon: React.FC<TechIconProps> = ({
  name,
  slug,
  size = 24,
  className = '',
  ...props
}) => {
  const normalized = (slug || name).toLowerCase().trim();

  // Java & JVM
  if (normalized.includes('java') && !normalized.includes('javascript')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-amber-700 ${className}`}
        {...props}
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    );
  }

  // Python
  if (normalized.includes('python')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-emerald-600 ${className}`}
        {...props}
      >
        <path d="M12 2C7 2 7 4 7 4v3h5v1H5s-3 0-3 5 2.5 5 2.5 5H6v-2.5c0-1.5 1-2.5 2.5-2.5h7c1.5 0 2.5-1 2.5-2.5V4s0-2-5-2z" />
        <circle cx="9" cy="5" r="0.75" fill="currentColor" />
        <path d="M12 22c5 0 5-2 5-2v-3h-5v-1h7s3 0 3-5-2.5-5-2.5-5H18v2.5c0 1.5-1 2.5-2.5 2.5h-7C7 15 6 16 6 17.5V20s0 2 5 2z" />
        <circle cx="15" cy="19" r="0.75" fill="currentColor" />
      </svg>
    );
  }

  // C++ / Systems
  if (normalized.includes('c++') || normalized.includes('cpp')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-blue-600 ${className}`}
        {...props}
      >
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <path d="M9 10a3 3 0 1 0 0 4" />
        <line x1="14" y1="12" x2="16" y2="12" />
        <line x1="15" y1="11" x2="15" y2="13" />
        <line x1="18" y1="12" x2="20" y2="12" />
        <line x1="19" y1="11" x2="19" y2="13" />
      </svg>
    );
  }

  // Go / Golang
  if (normalized === 'go' || normalized.includes('golang')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-cyan-600 ${className}`}
        {...props}
      >
        <circle cx="6" cy="12" r="4" />
        <circle cx="18" cy="12" r="4" />
        <path d="M10 12h4" />
        <path d="M14 8l4 4-4 4" />
      </svg>
    );
  }

  // Rust
  if (normalized.includes('rust')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-amber-800 ${className}`}
        {...props}
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9 9h4a2 2 0 0 1 0 4H9" />
        <path d="M9 15h6" />
        <path d="M13 13l3 4" />
      </svg>
    );
  }

  // TypeScript / JavaScript
  if (normalized.includes('typescript') || normalized.includes('javascript') || normalized === 'ts' || normalized === 'js') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-sky-600 ${className}`}
        {...props}
      >
        <rect width="18" height="18" x="3" y="3" rx="3" />
        <path d="M8 9h4" />
        <path d="M10 9v7" />
        <path d="M14 14.5c.5.8 1.4 1 2 1s1.5-.4 1.5-1.2c0-1.8-3.5-1.3-3.5-3.3 0-1.2 1-2 2.5-2 1.2 0 2 .5 2.5 1.2" />
      </svg>
    );
  }

  // SQL & Databases
  if (normalized.includes('sql') || normalized.includes('database')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-indigo-600 ${className}`}
        {...props}
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
      </svg>
    );
  }

  // Data Structures & Algorithms
  if (normalized.includes('dsa') || normalized.includes('algorithm') || normalized.includes('structure')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-purple-600 ${className}`}
        {...props}
      >
        <circle cx="12" cy="5" r="3" />
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M12 8v4" />
        <path d="M12 12l-4 4" />
        <path d="M12 12l4 4" />
      </svg>
    );
  }

  // System Design
  if (normalized.includes('system') || normalized.includes('design') || normalized.includes('architecture')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-slate-700 ${className}`}
        {...props}
      >
        <rect x="2" y="3" width="6" height="6" rx="1" />
        <rect x="16" y="3" width="6" height="6" rx="1" />
        <rect x="9" y="15" width="6" height="6" rx="1" />
        <path d="M5 9v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
        <path d="M12 14v1" />
      </svg>
    );
  }

  // Operating Systems & Linux Kernel
  if (normalized.includes('os') || normalized.includes('linux') || normalized.includes('kernel')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-amber-600 ${className}`}
        {...props}
      >
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    );
  }

  // Computer Networks
  if (normalized.includes('network') || normalized.includes('protocol')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-teal-600 ${className}`}
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }

  // Storage Engines
  if (normalized.includes('storage') || normalized.includes('crash') || normalized.includes('disk')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-rose-600 ${className}`}
        {...props}
      >
        <line x1="22" y1="12" x2="2" y2="12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        <line x1="6" y1="16" x2="6.01" y2="16" />
        <line x1="10" y1="16" x2="10.01" y2="16" />
      </svg>
    );
  }

  // Cloud Infrastructure
  if (normalized.includes('cloud') || normalized.includes('devops') || normalized.includes('infra')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-sky-500 ${className}`}
        {...props}
      >
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    );
  }

  // Default fallback code icon
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-primary-700 ${className}`}
      {...props}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
};
