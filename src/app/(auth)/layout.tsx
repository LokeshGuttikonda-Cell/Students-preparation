import React from 'react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#040711] text-slate-100 relative overflow-hidden">
      {/* Subtle Ambient Radial Glows */}
      <div className="pointer-events-none absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-lime-400/10 via-cyan-500/5 to-transparent blur-3xl opacity-70" />

      <header className="border-b border-white/10 bg-[#060b18]/80 backdrop-blur-xl py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-white hover:text-lime-300 transition-colors"
          >
            <span className="bg-gradient-to-r from-white via-slate-200 to-lime-300 bg-clip-text text-transparent">
              StudentsPrep
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono bg-lime-400/10 text-lime-300 px-2 py-0.5 rounded border border-lime-400/30">
              Platform
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1 font-mono"
          >
            ← Back to Home
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        {children}
      </main>
    </div>
  );
}
