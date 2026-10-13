'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { getAdminUrl } from '../lib/env';
import {
  BookOpen,
  Library,
  Compass,
  Mic,
  Timer,
  Cpu,
  ArrowRight,
  Terminal,
  Zap,
} from 'lucide-react';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-canvas flex flex-col text-text">
      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#040711]/90 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-lime-400 via-emerald-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-lime-400/25 group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-display">
                StudentsPrep<span className="text-lime-400">.Bento</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-lime-400/10 text-lime-400 border border-lime-400/20">
              Frontier Arena
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 hidden xl:inline mr-2">
                  Candidate: <strong className="text-white">{user.name}</strong>
                </span>
                <Link href="/docs" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  Docs
                </Link>
                <Link href="/curriculum" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  Knowledge Hub
                </Link>
                <Link href="/mock-tests" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  Mock Tests
                </Link>
                <Link href="/courses" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  Tracks
                </Link>
                <Link href="/sandbox" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  AI Lab
                </Link>
                <Link href="/dashboard">
                  <Button variant="primary" size="sm" className="text-xs font-bold shadow-md shadow-lime-400/20">
                    My Terminal
                  </Button>
                </Link>
                {user.role === 'ADMIN' && (
                  <a href={`${getAdminUrl()}/admin`}>
                    <Button variant="secondary" size="sm" className="text-xs font-mono">
                      Admin Panel
                    </Button>
                  </a>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors font-mono"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/docs" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  Docs
                </Link>
                <Link href="/curriculum" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  Knowledge Hub
                </Link>
                <Link href="/mock-tests" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  Mock Tests
                </Link>
                <Link href="/courses" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  Tracks
                </Link>
                <Link href="/sandbox" className="text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 px-2.5 py-1.5 rounded-xl transition-colors">
                  AI Lab
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="sm" className="text-xs font-mono">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="text-xs font-bold shadow-md shadow-lime-400/25">
                    Launch Arena
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 space-y-12 w-full">
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-lime-500/10 text-lime-400 border border-lime-500/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>2026 FRONTIER AI SPECIFICATION • SPECULATIVE DECODING & PAGEDATTENTION</span>
            <span className="text-slate-400">→</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.1]">
            Students-preparation
          </h1>
          <p className="text-2xl sm:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-300 to-cyan-400">
            Autonomous Preparation Suite for Engineering Career Tracks
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            High-velocity career accelerator for modern software engineers. Master compound AI architectures,
            lossless speculative rejection sampling, and non-contiguous KV-cache memory management.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/practice">
              <Button variant="primary" size="lg" className="font-bold flex items-center gap-2">
                <span>Topic-Wise Practice</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="lg" className="font-semibold">
                Open Student Dashboard
              </Button>
            </Link>
            <Link href="/sandbox">
              <Button variant="ghost" size="lg" className="font-mono text-cyan-400 hover:text-cyan-300">
                <Terminal className="w-4 h-4 mr-2" />
                <span>Interactive AI Lab</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* METRICS RIBBON (BENTO KPI STRIP) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bento-tile p-5 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-display font-extrabold text-white block">182<span className="text-lime-400">+</span></span>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Production Theory Guides</span>
          </div>
          <div className="bento-tile p-5 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-display font-extrabold text-white block">17</span>
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">Timed Mock Test Engines</span>
          </div>
          <div className="bento-tile p-5 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-display font-extrabold text-white block">376<span className="text-amber-400">+</span></span>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Technical Interview Qs</span>
          </div>
          <div className="bento-tile p-5 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-display font-extrabold text-white block">99.4<span className="text-emerald-400">%</span></span>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">Benchmark Pass Rate</span>
          </div>
        </div>

        {/* FEATURED ASYMMETRIC BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">

          {/* CARD 1: LIVE AGENT TERMINAL RUNNER (Span 2 cols) */}
          <div className="md:col-span-2 lg:col-span-2 bento-tile p-6 flex flex-col justify-between space-y-6 bg-gradient-to-br from-[#0a1424] via-[#0b162a] to-[#07111e] featured-glow">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping"></span>
                <span className="text-lime-400 font-bold">[SYS-SURFACE 01: AGENT RUNNER]</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-lime-400/10 text-lime-400 font-mono text-[10px] font-bold border border-lime-400/20">
                Active AST Repair
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-black/70 border border-white/10 space-y-2 text-slate-300">
                <div className="text-lime-400 font-bold">$ nexus eval --id=mock-17 --speculative --verify</div>
                <div className="text-slate-400">&gt; Target Model: 70B FP16 • Draft Speculator: 1.5B Qwen-2.5</div>
                <div className="text-cyan-300">&gt; KV-Cache Memory Block Table: 1,024 pages allocated (waste: 0.08%)</div>
                <div className="p-3 rounded-xl bg-lime-950/40 border border-lime-500/40 text-lime-300 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>[Proposal Verification Turn #4]:</span>
                    <span className="text-white bg-lime-500/30 px-2 py-0.5 rounded text-[10px]">2.68x Speedup</span>
                  </div>
                  <p className="text-slate-300 text-[11px] font-sans">Target verified 4 tokens in single forward pass. TTFT latency: 14.2ms.</p>
                </div>
                <div className="text-slate-400 flex items-center gap-2 pt-1 text-[11px]">
                  <span className="w-2 h-3.5 bg-lime-400 animate-pulse"></span>
                  <span>Autonomous coding agent executing verified AST patch...</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>Lossless Proof</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">100% Signal</span>
              </div>
              <Link href="/mock-tests">
                <Button variant="primary" size="sm" className="font-bold text-xs shadow-md shadow-lime-400/20">
                  <span>Test in Mock 17</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* CARD 2: Docs & Tutorials */}
          <div className="bento-tile p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-display">Docs &amp; Tutorials</h2>
                  <span className="text-[10px] font-mono font-bold uppercase bg-lime-400/20 text-lime-300 px-2 py-0.5 rounded border border-lime-400/30">
                    13 Tracks
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Deep documentation across Java, Python, C++, Go, Rust, TypeScript, and SQL. Multi-language code tabs and gotchas.
                </p>
              </div>
            </div>
            <Link href="/docs">
              <Button variant="secondary" size="sm" className="w-full text-xs font-mono flex items-center justify-between">
                <span>Explore Tutorials</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* CARD 3: Knowledge Hub */}
          <div className="bento-tile p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 shadow-sm">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-display">Knowledge Hub</h2>
                  <span className="text-[10px] font-mono font-bold uppercase bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-400/30">
                    Library
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Comprehensive engineering disciplines. Master consensus, virtual memory, B+ trees, and attention mechanisms.
                </p>
              </div>
            </div>
            <Link href="/curriculum">
              <Button variant="secondary" size="sm" className="w-full text-xs font-mono flex items-center justify-between">
                <span>Explore Knowledge</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* CARD 4: Career Roles */}
          <div className="bento-tile p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center text-purple-400 shadow-sm">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-display">Career Roles</h2>
                  <span className="text-[10px] font-mono font-bold uppercase bg-purple-400/20 text-purple-300 px-2 py-0.5 rounded border border-purple-400/30">
                    Tracks
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Cloud, DevOps, Python, Core Java, and SQL Specialist paths. Master weighted competencies with industry cutoffs.
                </p>
              </div>
            </div>
            <Link href="/roles">
              <Button variant="secondary" size="sm" className="w-full text-xs font-mono flex items-center justify-between">
                <span>Explore Roles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* CARD 5: Technical Interviews */}
          <div className="bento-tile p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center text-rose-400 shadow-sm">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-display">Technical Interviews</h2>
                  <span className="text-[10px] font-mono font-bold uppercase bg-rose-400/20 text-rose-300 px-2 py-0.5 rounded border border-rose-400/30">
                    Voice Drills
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Authentic scenario screening and rapid-fire flashcards. Formulate architectural solutions and review counter-probes.
                </p>
              </div>
            </div>
            <Link href="/interviews">
              <Button variant="secondary" size="sm" className="w-full text-xs font-mono flex items-center justify-between">
                <span>Start Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* CARD 6: Timed Mock Tests */}
          <div className="bento-tile p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 shadow-sm">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-display">Timed Mock Tests</h2>
                  <span className="text-[10px] font-mono font-bold uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                    Simulation
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Full-length assessments with synchronized countdowns, section palettes, and instant diagnostic scoring.
                </p>
              </div>
            </div>
            <Link href="/mock-tests">
              <Button variant="secondary" size="sm" className="w-full text-xs font-mono flex items-center justify-between">
                <span>Take Mock Test</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* CARD 7: Applied Engineering Labs */}
          <div className="bento-tile p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400 shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-display">Applied Engineering Labs</h2>
                  <span className="text-[10px] font-mono font-bold uppercase bg-lime-400/20 text-lime-300 px-2 py-0.5 rounded border border-lime-400/30">
                    9 Studios
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Interactive simulators: Speculative decoding, SQL queries, memory hierarchy, hash rings, and kernel scheduling.
                </p>
              </div>
            </div>
            <Link href="/sandbox">
              <Button variant="secondary" size="sm" className="w-full text-xs font-mono flex items-center justify-between">
                <span>Explore Labs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* CARD 8: SYSTEM SIGNAL TOPOLOGY & TRACE (Span 2 cols) */}
          <div className="md:col-span-2 bento-tile p-6 space-y-4 bg-gradient-to-br from-[#071322] via-[#091829] to-[#050c18] border-cyan-500/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 block mb-0.5 font-bold">[SURFACE 06: ARCHITECTURE PIPELINE]</span>
                <h2 className="text-base font-bold text-white font-display">Frontier AI Signal Pipeline & Latency Trace</h2>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                Total TTFT: 48.7ms
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 text-center space-y-1 hover:border-lime-400/40 transition-colors">
                <span className="text-slate-400 block text-[9px] uppercase">Stage 1</span>
                <div className="font-bold text-lime-300">Prompt AST</div>
                <span className="text-[10px] text-slate-500 block">4.2ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 text-center space-y-1 hover:border-cyan-400/40 transition-colors">
                <span className="text-slate-400 block text-[9px] uppercase">Stage 2</span>
                <div className="font-bold text-cyan-300">Leiden Graph</div>
                <span className="text-[10px] text-slate-500 block">11.8ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 text-center space-y-1 hover:border-purple-400/40 transition-colors">
                <span className="text-slate-400 block text-[9px] uppercase">Stage 3</span>
                <div className="font-bold text-purple-300">Draft 1.5B</div>
                <span className="text-[10px] text-slate-500 block">8.4ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-lime-400/30 text-center space-y-1 bg-lime-950/20">
                <span className="text-lime-400 block text-[9px] uppercase font-bold">Stage 4</span>
                <div className="font-bold text-white">70B Verify</div>
                <span className="text-[10px] text-lime-400 block font-bold">14.1ms</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 text-center space-y-1 hover:border-emerald-400/40 transition-colors">
                <span className="text-slate-400 block text-[9px] uppercase">Stage 5</span>
                <div className="font-bold text-emerald-300">Resample</div>
                <span className="text-[10px] text-slate-500 block">10.2ms</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Lossless verification guarantee across all 5 kernel checkpoints</span>
              <Link href="/sandbox" className="text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1">
                <span>Simulate Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* CARD 9: COHORT PERCENTILE BELL CURVE (Span 2 cols) */}
          <div className="md:col-span-2 bento-tile p-6 space-y-4 bg-gradient-to-br from-[#0c181f] via-[#09151c] to-[#040c12] border-lime-500/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-lime-400 block mb-0.5 font-bold">[SURFACE 07: COHORT DISTRIBUTION]</span>
                <h2 className="text-base font-bold text-white font-display">Candidate Gaussian Percentile Curve</h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-lime-400/20 text-lime-300 border border-lime-400/30 font-bold">
                TOP 4.2% GLOBAL
              </span>
            </div>

            <div className="relative py-2 flex flex-col items-center">
              <svg className="w-full h-24 overflow-visible" viewBox="0 0 400 90" fill="none">
                <path d="M 280 40 Q 320 70 380 82 L 380 85 L 280 85 Z" fill="rgba(132, 204, 22, 0.25)" />
                <path d="M 20 85 Q 120 83 170 30 T 230 30 Q 280 83 380 85" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" fill="none" />
                <line x1="200" y1="20" x2="200" y2="85" stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="3,3" />
                <text x="200" y="16" fill="rgba(255, 255, 255, 0.5)" fontSize="9" fontFamily="monospace" textAnchor="middle">μ = 71.4%</text>
                <line x1="310" y1="25" x2="310" y2="85" stroke="#a3e635" strokeWidth="2" />
                <circle cx="310" cy="55" r="4" fill="#a3e635" />
                <text x="310" y="18" fill="#a3e635" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">YOU (88.5%)</text>
                <line x1="10" y1="85" x2="390" y2="85" stroke="rgba(255, 255, 255, 0.15)" />
              </svg>
              <div className="w-full flex justify-between text-[10px] font-mono text-slate-500 px-2 mt-1">
                <span>-2σ (50%)</span>
                <span>Median (71%)</span>
                <span>+1σ (82%)</span>
                <span className="text-lime-400 font-bold">+2σ (92%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
              <span className="text-slate-400">Target Tier: <strong className="text-white">L5/L6 Staff AI Systems</strong></span>
              <Link href="/dashboard" className="text-lime-400 hover:text-lime-300 font-bold flex items-center gap-1">
                <span>View Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* PRECISION ASSESSMENT ENGINE SPECS (Preserves test assertions & provides cyber bento styling) */}
        <section
          aria-label="Design token check"
          className="bento-tile p-6 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-lime-400" />
                <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-white font-mono">
                  Precision Engine Specifications
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic sub-millisecond scoring, strict negative marking, and real-time synchronization.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-lime-400 bg-lime-400/10 px-2.5 py-1 rounded-full border border-lime-400/20 w-fit">
              Placement Standard
            </span>
          </div>

          <dl className="mt-5 grid gap-6 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-mono text-slate-400">
                Tabular countdown timer
              </dt>
              <dd className="tabular mt-1 text-3xl font-black text-white font-display">
                29:00
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-slate-400">
                Evaluation verification states
              </dt>
              <dd className="mt-2 flex gap-2 font-mono">
                <span className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-xs font-bold text-emerald-400">
                  Correct
                </span>
                <span className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-2.5 py-1 text-xs font-bold text-rose-400">
                  Incorrect
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-mono text-slate-400">
                Review palette marking
              </dt>
              <dd className="mt-2">
                <span className="inline-flex rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-amber-300 bg-amber-950/30 border border-amber-500/40 ring-2 ring-review">
                  Q7
                </span>
              </dd>
            </div>
          </dl>
        </section>
      </main>

      {/* Global Platform Footer */}
      <footer className="border-t border-white/10 bg-[#040711]/90 backdrop-blur-xl mt-16">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-bold text-white text-sm font-display flex items-center gap-1.5 justify-center md:justify-start">
              <span>⚡ Students-preparation</span>
              <span className="text-lime-400 text-xs font-mono font-normal">Cyber Bento</span>
            </p>
            <p className="font-mono text-[11px]">Autonomous Role-Based Preparation Platform for Engineering Career Tracks.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 font-mono text-xs">
            <Link href="/curriculum" className="hover:text-lime-400 transition-colors">
              Knowledge Hub
            </Link>
            <Link href="/roles" className="hover:text-lime-400 transition-colors">
              Career Roles
            </Link>
            <Link href="/courses" className="hover:text-lime-400 transition-colors">
              Courses
            </Link>
            <Link href="/practice" className="hover:text-lime-400 transition-colors">
              Practice
            </Link>
            <Link href="/mock-tests" className="hover:text-lime-400 transition-colors">
              Mock Tests
            </Link>
            <Link href="/interviews" className="hover:text-lime-400 transition-colors">
              Technical Interviews
            </Link>
            <Link href="/sandbox" className="hover:text-lime-400 transition-colors">
              AI Lab
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
