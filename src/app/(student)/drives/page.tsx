'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { Button } from '../../../components/ui/Button';
import {
  getDrivesCatalog,
  getUserDriveApplications,
  type PlacementDrive,
  type DriveApplication,
} from '../../../lib/drives-client';

export default function DrivesHubPage() {
  const [drives] = useState<PlacementDrive[]>(getDrivesCatalog());
  const [applications, setApplications] = useState<Record<string, DriveApplication>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OFFER' | 'IN_PROGRESS' | 'NOT_STARTED'>('ALL');

  useEffect(() => {
    setApplications(getUserDriveApplications());
  }, []);

  // Filtered drives
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.consortiumName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const app = applications[d.id];
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'OFFER' && app?.status === 'OFFER_EXTENDED') ||
        (statusFilter === 'IN_PROGRESS' && app?.status === 'IN_PROGRESS') ||
        (statusFilter === 'NOT_STARTED' && (!app || app?.status === 'NOT_STARTED'));

      return matchesSearch && matchesStatus;
    });
  }, [drives, applications, searchQuery, statusFilter]);

  // KPI Metrics
  const totalOffers = Object.values(applications).filter((a) => a.status === 'OFFER_EXTENDED').length;
  const inProgressCount = Object.values(applications).filter((a) => a.status === 'IN_PROGRESS').length;

  return (
    <div className="min-h-screen bg-canvas text-text py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Breadcrumbs & Description */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Link href={'/dashboard' as Route} className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-lime-300">Placement Drives</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold tracking-tight text-white">
              Campus Placement Drives & Virtual Hiring Simulator
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Participate in simulated enterprise multi-tier campus drives, clear progressive cutoff hurdles, and secure verifiable placement offers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href={'/readiness' as Route}>
              <Button variant="secondary" size="sm" className="font-mono text-xs border-white/10 hover:border-lime-400/40 text-slate-200">
                Check Readiness Profiler &rarr;
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bento-tile p-5 bg-[#0a0f1d]/85 border border-white/10 rounded-2xl">
            <span className="text-xs font-mono font-semibold text-slate-400 block uppercase">
              Recruitment Drives
            </span>
            <span className="text-2xl font-display font-black text-white mt-1 block">
              {drives.length} Consortium Drives
            </span>
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">
              Tier-1 engineering profiles
            </span>
          </div>

          <div className="bento-tile p-5 bg-[#0a0f1d]/85 border border-white/10 rounded-2xl">
            <span className="text-xs font-mono font-semibold text-slate-400 block uppercase">
              In-Progress Drives
            </span>
            <span className="text-2xl font-display font-black text-lime-400 mt-1 block">
              {inProgressCount} Active
            </span>
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">
              Rounds underway
            </span>
          </div>

          <div className="bento-tile p-5 bg-[#0a0f1d]/85 border border-white/10 rounded-2xl">
            <span className="text-xs font-mono font-semibold text-slate-400 block uppercase">
              Offers Secured
            </span>
            <span className="text-2xl font-display font-black text-emerald-400 mt-1 block">
              {totalOffers} Offer{totalOffers !== 1 ? 's' : ''}
            </span>
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">
              Verifiable credentials issued
            </span>
          </div>

          <div className="bento-tile p-5 bg-[#0a0f1d]/85 border border-white/10 rounded-2xl">
            <span className="text-xs font-mono font-semibold text-slate-400 block uppercase">
              Average CTC Package
            </span>
            <span className="text-2xl font-display font-black text-cyan-400 mt-1 block">
              ₹23.0 LPA
            </span>
            <span className="text-[11px] font-mono text-slate-400 mt-1 block">
              Base + Performance + ESOPs
            </span>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0a0f1d]/85 p-4 rounded-2xl border border-white/10">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search drives, companies, or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search Recruitment Drives"
              className="w-full border border-white/10 rounded-xl px-3 py-2 text-xs bg-[#060b18] text-white placeholder:text-slate-500 focus:ring-1 focus:ring-lime-400 focus:outline-hidden font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label htmlFor="status-filter" className="text-xs font-mono font-bold text-slate-300 whitespace-nowrap">
              Filter Status:
            </label>
            <select
              id="status-filter"
              aria-label="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'OFFER' | 'IN_PROGRESS' | 'NOT_STARTED')}
              className="text-xs font-mono font-semibold border border-white/10 rounded-xl px-3 py-2 bg-[#060b18] text-white focus:ring-1 focus:ring-lime-400 focus:outline-hidden"
            >
              <option value="ALL">All Drives ({drives.length})</option>
              <option value="OFFER">Offers Secured ({totalOffers})</option>
              <option value="IN_PROGRESS">In Progress ({inProgressCount})</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>
          </div>
        </div>

        {/* Drives Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrives.map((drive) => {
            const app = applications[drive.id];
            const isOffer = app?.status === 'OFFER_EXTENDED';
            const isInProgress = app?.status === 'IN_PROGRESS';
            const isEliminated = app?.status === 'ELIMINATED';

            return (
              <div
                key={drive.id}
                className={`bento-tile flex flex-col justify-between transition-all duration-200 border rounded-2xl p-6 bg-[#0a0f1d]/85 backdrop-blur-md ${
                  isOffer
                    ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                    : isInProgress
                    ? 'border-lime-400/40 shadow-[0_0_20px_rgba(163,230,53,0.1)]'
                    : isEliminated
                    ? 'border-rose-500/30'
                    : 'border-white/10 hover:border-lime-400/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      {drive.consortiumName}
                    </span>
                    {isOffer ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
                        Offer Extended
                      </span>
                    ) : isInProgress ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-lime-400/10 text-lime-300 border border-lime-400/30">
                        Round {(app?.currentRoundIndex || 0) + 1} Active
                      </span>
                    ) : isEliminated ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-400/10 text-rose-300 border border-rose-400/30">
                        Hurdle Not Met
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-slate-400 border border-white/10">
                        Eligible
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-display font-bold mt-2 text-white leading-snug">
                    {drive.title}
                  </h3>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-md border border-lime-400/30">
                      {drive.ctcFormatted}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-medium">
                      Min GPA: {drive.minGpa}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 mt-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {drive.description}
                  </p>

                  {/* 4-Stage Stepper Preview */}
                  <div className="space-y-1.5 pt-3 border-t border-white/10">
                    <span className="text-[11px] font-mono font-semibold text-slate-300 block">
                      Hiring Stages (4 Rounds):
                    </span>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {drive.rounds.map((round) => {
                        const roundScore = app?.roundScores?.[round.roundNumber];
                        const isCleared = roundScore !== undefined && roundScore >= round.cutoffPercentage;
                        const isFailed = roundScore !== undefined && roundScore < round.cutoffPercentage;

                        return (
                          <div
                            key={round.roundNumber}
                            className={`p-1.5 rounded-lg border text-[10px] font-mono font-semibold ${
                              isCleared
                                ? 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300'
                                : isFailed
                                ? 'bg-rose-400/15 border-rose-400/30 text-rose-300'
                                : 'bg-white/[0.04] border-white/10 text-slate-400'
                            }`}
                            title={`${round.title} (Cutoff: ${round.cutoffPercentage}%)`}
                          >
                            R{round.roundNumber} ({round.cutoffPercentage}%)
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-2">
                    <Link
                      href={`/drives/${drive.id}` as Route}
                      className="w-full block"
                    >
                      <Button
                        variant={isOffer ? 'primary' : isInProgress ? 'primary' : 'secondary'}
                        size="sm"
                        className={`w-full font-bold text-xs ${
                          isOffer
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black border-0'
                            : isInProgress
                            ? 'bg-lime-400 hover:bg-lime-300 text-black border-0'
                            : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                        }`}
                      >
                        {isOffer
                          ? 'View Offer Letter & PDF →'
                          : isInProgress
                          ? `Resume Round ${(app?.currentRoundIndex || 0) + 1} →`
                          : isEliminated
                          ? 'Review & Retry Drive →'
                          : 'Enter Recruitment Drive →'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
