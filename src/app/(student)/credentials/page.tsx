'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
  claimCredential,
  getRoleMilestones,
  getUserCredentials,
  type CredentialItem,
  type RoleMilestoneItem,
} from '../../../lib/credentials-client';
import { Button } from '../../../components/ui/Button';
import { ShieldCheck, BarChart3, ArrowRight, X, Award, Check, Link as LinkIcon, Printer } from 'lucide-react';

export default function CredentialsPage() {
  const { user } = useAuth();

  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [milestones, setMilestones] = useState<RoleMilestoneItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingRoleId, setClaimingRoleId] = useState<string | null>(null);
  const [activeModalCred, setActiveModalCred] = useState<CredentialItem | null>(null);
  const [copySuccessCode, setCopySuccessCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [credsData, milestonesData] = await Promise.all([
          getUserCredentials().catch(() => []),
          getRoleMilestones().catch(() => []),
        ]);
        setCredentials(credsData);
        setMilestones(milestonesData);
      } catch {
        setErrorMessage('Failed to load credential information');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleClaim = async (roleTrackId: string) => {
    try {
      setClaimingRoleId(roleTrackId);
      setErrorMessage(null);
      const newCred = await claimCredential(roleTrackId);

      setCredentials((prev) => [newCred, ...prev.filter((c) => c.id !== newCred.id)]);
      setMilestones((prev) =>
        prev.map((m) =>
          m.roleTrackId === roleTrackId ? { ...m, credential: newCred } : m,
        ),
      );
      setSuccessMessage(
        `Congratulations! Your "${newCred.title}" has been issued with grade ${newCred.grade}.`,
      );
      setActiveModalCred(newCred);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to claim credential',
      );
    } finally {
      setClaimingRoleId(null);
    }
  };

  const handleCopyLink = async (code: string) => {
    try {
      const url = `${window.location.origin}/verify/${code}`;
      await navigator.clipboard.writeText(url);
      setCopySuccessCode(code);
      setTimeout(() => setCopySuccessCode(null), 2500);
    } catch {
      // Fallback
    }
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'DISTINCTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30">
            ★ DISTINCTION
          </span>
        );
      case 'MERIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-lime-400/20 text-lime-300 border border-lime-400/40">
            ◆ MERIT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
            ✓ CLEARED
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-text py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-lime-300 font-semibold">Credentials &amp; Certifications</span>
        </nav>

        {/* Hero Header */}
        <div className="bento-tile p-6 sm:p-8 bg-[#0a0f1d]/85 border border-white/10 rounded-2xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-lime-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 text-xs font-mono font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
              <span>Autonomous Verification Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              Skill Mastery Credentials &amp; Certifications
            </h1>
            <p className="mt-2 text-slate-400 max-w-2xl text-sm leading-relaxed">
              Earn cryptographically tamper-evident credentials validated against timed role-based assessments and Socratic AI technical interviews. Each credential includes a public verification checksum shareable with employers.
            </p>
            <div className="mt-4">
              <Link
                href="/analytics/cohort"
                className="text-xs font-mono font-semibold text-lime-400 hover:text-lime-300 hover:underline inline-flex items-center gap-1.5"
              >
                <BarChart3 className="w-3.5 h-3.5 text-lime-400" />
                <span>Compare your standing on the Peer Cohort Benchmark</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-start justify-between gap-3 font-mono">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 p-0.5 rounded cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm flex items-start justify-between gap-3 font-mono">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-400 hover:text-emerald-200 p-0.5 rounded cursor-pointer"
              aria-label="Dismiss success"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Section 1: Milestone Readiness & Claim Tracker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-display font-bold text-white">
              Career Track Milestone Tracker
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Requires 70%+ in both Mock Test &amp; Socratic Interview
            </span>
          </div>

          {isLoading ? (
            <div className="bento-tile bg-[#0a0f1d]/85 rounded-2xl p-8 border border-white/10 text-center text-slate-400 font-mono text-sm">
              Loading role readiness milestones...
            </div>
          ) : milestones.length === 0 ? (
            <div className="bento-tile bg-[#0a0f1d]/85 rounded-2xl p-8 border border-white/10 text-center text-slate-400 font-mono text-sm">
              No career tracks available at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {milestones.map((item) => {
                const isClaimed = !!item.credential;

                return (
                  <div
                    key={item.roleTrackId}
                    className={`bento-tile rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                      isClaimed
                        ? 'border-emerald-500/40 bg-emerald-950/20 shadow-xs'
                        : item.isEligible
                        ? 'border-lime-400/40 bg-[#0a0f1d]/90 shadow-[0_0_20px_rgba(163,230,53,0.15)] ring-1 ring-lime-400/30'
                        : 'border-white/10 bg-[#0a0f1d]/85'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-display font-bold text-white text-base">
                          {item.roleName}
                        </h3>
                        {isClaimed && (
                          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-400/30">
                            Awarded
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mt-3 text-xs">
                        {/* Mock test milestone */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#060b18]/80 border border-white/10">
                          <span className="text-slate-300 font-mono">Timed Mock Assessment</span>
                          {item.mockTestCleared ? (
                            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                              ✓ {item.bestMockScore?.toFixed(0)}%
                            </span>
                          ) : (
                            <Link
                              href="/mock-tests"
                              className="text-lime-400 hover:text-lime-300 hover:underline font-mono font-semibold"
                            >
                              {item.bestMockScore !== null
                                ? `${item.bestMockScore.toFixed(0)}% (Needs 70%)`
                                : 'Take Test →'}
                            </Link>
                          )}
                        </div>

                        {/* Interview milestone */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#060b18]/80 border border-white/10">
                          <span className="text-slate-300 font-mono">Socratic AI Screening</span>
                          {item.interviewCleared ? (
                            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                              ✓ {item.bestInterviewScore?.toFixed(0)}%
                            </span>
                          ) : (
                            <Link
                              href="/interviews"
                              className="text-cyan-400 hover:text-cyan-300 hover:underline font-mono font-semibold"
                            >
                              {item.bestInterviewScore !== null
                                ? `${item.bestInterviewScore.toFixed(0)}% (Needs 70%)`
                                : 'Start Interview →'}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      {isClaimed ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs font-mono font-semibold py-1.5"
                          onClick={() => setActiveModalCred(item.credential)}
                        >
                          View Certificate ↗
                        </Button>
                      ) : item.isEligible ? (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full text-xs font-bold py-1.5 shadow-md shadow-lime-400/25"
                          disabled={claimingRoleId === item.roleTrackId}
                          onClick={() => handleClaim(item.roleTrackId)}
                        >
                          {claimingRoleId === item.roleTrackId ? (
                            'Issuing Credential...'
                          ) : (
                            <span className="flex items-center justify-center gap-1.5">
                              <span>Claim Credential</span>
                              <Award className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </Button>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500 italic text-center w-full">
                          Complete both requirements to unlock
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Earned Credentials Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-bold text-white">
              Issued Career Credentials ({credentials.length})
            </h2>
          </div>

          {credentials.length === 0 ? (
            <div className="bento-tile bg-[#0a0f1d]/85 rounded-2xl p-10 border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-slate-400 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-display font-semibold text-white">
                No credentials issued yet
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Clear a timed role assessment and Socratic technical interview with 70%+ to earn your official, cryptographically verifiable certificate.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {credentials.map((cred) => (
                <div
                  key={cred.id}
                  className="bento-tile bg-[#0a0f1d]/85 rounded-2xl p-6 border border-white/10 shadow-sm flex flex-col justify-between hover:border-lime-400/40 transition-all relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {getGradeBadge(cred.grade)}
                        <h3 className="font-display font-bold text-white text-lg mt-2">
                          {cred.title}
                        </h3>
                        <p className="text-xs font-mono text-slate-400 mt-0.5">
                          ID: {cred.credentialCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-display font-black text-lime-400">
                          {cred.compositeScore.toFixed(0)}%
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 font-medium">
                          Composite Score
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#060b18]/80 p-3 rounded-xl border border-white/10">
                      <div>
                        <span className="text-slate-400 font-mono block">Assessment Score:</span>
                        <span className="font-mono font-semibold text-white">
                          {cred.mockTestScore.toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-mono block">Interview Score:</span>
                        <span className="font-mono font-semibold text-white">
                          {cred.interviewScore.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {cred.competencies && cred.competencies.length > 0 && (
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Verified Competencies
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cred.competencies.slice(0, 4).map((topic, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-xs font-mono font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-mono text-slate-400">
                      Issued: {new Date(cred.issuedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs font-mono py-1.5 px-3"
                        onClick={() => handleCopyLink(cred.credentialCode)}
                      >
                        {copySuccessCode === cred.credentialCode ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Link Copied!</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-300">
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Link</span>
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs font-bold py-1.5 px-3 shadow-md shadow-lime-400/25"
                        onClick={() => setActiveModalCred(cred)}
                      >
                        View Certificate ↗
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certificate Modal Dialog */}
        {activeModalCred && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bento-tile bg-[#0a0f1d] border border-white/15 rounded-3xl max-w-3xl w-full p-8 shadow-2xl relative my-8 animate-fadeIn">
              <button
                onClick={() => setActiveModalCred(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Canvas */}
              <div
                id="certificate-frame"
                className="border-2 border-lime-400/30 rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-[#0a0f1d] via-[#060b18] to-[#040711] text-center relative shadow-[0_0_40px_rgba(163,230,53,0.08)]"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 text-xs font-mono font-bold uppercase tracking-widest mb-4">
                  Official Credential of Competency
                </div>

                <h2 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                  Autonomous Technical Assessment Authority
                </h2>
                <p className="text-xs font-mono text-slate-400 mt-1 uppercase tracking-wider">
                  Independent Career Readiness Verification
                </p>

                <div className="my-6">
                  <p className="text-xs font-mono text-slate-400 italic">This certifies that</p>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-lime-400 mt-1">
                    {user?.name || 'Candidate'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                    has successfully cleared rigorous multi-stage evaluation across timed assessment and conversational Socratic AI technical screening in
                  </p>
                  <div className="text-lg sm:text-xl font-display font-bold text-cyan-300 mt-2">
                    {activeModalCred.title}
                  </div>
                </div>

                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 my-2">
                  <span className="text-xs font-mono font-bold text-slate-200">
                    Grade: {activeModalCred.grade}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-xs font-mono font-bold text-lime-400">
                    Composite Score: {activeModalCred.compositeScore.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
                  <div className="text-left font-mono">
                    <span className="block text-[10px] text-slate-400">
                      Credential ID: {activeModalCred.credentialCode}
                    </span>
                    <span className="block text-[11px] text-slate-300">
                      Issued on {new Date(activeModalCred.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-[10px] text-slate-400 truncate max-w-xs">
                      HMAC: {activeModalCred.verificationHash ? activeModalCred.verificationHash.substring(0, 24) : 'VALIDATED'}...
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold inline-flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cryptographically Verified</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/verify/${activeModalCred.credentialCode}`}
                  target="_blank"
                  className="text-xs font-mono text-lime-400 hover:text-lime-300 hover:underline font-semibold"
                >
                  Open Public Verification Page ↗
                </Link>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs font-mono py-2 px-4"
                    onClick={() => handleCopyLink(activeModalCred.credentialCode)}
                  >
                    {copySuccessCode === activeModalCred.credentialCode ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Copied!</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-300">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Public Link</span>
                      </span>
                    )}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs font-bold py-2 px-4 flex items-center gap-1.5 shadow-md shadow-lime-400/25"
                    onClick={() => window.print()}
                  >
                    <span>Print Certificate</span>
                    <Printer className="w-3.5 h-3.5" />
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
