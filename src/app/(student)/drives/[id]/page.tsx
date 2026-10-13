'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Route } from 'next';
import { Button } from '../../../../components/ui/Button';
import {
  getDriveById,
  getUserDriveApplications,
  startDriveApplication,
  evaluateRoundSubmission,
  downloadOfferLetterPdf,
  type DriveApplication,
  type DriveRound,
} from '../../../../lib/drives-client';

export default function DriveRunnerPage() {
  const routeParams = useParams<{ id: string }>();
  const [driveId, setDriveId] = useState<string>(() => routeParams?.id || '');

  useEffect(() => {
    if (routeParams?.id) {
      setDriveId(routeParams.id);
    }
  }, [routeParams]);

  const drive = useMemo(() => getDriveById(driveId), [driveId]);
  const [application, setApplication] = useState<DriveApplication | null>(() => {
    if (!driveId) return null;
    const apps = getUserDriveApplications();
    return apps[driveId] || startDriveApplication(driveId);
  });
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [roundFeedback, setRoundFeedback] = useState<{
    score: number;
    passed: boolean;
    message: string;
  } | null>(null);
  const [candidateName, setCandidateName] = useState('Rahul Sharma');
  const [collegeName, setCollegeName] = useState('National Institute of Technology');

  // Synchronize application on driveId update
  useEffect(() => {
    if (driveId) {
      const apps = getUserDriveApplications();
      setApplication(apps[driveId] || startDriveApplication(driveId));
    }
  }, [driveId]);

  if (!drive) {
    return (
      <div className="min-h-screen bg-canvas py-16 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-neutral-900">Recruitment Drive Not Found</h2>
        <p className="text-sm text-neutral-600">The requested recruitment drive could not be located.</p>
        <Link href={'/drives' as Route}>
          <Button variant="primary" size="sm">
            Back to Placement Drives
          </Button>
        </Link>
      </div>
    );
  }

  const currentRoundIndex = application?.currentRoundIndex || 0;
  const currentRound: DriveRound = drive.rounds[currentRoundIndex] || drive.rounds[0];
  const isOfferExtended = application?.status === 'OFFER_EXTENDED';
  const isEliminated = application?.status === 'ELIMINATED';

  // Handle radio option select
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // Submit Round Evaluation
  const handleSubmitRound = () => {
    const result = evaluateRoundSubmission(
      drive.id,
      currentRound.roundNumber,
      selectedAnswers,
      candidateName,
      collegeName,
    );

    setApplication({ ...result.updatedApplication });
    setRoundFeedback({
      score: result.score,
      passed: result.passed,
      message: result.feedback,
    });
    setSelectedAnswers({});
  };

  // Replay Drive
  const handleReplayDrive = () => {
    const apps = getUserDriveApplications();
    delete apps[drive.id];
    const newApp = startDriveApplication(drive.id);
    setApplication(newApp);
    setSelectedAnswers({});
    setRoundFeedback(null);
  };

  return (
    <div className="min-h-screen bg-canvas text-text py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Breadcrumbs & Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <Link href={'/dashboard' as Route} className="hover:text-white transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <Link href={'/drives' as Route} className="hover:text-white transition-colors">
                Placement Drives
              </Link>
              <span>/</span>
              <span className="text-lime-300">{drive.title}</span>
            </div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight text-white">
              {drive.title}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              {drive.consortiumName} • {drive.roleTitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-lime-400 bg-lime-400/10 px-3 py-1.5 rounded-lg border border-lime-400/30">
              CTC: {drive.ctcFormatted}
            </span>
          </div>
        </div>

        {/* 4-Stage Stepper Bar */}
        <div className="bento-tile bg-[#0a0f1d]/85 rounded-2xl p-4 border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {drive.rounds.map((r, idx) => {
              const roundScore = application?.roundScores?.[r.roundNumber];
              const isCleared = roundScore !== undefined && roundScore >= r.cutoffPercentage;
              const isCurrent = currentRoundIndex === idx && !isOfferExtended && !isEliminated;

              return (
                <div
                  key={r.roundNumber}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    isCleared
                      ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                      : isCurrent
                      ? 'bg-lime-400/10 border-lime-400/40 text-lime-300 ring-1 ring-lime-400/30 shadow-[0_0_15px_rgba(163,230,53,0.1)]'
                      : 'bg-[#060b18]/60 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px]">Round {r.roundNumber}</span>
                    {isCleared && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
                        Cleared ({roundScore}%)
                      </span>
                    )}
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-lime-400/20 text-lime-300 border border-lime-400/40">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-white block mt-1 line-clamp-1">{r.title}</span>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    Cutoff: &ge; {r.cutoffPercentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Offer Unlocked Celebration Screen */}
        {isOfferExtended && application?.offerDetails && (
          <div className="space-y-6">
            <div className="bg-[#0a0f1d]/85 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_30px_rgba(16,185,129,0.15)] space-y-4">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">
                🎓
              </div>
              <h2 className="text-2xl font-display font-black text-white">
                Official Campus Placement Offer Extended!
              </h2>
              <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Congratulations, <strong className="text-white font-bold">{application.offerDetails.candidateName}</strong>! You have successfully cleared all 4 rigorous evaluation rounds for <strong className="text-white font-bold">{drive.title}</strong>.
              </p>

              {/* Offer Summary Card */}
              <div className="bg-[#060b18] rounded-xl border border-emerald-500/30 p-6 max-w-2xl mx-auto text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Organization</span>
                    <span className="font-extrabold text-sm text-white">{application.offerDetails.consortiumName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Offer Code</span>
                    <code className="text-xs font-mono font-bold text-lime-400 select-all">{application.offerDetails.offerCode}</code>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block">Offered Role</span>
                    <strong className="text-white block mt-0.5 font-sans">{application.offerDetails.roleTitle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Annual CTC</span>
                    <strong className="text-emerald-400 font-black block mt-0.5">{application.offerDetails.ctcAnnual}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Base Salary</span>
                    <strong className="text-white block mt-0.5">{application.offerDetails.baseSalary}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Joining Date</span>
                    <strong className="text-white block mt-0.5">{application.offerDetails.joiningDate}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-1 text-[11px] text-slate-300">
                  <span className="font-mono font-bold text-slate-200 block">Key Employment Stipulations:</span>
                  {application.offerDetails.terms.map((term, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  aria-label="Download Official Offer Letter (PDF)"
                  onClick={() => downloadOfferLetterPdf(application.offerDetails!)}
                  className="flex items-center gap-1.5 font-bold font-mono text-xs bg-emerald-500 hover:bg-emerald-400 text-black border-0 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Official Offer Letter (PDF)
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleReplayDrive}
                  className="font-semibold font-mono text-xs border-white/10 text-slate-300 hover:text-white"
                >
                  Replay Drive Simulation
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Elimination / Hurdle Not Met Screen */}
        {isEliminated && (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-6 sm:p-8 text-center space-y-4">
            <h3 className="text-lg font-display font-bold text-rose-300">
              Round Cutoff Hurdle Not Satisfied
            </h3>
            <p className="text-xs text-rose-200/80 max-w-lg mx-auto leading-relaxed">
              {roundFeedback?.message || 'You scored below the required round cutoff threshold. Review foundational competencies and retry the drive.'}
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="secondary" size="sm" onClick={handleReplayDrive} className="font-mono text-xs border-white/10 text-slate-200">
                Retry Drive Simulation
              </Button>
              <Link href={'/readiness' as Route}>
                <Button variant="primary" size="sm" className="font-mono text-xs bg-lime-400 hover:bg-lime-300 text-black border-0">
                  Visit Readiness Profiler &rarr;
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Active Round Questionnaire */}
        {!isOfferExtended && !isEliminated && (
          <div className="space-y-6">
            <div className="bento-tile bg-[#0a0f1d]/85 rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-lime-400">
                      Round {currentRound.roundNumber} of {drive.rounds.length}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white/5 text-slate-300 border border-white/10">
                      {currentRound.roundType}
                    </span>
                  </div>
                  <h2 className="text-lg font-display font-bold text-white mt-1">
                    {currentRound.title}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-200 block">
                    Cutoff: &ge; {currentRound.cutoffPercentage}%
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Duration: {currentRound.durationMinutes} mins
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-[#060b18] border border-white/10 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white font-semibold">Instructions:</strong> {currentRound.instructions}
                </div>

                {/* Question List */}
                <div className="space-y-6">
                  {currentRound.questions.map((q, qIdx) => (
                    <div key={q.id} className="border border-white/10 rounded-xl p-5 bg-[#060b18]/70 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-white leading-relaxed">
                          Question {qIdx + 1}: {q.prompt}
                        </span>
                        <span className="text-[10px] font-mono font-semibold bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-md shrink-0">
                          {q.points} pts
                        </span>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[q.id] === optIdx;
                          return (
                            <label
                              key={optIdx}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-lime-400/60 bg-lime-400/10 text-white font-medium ring-1 ring-lime-400/30'
                                  : 'border-white/10 bg-[#060b18] hover:border-white/20 text-slate-300'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question-${q.id}`}
                                checked={isSelected}
                                onChange={() => handleSelectOption(q.id, optIdx)}
                                className="mt-0.5 text-lime-400 focus:ring-lime-400 accent-lime-400"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Candidate Information Inputs for Offer Letter */}
                {currentRoundIndex === drive.rounds.length - 1 && (
                  <div className="bg-[#060b18] border border-white/10 rounded-xl p-5 space-y-3 text-xs">
                    <span className="font-mono font-bold text-white block">
                      Candidate Details for Placement Offer Issuance:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-mono text-slate-300 block mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          aria-label="Candidate Legal Name"
                          className="w-full border border-white/10 rounded-xl px-3 py-2 bg-[#0a0f1d] text-white text-xs font-mono focus:ring-1 focus:ring-lime-400 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-slate-300 block mb-1">Institution / College</label>
                        <input
                          type="text"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          aria-label="Candidate College Name"
                          className="w-full border border-white/10 rounded-xl px-3 py-2 bg-[#0a0f1d] text-white text-xs font-mono focus:ring-1 focus:ring-lime-400 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs font-mono text-slate-400">
                    Questions Answered: {Object.keys(selectedAnswers).length} / {currentRound.questions.length}
                  </span>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitRound}
                    disabled={Object.keys(selectedAnswers).length < currentRound.questions.length}
                    className="font-mono font-bold text-xs bg-lime-400 hover:bg-lime-300 disabled:opacity-40 disabled:hover:bg-lime-400 text-black border-0 shadow-sm"
                  >
                    Submit Round {currentRound.roundNumber} Evaluation &rarr;
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
